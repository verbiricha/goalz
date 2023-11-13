import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import useRates from "../hooks/useRates";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { rateSymbolAtom, ratesAtom } from "../state";

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
