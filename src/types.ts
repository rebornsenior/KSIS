export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'forum' | 'education' | 'monetize' | string;
  time: string;
  location: string;
  rsvps: string[];
  link?: string;
}
