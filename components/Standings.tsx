'use client';

import { useTournament } from '@/context/TournamentContext';
import { calculatePlayerStats } from '@/lib/tournament-logic';
import { Medal, TrendingUp, Target, Activity } from 'lucide-react';

export default function Standings() {
  const { tournament } = useTournament();

  if (!tournament) return null;

  const stats = calculatePlayerStats(tournament.players, tournament.matches);
  const totalMatches = tournament.matches.filter(m => m.status === 'completed').length;
  const totalMatchesCount = tournament.matches.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Standings
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalMatches} / {totalMatchesCount} matches completed
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-cyan-600 to-blue-600 text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />
                    W
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">L</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +/-
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" />
                    PF
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-4 h-4" />
                    MP
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((playerStat, index) => {
                const isTop3 = index < 3 && stats.length > 3 && playerStat.matchesPlayed > 0;
                const rankColor = 
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' :
                  'bg-gray-300 dark:bg-gray-600';

                return (
                  <tr
                    key={playerStat.player.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      isTop3 ? 'bg-linear-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${rankColor} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                          {index + 1}
                        </div>
                        {isTop3 && <Medal className="text-yellow-500" size={18} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {playerStat.player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold">
                        {playerStat.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-bold">
                        {playerStat.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        playerStat.pointDifferential > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : playerStat.pointDifferential < 0 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {playerStat.pointDifferential > 0 ? '+' : ''}{playerStat.pointDifferential}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-gray-100 font-medium">
                      {playerStat.totalPoints}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {playerStat.matchesPlayed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <strong>W:</strong> Wins
          </div>
          <div className="flex items-center gap-2">
            <strong>L:</strong> Losses
          </div>
          <div className="flex items-center gap-2">
            <strong>+/-:</strong> Point Differential
          </div>
          <div className="flex items-center gap-2">
            <strong>PF:</strong> Points For (Total Points Scored)
          </div>
          <div className="flex items-center gap-2">
            <strong>MP:</strong> Matches Played
          </div>
        </div>
      </div>

      {stats.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            No standings available yet. Complete some matches to see rankings.
          </p>
        </div>
      )}
    </div>
  );
}

function Trophy({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
