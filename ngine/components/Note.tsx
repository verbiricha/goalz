import {
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardProps,
} from "@chakra-ui/react";
import { NDKKind } from "@nostr-dev-kit/ndk";

import {
  User,
  Markdown,
  Reactions,
  EventProps,
  FormattedRelativeTime,
} from "@ngine/react";

interface NoteProps extends EventProps, CardProps {}

const reactions = [NDKKind.Zap, NDKKind.Repost, NDKKind.Reaction, NDKKind.Text];

// todo: collapsed + read more
// todo: image gallery
export default function Note({
  event,
  components,
  showReactions = true,
  ...rest
}: NoteProps) {
  // todo: replies
  return (
    <Card variant="note" {...rest}>
      <CardHeader>
        <HStack align="center" justify="space-between">
          <User pubkey={event.pubkey} />
          {event.sig && (
            <HStack align="flex-start">
              <Text color="gray.400" fontSize="sm">
                <FormattedRelativeTime timestamp={event.created_at ?? 0} />
              </Text>
            </HStack>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        <Markdown
          content={event.content}
          components={components}
          tags={event.tags}
        />
      </CardBody>
      {showReactions && (
        <CardFooter>
          <Reactions kinds={reactions} event={event} components={components} />
        </CardFooter>
      )}
    </Card>
  );
}
