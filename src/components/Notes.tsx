import { Stack, HStack, Heading } from "@chakra-ui/react";
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

import useEvents from "@ngine/nostr/useEvents";
import Note from "@ngine/components/Note";

import { GOAL } from "@goalz/const";
import { GoalCard } from "@goalz/components/Goal";

interface NotesProps {
  ids: string[];
}

export default function Notes({ ids }: NotesProps) {
  const { events } = useEvents(
    {
      ids,
    },
    {
      closeOnEose: true,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const components = {
    [GOAL]: GoalCard,
  };

  return (
    <Stack align="center" gap={8}>
      <Heading textAlign="center">What people are saying about us!</Heading>
      <HStack
        align="flex-start"
        justify="center"
        w={{ base: "xs", sm: "sm", xl: "6xl" }}
        gap={4}
        wrap="wrap"
      >
        {events.map((e) => (
          <Note maxW="410px" key={e.id} event={e} components={components} />
        ))}
      </HStack>
    </Stack>
  );
}
