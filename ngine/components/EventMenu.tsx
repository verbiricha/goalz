import {
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from "@chakra-ui/react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import { useFeedback, ReactionEvents, ReactionModal } from "@ngine/react";
import { Copy, Dots, Brackets, Heart } from "@ngine/icons";
import useCopy from "@ngine/hooks/useCopy";

interface EventMenuProps {
  event: NDKEvent;
  kinds: NDKKind[];
  events: ReactionEvents;
}

export default function EventMenu({ event, kinds, events }: EventMenuProps) {
  const { success, error } = useFeedback();
  const copy = useCopy();
  const reactionsModal = useDisclosure();

  async function copyId() {
    try {
      await copy(`nostr:${event.encode()}`);
      success("Event ID copied");
    } catch (e) {
      error("Couldn't copy event ID");
    }
  }

  async function copyRaw() {
    try {
      const raw = event.rawEvent();
      await copy(JSON.stringify(raw, null, 2));
      success("Event copied");
    } catch (e) {
      error("Couldn't copy event");
    }
  }

  return (
    <>
      <Menu>
        <MenuButton>
          <Icon as={Dots} boxSize={5} color="gray.400" />
        </MenuButton>
        <MenuList>
          <MenuItem icon={<Icon as={Heart} />} onClick={reactionsModal.onOpen}>
            Reactions
          </MenuItem>
          <MenuItem icon={<Icon as={Copy} />} onClick={copyId}>
            Copy ID
          </MenuItem>
          <MenuItem icon={<Icon as={Brackets} />} onClick={copyRaw}>
            Copy JSON
          </MenuItem>
        </MenuList>
      </Menu>
      <ReactionModal kinds={kinds} events={events} {...reactionsModal} />
    </>
  );
}
