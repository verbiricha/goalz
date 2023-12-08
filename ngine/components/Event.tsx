import { useMemo, createElement } from "react";
import { NDKKind } from "@nostr-dev-kit/ndk";

import {
  Note,
  Metadata,
  UnknownKind,
  EventProps,
  Components,
} from "@ngine/react";

const defaultComponents = {
  [NDKKind.Text]: Note,
  [NDKKind.Metadata]: Metadata,
  // todo: app
  // todo: contact list
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
    return createElement(UnknownKind, { ...props, event, components });
  }, [event, components]);
  return component;
}
