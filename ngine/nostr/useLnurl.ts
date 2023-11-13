import useProfile from "@ngine/nostr/useProfile";

interface LnurlSettings {
  minSendable: number;
  maxSendable: number;
  callback: string;
}

export default function useLnurl(pubkey: string) {
  const profile = useProfile(pubkey);

  return profile?.lud16;
}
