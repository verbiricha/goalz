import { useDisclosure, HStack, Icon, Text } from "@chakra-ui/react";

import { ZapModal } from "@ngine/react";
import { Zap } from "@ngine/icons";

interface LightningAddressProps {
  pubkey: string;
  address: string;
}

export default function LightningAddress({
  pubkey,
  address,
}: LightningAddressProps) {
  const modalProps = useDisclosure();
  return (
    <>
      <HStack cursor="pointer" onClick={modalProps.onOpen}>
        <Icon as={Zap} opacity="0.3" boxSize={4} color="gray.500" />
        <Text>{address}</Text>
      </HStack>
      <ZapModal pubkey={pubkey} {...modalProps} />
    </>
  );
}
