import { Flex, Box, Skeleton } from "@chakra-ui/react";

import Event from "@ngine/components/Event";
import { Components } from "@ngine/types";
import useEvent from "@ngine/nostr/useEvent";

interface NEventProps {
  id: string;
  relays?: string[];
  components: Components;
}

export default function NEvent({ id, relays, components }: NEventProps) {
  const event = useEvent(
    {
      ids: [id],
    },
    relays,
  );
  return event ? (
    <Flex my={3} justify="center">
      <Event event={event} components={components} />
    </Flex>
  ) : (
    <Box my={3}>
      <Skeleton height="21px" />
    </Box>
  );
}
