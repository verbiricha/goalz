import { useAtom } from "jotai";
import { HStack, Switch, Text } from "@chakra-ui/react";

import { currencyAtom } from "@ngine/state";

export default function CurrencySwitch() {
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
    <HStack align="center" justify="space-between" w="100%">
      <Switch
        colorScheme="brand"
        onChange={changeCurrency}
        isChecked={isUSD}
        size="sm"
      >
        USD amounts
      </Switch>

      <Text
        as="span"
        sx={{
          color: currency === "BTC" ? "orange.500" : "green.500",
          _dark: {
            color: currency === "BTC" ? "orange.300" : "green.300",
          },
        }}
        fontSize="md"
      >
        {currency === "BTC" ? "₿" : "$"}
      </Text>
    </HStack>
  );
}
