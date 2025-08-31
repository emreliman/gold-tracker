# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `gold-tracker`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for setup to complete (~2 minutes)

## Step 2: Get Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:

```
Project URL: https://your-project-ref.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Update Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the SQL

The schema will create:
- `gold_prices` table with all required columns
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for updated_at timestamps

## Step 5: Test Connection

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Test the database connection:
   ```
   http://localhost:3000/api/test-db
   ```

3. Test the gold API with database:
   ```
   http://localhost:3000/api/gold
   ```

## Step 6: Verify Data Flow

1. First call to `/api/gold` should scrape and save to database
2. Second call within 30 minutes should return cached data from database
3. Check your Supabase dashboard → **Table Editor** → `gold_prices` to see saved data

## Troubleshooting

### Common Issues:

1. **"Supabase not configured"**
   - Check your .env.local file
   - Make sure values are copied correctly
   - Restart the dev server

2. **"Database connection failed"**
   - Verify your Supabase project is active
   - Check if the gold_prices table exists
   - Verify RLS policies are set up correctly

3. **"Table 'gold_prices' doesn't exist"**
   - Run the schema.sql in Supabase SQL Editor
   - Make sure all queries executed successfully

### Success Indicators:

✅ `/api/test-db` returns `"success": true`
✅ `/api/gold` saves data to database
✅ Second `/api/gold` call returns cached data
✅ Supabase Table Editor shows gold_prices records

## Next Steps

Once Supabase is working:
1. Test the 30-minute cache behavior
2. Monitor database usage in Supabase dashboard
3. Set up automated data cleanup (optional)
4. Configure monitoring and alerts (optional)
