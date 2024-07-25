export class ExchangeRateCalculator {
  static calculateExchangeAmount(fromReserve, toReserve, amount) {
    const Rf = fromReserve;
    const Rt = toReserve;
    const x = amount;

    const numerator = Rt * Rf;
    const denominator = Rf + x;
    const y = numerator / denominator - Rt;

    return -y;
  }

  static calculateExchangeRate(fromReserve, toReserve, amount) {
    const exchangeAmount = this.calculateExchangeAmount(
      fromReserve,
      toReserve,
      amount,
    );
    return Math.floor((exchangeAmount / amount) * 100) / 100;
  }
}

export default ExchangeRateCalculator;
