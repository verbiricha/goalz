import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import { Flex } from "@chakra-ui/react";

import { HOME } from "../routes";
import Profile from "../components/Profile";

export default function ProfilePage() {
  const { npub } = useParams();
  const pubkey = useMemo(() => {
    const decoded = nip19.decode(npub ?? "");
    if (decoded?.type === "npub") {
      return decoded.data;
    }
  }, [npub]);

  if (!pubkey) {
    return <Navigate to={HOME} replace />;
  }

  return (
    <Flex
      w={{
        base: "xs",
        md: "md",
      }}
    >
      <Profile key={pubkey} pubkey={pubkey} />
    </Flex>
  );
}
