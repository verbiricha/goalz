import { useDisclosure, Icon, Button } from "@chakra-ui/react";
import type { ButtonProps } from "@chakra-ui/react";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import { ZapCircle } from "@ngine/icons";
import ZapModal from "@ngine/components/ZapModal";
import type { Currency, Rates } from "@ngine/money";

interface ZapButtonProps extends ButtonProps {
  pubkey: string;
  event?: NDKEvent;
  currency: Currency;
  rates?: Rates;
}

export default function ZapButton({
  pubkey,
  event,
  currency,
  rates,
  ...rest
}: ZapButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        variant="contrast"
        leftIcon={<Icon boxSize={4} as={ZapCircle} />}
        size="sm"
        onClick={onOpen}
        {...rest}
      >
        Zap
      </Button>
      <ZapModal
        pubkey={pubkey}
        event={event}
        isOpen={isOpen}
        onClose={onClose}
        currency={currency}
        rates={rates}
      />
    </>
  );
}
