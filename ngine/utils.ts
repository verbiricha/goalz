interface HasPubkey {
  pubkey: string;
}

export function dedupeByPubkey<T extends HasPubkey>(evs: T[]): T[] {
  return evs.reduce(
    (acc, ev) => {
      if (acc.seen.has(ev.pubkey)) {
        return acc;
      }
      acc.seen.add(ev.pubkey);
      acc.result.push(ev);
      return acc;
    },
    {
      seen: new Set([]) as Set<string>,
      result: [] as T[],
    },
  ).result;
}
