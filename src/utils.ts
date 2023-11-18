import type { NDKEvent } from "@nostr-dev-kit/ndk";

export function dedupeByPubkey(list: NDKEvent[]): NDKEvent[] {
  return list.reduce(
    (acc, item) => {
      const i = item.pubkey;
      if (!acc.seen.has(i)) {
        acc.result.push(item);
      }
      acc.seen.add(i);
      return acc;
    },
    { result: [] as NDKEvent[], seen: new Set() },
  ).result;
}
