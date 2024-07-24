import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class ExchangeDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}
