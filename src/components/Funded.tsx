import { useMemo } from "react";
import { Stack, HStack, Text, AvatarGroup } from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import Amount from "@ngine/components/Amount";
import Avatar from "@ngine/components/Avatar";
import { zapsSummary } from "@ngine/nostr/nip57";

import { GoalSummary } from "@goalz/components/Goal";

interface FundedProps {
  goals: NDKEvent[];
  zaps: NDKEvent[];
  pubkey: string;
}

function groupBy<T>(
  array: T[],
  keyFunction: (item: T) => string,
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFunction(item);
      if (!acc[key]) {
        acc[key] = [item];
      } else {
        acc[key].push(item);
      }

      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export default function Funded({ goals, zaps, pubkey }: FundedProps) {
  const { zapRequests } = zapsSummary(zaps);
  // User contributions
  const contributions = zapRequests.filter((z) => z.pubkey === pubkey);
  const funded = useMemo(() => {
    const goalAndAmount = contributions
      .map((z) => {
        const { e, amount } = z;
        const goal = goals.find((ev) => ev.id === e);
        return { goal, amount, zap: z };
      })
      .filter((t) => t.goal);
    return groupBy(goalAndAmount, ({ goal }) => goal?.id ?? "");
  }, [contributions]);
  return (
    <Stack gap={5}>
      {Object.entries(funded).map((item) => {
        const [id, zaps] = item;
        const amount = zaps.reduce((acc, z) => acc + z.amount, 0);
        const authors = [...new Set(zaps.map((z) => z.zap.p))];
        const event = goals.find((ev) => ev.id === id);
        return event ? (
          <HStack align="flex-start" justify="space-between" gap={12}>
            <Stack>
              <GoalSummary event={event} />
              <AvatarGroup size="xs" max={5} spacing="-0.4em">
                {authors.map((pk) =>
                  pk ? <Avatar key={pk} pubkey={pk} /> : null,
                )}
              </AvatarGroup>
            </Stack>
            <Text fontSize="2xl" fontWeight={700}>
              <Amount amount={amount} />
            </Text>
          </HStack>
        ) : null;
      })}
    </Stack>
  );
}
