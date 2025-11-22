'use client';

import { useState } from 'react';
import { useTournament } from '@/context/TournamentContext';
import { getNextMatches } from '@/lib/tournament-logic';
import { Match } from '@/lib/types';
import { PlayCircle, Users } from 'lucide-react';

export default function MatchSchedule() {
  const { tournament, startMatch } = useTournament();
  const [startingMatchId, setStartingMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const nextMatches = getNextMatches(tournament.matches, tournament.numberOfCourts);
  const inProgressMatches = tournament.matches.filter(m => m.status === 'in-progress');
  const availableCourts = tournament.numberOfCourts - inProgressMatches.length;

  const handleStartMatch = async (match: Match) => {
    setStartingMatchId(match.id);
    const courtNumber = inProgressMatches.length + 1;
    await startMatch(match.id, courtNumber);
    setStartingMatchId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Match Schedule
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Available Courts: <span className="font-semibold text-cyan-600">{availableCourts}</span> / {tournament.numberOfCourts}
        </div>
      </div>

      {/* Next Matches to Start */}
      {nextMatches.length > 0 && availableCourts > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <PlayCircle className="text-green-600" size={20} />
            Ready to Start
          </h3>
          {nextMatches.slice(0, availableCourts).map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-green-200 dark:border-green-900 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-cyan-100 dark:bg-cyan-900 px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                        Team 1
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {match.team1.player1.name} & {match.team1.player2.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Team 2
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {match.team2.player1.name} & {match.team2.player2.name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartMatch(match)}
                  disabled={startingMatchId === match.id}
                  className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayCircle size={18} />
                  {startingMatchId === match.id ? 'Starting...' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In Progress Matches */}
      {inProgressMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="text-cyan-600" size={20} />
            In Progress ({inProgressMatches.length})
          </h3>
          {inProgressMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-cyan-200 dark:border-cyan-900 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                  COURT {match.courtNumber}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Playing Now
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Team 1</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {match.team1.player1.name}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {match.team1.player2.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Team 2</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {match.team2.player1.name}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {match.team2.player2.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No matches available */}
      {nextMatches.length === 0 && inProgressMatches.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            No more matches to schedule
          </p>
        </div>
      )}
    </div>
  );
}
