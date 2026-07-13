import { parseISO, formatDistanceToNowStrict } from "date-fns";

export function formateDateForFeed(timestamp) {
  const safeTimestamp = timestamp.replace(" ", "T");
  const parsedDate = parseISO(safeTimestamp);

  const relativeTime = formatDistanceToNowStrict(parsedDate, {
    addSuffix: true,
  });

  return relativeTime
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d");
}
