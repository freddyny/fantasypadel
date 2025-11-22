'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tournament, Player, Match, Team } from '@/lib/types';
import { generateRoundRobinMatches } from '@/lib/tournament-logic';
import { supabase } from '@/lib/supabase';

interface TournamentContextType {
  tournament: Tournament | null;
  loading: boolean;
  addPlayer: (name: string) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  startTournament: (numberOfCourts: number) => Promise<void>;
  startMatch: (matchId: string, courtNumber: number) => Promise<void>;
  completeMatch: (matchId: string, team1Score: number, team2Score: number) => Promise<void>;
  resetTournament: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  // Load tournament from Supabase on mount
  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    try {
      setLoading(true);
      
      // Get the most recent tournament
      const { data: tournaments, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (tournamentError) throw tournamentError;

      if (!tournaments || tournaments.length === 0) {
        // Create a new tournament if none exists
        await createNewTournament();
        return;
      }

      const dbTournament = tournaments[0];

      // Load players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('tournament_id', dbTournament.id);

      if (playersError) throw playersError;

      // Load matches with team information
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(
            id,
            player1:players!teams_player1_id_fkey(id, name),
            player2:players!teams_player2_id_fkey(id, name)
          ),
          team2:teams!matches_team2_id_fkey(
            id,
            player1:players!teams_player1_id_fkey(id, name),
            player2:players!teams_player2_id_fkey(id, name)
          )
        `)
        .eq('tournament_id', dbTournament.id);

      if (matchesError) throw matchesError;

      // Transform database data to app format
      const appPlayers: Player[] = (players || []).map(p => ({
        id: p.id,
        name: p.name,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0
      }));

      const appMatches: Match[] = (matches || []).map((m: any) => ({
        id: m.id,
        team1: {
          player1: {
            id: m.team1.player1.id,
            name: m.team1.player1.name,
            gamesWon: 0,
            gamesLost: 0,
            pointsFor: 0,
            pointsAgainst: 0
          },
          player2: {
            id: m.team1.player2.id,
            name: m.team1.player2.name,
            gamesWon: 0,
            gamesLost: 0,
            pointsFor: 0,
            pointsAgainst: 0
          }
        },
        team2: {
          player1: {
            id: m.team2.player1.id,
            name: m.team2.player1.name,
            gamesWon: 0,
            gamesLost: 0,
            pointsFor: 0,
            pointsAgainst: 0
          },
          player2: {
            id: m.team2.player2.id,
            name: m.team2.player2.name,
            gamesWon: 0,
            gamesLost: 0,
            pointsFor: 0,
            pointsAgainst: 0
          }
        },
        team1Score: m.team1_score,
        team2Score: m.team2_score,
        status: m.status,
        courtNumber: m.court_number
      }));

      setTournament({
        id: dbTournament.id,
        players: appPlayers,
        matches: appMatches,
        numberOfCourts: dbTournament.number_of_courts,
        status: dbTournament.status
      });
    } catch (error) {
      console.error('Error loading tournament:', error);
      await createNewTournament();
    } finally {
      setLoading(false);
    }
  };

  const createNewTournament = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: 'Padel Tournament',
        number_of_courts: 1,
        status: 'setup'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      return;
    }

    setTournament({
      id: data.id,
      players: [],
      matches: [],
      numberOfCourts: 1,
      status: 'setup'
    });
  };

  const addPlayer = async (name: string) => {
    if (!tournament) return;
    
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          tournament_id: tournament.id,
          name
        })
        .select()
        .single();

      if (error) throw error;

      const newPlayer: Player = {
        id: data.id,
        name: data.name,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0
      };

      setTournament({
        ...tournament,
        players: [...tournament.players, newPlayer]
      });
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const removePlayer = async (playerId: string) => {
    if (!tournament || tournament.status !== 'setup') return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      setTournament({
        ...tournament,
        players: tournament.players.filter(p => p.id !== playerId)
      });
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  const startTournament = async (numberOfCourts: number) => {
    if (!tournament || tournament.players.length < 4) return;

    try {
      // Generate all matches
      const matches = generateRoundRobinMatches(tournament.players);

      // Create teams in database
      const teamsMap = new Map<string, string>(); // key: player1Id-player2Id, value: teamId
      
      for (const match of matches) {
        // Team 1
        const team1Key = `${match.team1.player1.id}-${match.team1.player2.id}`;
        if (!teamsMap.has(team1Key)) {
          const { data: team1Data, error: team1Error } = await supabase
            .from('teams')
            .insert({
              tournament_id: tournament.id,
              player1_id: match.team1.player1.id,
              player2_id: match.team1.player2.id
            })
            .select()
            .single();
          
          if (team1Error) throw team1Error;
          teamsMap.set(team1Key, team1Data.id);
        }

        // Team 2
        const team2Key = `${match.team2.player1.id}-${match.team2.player2.id}`;
        if (!teamsMap.has(team2Key)) {
          const { data: team2Data, error: team2Error } = await supabase
            .from('teams')
            .insert({
              tournament_id: tournament.id,
              player1_id: match.team2.player1.id,
              player2_id: match.team2.player2.id
            })
            .select()
            .single();
          
          if (team2Error) throw team2Error;
          teamsMap.set(team2Key, team2Data.id);
        }
      }

      // Create matches in database
      const matchInserts = matches.map(match => {
        const team1Key = `${match.team1.player1.id}-${match.team1.player2.id}`;
        const team2Key = `${match.team2.player1.id}-${match.team2.player2.id}`;
        
        return {
          tournament_id: tournament.id,
          team1_id: teamsMap.get(team1Key)!,
          team2_id: teamsMap.get(team2Key)!,
          status: 'pending' as const
        };
      });

      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matchInserts);

      if (matchesError) throw matchesError;

      // Update tournament status
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({
          status: 'in-progress',
          number_of_courts: numberOfCourts
        })
        .eq('id', tournament.id);

      if (tournamentError) throw tournamentError;

      // Reload tournament data
      await loadTournament();
    } catch (error) {
      console.error('Error starting tournament:', error);
    }
  };

  const startMatch = async (matchId: string, courtNumber: number) => {
    if (!tournament) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'in-progress',
          court_number: courtNumber
        })
        .eq('id', matchId);

      if (error) throw error;

      setTournament({
        ...tournament,
        matches: tournament.matches.map(m =>
          m.id === matchId
            ? { ...m, status: 'in-progress' as const, courtNumber }
            : m
        )
      });
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const completeMatch = async (matchId: string, team1Score: number, team2Score: number) => {
    if (!tournament) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          team1_score: team1Score,
          team2_score: team2Score
        })
        .eq('id', matchId);

      if (error) throw error;

      const updatedMatches = tournament.matches.map(m =>
        m.id === matchId
          ? {
              ...m,
              status: 'completed' as const,
              team1Score,
              team2Score
            }
          : m
      );

      setTournament({
        ...tournament,
        matches: updatedMatches
      });

      // Check if all matches are completed
      const allCompleted = updatedMatches.every(m => m.status === 'completed');

      if (allCompleted) {
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournament.id);

        setTournament(prev => prev ? { ...prev, status: 'completed' } : null);
      }
    } catch (error) {
      console.error('Error completing match:', error);
    }
  };

  const resetTournament = async () => {
    try {
      // Delete old tournament (cascade will delete related data)
      if (tournament) {
        await supabase
          .from('tournaments')
          .delete()
          .eq('id', tournament.id);
      }

      // Create new tournament
      await createNewTournament();
    } catch (error) {
      console.error('Error resetting tournament:', error);
    }
  };

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        loading,
        addPlayer,
        removePlayer,
        startTournament,
        startMatch,
        completeMatch,
        resetTournament
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}
