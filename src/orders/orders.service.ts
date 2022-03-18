import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { Order, OrderDto } from './orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private httpService: HttpService,
  ) {}

  /**
   * Get the distance between two points
   * @param startLat Start latitude
   * @param startLng Start longitude
   * @param endLat End latitude
   * @param endLng End longitude
   * @returns Distance between the start and the end in meters
   */
  async calculateDistance(
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
  ): Promise<any> {
    try {
      const params = {
        origins: `${startLat},${startLng}`,
        destinations: `${endLat},${endLng}`,
        units: 'metric',
        key: process.env.GOOGLE_API_KEY,
      };
      const data = await lastValueFrom(
        this.httpService
          .get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: params,
          })
          .pipe(map((response) => response.data)),
      );
      const rows = data.rows;
      const row = rows[0];
      const elements = row.elements;
      const element = elements[0];
      const distance = element.distance;
      const distanceValue = distance.value;
      return distanceValue;
    } catch (err) {
      throw new Error('Google API returns an error');
    }
  }

  /**
   * Create an order and return the order object
   * @param body Order Dto Entity
   * @returns Order entity
   */
  async createOrder(body: OrderDto): Promise<Order> {
    const order = await this.orderRepository.save(body);
    return order;
  }

  /**
   * Update an order status to 'TAKEN' if the order has not been taken yet.
   * @param id Order ID
   * @param body Order Dto Entity
   * @returns Updated result
   */
  async updateOrder(id: string, body: OrderDto) {
    const updateResult = await this.orderRepository
      .createQueryBuilder('order')
      .setLock('pessimistic_write')
      .update()
      .set(body)
      .where('id = :id', { id: id })
      .andWhere('status = :status', { status: 'UNASSIGNED' })
      .execute();
    return updateResult;
  }

  /**
   * Get a list of orders with pagination enabled.
   * @param page Page number
   * @param limit Limit number
   * @returns List of orders
   */
  async getOrders(page: number, limit: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
    return orders;
  }
}
