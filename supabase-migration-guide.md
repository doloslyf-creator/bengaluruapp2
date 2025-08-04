# Supabase Migration Guide for OwnItRight

## Overview
This guide will help you migrate your OwnItRight platform from the current PostgreSQL database to Supabase for unified database and authentication management.

## Prerequisites

### 1. Supabase Project Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (if you haven't already)
3. Note down your project details:
   - **Project URL**: `https://[project-id].supabase.co`
   - **Service Role Key**: Found in Settings > API
   - **Database Password**: Set during project creation

### 2. Get Your Supabase Database Connection String
1. In your Supabase project, go to **Settings** > **Database**
2. Under "Connection parameters", copy the **Connection string**
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. The format should look like:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

## Migration Process

### Step 1: Access Migration Interface
1. Log into your admin panel
2. Navigate to **Database Migration** in the sidebar
3. You'll see the Supabase Migration interface

### Step 2: Verify Supabase Connection
1. The interface will automatically check your Supabase connection
2. If connection fails:
   - Check your `SUPABASE_URL` environment variable
   - Check your `SUPABASE_SERVICE_ROLE_KEY` environment variable
   - Ensure both are set correctly in your Replit secrets

### Step 3: Review Current Data
The migration interface will show you:
- Current PostgreSQL database status
- Number of properties, leads, reports, and settings to migrate
- Supabase connection status

### Step 4: Start Migration
1. Click **"Start Complete Migration"**
2. The system will migrate in this order:
   - Properties & Configurations
   - Valuation Reports & Data
   - Application Settings
   - Verification & Testing

### Step 5: Verify Migration
1. Click **"Verify Migration"** after completion
2. Check the migration results showing record counts
3. Test key functionality to ensure everything works

### Step 6: Update Database Connection
Once migration is successful:

1. **Update your environment variables:**
   - Replace `DATABASE_URL` with your Supabase connection string
   - Keep `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as they are

2. **In your Replit Secrets, update:**
   ```
   DATABASE_URL=postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### Step 7: Restart Application
1. Restart your Replit application
2. The system will now use Supabase as the primary database
3. Test all functionality to ensure everything works correctly

## What Gets Migrated

### Properties Data
- Property listings
- Property configurations
- Property scores
- Zone information

### Valuation Reports
- Property valuation reports
- Report configurations
- Customer assignments
- Report status and workflow data

### Application Settings
- API keys configuration
- System settings
- Admin preferences

### Additional Data
- RERA information
- Booking data
- Lead information
- Notification settings

## Post-Migration Benefits

### Unified Database & Auth
- Single Supabase project for database and authentication
- Real-time database updates
- Built-in Row Level Security (RLS)
- Automatic API generation

### Enhanced Features
- Real-time subscriptions for live data updates
- Built-in authentication with multiple providers
- Edge functions for serverless computing
- Integrated file storage

### Improved Performance
- Global CDN for faster data access
- Connection pooling
- Automatic scaling
- Better caching

## Troubleshooting

### Connection Issues
- Verify Supabase URL format
- Check service role key permissions
- Ensure database password is correct
- Test connection from Supabase dashboard

### Migration Errors
- Check server logs for detailed error messages
- Verify all tables exist in Supabase
- Ensure proper permissions are set
- Try migrating data types one at a time

### Post-Migration Issues
- Clear browser cache and cookies
- Restart the application
- Check all environment variables
- Verify database schema matches

## Rollback Plan
If needed, you can rollback by:
1. Restoring the original `DATABASE_URL`
2. Restarting the application
3. Your original PostgreSQL data remains untouched during migration

## Support
- Use the admin interface migration status for real-time updates
- Check server logs for detailed migration progress
- All migration operations are logged for troubleshooting

---

**Note**: Always backup your data before starting the migration process. The migration system will copy data to Supabase without affecting your original PostgreSQL database, ensuring a safe transition.