import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let rabbitMQService: any;

  beforeEach(async () => {
    productModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ name: 'Test', userId: 'user1' }),
    }));
    productModel.create = jest.fn();
    productModel.findById = jest.fn();
    productModel.findByIdAndUpdate = jest.fn();
    productModel.find = jest.fn();
    productModel.deleteOne = jest.fn();
    rabbitMQService = { publish: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: RabbitMQService, useValue: rabbitMQService },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const result = await service.create({ name: 'Test', description: 'desc', price: 1 }, 'user1');
    expect(result.name).toBe('Test');
  });

  it('should not allow unauthorized update', async () => {
    productModel.findById.mockResolvedValue({ userId: 'user1' });
    await expect(service.update('id', { name: 'New' }, 'user2')).rejects.toThrow();
  });
}); 