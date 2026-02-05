import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import EditEventForm from './EditEventForm';
import { toggleGoingStatus, getGoingCountsForEvents, getGoingStatusForEvents } from '../services/eventGoingService';
import { trackEventGoing, trackEventEdit } from '../services/analyticsService';
import './EventsList.css';

const EventsList = ({ events, onEventUpdate }) => {
  const { currentUser, isAdmin } = useAuth();
  const [editingEvent, setEditingEvent] = useState(null);
  const [goingStatus, setGoingStatus] = useState({});
  const [goingCounts, setGoingCounts] = useState({});
  const [updatingGoing, setUpdatingGoing] = useState({});
  
  // Filter out past events and cancelled events - only show upcoming events
  const now = new Date();
  const upcomingEvents = events.filter(event => {
    const eventEnd = new Date(event.end);
    return eventEnd >= now && !event.cancelled;
  });

  // Load going status and counts
  useEffect(() => {
    if (upcomingEvents.length === 0) return;

    const loadGoingData = async () => {
      try {
        const eventIds = upcomingEvents.map(e => e.id);
        
        // Load going counts for all events
        const counts = await getGoingCountsForEvents(eventIds);
        setGoingCounts(counts);
        
        // Load user's going status if logged in
        if (currentUser) {
          const status = await getGoingStatusForEvents(eventIds, currentUser.uid);
          setGoingStatus(status);
        }
      } catch (error) {
        console.error('Error loading going data:', error);
        // Don't block the UI if there's an error, just log it
      }
    };

    loadGoingData();
  }, [upcomingEvents, currentUser]);

  const handleToggleGoing = async (eventId) => {
    if (!currentUser) return;
    
    setUpdatingGoing(prev => ({ ...prev, [eventId]: true }));
    try {
      const userName = currentUser.displayName || currentUser.email || 'User';
      const event = upcomingEvents.find(e => e.id === eventId);
      const isGoing = await toggleGoingStatus(eventId, currentUser.uid, userName);
      
      // Track analytics
      if (event) {
        trackEventGoing(eventId, event.title, isGoing);
      }
      
      // Update local state
      setGoingStatus(prev => ({ ...prev, [eventId]: isGoing }));
      
      // Reload the actual count from database
      const counts = await getGoingCountsForEvents([eventId]);
      setGoingCounts(prev => ({
        ...prev,
        [eventId]: counts[eventId] || 0
      }));
    } catch (error) {
      console.error('Error toggling going status:', error);
      alert('Failed to update going status: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingGoing(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (upcomingEvents.length === 0) {
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
        {upcomingEvents.map((event) => (
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
                {(event.instagramHandle || event.instaHandle || event.eventOwner) && (
                  <div className="event-owner">
                    <span className="info-icon">👤</span>
                    {event.instagramHandle || event.instaHandle ? (
                      <a 
                        href={event.ownerInstagram || `https://instagram.com/${event.instagramHandle || event.instaHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="instagram-link"
                      >
                        @{event.instagramHandle || event.instaHandle}
                        {event.eventOwner && ` (${event.eventOwner})`}
                      </a>
                    ) : (
                      <span>{event.eventOwner}</span>
                    )}
                  </div>
                )}
                {event.chatUrl && (
                  <div className="event-chat">
                    <span className="info-icon">💬</span>
                    <a 
                      href={event.chatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-link"
                    >
                      Join Chat
                    </a>
                  </div>
                )}
                {event.partifulLink && (
                  <div className="event-partiful">
                    <span className="info-icon">🎉</span>
                    <a 
                      href={event.partifulLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="partiful-link"
                    >
                      View on Partiful
                    </a>
                  </div>
                )}
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}
                {event.flyerUrl && (
                  <div className="event-flyer">
                    <img 
                      src={event.flyerUrl} 
                      alt={`Flyer for ${event.title}`}
                      className="event-flyer-image"
                    />
                  </div>
                )}
                <div className="event-going-count">
                  <span className="info-icon">👥</span>
                  {goingCounts[event.id] || 0} {goingCounts[event.id] === 1 ? 'member' : 'members'} going
                </div>
              </div>
              {currentUser && (
                <div className="event-actions">
                  <button
                    onClick={() => handleToggleGoing(event.id)}
                    disabled={updatingGoing[event.id]}
                    className={`going-btn ${goingStatus[event.id] ? 'going-active' : ''}`}
                    title={goingStatus[event.id] ? "You're going - Click to remove" : "Mark as going"}
                  >
                    {updatingGoing[event.id] ? (
                      '...'
                    ) : goingStatus[event.id] ? (
                      <>
                        <span className="going-checkmark">✓</span> Going
                      </>
                    ) : (
                      '+ Going'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      trackEventEdit(event.id, event.title, isAdmin);
                      setEditingEvent(event);
                    }}
                    className="edit-event-btn"
                    title={isAdmin ? "Edit event" : "Request event edit"}
                  >
                    {isAdmin ? 'Edit' : 'Request Edit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {editingEvent && (
        <EditEventForm
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={onEventUpdate}
        />
      )}
    </div>
  );
};

export default EventsList;
