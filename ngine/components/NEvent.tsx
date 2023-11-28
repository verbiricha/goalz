import { useMemo, createElement } from "react";
import { Flex } from "@chakra-ui/react";

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
  const component = useMemo(() => {
    // @ts-ignore
    if (event?.kind && components[event.kind]) {
      const element = components[event.kind];
      return (
        <Flex key={event.id} my={3} justify="center">
          {/* @ts-ignore */}
          {createElement(element, { event })}
        </Flex>
      );
    }
    return null;
  }, [event, components]);
  return component;
}
