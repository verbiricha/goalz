import { useState } from "react";
import {
  useColorModeValue,
  Stack,
  HStack,
  Heading,
  Text,
  Icon,
  Button,
} from "@chakra-ui/react";

import User from "@ngine/components/User";
import Amount from "@ngine/components/Amount";
import { useRanking } from "@ngine/nostr/nip57";

import useGoals from "@goalz/hooks/useGoals";
import Trophy from "@goalz/icons/Trophy";
import Medal from "@goalz/icons/Medal";

const n = 10;

export default function Ranking() {
  const rankColor = useColorModeValue("gray.600", "gray.400");
  const firstColor = useColorModeValue("orange.500", "orange.300");
  const { zaps } = useGoals();
  const ranking = useRanking(zaps);
  const [maxUsers, setMaxUsers] = useState(n);
  const canSeeMore = maxUsers < ranking.length;

  function seeMore() {
    setMaxUsers(maxUsers + n);
  }

  return (
    <Stack gap={8} w={{ base: "auto", sm: "100%" }}>
      <HStack>
        <Icon as={Trophy} boxSize={6} />
        <Heading>Ranking</Heading>
      </HStack>
      <Stack gap={3}>
        {ranking.slice(0, maxUsers).map(({ pubkey, amount }, idx) => {
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
        {canSeeMore && (
          <Button variant="outline" onClick={seeMore}>
            See more
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
