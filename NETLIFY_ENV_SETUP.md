# Netlify Environment Variables Setup

Your Firebase environment variables need to be configured in Netlify for the deployed site to work correctly.

## How to Add Environment Variables in Netlify

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Select your site: `the-boyz-events` (or your site name)

2. **Navigate to Site Settings**
   - Click on **Site settings** in the top navigation
   - Or go to: **Site configuration** → **Environment variables**

3. **Add Environment Variables**
   - Click **"Add a variable"** or **"Add environment variable"**
   - Add each of the following variables with their values from your `.env` file:

## Required Environment Variables

Add these 6 environment variables in Netlify:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `REACT_APP_FIREBASE_API_KEY` | Your Firebase API key | `AIzaSyCPKth24oLa--x4vYgq07S7XczEjnnud5c` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain | `thegayboyzevents-21aad.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your Firebase project ID | `thegayboyzevents-21aad` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket | `thegayboyzevents-21aad.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Your messaging sender ID | `101189026664` |
| `REACT_APP_FIREBASE_APP_ID` | Your Firebase app ID | `1:101189026664:web:9b833908f66243614e8cdd` |

## Steps to Add Each Variable

For each variable above:

1. Click **"Add a variable"** or **"Add environment variable"**
2. Enter the **Key** (e.g., `REACT_APP_FIREBASE_API_KEY`)
3. Enter the **Value** from your local `.env` file
4. Select **"All scopes"** (or "Production" if you want to limit it)
5. Click **"Save"**

## Get Your Values

If you need to check your values, look at your local `.env` file:

```bash
cat .env
```

Or check the file at: `/Users/doriancrutcher/Documents/javascript/the-boyz-events/.env`

## After Adding Variables

1. **Redeploy your site**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Or push a new commit to trigger a rebuild

2. **Verify the build**:
   - Check the build logs to ensure the variables are being used
   - The build should complete successfully
   - Your site should now connect to Firebase correctly

## Important Notes

- ⚠️ **Never commit your `.env` file to git** (it's already in `.gitignore`)
- ✅ **Always set environment variables in Netlify** for production
- 🔒 **Environment variables are encrypted** in Netlify
- 📝 **React requires `REACT_APP_` prefix** for environment variables to be exposed to the client

## Troubleshooting

### Still seeing "your-project-id" errors?
- Make sure you added **all 6 variables**
- Check that variable names match **exactly** (case-sensitive)
- Verify the values are correct (no extra spaces)
- **Redeploy** after adding variables

### Variables not working?
- Ensure variables start with `REACT_APP_`
- Check that you're looking at the correct site in Netlify
- Try clearing browser cache and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Need to update a variable?
- Edit the variable in Netlify dashboard
- Redeploy the site (or push a new commit)
