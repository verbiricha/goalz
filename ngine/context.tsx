import { useEffect, createContext, useContext } from "react";
import { IntlProvider } from "react-intl";
import { RouterProvider } from "react-router-dom";
import { useAtom } from "jotai";
import { Theme, ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NDK, {
  NDKKind,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";

import { followsAtom } from "@ngine/state";
import { DEFAULT_RELAYS } from "@ngine/const";
import useSession from "@ngine/hooks/useSession";

const queryClient = new QueryClient();

interface NgineContext {
  ndk: NDK;
  nip07Login: () => Promise<NDKUser | undefined>;
  nsecLogin: (nsec: string) => Promise<NDKUser>;
}

const NgineContext = createContext<NgineContext>({
  ndk: new NDK({ explicitRelayUrls: DEFAULT_RELAYS }),
  nip07Login: () => {
    return Promise.reject();
  },
  nsecLogin: () => {
    return Promise.reject();
  },
});

interface NgineProviderProps {
  ndk: NDK;
  theme?: Theme;
  router: any; // todo: type this
  locale?: string;
}

// todo: change locale. locale messages.

export const NgineProvider = ({
  ndk,
  router,
  theme,
  locale = "en-US",
}: NgineProviderProps) => {
  const [session, setSession] = useSession();
  const [contacts, setContacts] = useAtom(followsAtom);

  async function nip07Login() {
    const signer = new NDKNip07Signer();
    const user = await signer.blockUntilReady();
    if (user) {
      ndk.signer = signer;
      setSession({
        method: "nip07",
        pubkey: user.pubkey,
      });
    }
    return user;
  }

  async function nsecLogin(privkey: string) {
    const signer = new NDKPrivateKeySigner(privkey);
    const user = await signer.blockUntilReady();
    if (user) {
      ndk.signer = signer;
      setSession({
        method: "nsec",
        pubkey: user.pubkey,
        privkey,
      });
    }
    return user;
  }

  useEffect(() => {
    if (session?.pubkey) {
      ndk
        .fetchEvent({
          kinds: [NDKKind.Contacts],
          authors: [session.pubkey],
        })
        .then((c) => {
          const lastSeen = contacts?.created_at ?? 0;
          if (c && c.created_at && c.created_at > lastSeen) {
            setContacts(c);
          }
        });
    }
  }, [session]);

  useEffect(() => {
    if (session?.method === "nip07") {
      const sig = new NDKNip07Signer();
      ndk.signer = sig;
    } else if (session?.method === "nsec") {
      const sig = new NDKPrivateKeySigner(session.privkey);
      ndk.signer = sig;
    }
  }, [session]);

  return (
    <NgineContext.Provider value={{ ndk, nip07Login, nsecLogin }}>
      <IntlProvider locale={locale}>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ChakraProvider>
      </IntlProvider>
    </NgineContext.Provider>
  );
};

export const useExtensionLogin = () => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.nip07Login;
};

export const useNsecLogin = () => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.nsecLogin;
};

export const useNDK = () => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.ndk;
};
