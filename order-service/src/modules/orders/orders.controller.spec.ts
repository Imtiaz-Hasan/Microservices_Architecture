import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const createOrderDto: CreateOrderDto = {
        productIds: ['product1', 'product2'],
        totalPrice: 100,
        status: 'pending',
      };
      const userId = 'user123';
      const mockOrder = {
        _id: 'order123',
        userId,
        ...createOrderDto,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockOrder as any);

      const result = await controller.create(createOrderDto, { user: { userId } });

      expect(service.create).toHaveBeenCalledWith(createOrderDto, userId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll', () => {
    it('should return all orders for a user', async () => {
      const userId = 'user123';
      const mockOrders = [
        { _id: 'order1', userId, productIds: ['product1'], totalPrice: 50 },
        { _id: 'order2', userId, productIds: ['product2'], totalPrice: 75 },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockOrders as any);

      const result = await controller.findAll({ user: { userId } });

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const mockOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);

      const result = await controller.findOne(orderId, { user: { userId } });

      expect(service.findOne).toHaveBeenCalledWith(orderId, userId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const updateOrderDto: UpdateOrderDto = { status: 'completed' };
      const mockOrder = {
        _id: orderId,
        userId,
        productIds: ['product1'],
        totalPrice: 50,
        status: 'completed',
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockOrder as any);

      const result = await controller.update(orderId, updateOrderDto, { user: { userId } });

      expect(service.update).toHaveBeenCalledWith(orderId, updateOrderDto, userId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const orderId = 'order123';
      const userId = 'user123';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(orderId, { user: { userId } });

      expect(service.remove).toHaveBeenCalledWith(orderId, userId);
    });
  });
}); 