import { Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import CallToAction from "../components/CallToAction";
import FeaturedGoals from "../components/FeaturedGoals";
import Features from "../components/Features";
import { NEW_GOAL } from "../routes";

import Link from "@ngine/components/Link";
import useSession from "@ngine/hooks/useSession";

export default function Home() {
  const navigate = useNavigate();
  const [session] = useSession();
  const isLoggedOut = session === null;

  function createZapGoal() {
    navigate(NEW_GOAL);
  }

  return (
    <Stack align="center" spacing={20} overflowX="hidden" mt={12}>
      <CallToAction
        label="Lightning Fundraisers"
        title="Empower Dreams"
        description="Fund causes and goals with lightning. Zap Goals fundraising is instantly available without any fees."
        ctaText="Create a zap goal"
        ctaAction={createZapGoal}
      />
      <FeaturedGoals />
      {!isLoggedOut && (
        <Link href="/all" mt={-16}>
          See all active zap goals
        </Link>
      )}
      <CallToAction
        label="Almost unreal"
        title="Zero fees. Multiple recipients. Instant availability. It's kind of amazing!"
        description="There’s no party in the middle so all funds go directly to the recipients, as soon as you zap them. Zap goals uses the bitcoin lightning network to send payments anywhere in the world for near-zero cost. This makes it easy to send $1,000 or $0.01."
        ctaText="Create a zap goal"
        ctaAction={createZapGoal}
      />
      <Features />
      <CallToAction
        label="Your dreams await"
        title="Get the boost you need. Start a zap goal for yourself or someone you know."
        description="Zap Goals is an open source project powered by bitcoin, lightning and the nostr protocol and made possible by the folks at OpenSats."
        ctaText="Create a zap goal"
        ctaAction={createZapGoal}
      />
    </Stack>
  );
}
