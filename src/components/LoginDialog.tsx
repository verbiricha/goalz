import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useToast,
  Stack,
  Heading,
  Text,
  Button,
  Divider,
} from "@chakra-ui/react";

import Link from "@ngine/components/Link";
import { useExtensionLogin } from "@ngine/context";
import { ONBOARDING } from "../routes";

interface LoginDialogProps {
  onLogin?: () => void;
  onOnboarding?: () => void;
}

export default function LoginDialog({
  onLogin,
  onOnboarding,
}: LoginDialogProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const [isBusy, setIsBusy] = useState(false);
  const extensionLogIn = useExtensionLogin();

  async function loginWithExtension() {
    try {
      setIsBusy(true);
      const user = await extensionLogIn();
      if (user) {
        onLogin && onLogin();
      }
    } catch (error) {
      toast({
        title: "Could not sign in",
        status: "error",
        description: (error as Error)?.message,
      });
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  function startOnboarding() {
    onOnboarding && onOnboarding();
    navigate(ONBOARDING);
  }

  return (
    <Stack>
      <Heading fontSize="xl">I already have an account</Heading>
      <Text>
        You can use a nostr extension to log in to the site. If you don't have
        one we recommend using{" "}
        <Link isExternal href="https://getalby.com">
          Alby
        </Link>{" "}
        or{" "}
        <Link
          isExternal
          href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
        >
          nos2x
        </Link>
        .
      </Text>
      <Button
        isLoading={isBusy}
        isDisabled={!window.nostr}
        variant="solid"
        colorScheme="brand"
        onClick={loginWithExtension}
      >
        Log in with extension
      </Button>
      <Divider my={3} />
      <Heading fontSize="xl">I'm new</Heading>
      <Text>Don't worry, you can create an account in under a minute!</Text>
      <Button variant="solid" colorScheme="orange" onClick={startOnboarding}>
        Create account
      </Button>
    </Stack>
  );
}
