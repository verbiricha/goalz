import { Theme, extendTheme } from "@chakra-ui/react";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/700.css";

import {
  buttonTheme,
  tagTheme,
  cardTheme,
  progressTheme,
  linkTheme,
  avatarTheme,
} from "./theme/components";

const theme = extendTheme({
  fonts: {
    heading: `'Figtree', sans-serif`,
    body: `'Figtree', sans-serif`,
  },
  colors: {
    brand: {
      50: "#FAF6FF",
      100: "#E8DAFF",
      200: "#B1A4E9",
      300: "#8B7BE7",
      400: "#6652E5",
      500: "#6941C6",
      600: "#5E32BA",
      700: "#5730B1",
      800: "#512FAB",
      900: "#4F1AA5",
    },
  },
  components: {
    Button: buttonTheme,
    Tag: tagTheme,
    Card: cardTheme,
    Progress: progressTheme,
    Link: linkTheme,
    Avatar: avatarTheme,
  },
}) as Theme;

export default theme;
