import { Flex } from "@chakra-ui/react";

import Ranking from "@goalz/components/Ranking";

export default function RankingPage() {
  return (
    <Flex
      align="center"
      justify="center"
      w={{
        base: "xs",
        md: "md",
        lg: "lg",
      }}
    >
      <Ranking />
    </Flex>
  );
}
