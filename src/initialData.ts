import type { CalendarEvent } from './types';

const files = import.meta.glob('./content/calendar/*.json', { eager: true, import: 'default' });
export const INITIAL_EVENTS: CalendarEvent[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([filename, value]) => {
    const event = value as Partial<CalendarEvent>;
    return {
      ...event,
      id: event.id || filename.split('/').pop()!.replace(/\.json$/, ''),
      rsvps: event.rsvps || [],
    } as CalendarEvent;
  });
