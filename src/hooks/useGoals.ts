import { useMemo } from "react";
import { NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

import useEvents from "@ngine/nostr/useEvents";
import { GOAL } from "@goalz/const";

import { dedupeByPubkey } from "@ngine/utils";

export default function useGoals() {
  const { events, eose } = useEvents(
    {
      kinds: [GOAL],
    },
    {
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const authors = useMemo(() => {
    return dedupeByPubkey(events);
  }, [events]);
  const eventIds = useMemo(() => {
    // todo: chunks
    return [events.map((e) => e.id)];
  }, [events]);
  const { events: zaps, eose: zapsEose } = useEvents(
    eventIds.map((es) => {
      return {
        kinds: [NDKKind.Zap],
        "#e": es,
      };
    }),
    {
      disable: !eose,
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  return { goals: events, authors, zaps, eose, zapsEose };
}
