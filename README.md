# The 🏳️‍🌈 Boyz Events

A React website that displays events from a Google Calendar in both calendar and list views.

## Features

- 📅 Interactive calendar view with month, week, and day views
- 📋 Vertical list of upcoming events below the calendar
- 🔄 Auto-refreshes events every 5 minutes
- 🎨 Modern, responsive UI design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the Google Calendar (`thegayboyzevents@gmail.com`) is set to public:
   - Go to Google Calendar
   - Click on the calendar settings (gear icon)
   - Select "Settings and sharing"
   - Scroll down to "Access permissions"
   - Check "Make available to public"
   - Select "See all event details"

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## How It Works

The app fetches events from the public Google Calendar iCal feed. If the calendar is not public, you'll see an error message with instructions on how to make it public.

## Technologies Used

- React
- react-big-calendar - Calendar component
- ical.js - Parse iCal format from Google Calendar
- axios - HTTP requests
- moment - Date formatting
# the-boyz-events
