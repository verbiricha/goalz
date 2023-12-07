import { useMemo } from "react";
import { FormattedDate } from "react-intl";
import { useNavigate } from "react-router-dom";
import {
  useColorModeValue,
  Flex,
  Box,
  Skeleton,
  Card,
  CardBody,
  CardFooter,
  HStack,
  Image,
  Stack,
  Heading,
  HeadingProps,
  Text,
  Progress,
  AvatarGroup,
  Tag,
  TagLabel,
  Button,
  Icon,
} from "@chakra-ui/react";
import type { CardProps } from "@chakra-ui/react";
import { NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { useAtomValue } from "jotai";

import { Image as ImageIcon } from "@ngine/icons";
import {
  User,
  Avatar,
  Amount,
  Event,
  ZapButton,
  FormattedRelativeTime,
  Reactions,
  Markdown,
  EventProps,
  EventMenu,
} from "@ngine/react";
import useEvent from "@ngine/nostr/useEvent";
import useEvents from "@ngine/nostr/useEvents";
import useProfile from "@ngine/nostr/useProfile";
import {
  zapsSummary,
  getZapSplits,
  zapTagsToSplits,
  ZapRequest,
} from "@ngine/nostr/nip57";
import { currencyAtom } from "@ngine/state";
import { useLinkComponent, useLink } from "@ngine/context";

import Link from "@goalz/components/Link";
import ExternalLink from "@goalz/components/ExternalLink";
import { GOAL, DEFAULT_RELAYS } from "@goalz/const";

function useCurrency() {
  const currency = useAtomValue(currencyAtom);
  return currency;
}

interface GoalInfo {
  link: string;
  title: string;
  closedAt: Date | null;
  image?: string;
  isExpired: boolean;
  description?: string;
  relays: string[];
  goal: number;
  href?: string;
  tags: string[];
}

function useGoalInfo(event: NDKEvent): GoalInfo {
  const profile = useProfile(event.pubkey);
  const link = useMemo(() => {
    return `/e/${event.encode()}`;
  }, [event.id]);
  const title = useMemo(() => {
    return event.content;
  }, [event.id]);
  const closedAt = useMemo(() => {
    const closed = event.tagValue("closed_at");
    return closed ? new Date(Number(closed) * 1000) : null;
  }, [event.id]);
  const isExpired = closedAt ? closedAt < new Date() : false;
  const description = useMemo(() => {
    return event.tagValue("summary");
  }, [event.id]);
  const image = useMemo(() => {
    return event.tagValue("image") || profile?.image;
  }, [event.id, profile?.image]);
  const relays = useMemo(() => {
    const rs = event.getMatchingTags("relays");
    if (rs.length === 0) return DEFAULT_RELAYS;
    return rs[0].slice(1);
  }, [event.id]);
  const goal = useMemo(() => {
    return Number(event.tagValue("amount")) / 1000;
  }, [event.id]);
  const href = useMemo(() => {
    return event.tagValue("r");
  }, [event.id]);
  const tags = useMemo(() => {
    return event.tags.filter((t) => t[0] === "t").map((t) => t[1]);
  }, [event.id]);

  return {
    link,
    title,
    closedAt,
    isExpired,
    description,
    image,
    relays,
    goal,
    href,
    tags,
  };
}

interface RaisedProps {
  latest?: number;
  goal: number;
  raised: number;
}

export function Raised({ latest, goal, raised }: RaisedProps) {
  const currency = useCurrency();
  const progress = useMemo(
    () => (goal > 0 ? (raised / goal) * 100 : 0),
    [raised, goal],
  );
  const isAchieved = progress >= 100;
  return (
    <Stack gap={1}>
      {latest && (
        <Text color="gray.500">
          Latest donation <FormattedRelativeTime timestamp={latest} />
        </Text>
      )}
      <Progress value={progress} colorScheme="green" size="sm" />
      <Flex justify="space-between" gap={2} wrap="wrap">
        <HStack spacing={1}>
          <Text fontWeight={600}>
            <Amount amount={raised} currency={currency} />
          </Text>
          <Text color="gray.500">/</Text>
          <Text fontWeight={600}>
            <Amount amount={goal} currency={currency} />
          </Text>
        </HStack>
        <Text fontWeight={600}>
          {isAchieved ? "100" : progress === 0 ? "0" : progress.toFixed(2)}%
          funded
        </Text>
      </Flex>
    </Stack>
  );
}

interface BeneficiariesProps {
  event: NDKEvent;
  zaps: ZapRequest[];
}

export function Beneficiaries({ event, zaps }: BeneficiariesProps) {
  const currency = useCurrency();
  const zapSplits = useMemo(() => getZapSplits(event), [event]);
  return zapSplits.length > 0 ? (
    <Stack gap={2}>
      <Heading fontSize="md">Beneficiaries</Heading>
      {zapSplits.map(({ pubkey, percentage }) => {
        const got = zaps
          .filter((z) => z.tags.find((t) => t[0] === "p" && t[1] === pubkey))
          .reduce((acc, z) => acc + z.amount, 0);
        return (
          <Flex key={pubkey} align="center" justify="space-between">
            <User pubkey={pubkey} size="xs" />
            <HStack gap={1}>
              <Text fontSize="xs">%{percentage.toFixed(0)}</Text>
              <Text fontSize="xs">
                ({got > 0 ? <Amount amount={got} currency={currency} /> : "-"})
              </Text>
            </HStack>
          </Flex>
        );
      })}
    </Stack>
  ) : null;
}

interface GoalCardProps extends EventProps, CardProps {}

export function GoalCard({
  event,
  showReactions = true,
  ...rest
}: GoalCardProps) {
  const {
    link,
    title,
    closedAt,
    isExpired,
    description,
    image,
    relays,
    goal,
    href,
    tags,
  } = useGoalInfo(event);
  const navigate = useNavigate();
  // Zaps
  const { events: zaps } = useEvents(
    {
      kinds: [NDKKind.Zap],
      "#e": [event.id],
    },
    {
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
      closeOnEose: false,
    },
    relays,
  );
  const latest = useMemo(() => {
    const sorted = [...zaps];
    return sorted.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0]
      ?.created_at;
  }, [zaps]);
  const { zapRequests, total } = useMemo(() => {
    return zapsSummary(zaps);
  }, [zaps]);
  const zappers = useMemo(() => {
    const contributions = zapRequests.reduce(
      (acc: Record<string, number>, z: ZapRequest) => {
        const soFar = acc[z.pubkey] ?? 0;
        acc[z.pubkey] = soFar + z.amount;
        return acc;
      },
      {},
    );
    return Object.entries(contributions)
      .sort((c1, c2) => c2[1] - c1[1])
      .map((c) => c[0]);
  }, [zapRequests]);
  return (
    <Card variant="goal" w={{ base: "xs", md: "sm" }} {...rest}>
      <Box cursor="pointer" position="relative" onClick={() => navigate(link)}>
        {image && (
          <>
            <Image
              h="236px"
              w="100%"
              objectFit="cover"
              borderTopLeftRadius="md"
              borderTopRightRadius="md"
              src={image}
              alt={title}
            />
          </>
        )}
        {closedAt && (
          <Tag
            variant="gray"
            sx={{ position: "absolute", top: "20px", right: "16px" }}
          >
            {isExpired ? "Expired" : "Expires"}{" "}
            <FormattedDate
              value={closedAt}
              year="numeric"
              month="numeric"
              day="numeric"
            />
          </Tag>
        )}
      </Box>
      <CardBody>
        <Stack gap={2}>
          <Heading cursor="pointer" size="md" onClick={() => navigate(link)}>
            {title}
          </Heading>
          <User pubkey={event.pubkey} />
          {description && <Markdown fontSize="sm" content={description} />}
          <HStack wrap="wrap">
            {tags.map((t) => (
              <Tag size="sm" variant="subtle">
                <TagLabel>{t}</TagLabel>
              </Tag>
            ))}
          </HStack>
          {href && <ExternalLink href={href} />}
          <Raised latest={latest} goal={goal} raised={total} />
          <Beneficiaries event={event} zaps={zapRequests} />
          <Stack gap={4} w="100%">
            <HStack align="center" justifyContent="space-between">
              <AvatarGroup size="sm" max={3} spacing="-0.4em">
                {zappers.map((pubkey) => (
                  <Avatar key={pubkey} pubkey={pubkey} />
                ))}
              </AvatarGroup>
              <ZapButton
                variant="contrast"
                pubkey={event.pubkey}
                event={event}
              />
            </HStack>
          </Stack>
        </Stack>
      </CardBody>
      {showReactions && (
        <CardFooter>
          <HStack align="center" justifyContent="space-between" w="100%">
            <Reactions
              event={event}
              reactions={[NDKKind.GenericRepost, NDKKind.Reaction]}
              components={{
                [GOAL]: GoalCard,
              }}
            />
            <EventMenu
              event={event}
              reactions={[NDKKind.GenericRepost, NDKKind.Reaction]}
            />
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

interface GoalDetailProps extends CardProps {
  event: NDKEvent;
}

export function GoalDetail({ event }: GoalDetailProps) {
  const currency = useCurrency();
  const {
    link,
    title,
    closedAt,
    isExpired,
    description,
    image,
    relays,
    goal,
    href,
    tags,
  } = useGoalInfo(event);
  const navigate = useNavigate();
  // Zaps
  const { events: zaps } = useEvents(
    {
      kinds: [NDKKind.Zap],
      "#e": [event.id],
    },
    {
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
      closeOnEose: false,
    },
    relays,
  );
  const latest = useMemo(() => {
    const sorted = [...zaps];
    return sorted.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0]
      ?.created_at;
  }, [zaps]);
  const { zapRequests, total } = useMemo(() => {
    return zapsSummary(zaps);
  }, [zaps]);
  const groupedZapRequests = useMemo(() => {
    return zapRequests.reduce(
      (acc, obj) => {
        const key = obj.pubkey;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(obj);

        return acc;
      },
      {} as Record<string, ZapRequest[]>,
    );
  }, [zapRequests]);
  const hasMultipleBeneficiaries =
    event.tags.filter((t) => t[0] === "zap")?.length > 1;
  const msgColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Flex
      gap={3}
      direction="column"
      w={{ base: "xs", sm: "sm", md: "xl", lg: "3xl" }}
    >
      <Link href={link}>
        {image && (
          <>
            <Image
              maxH="320px"
              w="100%"
              objectFit="cover"
              borderTopLeftRadius="md"
              borderTopRightRadius="md"
              src={image}
              alt={title}
            />
          </>
        )}
        {closedAt && (
          <Tag
            variant="gray"
            sx={{ position: "absolute", top: "20px", right: "16px" }}
          >
            {isExpired ? "Expired" : "Expires"}{" "}
            <FormattedDate
              value={closedAt}
              year="numeric"
              month="numeric"
              day="numeric"
            />
          </Tag>
        )}
      </Link>
      <Stack gap={2}>
        <Heading cursor="pointer" size="md" onClick={() => navigate(link)}>
          {title}
        </Heading>
        <User pubkey={event.pubkey} />
        {description && <Markdown fontSize="sm" content={description} />}
        <HStack wrap="wrap">
          {tags.map((t) => (
            <Tag size="sm" variant="subtle">
              <TagLabel>{t}</TagLabel>
            </Tag>
          ))}
        </HStack>
        {href && <ExternalLink href={href} />}
        <Raised latest={latest} goal={goal} raised={total} />
        <Beneficiaries event={event} zaps={zapRequests} />
      </Stack>
      <Flex gap={2} direction="column" w="100%">
        <Heading fontSize="md">Contributions</Heading>
        {hasMultipleBeneficiaries
          ? Object.entries(groupedZapRequests).map((grouped) => {
              const [pk, zrs] = grouped;
              const message = zrs[0].content;
              return (
                <>
                  <Flex key={pk} align="center" justifyContent="space-between">
                    <User
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                      pubkey={pk}
                    />
                    <Text fontWeight={600} fontSize="lg">
                      <Amount
                        amount={zrs.reduce((acc, zr) => acc + zr.amount, 0)}
                        currency={currency}
                      />
                    </Text>
                  </Flex>
                  {message.length > 0 && (
                    <Text
                      as="blockquote"
                      fontSize={{ base: "sm", md: "md" }}
                      color={msgColor}
                      sx={{
                        borderLeft: "2px solid",
                        borderColor: "gray.300",
                        marginLeft: 5,
                        paddingLeft: 2,
                      }}
                    >
                      {message}
                    </Text>
                  )}
                </>
              );
            })
          : zapRequests.map((zr) => {
              return (
                <>
                  <Flex
                    key={zr.id}
                    align="center"
                    justifyContent="space-between"
                  >
                    <User
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "sm", md: "md" }}
                      pubkey={zr.pubkey}
                    />
                    <Text fontWeight={600} fontSize="lg">
                      <Amount amount={zr.amount} currency={currency} />
                    </Text>
                  </Flex>
                  {zr.content.length > 0 && (
                    <Text
                      as="blockquote"
                      fontSize={{ base: "sm", md: "md" }}
                      color={msgColor}
                      sx={{
                        borderLeft: "2px solid",
                        borderColor: "gray.300",
                        marginLeft: 5,
                        paddingLeft: 2,
                      }}
                    >
                      {zr.content}
                    </Text>
                  )}
                </>
              );
            })}
      </Flex>
      <ZapButton variant="contrast" pubkey={event.pubkey} event={event} />
    </Flex>
  );
}

interface SharesProps {
  zapTags: string[][];
  onDelete?: (pk: string) => void;
}

export function Shares({ zapTags, onDelete }: SharesProps) {
  const zapSplits = useMemo(() => zapTagsToSplits(zapTags), [zapTags]);
  return zapSplits.length > 0 ? (
    <Stack gap={2}>
      <Heading fontSize="md">Beneficiaries</Heading>
      {zapSplits.map(({ pubkey, percentage }) => {
        return (
          <Flex key={pubkey} align="center" justify="space-between">
            <User pubkey={pubkey} size="xs" />
            <HStack gap={2}>
              <Text fontSize="xs">%{percentage.toFixed(0)}</Text>
              {onDelete && (
                <Button
                  variant="solid"
                  colorScheme="red"
                  size="xs"
                  onClick={() => onDelete(pubkey)}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </Flex>
        );
      })}
    </Stack>
  ) : null;
}

interface GoalPreviewProps {
  pubkey: string;
  image?: string;
  title?: string;
  description?: string;
  href?: string;
  goal: number;
  closedAt?: Date;
  zapSplits: string[][];
  tags: string[];
}

export function GoalPreview({
  pubkey,
  image,
  title,
  description,
  href,
  goal,
  closedAt,
  tags,
  zapSplits,
}: GoalPreviewProps) {
  const isExpired = closedAt && closedAt < new Date();
  const imageFallback = (
    <Flex
      align="center"
      justify="center"
      bg="gray.200"
      h="236px"
      borderTopLeftRadius="md"
      borderTopRightRadius="md"
    >
      <Icon color="gray.500" as={ImageIcon} boxSize={5} opacity="0.6" />
    </Flex>
  );
  return (
    <Card variant="goal" w={{ base: "xs", md: "sm" }}>
      <Box position="relative">
        {image ? (
          <Image
            maxH="236px"
            w="100%"
            objectFit="cover"
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
            src={image}
            alt={title}
            fallback={imageFallback}
          />
        ) : (
          imageFallback
        )}
        {closedAt && (
          <Tag
            variant="gray"
            sx={{ position: "absolute", top: "20px", right: "16px" }}
          >
            {isExpired ? "Expired" : "Expires"}{" "}
            <FormattedDate
              value={closedAt}
              year="numeric"
              month="numeric"
              day="numeric"
            />
          </Tag>
        )}
      </Box>
      <CardBody>
        <Stack gap={2}>
          {title ? (
            <Heading size="md">{title}</Heading>
          ) : (
            <Heading size="md" color="gray.500">
              Add a title
            </Heading>
          )}
          <User pubkey={pubkey} />
          {description && <Markdown fontSize="sm" content={description} />}
          <HStack wrap="wrap">
            {tags.map((t) => (
              <Tag size="sm" variant="subtle">
                <TagLabel>{t}</TagLabel>
              </Tag>
            ))}
          </HStack>
          {href && <ExternalLink href={href} />}
          <Raised goal={goal} raised={0} />
          <Shares zapTags={zapSplits} />
        </Stack>
      </CardBody>
    </Card>
  );
}

interface GoalProps {
  id: string;
  author?: string;
  relays?: string[];
}

export function Goal({ id, author, relays }: GoalProps) {
  const event = useEvent(
    {
      ids: [id],
      ...(author ? { authors: [author] } : {}),
    },
    relays,
  );

  if (!event) {
    return <Skeleton />;
  }

  if (event.kind === GOAL) {
    return <GoalDetail event={event} />;
  } else {
    return <Event event={event} />;
  }
}

function getRandomValueMappedTo100() {
  const randomValue = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
  const nearestMultipleOf100 = Math.round(randomValue / 100) * 100;
  return nearestMultipleOf100;
}

function getRandomNumberInRangeWithIncrements(
  base = 42,
  increment = 16,
  maxIncrement = 2,
) {
  const randomIncrement = Math.floor(Math.random() * maxIncrement);
  const result = base + randomIncrement * increment;
  return result;
}

function getRandomElement<T>(list: T[]) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export function GoalBubble({ event }: { event: NDKEvent }) {
  const { image } = useGoalInfo(event);

  const multipleOf100 = useMemo(() => {
    return getRandomValueMappedTo100();
  }, [event]);

  const color = useMemo(() => {
    return getRandomElement(["brand", "orange", "teal", "pink"]);
  }, [event]);

  const size = useMemo(() => {
    return getRandomNumberInRangeWithIncrements();
  }, [event]);

  return (
    <Box
      border="2px solid"
      borderColor={`${color}.${multipleOf100}`}
      borderRadius="50%"
    >
      <Image
        width={`${size}px`}
        height={`${size}px`}
        src={image}
        fit="cover"
        borderRadius="50%"
        border="2px solid"
        borderColor="chakra-body-bg"
      />
    </Box>
  );
}

interface GoalSummaryProps extends HeadingProps {
  event: NDKEvent;
}

export function GoalSummary({ event, ...rest }: GoalSummaryProps) {
  const { title } = useGoalInfo(event);
  const Link = useLinkComponent();
  const url = useLink("nevent", event.encode());
  return (
    <Link href={url}>
      <Heading fontSize="xl" color="chakra-body-text" {...rest}>
        {title}
      </Heading>
    </Link>
  );
}
