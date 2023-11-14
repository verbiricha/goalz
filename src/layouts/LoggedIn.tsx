import { Flex, Stack, Heading } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import useSession from "@ngine/hooks/useSession";

import LoginDialog from "@goalz/components/LoginDialog";

// todo: get relays and contacts
function LoggedInLayout() {
  return <Outlet />;
}

export default function LoggedIn() {
  const [session] = useSession();
  return session ? (
    <LoggedInLayout />
  ) : (
    <Flex w={{ base: "xs", sm: "sm", md: "xl", lg: "2xl" }}>
      <Stack>
        <Heading>Log in first</Heading>
        <LoginDialog />
      </Stack>
    </Flex>
  );
}
