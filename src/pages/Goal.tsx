import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { Skeleton } from "@chakra-ui/react";
import { useParams, Navigate } from "react-router-dom";

import { Goal } from "@goalz/components/Goal";
import { HOME } from "@goalz/routes";

export default function GoalPage() {
  const { nevent } = useParams();
  const decoded = useMemo(() => {
    return nip19.decode(nevent ?? "");
  }, [nevent]);

  if (!decoded || !["note", "nevent"].includes(decoded.type)) {
    return <Navigate to={HOME} replace />;
  }

  if (decoded.type === "note") {
    return <Goal key={decoded.data} id={decoded.data} />;
  }
  if (decoded.type === "nevent") {
    return (
      <Goal
        key={decoded.data.id}
        id={decoded.data.id}
        author={decoded.data.author}
        relays={decoded.data.relays}
      />
    );
  }
  return <Skeleton />;
}
