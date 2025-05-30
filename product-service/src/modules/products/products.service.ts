import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { DocumentType } from '@typegoose/typegoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<DocumentType<Product>>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<DocumentType<Product>> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      userId,
    });
    const savedProduct = await createdProduct.save();

    // Publish product created event
    await this.rabbitMQService.publish('product.created', {
      productId: savedProduct._id?.toString?.() ?? savedProduct.id,
      userId: savedProduct.userId,
    });

    return savedProduct;
  }

  async findAll(userId: string): Promise<DocumentType<Product>[]> {
    return this.productModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<DocumentType<Product>> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (product.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this product');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<DocumentType<Product>> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (product.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this product');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    // Publish product updated event
    await this.rabbitMQService.publish('product.updated', {
      productId: updatedProduct._id?.toString?.() ?? updatedProduct.id,
      userId: updatedProduct.userId,
    });

    return updatedProduct;
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (product.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    await this.productModel.deleteOne({ _id: id }).exec();

    // Publish product deleted event
    await this.rabbitMQService.publish('product.deleted', {
      productId: id,
      userId: product.userId,
    });
  }
} 