import { Flex, HStack } from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import { GoalCard } from "./Goal";

interface FeaturedGoalsProps {
  events: NDKEvent[];
}

export default function FeaturedGoals({ events }: FeaturedGoalsProps) {
  return (
    <Flex w="100vw" justify="center" px={4}>
      <HStack
        spacing={5}
        py={2}
        sx={{
          overflowX: "scroll",
          flexWrap: "nowrap",
          "-webkit-overflow-scrolling": "touch",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {events.map((ev) => (
          <GoalCard key={ev.id} event={ev} flex="0 0 auto" />
        ))}
      </HStack>
    </Flex>
  );
}
