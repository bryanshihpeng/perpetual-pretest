import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

jest.setTimeout(15000); // Increase global timeout to 15 seconds for all tests in this file

describe('Exchange Integration Tests', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(3000);

    socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    // Wait for the socket to connect before running tests
    await new Promise<void>((resolve) => {
      socket.on('connect', () => {
        console.log('WebSocket connected');
        resolve();
      });
    });
  });

  afterAll(async () => {
    socket.disconnect();
    await app.close();
  });

  it('should get initial reserves', async () => {
    const response = await request(app.getHttpServer()).get(
      '/exchange/reserves',
    );
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body['USD']).toBeDefined();
    expect(response.body['TWD']).toBeDefined();

    expect(response.body['USD']).toBe(10000);
    expect(response.body['TWD']).toBe(10000);
  });

  it('should exchange currency and receive WebSocket notification', (done) => {
    socket.on('reserveChange', (data) => {
      console.log('Received reserveChange event:', data);
      expect(data).toEqual({
        TWD: 11000,
        USD: expect.closeTo(9090.91, 2),
      });
      done();
    });

    request(app.getHttpServer())
      .post('/exchange')
      .send({
        from: 'TWD',
        to: 'USD',
        amount: 1000,
      })
      .expect(201)
      .then((response) => {
        expect(response.body.usdAmount).toBeCloseTo(909.09, 2);
      });
  });
});
