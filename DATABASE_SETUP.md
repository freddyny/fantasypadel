# Supabase Database Setup Complete! 🎾

## ✅ What's Been Done

1. **Created SQL Schema** (`supabase/schema.sql`)
   - 4 tables: tournaments, players, teams, matches
   - Proper foreign keys and relationships
   - Row Level Security enabled
   - Indexes for performance
   - Auto-updating timestamps

2. **Installed Supabase Client**
   - `@supabase/supabase-js` package added

3. **Created Supabase Utilities** (`lib/supabase.ts`)
   - Client configuration
   - TypeScript types for database

4. **Updated TournamentContext**
   - All operations now use Supabase
   - Async functions for CRUD operations
   - Proper error handling

5. **Updated All Components**
   - Loading states added
   - Async operations handled
   - Better UX with loading indicators

## 🚀 Next Steps

### 1. Run the SQL Migration

Open your Supabase dashboard and run the SQL:

```bash
# 1. Go to: https://supabase.com/dashboard
# 2. Select project: padelpadel-turnering
# 3. Click: SQL Editor → New Query
# 4. Copy contents from: supabase/schema.sql
# 5. Paste and click: Run
```

### 2. Start Your App

```bash
npm run dev
```

### 3. Test the Flow

1. **Add Players** - Add 4+ players
2. **Start Tournament** - Set number of courts
3. **Start Matches** - Begin matches on courts
4. **Enter Results** - Submit scores (first to 15, win by 2)
5. **View Standings** - Check live leaderboard

## 📊 Database Structure

```
tournaments (main tournament info)
  ↓
players (tournament participants)
  ↓
teams (player pairings)
  ↓
matches (games with scores)
```

## 🔄 Data Flow

1. Tournament created → stored in `tournaments` table
2. Players added → stored in `players` table
3. Start tournament → generates all team combinations → stored in `teams` table
4. Matches created → stored in `matches` table with team references
5. Match results → update `matches` table with scores
6. Standings → calculated from match results in real-time

## 🔐 Security Note

Current setup has **public access** for easy testing. For production:

1. Enable Supabase Auth
2. Update RLS policies to check user authentication
3. Add user ownership to tournaments

## 🐛 Troubleshooting

**Can't connect to database?**
- Check `.env.local` has correct SUPABASE_URL and SUPABASE_ANON_KEY
- Restart dev server after changing .env

**SQL errors?**
- Make sure you ran the entire `schema.sql` file
- Check Supabase logs in dashboard

**Data not showing?**
- Open browser console (F12) for error messages
- Check Network tab for failed requests

Enjoy your tournament! 🎾
