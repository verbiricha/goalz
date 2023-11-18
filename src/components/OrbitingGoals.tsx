import { useMemo, useState, useEffect } from "react";
import {
  usePrefersReducedMotion,
  useBreakpointValue,
  Flex,
  Box,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { motion } from "framer-motion";

import { GoalBubble } from "@goalz/components/Goal";

const MotionBox = motion(Box);

const MAX_EVENTS = 12;

function tendToZeroOnLowerHalf(value: number) {
  const mapped = value < 0 ? 0 : value > 360 ? 360 : value;
  const sinValue = Math.sin((mapped - 180) * (Math.PI / 180));
  const mappedValue = (sinValue + 1) / 2;
  return mappedValue;
}

interface OrbitingGoalsProps {
  events: NDKEvent[];
}

interface OrbitingItem {
  id: number;
  event: NDKEvent;
  angle: number;
}

export default function OrbitingGoals({ events }: OrbitingGoalsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
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
  const eventsToShow = useMemo(() => {
    return events.slice(0, MAX_EVENTS);
  }, [events]);

  useEffect(() => {
    const initialElements = eventsToShow.map((event, index) => ({
      id: index,
      event,
      angle: (index / eventsToShow.length) * 360,
    }));

    setOrbitingElements(initialElements);
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const intervalId = setInterval(() => {
        setOrbitingElements((prevElements) =>
          prevElements.map((element) => ({
            ...element,
            angle: (element.angle + 1) % 360,
          })),
        );
      }, 80);
      return () => clearInterval(intervalId);
    }
  }, [prefersReducedMotion]);

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
          zIndex="-1"
          opacity={tendToZeroOnLowerHalf(element.angle)}
        >
          <GoalBubble event={element.event} />
        </MotionBox>
      ))}
    </Flex>
  );
}
