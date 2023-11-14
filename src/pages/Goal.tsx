import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { useParams, Navigate } from "react-router-dom";

import { Goal } from "@goalz/components/Goal";
import { HOME } from "@goalz/routes";

export default function GoalPage() {
  const { nevent } = useParams();
  const decoded = useMemo(() => {
    return nip19.decode(nevent ?? "")?.data;
  }, [nevent]);

  if (!decoded) {
    return <Navigate to={HOME} replace />;
  }

  return (
    // @ts-ignore
    <Goal id={decoded.id} author={decoded.author} relays={decoded.relays} />
  );
}
