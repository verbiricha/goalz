import { formatRelativeTime } from "@ngine/format";

export function unixNow() {
  return Math.round(Date.now() / 1000);
}

interface FormattedRelativeTimeProps {
  timestamp: number;
}

export function FormattedRelativeTime({
  timestamp,
}: FormattedRelativeTimeProps) {
  return <>{formatRelativeTime(timestamp)}</>
}
