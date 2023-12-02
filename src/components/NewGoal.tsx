import { useState } from "react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { nip19, nip05 } from "nostr-tools";
import {
  useToast,
  Flex,
  Stack,
  HStack,
  Box,
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
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";

import Avatar from "@ngine/components/Avatar";
import useSession from "@ngine/hooks/useSession";
import useRelays from "@ngine/hooks/useRelays";
import { useSign } from "@ngine/context";
import ImageUploader from "@ngine/components/ImageUploader";
import { convertSatsToFiat, convertFiatToSats } from "@ngine/money";
import { ratesAtom } from "@ngine/state";

import { GoalPreview, Shares } from "@goalz/components/Goal";
import { GOAL } from "@goalz/const";
import { fiatCurrencyAtom } from "@goalz/state";

function getMinimumDate() {
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  return currentDate.toLocaleDateString("en-CA");
}

interface TagsProps {
  onChange(tags: string[]): void;
}

function TagsFormControl({ onChange }: TagsProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  function addTag(t: string) {
    if (tags.includes(t)) {
      return;
    }
    const newTags = tags.concat([t]);
    setTags(newTags);
    onChange(newTags);
  }

  function removeTag(t: string) {
    const newTags = tags.filter((tag) => tag !== t);
    setTags(newTags);
    onChange(newTags);
  }

  function handleAddTag() {
    addTag(currentTag);
    setCurrentTag("");
  }

  return (
    <FormControl>
      <FormLabel>Tags (optional)</FormLabel>
      <InputGroup>
        <Input
          value={currentTag}
          onChange={(ev) => setCurrentTag(ev.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button
            size="sm"
            variant="outline"
            isDisabled={currentTag.trim().length === 0}
            onClick={() => handleAddTag()}
          >
            Add
          </Button>
        </InputRightElement>
      </InputGroup>
      <FormHelperText>
        {tags.length === 0 ? (
          `Add up to 3 tags to your goal`
        ) : (
          <HStack wrap="wrap">
            {tags.map((t) => (
              <Tag size="sm" variant="subtle">
                <TagLabel>{t}</TagLabel>
                <TagCloseButton onClick={() => removeTag(t)} />
              </Tag>
            ))}
          </HStack>
        )}
      </FormHelperText>
    </FormControl>
  );
}

function CreateGoal() {
  const toast = useToast();
  const [session] = useSession();
  const [relays] = useRelays();
  const sign = useSign();
  const navigate = useNavigate();
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
  const [tags, setTags] = useState<string[]>([]);
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
      if (maybeNpub.includes("@")) {
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
        ["amount", String(Number(amount) * 1000)],
        ...tags.map((t) => ["t", t]),
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
      const timestamp = Math.floor(new Date(closedAt).getTime() / 1000);
      ev.tags.push(["closed_at", String(timestamp)]);
    }
    if (url) {
      ev.tags.push(["r", url]);
    }
    for (const tag of zapSplits) {
      ev.tags.push(tag);
    }
    try {
      setIsPublishing(true);
      const signed = await sign(ev);
      if (signed) {
        toast({
          description: "🎉 Goal created",
          status: "success",
          position: "top-right",
          isClosable: true,
          duration: 1500,
        });
        const nevent = nip19.neventEncode({
          id: signed.tagId(),
          relays,
          author: session!.pubkey,
        });
        await signed.publish();
        navigate(`/e/${nevent}`);
      } else {
        throw new Error("Couldn't sign goal event");
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: (error as Error)?.message || "",
        status: "error",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <Stack>
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
          <TagsFormControl onChange={setTags} />
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
              Please make sure the beneficiaries have a lightning wallet
              connected to their profiles.
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
        <GoalPreview
          title={name}
          goal={Number(amount)}
          closedAt={closedAt}
          image={image}
          tags={tags}
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
