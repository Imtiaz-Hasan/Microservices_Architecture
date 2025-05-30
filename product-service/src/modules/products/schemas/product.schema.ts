import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Product extends TimeStamps {
  @Property({ required: true })
  public name!: string;

  @Property({ required: true })
  public description!: string;

  @Property({ required: true })
  public price!: number;

  @Property({ required: true })
  public userId!: string;
}

export const ProductModel = getModelForClass(Product); 