import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthRmqController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.validate-token')
  async handleValidateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
} 