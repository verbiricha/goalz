import { formatRelativeTime } from "@ngine/format";

interface FormattedRelativeTimeProps {
  timestamp: number;
}

export default function FormattedRelativeTime({
  timestamp,
}: FormattedRelativeTimeProps) {
  return <>{formatRelativeTime(timestamp)}</>;
}
