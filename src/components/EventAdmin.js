import React, { useState, useEffect } from 'react';
import { getAllEventMetadata, setEventMetadata } from '../services/eventMetadataService';
import { cancelEvent } from '../services/eventCancellationService';
import './EventAdmin.css';

const EventAdmin = ({ events, onUpdate }) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [chatUrl, setChatUrl] = useState('');
  const [partifulLink, setPartifulLink] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [eventOwner, setEventOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedEventId) {
      loadEventMetadata(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEventMetadata = async (eventId) => {
    try {
      const allMetadata = await getAllEventMetadata();
      const metadata = allMetadata[eventId] || {};
      setChatUrl(metadata.chatUrl || '');
      setPartifulLink(metadata.partifulLink || '');
      setInstagramHandle(metadata.instaHandle || metadata.instagramHandle || '');
      setEventOwner(metadata.eventOwner || '');
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      setMessage('Please select an event');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const metadata = {};
      if (chatUrl.trim()) {
        metadata.chatUrl = chatUrl.trim();
      }
      if (partifulLink.trim()) {
        metadata.partifulLink = partifulLink.trim();
      }
      if (instagramHandle.trim()) {
        const cleanHandle = instagramHandle.trim().replace('@', '');
        metadata.instaHandle = cleanHandle;
        metadata.eventOwner = eventOwner.trim() || cleanHandle;
        metadata.ownerInstagram = `https://instagram.com/${cleanHandle}`;
      } else if (eventOwner.trim()) {
        metadata.eventOwner = eventOwner.trim();
      }

      const success = await setEventMetadata(selectedEventId, metadata);
      
      if (success) {
        setMessage('Event metadata saved successfully!');
        if (onUpdate) {
          onUpdate();
        }
        // Clear form after a delay
        setTimeout(() => {
          setMessage('');
          setChatUrl('');
          setPartifulLink('');
          setInstagramHandle('');
          setEventOwner('');
        }, 2000);
      } else {
        setMessage('Failed to save event metadata');
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
      setMessage('Error saving event metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!selectedEventId || !selectedEvent) {
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel "${selectedEvent.title}"? All users who marked "going" will be notified.`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await cancelEvent(selectedEventId, selectedEvent.title);
      setMessage(`Event cancelled successfully! ${result.notifiedCount} user(s) were notified.`);
      
      if (onUpdate) {
        onUpdate();
      }
      
      // Clear form after a delay
      setTimeout(() => {
        setMessage('');
        setChatUrl('');
        setPartifulLink('');
        setInstagramHandle('');
        setEventOwner('');
        setSelectedEventId('');
      }, 3000);
    } catch (error) {
      console.error('Error cancelling event:', error);
      setMessage('Error cancelling event: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="event-admin-container">
      <h2>Manage Event Details</h2>
      <form onSubmit={handleSave} className="event-admin-form">
        <div className="form-group">
          <label htmlFor="event-select">Select Event:</label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="event-select"
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.start).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="event-id-info">
            <small>
              <strong>Event ID:</strong> <code>{selectedEvent.id}</code>
              <br />
              <span className="info-text">This is automatically used as the Firestore document ID</span>
            </small>
          </div>
        )}

        {selectedEvent && (
          <>
            <div className="form-group">
              <label htmlFor="chat-url">Chat URL:</label>
              <input
                id="chat-url"
                type="url"
                value={chatUrl}
                onChange={(e) => setChatUrl(e.target.value)}
                placeholder="https://discord.gg/... or https://chat.example.com/..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="partiful-link">Partiful Link:</label>
              <input
                id="partiful-link"
                type="url"
                value={partifulLink}
                onChange={(e) => setPartifulLink(e.target.value)}
                placeholder="https://partiful.com/..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-owner">Event Owner Name:</label>
              <input
                id="event-owner"
                type="text"
                value={eventOwner}
                onChange={(e) => setEventOwner(e.target.value)}
                placeholder="Owner name (optional)"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="instagram-handle">Instagram Handle:</label>
              <input
                id="instagram-handle"
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@username or username"
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="save-btn"
            >
              {loading ? 'Saving...' : 'Save Event Details'}
            </button>
            
            <button
              type="button"
              onClick={handleCancelEvent}
              disabled={loading}
              className="cancel-event-btn"
            >
              Cancel Event
            </button>
          </>
        )}

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default EventAdmin;
