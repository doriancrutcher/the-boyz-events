import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitEventRequest, checkDailyLimit } from '../services/eventRequestService';
import { trackEventRequest } from '../services/analyticsService';
import './EventRequestForm.css';

const EventRequestForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    flyerImage: null
  });
  const [flyerType, setFlyerType] = useState('file'); // 'file' or 'url'
  const [flyerUrl, setFlyerUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dailyLimit, setDailyLimit] = useState(null);

  React.useEffect(() => {
    const checkLimit = async () => {
      if (currentUser) {
        const exceeded = await checkDailyLimit(currentUser.uid);
        setDailyLimit(exceeded);
      }
    };
    checkLimit();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        flyerImage: file
      }));
      setFlyerUrl(''); // Clear URL when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFlyerUrlChange = (e) => {
    const url = e.target.value;
    setFlyerUrl(url);
    setFormData(prev => ({ ...prev, flyerImage: null })); // Clear file when URL is entered
    setPreview(url || null);
  };

  const handleFlyerTypeChange = (type) => {
    setFlyerType(type);
    setFlyerUrl('');
    setFormData(prev => ({ ...prev, flyerImage: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Event title is required');
      }
      if (!formData.eventDate) {
        throw new Error('Event date is required');
      }

      // Prepare request data with flyer URL or image
      const requestData = {
        ...formData,
        flyerUrl: flyerType === 'url' && flyerUrl.trim() ? flyerUrl.trim() : null
      };
      
      await submitEventRequest(requestData, currentUser.uid, currentUser.email);
      
      // Track analytics
      trackEventRequest(!!(formData.flyerImage || (flyerType === 'url' && flyerUrl.trim())));
      
      setSuccess('Event request submitted successfully! The admin will review it and you\'ll be notified.');
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        eventTime: '',
        location: '',
        flyerImage: null
      });
      setPreview(null);
      
      // Refresh daily limit check
      const exceeded = await checkDailyLimit(currentUser.uid);
      setDailyLimit(exceeded);
    } catch (err) {
      setError(err.message || 'Failed to submit event request');
    } finally {
      setLoading(false);
    }
  };

  if (dailyLimit) {
    return (
      <div className="event-request-container">
        <div className="limit-message">
          <h3>Daily Limit Reached</h3>
          <p>You've reached the daily limit of 3 event requests. Please try again tomorrow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-request-container">
      <h2>Submit Event Request</h2>
      <p className="form-description">
        Fill out the details below or upload a flyer image. The admin will review your request.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="event-request-form">
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter event title"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventDate">Event Date *</label>
            <input
              id="eventDate"
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventTime">Event Time</label>
            <input
              id="eventTime"
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              className="form-input"
            />
          </div>
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
            placeholder="Event location"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows="4"
            placeholder="Describe your event..."
          />
        </div>

        <div className="form-group">
          <label>Event Flyer (Optional)</label>
          <div className="flyer-type-selector">
            <button
              type="button"
              onClick={() => handleFlyerTypeChange('file')}
              className={`flyer-type-btn ${flyerType === 'file' ? 'active' : ''}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleFlyerTypeChange('url')}
              className={`flyer-type-btn ${flyerType === 'url' ? 'active' : ''}`}
            >
              Paste URL
            </button>
          </div>
          
          {flyerType === 'file' ? (
            <>
              <input
                id="flyerImage"
                type="file"
                name="flyerImage"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input-file"
              />
            </>
          ) : (
            <input
              type="url"
              value={flyerUrl}
              onChange={handleFlyerUrlChange}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          )}
          
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Flyer preview" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFormData(prev => ({ ...prev, flyerImage: null }));
                  setFlyerUrl('');
                }}
                className="remove-image-btn"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default EventRequestForm;
