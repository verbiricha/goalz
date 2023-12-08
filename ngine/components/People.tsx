import { AvatarGroup, AvatarGroupProps } from "@chakra-ui/react";

import { Avatar } from "@ngine/react";

interface PeopleProps extends Omit<AvatarGroupProps, "children"> {
  pubkeys: string[];
}

export default function People({ pubkeys, ...rest }: PeopleProps) {
  return (
    <AvatarGroup size="sm" max={3} spacing="-0.5rem" {...rest}>
      {pubkeys.map((pk) => (
        <Avatar key={pk} pubkey={pk} />
      ))}
    </AvatarGroup>
  );
}
