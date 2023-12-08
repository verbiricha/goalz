import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const note = definePartsStyle({
  container: {
    boxShadow: "md",
    w: "100%",
    maxW: "410px",
  },
  header: {
    paddingBottom: 0,
  },
  body: {
    paddingY: "20px",
    paddingX: "24px",
  },
  footer: {
    paddingTop: 0,
  },
});

const unknown = definePartsStyle({
  container: {
    boxShadow: "md",
  },
  header: {
    paddingBottom: 0,
  },
  body: {
    paddingY: "20px",
    paddingX: "24px",
  },
  footer: {
    paddingTop: 0,
  },
});

export default defineMultiStyleConfig({ variants: { note, unknown } });
