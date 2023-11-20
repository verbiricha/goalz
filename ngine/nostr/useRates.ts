import { useMemo } from "react";
import { NDKKind } from "@nostr-dev-kit/ndk";

import useEvents from "./useEvents";
import type { RateSymbol, Rates, FiatCurrency } from "../money";

const SNORT_PUBKEY =
  "84de35e2584d2b144aae823c9ed0b0f3deda09648530b93d1a2a146d1dea9864";

export default function useRates(symbol: RateSymbol): Rates | undefined {
  const { events } = useEvents(
    {
      kinds: [1009 as NDKKind],
      authors: [SNORT_PUBKEY],
      limit: 1,
    },
    {
      groupable: false,
      closeOnEose: false,
    },
    ["wss://relay.snort.social"],
  );
  const latest = useMemo(() => {
    return events.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0];
  }, [events]);
  const rates = useMemo(() => {
    const tag = latest?.getMatchingTags("d").filter((t) => t[1] === symbol)[0];
    if (tag) {
      return {
        time: latest.created_at ?? 0,
        ask: Number(tag[2]) ?? 0,
        bid: Number(tag[3]) ?? 0,
        low: Number(tag[4]) ?? 0,
        high: Number(tag[5]) ?? 0,
        currency: symbol.replace("BTC", "") as FiatCurrency,
        symbol,
      };
    }
  }, [latest]);
  return rates;
}
