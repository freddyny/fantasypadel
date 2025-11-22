'use client';

import { useState } from 'react';
import { useTournament } from '@/context/TournamentContext';
import { isValidScore } from '@/lib/tournament-logic';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

export default function MatchResults() {
  const { tournament, completeMatch } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [error, setError] = useState('');

  if (!tournament) return null;

  const inProgressMatches = tournament.matches.filter(m => m.status === 'in-progress');
  const completedMatches = tournament.matches.filter(m => m.status === 'completed');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitScore = async () => {
    if (!selectedMatch || isSubmitting) return;

    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);

    if (isNaN(score1) || isNaN(score2)) {
      setError('Please enter valid scores');
      return;
    }

    if (!isValidScore(score1, score2)) {
      setError('Invalid score. Must be first to 15, win by 2');
      return;
    }

    setIsSubmitting(true);
    await completeMatch(selectedMatch, score1, score2);
    setSelectedMatch(null);
    setTeam1Score('');
    setTeam2Score('');
    setError('');
    setIsSubmitting(false);
  };

  const selectedMatchData = tournament.matches.find(m => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Match Results
      </h2>

      {/* Score Entry Form */}
      {inProgressMatches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Enter Result
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Match
              </label>
              <select
                value={selectedMatch || ''}
                onChange={(e) => {
                  setSelectedMatch(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="">Choose a match...</option>
                {inProgressMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    Court {match.courtNumber}: {match.team1.player1.name} & {match.team1.player2.name} vs {match.team2.player1.name} & {match.team2.player2.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatchData && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team 1 Score
                  </label>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMatchData.team1.player1.name} & {selectedMatchData.team1.player2.name}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={team1Score}
                      onChange={(e) => {
                        setTeam1Score(e.target.value);
                        setError('');
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 text-2xl font-bold text-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team 2 Score
                  </label>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMatchData.team2.player1.name} & {selectedMatchData.team2.player2.name}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={team2Score}
                      onChange={(e) => {
                        setTeam2Score(e.target.value);
                        setError('');
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 text-2xl font-bold text-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
                <XCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmitScore}
              disabled={!selectedMatch || !team1Score || !team2Score || isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                selectedMatch && team1Score && team2Score && !isSubmitting
                  ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={20} />
              {isSubmitting ? 'Submitting...' : 'Submit Result'}
            </button>
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Trophy className="text-yellow-600" size={20} />
            Completed Matches ({completedMatches.length})
          </h3>
          <div className="space-y-2">
            {completedMatches.slice().reverse().map((match) => {
              const team1Won = (match.team1Score || 0) > (match.team2Score || 0);
              return (
                <div
                  key={match.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`space-y-1 ${team1Won ? 'font-bold' : ''}`}>
                      <div className="flex items-center gap-2">
                        {team1Won && <Trophy className="text-yellow-500" size={16} />}
                        <div className="text-gray-900 dark:text-gray-100">
                          {match.team1.player1.name} & {match.team1.player2.name}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-cyan-600">
                        {match.team1Score}
                      </div>
                    </div>
                    <div className={`space-y-1 ${!team1Won ? 'font-bold' : ''}`}>
                      <div className="flex items-center gap-2">
                        {!team1Won && <Trophy className="text-yellow-500" size={16} />}
                        <div className="text-gray-900 dark:text-gray-100">
                          {match.team2.player1.name} & {match.team2.player2.name}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {match.team2Score}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedMatches.length === 0 && inProgressMatches.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            No completed matches yet
          </p>
        </div>
      )}
    </div>
  );
}
