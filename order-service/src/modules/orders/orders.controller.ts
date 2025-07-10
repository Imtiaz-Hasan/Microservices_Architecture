import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService, OrderStatus } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status for the current user' })
  @ApiResponse({ status: 200, description: 'Return orders filtered by status.' })
  @ApiQuery({ name: 'status', enum: OrderStatus, description: 'Order status to filter by' })
  findByStatus(@Param('status') status: OrderStatus, @Request() req) {
    return this.ordersService.getOrdersByStatus(status, req.user.userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get order statistics for the current user' })
  @ApiResponse({ status: 200, description: 'Return order statistics.' })
  getStatistics(@Request() req) {
    return this.ordersService.getOrderStatistics(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    return this.ordersService.update(id, updateOrderDto, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'The order status has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Request() req,
  ) {
    return this.ordersService.updateOrderStatus(id, status, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ordersService.remove(id, req.user.userId);
  }
} 