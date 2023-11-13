import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { Button } from "@chakra-ui/react";
import type { ButtonProps } from "@chakra-ui/react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import { followsAtom } from "@ngine/state";
import { useNDK } from "@ngine/context";
import useSession from "@ngine/hooks/useSession";
import { unixNow } from "@ngine/time";

interface FollowButtonProps extends ButtonProps {
  pubkey: string;
}

export default function FollowButton({ pubkey, ...rest }: FollowButtonProps) {
  const ndk = useNDK();
  const [isBusy, setIsBusy] = useState(false);
  const [session] = useSession();
  const loggedInUser = session?.pubkey;
  const [contacts, setContacts] = useAtom(followsAtom);
  const isFollowed = useMemo(() => {
    return contacts?.tags.some((t) => t[0] === "p" && t[1] === pubkey);
  }, [contacts]);

  async function follow() {
    setIsBusy(true);
    const tags = (contacts?.tags || []).concat([["p", pubkey]]);
    const ev = {
      pubkey: loggedInUser as string,
      kind: NDKKind.Contacts,
      tags,
      created_at: unixNow(),
      content: "",
    };
    try {
      const signed = new NDKEvent(ndk, ev);
      await signed.sign();
      await signed.publish();
      setContacts(signed);
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function unfollow() {
    setIsBusy(true);
    const tags = (contacts?.tags || []).filter((t) => t[1] !== pubkey);
    const ev = {
      pubkey: loggedInUser as string,
      kind: NDKKind.Contacts,
      tags,
      created_at: unixNow(),
      content: "",
    };
    try {
      const signed = new NDKEvent(ndk, ev);
      await signed.sign();
      await signed.publish();
      setContacts(signed);
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Button
      isDisabled={!pubkey || !contacts}
      isLoading={isBusy}
      variant="solid"
      onClick={isFollowed ? unfollow : follow}
      colorScheme={isFollowed ? "red" : "brand"}
      {...rest}
    >
      {isFollowed ? "Unfollow" : "Follow"}
    </Button>
  );
}
