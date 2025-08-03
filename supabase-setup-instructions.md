# Supabase Database Setup Instructions

## Step 1: Access Your Supabase Project

Your Supabase project URL: **https://qugmemmukizgrggpnstl.supabase.co**

## Step 2: Navigate to SQL Editor

1. Go to: **https://supabase.com/dashboard/projects**
2. Find your project: `qugmemmukizgrggpnstl`
3. Click on the project name
4. In the left sidebar, click **"SQL Editor"**

## Step 3: Execute Database Schema

1. Once in the SQL Editor, create a new query
2. Copy the entire content from the file: `migrations/supabase_schema.sql`
3. Paste it into the SQL editor
4. Click **"Run"** or press `Ctrl+Enter`

## Alternative Method: Direct Dashboard Access

If the above doesn't work:
1. Go to: **https://supabase.com/dashboard**
2. Sign in with your Supabase account
3. Select your project from the dashboard
4. Navigate to SQL Editor from the left menu

## What the Schema Creates

The schema will create all necessary tables for:
- User authentication and profiles
- Properties and property management
- Leads and customer management
- Bookings and appointments
- Valuation reports
- CIVIL+MEP reports
- Team management
- Analytics and settings

## Verification

After running the schema:
1. Go to **"Table Editor"** in Supabase
2. Verify you see tables like: `users`, `properties`, `leads`, `bookings`, etc.
3. Return to your OwnItRight admin panel
4. Visit `/admin-panel/supabase-status` to confirm connection

## Troubleshooting

If you encounter any issues:
- Ensure you're signed into the correct Supabase account
- Verify the project ID matches: `qugmemmukizgrggpnstl`
- Check that your account has admin permissions for this project

Once the schema is executed, the platform will be fully operational with Supabase integration.