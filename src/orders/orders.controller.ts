import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrderInput, Order, OrderDto } from './orders.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  /**
   * Create a new order and return the order object.
   * @param order Create order input body
   * @returns Order Entity
   */
  @Post('')
  async createOrder(@Body() order: CreateOrderInput): Promise<Order> {
    try {
      if (
        !order.destination ||
        !order.origin ||
        order.destination.length !== 2 ||
        order.origin.length !== 2
      ) {
        throw new Error('Invalid origin or destination');
      }
      const startLat = order.origin[0];
      const startLng = order.origin[1];
      const endLat = order.destination[0];
      const endLng = order.destination[1];

      // Calculate the distance between the two points
      const distance = await this.orderService.calculateDistance(
        startLat,
        startLng,
        endLat,
        endLng,
      );

      // Create the order
      const status = 'UNASSIGNED';
      const body = { distance: distance, status: status };
      const savedOrder = await this.orderService.createOrder(body);

      // Return the order
      return savedOrder;
    } catch (err) {
      throw new HttpException(
        { status: err.status, message: err.message },
        400,
      );
    }
  }

  /**
   * Take an order that is originally unassigned.
   * @param id Order ID
   * @param body Order status
   * @returns Order taken status
   */
  @Patch(':id')
  async takeOrder(
    @Param('id') id: string,
    @Body() body: OrderDto,
  ): Promise<any> {
    try {
      const updateResult = await this.orderService.updateOrder(id, body);
      if (updateResult.affected === 0) {
        throw new Error('Order is taken or does not exist');
      } else {
        return { status: 'SUCCESS' };
      }
    } catch (err) {
      throw new HttpException(
        { status: err.status, message: err.message },
        400,
      );
    }
  }

  /**
   * Get a list of orders with pagination enabled.
   * @param pageQuery Page number
   * @param limitQuery Limit number
   * @returns List of orders
   */
  @Get('')
  async listOrders(
    @Query('page') pageQuery: string,
    @Query('limit') limitQuery: string,
  ): Promise<Order[]> {
    try {
      const page = parseInt(pageQuery);
      const limit = parseInt(limitQuery);
      if (!page || !limit || page < 1 || limit <= 0) {
        throw new Error('Invalid page or limit');
      }
      const orders = await this.orderService.getOrders(page, limit);
      return orders;
    } catch (err) {
      throw new HttpException(
        { status: err.status, message: err.message },
        400,
      );
    }
  }
}
