import { Flex, Text } from "@chakra-ui/react";

import Link from "@goalz/components/Link";

const fontSize = "xs";

export default function Footer() {
  return (
    <Flex
      as="footer"
      align="center"
      justify="space-around"
      py={12}
      w="100%"
      maxW="1440px"
      px={{
        base: 4,
        md: 16,
      }}
      gap={2}
      direction={{
        base: "column",
        md: "row",
      }}
    >
      <Text color="gray.500" fontSize={fontSize}>
        Made possible by{" "}
        <Link href="https://opensats.org" isExternal>
          OpenSats
        </Link>
      </Text>
      {/*
      <Link variant="nav" href="/privacy" fontSize={fontSize}>
        Privacy policy
      </Link>
      <Link variant="nav" href="/terms" fontSize={fontSize}>
        Terms & Conditions
      </Link>
      */}
      <Link
        variant="nav"
        href="https://github.com/verbiricha/goalz"
        isExternal
        fontSize={fontSize}
      >
        Source code
      </Link>
    </Flex>
  );
}
