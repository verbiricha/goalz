import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(avatarAnatomy.keys);

const baseStyle = definePartsStyle({
  excessLabel: {
    bg: "transparent",
    color: "gray.500",
    marginLeft: "0.05rem",
  },
});

export const avatarTheme = defineMultiStyleConfig({ baseStyle });
