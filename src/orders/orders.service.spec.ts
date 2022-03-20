import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Order } from './orders.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpService: HttpService;

  const mockRepository = {
    save: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
    createQueryBuilder: jest.fn(() => ({
      setLock: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest
        .fn()
        .mockResolvedValue({ rows: [], affected: 1, generatedMaps: [] }),
    })),
    find: jest.fn().mockImplementation((options) => {
      const { skip, take } = options;
      const allOrders = [
        { id: 1, distance: 8000, status: 'TAKEN' },
        { id: 2, distance: 8000, status: 'UNASSIGNED' },
        { id: 3, distance: 8000, status: 'UNASSIGNED' },
        { id: 4, distance: 8000, status: 'UNASSIGNED' },
        { id: 5, distance: 8000, status: 'UNASSIGNED' },
        { id: 6, distance: 8000, status: 'UNASSIGNED' },
        { id: 7, distance: 8000, status: 'UNASSIGNED' },
      ];
      return allOrders.slice(skip, skip + take);
    }),
    // .mockImplementation(() => ({})),
  };
  const mockHttpService = {
    get: jest
      .fn()
      .mockReturnValue(
        of({ data: { rows: [{ elements: [{ distance: { value: 8000 } }] }] } }),
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        HttpService,
      ],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    service = module.get<OrdersService>(OrdersService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the distance between to points', async () => {
    expect(
      await service.calculateDistance(
        '22.323303241509603',
        '114.18696023173759',
        '22.283953987055597',
        '114.15396180619211',
      ),
    ).toEqual(expect.any(Number));
  });

  it('should create an order and return the order', async () => {
    const dto = { distance: 8000, status: 'UNASSIGNED' };
    expect(await service.createOrder(dto)).toEqual({
      id: expect.any(Number),
      distance: expect.any(Number),
      status: 'UNASSIGNED',
    });
  });

  it('should update an order and return the update result', async () => {
    const dto = { status: 'TAKEN' };
    expect(await service.updateOrder('1', dto)).toEqual({
      rows: [],
      affected: 1,
      generatedMaps: [],
    });
  });

  it('should list orders', async () => {
    expect(await service.getOrders(0, 5)).toEqual([]);
    expect(await service.getOrders(1, 5)).toEqual([
      { id: 1, distance: 8000, status: 'TAKEN' },
      { id: 2, distance: 8000, status: 'UNASSIGNED' },
      { id: 3, distance: 8000, status: 'UNASSIGNED' },
      { id: 4, distance: 8000, status: 'UNASSIGNED' },
      { id: 5, distance: 8000, status: 'UNASSIGNED' },
    ]);
    expect(await service.getOrders(2, 5)).toEqual([
      { id: 6, distance: 8000, status: 'UNASSIGNED' },
      { id: 7, distance: 8000, status: 'UNASSIGNED' },
    ]);
    expect(await service.getOrders(3, 5)).toEqual([]);
  });
});
