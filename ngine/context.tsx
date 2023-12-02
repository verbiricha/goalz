import {
  useEffect,
  createContext,
  useContext,
  ReactNode,
  ReactElement,
} from "react";
import { useAtom } from "jotai";
import {
  Theme,
  ChakraProvider,
  ColorModeScript,
  Link,
  LinkProps,
} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NDK, {
  NDKKind,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
  NDKEvent,
  NDKSigner,
} from "@nostr-dev-kit/ndk";
import { generatePrivateKey, getPublicKey } from "nostr-tools";

import { relaysAtom, latestRatesAtom, followsAtom } from "@ngine/state";
import { DEFAULT_RELAYS } from "@ngine/const";
import useSession from "@ngine/hooks/useSession";
import useRates from "@ngine/nostr/useRates";

const queryClient = new QueryClient();

export type LinkComponent = (props: LinkProps) => ReactElement | null;

export interface Links {
  component?: LinkComponent;
  npub?: (npub: string) => string;
  nprofile?: (nprofile: string) => string;
  nevent?: (nevent: string) => string;
  naddr?: (naddr: string) => string;
  //p?: (p: string) => string;
  //e?: (e: string) => string;
  //a?: (a: string) => string;
  t?: (t: string) => string;
}

interface NgineContext {
  ndk: NDK;
  nip07Login: () => Promise<NDKUser | undefined>;
  nsecLogin: (nsec: string) => Promise<NDKUser>;
  sign: (
    ev: Omit<NostrEvent, "pubkey">,
    signer?: NDKSigner,
  ) => Promise<NDKEvent>;
  links: Links;
}

const NgineContext = createContext<NgineContext>({
  ndk: new NDK({ explicitRelayUrls: DEFAULT_RELAYS }),
  nip07Login: () => {
    return Promise.reject();
  },
  nsecLogin: () => {
    return Promise.reject();
  },
  sign: () => {
    return Promise.reject();
  },
  links: {},
});

interface NgineProviderProps {
  ndk: NDK;
  theme: Theme;
  links: Links;
  children: ReactNode;
}

export const NgineProvider = ({
  ndk,
  theme,
  links,
  children,
}: NgineProviderProps) => {
  const [session, setSession] = useSession();
  const [, setRelays] = useAtom(relaysAtom);
  const [contacts, setContacts] = useAtom(followsAtom);
  const rates = useRates();
  const [, setLatestRates] = useAtom(latestRatesAtom);

  useEffect(() => {
    setLatestRates(rates);
  }, [rates]);

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
      ndk
        .fetchEvent({
          kinds: [NDKKind.RelayList],
          authors: [session.pubkey],
        })
        .then((r) => {
          if (r) {
            const relays = r.tags.filter((t) => t[0] === "r").map((t) => t[1]);
            setRelays(relays);
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

  async function sign(ev: Omit<NostrEvent, "pubkey">, signer?: NDKSigner) {
    if (session?.pubkey) {
      const ndkEvent = new NDKEvent(ndk, { ...ev, pubkey: session.pubkey });
      await ndkEvent.sign(signer);
      return ndkEvent;
    } else {
      const sk = generatePrivateKey();
      const pubkey = getPublicKey(sk);
      const sig = new NDKPrivateKeySigner(sk);
      await sig.blockUntilReady();
      const ndkEvent = new NDKEvent(ndk, { ...ev, pubkey });
      await ndkEvent.sign(sig);
      return ndkEvent;
    }
  }

  return (
    <NgineContext.Provider value={{ ndk, nip07Login, nsecLogin, sign, links }}>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            {children}
          </>
        </QueryClientProvider>
      </ChakraProvider>
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

export const useSign = () => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.sign;
};

export const useNDK = () => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.ndk;
};

type LinkType = keyof Links;

export const useLink = (type: LinkType, value: string): string => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  if (context.links[type]) {
    // @ts-ignore
    return context.links[type](value);
  }
  return `/${value}`;
};

export const useLinks = (): Links => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.links;
};

export const useLinkComponent = (): ((
  props: LinkProps,
) => ReactElement | null) => {
  const context = useContext(NgineContext);
  if (context === undefined) {
    throw new Error("Ngine context not found");
  }
  return context.links.component ?? Link;
};
