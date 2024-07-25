import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDto } from '../../application/dto/exchange.dto';
import { ExchangeService } from '../../application/exchange.service';
import { ExchangeController } from './exchange.controller';

describe('ExchangeController', () => {
  let exchangeController: ExchangeController;
  let exchangeService: ExchangeService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeController],
      providers: [
        {
          provide: ExchangeService,
          useValue: {
            exchange: jest.fn(),
          },
        },
      ],
    }).compile();

    exchangeController = app.get<ExchangeController>(ExchangeController);
    exchangeService = app.get<ExchangeService>(ExchangeService);
  });

  describe('exchange', () => {
    it('should return the exchange result', async () => {
      const exchangeDto: ExchangeDto = { from: 'USD', to: 'TWD', amount: 100 };
      const result = 3000;

      jest.spyOn(exchangeService, 'exchange').mockResolvedValue(result);

      const response = await exchangeController.exchange(exchangeDto);

      expect(response).toEqual({
        fromCurrency: 'USD',
        toCurrency: 'TWD',
        fromAmount: 100,
        toAmount: result,
      });
    });

    it('should throw an error for invalid currency pair', async () => {
      const exchangeDto: ExchangeDto = {
        from: 'INVALID',
        to: 'TWD',
        amount: 100,
      };

      await expect(exchangeController.exchange(exchangeDto)).rejects.toThrow(
        new HttpException('Invalid currency pair', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if exchange service fails', async () => {
      const exchangeDto: ExchangeDto = { from: 'USD', to: 'TWD', amount: 100 };

      jest
        .spyOn(exchangeService, 'exchange')
        .mockRejectedValue(new Error('Service error'));

      await expect(exchangeController.exchange(exchangeDto)).rejects.toThrow(
        new HttpException('Service error', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
