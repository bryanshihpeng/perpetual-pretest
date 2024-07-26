import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeDto {
  @ApiProperty({ description: 'Currency to exchange from', example: 'USD' })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({ description: 'Currency to exchange to', example: 'TWD' })
  @IsNotEmpty()
  @IsString()
  to: string;

  @ApiProperty({ description: 'Amount to exchange', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}
