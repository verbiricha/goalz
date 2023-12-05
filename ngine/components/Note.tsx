import {
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardProps,
} from "@chakra-ui/react";

import User from "@ngine/components/User";
import EventMenu from "@ngine/components/EventMenu";
import Markdown from "@ngine/components/Markdown";
import Reactions from "@ngine/components/Reactions";
import FormattedRelativeTime from "@ngine/components/FormattedRelativeTime";
import { EventProps } from "@ngine/types";

interface NoteProps extends EventProps, CardProps {}

// todo: collapsed + read more
// todo: image gallery
export default function Note({
  event,
  components,
  showReactions = true,
}: NoteProps) {
  return (
    <Card>
      <CardHeader>
        <HStack align="center" justify="space-between">
          <HStack>
            <User pubkey={event.pubkey} />
            {event.sig && (
              <Text color="gray.400" fontSize="sm">
                <FormattedRelativeTime timestamp={event.created_at ?? 0} />
              </Text>
            )}
          </HStack>
          {event.sig && <EventMenu event={event} />}
        </HStack>
      </CardHeader>
      <CardBody>
        <Markdown content={event.content} components={components} />
      </CardBody>
      {showReactions && (
        <CardFooter>
          <Reactions event={event} components={components} />
        </CardFooter>
      )}
    </Card>
  );
}
