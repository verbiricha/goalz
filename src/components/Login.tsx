import { useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  //MenuGroup,
  MenuDivider,
  Icon,
} from "@chakra-ui/react";

import Avatar from "@ngine/components/Avatar";
import useSession from "@ngine/hooks/useSession";
import { ChevronDown } from "@ngine/icons";
import { User, Target, Close } from "@ngine/icons";
import LoginDialog from "./LoginDialog";
//import CurrencySwitch from "./CurrencySwitch";

interface UserMenuProps {
  pubkey: string;
}

function UserMenu({ pubkey }: UserMenuProps) {
  const [, setSession] = useSession();
  const npub = nip19.npubEncode(pubkey);
  const navigate = useNavigate();

  function logOut() {
    setSession(null);
  }

  return (
    <Menu>
      <MenuButton
        variant="solid"
        size="sm"
        as={Button}
        rightIcon={<Icon as={ChevronDown} />}
      >
        <Avatar pubkey={pubkey} size="xs" />
      </MenuButton>
      <MenuList>
        <MenuItem
          icon={<Icon as={User} />}
          onClick={() => navigate(`/p/${npub}`)}
        >
          Profile
        </MenuItem>
        <MenuItem icon={<Icon as={Target} />} onClick={() => navigate(`/new`)}>
          New goal
        </MenuItem>
        <MenuDivider />
        {/*
        <MenuGroup title="Currency">
          <MenuItem closeOnSelect={false}>
            <CurrencySwitch />
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
	*/}
        <MenuItem icon={<Icon as={Close} />} onClick={logOut}>
          Log Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export default function Login() {
  const modalProps = useDisclosure();
  const [session] = useSession();

  return (
    <>
      {session ? (
        <UserMenu pubkey={session.pubkey} />
      ) : (
        <Button
          variant="solid"
          colorScheme="brand"
          size="sm"
          onClick={modalProps.onOpen}
        >
          Start a goal
        </Button>
      )}
      <Modal {...modalProps}>
        <ModalOverlay />
        <ModalContent dir="auto">
          <ModalHeader>Log in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LoginDialog
              onLogin={() => modalProps.onClose()}
              onOnboarding={() => modalProps.onClose()}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
