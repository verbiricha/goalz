import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import {
  useDisclosure,
  useToast,
  Stack,
  Flex,
  Text,
  HStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
} from "@chakra-ui/react";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import Username from "@ngine/components/Username";
import Avatar from "@ngine/components/Avatar";
import FollowButton from "@ngine/components/FollowButton";
import Markdown from "@ngine/components/Markdown";
import useProfile from "@ngine/nostr/useProfile";
import useEvents from "@ngine/nostr/useEvents";
import useCopy from "@ngine/hooks/useCopy";
import useSession from "@ngine/hooks/useSession";
import { Zap, User as UserIcon, Copy, Key } from "@ngine/icons";
import ZapModal from "@ngine/components/ZapModal";

import { GOAL } from "@goalz/const";
import { GoalCard } from "@goalz/components/Goal";

interface ProfileProps {
  pubkey: string;
}

function NPub({ pubkey }: ProfileProps) {
  const toast = useToast();
  const npub = useMemo(() => {
    return nip19.npubEncode(pubkey);
  }, [pubkey]);
  const formatted = useMemo(() => {
    return `${npub.slice(0, 8)}:${npub.slice(-8)}`;
  }, [npub]);
  const copy = useCopy();

  async function onCopy() {
    try {
      copy(npub);
      toast({
        title: "Copied npub",
        status: "success",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error copying npub",
        description: (error as Error)?.message,
        status: "error",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
    }
  }

  return (
    <HStack>
      <Icon as={UserIcon} opacity="0.3" boxSize={4} color="gray.500" />
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

interface NSecProps {
  privkey: string;
}

function NSec({ privkey }: NSecProps) {
  const toast = useToast();
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
      toast({
        title: "Copied nsec",
        status: "success",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error copying nsec",
        description: (error as Error)?.message,
        status: "error",
        position: "top-right",
        isClosable: true,
        duration: 1500,
      });
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

interface LightningAddressProps {
  pubkey: string;
  address: string;
}

function LightningAddress({ pubkey, address }: LightningAddressProps) {
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

interface GoalsProps {
  events: NDKEvent[];
}

function Goals({ events }: GoalsProps) {
  return (
    <Stack gap={5}>
      {events.map((e) => (
        <GoalCard key={e.id} event={e} w="100%" maxWidth="unset" />
      ))}
    </Stack>
  );
}

interface ProfileTabsProps {
  events: NDKEvent[];
}

function ProfileTabs({ events }: ProfileTabsProps) {
  return (
    <Tabs variant="soft-rounded" colorScheme="gray" size="sm" mt={2}>
      <TabList>
        <Tab>Goals</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}>
          <Goals events={events} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default function Profile({ pubkey }: ProfileProps) {
  const profile = useProfile(pubkey);
  const [session] = useSession();
  const shouldShowNsec =
    session?.method === "nsec" && session?.pubkey === pubkey;
  const { events } = useEvents({
    kinds: [GOAL],
    authors: [pubkey],
  });
  return (
    <Stack w="100%" gap={3}>
      {profile?.banner && <Image src={profile.banner} h="236px" />}
      <Flex align="center" justify="space-between">
        <HStack>
          <Avatar pubkey={pubkey} size={{ base: "sm", md: "lg" }} />
          <Username
            pubkey={pubkey}
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight={700}
          />
        </HStack>
        <FollowButton variant="outline" pubkey={pubkey} />
      </Flex>
      {profile?.about && <Markdown content={profile.about} />}
      {profile?.lud16 && (
        <LightningAddress pubkey={pubkey} address={profile.lud16} />
      )}
      <NPub pubkey={pubkey} />
      {shouldShowNsec && session?.privkey && <NSec privkey={session.privkey} />}

      <ProfileTabs events={events} />
    </Stack>
  );
}
