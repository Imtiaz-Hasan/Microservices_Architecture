import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductModel } from './schemas/product.schema';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductModel.schema }]),
    RabbitMQModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {} 