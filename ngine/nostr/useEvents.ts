import { useState, useEffect } from "react";

import {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { uniqBy } from "lodash";

import { useNDK } from "@ngine/context";

export default function useEvents(
  filter: NDKFilter | NDKFilter[],
  opts?: NDKSubscriptionOptions,
  relays?: string[],
) {
  const ndk = useNDK();
  const [eose, setEose] = useState(false);
  const [events, setEvents] = useState<NDKEvent[]>([]);

  useEffect(() => {
    if (filter) {
      const relaySet = relays
        ? NDKRelaySet.fromRelayUrls(relays, ndk)
        : undefined;
      const sub = ndk.subscribe(filter, opts, relaySet);
      sub.on("event", (ev: NDKEvent) => {
        setEvents((evs) =>
          uniqBy(evs.concat([ev]), (e: NDKEvent) => e.id).sort(
            (a, b) => (b.created_at ?? 0) - (a.created_at ?? 0),
          ),
        );
      });
      sub.on("eose", () => {
        setEose(true);
      });
      return () => {
        sub.stop();
      };
    }
  }, []);

  return { eose, events };
}
