import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { DocumentType } from '@typegoose/typegoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<DocumentType<Order>>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<DocumentType<Order>> {
    // Validate order data
    await this.validateOrderData(createOrderDto);
    
    // Check product availability (placeholder for product service integration)
    await this.checkProductAvailability(createOrderDto.productIds);
    
    // Calculate total price if not provided
    const totalPrice = createOrderDto.totalPrice || await this.calculateTotalPrice(createOrderDto.productIds);
    
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      userId,
      totalPrice,
      status: OrderStatus.PENDING,
    });
    
    const savedOrder = await createdOrder.save();

    // Publish order created event
    await this.rabbitMQService.publish('order.created', {
      orderId: savedOrder._id?.toString?.() ?? savedOrder.id,
      userId: savedOrder.userId,
      productIds: savedOrder.productIds,
      totalPrice: savedOrder.totalPrice,
    });

    return savedOrder;
  }

  async findAll(userId: string): Promise<DocumentType<Order>[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<DocumentType<Order>> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this order');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId: string): Promise<DocumentType<Order>> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this order');
    }

    // Validate status transition
    if (updateOrderDto.status) {
      const newStatus = Object.values(OrderStatus).includes(updateOrderDto.status as OrderStatus)
        ? updateOrderDto.status as OrderStatus
        : undefined;
      if (!newStatus) {
        throw new BadRequestException(`Invalid order status: ${updateOrderDto.status}`);
      }
      this.validateStatusTransition(order.status, newStatus);
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    // Publish order updated event
    await this.rabbitMQService.publish('order.updated', {
      orderId: updatedOrder._id?.toString?.() ?? updatedOrder.id,
      userId: updatedOrder.userId,
      status: updatedOrder.status,
    });

    return updatedOrder;
  }

  async remove(id: string, userId: string): Promise<void> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this order');
    }

    // Only allow cancellation of pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    await this.orderModel.deleteOne({ _id: id }).exec();

    // Publish order deleted event
    await this.rabbitMQService.publish('order.deleted', {
      orderId: id,
      userId: order.userId,
    });
  }

  // Advanced order management methods
  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string): Promise<DocumentType<Order>> {
    const order = await this.findOne(orderId, userId);
    this.validateStatusTransition(order.status, status);
    
    return this.update(orderId, { status }, userId);
  }

  async getOrdersByStatus(status: OrderStatus, userId: string): Promise<DocumentType<Order>[]> {
    return this.orderModel.find({ userId, status }).sort({ createdAt: -1 }).exec();
  }

  async getOrderStatistics(userId: string): Promise<any> {
    const orders = await this.findAll(userId);
    
    const stats = {
      total: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      byStatus: {} as Record<string, number>,
    };

    orders.forEach(order => {
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
    });

    return stats;
  }

  // Validation methods
  private async validateOrderData(createOrderDto: CreateOrderDto): Promise<void> {
    if (!createOrderDto.productIds || createOrderDto.productIds.length === 0) {
      throw new BadRequestException('Order must contain at least one product');
    }

    if (createOrderDto.totalPrice && createOrderDto.totalPrice <= 0) {
      throw new BadRequestException('Total price must be greater than 0');
    }
  }

  private async checkProductAvailability(productIds: string[]): Promise<void> {
    // Placeholder for product service integration
    // In a real implementation, this would call the product service
    // to check if products exist and are in stock
    console.log(`Checking availability for products: ${productIds.join(', ')}`);
  }

  private async calculateTotalPrice(productIds: string[]): Promise<number> {
    // Placeholder for product service integration
    // In a real implementation, this would call the product service
    // to get product prices and calculate the total
    console.log(`Calculating total price for products: ${productIds.join(', ')}`);
    return 0; // Placeholder return
  }

  private validateStatusTransition(currentStatus: string, newStatus: OrderStatus): void {
    const validTransitions: Record<string, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
} 