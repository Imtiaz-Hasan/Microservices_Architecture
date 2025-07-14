import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly inventoryService: InventoryService,
  ) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      if (!url) throw new Error('RABBITMQ_URL is not defined');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ');

      // Set up consumers for inventory actions
      await this.channel.assertExchange('inventory_service', 'topic', { durable: true });
      const { queue } = await this.channel.assertQueue('inventory_service_queue', { durable: false });
      await this.channel.bindQueue(queue, 'inventory_service', 'inventory.*');

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          const routingKey = msg.fields.routingKey;
          const content = JSON.parse(msg.content.toString());
          let result: any = null;
          try {
            if (routingKey === 'inventory.check-stock') {
              result = await this.inventoryService.checkStock(content.productId, content.quantity);
            } else if (routingKey === 'inventory.reserve-stock') {
              result = await this.inventoryService.reserveStock(content.productId, content.quantity);
            } else if (routingKey === 'inventory.release-stock') {
              await this.inventoryService.releaseStock(content.productId, content.quantity);
              result = { released: true };
            }
            if (msg.properties.replyTo) {
              this.channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId },
              );
            }
            this.channel.ack(msg);
          } catch (err) {
            this.logger.error('Error processing inventory message:', err);
            this.channel.ack(msg);
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error during RabbitMQ disconnection:', error);
    }
  }

  async publish(routingKey: string, message: any) {
    try {
      const exchange = 'inventory_service';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
      );
      this.logger.log(`Published message to "${routingKey}"`);
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
      throw error;
    }
  }
} 