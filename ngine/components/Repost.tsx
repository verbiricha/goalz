import { Stack, HStack, Icon } from "@chakra-ui/react";

import { Username, Event, EventProps } from "@ngine/react";
import { Repost as RepostIcon } from "@ngine/icons";

interface RepostProps extends EventProps {
  author: string;
}

export default function Repost({ author, ...props }: RepostProps) {
  return (
    <Stack>
      <HStack>
        <Icon as={RepostIcon} />
        <Username pubkey={author} />
      </HStack>
      <Event {...props} />
    </Stack>
  );
}
