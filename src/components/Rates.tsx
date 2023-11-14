import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Text } from "@chakra-ui/react";
import { FormattedNumber } from "react-intl";

import { rateSymbolAtom, ratesAtom } from "@goalz/state";

export default function Rates() {
  const rateSymbol = useAtomValue(rateSymbolAtom);
  const currency = useMemo(() => rateSymbol.replace("BTC", ""), [rateSymbol]);
  const rates = useAtomValue(ratesAtom);
  return rates ? (
    <Text fontSize="xs" color="gray.500">
      ₿1 =
      <FormattedNumber value={rates.ask} style="currency" currency={currency} />
    </Text>
  ) : null;
}
