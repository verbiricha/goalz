import {
  Stack,
  Flex,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
} from "@chakra-ui/react";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

import {
  useProfile,
  useEvents,
  useSession,
  LightningAddress,
  Username,
  Avatar,
  FollowButton,
  Markdown,
  NPub,
  NSec,
} from "@ngine/react";

import { GOAL } from "@goalz/const";
import { GoalCard } from "@goalz/components/Goal";

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

interface ProfileProps {
  pubkey: string;
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
      {profile?.banner && (
        <Image fit="cover" src={profile.banner} maxH="236px" />
      )}
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
