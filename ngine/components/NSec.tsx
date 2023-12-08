import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { HStack, Icon, Text } from "@chakra-ui/react";

import { useFeedback, useCopy } from "@ngine/react";
import { Copy, Key } from "@ngine/icons";

interface NSecProps {
  privkey: string;
}

export default function NSec({ privkey }: NSecProps) {
  const toast = useFeedback();
  const nsec = useMemo(() => {
    return nip19.nsecEncode(privkey);
  }, [privkey]);
  const formatted = useMemo(() => {
    return `${nsec.slice(0, 8)}:${nsec.slice(-8)}`;
  }, [nsec]);
  const copy = useCopy();

  async function onCopy() {
    try {
      copy(nsec);
      toast.success("Copied nsec");
    } catch (error) {
      toast.error("Error copying nsec");
    }
  }

  return (
    <HStack>
      <Icon as={Key} opacity="0.3" boxSize={4} color="gray.500" />
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
