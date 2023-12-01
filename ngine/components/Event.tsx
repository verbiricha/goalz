import { useMemo, createElement } from "react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";

import Note from "@ngine/components/Note";
import { Components } from "@ngine/types";

export interface EventProps {
  event: NDKEvent;
  components?: Components;
}

const defaultComponents = {
  [NDKKind.Text]: Note,
} as Components;

export default function Event({ event, components }: EventProps) {
  const component = useMemo(() => {
    // @ts-ignore
    if (components && components[event.kind]) {
      const element = components[event.kind as number];
      return (
        // @ts-ignore
        createElement(element, { event })
      );
    }
    if (defaultComponents[event.kind as number]) {
      const element = defaultComponents[event.kind as number];
      return (
        // @ts-ignore
        createElement(element, { event })
      );
    }
    return null;
  }, [event, components]);
  return component;
}
