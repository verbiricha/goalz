import { useMemo } from "react";
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
} from "@chakra-ui/react";

import Amount from "@ngine/components/Amount";
import { zapsSummary, useRanking } from "@ngine/nostr/nip57";

import useGoals from "@goalz/hooks/useGoals";

export default function ProfileStats({ pubkey }: { pubkey: string }) {
  const { zaps, zapsEose } = useGoals();
  const { zapRequests } = zapsSummary(zaps);
  // User contributions
  const contributions = zapRequests.filter((z) => z.pubkey === pubkey);
  const totalZapped = contributions.reduce((acc, z) => acc + z.amount, 0);
  const goalsSupported = useMemo(() => {
    return contributions.reduce(
      (acc, z) => {
        acc.add(z.e || "");
        return acc;
      },
      new Set([]) as Set<string>,
    ).size;
  }, [contributions]);
  // Ranking
  const ranking = useRanking(zaps);
  const rank = ranking.findIndex((r) => r.pubkey === pubkey);
  return (
    <Card variant="elevated">
      <CardBody>
        <StatGroup>
          {/* @ts-ignore */}
          <Stat align="center">
            <StatNumber fontSize="3xl" fontWeight={700}>
              {zapsEose ? goalsSupported : <Spinner />}
            </StatNumber>
            <StatLabel>Funded goals</StatLabel>
          </Stat>

          {/* @ts-ignore */}
          <Stat align="center">
            <StatNumber fontSize="3xl" fontWeight={700}>
              {zapsEose ? <Amount amount={totalZapped} /> : <Spinner />}
            </StatNumber>
            <StatLabel>Zapped</StatLabel>
          </Stat>

          {/* @ts-ignore */}
          <Stat align="center">
            <StatNumber fontSize="3xl" fontWeight={700}>
              {zapsEose ? rank === -1 ? "-" : rank + 1 : <Spinner />}
            </StatNumber>
            <StatLabel>Rank</StatLabel>
          </Stat>
        </StatGroup>
      </CardBody>
    </Card>
  );
}
