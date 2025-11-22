# Setting up the Database

## Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your `padelpadel-turnering` project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message. This creates:
- ✅ 4 tables: tournaments, players, teams, matches
- ✅ Indexes for better performance
- ✅ Row Level Security policies (public access for now)
- ✅ Automatic timestamp triggers

## Step 2: Verify Tables

1. Click on **Table Editor** in the left sidebar
2. You should see 4 tables created:
   - tournaments
   - players
   - teams
   - matches

## Step 3: Test the App

The app is now configured to use Supabase instead of localStorage!

```bash
npm run dev
```

All data will be stored in your Supabase database.

## Security Note

The current RLS policies allow public access. For production, you should:
- Enable Supabase Authentication
- Update policies to check `auth.uid()`
- Add user-specific access controls
