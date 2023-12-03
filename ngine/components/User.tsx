import { useMemo } from "react";
import { HStack, Text } from "@chakra-ui/react";
import type { AvatarProps } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import Avatar from "@ngine/components/Avatar";
import useProfile from "@ngine/nostr/useProfile";
import { useLink, useLinkComponent } from "@ngine/context";

interface UserProps extends AvatarProps {
  pubkey: string;
}

function shortenPubkey(pk: string) {
  return `${pk.slice(0, 8)}`;
}

export default function User({ pubkey, ...rest }: UserProps) {
  const Link = useLinkComponent();
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  const url = useLink("npub", npub);
  const profile = useProfile(pubkey);
  return (
    <Link href={url}>
      <HStack>
        <Avatar pubkey={pubkey} size="sm" {...rest} />
        <Text
          color="chakra-body-text"
          fontSize={rest.fontSize}
          fontWeight={rest.fontWeight}
        >
          {profile?.display_name || profile?.name || shortenPubkey(pubkey)}
        </Text>
      </HStack>
    </Link>
  );
}
