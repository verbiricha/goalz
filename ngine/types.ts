import { ReactNode } from "react";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export type Fragment = string | ReactNode;

export type EventComponent = (props: EventProps) => ReactNode;
export type Components = Record<number, EventComponent>;

export type LoginMethod = "nip07" | "nsec";

export interface Session {
  method: LoginMethod;
  pubkey: string;
  privkey?: string;
}

export interface EventProps {
  event: NDKEvent;
  components?: Components;
  showReactions?: boolean;
}
