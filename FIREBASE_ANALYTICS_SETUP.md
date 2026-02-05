# Firebase Analytics Setup

Firebase Analytics has been integrated into your app! This guide will help you enable it in the Firebase Console.

## What's Being Tracked

The app now tracks:

### Page Views
- `events` - Main calendar/events view
- `login` - Login page
- `request_event` - Event request form
- `admin_dashboard` - Admin dashboard

### User Actions
- **Login/Logout**: Tracks when users log in (email or Google) and log out
- **Event Going**: Tracks when users mark/unmark "going" on events
- **Event Requests**: Tracks when users submit new event requests (with/without images)
- **Edit Requests**: Tracks when users request event edits
- **Admin Actions**: Tracks admin approvals/rejections, event cancellations, and direct edits

### Calendar Interactions
- **Add to Calendar**: Tracks when users click "Add to Google Calendar"
- **Refresh Events**: Tracks when users manually refresh the calendar

## Enable Firebase Analytics

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `thegayboyzevents-21aad`

2. **Enable Google Analytics**
   - Go to **Project Settings** (gear icon)
   - Scroll down to the **"Your apps"** section
   - Find your web app and click the **⚙️** icon next to it
   - If you see "Not linked", click **"Link to Google Analytics"**
   - If you don't have a Google Analytics account, you'll be prompted to create one
   - Select or create a Google Analytics property

3. **Verify Analytics is Enabled**
   - Go to **Analytics** in the left sidebar
   - You should see the Analytics dashboard
   - Data will start appearing within 24 hours

## View Analytics Data

1. **Real-time Data**
   - Go to **Analytics** → **Events** in Firebase Console
   - Click on any event to see details
   - Use the **Realtime** view to see events as they happen

2. **User Properties**
   - Go to **Analytics** → **User properties**
   - You'll see `is_admin` property showing admin vs regular users

3. **Custom Events**
   - All custom events are tracked under **Analytics** → **Events**
   - Key events to monitor:
     - `login` - User logins
     - `event_going` - Going button clicks
     - `event_request` - New event submissions
     - `edit_request` - Edit requests
     - `admin_action` - Admin activities

## Testing

To test that analytics is working:

1. **Open your app** in the browser
2. **Open browser console** (F12)
3. **Perform actions** (login, click "going", etc.)
4. **Check Firebase Console** → **Analytics** → **Realtime** to see events appear

## Privacy & GDPR

Firebase Analytics is GDPR compliant and anonymizes user data. User IDs are hashed and not stored in plain text.

## Troubleshooting

### Analytics not showing data?
- Make sure Analytics is enabled in Firebase Console
- Wait up to 24 hours for data to appear (real-time view shows immediately)
- Check browser console for any errors
- Ensure your app is using the correct Firebase config

### Events not tracking?
- Check browser console for errors
- Verify `analytics` is initialized in `firebase.js`
- Make sure you're testing in a browser (not SSR)

## Code Location

- **Analytics Service**: `src/services/analyticsService.js`
- **Firebase Config**: `src/config/firebase.js`
- **Tracking Integration**: Throughout components (App.js, Login.js, EventsList.js, etc.)
