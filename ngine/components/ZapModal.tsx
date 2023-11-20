import { useState, useMemo, useEffect } from "react";
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
import { generatePrivateKey, getPublicKey } from "nostr-tools";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import("@getalby/bitcoin-connect-react"); // enable NWC

import { makeZapRequest, getZapSplits, ZapSplit } from "@ngine/nostr/nip57";
import User from "@ngine/components/User";
import QrCode from "@ngine/components/QrCode";
import InputCopy from "@ngine/components/InputCopy";
import useRelays from "@ngine/hooks/useRelays";
import useSession from "@ngine/hooks/useSession";
import useProfile from "@ngine/nostr/useProfile";
import useProfiles from "@ngine/nostr/useProfiles";
import { useLnurl, useLnurls, loadInvoice } from "@ngine/lnurl";
import { useSign } from "@ngine/context";

// todo: make part of ngine
export function formatShortNumber(n: number) {
  const intl = new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: n < 1e8 ? 2 : 8,
  });

  if (n === 1) {
    return `1`;
  } else if (n < 2e3) {
    return `${n}`;
  } else if (n < 1e6) {
    return `${intl.format(n / 1e3)}K`;
  } else if (n < 1e9) {
    return `${intl.format(n / 1e6)}M`;
  } else {
    return `${intl.format(n / 1e8)}BTC`;
  }
}

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
}

function SatSlider({ minSendable, maxSendable, onSelect }: SatSliderProps) {
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
          .map((a) => (
            <Button
              key={a}
              variant="solid"
              flexGrow="1"
              colorScheme={amount === a ? "brand" : "gray"}
              onClick={() => selectAmount(a)}
            >
              {valueToEmoji(a)} {formatShortNumber(a)}
            </Button>
          ))}
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
    </Stack>
  );
}

interface ZapModalProps {
  pubkey: string;
  event?: NDKEvent;
  isOpen: boolean;
  onClose(): void;
  currency?: string;
  exchangeRate?: number;
}

function SingleZapModal({ pubkey, event, isOpen, onClose }: ZapModalProps) {
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
            Zap {formatShortNumber(amount)}
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
                        {formatShortNumber(Number(percentage.toFixed(0)))}%
                      </Text>
                      <Text color="secondary" as="span" fontSize="sm">
                        {formatShortNumber(gets)}
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
            Zap {formatShortNumber(amount)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ZapModal({
  pubkey,
  event,
  isOpen,
  onClose,
}: ZapModalProps) {
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
    />
  ) : (
    <SingleZapModal
      pubkey={pubkey}
      event={event}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
