import { useAtom, useAtomValue } from "jotai";
import { HStack, Switch, Text } from "@chakra-ui/react";

import { currencyAtom, fiatCurrencyAtom } from "../state";

export default function CurrencySwitch() {
  const fiatCurrency = useAtomValue(fiatCurrencyAtom);
  const [currency, setCurrency] = useAtom(currencyAtom);
  const isBTC = currency === "BTC";

  function changeCurrency() {
    if (isBTC) {
      setCurrency(fiatCurrency);
    } else {
      setCurrency("BTC");
    }
  }

  return (
    <HStack>
      <Text>{fiatCurrency}</Text>
      <Switch
        colorScheme={isBTC ? "orange" : "green"}
        onChange={changeCurrency}
        isChecked={isBTC}
      />
      <Text>BTC</Text>
    </HStack>
  );
}
