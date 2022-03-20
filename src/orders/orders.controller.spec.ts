import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockService = {
    calculateDistance: jest
      .fn()
      .mockImplementation((startLat, startLng, endLat, endLng) =>
        Promise.resolve(8000),
      ),
    createOrder: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
    updateOrder: jest.fn().mockImplementation((id, dto) => {
      if (id === '1')
        return Promise.resolve({ raw: [], affected: 1, generatedMaps: [] });
      else return Promise.resolve({ raw: [], affected: 0, generatedMaps: [] });
    }),
    getOrders: jest.fn().mockImplementation((page, limit) => {
      const allOrders = [
        { id: 1, distance: 8000, status: 'TAKEN' },
        { id: 2, distance: 9000, status: 'TAKEN' },
        { id: 3, distance: 7000, status: 'UNASSIGNED' },
        { id: 4, distance: 6000, status: 'UNASSIGNED' },
        { id: 5, distance: 5000, status: 'UNASSIGNED' },
        { id: 6, distance: 5000, status: 'UNASSIGNED' },
        { id: 7, distance: 5000, status: 'UNASSIGNED' },
      ];
      const orders = allOrders.slice((page - 1) * limit, page * limit);
      return Promise.resolve(orders);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService],
    })
      .overrideProvider(OrdersService)
      .useValue(mockService)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an order and return the order', async () => {
    expect(
      await controller.createOrder({
        origin: ['22.323303241509603', '114.18696023173759'],
        destination: ['22.283953987055597', '114.15396180619211'],
      }),
    ).toEqual({
      id: expect.any(Number),
      distance: expect.any(Number),
      status: 'UNASSIGNED',
    });
    await expect(
      controller.createOrder({
        origin: ['22.323303241509603'],
        destination: ['22.283953987055597', '114.15396180619211'],
      }),
    ).rejects.toEqual(
      new HttpException({ message: 'Invalid origin or destination' }, 400),
    );
    await expect(
      controller.createOrder({
        origin: ['22.323303241509603', '114.18696023173759'],
        destination: ['22.283953987055597'],
      }),
    ).rejects.toEqual(
      new HttpException({ message: 'Invalid origin or destination' }, 400),
    );
    await expect(
      controller.createOrder({
        origin: [
          '22.323303241509603',
          '114.18696023173759',
          '114.18696023173759',
        ],
        destination: ['22.283953987055597', '114.15396180619211'],
      }),
    ).rejects.toEqual(
      new HttpException({ message: 'Invalid origin or destination' }, 400),
    );
    await expect(
      controller.createOrder({
        origin: ['22.323303241509603', '114.18696023173759'],
        destination: [
          '22.283953987055597',
          '114.15396180619211',
          '114.18696023173759',
        ],
      }),
    ).rejects.toEqual(
      new HttpException({ message: 'Invalid origin or destination' }, 400),
    );
  });

  it('should take an order and return the order', async () => {
    expect(await controller.takeOrder('1', { status: 'TAKEN' })).toEqual({
      status: 'SUCCESS',
    });
    await expect(
      controller.takeOrder('2', { status: 'TAKEN' }),
    ).rejects.toEqual(
      new HttpException({ message: 'Order is taken or does not exist' }, 400),
    );
  });

  it('should list orders', async () => {
    await expect(controller.listOrders('0', '5')).rejects.toEqual(
      new HttpException({ message: 'Invalid page or limit' }, 400),
    );
    expect(await controller.listOrders('1', '5')).toEqual([
      { id: 1, distance: 8000, status: 'TAKEN' },
      { id: 2, distance: 9000, status: 'TAKEN' },
      { id: 3, distance: 7000, status: 'UNASSIGNED' },
      { id: 4, distance: 6000, status: 'UNASSIGNED' },
      { id: 5, distance: 5000, status: 'UNASSIGNED' },
    ]);
    expect(await controller.listOrders('2', '5')).toEqual([
      { id: 6, distance: 5000, status: 'UNASSIGNED' },
      { id: 7, distance: 5000, status: 'UNASSIGNED' },
    ]);
    expect(await controller.listOrders('3', '5')).toEqual([]);
    await expect(controller.listOrders('1', '0')).rejects.toEqual(
      new HttpException({ message: 'Invalid page or limit' }, 400),
    );
    await expect(controller.listOrders('abc', 'def')).rejects.toEqual(
      new HttpException({ message: 'Invalid page or limit' }, 400),
    );
  });
});
