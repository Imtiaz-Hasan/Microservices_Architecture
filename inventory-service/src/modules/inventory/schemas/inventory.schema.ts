import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Inventory {
  @Prop({ required: true, unique: true })
  productId: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export type InventoryDocument = Inventory & Document;
export const InventorySchema = SchemaFactory.createForClass(Inventory);
export const INVENTORY_MODEL_NAME = 'Inventory'; 