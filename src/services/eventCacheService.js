const CACHE_KEY = 'the_boyz_events_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached events if they exist and are not expired
 */
export const getCachedEvents = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { events, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp < CACHE_EXPIRY) {
      // Convert date strings back to Date objects
      return events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * Cache events to localStorage
 */
export const cacheEvents = (events) => {
  try {
    const cacheData = {
      events: events.map(event => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString()
      })),
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching events:', error);
  }
};

/**
 * Clear the cache
 */
export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
