import { Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { HOME } from "@goalz/routes";

import Onboarding from "@ngine/components/Onboarding";

export default function OnboardingPage() {
  const navigate = useNavigate();
  function onFinish() {
    navigate(HOME);
  }
  return (
    <Flex
      align="center"
      justify="center"
      w={{
        base: "xs",
        md: "md",
      }}
    >
      <Onboarding onFinish={onFinish} />
    </Flex>
  );
}
