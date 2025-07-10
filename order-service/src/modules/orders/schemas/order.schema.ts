import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Order extends TimeStamps {
  @Property({ type: () => [String], required: true })
  public productIds!: string[];

  @Property({ required: true })
  public userId!: string;

  @Property({ required: true, default: 'pending' })
  public status!: string;

  @Property({ required: true })
  public totalPrice!: number;
}

export const OrderModel = getModelForClass(Order); 