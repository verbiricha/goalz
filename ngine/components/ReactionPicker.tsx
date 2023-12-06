import { useState, useEffect } from "react";
import { useColorMode, Box } from "@chakra-ui/react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useIntl } from "react-intl";

import { useFeedback, EventProps } from "@ngine/react";

interface ReactionPickerProps extends EventProps {
  isOpen: boolean;
  onClose(): void;
}

interface Emoji {
  native: string;
}

export default function ReactionPicker({
  event,
  isOpen,
  onClose,
}: ReactionPickerProps) {
  const { locale } = useIntl();
  const [isBusy, setIsBusy] = useState(false);
  const { colorMode } = useColorMode();
  const { success, error } = useFeedback();
  const [showPicker, setShowPicker] = useState(isOpen);

  useEffect(() => {
    setShowPicker(isOpen);
  }, [isOpen]);

  async function onReact({ native }: Emoji) {
    try {
      setIsBusy(true);
      await event.react(native);
      success(`Reacted with ${native}`);
      closePicker();
    } catch (e) {
      error("Unable to react", (e as Error)?.message);
    } finally {
      setIsBusy(false);
    }
  }

  function closePicker() {
    if (showPicker) {
      onClose();
      setShowPicker(false);
    }
  }
  // TOOD: locale

  return isOpen && !isBusy ? (
    <Box
      style={{
        position: "fixed",
        top: (window.innerHeight - 435) / 2,
        left: (window.innerWidth - 352) / 2,
        zIndex: 1,
      }}
    >
      <Picker
        data={data}
        theme={colorMode}
        locale={locale}
        onClickOutside={closePicker}
        onEmojiSelect={onReact}
      />
    </Box>
  ) : null;
}
