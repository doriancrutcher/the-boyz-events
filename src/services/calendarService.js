import ICAL from 'ical.js';

export const CALENDAR_EMAIL = 'thegayboyzevents@gmail.com';
const PUBLIC_ICAL_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_EMAIL)}/public/basic.ics`;

// URL to add this calendar to Google Calendar
export const getAddToCalendarUrl = () => {
  const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_EMAIL)}/public/basic.ics`;
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icalUrl)}`;
};

// CORS proxies to bypass browser CORS restrictions
// Try multiple proxies as fallback
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

const tryFetchWithProxy = async (proxyUrl, attempt = 0) => {
  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    // Try next proxy if available
    if (attempt < CORS_PROXIES.length - 1) {
      const nextProxy = CORS_PROXIES[attempt + 1];
      const nextProxyUrl = `${nextProxy}${encodeURIComponent(PUBLIC_ICAL_URL)}`;
      return tryFetchWithProxy(nextProxyUrl, attempt + 1);
    }
    throw error;
  }
};

export const fetchCalendarEvents = async () => {
  try {
    // Try fetching through CORS proxy
    const proxyUrl = `${CORS_PROXIES[0]}${encodeURIComponent(PUBLIC_ICAL_URL)}`;
    const response = await tryFetchWithProxy(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const icalText = await response.text();
    const jcalData = ICAL.parse(icalText);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    const events = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      const eventId = vevent.getFirstPropertyValue('uid');
      
      // Log event IDs for debugging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Event: "${event.summary || 'Untitled'}" | ID: ${eventId}`);
      }
      
      return {
        id: eventId,
        title: event.summary || 'Untitled Event',
        start: start,
        end: end,
        description: event.description || '',
        location: event.location || '',
      };
    });
    
    // Filter out past events and sort by start date
    const now = new Date();
    const upcomingEvents = events
      .filter(event => event.end >= now)
      .sort((a, b) => a.start - b.start);
    
    return upcomingEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    
    // If CORS error, provide helpful message
    if (error.message && error.message.includes('CORS')) {
      console.error('CORS error detected. The calendar feed may need to be accessed through a proxy in development.');
    }
    
    // Return empty array if there's an error (calendar might not be public or CORS issue)
    return [];
  }
};
