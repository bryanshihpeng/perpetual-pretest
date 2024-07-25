import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ReserveEntity {
  @PrimaryKey()
  currencyCode!: string;

  @Property()
  currencyName!: string;

  @Property()
  precision!: number;

  @Property()
  amount!: number;
}
