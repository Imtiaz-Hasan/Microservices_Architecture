import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly rabbitMQService: RabbitMQService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: any, done: Function) {
    // Validate token via Auth Service using RabbitMQ
    const token = payload?.token || payload?.access_token;
    // In Passport, the raw token is not available in payload, so we need to get it from the request context
    // We'll override the AuthGuard to pass the token
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
} 