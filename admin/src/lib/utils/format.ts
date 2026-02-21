import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy h:mm a");
}

export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}
