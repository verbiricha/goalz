import { useAtom } from "jotai";

import { sessionAtom } from "@ngine/state";

export default function useSession() {
  return useAtom(sessionAtom);
}
