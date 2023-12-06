import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  Text,
  Button,
} from "@chakra-ui/react";

import { useFeedback, useSession, User, EventProps } from "@ngine/react";

import Repost from "./Repost";

interface RepostModalProps extends EventProps {
  isOpen: boolean;
  onClose(): void;
}

export default function RepostModal({
  event,
  isOpen,
  onClose,
  components,
}: RepostModalProps) {
  const [session] = useSession();
  const canSign = session?.pubkey;
  const [isBusy, setIsBusy] = useState(false);
  const { success, error } = useFeedback();

  async function onRepost() {
    try {
      setIsBusy(true);
      await event.repost();
      success("Reposted");
      onClose();
    } catch (e) {
      error("Unable to repost", (e as Error)?.message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Repost</Text>
            <User pubkey={event.pubkey} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {canSign && (
            <Repost
              author={session.pubkey}
              event={event}
              components={components}
              showReactions={false}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={!canSign}
            isLoading={isBusy}
            variant="solid"
            colorScheme="brand"
            onClick={onRepost}
          >
            Repost
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
