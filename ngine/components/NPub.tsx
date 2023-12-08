import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { HStack, Icon, Text } from "@chakra-ui/react";

import { useFeedback, useCopy } from "@ngine/react";
import { User as UserIcon, Copy } from "@ngine/icons";

interface ProfileProps {
  pubkey: string;
}

export default function NPub({ pubkey }: ProfileProps) {
  const toast = useFeedback();
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  const formatted = useMemo(() => {
    return `${npub.slice(0, 8)}:${npub.slice(-8)}`;
  }, [npub]);
  const copy = useCopy();

  async function onCopy() {
    try {
      copy(npub);
      toast.success("Copied npub");
    } catch (e) {
      toast.error("Error copying npub");
    }
  }

  return (
    <HStack>
      <Icon as={UserIcon} opacity="0.3" boxSize={4} color="gray.500" />
      <Text>{formatted}</Text>
      <Icon
        as={Copy}
        boxSize={4}
        color="brand.500"
        cursor="pointer"
        onClick={onCopy}
      />
    </HStack>
  );
}
