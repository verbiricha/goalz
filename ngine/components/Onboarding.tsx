import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  useToast,
  useSteps,
  Stack,
  Box,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Button,
  Link,
} from "@chakra-ui/react";
import { atom, useAtom, useAtomValue } from "jotai";
import { NDKKind, NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { generatePrivateKey, getPublicKey } from "nostr-tools";

import { useNDK, useNsecLogin } from "@ngine/context";
import { relaysAtom, followsAtom } from "@ngine/state";
import ImageUploader from "@ngine/components/ImageUploader";
import { unixNow } from "@ngine/time";

interface Profile {
  name: string;
  about: string;
  picture?: string;
  lud16?: string;
}

const initialProfile = { name: "", about: "" };
const initialFollowing = [] as string[][];

const profileAtom = atom<Profile>(initialProfile);
const followingAtom = atom<string[][]>(initialFollowing);

function NameStep() {
  const [profile, setProfile] = useAtom(profileAtom);
  return (
    <Stack gap={4}>
      <FormControl>
        <FormLabel>What we will call you?</FormLabel>
        <Input
          placeholder="Samantha"
          value={profile.name}
          onChange={(ev) => setProfile({ ...profile, name: ev.target.value })}
        />
        <FormHelperText>You can change it layer if you like.</FormHelperText>
      </FormControl>
    </Stack>
  );
}

function BioStep() {
  const [profile, setProfile] = useAtom(profileAtom);
  return (
    <Stack gap={4}>
      <FormControl>
        <FormLabel>Tell the world about you</FormLabel>
        <Textarea
          placeholder="A few words about yourself"
          value={profile.about}
          onChange={(ev) => setProfile({ ...profile, about: ev.target.value })}
        />
        <FormHelperText>
          This is optional and you can change it later if you like.
        </FormHelperText>
      </FormControl>
    </Stack>
  );
}

function AvatarStep() {
  const [profile, setProfile] = useAtom(profileAtom);
  function onImageUpload(img: string) {
    setProfile({ ...profile, picture: img });
  }
  return (
    <FormControl>
      <FormLabel>Add a profile image</FormLabel>
      <ImageUploader
        defaultImage={profile.picture}
        onImageUpload={onImageUpload}
      />
    </FormControl>
  );
}

function WalletStep() {
  const [profile, setProfile] = useAtom(profileAtom);
  return (
    <Stack gap={4}>
      <FormControl>
        <FormLabel>Lightning address</FormLabel>
        <Input
          value={profile.lud16}
          onChange={(ev) => setProfile({ ...profile, lud16: ev.target.value })}
        />
        <FormHelperText>
          A lightning address allows you to receive payments from anyone in the
          world. Some popular options include{" "}
          <Link isExternal href="https://getalby.com">
            Alby
          </Link>
          ,{" "}
          <Link isExternal href="https://zeusln.app">
            Zeus
          </Link>
          ,{" "}
          <Link isExternal href="https://ln.tips">
            ln.tips
          </Link>
          ,{" "}
          <Link isExternal href="https://www.walletofsatoshi.com">
            Wallet of Satoshi
          </Link>{" "}
          and{" "}
          <Link isExternal href="https://strike.me">
            Strike
          </Link>
          .
        </FormHelperText>
      </FormControl>
    </Stack>
  );
}

function InterestsStep() {
  return <>TODO</>;
}

function PeopleStep() {
  return <>TODO</>;
}

export enum OnboardingStep {
  Name = "Name",
  Bio = "Bio",
  Avatar = "Avatar",
  Wallet = "Wallet",
  Interests = "Interests",
  People = "People",
}

const stepComponents: Record<OnboardingStep, ReactNode> = {
  [OnboardingStep.Name]: <NameStep />,
  [OnboardingStep.Bio]: <BioStep />,
  [OnboardingStep.Avatar]: <AvatarStep />,
  [OnboardingStep.Wallet]: <WalletStep />,
  [OnboardingStep.Interests]: <InterestsStep />,
  [OnboardingStep.People]: <PeopleStep />,
};

interface OnboardingProps {
  steps?: OnboardingStep[];
  defaultRelays?: string[];
  onFinish: () => void;
}

const defaultSteps = [
  OnboardingStep.Name,
  OnboardingStep.Bio,
  OnboardingStep.Avatar,
  OnboardingStep.Wallet,
];

export default function Onboarding({
  steps = defaultSteps,
  defaultRelays,
  onFinish,
}: OnboardingProps) {
  const ndk = useNDK();
  const toast = useToast();
  const nsecLogin = useNsecLogin();
  const userRelays = defaultRelays || [
    "wss://frens.nostr1.com",
    "wss://nos.lol",
    "wss://nostr.mom",
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
  ];
  const [, setRelays] = useAtom(relaysAtom);
  const [, setProfile] = useAtom(profileAtom);
  const [, setFollowing] = useAtom(followingAtom);
  const [, setFollows] = useAtom(followsAtom);
  const [isBusy, setIsBusy] = useState(false);
  const profile = useAtomValue(profileAtom);
  const follows = useAtomValue(followingAtom);

  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length,
  });
  const isLastStep = activeStep === steps.length;

  useEffect(() => {
    return () => {
      setProfile(initialProfile);
      setFollowing(initialFollowing);
    };
  }, []);

  function onNext() {
    if (isLastStep) {
      createProfile();
    } else {
      setActiveStep(activeStep + 1);
    }
  }

  async function publishEvent(ev: NostrEvent): Promise<NDKEvent> {
    const signed = new NDKEvent(ndk, ev);
    await signed.sign();
    await signed.publish();
    return signed;
  }

  async function createProfile() {
    const sk = generatePrivateKey();
    const pubkey = getPublicKey(sk);
    try {
      setIsBusy(true);
      await nsecLogin(sk);
      // Profile
      const metadata = {
        pubkey,
        kind: NDKKind.Metadata,
        content: JSON.stringify(profile),
        tags: [],
        created_at: unixNow(),
      };
      await publishEvent(metadata);
      // Relays
      const relayMetadata = {
        pubkey,
        kind: NDKKind.RelayList,
        content: "",
        tags: userRelays.map((r) => ["r", r]),
        created_at: unixNow(),
      };
      await publishEvent(relayMetadata);
      setRelays(userRelays);
      // Contacts
      const contacts = {
        pubkey,
        kind: NDKKind.Contacts,
        content: "",
        tags: follows,
        created_at: unixNow(),
      };
      setFollows(await publishEvent(contacts));
      toast({
        description: "Profile created",
        status: "success",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
      onFinish();
    } catch (error) {
      console.error(error);
      toast({
        description: "Something went wrong",
        status: "error",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Stack gap={10} w="100%">
      <Stepper
        index={activeStep}
        colorScheme="brand"
        size={{ base: "xs", sm: "sm", md: "lg" }}
      >
        {steps.map((step, index) => (
          <Step key={index} onClick={() => setActiveStep(index + 1)}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink="0">
              <StepTitle>{step}</StepTitle>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      <Stack gap={8} w="100%" justifyContent="center">
        {stepComponents[steps[activeStep - 1]]}
        <Stack>
          <Button
            isLoading={isBusy}
            variant="solid"
            colorScheme="brand"
            onClick={onNext}
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
          {!isLastStep && (
            <Button
              isLoading={isBusy}
              variant="solid"
              colorScheme="gray"
              onClick={onNext}
            >
              Skip for now
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
