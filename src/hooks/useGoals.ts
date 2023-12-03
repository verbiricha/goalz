import { useMemo } from "react";
import {
  NDKKind,
  NDKEvent,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@nostr-dev-kit/ndk-cache-dexie";

import useEvents from "@ngine/nostr/useEvents";
import { GOAL } from "@goalz/const";

import { dedupeByPubkey } from "@ngine/utils";
import { useNDK } from "@ngine/context";

export default function useGoals() {
  const ndk = useNDK();
  const goals = useLiveQuery(
    () => db.events.where({ kind: GOAL }).toArray(),
    [],
    [],
  );
  const events = useMemo(() => {
    if (!goals) return [];
    return goals.map((ev) => {
      return new NDKEvent(ndk, JSON.parse(ev.event));
    });
  }, [goals]);
  const { eose } = useEvents(
    {
      kinds: [GOAL],
    },
    {
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const authors = useMemo(() => {
    return dedupeByPubkey(goals).map((ev) => ev.pubkey);
  }, [events]);
  const eventIds = useMemo(() => {
    // todo: chunks
    return [events.map((e) => e.id)];
  }, [events]);
  const { eose: zapsEose } = useEvents(
    eventIds.map((es) => {
      return {
        kinds: [NDKKind.Zap],
        "#e": es,
      };
    }),
    {
      disable: !eose,
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const zaps = useLiveQuery(
    () => db.events.where({ kind: NDKKind.Zap }).toArray(),
    [],
    [],
  );
  const zapEvents = useMemo(() => {
    if (!zaps) return [];
    return zaps.map((ev) => {
      return new NDKEvent(ndk, JSON.parse(ev.event));
    });
  }, [zaps]);
  return { goals: events, authors, zaps: zapEvents, eose, zapsEose };
}
