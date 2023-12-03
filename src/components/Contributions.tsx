import {
  useColorModeValue,
  Stack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Text,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import User from "@ngine/components/User";
import Amount from "@ngine/components/Amount";
import { zapsSummary } from "@ngine/nostr/nip57";

import { GoalSummary } from "@goalz/components/Goal";

interface ContributionsProps {
  goals: NDKEvent[];
  zaps: NDKEvent[];
  pubkey: string;
}

export default function Contributions({
  goals,
  zaps,
  pubkey,
}: ContributionsProps) {
  const { zapRequests } = zapsSummary(zaps);
  // User contributions
  const contributions = zapRequests.filter((z) => z.pubkey === pubkey);
  const msgColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Stack gap={5}>
      {contributions
        .sort((a, b) => b.created_at - a.created_at)
        .map((z) => {
          const { id, amount, e, content } = z;
          const event = goals.find((ev) => ev.id === e);
          return event ? (
            <Card key={id}>
              <CardHeader>
                <HStack key={id} justify="space-between">
                  <User size="xs" pubkey={z.pubkey} />
                  <Text fontSize="2xl" fontWeight={700}>
                    <Amount amount={amount} />
                  </Text>
                  {z.p && <User size="xs" pubkey={z.p} />}
                </HStack>
              </CardHeader>
              <CardBody>
                <Stack gap={4}>
                  <GoalSummary event={event} />
                  {content.length > 0 && (
                    <Text
                      as="blockquote"
                      fontSize={{ base: "sm", md: "md" }}
                      color={msgColor}
                      sx={{
                        borderLeft: "2px solid",
                        borderColor: "gray.300",
                        paddingLeft: 2,
                      }}
                    >
                      {content}
                    </Text>
                  )}
                </Stack>
              </CardBody>
            </Card>
          ) : null;
        })}
    </Stack>
  );
}
