
import { format, parseISO, differenceInMinutes, differenceInDays, formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const nowUTC = (): string => new Date().toISOString();

export const getLocalTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatEventDate = (isoString: string): string => {
  const date = parseISO(isoString);
  return format(date, 'MMM d, yyyy, h:mm a');
};

export const formatEventDateWithTz = (isoString: string, tz: string): string => {
  try {
    return formatInTimeZone(parseISO(isoString), tz, 'MMM d, yyyy, h:mm a (z)');
  } catch (e) {
    console.warn(`Invalid timezone '${tz}', falling back to local formatting.`);
    return formatEventDate(isoString);
  }
};

export const formatRelativeTime = (isoString: string): string => {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
};

export const isWithinMinutes = (isoString1: string, isoString2: string, minutes: number): boolean => {
  const diff = Math.abs(differenceInMinutes(parseISO(isoString1), parseISO(isoString2)));
  return diff <= minutes;
};

export const daysBetween = (isoStart: string, isoEnd: string): number => {
    return differenceInDays(parseISO(isoEnd), parseISO(isoStart));
}
