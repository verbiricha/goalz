import { Flex, HStack } from "@chakra-ui/react";

import useEvents from "@ngine/nostr/useEvents";
import { GOAL } from "@ngine/const";

import { GoalCard } from "./Goal";

export default function FeaturedGoals() {
  const { events } = useEvents({
    kinds: [GOAL],
    ids: [
      "ebe64e839a6f8391bdfd0d7d8950588f296e8e00eb271cda36e3d1af610e9732",
      "bd3b899997cd4ce115532a84eabe598bb7547cab8f44b06812b2306d64761096",
      "9b734bc67402c034857ec3f2ecd8e74d61d38f46505067c5e53986cf70a0c4f6",
      "25ade1845b93c5cd47d7b2c3f1bc622ada3bada5b87a0fd3714fd5a089d868c4",
      "060f4f06455ee0a87db48f7d5f23b532bcc133cea7dd3bc9f2a20226f1bf2705",
    ],
  });
  // todo: scale on hover
  return (
    <Flex w="100vw" justify="center" px={4}>
      <HStack
        spacing={5}
        py={2}
        sx={{
          overflowX: "auto",
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
