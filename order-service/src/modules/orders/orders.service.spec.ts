import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Order } from './schemas/order.schema';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;
  let mockRabbitMQService: any;

  beforeEach(async () => {
    mockOrderModel = {
      new: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockRabbitMQService = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and publish event', async () => {
      const createOrderDto = {
        productIds: ['product1', 'product2'],
        totalPrice: 100,
        status: 'pending',
      };
      const userId = 'user123';
      const mockOrder = {
        _id: 'order123',
        userId,
        ...createOrderDto,
        save: jest.fn().mockResolvedValue({
          _id: 'order123',
          userId,
          ...createOrderDto,
        }),
      };

      mockOrderModel.new.mockReturnValue(mockOrder);

      const result = await service.create(createOrderDto, userId);

      expect(mockOrderModel.new).toHaveBeenCalledWith({
        ...createOrderDto,
        userId,
      });
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith('order.created', {
        orderId: 'order123',
        userId,
      });
      expect(result).toEqual({
        _id: 'order123',
        userId,
        ...createOrderDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all orders for a user', async () => {
      const userId = 'user123';
      const mockOrders = [
        { _id: 'order1', userId, productIds: ['product1'], totalPrice: 50 },
        { _id: 'order2', userId, productIds: ['product2'], totalPrice: 75 },
      ];

      mockOrderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await service.findAll(userId);

      expect(mockOrderModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('findOne', () => {
    it('should return an order if found and user has permission', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const mockOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
      };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findOne(orderId, userId);

      expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      const orderId = 'order123';
      const userId = 'user123';

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        `Order with ID ${orderId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update an order and publish event', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const updateOrderDto = { status: 'completed' };
      const mockOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
      };
      const updatedOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
        status: 'completed',
      };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedOrder),
      });

      const result = await service.update(orderId, updateOrderDto, userId);

      expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        updateOrderDto,
        { new: true },
      );
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith('order.updated', {
        orderId,
        userId,
      });
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('remove', () => {
    it('should delete an order and publish event', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const mockOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
      };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      mockOrderModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove(orderId, userId);

      expect(mockOrderModel.deleteOne).toHaveBeenCalledWith({ _id: orderId });
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith('order.deleted', {
        orderId,
        userId,
      });
    });
  });
}); 