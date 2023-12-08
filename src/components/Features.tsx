import { SimpleGrid, Stack, Icon, Heading, Text } from "@chakra-ui/react";

import {
  FaceContent,
  EyeOff,
  HeartHand,
  Percent,
  Globe,
  Target,
  ZapFast,
  UsersCheck,
  Rocket,
} from "@goalz/icons";

const features = [
  {
    icon: FaceContent,
    title: "No email signups",
    description: `No account necessary! Heya! is built on top of the nostr protocol which uses a private key for your “password”`,
  },
  {
    icon: EyeOff,
    title: "Private",
    description: `You can zap anonymously to keep your identity private. Heya! never touches your traditional payment methods so there’s no KYC.`,
  },
  {
    icon: HeartHand,
    title: "Any Cause",
    description: `Heya! empowers individuals to fund any cause close to their hearts, whether it's supporting a creative project, helping a charitable organization, or fueling personal ambitions.`,
  },
  {
    icon: Percent,
    title: "Zero fees",
    description: `Since zaps are essentially lightning payments, there is no platform fee of any kind. Lightning transaction fees are usually very small and often zero.`,
  },
  {
    icon: Globe,
    title: "Anywhere in the world (or space)",
    description: `As long as you have an internet connection, you can zap from anywhere in the world, or even from outer space!`,
  },
  {
    icon: Target,
    title: "Any Goal",
    description: `Heya! doesn’t care what you raise for. As long as your goals abides by our terms and conditions, we will display them.`,
  },
  {
    icon: ZapFast,
    title: "Near-instant 24/7/365",
    description: `Zaps are mind-blowingly fast. You’ve never seen anything like it! Works on weekends, holidays, any day, every day.`,
  },
  {
    icon: UsersCheck,
    title: "Multiple Recipients",
    description: `Send to 1 or to 100. There is no limit to how many people you can zap, or how many times. Go broke as fast as you want!`,
  },
  {
    icon: Rocket,
    title: "No limits",
    description: `As long as the lightning network supports your transaction, there is no limit to how much you can send, or how many times!`,
  },
];

interface FeatureProps {
  icon: any; // todo
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <Stack align="center" gap={5} w="xs">
      <Icon as={icon} boxSize={6} />
      <Heading fontSize="md">{title}</Heading>
      <Text textAlign="center" fontSize="sm">
        {description}
      </Text>
    </Stack>
  );
}

export default function Features() {
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, xl: 3 }}
      rowGap={{ base: 12, md: 16, xl: 20 }}
      columnGap={{ base: 4, md: 8 }}
    >
      {features.map((f: FeatureProps, idx: number) => (
        <Feature key={idx} {...f} />
      ))}
    </SimpleGrid>
  );
}
