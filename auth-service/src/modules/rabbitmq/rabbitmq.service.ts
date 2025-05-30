import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      if (!url) {
        throw new Error('RABBITMQ_URL is not defined in config');
      }

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      this.logger.log('✅ Connected to RabbitMQ');
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
