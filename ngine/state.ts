import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import type { Session } from "@ngine/types";
import type { Rates, Currency } from "@ngine/money";

export const sessionAtom = atomWithStorage<Session | null>(
  "ngine.session",
  null,
);
export const relaysAtom = atom<string[]>([]);
export const followsAtom = atom<NDKEvent | null>(null);
export const contactsAtom = atom<string[]>((get) => {
  const follows = get(followsAtom);
  return follows?.tags.filter((t) => t[0] === "p").map((t) => t[1]) ?? [];
});
export const currencyAtom = atomWithStorage<Currency>("ng.currency", "BTC");
export const latestRatesAtom = atomWithStorage<Rates[]>("ngi.rates", []);
export const ratesAtom = atom((get) => {
  const currency = get(currencyAtom);
  const rates = get(latestRatesAtom);
  return rates.find((r) => r.currency === currency);
});
