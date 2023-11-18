import { decode } from "light-bolt11-decoder";
import { NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";

import { unixNow } from "@ngine/time";

export function makeZapRequest({
  p,
  pubkey,
  amount,
  relays,
  event,
  comment,
}: {
  p: string;
  pubkey: string;
  amount: number;
  relays: string[];
  event?: NDKEvent;
  comment?: string;
}): NostrEvent {
  const msats = amount * 1000;
  return {
    pubkey,
    kind: NDKKind.ZapRequest,
    created_at: unixNow(),
    content: comment || "",
    tags: [
      ["p", p],
      ...[event ? event.tagReference() : []],
      ["amount", String(msats)],
      ["relays", ...relays],
    ],
  };
}

export function getZapRequest(zap: NDKEvent): NostrEvent | undefined {
  let zapRequest = zap.tagValue("description");
  if (zapRequest) {
    try {
      if (zapRequest.startsWith("%")) {
        zapRequest = decodeURIComponent(zapRequest);
      }
      return JSON.parse(zapRequest);
    } catch (e) {
      console.warn("Invalid zap", zapRequest);
    }
  }
}

export function getZapAmount(zap: NDKEvent): number {
  try {
    const invoice = zap.tagValue("bolt11");
    if (invoice) {
      const decoded = decode(invoice);
      const amount = decoded.sections.find(({ name }) => name === "amount");
      return amount ? Number(amount.value) / 1000 : 0;
    }
    return 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export interface ZapRequest extends NostrEvent {
  created_at: number;
  amount: number;
}

export interface ZapsSummary {
  zapRequests: ZapRequest[];
  total: number;
}

export function zapsSummary(zaps: NDKEvent[]): ZapsSummary {
  const zapRequests = zaps
    .map((z) => {
      return { ...getZapRequest(z), amount: getZapAmount(z) } as ZapRequest;
    })
    .sort((a, b) => b.amount - a.amount);
  const total = zapRequests.reduce((acc, { amount }) => {
    return acc + amount;
  }, 0);
  return { zapRequests, total };
}

export interface ZapSplit {
  pubkey: string;
  percentage: number;
}

export function getZapSplits(ev: NDKEvent): ZapSplit[] {
  const zapTags = ev.getMatchingTags("zap");
  return zapTagsToSplits(zapTags);
}

export function zapTagsToSplits(zapTags: string[][]): ZapSplit[] {
  const totalWeight = zapTags.reduce((acc, t) => {
    return acc + Number(t[3] ?? "");
  }, 0);
  return zapTags.map((t) => {
    const [, pubkey, , weight] = t;
    const percentage = (Number(weight) / totalWeight) * 100;
    return { pubkey, percentage };
  });
}
