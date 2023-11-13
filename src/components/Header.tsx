import { Flex } from "@chakra-ui/react";

import Link from "@ngine/components/Link";
import Rates from "./Rates";
import Login from "./Login";

export default function Header() {
  return (
    <Flex
      as="header"
      px={[4, 16]}
      w="100%"
      maxW="1440px"
      py={4}
      align="center"
      justify="space-between"
    >
      <Link variant="nav" fontSize="2xl" href="/">
        Goalz
      </Link>
      <Flex align="center" gap={{ base: 2, md: 3, lg: 4, xl: 6 }}>
        <Rates />
        <Login />
      </Flex>
      {/*
        <Link variant="nav" href="/faq" fontSize="sm">
          How it works
        </Link>
        <Link variant="nav" href="/new" fontSize="sm">
          Start a zap goal
        </Link>
      */}
    </Flex>
  );
}
