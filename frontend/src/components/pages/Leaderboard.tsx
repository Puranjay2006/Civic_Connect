import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Crown, TrendingUp, Award, Users, Target } from 'lucide-react';
import { User, CivicIssue } from '../../types';
import { getIssues } from '../../services/issueService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  issuesReported: number;
  issuesResolved: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    // Calculate leaderboard from issues
    const issues = getIssues();
    const userStats: Record<string, LeaderboardEntry> = {};

    // Get stored users
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const userMap = new Map(users.map(u => [u.id, u]));

    issues.forEach(issue => {
      const userId = issue.userId || 'anonymous';
      if (!userStats[userId]) {
        const user = userMap.get(userId);
        userStats[userId] = {
          userId,
          name: user?.name || 'Anonymous Citizen',
          points: 0,
          issuesReported: 0,
          issuesResolved: 0,
          rank: 0,
        };
      }
      
      userStats[userId].issuesReported += 1;
      userStats[userId].points += 10; // Points for reporting

      if (issue.status === 'Resolved') {
        userStats[userId].issuesResolved += 1;
        userStats[userId].points += 5; // Bonus for resolved
      }
      
      if (issue.rating && issue.rating > 3) {
        userStats[userId].points += issue.rating * 2; // Points for good ratings
      }
    });

    const sorted = Object.values(userStats)
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 20);

    setLeaderboard(sorted);
  }, [timeRange]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-600';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-100 dark:border-amber-800';
    return '';
  };

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Empty state when no users have reported issues
  if (leaderboard.length === 0) {
    return (
      <div className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white mb-3">
              Community Leaderboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Be the first to report an issue and claim the top spot!
            </p>
            
            <Card className="max-w-md mx-auto p-8">
              <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">No rankings yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Start reporting civic issues to earn points and climb the leaderboard!
              </p>
            </Card>
            
            {/* How Points Work - Show even on empty state */}
            <div className="mt-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary-500" />
                  How to Earn Points
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30">
                    <Award className="w-8 h-8 text-primary-500" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 dark:text-white">+10 pts</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Report an issue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
                    <Star className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 dark:text-white">+5 pts</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Issue resolved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                    <TrendingUp className="w-8 h-8 text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 dark:text-white">Up to +10 pts</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Good ratings</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">
            Community Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Recognizing our most active citizens
          </p>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {/* Second Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <Card className="w-full text-center p-4">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{topThree[1].name}</p>
                  <p className="text-2xl font-bold text-primary-500">{topThree[1].points}</p>
                  <p className="text-xs text-slate-500">points</p>
                </Card>
              </div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <Crown className="w-10 h-10 text-amber-400 mb-2 animate-float" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2 ring-4 ring-amber-200 dark:ring-amber-700">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <Card className="w-full text-center p-4 border-2 border-amber-400 dark:border-amber-500">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{topThree[0].name}</p>
                  <p className="text-3xl font-bold text-amber-500">{topThree[0].points}</p>
                  <p className="text-xs text-slate-500">points</p>
                </Card>
              </div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center pt-12">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <Card className="w-full text-center p-4">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{topThree[2].name}</p>
                  <p className="text-2xl font-bold text-primary-500">{topThree[2].points}</p>
                  <p className="text-xs text-slate-500">points</p>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No rankings yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Be the first to report an issue!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {rest.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${getRankBg(entry.rank)}`}
                    >
                      <div className="flex-shrink-0 w-10 text-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white truncate">
                          {entry.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {entry.issuesReported} reported • {entry.issuesResolved} resolved
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-primary-500">{entry.points}</p>
                        <p className="text-xs text-slate-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* How Points Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <Award className="w-8 h-8 text-primary-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">+10 pts</p>
                    <p className="text-sm text-slate-500">Report an issue</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Star className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">+5 pts</p>
                    <p className="text-sm text-slate-500">Issue resolved</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <TrendingUp className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">Up to +10 pts</p>
                    <p className="text-sm text-slate-500">Good ratings</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
