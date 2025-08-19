import { format, parseISO, differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const utcNow = () => new Date().toISOString();

export const getLocalTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const isoToLocalDate = (iso: string, tz: string) => utcToZonedTime(parseISO(iso), tz);

export const localToUtcIso = (localDate: Date, tz: string) => zonedTimeToUtc(localDate, tz).toISOString();

export const formatLocal = (date: Date, fmt: string) => format(date, fmt);

export const relativeTime = (iso: string) => formatDistanceToNow(parseISO(iso), { addSuffix: true });

export const isWithinMinutes = (iso1: string, iso2: string, minutes: number) => Math.abs(differenceInMinutes(parseISO(iso1), parseISO(iso2))) < minutes;

export { format, parseISO }; // Export the date-fns functions directly for use in other modules