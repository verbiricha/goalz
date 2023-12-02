import { useAtomValue } from "jotai";

import { ratesAtom } from "@ngine/state";
import { formatSatAmount } from "@ngine/format";
import type { Currency } from "@ngine/money";

interface SatAmountProps {
  amount: number;
  currency?: Currency;
}

export default function SatAmount({
  amount,
  currency = "BTC",
}: SatAmountProps) {
  const rates = useAtomValue(ratesAtom);
  return (
    <>
      {formatSatAmount(
        amount,
        currency,
        rates?.currency === currency ? rates : undefined,
      )}
    </>
  );
}
