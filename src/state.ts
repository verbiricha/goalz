import { atomWithStorage } from "jotai/utils";

import type { FiatCurrency } from "@ngine/money";

export const fiatCurrencyAtom = atomWithStorage<FiatCurrency>(
  "fiatCurrency",
  "USD",
);
