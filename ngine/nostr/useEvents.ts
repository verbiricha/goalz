import { useState, useEffect, useMemo } from "react";
import { sha256 } from "@noble/hashes/sha256";

import {
  NDKEvent,
  NDKFilter,
  NDKRelaySet,
  NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { uniqBy } from "lodash";

import { useNDK } from "@ngine/context";

interface MyObject {
  [key: string]: any;
}

export function hash(obj: MyObject): string {
  const jsonString = JSON.stringify(obj);

  const hashBuffer = sha256(new TextEncoder().encode(jsonString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

interface SubscriptionOptions extends NDKSubscriptionOptions {
  disable?: boolean;
}

export default function useEvents(
  filter: NDKFilter | NDKFilter[],
  opts?: SubscriptionOptions,
  relays?: string[],
) {
  const ndk = useNDK();
  const [eose, setEose] = useState(false);
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const id = useMemo(() => {
    return hash(filter);
  }, [filter]);

  useEffect(() => {
    if (filter && !opts?.disable) {
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
  }, [id, opts?.disable]);

  return { id, eose, events };
}
