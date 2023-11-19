import { useEffect } from "react";
import { Stack, HStack, Icon, Text, Box, Button } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

import InputCopy from "./InputCopy";
import QrCode from "./QrCode";
import { useLnurlVerify } from "../lnurl";

interface LnInvoiceProps {
  verifyUrl?: string;
  invoice: string;
  onInvoicePaid(): void;
}

export default function LnInvoice({
  verifyUrl,
  invoice,
  onInvoicePaid,
}: LnInvoiceProps) {
  const isPaid = useLnurlVerify(verifyUrl);
  useEffect(() => {
    if (isPaid) {
      onInvoicePaid();
    }
  }, [isPaid]);
  return (
    <Stack align="center" justify="center" gap={4}>
      {isPaid ? (
        <Stack align="center" justify="center">
          <Icon as={CheckIcon} color="green" boxSize={20} />
          <Text fontSize="xl">Paid!</Text>
        </Stack>
      ) : (
        <Box cursor="pointer">
          <QrCode data={invoice} link={`lightning:${invoice}`} />
        </Box>
      )}
      {!isPaid && (
        <HStack>
          <InputCopy text={invoice} showToast />
          <Button
            variant="solid"
            colorScheme="orange"
            onClick={() => window.open(`lightning:${invoice}`)}
          >
            Open wallet
          </Button>
        </HStack>
      )}
    </Stack>
  );
}
