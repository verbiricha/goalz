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
import { formatRelativeTime } from "@ngine/format";
import { Components } from "@ngine/types";

interface NoteProps extends CardProps {
  event: NDKEvent;
  components?: Components;
}

export default function Note({ event, components, ...rest }: NoteProps) {
  return (
    <Card {...rest}>
      <CardHeader>
        <HStack align="flex-start" justify="space-between">
          <HStack align="center">
            <User pubkey={event.pubkey} fontSize="sm" />
            <Text color="gray.400" fontSize="sm">
              {formatRelativeTime(event.created_at ?? 0)}
            </Text>
          </HStack>
          <EventMenu event={event} />
        </HStack>
      </CardHeader>
      <CardBody>
        <Markdown content={event.content} components={components} />
      </CardBody>
      <CardFooter>
        <Reactions event={event} />
      </CardFooter>
    </Card>
  );
}
