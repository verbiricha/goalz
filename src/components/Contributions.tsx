import {
  useColorModeValue,
  Stack,
  HStack,
  Card,
  CardBody,
  Text,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import Amount from "@ngine/components/Amount";
import { ZapRequest } from "@ngine/nostr/nip57";

import { GoalSummary } from "@goalz/components/Goal";

interface ContributionsProps {
  goals: NDKEvent[];
  contributions: ZapRequest[];
}

export function Contributions({ goals, contributions }: ContributionsProps) {
  const msgColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Stack gap={5}>
      {contributions
        .sort((a, b) => b.created_at - a.created_at)
        .map((z) => {
          const { id, amount, e, content } = z;
          const event = goals.find((ev) => ev.id === e);
          return event ? (
            <Card variant="outline" key={id}>
              <CardBody>
                <Stack gap={4}>
                  <HStack key={id} justify="space-between">
                    <GoalSummary event={event} />
                    <Text fontSize="3xl" fontWeight={700}>
                      <Amount amount={amount} />
                    </Text>
                  </HStack>
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
