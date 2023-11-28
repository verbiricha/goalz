import { HStack, Card, CardBody, CardHeader, Text } from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import User from "@ngine/components/User";
import { formatRelativeTime } from "@ngine/format";

interface NoteProps {
  event: NDKEvent;
}

export default function Note({ event }: NoteProps) {
  return (
    <Card w="md">
      <CardHeader>
        <HStack justify="space-between">
          <User pubkey={event.pubkey} />
          <Text color="gray.500" fontSize="sm">
            {formatRelativeTime(event.created_at)}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text>{event.content}</Text>
      </CardBody>
    </Card>
  );
}
