import { useMemo } from "react";
import { HStack, Text } from "@chakra-ui/react";
import type { AvatarProps } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import useProfile from "../nostr/useProfile";
import Avatar from "./Avatar";
import Link from "./Link";

interface UserProps extends AvatarProps {
  showUsername?: boolean;
  pubkey: string;
}

function shortenPubkey(pk: string) {
  return `${pk.slice(0, 8)}:${pk.slice(-8)}`;
}

export default function User({
  pubkey,
  showUsername = true,
  ...rest
}: UserProps) {
  const profile = useProfile(pubkey);
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  return (
    <Link href={`/p/${npub}`} color="chakra-body-text">
      <HStack>
        <Avatar pubkey={pubkey} size="sm" {...rest} />
        {showUsername && (
          <Text fontSize={rest.fontSize} fontWeight={rest.fontWeight}>
            {profile?.name || shortenPubkey(pubkey)}
          </Text>
        )}
      </HStack>
    </Link>
  );
}
