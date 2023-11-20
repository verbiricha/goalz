export type RateSymbol = "BTCUSD" | "BTCEUR";
export type FiatCurrency = "USD" | "EUR";
export type Currency = "BTC" | "USD" | "EUR";

export interface Rates {
  time: number;
  ask: number;
  bid: number;
  low: number;
  high: number;
  currency: FiatCurrency;
  symbol: RateSymbol;
}

export function convertSatsToFiat(amt: string, rates: Rates): string {
  const inBtc = Number(amt) / 1e8;
  return String((rates.ask * inBtc).toFixed(2));
}

export function convertFiatToSats(amt: string, rates: Rates): string {
  const inFiat = Number(amt);
  return String(((inFiat / rates.ask) * 1e8).toFixed(0));
}
