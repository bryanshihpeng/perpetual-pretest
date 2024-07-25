import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { Server } from 'http';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

dotenv.config();
jest.setTimeout(15000); // Increase global timeout to 15 seconds for all tests in this file

describe('Exchange Integration Tests', () => {
  let app: INestApplication;
  let socket: Socket;
  let httpServer: Server;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(3000);
    httpServer = app.getHttpServer();
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
  describe('WebSocket Reserves Updates', () => {
    it('should receive reserves updates via WebSocket', (done) => {
      socket.on('reservesUpdated', (updatedReserves) => {
        expect(updatedReserves).toHaveProperty('USD');
        expect(updatedReserves).toHaveProperty('TWD');
        done();
      });

      socket.emit('requestReserves');
    });

    it('should receive reserves updates after performing an exchange', (done) => {
      socket.on('reservesUpdated', (updatedReserves) => {
        expect(updatedReserves).toHaveProperty('USD');
        expect(updatedReserves).toHaveProperty('TWD');
        done();
      });

      request(httpServer)
        .post('/exchange')
        .send({
          from: 'USD',
          to: 'TWD',
          amount: 100,
        })
        .expect(201)
        .then(() => {
          socket.emit('requestReserves');
        });
    });
  });

  describe('HTTP POST /exchange', () => {
    it('should perform a currency exchange', async () => {
      const response = await request(httpServer).post('/exchange').send({
        from: 'USD',
        to: 'TWD',
        amount: 100,
      });

      expect(response.status).toBe(201);
      const result = response.body;
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('TWD');
      expect(result.fromAmount).toBe(100);
      expect(result.toAmount).toBeGreaterThan(0);
    });

    it('should return an error for invalid currency pair', async () => {
      const response = await request(httpServer).post('/exchange').send({
        from: 'INVALID',
        to: 'TWD',
        amount: 100,
      });

      expect(response.status).toBe(400);
      const result = response.body;
      expect(result.message).toBe('Invalid currency pair');
    });

    it('should return an error if exchange service fails', async () => {
      const response = await request(httpServer).post('/exchange').send({
        from: 'USD',
        to: 'TWD',
        amount: 0,
      });

      expect(response.status).toBe(400);
      const result = response.body;
      expect(result.message).toBe('Trade amount must be positive');
    });
  });
});
