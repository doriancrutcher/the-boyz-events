import React from 'react';
import moment from 'moment';
import './EventsList.css';

const EventsList = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="events-list-container">
        <h2>Upcoming Events</h2>
        <p className="no-events">No upcoming events found.</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY');
  };

  const formatTime = (date) => {
    return moment(date).format('h:mm A');
  };

  return (
    <div className="events-list-container">
      <h2>Upcoming Events</h2>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-date">
              <div className="event-month">{moment(event.start).format('MMM')}</div>
              <div className="event-day">{moment(event.start).format('D')}</div>
            </div>
            <div className="event-details">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-info">
                <div className="event-time">
                  <span className="info-icon">🕐</span>
                  {formatDate(event.start)} • {formatTime(event.start)}
                  {event.end && ` - ${formatTime(event.end)}`}
                </div>
                {event.location && (
                  <div className="event-location">
                    <span className="info-icon">📍</span>
                    {event.location}
                  </div>
                )}
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
