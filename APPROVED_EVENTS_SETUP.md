# Approved Events Feature Setup

## What This Does

When you approve an event request, it's now saved to an "Approved Events" section. This allows you to:
1. See all approved events in one place
2. Manually add them to your Google Calendar
3. Mark them as "Added to Calendar" to remove them from the list

## Firestore Rules

Add this to your Firestore security rules:

```javascript
// Approved events (for manual calendar entry)
match /approvedEvents/{eventId} {
  allow read: if request.auth != null && request.auth.token.email == 'thegayboyzevents@gmail.com';
  allow write: if request.auth != null && request.auth.token.email == 'thegayboyzevents@gmail.com';
}
```

## How It Works

1. **When you approve an event request:**
   - The event is automatically saved to the `approvedEvents` collection
   - It appears in the "Approved Events" tab in Admin Dashboard

2. **In the Approved Events tab:**
   - You'll see all approved events that haven't been added to calendar yet
   - Each event shows: title, date, time, location, description, flyer (if any)

3. **After adding to your calendar:**
   - Click "✓ Added to Calendar" button
   - The event is marked as `addedToCalendar: true`
   - It disappears from the list (only shows events with `addedToCalendar: false`)

## Flyer Upload in Edit Form

You can now add/update flyers when editing events:
- Open the edit form for any event
- Upload a new flyer image
- The flyer will be saved and displayed on the event card

## Notes

- Approved events are only visible to admins
- Once marked as "Added to Calendar", they won't show in the list anymore
- You can still see them in Firestore if needed (they're not deleted, just marked)
