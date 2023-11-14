import { Flex } from "@chakra-ui/react";

import Goals from "@goalz/components/Goals";

export default function AllPage() {
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
      <Goals />
    </Flex>
  );
}
