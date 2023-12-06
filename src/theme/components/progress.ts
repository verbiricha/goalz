import { progressAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  track: {
    borderRadius: "md",
  },
  filledTrack: {
    borderRadius: "md",
  },
});

export default defineMultiStyleConfig({ baseStyle });
