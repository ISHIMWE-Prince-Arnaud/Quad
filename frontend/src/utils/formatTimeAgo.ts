import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date as a relative time string (e.g., "5m ago", "2h ago")
 */
export const formatTimeAgo = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
    .replace('about ', '')
    .replace('less than a minute', '1m')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'y')
    .replace(' year', 'y');
};

/**
 * Format a date as a full date and time string
 */
export const formatFullDateTime = (date: string | Date): string => {
  return format(new Date(date), 'PPpp');
};
