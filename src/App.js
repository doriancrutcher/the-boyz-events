import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import EventsList from './components/EventsList';
import EventAdmin from './components/EventAdmin';
import Login from './components/Login';
import EventRequestForm from './components/EventRequestForm';
import AdminDashboard from './components/AdminDashboard';
import Notifications from './components/Notifications';
import { useAuth } from './contexts/AuthContext';
import { fetchCalendarEvents, getAddToCalendarUrl } from './services/calendarService';
import { enrichEventsWithMetadata } from './services/eventMetadataService';
import { getCachedEvents, cacheEvents } from './services/eventCacheService';
import { getUnreadNotificationCount, getUnreadAdminNotificationCount } from './services/notificationService';
import { trackPageView, trackCalendarAdd, trackCalendarRefresh, setAnalyticsUserId, setAnalyticsUserProperties } from './services/analyticsService';

function App() {
  const { currentUser, isAdmin, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'request', 'admin'
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadEvents = useCallback(async (isRefresh = false) => {
    try {
      // Check cache first if not refreshing
      if (!isRefresh) {
        const cachedEvents = getCachedEvents();
        if (cachedEvents && cachedEvents.length > 0) {
          setEvents(cachedEvents);
          setLoading(false);
          setError(null);
          // Still fetch in background to update cache
          fetchAndUpdateEvents();
          return;
        }
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await fetchAndUpdateEvents();
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load calendar events. Please make sure the calendar is public.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAndUpdateEvents = async () => {
    const fetchedEvents = await fetchCalendarEvents();
    // Enrich events with Firebase metadata (chat URL, Instagram handle)
    const enrichedEvents = await enrichEventsWithMetadata(fetchedEvents);
    setEvents(enrichedEvents);
    // Cache the events
    cacheEvents(enrichedEvents);
    setError(null);
  };

  useEffect(() => {
    loadEvents();
    
    // Refresh events every 5 minutes
    const interval = setInterval(() => loadEvents(false), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadEvents]);

  // Track page views when tab changes
  useEffect(() => {
    const pageName = activeTab === 'events' ? 'events' : 
                     activeTab === 'login' ? 'login' :
                     activeTab === 'request' ? 'request_event' :
                     activeTab === 'admin' ? 'admin_dashboard' : 'events';
    trackPageView(pageName);
  }, [activeTab]);

  // Set user properties when user logs in
  useEffect(() => {
    if (currentUser) {
      setAnalyticsUserId(currentUser.uid);
      setAnalyticsUserProperties({
        email: currentUser.email,
        is_admin: isAdmin
      });
    }
  }, [currentUser, isAdmin]);

  // Automatically switch to events view when user logs in
  useEffect(() => {
    if (currentUser && activeTab === 'login') {
      setActiveTab('events');
    }
  }, [currentUser, activeTab]);

  // Load unread notification count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        if (isAdmin) {
          const count = await getUnreadAdminNotificationCount();
          setUnreadCount(count);
        } else {
          const count = await getUnreadNotificationCount(currentUser.uid);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isAdmin]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 
            className="app-title clickable-title"
            onClick={() => setActiveTab('events')}
          >
            The 🏳️‍🌈 Boyz Events
          </h1>
          <div className="header-actions">
            {currentUser ? (
              <>
                <span className="user-name">
                  {currentUser.displayName || currentUser.email || 'User'}
                </span>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="notification-btn"
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab(activeTab === 'admin' ? 'events' : 'admin')}
                    className="header-btn"
                  >
                    {activeTab === 'admin' ? '📅 Events' : '⚙️ Admin'}
                  </button>
                )}
                {!isAdmin && (
                  <button
                    onClick={() => {
                      if (currentUser) {
                        setActiveTab(activeTab === 'request' ? 'events' : 'request');
                      } else {
                        setActiveTab('login');
                      }
                    }}
                    className="header-btn"
                  >
                    {activeTab === 'request' ? '📅 Events' : '➕ Request Event'}
                  </button>
                )}
                {!currentUser && (
                  <button
                    onClick={() => setActiveTab('login')}
                    className="header-btn"
                  >
                    ➕ Request Event
                  </button>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setActiveTab('events');
                    setShowNotifications(false);
                  }} 
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="header-btn"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {activeTab === 'login' ? (
          <Login />
        ) : activeTab === 'request' ? (
          <EventRequestForm />
        ) : activeTab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
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
                <div className="calendar-header">
                  <a
                    href={getAddToCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
                    className="add-calendar-btn"
                    onClick={() => trackCalendarAdd()}
                  >
                    📅 Add to Google Calendar
                  </a>
                  <button 
                    onClick={() => {
                      trackCalendarRefresh();
                      loadEvents(true);
                    }}
                    disabled={refreshing}
                    className="refresh-btn"
                    title="Refresh events"
                  >
                    {refreshing ? (
                      <>
                        <span className="refresh-icon spinning">🔄</span>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <span className="refresh-icon">🔄</span>
                        Refresh Events
                      </>
                    )}
                  </button>
                </div>
                <Calendar events={events} />
                {!isAdmin && (
                  <div className="request-event-section">
                    <button
                      onClick={() => {
                        if (currentUser) {
                          setActiveTab(activeTab === 'request' ? 'events' : 'request');
                        } else {
                          setActiveTab('login');
                        }
                      }}
                      className="request-event-btn"
                    >
                      {activeTab === 'request' ? '📅 Back to Events' : '➕ Request Event'}
                    </button>
                  </div>
                )}
                <EventsList 
                  events={events} 
                  onEventUpdate={() => loadEvents(true)}
                />
                
                {isAdmin && (
                  <div className="admin-section">
                    <button 
                      onClick={() => setShowAdmin(!showAdmin)}
                      className="toggle-admin-btn"
                    >
                      {showAdmin ? '▼ Hide' : '▲ Show'} Event Management
                    </button>
                    {showAdmin && (
                      <EventAdmin 
                        events={events} 
                        onUpdate={() => loadEvents(true)}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      
      {showNotifications && currentUser && (
        <Notifications 
          onClose={() => {
            setShowNotifications(false);
            // Reload unread count when notifications close
            if (isAdmin) {
              getUnreadAdminNotificationCount().then(setUnreadCount);
            } else {
              getUnreadNotificationCount(currentUser.uid).then(setUnreadCount);
            }
          }}
          onNavigateToRequest={(requestId) => {
            setShowNotifications(false);
            setActiveTab('admin');
            // Store the request ID to highlight it in AdminDashboard
            sessionStorage.setItem('highlightRequestId', requestId);
            // Reload unread count
            if (isAdmin) {
              getUnreadAdminNotificationCount().then(setUnreadCount);
            }
          }}
          onNavigateToEdit={(editId) => {
            setShowNotifications(false);
            setActiveTab('admin');
            // Store the edit ID to highlight it in AdminDashboard
            sessionStorage.setItem('highlightEditId', editId);
            // Reload unread count
            if (isAdmin) {
              getUnreadAdminNotificationCount().then(setUnreadCount);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
