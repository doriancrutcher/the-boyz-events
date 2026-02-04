import ICAL from 'ical.js';

export const CALENDAR_EMAIL = 'thegayboyzevents@gmail.com';
const PUBLIC_ICAL_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_EMAIL)}/public/basic.ics`;

// URL to add this calendar to Google Calendar
export const getAddToCalendarUrl = () => {
  const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_EMAIL)}/public/basic.ics`;
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icalUrl)}`;
};

// CORS proxy to bypass browser CORS restrictions
// Using allorigins.win as a free CORS proxy service
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const fetchCalendarEvents = async () => {
  try {
    // Fetch through CORS proxy to avoid CORS issues
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(PUBLIC_ICAL_URL)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar',
      },
    });

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
      
      return {
        id: vevent.getFirstPropertyValue('uid'),
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
