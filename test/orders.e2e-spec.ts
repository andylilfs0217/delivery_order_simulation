import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrdersModule } from './../src/orders/orders.module';
import { Order } from './../src/orders/orders.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  const mockOrderRepository = {
    save: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(getRepositoryToken(Order))
      .useValue(mockOrderRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/orders (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/orders')
  //     .query({ page: '1', limit: '5' })
  //     .expect(200);
  // });

  // it('/orders (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/orders')
  //     .send({
  //       origin: ['22.323303241509603', '114.18696023173759'],
  //       destination: ['22.283953987055597', '114.15396180619211'],
  //     })
  //     .expect('Content-Type', /json/)
  //     .expect(201)
  //     .then((response) => {
  //       expect(response.body).toEqual({
  //         id: expect.any(Number),
  //         distance: expect.any(Number),
  //         status: 'UNASSIGNED',
  //       });
  //     });
  // });
});
