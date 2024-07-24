export class Currency {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly precision: number,
  ) {}
}

export const currencies = {
  TWD: new Currency('New Taiwan Dollar', 'TWD', 2),
  USD: new Currency('US Dollar', 'USD', 2),
};
