import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { DocumentType } from '@typegoose/typegoose';

@Injectable()
export class OrdersSeedService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<DocumentType<Order>>,
  ) {}

  async seed() {
    const sampleOrders = [
      {
        productIds: ['product1', 'product2'],
        userId: 'user1',
        status: 'pending',
        totalPrice: 150.00,
      },
      {
        productIds: ['product3'],
        userId: 'user1',
        status: 'completed',
        totalPrice: 75.50,
      },
      {
        productIds: ['product1', 'product4', 'product5'],
        userId: 'user2',
        status: 'processing',
        totalPrice: 225.75,
      },
      {
        productIds: ['product2'],
        userId: 'user2',
        status: 'cancelled',
        totalPrice: 45.00,
      },
      {
        productIds: ['product6', 'product7'],
        userId: 'user3',
        status: 'shipped',
        totalPrice: 120.25,
      },
    ];

    try {
      // Clear existing orders
      await this.orderModel.deleteMany({});
      
      // Insert sample orders
      const createdOrders = await this.orderModel.insertMany(sampleOrders);
      
      console.log(`✅ Seeded ${createdOrders.length} orders`);
      return createdOrders;
    } catch (error) {
      console.error('❌ Error seeding orders:', error);
      throw error;
    }
  }

  async getSampleOrders() {
    return [
      {
        productIds: ['product1', 'product2'],
        userId: 'user1',
        status: 'pending',
        totalPrice: 150.00,
      },
      {
        productIds: ['product3'],
        userId: 'user1',
        status: 'completed',
        totalPrice: 75.50,
      },
      {
        productIds: ['product1', 'product4', 'product5'],
        userId: 'user2',
        status: 'processing',
        totalPrice: 225.75,
      },
    ];
  }
} 