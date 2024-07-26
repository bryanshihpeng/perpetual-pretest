import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ExchangeDto } from '../../application/dto/exchange.dto';
import { ExchangeService } from '../../application/exchange.service';
import { currencies } from '../../domain/core/currency/currency';

@ApiTags('exchange')
@Controller('exchange')
@UseInterceptors(ClassSerializerInterceptor)
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post()
  @ApiOperation({ summary: 'Perform currency exchange' })
  @ApiBody({ type: ExchangeDto })
  @ApiResponse({ status: 200, description: 'The exchange has been successfully performed.' })
  @ApiResponse({ status: 400, description: 'Invalid currency pair or insufficient funds.' })
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
      return {
        fromCurrency: fromCurrency.code,
        toCurrency: toCurrency.code,
        fromAmount: exchangeDto.amount,
        toAmount: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
