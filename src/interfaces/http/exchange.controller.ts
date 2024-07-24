import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ExchangeDto } from '../../application/dto/exchange.dto';
import { ExchangeService } from '../../application/exchange.service';
import { currencies } from '../../domain/core/currency/currency';
import { IReserveRepository } from '../../domain/reserve/reserve.repository.interface';

@Controller('exchange')
@UseInterceptors(ClassSerializerInterceptor)
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    @Inject(IReserveRepository) private reserveRepository: IReserveRepository,
  ) {}

  @Post()
  async exchange(@Body() exchangeDto: ExchangeDto) {
    const fromCurrency = currencies[exchangeDto.from.toUpperCase()];
    const toCurrency = currencies[exchangeDto.to.toUpperCase()];

    if (!fromCurrency || !toCurrency) {
      throw new HttpException('Invalid currency pair', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.exchangeService.exchange(
        fromCurrency,
        toCurrency,
        exchangeDto.amount,
      );
      return { [exchangeDto.to.toLowerCase() + 'Amount']: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('reserves')
  async getReserves() {
    return await this.reserveRepository.getAllReserves();
  }
}
