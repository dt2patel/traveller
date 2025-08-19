
import { TravelEvent } from "@/types";

export const generateCSV = (events: TravelEvent[], dateRange: { start?: string, end?: string }): void => {
  const filteredEvents = events.filter(event => {
    if (!dateRange.start || !dateRange.end) return true;
    const eventDate = new Date(event.occurredAt).getTime();
    const startDate = new Date(dateRange.start).getTime();
    const endDate = new Date(dateRange.end).getTime();
    return eventDate >= startDate && eventDate <= endDate;
  });

  if (filteredEvents.length === 0) {
    alert("No events found in the selected date range.");
    return;
  }

  const headers = ['type', 'occurredAt(UTC)', 'occurredTz', 'notes', 'createdAt(UTC)', 'updatedAt(UTC)'];
  const rows = filteredEvents.map(event => [
    event.type,
    event.occurredAt,
    event.occurredTz,
    event.notes || '',
    event.createdAt,
    event.updatedAt
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute("download", `india_travel_log_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
