import {
  Stack,
  StackProps,
  Heading,
  Text,
  Tag,
  Button,
} from "@chakra-ui/react";

interface CallToActionProps extends StackProps {
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
  ...rest
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
      {...rest}
    >
      <Tag>{label}</Tag>
      <Heading textAlign="center">{title}</Heading>
      <Text textAlign="center">{description}</Text>
      <Button onClick={ctaAction}>{ctaText}</Button>
    </Stack>
  );
}
