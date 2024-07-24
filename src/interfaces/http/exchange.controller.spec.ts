import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from '../../application/exchange.service';
import { ExchangeController } from './exchange.controller';

describe('ExchangeController', () => {
  let exchangeController: ExchangeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeController],
      providers: [ExchangeService],
    }).compile();

    exchangeController = app.get<ExchangeController>(ExchangeController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(exchangeController.getReserves()).toBe('Hello World!');
    });
  });
});
