import { useMemo } from "react";
import {
  useColorModeValue,
  Flex,
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  Icon,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
} from "@chakra-ui/react";

import User from "@ngine/components/User";
import Amount from "@ngine/components/Amount";
import { zapsSummary, useRanking } from "@ngine/nostr/nip57";
import { dedupeByPubkey } from "@ngine/utils";

import useGoals from "@goalz/hooks/useGoals";
import Trophy from "@goalz/icons/Trophy";
import Medal from "@goalz/icons/Medal";

export default function Ranking() {
  const rankColor = useColorModeValue("gray.600", "gray.400");
  const firstColor = useColorModeValue("orange.500", "orange.300");
  const { goals, authors, zaps, eose, zapsEose } = useGoals();
  const ranking = useRanking(zaps);
  const { zapRequests, total } = useMemo(() => {
    return zapsSummary(zaps);
  }, [zaps]);
  const zappers = useMemo(() => {
    return dedupeByPubkey(zapRequests);
  }, [zapRequests]);
  return (
    <Stack gap={8} w={{ base: "auto", sm: "100%" }}>
      <HStack>
        <Icon as={Trophy} boxSize={6} />
        <Heading>Ranking</Heading>
      </HStack>
      <Stack gap={3} w="100%">
        {ranking.length === 0 && (
          <Box>
            <Skeleton height="40px" />
          </Box>
        )}
        {ranking.slice(0, 9).map(({ pubkey, amount }, idx) => {
          return (
            <HStack key={pubkey} gap={12} justify="space-between">
              <HStack gap={4}>
                {idx === 0 ? (
                  <Icon as={Medal} boxSize={5} color={firstColor} />
                ) : (
                  <Text fontSize="3xl" color={rankColor}>
                    {idx + 1}
                  </Text>
                )}
                <User pubkey={pubkey} />
              </HStack>
              <Text fontSize="xl" fontWeight={600}>
                <Amount amount={amount} />
              </Text>
            </HStack>
          );
        })}
      </Stack>
      <Card variant="elevated">
        <CardBody>
          <Flex direction={{ base: "column", md: "row" }} gap={6} wrap="wrap">
            {/* @ts-ignore */}
            <Stat align="center">
              <StatNumber fontSize="4xl">{goals.length}</StatNumber>
              <StatLabel fontSize="xl">Goals</StatLabel>
              {eose ? (
                <StatHelpText>{authors.length} authors</StatHelpText>
              ) : (
                <StatHelpText>Fetching goals</StatHelpText>
              )}
            </Stat>
            {/* @ts-ignore */}
            <Stat align="center">
              <StatNumber fontSize="4xl">{zapRequests.length}</StatNumber>
              <StatLabel fontSize="xl">Contributions</StatLabel>
              {zapsEose ? (
                <StatHelpText>{zappers.length} contributors</StatHelpText>
              ) : (
                <StatHelpText>Fetching zaps</StatHelpText>
              )}
            </Stat>
            {/* @ts-ignore */}
            <Stat align="center">
              <StatNumber fontSize="4xl">
                <Amount amount={total} />
              </StatNumber>
              <StatLabel fontSize="xl">Total</StatLabel>
            </Stat>
          </Flex>
        </CardBody>
      </Card>
    </Stack>
  );
}
