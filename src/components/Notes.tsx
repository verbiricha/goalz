import { useMemo } from "react";

import { Stack } from "@chakra-ui/react";
import {
  NDKEvent,
  NDKKind,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";

import useEvents from "@ngine/nostr/useEvents";
import { zapsSummary } from "@ngine/nostr/nip57";
import Note from "@ngine/components/Note";

export default function Notes() {
  const { events, eose } = useEvents(
    {
      kinds: [NDKKind.Text],
      "#t": ["habla"],
    },
    {
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const { events: zaps } = useEvents(
    {
      kinds: [NDKKind.Zap],
      "#e": events.map((e) => e.id),
    },
    {
      disable: !eose,
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const { zapRequests } = useMemo(() => {
    return zapsSummary(zaps);
  }, [zaps]);

  function getZappedAmount(ev: NDKEvent) {
    return zapRequests
      .filter((z) => {
        return z.tags.find((t) => t[0] === "e" && t[1] === ev.id);
      })
      .reduce((acc, zr) => {
        return acc + zr.amount;
      }, 0);
  }

  const notes = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const aZaps = getZappedAmount(a);
        const bZaps = getZappedAmount(b);
        return bZaps - aZaps;
      })
      .slice(0, 3);
  }, [events, zaps]);

  return (
    <Stack>
      {notes.map((e) => (
        <Note key={e.id} event={e} />
      ))}
    </Stack>
  );
}
