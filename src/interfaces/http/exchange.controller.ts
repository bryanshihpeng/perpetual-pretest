import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { TradeDto } from '../../application/dto/trade.dto';
import { ExchangeService } from '../../application/exchange.service';
import { currencies } from '../../domain/core/currency/currency';
import { IReserveRepository } from '../../domain/reserve/reserve.repository.interface';

@Controller('exchange')
@UseInterceptors(ClassSerializerInterceptor)
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private reserveRepository: IReserveRepository,
  ) {}

  @Post(':from/:to')
  async trade(
    @Param('from') from: string,
    @Param('to') to: string,
    @Body() tradeDto: TradeDto,
  ) {
    const fromCurrency = currencies[from.toUpperCase()];
    const toCurrency = currencies[to.toUpperCase()];

    if (!fromCurrency || !toCurrency) {
      throw new HttpException('Invalid currency pair', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.exchangeService.exchange(
        fromCurrency,
        toCurrency,
        tradeDto.amount,
      );
      return { [to.toLowerCase() + 'Amount']: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('reserves')
  async getReserves() {
    return await this.reserveRepository.getAllReserves();
  }
}
