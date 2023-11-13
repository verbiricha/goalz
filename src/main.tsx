import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

import { NgineProvider } from "@ngine/context";
import { DEFAULT_RELAYS } from "@ngine/const";

import theme from "./theme";
import { HOME, GOAL, NEW_GOAL, PROFILE, ALL, ONBOARDING } from "./routes";
import Main from "./layouts/Main";
import LoggedIn from "./layouts/LoggedIn";
import Home from "./pages/Home";
import NewGoal from "./pages/NewGoal";
import Goal from "./pages/Goal";
import Profile from "./pages/Profile";
import All from "./pages/All";
import Onboarding from "./pages/Onboarding";

// NDK Instance
const dexieAdapter = new NDKCacheAdapterDexie({ dbName: "goalz" });
const ndk = new NDK({
  explicitRelayUrls: DEFAULT_RELAYS,
  outboxRelayUrls: ["wss://relay.snort.social", "wss://purplepag.es"],
  enableOutboxModel: true,
  cacheAdapter: dexieAdapter,
});

// Router

const router = createBrowserRouter([
  {
    element: <Main />,
    loader: async () => {
      console.log("Connecting NDK");
      await ndk.connect();
      return null;
    },
    children: [
      {
        path: HOME,
        element: <Home />,
      },
      {
        path: ONBOARDING,
        element: <Onboarding />,
      },
      {
        path: GOAL,
        element: <Goal />,
      },
      {
        path: PROFILE,
        element: <Profile />,
      },
      {
        element: <LoggedIn />,
        children: [
          {
            path: NEW_GOAL,
            element: <NewGoal />,
          },
          {
            path: ALL,
            element: <All />,
          },
        ],
      },
      // faq
      // my goals
      // privacy
      // terms
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NgineProvider ndk={ndk} theme={theme} router={router}></NgineProvider>
  </React.StrictMode>,
);
