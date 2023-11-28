import { Stack, Heading, Text } from "@chakra-ui/react";

import { GoalCard } from "@goalz/components/Goal";
import { GOAL } from "@goalz/const";

import useEvents from "@ngine/nostr/useEvents";

interface HashtagProps {
  tag: string;
}

export default function Hashtag({ tag }: HashtagProps) {
  const { events, eose } = useEvents({
    kinds: [GOAL],
    "#t": [tag],
  });
  return (
    <Stack gap={4} w="100%">
      <Heading fontSize="3xl">#{tag}</Heading>
      <Stack align="center" gap={4}>
        {events.map((e) => (
          <GoalCard key={e.id} event={e} />
        ))}
      </Stack>
      {eose && events.length === 0 && <Text>No goals found</Text>}
    </Stack>
  );
}
