import { Flex, HStack, Heading, Icon } from "@chakra-ui/react";

import Login from "@goalz/components/Login";
import Link from "@goalz/components/Link";
import { Logo } from "@goalz/icons";

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
      <Link variant="nav" href="/">
        <HStack>
          <Icon as={Logo} boxSize={5} />
          <Heading as="h1" fontSize="2xl">
            Heya!
          </Heading>
        </HStack>
      </Link>
      <Flex align="center" gap={{ base: 2, md: 3, lg: 4, xl: 6 }}>
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
