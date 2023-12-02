import { useMemo } from "react";
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

import { SUPPORT } from "@goalz/const";

import useEvents from "@ngine/nostr/useEvents";
import { dedupeByPubkey } from "@ngine/utils";

export default function useSupporters(pubkey: string) {
  const { events, eose } = useEvents(
    {
      kinds: [SUPPORT],
      "#p": [pubkey],
    },
    {
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const supporters = useMemo(() => {
    return dedupeByPubkey(events).sort(
      (a, b) =>
        Number(b.tagValue("amount") ?? 0) - Number(a.tagValue("amount") ?? 0),
    );
  }, [events]);

  return { events: supporters, eose };
}
