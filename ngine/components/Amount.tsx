import { useAtomValue } from "jotai";

import { ratesAtom, currencyAtom } from "@ngine/state";
import { formatSatAmount } from "@ngine/format";
import type { Currency } from "@ngine/money";

interface SatAmountProps {
  amount: number;
  currency?: Currency;
}

export default function SatAmount({ amount, currency }: SatAmountProps) {
  const defaultCurrency = useAtomValue(currencyAtom);
  const rates = useAtomValue(ratesAtom);
  return (
    <>{formatSatAmount(amount, currency ? currency : defaultCurrency, rates)}</>
  );
}
