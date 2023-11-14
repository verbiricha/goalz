import { useState } from "react";
import { useAtomValue } from "jotai";
import { nip19, nip05 } from "nostr-tools";
import {
  Flex,
  Stack,
  HStack,
  Box,
  Heading,
  Text,
  Textarea,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";

import Avatar from "@ngine/components/Avatar";
import useSession from "@ngine/hooks/useSession";
import useRelays from "@ngine/hooks/useRelays";
import ImageUploader from "@ngine/components/ImageUploader";

import { GoalPreview, Shares } from "@goalz/components/Goal";
import { GOAL } from "@goalz/const";
import { ratesAtom, fiatCurrencyAtom } from "@goalz/state";
import { convertSatsToFiat, convertFiatToSats } from "@goalz/money";

function getMinimumDate() {
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  return currentDate.toLocaleDateString("en-CA");
}

function CreateGoal() {
  const [session] = useSession();
  const [relays] = useRelays();
  const fiatCurrency = useAtomValue(fiatCurrencyAtom);
  const rates = useAtomValue(ratesAtom);
  // Goal settings
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [amountInFiat, setAmountInFiat] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState<string | undefined>();
  const [closedAt, setClosedAt] = useState<Date | undefined>();
  const [zapSplits, setZapSplits] = useState<string[][]>([]);
  const [image, setImage] = useState<string | undefined>();
  const isValidZapGoal = Number(amount) > 0 && name;
  // Beneficiaries
  const [weight, setWeigth] = useState("");
  const [npubLike, setNpubLike] = useState("");
  const [npub, setNpub] = useState("");
  const [npubError, setNpubError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  function changeSatsAmount(amt: string) {
    setAmount(amt);
    if (rates) {
      setAmountInFiat(convertSatsToFiat(amt, rates));
    }
  }

  function changeFiatAmount(amt: string) {
    setAmountInFiat(amt);
    if (rates) {
      setAmount(convertFiatToSats(amt, rates));
    }
  }

  async function onChangeNpub(maybeNpub: string) {
    setNpubLike(maybeNpub);
    if (maybeNpub === "") {
      setNpub("");
      return;
    }
    try {
      console.log("GOT", maybeNpub);
      if (maybeNpub.includes("@")) {
        console.log("QUERY", maybeNpub);
        const profile = await nip05.queryProfile(maybeNpub);
        if (profile) {
          setNpub(profile.pubkey);
        } else {
          setNpubError("Couldn't find user");
        }
      } else if (
        maybeNpub.startsWith("npub") ||
        maybeNpub.startsWith("nprofile")
      ) {
        const decoded = nip19.decode(maybeNpub);
        if (decoded.type === "npub") {
          setNpub(decoded.data);
        } else if (decoded.type === "nprofile") {
          setNpub(decoded.data.pubkey);
        } else {
          setNpubError("Couldn't decode npub");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  // todo: NumberInput for weight

  function handleAddNpub() {
    setZapSplits((zs) =>
      zs.concat([["zap", npub, "wss://purplepag.es", weight]]),
    );
    setNpubError("");
    setNpubLike("");
    setWeigth("");
    setNpub("");
  }

  function onDeletePubkey(pubkey: string) {
    setZapSplits((zs) => zs.filter((z) => z[1] !== pubkey));
  }

  async function createGoal() {
    const ev = {
      kind: GOAL,
      pubkey: session!.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["relays", ...relays],
        ["amount", amount],
      ],
      content: name,
    };

    if (description) {
      ev.tags.push(["summary", description]);
    }

    if (image) {
      ev.tags.push(["image", image]);
    }
    if (closedAt) {
      ev.tags.push(["closed_at", String(closedAt)]);
    }
    if (url) {
      ev.tags.push(["r", url]);
    }
    for (const tag of zapSplits) {
      ev.tags.push(tag);
    }
    console.log("EV", ev);
    try {
      setIsPublishing(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <Stack>
        <Heading>Create a zap goal</Heading>
        <Stack w="100%">
          <FormControl>
            <FormLabel>Cause or Goal name</FormLabel>
            <Input
              placeholder="e.g. streaming board"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <HStack>
              <InputGroup>
                <Input
                  type="number"
                  min="1"
                  max="2100000000000000"
                  value={amount}
                  onChange={(ev) => changeSatsAmount(ev.target.value)}
                />
                <InputRightElement mr={1}>
                  <Text fontSize="xs" color="gray.500">
                    SATS
                  </Text>
                </InputRightElement>
              </InputGroup>
              {rates && (
                <InputGroup>
                  <Input
                    type="number"
                    value={amountInFiat}
                    onChange={(ev) => changeFiatAmount(ev.target.value)}
                  />
                  <InputRightElement mr={1}>
                    <Text fontSize="xs" color="gray.500">
                      {fiatCurrency}
                    </Text>
                  </InputRightElement>
                </InputGroup>
              )}
            </HStack>
          </FormControl>
          <FormControl>
            <FormLabel>Description (optional)</FormLabel>
            <Textarea
              placeholder="Share the reasons for your goal or cause"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>URL (optional)</FormLabel>
            <Input
              placeholder="https://"
              value={url}
              onChange={(ev) => setUrl(ev.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Image (optional)</FormLabel>
            <ImageUploader showPreview={false} onImageUpload={setImage} />
          </FormControl>
          <FormControl>
            <FormLabel>Expiry (optional)</FormLabel>
            <Input
              type="date"
              min={getMinimumDate()}
              onChange={(ev) => setClosedAt(ev.target.value as unknown as Date)}
            />
          </FormControl>
          <FormControl>
            <HStack align="flex-end" gap={4}>
              <Box flex="1">
                <FormLabel>Beneficiaries</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="npub or nostr address..."
                    pr="2em"
                    value={npubLike}
                    onChange={(ev) => onChangeNpub(ev.target.value)}
                  />
                  <InputRightElement tabIndex={-1}>
                    {npub.length > 0 && (
                      <Avatar tabIndex={-1} size="xs" pubkey={npub} />
                    )}
                  </InputRightElement>
                </InputGroup>
              </Box>
              <Box>
                <FormLabel>Shares</FormLabel>
                <Input
                  type="number"
                  maxW="6em"
                  placeholder="e.g. 10"
                  value={weight}
                  onChange={(ev) => setWeigth(ev.target.value)}
                />
                <FormErrorMessage>{npubError}</FormErrorMessage>
              </Box>
              <Button
                isLoading={isBusy}
                isDisabled={weight === "" || npub === ""}
                variant="solid"
                colorScheme="gray"
                onClick={handleAddNpub}
              >
                Add
              </Button>
            </HStack>
            <FormHelperText>
              <Text fontSize="xs">
                Please make sure the beneficiaries have a lightning wallet
                connected to their profiles.
              </Text>
            </FormHelperText>
          </FormControl>
          <Shares zapTags={zapSplits} onDelete={onDeletePubkey} />
          <Button
            isLoading={isPublishing}
            isDisabled={!isValidZapGoal}
            variant="solid"
            colorScheme="brand"
            mt={2}
            onClick={createGoal}
          >
            Create
          </Button>
        </Stack>
      </Stack>
      <Stack gap={4}>
        <Heading fontSize="xl">Preview</Heading>
        <GoalPreview
          title={name}
          goal={Number(amount)}
          closedAt={closedAt}
          image={image}
          href={url}
          description={description}
          pubkey={session!.pubkey}
          zapSplits={zapSplits}
        />
      </Stack>
    </>
  );
}

export default function NewGoal() {
  return (
    <Flex
      gap={{
        base: 6,
        lg: 20,
      }}
      direction={{
        base: "column",
        lg: "row",
      }}
    >
      <CreateGoal />
    </Flex>
  );
}
