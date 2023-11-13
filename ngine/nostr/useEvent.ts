import { useState, useEffect } from "react";

import {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";

import { useNDK } from "@ngine/context";

export default function useEvents(filter: NDKFilter, relays?: string[]) {
  const ndk = useNDK();
  const [event, setEvent] = useState<NDKEvent | null>(null);

  useEffect(() => {
    const relaySet = relays
      ? NDKRelaySet.fromRelayUrls(relays, ndk)
      : undefined;
    ndk
      .fetchEvent(
        filter,
        {
          cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST,
        },
        relaySet,
      )
      .then(setEvent);
  }, []);

  return event;
}
