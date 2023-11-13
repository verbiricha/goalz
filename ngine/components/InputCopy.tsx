import {
  useToast,
  Button,
  InputGroup,
  Input,
  InputRightElement,
} from "@chakra-ui/react";
import type { InputGroupProps } from "@chakra-ui/react";

import useCopy from "@ngine/hooks/useCopy";

interface InputCopyProps extends InputGroupProps {
  text: string;
  copyText?: string;
  showToast?: boolean;
}

export default function InputCopy({
  text,
  copyText,
  showToast,
  ...rest
}: InputCopyProps) {
  const toast = useToast();
  const copy = useCopy();

  async function handleClick() {
    try {
      await copy(copyText ?? text);
      if (showToast) {
        toast({
          description: "Copied to clipboard",
          status: "success",
          position: "top-right",
          isClosable: true,
          duration: 1500,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <InputGroup size="md" {...rest}>
      <Input readOnly pr="4.5rem" type="text" value={text} />
      <InputRightElement width="4.5rem">
        <Button variant="solid" h="1.75rem" size="sm" onClick={handleClick}>
          Copy
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
