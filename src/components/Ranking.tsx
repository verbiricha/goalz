import { useState } from "react";
import {
  useColorModeValue,
  Stack,
  HStack,
  Heading,
  Text,
  Icon,
  IconProps,
  Button,
} from "@chakra-ui/react";

import User from "@ngine/components/User";
import Amount from "@ngine/components/Amount";
import { useRanking } from "@ngine/nostr/nip57";

import useGoals from "@goalz/hooks/useGoals";
import Trophy from "@goalz/icons/Trophy";
import Medal from "@goalz/icons/Medal";

const n = 9;

export function Rank1Icon(props: IconProps) {
  const firstColor = useColorModeValue("orange.500", "orange.300");
  return <Icon as={Medal} boxSize={5} color={firstColor} {...props} />;
}

export default function Ranking() {
  const rankColor = useColorModeValue("gray.600", "gray.400");
  const { zaps } = useGoals();
  const ranking = useRanking(zaps);
  const [maxUsers, setMaxUsers] = useState(n);
  const canSeeMore = maxUsers < ranking.length;

  function seeMore() {
    setMaxUsers(maxUsers + n);
  }

  return (
    <Stack
      gap={8}
      w={{
        base: "xs",
        md: "md",
        lg: "lg",
      }}
    >
      <HStack>
        <Icon as={Trophy} boxSize={6} />
        <Heading>Ranking</Heading>
      </HStack>
      <Stack gap={3}>
        {ranking.slice(0, maxUsers).map(({ pubkey, amount }, idx) => {
          return (
            <HStack key={pubkey} gap={12} justify="space-between">
              <HStack gap={4}>
                <Text fontSize="3xl" color={rankColor}>
                  {idx + 1}.
                </Text>
                <HStack>
                  <User pubkey={pubkey} />
                  {idx === 0 && <Rank1Icon />}
                </HStack>
              </HStack>
              <Text fontSize="xl" fontWeight={600}>
                <Amount amount={amount} />
              </Text>
            </HStack>
          );
        })}
        {canSeeMore && (
          <Button
            mt={3}
            variant="outline"
            colorScheme="brand"
            onClick={seeMore}
          >
            See more
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
