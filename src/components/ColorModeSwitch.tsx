import { useColorMode, Switch, HStack, Icon } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

export default function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack justify="space-between" w="100%">
      <Switch
        colorScheme="brand"
        onChange={toggleColorMode}
        isChecked={colorMode === "light"}
        size="sm"
      >
        Light theme
      </Switch>

      <Icon
        as={colorMode === "light" ? SunIcon : MoonIcon}
        boxSize={3}
        color={colorMode === "dark" ? "brand.100" : "orange.500"}
      />
    </HStack>
  );
}
