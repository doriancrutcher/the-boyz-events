import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';

/**
 * Export events to PDF
 */
export const exportEventsToPDF = async (events, dateRange = null) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const lineHeight = 8;
    const maxWidth = pageWidth - (margin * 2);

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = dateRange 
      ? `Events: ${dateRange.label}`
      : 'Upcoming Events';
    pdf.text(title, margin, yPosition);
    yPosition += lineHeight * 2;

    // Add date range if specified
    if (dateRange && dateRange.start && dateRange.end) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateText = `${moment(dateRange.start).format('MMM D, YYYY')} - ${moment(dateRange.end).format('MMM D, YYYY')}`;
      pdf.text(dateText, margin, yPosition);
      yPosition += lineHeight * 1.5;
    }

    // Add events
    pdf.setFontSize(12);
    events.forEach((event, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Event title
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(event.title, maxWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += lineHeight * titleLines.length;

      // Event date and time
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const startDate = moment(event.start);
      const endDate = event.end ? moment(event.end) : null;
      let dateTimeText = startDate.format('MMM D, YYYY • h:mm A');
      if (endDate && !endDate.isSame(startDate, 'day')) {
        dateTimeText += ` - ${endDate.format('MMM D, YYYY • h:mm A')}`;
      } else if (endDate) {
        dateTimeText += ` - ${endDate.format('h:mm A')}`;
      }
      pdf.text(dateTimeText, margin, yPosition);
      yPosition += lineHeight;

      // Location
      if (event.location) {
        pdf.text(`📍 ${event.location}`, margin, yPosition);
        yPosition += lineHeight;
      }

      // Instagram/Owner
      if (event.instagramHandle || event.instaHandle || event.eventOwner) {
        const ownerText = event.instagramHandle || event.instaHandle 
          ? `@${event.instagramHandle || event.instaHandle}`
          : event.eventOwner;
        pdf.text(`👤 ${ownerText}`, margin, yPosition);
        yPosition += lineHeight;
      }

      // Description
      if (event.description) {
        const descLines = pdf.splitTextToSize(event.description, maxWidth);
        pdf.text(descLines, margin, yPosition);
        yPosition += lineHeight * descLines.length;
      }

      // Add spacing between events
      yPosition += lineHeight;
      
      // Add separator line (except for last event)
      if (index < events.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight;
      }
    });

    // Save the PDF
    const fileName = dateRange 
      ? `events-${moment(dateRange.start).format('YYYY-MM-DD')}-${moment(dateRange.end).format('YYYY-MM-DD')}.pdf`
      : `events-${moment().format('YYYY-MM-DD')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export events to image (PNG)
 */
export const exportEventsToImage = async (events, dateRange = null, containerElement) => {
  try {
    if (!containerElement) {
      throw new Error('Container element is required for image export');
    }

    // Create a temporary container for export
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '800px';
    exportContainer.style.backgroundColor = '#1a1a1a';
    exportContainer.style.padding = '40px';
    exportContainer.style.color = '#ffffff';
    exportContainer.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(exportContainer);

    // Add title
    const title = document.createElement('h1');
    title.textContent = dateRange ? `Events: ${dateRange.label}` : 'Upcoming Events';
    title.style.marginBottom = '20px';
    title.style.fontSize = '28px';
    title.style.color = '#ffffff';
    exportContainer.appendChild(title);

    // Add date range if specified
    if (dateRange && dateRange.start && dateRange.end) {
      const dateText = document.createElement('p');
      dateText.textContent = `${moment(dateRange.start).format('MMM D, YYYY')} - ${moment(dateRange.end).format('MMM D, YYYY')}`;
      dateText.style.marginBottom = '30px';
      dateText.style.fontSize = '14px';
      dateText.style.color = '#cccccc';
      exportContainer.appendChild(dateText);
    }

    // Add events
    events.forEach((event) => {
      const eventCard = document.createElement('div');
      eventCard.style.marginBottom = '30px';
      eventCard.style.padding = '20px';
      eventCard.style.backgroundColor = '#2a2a2a';
      eventCard.style.borderRadius = '8px';
      eventCard.style.border = '1px solid #444';

      // Title
      const eventTitle = document.createElement('h2');
      eventTitle.textContent = event.title;
      eventTitle.style.margin = '0 0 15px 0';
      eventTitle.style.fontSize = '20px';
      eventTitle.style.color = '#ffffff';
      eventCard.appendChild(eventTitle);

      // Date and time
      const startDate = moment(event.start);
      const endDate = event.end ? moment(event.end) : null;
      let dateTimeText = startDate.format('MMM D, YYYY • h:mm A');
      if (endDate && !endDate.isSame(startDate, 'day')) {
        dateTimeText += ` - ${endDate.format('MMM D, YYYY • h:mm A')}`;
      } else if (endDate) {
        dateTimeText += ` - ${endDate.format('h:mm A')}`;
      }
      const dateTime = document.createElement('p');
      dateTime.textContent = `🕐 ${dateTimeText}`;
      dateTime.style.margin = '5px 0';
      dateTime.style.fontSize = '14px';
      dateTime.style.color = '#cccccc';
      eventCard.appendChild(dateTime);

      // Location
      if (event.location) {
        const location = document.createElement('p');
        location.textContent = `📍 ${event.location}`;
        location.style.margin = '5px 0';
        location.style.fontSize = '14px';
        location.style.color = '#cccccc';
        eventCard.appendChild(location);
      }

      // Owner
      if (event.instagramHandle || event.instaHandle || event.eventOwner) {
        const owner = document.createElement('p');
        const ownerText = event.instagramHandle || event.instaHandle 
          ? `@${event.instagramHandle || event.instaHandle}`
          : event.eventOwner;
        owner.textContent = `👤 ${ownerText}`;
        owner.style.margin = '5px 0';
        owner.style.fontSize = '14px';
        owner.style.color = '#cccccc';
        eventCard.appendChild(owner);
      }

      // Description
      if (event.description) {
        const description = document.createElement('p');
        description.textContent = event.description;
        description.style.margin = '10px 0 0 0';
        description.style.fontSize = '14px';
        description.style.color = '#dddddd';
        description.style.lineHeight = '1.5';
        eventCard.appendChild(description);
      }

      exportContainer.appendChild(eventCard);
    });

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert to canvas
    const canvas = await html2canvas(exportContainer, {
      backgroundColor: '#1a1a1a',
      scale: 2,
      logging: false
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    const fileName = dateRange 
      ? `events-${moment(dateRange.start).format('YYYY-MM-DD')}-${moment(dateRange.end).format('YYYY-MM-DD')}.png`
      : `events-${moment().format('YYYY-MM-DD')}.png`;
    link.download = fileName;
    link.href = imgData;
    link.click();

    // Cleanup
    document.body.removeChild(exportContainer);
  } catch (error) {
    console.error('Error exporting to image:', error);
    throw error;
  }
};

/**
 * Get date ranges for quick selection
 */
export const getDateRanges = () => {
  const today = moment().startOf('day');
  const currentDay = today.day(); // 0 = Sunday, 6 = Saturday
  
  // Calculate this weekend (Friday to Sunday)
  let thisWeekendFriday = moment().day(5); // Get Friday of current week (5 = Friday)
  if (thisWeekendFriday.isBefore(today)) {
    // If Friday has passed, get next Friday
    thisWeekendFriday = thisWeekendFriday.add(1, 'week');
  }
  // Saturday is the day after Friday
  const thisWeekendSaturday = thisWeekendFriday.clone().add(1, 'day');
  // Sunday is the day after Saturday
  const thisWeekendSunday = thisWeekendSaturday.clone().add(1, 'day');
  
  // Next weekend is 7 days after this weekend
  const nextWeekendFriday = thisWeekendFriday.clone().add(1, 'week');
  const nextWeekendSaturday = nextWeekendFriday.clone().add(1, 'day');
  const nextWeekendSunday = nextWeekendSaturday.clone().add(1, 'day');

  return {
    today: {
      label: 'Today',
      start: today.toDate(),
      end: today.endOf('day').toDate()
    },
    thisWeekend: {
      label: 'This Weekend',
      start: thisWeekendFriday.startOf('day').toDate(),
      end: thisWeekendSunday.endOf('day').toDate()
    },
    nextWeekend: {
      label: 'Next Weekend',
      start: nextWeekendFriday.startOf('day').toDate(),
      end: nextWeekendSunday.endOf('day').toDate()
    },
    thisWeek: {
      label: 'This Week',
      start: today.toDate(),
      end: today.clone().endOf('week').toDate()
    },
    nextWeek: {
      label: 'Next Week',
      start: today.clone().add(1, 'week').startOf('week').toDate(),
      end: today.clone().add(1, 'week').endOf('week').toDate()
    },
    thisMonth: {
      label: 'This Month',
      start: today.toDate(),
      end: today.clone().endOf('month').toDate()
    }
  };
};

/**
 * Filter events by date range
 */
export const filterEventsByDateRange = (events, dateRange) => {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return events;
  }

  const start = moment(dateRange.start).startOf('day');
  const end = moment(dateRange.end).endOf('day');

  return events.filter(event => {
    const eventStart = moment(event.start);
    const eventEnd = event.end ? moment(event.end) : eventStart;
    
    // Event overlaps with date range if:
    // - Event starts before range ends AND
    // - Event ends after range starts
    return eventStart.isSameOrBefore(end) && eventEnd.isSameOrAfter(start);
  });
};
