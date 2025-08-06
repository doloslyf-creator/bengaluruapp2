
# Using Supabase as Primary Database

## Step 1: Get Your Supabase Database Connection String

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Settings** > **Database**
3. Under "Connection parameters", copy the **Connection string**
4. Replace `[YOUR-PASSWORD]` with your actual database password

The format should look like:
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Step 2: Set Environment Variables

Add this to your Replit Secrets (or .env file):

```
SUPABASE_DATABASE_URL=postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 3: Run the Updated Schema

1. Go to your Supabase project SQL Editor
2. Copy the entire content from `migrations/supabase_schema_updated.sql`
3. Paste and run it in the SQL Editor

## Step 4: Verify the Switch

Once you restart your application, you should see:
```
Using Supabase as primary database
```

Instead of:
```
Using existing DATABASE_URL (will transition to Supabase)
```

## Step 5: Migrate Existing Data (Optional)

If you have existing data in your PostgreSQL database, you can still run the migration from your admin panel at `/admin-panel/supabase-migration`.

## Benefits of This Approach

- **Unified Platform**: Database, authentication, and real-time features in one place
- **Better Performance**: Optimized for web applications
- **Built-in Features**: Row Level Security, real-time subscriptions, edge functions
- **Easier Scaling**: Automatic scaling and backups
