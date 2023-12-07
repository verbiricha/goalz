import { useState, useMemo, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
  useToast,
  Flex,
  Box,
  HStack,
  Stack,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { FormattedNumber } from "react-intl";
import { generatePrivateKey, getPublicKey } from "nostr-tools";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import("@getalby/bitcoin-connect-react"); // enable NWC

import User from "@ngine/components/User";
import QrCode from "@ngine/components/QrCode";
import Amount from "@ngine/components/Amount";
import InputCopy from "@ngine/components/InputCopy";
import useRelays from "@ngine/hooks/useRelays";
import useSession from "@ngine/hooks/useSession";
import useProfile from "@ngine/nostr/useProfile";
import useProfiles from "@ngine/nostr/useProfiles";
import { useLnurl, useLnurls, loadInvoice } from "@ngine/lnurl";
import { useSign } from "@ngine/context";
import { convertSatsToFiat } from "@ngine/money";
import type { Currency, Rates } from "@ngine/money";
import { currencyAtom, ratesAtom } from "@ngine/state";
import { makeZapRequest, getZapSplits, ZapSplit } from "@ngine/nostr/nip57";

function valueToEmoji(sats: number) {
  if (sats < 420) {
    return "👍";
  } else if (sats === 420) {
    return "😏";
  } else if (sats <= 1000) {
    return "🤙";
  } else if (sats <= 5000) {
    return "💜";
  } else if (sats <= 10000) {
    return "😻";
  } else if (sats <= 20000) {
    return "🤩";
  } else if (sats <= 50000) {
    return "🌶️";
  } else if (sats <= 600000) {
    return "🚀";
  } else if (sats < 1000000) {
    return "🔥";
  } else if (sats < 1500000) {
    return "🤯";
  } else {
    return "🏆";
  }
}

const defaultZapAmount = 21;

interface SatSliderProps {
  minSendable: number;
  maxSendable: number;
  onSelect(amt: number): void;
  currency: Currency;
  rates?: Rates;
}

function SatSlider({
  minSendable,
  maxSendable,
  onSelect,
  currency,
  rates,
}: SatSliderProps) {
  const [amount, setAmount] = useState(defaultZapAmount);
  const min = Math.max(1, Math.floor(minSendable / 1000));
  const max = Math.min(Math.floor(maxSendable / 1000), 2e6);
  const amounts = [
    defaultZapAmount,
    1_000,
    5_000,
    10_000,
    20_000,
    50_000,
    100_000,
    1_000_000,
    2_000_000,
  ];

  function selectAmount(a: number) {
    setAmount(a);
    onSelect(a);
  }

  function onInputChange(changed: number) {
    if (changed < min) {
      selectAmount(min);
    } else if (changed > max) {
      selectAmount(max);
    } else {
      selectAmount(changed);
    }
  }

  return (
    <Stack gap={2} width="100%">
      <Flex flexWrap="wrap" gap={3}>
        {amounts
          .filter((a) => a >= min && a <= max)
          .map((a) => {
            return (
              <Stack
                key={a}
                align="center"
                cursor="pointer"
                p={2}
                gap={0}
                flexGrow="1"
                borderRadius="16px"
                sx={{
                  bg: amount === a ? "brand.200" : "gray.100",
                  _dark: {
                    bg: amount === a ? "brand.400" : "gray.600",
                  },
                }}
                onClick={() => selectAmount(a)}
              >
                <Text as="span" fontSize="lg">
                  {valueToEmoji(a)}
                </Text>
                <Text as="span" fontWeight={700}>
                  <Amount amount={a} currency="BTC" />
                </Text>
                {rates && (
                  <Text as="span" fontSize="sm">
                    <FormattedNumber
                      value={Number(convertSatsToFiat(String(a), rates))}
                      style="currency"
                      currency={currency}
                    />
                  </Text>
                )}
              </Stack>
            );
          })}
      </Flex>
      <NumberInput
        defaultValue={defaultZapAmount}
        value={amount}
        min={min}
        max={max}
        onChange={(_, n) => onInputChange(n)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      {rates && (
        <Text
          fontSize="sm"
          sx={{ color: "gray.600", _dark: { color: "gray.400" } }}
        >
          {amount} sats
          {" = "}
          <FormattedNumber
            value={Number(convertSatsToFiat(String(amount), rates))}
            style="currency"
            currency="USD"
          />
        </Text>
      )}
    </Stack>
  );
}

interface ZapModalProps {
  pubkey: string;
  event?: NDKEvent;
  isOpen: boolean;
  onClose(): void;
  currency: Currency;
  rates?: Rates;
}

function SingleZapModal({
  pubkey,
  event,
  isOpen,
  onClose,
  currency,
  rates,
}: ZapModalProps) {
  const sign = useSign();
  const toast = useToast();
  const [relays] = useRelays();
  const profile = useProfile(pubkey);
  const [amount, setAmount] = useState(defaultZapAmount);
  const [session] = useSession();
  const isLoggedOut = session === null;
  const [isAnon, setIsAnon] = useState(isLoggedOut);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);
  const { data: lnurl, isError, isLoading, isFetched } = useLnurl(profile);

  useEffect(() => {
    setIsAnon(isLoggedOut);
  }, [isLoggedOut]);

  function closeModal() {
    setInvoice(null);
    setAmount(defaultZapAmount);
    setComment("");
    setIsFetchingInvoice(false);
    onClose();
  }

  async function zapRequest(sk: string) {
    try {
      const author =
        isAnon || !session?.pubkey ? getPublicKey(sk) : session?.pubkey;
      const zr = makeZapRequest({
        pubkey: author,
        p: pubkey,
        event,
        comment,
        amount,
        relays,
      });
      let signed;
      if (isAnon) {
        signed = await sign(zr, new NDKPrivateKeySigner(sk));
      } else {
        signed = await sign(zr);
      }
      if (signed) {
        return signed.toNostrEvent();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function onZap() {
    if (!lnurl) {
      return;
    }
    try {
      setIsFetchingInvoice(true);
      const sk = generatePrivateKey();
      const zr = await zapRequest(sk);
      const invoice = await loadInvoice(lnurl, amount, comment, zr);
      if (!invoice?.pr) {
        toast({
          title: "Could not get invoice",
          status: "error",
        });
        return;
      }
      // fimxe
      // @ts-ignore
      if (window.webln) {
        try {
          // @ts-ignore
          await window.webln.enable();
          // @ts-ignore
          await window.webln.sendPayment(invoice.pr);
          toast({
            title: "⚡️ Zapped",
            description: `${amount} sats sent`,
            status: "success",
          });
          closeModal();
        } catch (error) {
          console.error(error);
          setInvoice(invoice.pr);
        }
      } else {
        if (invoice?.pr) {
          setInvoice(invoice.pr);
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not get invoice",
        status: "error",
      });
    } finally {
      setIsFetchingInvoice(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Zap</Text>
            <User pubkey={pubkey} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack alignItems="center" minH="4rem">
            {isLoading && <Spinner />}
            {isError && (
              <Alert
                status="warning"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="120px"
              >
                <AlertIcon />
                <AlertTitle>Can't zap</AlertTitle>
                <AlertDescription maxWidth="sm">
                  The user can't be zapped because we can't fetch their LNURL
                  information.
                </AlertDescription>
              </Alert>
            )}
            {lnurl && !invoice && (
              <Stack spacing={2}>
                <SatSlider
                  currency="USD"
                  rates={rates}
                  minSendable={lnurl.minSendable}
                  maxSendable={lnurl.maxSendable}
                  onSelect={setAmount}
                />
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment (optional)"
                />
              </Stack>
            )}
            {lnurl && invoice && (
              <Stack>
                <Box cursor="pointer">
                  <QrCode data={invoice} link={`lightning:${invoice}`} />
                </Box>
                <InputCopy text={invoice} showToast />
                <Button
                  variant="solid"
                  colorScheme="orange"
                  onClick={() => window.open(`lightning:${invoice}`)}
                >
                  Open in wallet
                </Button>
              </Stack>
            )}
          </Stack>
          <RadioGroup
            mt={2}
            defaultValue={isAnon ? "private" : "public"}
            onChange={(value) => setIsAnon(value === "private")}
          >
            <Stack spacing={2} direction="row">
              <Radio
                colorScheme="brand"
                value="public"
                isDisabled={isLoggedOut}
              >
                Public
              </Radio>
              <Radio colorScheme="brand" value="private">
                Anonymous
              </Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={!isFetched || !lnurl}
            isLoading={isLoading || isFetchingInvoice}
            w="12em"
            variant="solid"
            colorScheme="brand"
            onClick={onZap}
          >
            Zap <Amount amount={amount} currency={currency} />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface MultiZapModalProps extends ZapModalProps {
  zapSplits: ZapSplit[];
}

function MultiZapModal({
  event,
  zapSplits,
  isOpen,
  onClose,
  currency,
  rates,
}: MultiZapModalProps) {
  const sign = useSign();
  const toast = useToast();
  const [relays] = useRelays();
  const pubkeys = useMemo(() => {
    return zapSplits.map((z) => z.pubkey);
  }, [zapSplits]);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(false);
  const profiles = useProfiles(pubkeys);
  const results = useLnurls(profiles);
  const lnurls = results.map((result) => result.data).filter((l) => l);
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const isFetched = results.every((result) => result.isFetched);
  const [amount, setAmount] = useState(defaultZapAmount);
  const [session] = useSession();
  const isLoggedOut = session === null;
  const [isAnon, setIsAnon] = useState(isLoggedOut);
  const [invoices, setInvoices] = useState<string[] | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setIsAnon(isLoggedOut);
  }, [isLoggedOut]);

  function closeModal() {
    setInvoices(null);
    setAmount(defaultZapAmount);
    setComment("");
    setIsFetchingInvoices(false);
    onClose();
  }

  async function zapRequest(sk: string, p: string, amount: number) {
    try {
      const author =
        isAnon || !session?.pubkey ? getPublicKey(sk) : session?.pubkey;
      const zr = makeZapRequest({
        pubkey: author,
        p,
        amount,
        relays,
        event,
        comment,
      });
      let signed;
      if (isAnon) {
        signed = await sign(zr, new NDKPrivateKeySigner(sk));
      } else {
        signed = await sign(zr);
      }
      if (signed) {
        return signed.toNostrEvent();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function onZap() {
    try {
      const sk = generatePrivateKey();
      setIsFetchingInvoices(true);
      const fetchedInvoices = await Promise.all(
        zapSplits.map(async ({ pubkey, percentage }, idx) => {
          const gets = Math.round(amount * (percentage / 100));
          const zr = await zapRequest(sk, pubkey, gets);
          // @ts-ignore
          return await loadInvoice(lnurls[idx], gets, comment, zr);
        }),
      );
      const hasFetchedInvoices = fetchedInvoices.every((i) => i?.pr);

      if (!hasFetchedInvoices) {
        toast({
          title: "Could not get invoices",
          status: "error",
        });
        return;
      }

      // @ts-ignore
      if (window.webln) {
        try {
          // @ts-ignore
          await window.webln.enable();
          for (const i of fetchedInvoices) {
            // @ts-ignore
            await window.webln.sendPayment(i.pr);
          }
          toast({
            title: "⚡️ Zapped",
            description: `${amount} sats sent`,
            status: "success",
          });
          closeModal();
        } catch (error) {
          console.error(error);
          setInvoices(fetchedInvoices.map((i) => i.pr));
        }
      } else {
        setInvoices(fetchedInvoices.map((i) => i.pr));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not get invoices",
        status: "error",
      });
    } finally {
      setIsFetchingInvoices(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>Zap {zapSplits.length} recipients</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack alignItems="center" minH="4rem">
            {isLoading && <Spinner />}
            {isError && (
              <Alert
                status="warning"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="120px"
              >
                <AlertIcon />
                <AlertTitle>Can't zap</AlertTitle>
                <AlertDescription maxWidth="sm">
                  The users can't be zapped because we can't fetch their LNURL
                  information.
                </AlertDescription>
              </Alert>
            )}
            {lnurls && !invoices && (
              <>
                <SatSlider
                  currency="USD"
                  rates={rates}
                  minSendable={Math.max(
                    ...lnurls.map((l) => l!.minSendable ?? 21),
                  )}
                  maxSendable={Math.min(
                    ...lnurls.map((l) => l!.maxSendable ?? 21_000_000),
                  )}
                  onSelect={setAmount}
                />
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Leave a comment (optional)"
                />
              </>
            )}
            {lnurls &&
              invoices &&
              invoices.map((invoice) => {
                return (
                  <Stack key={invoice}>
                    <Box cursor="pointer">
                      <QrCode data={invoice} link={`lightning:${invoice}`} />
                    </Box>
                    <Stack>
                      <InputCopy text={invoice} showToast />
                      <Button
                        colorScheme="orange"
                        onClick={() => window.open(`lightning:${invoice}`)}
                      >
                        Open in wallet
                      </Button>
                    </Stack>
                  </Stack>
                );
              })}
            <Stack w="100%">
              {zapSplits.map(({ pubkey, percentage }) => {
                const gets = Math.round(amount * (percentage / 100));
                return (
                  <Flex
                    key={pubkey}
                    align="center"
                    justifyContent="space-between"
                  >
                    <User key={pubkey} pubkey={pubkey} size="xs" />
                    <Flex
                      alignItems="flex-end"
                      flexDir="column"
                      justifyContent="flex-end"
                    >
                      <Text as="span" fontSize="md">
                        {Number(percentage.toFixed(0))}%
                      </Text>
                      <Text color="secondary" as="span" fontSize="sm">
                        <Amount amount={gets} currency={currency} />
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Stack>
          </Stack>
          <RadioGroup
            mt={2}
            defaultValue={isAnon ? "private" : "public"}
            onChange={(value) => setIsAnon(value === "private")}
          >
            <Stack spacing={2} direction="row">
              <Radio
                colorScheme="brand"
                value="public"
                isDisabled={isLoggedOut}
              >
                Public
              </Radio>
              <Radio colorScheme="brand" value="private">
                Anonymous
              </Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={
              !isFetched ||
              lnurls.length !== pubkeys.length ||
              invoices !== null
            }
            isLoading={isLoading || isFetchingInvoices}
            w="12em"
            variant="solid"
            colorScheme="brand"
            onClick={onZap}
          >
            Zap <Amount amount={amount} currency={currency} />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface OptionalZapModalProps {
  pubkey: string;
  event?: NDKEvent;
  isOpen: boolean;
  onClose(): void;
}

export default function ZapModal({
  pubkey,
  event,
  isOpen,
  onClose,
}: OptionalZapModalProps) {
  const currency = useAtomValue(currencyAtom);
  const rates = useAtomValue(ratesAtom);
  const zapSplits = useMemo(() => {
    if (event) {
      return getZapSplits(event);
    }
    return [];
  }, [event]);
  return zapSplits.length > 0 ? (
    <MultiZapModal
      pubkey={pubkey}
      event={event}
      zapSplits={zapSplits}
      isOpen={isOpen}
      onClose={onClose}
      currency={currency}
      rates={rates}
    />
  ) : (
    <SingleZapModal
      pubkey={pubkey}
      event={event}
      isOpen={isOpen}
      onClose={onClose}
      currency={currency}
      rates={rates}
    />
  );
}
