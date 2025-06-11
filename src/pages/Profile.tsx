import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  Target, 
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Zap,
  Edit,
  Settings,
  Camera
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'activity', name: 'Activity', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const badges = [
    {
      name: 'First Trade',
      description: 'Completed your first fantasy trade',
      icon: '🎯',
      earned: true,
      earnedDate: '2024-12-15',
    },
    {
      name: 'Quick Learner',
      description: 'Completed 5 AI quizzes with 80%+ score',
      icon: '🧠',
      earned: true,
      earnedDate: '2024-12-18',
    },
    {
      name: 'Day Trader',
      description: 'Made 10 trades in a single day',
      icon: '⚡',
      earned: true,
      earnedDate: '2024-12-20',
    },
    {
      name: 'Risk Manager',
      description: 'Successfully navigated a crisis simulation',
      icon: '🛡️',
      earned: false,
      requirement: 'Complete Crisis Simulator game',
    },
    {
      name: 'Chart Master',
      description: 'Identified 20 chart patterns correctly',
      icon: '📈',
      earned: false,
      requirement: 'Score 90%+ in Chart Master',
    },
    {
      name: 'Community Helper',
      description: 'Received 50 upvotes on community answers',
      icon: '🤝',
      earned: false,
      requirement: 'Help other community members',
    },
  ];

  const recentActivity = [
    {
      type: 'game',
      title: 'Completed Fantasy Trading Challenge',
      description: 'Earned 150 XP and achieved 12% portfolio return',
      time: '2 hours ago',
      xp: 150,
    },
    {
      type: 'quiz',
      title: 'AI Quiz: Understanding P/E Ratios',
      description: 'Scored 85% on fundamental analysis quiz',
      time: '1 day ago',
      xp: 75,
    },
    {
      type: 'mentor',
      title: 'Mentor Session with Dr. Sarah Chen',
      description: 'Discussed portfolio diversification strategies',
      time: '3 days ago',
      xp: 0,
    },
    {
      type: 'achievement',
      title: 'Earned "Day Trader" Badge',
      description: 'Completed 10 trades in Crisis Simulator',
      time: '5 days ago',
      xp: 200,
    },
  ];

  const learningProgress = [
    {
      category: 'Market Fundamentals',
      progress: 75,
      color: 'bg-primary-600',
      completed: 15,
      total: 20,
    },
    {
      category: 'Technical Analysis',
      progress: 45,
      color: 'bg-success-600',
      completed: 9,
      total: 20,
    },
    {
      category: 'Risk Management',
      progress: 30,
      color: 'bg-warning-600',
      completed: 6,
      total: 20,
    },
    {
      category: 'Options Trading',
      progress: 15,
      color: 'bg-secondary-600',
      completed: 3,
      total: 20,
    },
  ];

  const stats = [
    {
      label: 'Total XP',
      value: user?.xp || 0,
      icon: Star,
      color: 'text-primary-600 bg-primary-100',
    },
    {
      label: 'Current Level',
      value: user?.level || 1,
      icon: Trophy,
      color: 'text-warning-600 bg-warning-100',
    },
    {
      label: 'Learning Streak',
      value: `${user?.streak || 0} days`,
      icon: Zap,
      color: 'text-success-600 bg-success-100',
    },
    {
      label: 'Games Played',
      value: 23,
      icon: Target,
      color: 'text-secondary-600 bg-secondary-100',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-primary-600" />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                <Camera className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    {user?.name}
                  </h1>
                  <p className="text-neutral-600 mb-2">
                    {user?.role === 'expert' ? 'Investment Expert' : 'Student Investor'}
                  </p>
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-neutral-500">
                    <span>Joined December 2024</span>
                    <span>•</span>
                    <span>Level {user?.level}</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 flex items-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>

              {/* Level Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Level {user?.level} Progress
                  </span>
                  <span className="text-sm text-neutral-500">
                    {user?.xp || 0} / {((user?.level || 1) * 1000)} XP
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((user?.xp || 0) % 1000) / 10, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-neutral-900">{stat.value}</div>
                      <div className="text-xs text-neutral-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm border border-neutral-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Learning Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Learning Progress</h2>
              <div className="space-y-6">
                {learningProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900">{item.category}</span>
                      <span className="text-sm text-neutral-500">
                        {item.completed}/{item.total} completed
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-neutral-500 mt-1">
                      {item.progress}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'game' ? 'bg-success-100 text-success-600' :
                      activity.type === 'quiz' ? 'bg-primary-100 text-primary-600' :
                      activity.type === 'mentor' ? 'bg-secondary-100 text-secondary-600' :
                      'bg-warning-100 text-warning-600'
                    }`}>
                      {activity.type === 'game' && <Target className="h-4 w-4" />}
                      {activity.type === 'quiz' && <BarChart3 className="h-4 w-4" />}
                      {activity.type === 'mentor' && <User className="h-4 w-4" />}
                      {activity.type === 'achievement' && <Trophy className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{activity.title}</h3>
                      <p className="text-sm text-neutral-600">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-neutral-500">{activity.time}</span>
                        {activity.xp > 0 && (
                          <span className="text-xs text-primary-600 font-medium">
                            +{activity.xp} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Achievements & Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    badge.earned
                      ? 'border-success-200 bg-success-50'
                      : 'border-neutral-200 bg-neutral-50 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-neutral-600 mb-3">{badge.description}</p>
                    {badge.earned ? (
                      <div className="flex items-center justify-center text-success-600 text-sm">
                        <Award className="h-4 w-4 mr-1" />
                        Earned {badge.earnedDate}
                      </div>
                    ) : (
                      <div className="text-neutral-500 text-sm">
                        {badge.requirement}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Activity History</h2>
            <div className="space-y-4">
              {recentActivity.concat(recentActivity).map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'game' ? 'bg-success-100 text-success-600' :
                    activity.type === 'quiz' ? 'bg-primary-100 text-primary-600' :
                    activity.type === 'mentor' ? 'bg-secondary-100 text-secondary-600' :
                    'bg-warning-100 text-warning-600'
                  }`}>
                    {activity.type === 'game' && <Target className="h-5 w-5" />}
                    {activity.type === 'quiz' && <BarChart3 className="h-5 w-5" />}
                    {activity.type === 'mentor' && <User className="h-5 w-5" />}
                    {activity.type === 'achievement' && <Trophy className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 mb-1">{activity.title}</h3>
                    <p className="text-neutral-600 mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{activity.time}</span>
                      {activity.xp > 0 && (
                        <span className="text-sm text-primary-600 font-medium">
                          +{activity.xp} XP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Role
                </label>
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="student">Student</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;