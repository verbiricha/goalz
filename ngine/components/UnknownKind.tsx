import { useMemo } from "react";
import {
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Image,
  Icon,
} from "@chakra-ui/react";
// todo: custom
import { StarIcon } from "@chakra-ui/icons";
import {
  NDKEvent,
  NDKKind,
  NDKFilter,
  NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";
import { useAtomValue } from "jotai";

import {
  useSession,
  useEvents,
  contactsAtom,
  tagValues,
  dedupe,
  parseJSON,
  User,
  Markdown,
  People,
  EventProps,
} from "@ngine/react";
import { ChevronDown } from "@ngine/icons";

interface Recommendation {
  ev: NDKEvent;
  recommenders: string[];
}

function useRecommendedApps(event: NDKEvent): Recommendation[] {
  const contacts = useAtomValue(contactsAtom);
  const [session] = useSession();
  const pubkey = session?.pubkey;
  const { events: reccs } = useEvents(
    {
      kinds: [NDKKind.AppRecommendation],
      "#d": [String(event.kind)],
    },
    {
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    },
  );
  const recommendedApps = useMemo(() => {
    return reccs.reduce(
      (acc, ev) => {
        const addresses = tagValues(ev, "a").filter((a) =>
          a.startsWith(`${NDKKind.AppHandler}:`),
        );
        for (const address of addresses) {
          const soFar = acc[address] ?? [];
          acc[address] = dedupe(soFar.concat([ev.pubkey]));
        }
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }, [reccs]);

  const filter = useMemo(() => {
    return Object.keys(recommendedApps).reduce(
      (acc, a) => {
        const [, pubkey, d] = a.split(":");
        // @ts-ignore
        acc.authors.push(pubkey);
        acc["#d"].push(d);
        return acc;
      },
      {
        kinds: [NDKKind.AppHandler],
        authors: [],
        "#d": [],
      } as NDKFilter,
    );
  }, [recommendedApps]);

  const { events } = useEvents(filter, {
    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
  });

  const recommended = useMemo(() => {
    return events
      .sort((a, b) => {
        const aRecommendations = recommendedApps[a.tagId()];
        const aNetworkReccomendations = aRecommendations.reduce((acc, pk) => {
          if (pk === pubkey) {
            return acc + 42;
          }
          if (contacts.includes(pk)) {
            return acc + 1;
          }
          return acc;
        }, 0);
        const aScore = aRecommendations.length + aNetworkReccomendations;
        const bRecommendations = recommendedApps[b.tagId()];
        const bNetworkReccomendations = bRecommendations.reduce((acc, pk) => {
          if (pk === pubkey) {
            return acc + 42;
          }
          if (contacts.includes(pk)) {
            return acc + 1;
          }
          return acc;
        }, 0);
        const bScore = bRecommendations.length + bNetworkReccomendations;
        return bScore - aScore;
      })
      .map((ev) => {
        return { ev, recommenders: recommendedApps[ev.tagId()] };
      })
      .slice(0, 10);
  }, [events, recommendedApps]);

  return recommended;
}

function AppMenuItem({
  event,
  unknownEvent,
  recommenders,
}: {
  event: NDKEvent;
  unknownEvent: NDKEvent;
  recommenders: string[];
}) {
  const [session] = useSession();
  const pubkey = session?.pubkey;
  const isPreferredApp = useMemo(() => {
    return recommenders.includes(pubkey as string);
  }, [recommenders, pubkey]);
  const app = useMemo(() => parseJSON(event.content, null), [event]);
  const markers = unknownEvent.isParamReplaceable()
    ? ["", "naddr", "nevent"]
    : ["", "note", "nevent"];
  const handler = event.tags.find((t) => markers.includes(t[2]));
  const url = useMemo(() => {
    if (handler) {
      const template = handler[1];
      return template.replace("<bech32>", unknownEvent.encode());
    }
  }, [handler]);

  function onClick() {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return app ? (
    <MenuItem isDisabled={!url} onClick={onClick}>
      <HStack w="100%" gap={8} justify="space-between">
        <HStack>
          {(app.picture || app.image) && (
            <Image width="21px" height="21px" src={app.picture || app.image} />
          )}
          {isPreferredApp ? (
            <HStack>
              <Text>{app.display_name || app.name}</Text>
              <Icon as={StarIcon} boxSize={3} color="brand.500" />
            </HStack>
          ) : (
            <Text>{app.display_name || app.name}</Text>
          )}
        </HStack>
        <People
          size="xs"
          sx={{ pointerEvents: "none" }}
          pubkeys={recommenders}
        />
      </HStack>
    </MenuItem>
  ) : null;
}

export function RecommendedAppMenu({ event }: EventProps) {
  const recommended = useRecommendedApps(event);
  return (
    <Menu isLazy>
      <MenuButton
        as={Button}
        variant="solid"
        colorScheme="brand"
        isDisabled={recommended.length === 0}
        size={{ base: "xs", sm: "sm" }}
        rightIcon={<ChevronDown />}
      >
        Open
      </MenuButton>
      <MenuList>
        {recommended.map(({ ev, recommenders }) => (
          <AppMenuItem
            key={ev.tagId()}
            unknownEvent={event}
            event={ev}
            recommenders={recommenders}
          />
        ))}
      </MenuList>
    </Menu>
  );
}

export default function UnknownKind({ event, showReactions }: EventProps) {
  const alt = event.tagValue("alt");

  return (
    <Card variant="unknown">
      <CardHeader>
        <HStack align="center" justify="space-between">
          <User pubkey={event.pubkey} />
          <RecommendedAppMenu event={event} />
        </HStack>
      </CardHeader>
      <CardBody>
        {alt ? (
          <Text
            as="blockquote"
            sx={{
              paddingStart: 4,
              borderStartWidth: "4px",
              borderStartColor: "gray.200",
              _dark: {
                borderStartColor: "gray.600",
              },
            }}
          >
            <Markdown content={alt} tags={event.tags} />
          </Text>
        ) : (
          <Text>Unknown event kind: {event.kind}</Text>
        )}
      </CardBody>
      {showReactions && <CardFooter></CardFooter>}
    </Card>
  );
}
