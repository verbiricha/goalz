import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Stack, Heading, Text, AvatarGroup } from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import { GoalCard } from "./Goal";
import { GOAL } from "../const";

import useEvents from "@ngine/nostr/useEvents";
import Avatar from "@ngine/components/Avatar";
import { contactsAtom } from "@ngine/state";

interface GoalsFeedProps {
  authors: string[];
}

function GoalsFeed({ authors }: GoalsFeedProps) {
  const { events: goals } = useEvents({
    kinds: [GOAL],
    authors,
  });
  const { events } = useMemo(() => {
    return goals.reduce(
      (acc, ev) => {
        const { seen, events } = acc;
        if (seen.has(ev.pubkey)) {
        } else {
          seen.add(ev.pubkey);
          events.push(ev);
        }
        return { seen, events };
      },
      { seen: new Set(), events: [] } as {
        seen: Set<string>;
        events: NDKEvent[];
      },
    );
  }, [goals]);
  return (
    <Stack gap={4} w="100%">
      <Stack align="center" direction="row" justify="space-between">
        <Heading fontSize="2xl">Contacts</Heading>
        <AvatarGroup size="sm" max={5} spacing="-0.4em">
          {authors.map((pubkey) => (
            <Avatar key={pubkey} pubkey={pubkey} />
          ))}
        </AvatarGroup>
      </Stack>
      <Stack align="center" gap={4}>
        {events.map((e) => (
          <GoalCard key={e.id} event={e} />
        ))}
      </Stack>
    </Stack>
  );
}

export default function Goals() {
  const contacts = useAtomValue(contactsAtom);
  return contacts.length === 0 ? (
    <Text color="gray.500">
      No contacts found, follow some people to see their goals here.
    </Text>
  ) : (
    <GoalsFeed authors={contacts} />
  );
}
