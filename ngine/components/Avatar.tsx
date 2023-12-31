import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { Tooltip, Avatar, AvatarProps } from "@chakra-ui/react";

import useProfile from "@ngine/nostr/useProfile";
import { useLink, useLinkComponent } from "@ngine/context";

interface NostrAvatarProps extends AvatarProps {
  pubkey: string;
  tabIndex?: number;
}

export default function NostrAvatar({
  pubkey,
  tabIndex,
  ...rest
}: NostrAvatarProps) {
  const Link = useLinkComponent();
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  const url = useLink("npub", npub);
  const profile = useProfile(pubkey);
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
