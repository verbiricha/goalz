import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Button,
} from "@chakra-ui/react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import User from "@ngine/components/User";
import useFeedback from "@ngine/hooks/useFeedback";
import useSession from "@ngine/hooks/useSession";
import { Components } from "@ngine/types";

import Repost from "./Repost";
import Quote, { useQuote } from "./Quote";

interface RepostModalProps {
  event: NDKEvent;
  isOpen: boolean;
  onClose(): void;
  components?: Components;
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
  const [comment, setComment] = useState("");
  const { success, error } = useFeedback();
  const isQuote = comment.trim().length > 0;
  const quote = useQuote({ event, comment, author: session?.pubkey || "" });

  async function onRepost() {
    try {
      setIsBusy(true);
      if (isQuote) {
        await quote.sign();
        await quote.publish();
        success("Quoted");
      } else {
        await event.repost();
        success("Reposted");
      }
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
            <Text>{isQuote ? "Quote" : "Repost"}</Text>
            <User pubkey={event.pubkey} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {canSign && (
            <Stack>
              <FormControl>
                <FormLabel>Comment</FormLabel>
                <Textarea
                  placeholder="Optional message"
                  value={comment}
                  onChange={(ev) => setComment(ev.target.value)}
                />
              </FormControl>
              {isQuote ? (
                <Quote
                  author={session.pubkey}
                  event={event}
                  components={components}
                  showReactions={false}
                  comment={comment}
                />
              ) : (
                <Repost
                  author={session.pubkey}
                  event={event}
                  components={components}
                  showReactions={false}
                />
              )}
            </Stack>
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
            {isQuote ? "Quote" : "Repost"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
