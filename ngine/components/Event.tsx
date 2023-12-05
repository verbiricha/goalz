import { useMemo, createElement } from "react";
import { NDKKind } from "@nostr-dev-kit/ndk";

import { Note, EventProps, Components } from "@ngine/react";

const defaultComponents = {
  [NDKKind.Text]: Note,
} as Components;

export default function Event({ event, components, ...props }: EventProps) {
  const component = useMemo(() => {
    // @ts-ignore
    if (components && components[event.kind]) {
      const element = components[event.kind as number];
      return (
        // @ts-ignore
        createElement(element, { ...props, event, components })
      );
    }
    if (defaultComponents[event.kind as number]) {
      const element = defaultComponents[event.kind as number];
      return (
        // @ts-ignore
        createElement(element, { ...props, event, components })
      );
    }
    return null;
  }, [event, components]);
  return component;
}
