import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { RateSymbol, Rates, Currency, FiatCurrency } from "@ngine/money";

export const currencyAtom = atomWithStorage<Currency>("currency", "BTC");
export const rateSymbolAtom = atom<RateSymbol>("BTCUSD");
export const fiatCurrencyAtom = atomWithStorage<FiatCurrency>(
  "fiatCurrency",
  "USD",
);
export const ratesAtom = atomWithStorage<Rates | undefined>("rates", undefined);
