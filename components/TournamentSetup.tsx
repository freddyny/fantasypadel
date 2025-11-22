'use client';

import { useState } from 'react';
import { useTournament } from '@/context/TournamentContext';
import { Trash2, UserPlus, Play } from 'lucide-react';

export default function TournamentSetup() {
  const { tournament, loading, addPlayer, removePlayer, startTournament } = useTournament();
  const [playerName, setPlayerName] = useState('');
  const [numberOfCourts, setNumberOfCourts] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && !isAdding) {
      setIsAdding(true);
      await addPlayer(playerName.trim());
      setPlayerName('');
      setIsAdding(false);
    }
  };

  const handleStartTournament = async () => {
    if (tournament && tournament.players.length >= 4 && !isStarting) {
      setIsStarting(true);
      await startTournament(numberOfCourts);
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const canStart = tournament.players.length >= 4 && !isStarting;
  const estimatedMatches = tournament.players.length >= 4 
    ? Math.floor((tournament.players.length * (tournament.players.length - 1)) / 4)
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Setup Padel Tournament
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add players and configure your tournament
        </p>
      </div>

      {/* Add Player Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player Name
            </label>
            <div className="flex gap-3">
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-6 py-3 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={20} />
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Players List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Players ({tournament.players.length})
        </h2>
        
        {tournament.players.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No players added yet. Add at least 4 players to start.
          </p>
        ) : (
          <div className="space-y-2">
            {tournament.players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {player.name}
                  </span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Tournament Configuration
        </h2>
        
        <div>
          <label htmlFor="courts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Courts
          </label>
          <input
            id="courts"
            type="number"
            min="1"
            max="10"
            value={numberOfCourts}
            onChange={(e) => setNumberOfCourts(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {canStart && (
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
            <p className="text-sm text-cyan-900 dark:text-cyan-100">
              <strong>Estimated matches:</strong> ~{estimatedMatches} matches will be generated
            </p>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
              Every player will partner with each other player at least once
            </p>
          </div>
        )}

        <button
          onClick={handleStartTournament}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
            canStart
              ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
        >
          <Play size={20} />
          {isStarting ? 'Starting...' : canStart ? 'Start Tournament' : `Need ${4 - tournament.players.length} more players`}
        </button>
      </div>
    </div>
  );
}
