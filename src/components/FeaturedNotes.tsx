import { Stack, HStack, Heading } from "@chakra-ui/react";
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

import useEvents from "@ngine/nostr/useEvents";
import Note from "@ngine/components/Note";

import { GOAL } from "@goalz/const";
import { GoalCard } from "@goalz/components/Goal";

export default function FeaturedNotes() {
  const { events } = useEvents(
    {
      ids: [
        "ee5bd8c438291b1d803225a691ffd61e96cda41d492eea7d8b03190a8c9144a6",
        "b0e513cfbafa8bf14fe7ad47a27436cee43ace712d50b1568077f451b7c3545c",
        //    "4ca5eaab346be090ace27b1e2cccafb1729d92a1e83a183a875fe79ef0eefcbf",
      ],
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
          <Note minW="320px" maxW="410px" event={e} components={components} />
        ))}
      </HStack>
    </Stack>
  );
}
