import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.connection = await amqp.connect(
        this.configService.get<string>('RABBITMQ_URL'),
      );
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  async publish(routingKey: string, message: any) {
    try {
      const exchange = 'product_service';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
      );
      this.logger.log(`Published message to ${routingKey}`);
    } catch (error) {
      this.logger.error('Error publishing message:', error);
      throw error;
    }
  }

  async rpcValidateToken(token: string): Promise<any> {
    // Send a message to the auth-service queue and wait for a response
    const exchange = 'auth_service';
    const routingKey = 'auth.validate-token';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const { queue } = await this.channel.assertQueue('', { exclusive: true });

    const correlationId = Math.random().toString() + Date.now();
    const message = { token };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Auth service did not respond in time'));
      }, 5000); // 5 seconds timeout

      this.channel.consume(
        queue,
        (msg) => {
          if (msg && msg.properties.correlationId === correlationId) {
            clearTimeout(timeout);
            const content = JSON.parse(msg.content.toString());
            resolve(content);
            this.channel.cancel(msg.fields.consumerTag);
          }
        },
        { noAck: true },
      );

      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          correlationId,
          replyTo: queue,
        },
      );
    });
  }
} 