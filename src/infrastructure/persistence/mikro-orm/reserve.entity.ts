import { DecimalType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ReserveEntity {
  @PrimaryKey()
  currencyCode!: string;

  @Property()
  currencyName!: string;

  @Property()
  precision!: number;

  @Property({ type: DecimalType })
  amount!: number;

  constructor(props: {
    currencyCode: string;
    currencyName: string;
    precision: number;
    amount: number;
  }) {
    this.currencyCode = props.currencyCode;
    this.currencyName = props.currencyName;
    this.precision = props.precision;
    this.amount = props.amount;
  }
}
