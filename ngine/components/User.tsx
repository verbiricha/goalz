import { useMemo } from "react";
import { HStack, Text } from "@chakra-ui/react";
import type { AvatarProps } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import useProfile from "../nostr/useProfile";
import Avatar from "./Avatar";
import Link from "./Link";

interface UserProps extends AvatarProps {
  link?: string;
  pubkey: string;
}

function shortenPubkey(pk: string) {
  return `${pk.slice(0, 8)}:${pk.slice(-8)}`;
}

export default function User({ link, pubkey, ...rest }: UserProps) {
  const profile = useProfile(pubkey);
  const url = useMemo(() => {
    if (link) return link;
    return `/p/${nip19.npubEncode(pubkey)}`;
  }, [pubkey, link]);
  return (
    <Link href={url} color="chakra-body-text">
      <HStack>
        <Avatar link={link} pubkey={pubkey} size="sm" {...rest} />
        <Text fontSize={rest.fontSize} fontWeight={rest.fontWeight}>
          {profile?.name || shortenPubkey(pubkey)}
        </Text>
      </HStack>
    </Link>
  );
}
