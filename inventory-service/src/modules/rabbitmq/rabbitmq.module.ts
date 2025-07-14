import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [forwardRef(() => InventoryModule)],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {} 