import React from "react";
import ReactDOM from "react-dom/client";
import { IntlProvider } from "react-intl";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

import { NgineProvider } from "@ngine/context";
import { DEFAULT_RELAYS } from "@ngine/const";

import Link from "@goalz/components/Link";
import theme from "./theme";
import {
  HOME,
  GOAL,
  NEW_GOAL,
  PROFILE,
  ALL,
  ONBOARDING,
  SUPPORT,
  HASHTAG,
} from "./routes";
import Main from "./layouts/Main";
import LoggedIn from "./layouts/LoggedIn";
import Home from "./pages/Home";
import NewGoal from "./pages/NewGoal";
import Goal from "./pages/Goal";
import Profile from "./pages/Profile";
import All from "./pages/All";
import Onboarding from "./pages/Onboarding";
import Support from "./pages/Support";
import Hashtag from "./pages/Hashtag";

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
        path: SUPPORT,
        element: <Support />,
      },
      {
        path: HASHTAG,
        element: <Hashtag />,
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

// todo: locale, messages
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntlProvider locale="en-US">
      <NgineProvider
        ndk={ndk}
        theme={theme}
        links={{
          component: Link,
          npub: (npub) => `/p/${npub}`,
          nprofile: (nprofile) => `/p/${nprofile}`,
          nevent: (nevent) => `/e/${nevent}`,
          t: (tag) => `/t/${tag}`,
        }}
      >
        <RouterProvider router={router} />
      </NgineProvider>
    </IntlProvider>
  </React.StrictMode>,
);
