import { useState, useMemo, useEffect } from "react";
import { FormattedNumber } from "react-intl";
import {
  useDisclosure,
  HStack,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  ButtonProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Icon,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useAtomValue } from "jotai";

import { SUPPORT, HEYA_PUBKEY } from "@goalz/const";
import type { Currency } from "@goalz/money";
import { ratesAtom } from "@goalz/state";
import useSupporters from "@goalz/hooks/useSupporters";

import Avatar from "@ngine/components/Avatar";
import InputCopy from "@ngine/components/InputCopy";
import { HeartHand } from "@ngine/icons";
import { unixNow } from "@ngine/time";
import useProfile from "@ngine/nostr/useProfile";
import useSession from "@ngine/hooks/useSession";
import { useLnurl, useLnurlVerify, loadInvoice } from "@ngine/lnurl";
import { makeZapRequest } from "@ngine/nostr/nip57";
import { useSign } from "@ngine/context";
import { relaysAtom } from "@ngine/state";
import QrCode from "@ngine/components/QrCode";

enum Frequency {
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
  yearly = "yearly",
}

const frequencies = [
  Frequency.daily,
  Frequency.weekly,
  Frequency.monthly,
  Frequency.yearly,
];

function frequencyToNoun(f: Frequency) {
  if (f === Frequency.daily) {
    return "day";
  } else if (f === Frequency.weekly) {
    return "week";
  } else if (f === Frequency.monthly) {
    return "month";
  } else {
    return "year";
  }
}

interface LnInvoiceProps {
  verifyUrl?: string;
  invoice: string;
  onInvoicePaid(): void;
}

function LnInvoice({ verifyUrl, invoice, onInvoicePaid }: LnInvoiceProps) {
  const isPaid = useLnurlVerify(verifyUrl);
  useEffect(() => {
    if (isPaid) {
      onInvoicePaid();
    }
  }, [isPaid]);
  return (
    <Stack align="center">
      {isPaid ? (
        <Stack width={256} height={256} align="center" justify="center">
          <Icon as={CheckIcon} color="green" boxSize={20} />
          <Text fontSize="xl">Paid!</Text>
        </Stack>
      ) : (
        <Box cursor="pointer">
          <QrCode data={invoice} link={`lightning:${invoice}`} />
        </Box>
      )}
      {!isPaid && (
        <>
          <InputCopy text={invoice} showToast />
          <Button
            variant="solid"
            colorScheme="orange"
            onClick={() => window.open(`lightning:${invoice}`)}
          >
            Open in wallet
          </Button>
        </>
      )}
    </Stack>
  );
}

function SupportButton(props: ButtonProps) {
  const sign = useSign();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const profile = useProfile(HEYA_PUBKEY);
  const { data: lnurl, isError, isLoading, isFetched } = useLnurl(profile);
  const [session] = useSession();
  const author = session?.pubkey;
  const rates = useAtomValue(ratesAtom);
  const relays = useAtomValue(relaysAtom);

  const [invoice, setInvoice] = useState<string | undefined>();
  const [verifyUrl, setVerifyUrl] = useState<string | undefined>();
  const [isBusy, setIsBusy] = useState(false);
  const [amount, setAmount] = useState<number>(5);
  const [currency] = useState<Currency>("USD");
  const [frequency, setFrequency] = useState<Frequency>(Frequency.monthly);
  const [content, setContent] = useState("");
  const amountAsSats = useMemo(() => {
    if (rates) {
      return Math.floor((amount / rates.ask) * 1e8);
    }
  }, [rates, amount]);

  function resetState() {
    setInvoice(undefined);
    setVerifyUrl(undefined);
    setAmount(5);
    setFrequency(Frequency.monthly);
    setContent("");
  }

  function closeModal() {
    onClose();
    resetState();
  }

  async function payInvoice(pr: string, verifyUrl?: string) {
    // @ts-ignore
    if (window.webln) {
      try {
        // @ts-ignore
        await window.webln.enable();
        // @ts-ignore
        await window.webln.sendPayment(pr);
        closeModal();
      } catch (error) {
        console.error(error);
        setInvoice(pr);
        setVerifyUrl(verifyUrl);
      }
    } else {
      setInvoice(pr);
      setVerifyUrl(verifyUrl);
    }
  }

  async function onSupport() {
    if (!lnurl || !author) {
      return;
    }

    try {
      setIsBusy(true);
      const ev = {
        pubkey: author,
        kind: SUPPORT,
        tags: [
          ["p", HEYA_PUBKEY],
          ["amount", String(amount), currency, frequency],
        ],
        created_at: unixNow(),
        content,
      };
      const signed = await sign(ev);
      if (signed && amountAsSats && author) {
        await signed.publish();
        const ev = makeZapRequest({
          pubkey: author,
          p: HEYA_PUBKEY,
          event: signed,
          comment: content,
          amount: amountAsSats,
          relays,
        });
        const zr = await sign(ev);
        const zap = zr ? zr.rawEvent() : undefined;
        const inv = await loadInvoice(lnurl, amount, content, zap);
        if (inv?.pr) {
          await payInvoice(inv.pr, inv.verify);
        }
      } else {
        console.error("Couldn't sign event");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <Button
        leftIcon={<Icon as={HeartHand} />}
        variant="outline"
        colorScheme="brand"
        size="lg"
        onClick={onOpen}
        {...props}
      >
        Support
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Become a supporter</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack>
              {invoice ? (
                <LnInvoice
                  invoice={invoice}
                  verifyUrl={verifyUrl}
                  onInvoicePaid={closeModal}
                />
              ) : (
                <>
                  <HStack align="flex-start">
                    <FormControl>
                      <FormLabel>Amount ({currency})</FormLabel>
                      <NumberInput
                        value={amount}
                        onChange={(_, n) => n && setAmount(n)}
                        precision={2}
                        min={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      {amountAsSats && (
                        <FormHelperText>
                          <FormattedNumber
                            value={amount}
                            style="currency"
                            currency={currency}
                          />
                          {" = "}
                          {amountAsSats} sats
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        value={frequency}
                        onChange={(ev) =>
                          setFrequency(ev.target.value as Frequency)
                        }
                      >
                        {frequencies.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  <FormControl>
                    <Textarea
                      placeholder="Leave a comment (optional)"
                      value={content}
                      onChange={(ev) => setContent(ev.target.value)}
                    />
                  </FormControl>
                </>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={isError || !isFetched}
              isLoading={isLoading || isBusy}
              w="100%"
              onClick={onSupport}
            >
              Support with{" "}
              <FormattedNumber
                value={amount}
                style="currency"
                currency={currency}
              />
              /{frequencyToNoun(frequency)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Support() {
  const { events: supporters } = useSupporters(HEYA_PUBKEY);
  const [session] = useSession();
  const isLoggedIn = session?.pubkey;
  const supportersText = useMemo(() => {
    if (supporters.length === 0) {
      return `No one supports this project yet, be the first!`;
    } else if (supporters.length === 1) {
      return `One person supports this project`;
    } else {
      return `${supporters.length} people support this project`;
    }
  }, [supporters]);
  return (
    <Stack
      gap={6}
      align="center"
      w={{
        base: "xs",
        sm: "sm",
        md: "md",
        lg: "lg",
      }}
    >
      <Stack>
        <Heading as="h2" textAlign="center">
          Become a supporter
        </Heading>
        <Heading as="h3" color="gray.500" textAlign="center" fontSize="xl">
          {/*
          <FormattedMessage
            defaultMessage="{count, plural, =0 {Be the first to support the project.}, =1 {One person supports this project.}, other {# people support this project.}}"
            values={{ count: supporters.length }}
          />
	  */}
          {supportersText}
        </Heading>
      </Stack>
      {supporters.length > 0 && (
        <Flex align="center" justify="center" gap={2} wrap="wrap">
          {supporters.map((ev) => (
            <Avatar key={ev.id} pubkey={ev.pubkey} size="md" />
          ))}
        </Flex>
      )}
      <Text textAlign="center">
        Heya! is possible thanks to hard working open source contributors and
        their supporters. Did you find it useful? Consider supporting the
        project by setting up a subscription.
      </Text>
      <Stack align="center">
        <SupportButton isDisabled={!isLoggedIn} />
        {!isLoggedIn && (
          <Text fontSize="xs" color="gray.500">
            Log in to subscribe
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
