import { useMemo } from "react";
import {
  NDKEvent,
  NDKFilter,
  NDKKind,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";

import { zapsSummary, ZapRequest } from "@ngine/nostr/nip57";
import useEvents from "./useEvents";

export type ReactionEvents = {
  events: NDKEvent[];
  zaps: {
    zapRequests: ZapRequest[];
    total: number;
  };
  reactions: NDKEvent[];
  replies: NDKEvent[];
  reposts: NDKEvent[];
};

export function useReactions(
  event: NDKEvent,
  kinds: NDKKind[],
): ReactionEvents {
  const [t, id] = useMemo(() => event.tagReference(), [event]);
  const filter = useMemo(() => {
    return {
      kinds,
      [`#${t}`]: [id],
    } as NDKFilter;
  }, [t, id, kinds]);
  const { events } = useEvents(filter, {
    closeOnEose: false,
    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
  });
  const zaps = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Zap),
    [events],
  );
  const { zapRequests, total } = useMemo(() => zapsSummary(zaps), [zaps]);
  const reactions = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Reaction),
    [events],
  );
  const replies = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Text),
    [events],
  );
  const reposts = useMemo(
    () =>
      events.filter(
        (e) => e.kind === NDKKind.Repost || e.kind === NDKKind.GenericRepost,
      ),
    [events],
  );
  return {
    events,
    zaps: {
      zapRequests,
      total,
    },
    reactions,
    replies,
    reposts,
  };
}
