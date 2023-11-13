import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { Tooltip, Avatar, AvatarProps } from "@chakra-ui/react";

import Link from "./Link";
import useProfile from "../nostr/useProfile";

interface NostrAvatarProps extends AvatarProps {
  pubkey: string;
  tabIndex?: number;
}

export default function NostrAvatar({
  pubkey,
  tabIndex,
  ...rest
}: NostrAvatarProps) {
  const profile = useProfile(pubkey);
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  return (
    <Link href={`/p/${npub}`} tabIndex={tabIndex}>
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
