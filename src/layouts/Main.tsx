import { Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import Header from "@goalz/components/Header";
import Footer from "@goalz/components/Footer";

export default function Main() {
  return (
    <Stack align="center" justify="center">
      <Header />
      <Outlet />
      <Footer />
    </Stack>
  );
}
