import { useMemo } from "react";
import { HStack, Text, Icon } from "@chakra-ui/react";
import {
  NDKEvent,
  NDKKind,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";

import { Zap, Heart, Reply } from "@ngine/icons";
import useEvents from "@ngine/nostr/useEvents";
import { zapsSummary } from "@ngine/nostr/nip57";
import useSession from "@ngine/hooks/useSession";

interface ReactionsProps {
  event: NDKEvent;
  kinds?: NDKKind[];
}

export default function Reactions({
  event,
  kinds = [NDKKind.Zap, NDKKind.Reaction, NDKKind.Text],
}: ReactionsProps) {
  const [session] = useSession();
  const pubkey = session?.pubkey;
  const { events } = useEvents(
    {
      kinds,
      "#e": [event.id],
    },
    {
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const zaps = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Zap),
    [events],
  );
  const reactions = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Reaction),
    [events],
  );
  const replies = useMemo(
    () => events.filter((e) => e.kind === NDKKind.Text),
    [events],
  );
  const { total } = useMemo(() => {
    return zapsSummary(zaps);
  }, [zaps]);

  return (
    <HStack color="gray.500" fontSize="sm" justify="space-between" spacing={6}>
      {kinds.includes(NDKKind.Zap) && (
        <HStack>
          <Icon
            as={Zap}
            color={
              zaps.find((z) => z.pubkey === pubkey)
                ? "brand.500"
                : "currentColor"
            }
          />
          <HStack>
            <Text>{total}</Text>
          </HStack>
        </HStack>
      )}
      {kinds.includes(NDKKind.Reaction) && (
        <HStack>
          <Icon
            as={Heart}
            color={
              reactions.find((ev) => ev.pubkey === pubkey)
                ? "brand.500"
                : "currentColor"
            }
          />
          <Text>{reactions.length}</Text>
        </HStack>
      )}
      {kinds.includes(NDKKind.Text) && (
        <HStack>
          <Icon
            as={Reply}
            color={
              replies.find((ev) => ev.pubkey === pubkey)
                ? "brand.500"
                : "currentColor"
            }
          />
          <Text>{replies.length}</Text>
        </HStack>
      )}
    </HStack>
  );
}
