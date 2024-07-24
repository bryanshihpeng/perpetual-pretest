import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TradeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}
