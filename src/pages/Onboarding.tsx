import { Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import Onboarding from "@ngine/components/Onboarding";

import { HOME } from "../routes";

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
