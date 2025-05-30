import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: RabbitMQService, useValue: { publish: jest.fn() } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    usersService.findOne.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      email: 'test@example.com',
      toObject: () => ({ email: 'test@example.com' }),
    });
    const result = await service.register({ email: 'test@example.com', password: 'pass', name: 'Test' });
    expect(result.email).toBe('test@example.com');
  });

  it('should not register duplicate email', async () => {
    usersService.findOne.mockResolvedValue({ email: 'test@example.com' });
    await expect(service.register({ email: 'test@example.com', password: 'pass', name: 'Test' }))
      .rejects.toThrow();
  });
}); 