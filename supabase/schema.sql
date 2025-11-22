-- Create tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  number_of_courts INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, player1_id, player2_id)
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team1_score INTEGER,
  team2_score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  court_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_players_tournament ON players(tournament_id);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust based on your auth needs)
CREATE POLICY "Allow public read access on tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tournaments" ON tournaments FOR DELETE USING (true);

CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on matches" ON matches FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
