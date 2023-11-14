import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import useRates from "@goalz/hooks/useRates";
import Header from "@goalz/components/Header";
import Footer from "@goalz/components/Footer";
import { rateSymbolAtom, ratesAtom } from "@goalz/state";

export default function Main() {
  const rateSymbol = useAtomValue(rateSymbolAtom);
  const currentRates = useRates(rateSymbol);
  const [, setRates] = useAtom(ratesAtom);

  useEffect(() => {
    setRates(currentRates);
  }, [currentRates]);

  return (
    <Stack align="center" justify="center">
      <Header />
      <Outlet />
      <Footer />
    </Stack>
  );
}
