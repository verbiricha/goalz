export type LoginMethod = "nip07" | "nsec";

export interface Session {
  method: LoginMethod;
  pubkey: string;
  privkey?: string;
}
