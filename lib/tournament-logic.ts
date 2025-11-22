import { Player, Team, Match, PlayerStats } from './types';

/**
 * Generates all possible unique team pairings from a list of players
 */
export function generateAllTeamPairings(players: Player[]): Team[] {
  const teams: Team[] = [];
  
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      teams.push({
        player1: players[i],
        player2: players[j]
      });
    }
  }
  
  return teams;
}

/**
 * Checks if two teams share any common players
 */
function teamsSharePlayer(team1: Team, team2: Team): boolean {
  return (
    team1.player1.id === team2.player1.id ||
    team1.player1.id === team2.player2.id ||
    team1.player2.id === team2.player1.id ||
    team1.player2.id === team2.player2.id
  );
}

/**
 * Generates all possible matches for a round-robin doubles tournament
 * Each unique team pairing plays against each other once
 */
export function generateRoundRobinMatches(players: Player[]): Match[] {
  const allTeams = generateAllTeamPairings(players);
  const matches: Match[] = [];
  const usedPairings = new Set<string>();
  
  for (let i = 0; i < allTeams.length; i++) {
    for (let j = i + 1; j < allTeams.length; j++) {
      const team1 = allTeams[i];
      const team2 = allTeams[j];
      
      // Teams can't play against each other if they share a player
      if (!teamsSharePlayer(team1, team2)) {
        // Create a unique key for this pairing to avoid duplicates
        const players1 = [team1.player1.id, team1.player2.id].sort();
        const players2 = [team2.player1.id, team2.player2.id].sort();
        const pairingKey = [...players1, ...players2].sort().join('-');
        
        if (!usedPairings.has(pairingKey)) {
          usedPairings.add(pairingKey);
          matches.push({
            id: `match-${matches.length + 1}`,
            team1,
            team2,
            team1Score: null,
            team2Score: null,
            status: 'pending'
          });
        }
      }
    }
  }
  
  return shuffleArray(matches);
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets the next available matches that minimize player wait times
 * Returns up to 'numberOfCourts' matches where no player appears twice
 */
export function getNextMatches(
  allMatches: Match[],
  numberOfCourts: number
): Match[] {
  const pendingMatches = allMatches.filter(m => m.status === 'pending');
  const activePlayers = new Set<string>();
  const nextMatches: Match[] = [];
  
  // Get currently active players from in-progress matches
  allMatches
    .filter(m => m.status === 'in-progress')
    .forEach(match => {
      activePlayers.add(match.team1.player1.id);
      activePlayers.add(match.team1.player2.id);
      activePlayers.add(match.team2.player1.id);
      activePlayers.add(match.team2.player2.id);
    });
  
  // Find matches where no player is currently playing
  for (const match of pendingMatches) {
    if (nextMatches.length >= numberOfCourts) break;
    
    const playersInMatch = [
      match.team1.player1.id,
      match.team1.player2.id,
      match.team2.player1.id,
      match.team2.player2.id
    ];
    
    const hasActivePlayer = playersInMatch.some(id => activePlayers.has(id));
    
    if (!hasActivePlayer) {
      nextMatches.push(match);
      playersInMatch.forEach(id => activePlayers.add(id));
    }
  }
  
  return nextMatches;
}

/**
 * Validates if a score is valid (first to 15, win by 2)
 */
export function isValidScore(score1: number, score2: number): boolean {
  if (score1 < 0 || score2 < 0) return false;
  
  const maxScore = Math.max(score1, score2);
  const minScore = Math.min(score1, score2);
  const diff = Math.abs(score1 - score2);
  
  // Must reach 15 points
  if (maxScore < 15) return false;
  
  // If exactly 15, difference must be at least 2
  if (maxScore === 15 && diff < 2) return false;
  
  // If more than 15, must win by exactly 2
  if (maxScore > 15 && diff !== 2) return false;
  
  return true;
}

/**
 * Calculates player statistics from all matches
 */
export function calculatePlayerStats(
  players: Player[],
  matches: Match[]
): PlayerStats[] {
  const completedMatches = matches.filter(m => m.status === 'completed');
  
  const stats: PlayerStats[] = players.map(player => {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    let matchesPlayed = 0;
    
    completedMatches.forEach(match => {
      const isInTeam1 = 
        match.team1.player1.id === player.id || 
        match.team1.player2.id === player.id;
      const isInTeam2 = 
        match.team2.player1.id === player.id || 
        match.team2.player2.id === player.id;
      
      if (!isInTeam1 && !isInTeam2) return;
      
      matchesPlayed++;
      
      const team1Score = match.team1Score || 0;
      const team2Score = match.team2Score || 0;
      
      if (isInTeam1) {
        pointsFor += team1Score;
        pointsAgainst += team2Score;
        if (team1Score > team2Score) wins++;
        else losses++;
      } else {
        pointsFor += team2Score;
        pointsAgainst += team1Score;
        if (team2Score > team1Score) wins++;
        else losses++;
      }
    });
    
    return {
      player,
      wins,
      losses,
      pointDifferential: pointsFor - pointsAgainst,
      totalPoints: pointsFor,
      matchesPlayed
    };
  });
  
  // Sort by wins (desc), then by point differential (desc)
  return stats.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointDifferential - a.pointDifferential;
  });
}

/**
 * Gets count of matches for each player
 */
export function getPlayerMatchCounts(
  player: Player,
  matches: Match[]
): { total: number; completed: number; pending: number; inProgress: number } {
  let total = 0;
  let completed = 0;
  let pending = 0;
  let inProgress = 0;
  
  matches.forEach(match => {
    const isInMatch = 
      match.team1.player1.id === player.id ||
      match.team1.player2.id === player.id ||
      match.team2.player1.id === player.id ||
      match.team2.player2.id === player.id;
    
    if (isInMatch) {
      total++;
      if (match.status === 'completed') completed++;
      else if (match.status === 'pending') pending++;
      else if (match.status === 'in-progress') inProgress++;
    }
  });
  
  return { total, completed, pending, inProgress };
}
