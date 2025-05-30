import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class User extends TimeStamps {
  @Property({ required: true })
  public name!: string;

  @Property({ required: true, unique: true })
  public email!: string;

  @Property({ required: true })
  public password!: string;

  @Property({ enum: UserRole, default: UserRole.USER })
  public role!: UserRole;
}

export const UserModel = getModelForClass(User); 