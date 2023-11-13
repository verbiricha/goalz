import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const contrast = defineStyle({
  background: "black",
  color: "white",
  borderRadius: "48px",

  _dark: {
    background: "white",
    color: "black",
  },
});

export const buttonTheme = defineStyleConfig({
  defaultProps: {
    variant: "contrast",
  },
  variants: { contrast },
});
