import React, { useState, useMemo } from 'react';
import { exportEventsToPDF, exportEventsToImage, getDateRanges, filterEventsByDateRange } from '../services/exportService';
import './EventExport.css';

const EventExport = ({ events, containerRef }) => {
  const [selectedRange, setSelectedRange] = useState('thisWeekend');
  const [exporting, setExporting] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateRanges = useMemo(() => getDateRanges(), []);

  const getCurrentDateRange = () => {
    if (selectedRange === 'custom' && customStart && customEnd) {
      return {
        label: 'Custom Range',
        start: new Date(customStart),
        end: new Date(customEnd)
      };
    }
    return dateRanges[selectedRange] || dateRanges.thisWeekend;
  };

  const filteredEvents = useMemo(() => {
    const range = getCurrentDateRange();
    return filterEventsByDateRange(events, range);
  }, [events, selectedRange, customStart, customEnd]);

  const handleExportPDF = async () => {
    if (filteredEvents.length === 0) {
      alert('No events found for the selected date range.');
      return;
    }

    setExporting(true);
    try {
      const range = getCurrentDateRange();
      await exportEventsToPDF(filteredEvents, range);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (filteredEvents.length === 0) {
      alert('No events found for the selected date range.');
      return;
    }

    setExporting(true);
    try {
      const range = getCurrentDateRange();
      await exportEventsToImage(filteredEvents, range, containerRef?.current);
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="event-export-container">
      <div className="export-header">
        <h3>Export Events</h3>
        <span className="event-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="date-range-selector">
        <label>Select Date Range:</label>
        <select
          value={selectedRange}
          onChange={(e) => {
            setSelectedRange(e.target.value);
            setShowCustomRange(e.target.value === 'custom');
          }}
          className="range-select"
        >
          <option value="thisWeekend">This Weekend</option>
          <option value="nextWeekend">Next Weekend</option>
          <option value="thisWeek">This Week</option>
          <option value="nextWeek">Next Week</option>
          <option value="thisMonth">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {showCustomRange && (
        <div className="custom-range-inputs">
          <div className="date-input-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label>End Date:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      )}

      {selectedRange === 'custom' && (!customStart || !customEnd) && (
        <p className="export-warning">Please select both start and end dates.</p>
      )}

      <div className="export-actions">
        <button
          onClick={handleExportPDF}
          disabled={exporting || (selectedRange === 'custom' && (!customStart || !customEnd)) || filteredEvents.length === 0}
          className="export-btn export-pdf-btn"
        >
          {exporting ? 'Exporting...' : '📄 Export PDF'}
        </button>
        <button
          onClick={handleExportImage}
          disabled={exporting || (selectedRange === 'custom' && (!customStart || !customEnd)) || filteredEvents.length === 0}
          className="export-btn export-image-btn"
        >
          {exporting ? 'Exporting...' : '🖼️ Export Image'}
        </button>
      </div>
    </div>
  );
};

export default EventExport;
