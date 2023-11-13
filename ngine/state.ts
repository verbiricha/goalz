import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import { DEFAULT_RELAYS } from "@ngine/const";
import type { Session } from "@ngine/types";

export const sessionAtom = atomWithStorage<Session | null>("session", null);
export const relaysAtom = atom<string[]>(DEFAULT_RELAYS);
export const followsAtom = atom<NDKEvent | null>(null);
export const contactsAtom = atom<string[]>((get) => {
  const follows = get(followsAtom);
  return follows?.tags.filter((t) => t[0] === "p").map((t) => t[1]) ?? [];
});
