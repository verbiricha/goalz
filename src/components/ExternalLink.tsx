import { useMemo } from "react";
import { Link, Icon } from "@chakra-ui/react";
import type { LinkProps } from "@chakra-ui/react";

import { Link as LinkIcon } from "@ngine/icons";

export default function ExternalLink({ href, ...rest }: LinkProps) {
  const text = useMemo(() => {
    try {
      const url = new URL(href ?? "");
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      return null;
    }
  }, [href]);
  return text ? (
    <Link href={href} isExternal {...rest}>
      <Icon as={LinkIcon} boxSize={3} color="gray.900" /> {text}
    </Link>
  ) : null;
}
