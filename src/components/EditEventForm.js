import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitEventEdit, applyEditDirectly } from '../services/eventEditService';
import './EditEventForm.css';

const EditEventForm = ({ event, onClose, onSuccess }) => {
  const { currentUser, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    chatUrl: event.chatUrl || '',
    partifulLink: event.partifulLink || '',
    instaHandle: event.instaHandle || event.instagramHandle || '',
    eventOwner: event.eventOwner || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isAdmin) {
        // Admin can apply changes directly
        await applyEditDirectly(event.id, formData);
        setSuccess('Event updated successfully!');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else {
          setTimeout(() => onClose(), 1500);
        }
      } else {
        // Regular users submit for approval
        await submitEventEdit(event.id, {
          ...formData,
          originalEvent: event
        }, currentUser.uid, currentUser.email);
        setSuccess('Edit request submitted! The admin will review it.');
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit edit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="edit-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isAdmin ? 'Edit Event' : 'Request Event Edit'}</h3>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="close-btn"
          >
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="chatUrl">Chat URL</label>
            <input
              id="chatUrl"
              type="url"
              name="chatUrl"
              value={formData.chatUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://discord.gg/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="partifulLink">Partiful Link</label>
            <input
              id="partifulLink"
              type="url"
              name="partifulLink"
              value={formData.partifulLink}
              onChange={handleChange}
              className="form-input"
              placeholder="https://partiful.com/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventOwner">Event Owner Name</label>
            <input
              id="eventOwner"
              type="text"
              name="eventOwner"
              value={formData.eventOwner}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instaHandle">Instagram Handle</label>
            <input
              id="instaHandle"
              type="text"
              name="instaHandle"
              value={formData.instaHandle}
              onChange={handleChange}
              className="form-input"
              placeholder="@username or username"
            />
          </div>

          {!isAdmin && (
            <p className="admin-note">
              Note: Your changes will be reviewed by an admin before being applied.
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Saving...' : isAdmin ? 'Save Changes' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;
