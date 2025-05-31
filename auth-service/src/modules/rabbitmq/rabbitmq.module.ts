import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { AuthModule } from '../auth/auth.module';
 
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {} 