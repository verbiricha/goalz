import { useAtom } from "jotai";

import { relaysAtom } from "@ngine/state";

export default function useRelays() {
  return useAtom(relaysAtom);
}
