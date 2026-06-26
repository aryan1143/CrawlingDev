import { parseISO, format } from "date-fns";

export function formateDateForProjectCard(timestamp) {
  const safeTimestamp = timestamp.replace(" ", "T");
  const parsedDate = parseISO(safeTimestamp);

  const formattedDate = format(parsedDate, "dd MMM yyyy");

  return formattedDate;
}
