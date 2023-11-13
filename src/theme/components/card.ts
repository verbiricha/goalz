import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const goal = definePartsStyle({
  container: {
    boxShadow: "md",
  },
  body: {
    paddingY: "20px",
    paddingX: "24px",
  },
  footer: {
    paddingTop: 0,
  },
});

export const cardTheme = defineMultiStyleConfig({ variants: { goal } });
