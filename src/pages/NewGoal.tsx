import { Flex } from "@chakra-ui/react";

import NewGoal from "@goalz/components/NewGoal";

export default function NewGoalPage() {
  return (
    <Flex
      w={{
        base: "xs",
        md: "md",
        lg: "4xl",
      }}
    >
      <NewGoal />
    </Flex>
  );
}
