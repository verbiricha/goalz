import { useState, useEffect } from "react";
import {
  usePrefersReducedMotion,
  useBreakpointValue,
  Flex,
  Box,
  Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { motion } from "framer-motion";

import CallToAction from "../components/CallToAction";
import FeaturedGoals from "../components/FeaturedGoals";
import Features from "../components/Features";
import { GoalBubble } from "../components/Goal";
import { NEW_GOAL } from "../routes";

import Link from "@ngine/components/Link";
import useEvents from "@ngine/nostr/useEvents";
import useSession from "@ngine/hooks/useSession";
import { GOAL } from "@ngine/const";

const MotionBox = motion(Box);

interface OrbitingGoalsProps {
  events: NDKEvent[];
}

interface OrbitingItem {
  id: number;
  event: NDKEvent;
  angle: number;
}

function tendToZeroOnLowerHalf(value: number) {
  const mapped = value < 0 ? 0 : value > 360 ? 360 : value;
  const sinValue = Math.sin((mapped - 180) * (Math.PI / 180));
  const mappedValue = (sinValue + 1) / 2;
  return mappedValue;
}

function OrbitingGoals({ events }: OrbitingGoalsProps) {
  const orbitRadius = useBreakpointValue(
    {
      base: 160,
      sm: 210,
      lg: 340,
      xl: 420,
    },
    {
      ssr: false,
    },
  );
  const [orbitingElements, setOrbitingElements] = useState<OrbitingItem[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const initialElements = events.map((event, index) => ({
      id: index,
      event,
      angle: (index / events.length) * 360,
    }));

    setOrbitingElements(initialElements);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isHovering) return;
      setOrbitingElements((prevElements) =>
        prevElements.map((element) => ({
          ...element,
          angle: (element.angle + 1) % 360,
        })),
      );
    }, 80);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Flex align="center" justify="center" position="relative" h="12em" w="100%">
      {orbitingElements.map((element) => (
        <MotionBox
          key={element.id}
          position="absolute"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: orbitRadius! * Math.cos((element.angle * Math.PI) / 180),
            y: orbitRadius! * Math.sin((element.angle * Math.PI) / 180),
          }}
          transition={{ duration: 1 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          zIndex="-1"
          opacity={tendToZeroOnLowerHalf(element.angle)}
        >
          <GoalBubble event={element.event} />
        </MotionBox>
      ))}
    </Flex>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [session] = useSession();
  const isLoggedOut = session === null;
  const prefersReducedMotion = usePrefersReducedMotion();
  const { events, eose } = useEvents({
    kinds: [GOAL],
    ids: [
      "ebe64e839a6f8391bdfd0d7d8950588f296e8e00eb271cda36e3d1af610e9732",
      "bd3b899997cd4ce115532a84eabe598bb7547cab8f44b06812b2306d64761096",
      "9b734bc67402c034857ec3f2ecd8e74d61d38f46505067c5e53986cf70a0c4f6",
      "25ade1845b93c5cd47d7b2c3f1bc622ada3bada5b87a0fd3714fd5a089d868c4",
      "060f4f06455ee0a87db48f7d5f23b532bcc133cea7dd3bc9f2a20226f1bf2705",
    ],
  });
  const showAnimation = eose && !prefersReducedMotion;

  function createZapGoal() {
    navigate(NEW_GOAL);
  }

  return (
    <Stack align="center" spacing={20} mt={12}>
      {showAnimation && <OrbitingGoals events={events} />}
      <CallToAction
        mt={showAnimation ? "-12em" : "0"}
        label="Lightning Fundraisers"
        title="Empower Dreams"
        description="Fund causes and goals with lightning. Goalz fundraising is instantly available without any fees."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
      <FeaturedGoals events={events} />
      {!isLoggedOut && (
        <Link href="/all" mt={-16}>
          See all active goals
        </Link>
      )}
      <CallToAction
        label="Almost unreal"
        title="Zero fees. Multiple recipients. Instant availability. It's kind of amazing!"
        description="There’s no party in the middle so all funds go directly to the recipients, as soon as you zap them. Goalz uses the bitcoin lightning network to send payments anywhere in the world for near-zero cost. This makes it easy to send $1,000 or $0.01."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
      <Features />
      <CallToAction
        label="Your dreams await"
        title="Get the boost you need. Start a goal for yourself or someone you know."
        description="Goalz is an open source project powered by bitcoin, lightning and the nostr protocol and made possible by the folks at OpenSats."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
    </Stack>
  );
}
