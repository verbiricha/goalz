import { useState, useMemo } from "react";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Switch,
} from "@chakra-ui/react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import {
  useNDK,
  useFeedback,
  useSession,
  unixNow,
  tagValues,
  User,
  Event,
  EventProps,
} from "@ngine/react";

interface ReplyModalProps extends EventProps {
  isOpen: boolean;
  onClose(): void;
}

// todo: quote with mention marker
// todo: explicitly add hashtags
export default function ReplyModal({
  event,
  isOpen,
  onClose,
  components,
}: ReplyModalProps) {
  const ndk = useNDK();
  const [session] = useSession();
  const canSign = session?.pubkey;
  const [comment, setComment] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const { success, error } = useFeedback();
  const [isPreview, setIsPreview] = useState(false);
  // fixme: not always all selected by default
  const pTags = useMemo(() => {
    return [
      event.pubkey,
      ...new Set(tagValues(event, "p").filter((pk) => pk !== event.pubkey)),
    ];
  }, [event]);
  const root = useMemo(() => {
    const rootTag = event.tags.find((t) => t[3] === "root");
    if (rootTag) {
      return rootTag[1];
    }
    return null;
  }, [event]);
  const isReply = useMemo(() => {
    return event.tags.find(
      (t) => t[0] === "e" && ["root", "mention", "reply"].includes(t[3]),
    );
  }, [event]);
  const [tagged, setTagged] = useState(pTags);
  const noteEvent = useMemo(() => {
    return new NDKEvent(ndk, {
      kind: NDKKind.Text,
      content: comment,
      created_at: unixNow(),
      tags: [
        ...(root ? [["e", root, event.relay?.url || "", "root"]] : []),
        ...(isReply ? [["e", event.id, event.relay?.url || "", "reply"]] : []),
        ...(!root && !isReply
          ? [["e", event.id, event.relay?.url || "", "root"]]
          : []),
        ...tagged.map((pk) => ["p", pk]),
      ],
      pubkey: session!.pubkey,
    });
  }, [event, comment, tagged, root, session]);

  async function replyEvent() {
    await noteEvent.sign();
    return noteEvent;
  }

  function closeModal() {
    setTagged(pTags);
    setComment("");
    setIsPreview(false);
    setIsBusy(false);
    onClose();
  }

  async function onReply() {
    try {
      setIsBusy(true);
      const ev = await replyEvent();
      await ev.publish();
      success("Replied");
      closeModal();
    } catch (e) {
      error("Unable to reply", (e as Error)?.message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Replying to </Text>
            <User pubkey={event.pubkey} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <Box maxH="320px" overflow="scroll">
              <Event
                key={event.id}
                event={event}
                showReactions={false}
                components={components}
              />
            </Box>
            {isPreview ? (
              <Event
                event={noteEvent}
                showReactions={false}
                components={components}
              />
            ) : (
              <>
                <FormControl>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    placeholder="Type your reply here"
                    value={comment}
                    onChange={(ev) => setComment(ev.target.value)}
                  />
                </FormControl>
                {pTags.length > 1 && (
                  <FormControl>
                    <FormLabel>Reply to</FormLabel>
                    <CheckboxGroup
                      value={tagged}
                      colorScheme="brand"
                      // @ts-ignore
                      onChange={setTagged}
                    >
                      <Stack direction={["column", "row"]} wrap="wrap">
                        {pTags.map((pk) => (
                          <Checkbox value={pk}>
                            <User size="xs" fontSize="sm" pubkey={pk} />
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                )}
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%" justify="space-between">
            <FormControl alignItems="center" display="flex">
              <FormLabel mb={0} htmlFor="enable-preview">
                Preview
              </FormLabel>
              <Switch
                id="enable-preview"
                isChecked={isPreview}
                onChange={(ev) => setIsPreview(ev.target.checked)}
                size="sm"
                colorScheme="brand"
              />
            </FormControl>
            <Button
              isDisabled={!canSign || comment.trim().length === 0}
              isLoading={isBusy}
              variant="solid"
              colorScheme="brand"
              onClick={onReply}
            >
              Reply
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
