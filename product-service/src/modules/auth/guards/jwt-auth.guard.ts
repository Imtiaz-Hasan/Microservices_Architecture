import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly rabbitMQService: RabbitMQService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token provided');
    const result = await this.rabbitMQService.rpcValidateToken(token);
    if (!result || !result.valid) throw new UnauthorizedException('Invalid token');
    const user = result.user;
    request.user = {
      userId: user._id || user.id || user.userId,
      email: user.email,
      role: user.role,
      // add other fields if needed
    };
    return true;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
} 