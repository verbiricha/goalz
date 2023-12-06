import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tagAnatomy.keys);

const brand = definePartsStyle({
  container: {
    bg: "brand.100",
    color: "brand.900",
    fontWeight: 600,
    borderRadius: "48px",
    padding: "8px 12px",
  },
});

const gray = definePartsStyle({
  container: {
    bg: "gray.600",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "8px",
    padding: "4px 8px",
  },
});

export default defineMultiStyleConfig({
  defaultProps: {
    variant: "brand",
  },
  variants: {
    brand,
    gray,
  },
});
