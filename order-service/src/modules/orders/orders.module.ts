import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderModel } from './schemas/order.schema';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderModel.schema }]),
    RabbitMQModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {} 