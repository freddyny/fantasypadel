export interface Player {
  id: string;
  name: string;
  gamesWon: number;
  gamesLost: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Team {
  player1: Player;
  player2: Player;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: number | null;
  team2Score: number | null;
  status: 'pending' | 'in-progress' | 'completed';
  courtNumber?: number;
}

export interface Tournament {
  id: string;
  players: Player[];
  matches: Match[];
  numberOfCourts: number;
  status: 'setup' | 'in-progress' | 'completed';
}

export interface PlayerStats {
  player: Player;
  wins: number;
  losses: number;
  pointDifferential: number;
  totalPoints: number;
  matchesPlayed: number;
}
