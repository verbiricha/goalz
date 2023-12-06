import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const brand = defineStyle({
  fontWeight: 500,
  color: "brand.500",
  _dark: {
    color: "brand.300",
  },

  _hover: {
    textDecoration: "none",
  },
});

const nav = defineStyle({
  fontSize: "18px",
  fontWeight: 700,
  _hover: {
    textDecorationStyle: "dotted",
  },
});

export default defineStyleConfig({
  defaultProps: { variant: "brand" },
  variants: { brand, nav },
});
