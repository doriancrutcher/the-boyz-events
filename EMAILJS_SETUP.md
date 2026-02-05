# EmailJS Setup for Email Notifications

This guide will help you set up EmailJS to send email notifications to `thegayboyzevents@gmail.com` when event requests are submitted.

## What is EmailJS?

EmailJS is a free email service (200 emails/month on free tier) that allows you to send emails directly from your React app without a backend server.

## Step 1: Create EmailJS Account

1. **Sign up for EmailJS**
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Click "Sign Up" (free account)
   - Verify your email address

## Step 2: Add Email Service

1. **Go to Email Services**
   - In EmailJS dashboard, click **"Email Services"** in the left sidebar
   - Click **"Add New Service"**

2. **Choose Email Provider**
   - Select **"Gmail"** (since you're using Gmail)
   - Click **"Connect Account"**
   - Sign in with `thegayboyzevents@gmail.com`
   - Authorize EmailJS to send emails on your behalf

3. **Save Service ID**
   - Note the **Service ID** (e.g., `service_xxxxx`)
   - You'll need this for your `.env` file

## Step 3: Create Email Template

1. **Go to Email Templates**
   - Click **"Email Templates"** in the left sidebar
   - Click **"Create New Template"**

2. **Configure Template**
   - **Template Name**: `Event Request Notification`
   - **Subject**: `New Event Request: {{event_title}}`
   - **Content**: Use this template:

```
Hello Admin,

A new event request has been submitted:

Event Title: {{event_title}}
Submitted By: {{user_email}}
Event Date: {{event_date}}
Event Time: {{event_time}}
Location: {{location}}
Description: {{description}}

{{#flyer_url}}
Flyer Image: {{flyer_url}}
{{/flyer_url}}

Please review this request in the admin dashboard.

Request ID: {{request_id}}
```

3. **Save Template**
   - Click **"Save"**
   - Note the **Template ID** (e.g., `template_xxxxx`)

## Step 4: Get Public Key

1. **Go to Account Settings**
   - Click your profile icon → **"Account"**
   - Find **"Public Key"** (e.g., `xxxxxxxxxxxxx`)
   - Copy this key

## Step 5: Add Environment Variables

Add these three variables to your `.env` file:

```bash
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

**Replace the values with your actual IDs from EmailJS.**

## Step 6: Add to Netlify

Don't forget to add these same environment variables to Netlify:

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add all three variables:
   - `REACT_APP_EMAILJS_SERVICE_ID`
   - `REACT_APP_EMAILJS_TEMPLATE_ID`
   - `REACT_APP_EMAILJS_PUBLIC_KEY`

## Step 7: Test

1. **Restart your dev server** (if running locally)
2. **Submit a test event request**
3. **Check your email** (`thegayboyzevents@gmail.com`)
4. You should receive an email notification!

## Troubleshooting

### Not receiving emails?
- Check that all three environment variables are set correctly
- Verify the Service ID, Template ID, and Public Key are correct
- Check EmailJS dashboard → "Logs" to see if emails are being sent
- Make sure you authorized Gmail correctly in EmailJS

### Emails going to spam?
- Check your spam folder
- EmailJS emails sometimes go to spam initially
- You can whitelist emails from EmailJS

### Free tier limits?
- Free tier: 200 emails/month
- If you exceed this, you'll need to upgrade or wait until next month
- Check usage in EmailJS dashboard

## Alternative: Use Different Email Provider

If you prefer a different email service:
- **Outlook**: Select "Outlook" when adding service
- **Custom SMTP**: Select "Custom SMTP" and enter your SMTP settings

## Security Note

- EmailJS Public Key is safe to expose in client-side code
- It's designed to be public
- Rate limiting is handled by EmailJS
