import {
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardProps,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import User from "@ngine/components/User";
import EventMenu from "@ngine/components/EventMenu";
import Markdown from "@ngine/components/Markdown";
import Reactions from "@ngine/components/Reactions";
import FormattedRelativeTime from "@ngine/components/FormattedRelativeTime";
import { Components } from "@ngine/types";

interface NoteProps extends CardProps {
  event: NDKEvent;
  components?: Components;
}

export default function Note({ event, components, ...rest }: NoteProps) {
  return (
    <Card {...rest}>
      <CardHeader>
        <HStack align="center" justify="space-between">
          <User pubkey={event.pubkey} />
          <Text color="gray.400" fontSize="sm">
            <FormattedRelativeTime timestamp={event.created_at ?? 0} />
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <Markdown content={event.content} components={components} />
      </CardBody>
      <CardFooter>
        <HStack align="center" justify="space-between" w="100%">
          <Reactions event={event} />
          <EventMenu event={event} />
        </HStack>
      </CardFooter>
    </Card>
  );
}
