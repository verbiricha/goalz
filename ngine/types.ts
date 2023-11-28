import { ReactNode } from "react";

export type Fragment = string | ReactNode;

export type EventComponent = (props: any) => ReactNode;
export type Components = Record<number, EventComponent>;

export type LoginMethod = "nip07" | "nsec";

export interface Session {
  method: LoginMethod;
  pubkey: string;
  privkey?: string;
}
