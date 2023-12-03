import { useMemo } from "react";
import {
  Card,
  CardBody,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { db } from "@nostr-dev-kit/ndk-cache-dexie";

import Amount from "@ngine/components/Amount";
import useGoals from "@goalz/hooks/useGoals";
import { GOAL } from "@goalz/const";

import { zapsSummary } from "@ngine/nostr/nip57";
import { dedupeByPubkey } from "@ngine/utils";

function Contributions({ events }: { events: NDKEvent[] }) {
  const { zapRequests, total } = useMemo(() => {
    return zapsSummary(events);
  }, [events]);
  const zappers = useMemo(() => {
    return dedupeByPubkey(zapRequests);
  }, [zapRequests]);
  return (
    <>
      {/* @ts-ignore */}
      <Stat align="center">
        <StatNumber fontSize="4xl">{events.length}</StatNumber>
        <StatLabel fontSize="xl">Contributions</StatLabel>
        <StatHelpText>{zappers.length} contributors</StatHelpText>
      </Stat>
      {/* @ts-ignore */}
      <Stat align="center">
        <StatNumber fontSize="4xl">
          <Amount amount={total} />
        </StatNumber>
        <StatLabel fontSize="xl">Total</StatLabel>
      </Stat>
    </>
  );
}

export default function Stats() {
  const { zaps } = useGoals();
  const goalsAmount = useLiveQuery(() =>
    db.events.where({ kind: GOAL }).count(),
  );
  const goalAuthors = useLiveQuery(
    async () => {
      const goals = await db.events.where({ kind: GOAL }).toArray();
      return dedupeByPubkey(goals);
    },
    [],
    [],
  );
  return (
    <Card variant="elevated">
      <CardBody>
        <Flex direction={{ base: "column", md: "row" }} gap={6} wrap="wrap">
          {/* @ts-ignore */}
          <Stat align="center">
            <StatNumber fontSize="4xl">{goalsAmount}</StatNumber>
            <StatLabel fontSize="xl">Goals</StatLabel>
            <StatHelpText>{goalAuthors.length} authors</StatHelpText>
          </Stat>
          <Contributions events={zaps} />
        </Flex>
      </CardBody>
    </Card>
  );
}
