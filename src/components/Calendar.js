import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarEvents = events.map(event => ({
    ...event,
    title: event.title,
  }));

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  return (
    <div className="calendar-container">
      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        defaultDate={currentDate}
        onNavigate={handleNavigate}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
      />
    </div>
  );
};

export default Calendar;
