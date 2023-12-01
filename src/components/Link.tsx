import { Link as ReactRouterLink } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";
import type { LinkProps } from "@chakra-ui/react";

export default function Link({ href, children, ...rest }: LinkProps) {
  return (
    <ChakraLink as={ReactRouterLink} to={href} {...rest}>
      {children}
    </ChakraLink>
  );
}
