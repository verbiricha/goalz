import { useAtom, useAtomValue } from "jotai";
import { Switch } from "@chakra-ui/react";

import { currencyAtom, ratesAtom } from "@goalz/state";

export default function CurrencySwitch() {
  const currentRates = useAtomValue(ratesAtom);
  const [currency, setCurrency] = useAtom(currencyAtom);
  const isUSD = currency === "USD";

  // todo: rate symbol atom when supporting EUR
  function changeCurrency() {
    if (isUSD) {
      setCurrency("BTC");
    } else {
      setCurrency("USD");
    }
  }

  return (
    <Switch
      colorScheme="brand"
      isDisabled={!currentRates}
      onChange={changeCurrency}
      isChecked={isUSD}
      size="sm"
    >
      USD amounts
    </Switch>
  );
}
