import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      if (!url) {
        throw new Error('RABBITMQ_URL is not defined in config');
      }

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      this.logger.log('✅ Connected to RabbitMQ');

      // --- Add consumer for auth.validate-token ---
      await this.channel.assertExchange('auth_service', 'topic', { durable: true });
      const { queue } = await this.channel.assertQueue('auth_service_queue', { durable: false });
      await this.channel.bindQueue(queue, 'auth_service', 'auth.validate-token');

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const { token } = JSON.parse(msg.content.toString());
            const result = await this.authService.validateToken(token);
            this.channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(result)),
              { correlationId: msg.properties.correlationId }
            );
            this.channel.ack(msg);
          } catch (err) {
            this.logger.error('Error processing token validation:', err);
            this.channel.ack(msg);
          }
        }
      });
      // --- End consumer ---
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('📴 Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('⚠️ Error during RabbitMQ disconnection:', error);
    }
  }

  async publish(routingKey: string, message: any) {
    try {
      const exchange = 'auth_service';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
      );

      this.logger.log(`📤 Published message to "${routingKey}"`);
    } catch (error) {
      this.logger.error('❌ Failed to publish message:', error);
      throw error;
    }
  }
}
