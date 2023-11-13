import { Flex } from "@chakra-ui/react";

import NewGoal from "../components/NewGoal";

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
