import { useMemo } from "react";
import { Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import CallToAction from "@goalz/components/CallToAction";
import OrbitingGoals from "@goalz/components/OrbitingGoals";
import Stats from "@goalz/components/Stats";
import FeaturedGoals from "@goalz/components/FeaturedGoals";
import Features from "@goalz/components/Features";
import Support from "@goalz/components/Support";
import FeaturedNotes from "@goalz/components/FeaturedNotes";
import Link from "@goalz/components/Link";
import useSupporters from "@goalz/hooks/useSupporters";
import { NEW_GOAL } from "@goalz/routes";
import { GOAL, HEYA_PUBKEY } from "@goalz/const";

import useEvents from "@ngine/nostr/useEvents";
import useSession from "@ngine/hooks/useSession";
import { dedupeByPubkey } from "@ngine/utils";

export default function Home() {
  const navigate = useNavigate();
  const [session] = useSession();
  const isLoggedOut = session === null;
  const { events: supporters } = useSupporters(HEYA_PUBKEY);
  const { id, events, eose } = useEvents([
    {
      kinds: [GOAL],
      ids: [
        "bd3b899997cd4ce115532a84eabe598bb7547cab8f44b06812b2306d64761096",
        "9b734bc67402c034857ec3f2ecd8e74d61d38f46505067c5e53986cf70a0c4f6",
        "060f4f06455ee0a87db48f7d5f23b532bcc133cea7dd3bc9f2a20226f1bf2705",
      ],
    },
    {
      kinds: [GOAL],
      authors: supporters.map((ev) => ev.pubkey),
    },
  ]);
  const featuredGoals = useMemo(() => {
    return dedupeByPubkey(events);
  }, [events]);
  const showAnimation = eose;

  function createZapGoal() {
    navigate(NEW_GOAL);
  }

  return (
    <Stack align="center" spacing={20} mt={12}>
      {showAnimation && <OrbitingGoals key={id} events={featuredGoals} />}
      <CallToAction
        mt={showAnimation ? "-12em" : "0"}
        label="Lightning Fundraisers"
        title="Empower Dreams"
        description="Fund causes and goals with lightning. Heya! fundraising is instantly available without any fees."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
      <FeaturedGoals events={featuredGoals} />
      {!isLoggedOut && (
        <Link href="/all" mt={-16}>
          See all active goals
        </Link>
      )}
      <CallToAction
        label="Almost unreal"
        title="Zero fees. Multiple recipients. Instant availability. It's kind of amazing!"
        description="There’s no party in the middle so all funds go directly to the recipients, as soon as you zap them. Heya! uses the bitcoin lightning network to send payments anywhere in the world for near-zero cost. This makes it easy to send $1,000 or $0.01."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
      <Stats />
      <Features />
      <Support />
      <FeaturedNotes />
      <CallToAction
        label="Your dreams await"
        title="Get the boost you need. Start a goal for yourself or someone you know."
        description="Heya! is an open source project powered by bitcoin, lightning and the nostr protocol and made possible by the folks at OpenSats."
        ctaText="Create a goal"
        ctaAction={createZapGoal}
      />
    </Stack>
  );
}
