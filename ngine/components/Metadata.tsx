import { useMemo } from "react";
import {
  Card,
  CardBody,
  CardProps,
  Stack,
  HStack,
  Image,
} from "@chakra-ui/react";

import {
  parseJSON,
  FollowButton,
  Markdown,
  User,
  EventProps,
  LightningAddress,
  NPub,
  NSec,
} from "@ngine/react";

// todo: custom emoji
//
interface MetadataProps extends EventProps, CardProps {
  privkey?: string;
}

export default function Metadata({ event, privkey, ...rest }: MetadataProps) {
  const profile = useMemo(() => parseJSON(event.content, {}), [event]);
  return (
    <Card {...rest}>
      {profile?.banner && (
        <Image
          src={profile.banner}
          maxH="236px"
          borderTopRadius="8px"
          fit="cover"
        />
      )}
      <CardBody>
        <Stack gap={3}>
          <HStack align="center" justify="space-between">
            <User pubkey={event.pubkey} />
            <FollowButton variant="outline" pubkey={event.pubkey} />
          </HStack>
          {profile?.about && (
            <Markdown content={profile.about} tags={event.tags} />
          )}
          {profile?.lud16 && (
            <LightningAddress pubkey={event.pubkey} address={profile.lud16} />
          )}
          <NPub pubkey={event.pubkey} />
          {privkey && <NSec privkey={privkey} />}
        </Stack>
      </CardBody>
    </Card>
  );
}
