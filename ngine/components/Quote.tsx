import { useMemo } from "react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import { useNDK, Note, EventProps } from "@ngine/react";
import { unixNow } from "@ngine/time";

interface QuoteProps extends EventProps {
  comment: string;
  author: string;
}

export function useQuote({
  event,
  author,
  comment,
}: {
  event: NDKEvent;
  author: string;
  comment: string;
}): NDKEvent {
  const ndk = useNDK();
  const quote = useMemo(() => {
    const quoteEvent = {
      kind: NDKKind.Text,
      content: `${comment}\nnostr:${event.encode()}`,
      created_at: unixNow(),
      pubkey: author,
      tags: [["p", event.pubkey], event.tagReference()],
    };
    return new NDKEvent(ndk, quoteEvent);
  }, [event, comment, author]);
  return quote;
}

export default function Quote({
  comment,
  author,
  event,
  ...props
}: QuoteProps) {
  const quote = useQuote({ event, author, comment });
  return <Note {...props} event={quote} />;
}
