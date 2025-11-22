'use client';

import { TournamentProvider, useTournament } from '@/context/TournamentContext';
import TournamentSetup from '@/components/TournamentSetup';
import MatchSchedule from '@/components/MatchSchedule';
import MatchResults from '@/components/MatchResults';
import Standings from '@/components/Standings';
import { RotateCcw, Trophy, Calendar, BarChart3 } from 'lucide-react';
import { useState } from 'react';

type Tab = 'matches' | 'results' | 'standings';

function TournamentDashboard() {
  const { tournament, loading, resetTournament } = useTournament();
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [isResetting, setIsResetting] = useState(false);

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

  if (!tournament || tournament.status === 'setup') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <TournamentSetup />
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the tournament? All data will be lost.')) {
      setIsResetting(true);
      await resetTournament();
      setIsResetting(false);
    }
  };

  const completedMatches = tournament.matches.filter(m => m.status === 'completed').length;
  const totalMatches = tournament.matches.length;
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Trophy size={36} />
                Padel Tournament
              </h1>
              <p className="text-cyan-100">
                {tournament.players.length} players • {tournament.numberOfCourts} {tournament.numberOfCourts === 1 ? 'court' : 'courts'}
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} />
              {isResetting ? 'Resetting...' : 'Reset'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-cyan-100">
              <span>Tournament Progress</span>
              <span>{completedMatches} / {totalMatches} matches</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'matches'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Calendar size={20} />
              Matches
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'results'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Trophy size={20} />
              Results
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'standings'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              Standings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'matches' && <MatchSchedule />}
        {activeTab === 'results' && <MatchResults />}
        {activeTab === 'standings' && <Standings />}
      </div>

      {/* Tournament Complete Badge */}
      {tournament.status === 'completed' && (
        <div className="fixed bottom-8 right-8 bg-linear-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Trophy size={24} />
          <div>
            <div className="font-bold">Tournament Complete!</div>
            <div className="text-sm text-green-100">Check the standings</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <TournamentProvider>
      <TournamentDashboard />
    </TournamentProvider>
  );
}
