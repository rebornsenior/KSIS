import type { CalendarEvent } from './types';

// Application links only use enabled Google Forms; related information is separate.
export function registrationLink(event: Pick<CalendarEvent, 'registrationEnabled' | 'registrationForm' | 'link'>): string | undefined {
  if (event.registrationEnabled === true) {
    try {
      const url = new URL(event.registrationForm || '');
      if (url.protocol === 'https:' && url.hostname === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[\w-]+\/viewform$/.test(url.pathname)) return url.href;
    } catch {}
    return undefined;
  }
  return undefined;
}
