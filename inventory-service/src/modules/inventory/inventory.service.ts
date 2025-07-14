import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    return this.inventoryModel.create(createInventoryDto);
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryModel.find().exec();
  }

  async findOne(id: string): Promise<Inventory> {
    const item = await this.inventoryModel.findById(id).exec();
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.inventoryModel.findByIdAndUpdate(id, updateInventoryDto, { new: true }).exec();
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.inventoryModel.findByIdAndDelete(id).exec();
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const item = await this.inventoryModel.findOne({ productId }).exec();
    return !!item && item.quantity >= quantity;
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const item = await this.inventoryModel.findOne({ productId }).exec();
    if (!item || item.quantity < quantity) return false;
    item.quantity -= quantity;
    await item.save();
    return true;
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    const item = await this.inventoryModel.findOne({ productId }).exec();
    if (item) {
      item.quantity += quantity;
      await item.save();
    }
  }
} 