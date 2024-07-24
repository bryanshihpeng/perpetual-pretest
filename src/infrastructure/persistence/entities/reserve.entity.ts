import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Reserve {
  @PrimaryKey()
  id!: number;

  @Property()
  currencyCode!: string;

  @Property()
  currencyName!: string;

  @Property()
  precision!: number;

  @Property()
  amount!: number;
}
