# How to Get Google Calendar Event IDs

## Automatic Method (Recommended)

**You don't need to manually get the event ID!** The code automatically extracts it from Google Calendar events. Here's how it works:

1. **The code fetches events** from your Google Calendar
2. **Each event has a unique UID** (like `abc123@google.com` or similar)
3. **The code uses this UID as the Firestore document ID** automatically

## How to See Event IDs

### Method 1: Browser Console
1. Open your website in the browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Type: `console.log(events)` (if you have access to the events array)
5. Or look for any console logs that show event data

### Method 2: Event Admin Panel
1. Click "Show Event Management" on your website
2. Select an event from the dropdown
3. The Event ID will be displayed below the dropdown
4. This is the ID that will be used in Firestore

### Method 3: View in Code
The event ID comes from line 42 in `src/services/calendarService.js`:
```javascript
id: vevent.getFirstPropertyValue('uid')
```

This extracts the `UID` property from each Google Calendar event.

## What the Event ID Looks Like

Google Calendar event UIDs typically look like:
- `abc123def456@google.com`
- `event-id-1234567890@google.com`
- Or a long alphanumeric string

## Important Notes

1. **You don't need to manually create Firestore documents** - The Event Admin panel will create them automatically when you save event details
2. **The document ID is set automatically** - When you select an event and save metadata, the code uses the event's ID as the Firestore document ID
3. **Each event has a unique ID** - This ensures that metadata is correctly linked to the right event

## If You Need to Manually Create a Document

If you absolutely need to manually create a Firestore document:

1. Go to your website and open the Event Admin panel
2. Select the event you want to create metadata for
3. Copy the Event ID that's displayed
4. In Firestore, create a new document in the `events` collection
5. Use the copied Event ID as the document ID (not Auto-ID)
6. Add the fields: `chatUrl`, `instaHandle`, `eventOwner` (all strings)

But again, **this is not necessary** - just use the Event Admin panel and it will handle everything automatically!
