import {
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import { Copy, Dots } from "@ngine/icons";
import useCopy from "@ngine/hooks/useCopy";

interface EventMenuProps {
  event: NDKEvent;
}

export default function EventMenu({ event }: EventMenuProps) {
  const toast = useToast();
  const copy = useCopy();
  function copyId() {
    copy(`nostr:${event.encode()}`);
    toast({
      title: "Event ID copied",
      status: "success",
      position: "top-right",
      isClosable: true,
      duration: 1500,
    });
  }
  return (
    <Menu>
      <MenuButton>
        <Icon as={Dots} boxSize={3} color="gray.400" />
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon as={Copy} />} onClick={copyId}>
          Copy ID
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
