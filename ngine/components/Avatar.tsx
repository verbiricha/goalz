import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { Tooltip, Avatar, AvatarProps } from "@chakra-ui/react";

import Link from "./Link";
import useProfile from "../nostr/useProfile";

interface NostrAvatarProps extends AvatarProps {
  link?: string;
  pubkey: string;
  tabIndex?: number;
}

export default function NostrAvatar({
  link,
  pubkey,
  tabIndex,
  ...rest
}: NostrAvatarProps) {
  const profile = useProfile(pubkey);
  const url = useMemo(() => {
    if (link) return link;
    return `/p/${nip19.npubEncode(pubkey)}`;
  }, [pubkey, link]);
  return (
    <Link href={url} tabIndex={tabIndex}>
      <Tooltip label={profile?.name || pubkey}>
        <Avatar
          name={profile?.name || pubkey}
          src={profile?.image}
          size="xs"
          {...rest}
        />
      </Tooltip>
    </Link>
  );
}
