import React, { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import EventsList from './components/EventsList';
import { fetchCalendarEvents, getAddToCalendarUrl } from './services/calendarService';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await fetchCalendarEvents();
        setEvents(fetchedEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load calendar events. Please make sure the calendar is public.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    
    // Refresh events every 5 minutes
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">The 🏳️‍🌈 Boyz Events</h1>
          <a
            href={getAddToCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="add-calendar-btn"
          >
            📅 Add to Google Calendar
          </a>
        </div>
      </header>
      
      <main className="app-main">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <p className="error-hint">
              To make your calendar public, go to Google Calendar settings → 
              Share with specific people → Make available to public
            </p>
          </div>
        ) : (
          <>
            <Calendar events={events} />
            <EventsList events={events} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
