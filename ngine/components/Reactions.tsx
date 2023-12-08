import {
  useColorModeValue,
  useDisclosure,
  As,
  Flex,
  FlexProps,
  HStack,
  StackProps,
  Text,
  Icon,
  Image,
} from "@chakra-ui/react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import {
  useSession,
  useReactions,
  EventMenu,
  ReactionEvents,
  RepostModal,
  ReplyModal,
  ReactionPicker,
  ZapModal,
  EventProps,
} from "@ngine/react";
import { Zap, Heart, Reply, Repost } from "@ngine/icons";
import { ZapRequest } from "@ngine/nostr/nip57";

const defaultReactions = [NDKKind.Zap, NDKKind.Reaction];

interface ReactionCountProps extends FlexProps {
  icon: As;
  count: string | number;
  reaction?: NDKEvent | ZapRequest;
}

// todo: components
function ReactionCount({ icon, count, reaction, ...rest }: ReactionCountProps) {
  const emoji = reaction?.kind === NDKKind.Reaction ? reaction.content : null;
  const hasReacted = Boolean(reaction);
  const highlighted = useColorModeValue("brand.500", "brand.100");
  const customEmoji = reaction?.tags.find(
    (t) =>
      emoji &&
      t[0] === "emoji" &&
      t[1] === `${emoji.slice(1, emoji?.length - 1)}`,
  );
  return (
    <Flex align="center" gap={2} direction="row" {...rest}>
      {customEmoji ? (
        <Image boxSize={4} src={customEmoji[2]} />
      ) : emoji && !["+", "-"].includes(emoji) ? (
        <Text fontSize="md">{emoji}</Text>
      ) : (
        <Icon as={icon} color={hasReacted ? highlighted : "currentColor"} />
      )}
      <Text color={hasReacted ? highlighted : undefined}>{count}</Text>
    </Flex>
  );
}

interface ReactionCountsProps extends EventProps, StackProps {
  kinds: NDKKind[];
  events: ReactionEvents;
}

export function ReactionCounts({
  event,
  kinds,
  components,
  events,
  ...rest
}: ReactionCountsProps) {
  const zapModal = useDisclosure();
  const repostModal = useDisclosure();
  const reactionModal = useDisclosure();
  const replyModal = useDisclosure();
  const [session] = useSession();
  const pubkey = session?.pubkey;
  const { zaps, reactions, replies, reposts } = events;
  const { zapRequests, total } = zaps;

  return (
    <HStack color="gray.500" fontSize="sm" spacing={6} {...rest}>
      {kinds.map((k) => {
        if (k === NDKKind.Text) {
          const reaction = replies.find((ev) => ev.pubkey === pubkey);
          return (
            <>
              <ReactionCount
                icon={Reply}
                count={replies.length}
                reaction={reaction}
                onClick={pubkey ? replyModal.onOpen : undefined}
                cursor={pubkey ? "pointer" : "auto"}
              />
              <ReplyModal
                event={event}
                components={components}
                {...replyModal}
              />
            </>
          );
        } else if (k === NDKKind.Zap) {
          const reaction = zapRequests.find((r) => r.pubkey === pubkey);
          return (
            <>
              <ReactionCount
                icon={Zap}
                count={total}
                reaction={reaction}
                onClick={pubkey ? zapModal.onOpen : undefined}
                cursor={pubkey ? "pointer" : "auto"}
              />
              <ZapModal pubkey={event.pubkey} event={event} {...zapModal} />
            </>
          );
        } else if (k === NDKKind.Reaction) {
          const reaction = reactions.find((r) => r.pubkey === pubkey);
          return (
            <>
              <ReactionCount
                icon={Heart}
                count={reactions.length}
                reaction={reaction}
                onClick={pubkey ? reactionModal.onOpen : undefined}
                cursor={pubkey ? "pointer" : "auto"}
              />
              <ReactionPicker
                event={event}
                components={components}
                {...reactionModal}
              />
            </>
          );
        } else if (k === NDKKind.Repost || k === NDKKind.GenericRepost) {
          const repost = reposts.find((r) => r.pubkey === pubkey);
          return (
            <>
              <ReactionCount
                icon={Repost}
                count={reposts.length}
                reaction={repost}
                onClick={pubkey ? repostModal.onOpen : undefined}
                cursor={pubkey ? "pointer" : "auto"}
              />
              <RepostModal
                event={event}
                components={components}
                {...repostModal}
              />
            </>
          );
        }
      })}
    </HStack>
  );
}

interface ReactionsProps extends EventProps {
  kinds?: NDKKind[];
}

// todo: only live when visible
export default function Reactions({
  event,
  kinds = defaultReactions,
  ...props
}: ReactionsProps) {
  const events = useReactions(event, kinds);

  return (
    <HStack w="100%" align="center" justifyContent="space-between">
      <ReactionCounts event={event} kinds={kinds} events={events} {...props} />
      <EventMenu event={event} kinds={kinds} events={events} />
    </HStack>
  );
}
// todo: Reactions + Menu as single component with one sub
