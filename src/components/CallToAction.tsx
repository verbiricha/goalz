import { Stack, Heading, Text, Tag, Button } from "@chakra-ui/react";

interface CallToActionProps {
  label: string;
  title: string;
  description: string;
  ctaText: string;
  ctaAction(): void;
}

export default function CallToAction({
  label,
  title,
  description,
  ctaText,
  ctaAction,
}: CallToActionProps) {
  return (
    <Stack
      align="center"
      gap={8}
      w={{
        base: "xs",
        sm: "sm",
        md: "md",
        lg: "lg",
      }}
    >
      <Tag>{label}</Tag>
      <Heading textAlign="center">{title}</Heading>
      <Text textAlign="center">{description}</Text>
      <Button onClick={ctaAction}>{ctaText}</Button>
    </Stack>
  );
}
