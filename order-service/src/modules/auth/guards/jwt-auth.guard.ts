import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const result = await this.rabbitMQService.rpcValidateToken(token);
    if (!result.valid) {
      throw new UnauthorizedException('Invalid token');
    }
    request['user'] = result.user;
    return true;
  }
} 