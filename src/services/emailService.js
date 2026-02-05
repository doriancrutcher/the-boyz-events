import emailjs from '@emailjs/browser';

const ADMIN_EMAIL = 'thegayboyzevents@gmail.com';
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';

/**
 * Send email notification to admin when a new event request is submitted
 */
export const sendEventRequestEmail = async (requestData) => {
  // Only send if EmailJS is configured
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping email notification.');
    return;
  }

  try {
    // Initialize EmailJS with public key
    emailjs.init(PUBLIC_KEY);

    // Format the event date
    const eventDate = requestData.eventDate 
      ? new Date(requestData.eventDate.toDate ? requestData.eventDate.toDate() : requestData.eventDate).toLocaleDateString()
      : 'Not specified';

    // Prepare email template parameters
    const templateParams = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      from_name: requestData.userEmail || 'User',
      subject: `New Event Request: ${requestData.title}`,
      message: `
A new event request has been submitted:

Event Title: ${requestData.title}
Submitted By: ${requestData.userEmail}
Event Date: ${eventDate}
Event Time: ${requestData.eventTime || 'Not specified'}
Location: ${requestData.location || 'Not specified'}
${requestData.description ? `Description: ${requestData.description}` : ''}
${requestData.flyerUrl ? `Flyer Image: ${requestData.flyerUrl}` : ''}

Please review this request in the admin dashboard.
      `.trim(),
      event_title: requestData.title,
      user_email: requestData.userEmail,
      event_date: eventDate,
      event_time: requestData.eventTime || 'Not specified',
      location: requestData.location || 'Not specified',
      description: requestData.description || 'No description provided',
      flyer_url: requestData.flyerUrl || 'No flyer image',
      request_id: requestData.requestId || ''
    };

    // Send email
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    
    console.log('Email notification sent successfully');
  } catch (error) {
    // Don't throw error - email failure shouldn't break the request submission
    console.error('Error sending email notification:', error);
  }
};

/**
 * Send email notification to admin when an edit request is submitted
 */
export const sendEditRequestEmail = async (editData) => {
  // Only send if EmailJS is configured
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping email notification.');
    return;
  }

  try {
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      from_name: editData.userEmail || 'User',
      subject: `New Edit Request for Event: ${editData.eventTitle || 'Unknown'}`,
      message: `
A new edit request has been submitted:

Event: ${editData.eventTitle || 'Unknown'}
Submitted By: ${editData.userEmail}
Request ID: ${editData.editId || 'N/A'}

Please review this edit request in the admin dashboard.
      `.trim(),
      event_title: editData.eventTitle || 'Unknown',
      user_email: editData.userEmail,
      edit_id: editData.editId || ''
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    
    console.log('Edit request email notification sent successfully');
  } catch (error) {
    console.error('Error sending edit request email notification:', error);
  }
};
