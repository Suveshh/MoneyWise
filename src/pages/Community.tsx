import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Clock, 
  User,
  Tag,
  TrendingUp,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Award
} from 'lucide-react';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'recent', name: 'Recent', icon: Clock },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'unanswered', name: 'Unanswered', icon: MessageSquare },
    { id: 'experts', name: 'Expert Answers', icon: Star },
  ];

  const tags = [
    'stocks', 'options', 'crypto', 'technical-analysis', 'fundamental-analysis',
    'portfolio', 'beginner', 'risk-management', 'dividends', 'etf'
  ];

  const questions = [
    {
      id: 1,
      title: 'What is the best strategy for a beginner with $1000 to start investing?',
      content: 'I\'m 22 years old and just started my first job. I have $1000 that I want to invest but I\'m not sure where to start. Should I go with index funds or individual stocks?',
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        level: 2,
        isExpert: false,
      },
      tags: ['beginner', 'stocks', 'portfolio'],
      votes: 15,
      answers: 8,
      views: 156,
      timeAgo: '2 hours ago',
      hasExpertAnswer: true,
      bestAnswer: {
        author: {
          name: 'Dr. Sarah Chen',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
          isExpert: true,
          title: 'Senior Portfolio Manager',
        },
        content: 'For a beginner with $1000, I\'d recommend starting with a diversified index fund like VTSAX or VTI. This gives you exposure to the entire market with low fees...',
        votes: 23,
        timeAgo: '1 hour ago',
      }
    },
    {
      id: 2,
      title: 'How do I interpret P/E ratios when evaluating stocks?',
      content: 'I keep seeing P/E ratios mentioned but I\'m not sure how to use them effectively. What\'s considered a good P/E ratio and how does it vary by industry?',
      author: {
        name: 'Jamie Rodriguez',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        level: 3,
        isExpert: false,
      },
      tags: ['fundamental-analysis', 'stocks'],
      votes: 12,
      answers: 5,
      views: 89,
      timeAgo: '4 hours ago',
      hasExpertAnswer: false,
    },
    {
      id: 3,
      title: 'Is now a good time to invest in cryptocurrency?',
      content: 'With all the volatility in crypto markets, I\'m wondering if it\'s worth getting into Bitcoin or Ethereum now, or should I wait for a better entry point?',
      author: {
        name: 'Morgan Kim',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        level: 4,
        isExpert: false,
      },
      tags: ['crypto', 'timing'],
      votes: 8,
      answers: 12,
      views: 234,
      timeAgo: '6 hours ago',
      hasExpertAnswer: true,
      bestAnswer: {
        author: {
          name: 'Emily Johnson',
          avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
          isExpert: true,
          title: 'Cryptocurrency Analyst',
        },
        content: 'Timing the crypto market is extremely difficult. Dollar-cost averaging into established cryptocurrencies is usually a better strategy than trying to time the market...',
        votes: 18,
        timeAgo: '3 hours ago',
      }
    },
    {
      id: 4,
      title: 'Should I sell my tech stocks after the recent decline?',
      content: 'My tech portfolio is down 25% this year. I\'m wondering if I should cut my losses or hold for the long term. These are mostly FAANG stocks.',
      author: {
        name: 'Taylor Wilson',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        level: 5,
        isExpert: false,
      },
      tags: ['stocks', 'risk-management', 'tech'],
      votes: 20,
      answers: 15,
      views: 312,
      timeAgo: '8 hours ago',
      hasExpertAnswer: true,
    },
    {
      id: 5,
      title: 'What are the best dividend stocks for passive income?',
      content: 'I\'m looking to build a dividend portfolio for passive income. What are some reliable dividend-paying stocks that have a good track record?',
      author: {
        name: 'Chris Thompson',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        level: 3,
        isExpert: false,
      },
      tags: ['dividends', 'passive-income', 'stocks'],
      votes: 14,
      answers: 9,
      views: 178,
      timeAgo: '12 hours ago',
      hasExpertAnswer: false,
    },
  ];

  const topContributors = [
    {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      isExpert: true,
      reputation: 15247,
      answers: 342,
      helpful: 98.5,
    },
    {
      name: 'Michael Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      isExpert: true,
      reputation: 12890,
      answers: 278,
      helpful: 96.8,
    },
    {
      name: 'Emily Johnson',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      isExpert: true,
      reputation: 9456,
      answers: 189,
      helpful: 94.2,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Investment Community
            </h1>
            <p className="text-neutral-600">
              Ask questions, share knowledge, and learn from fellow investors and experts.
            </p>
          </div>
          <button className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Ask Question
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${
                        activeTab === tab.id
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 flex-1 mr-4">
                      {question.title}
                    </h3>
                    {question.hasExpertAnswer && (
                      <span className="flex items-center px-2 py-1 bg-success-50 text-success-700 text-xs rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Expert Answer
                      </span>
                    )}
                  </div>

                  {/* Question Content */}
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {question.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Question Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-neutral-500">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-sm">{question.votes}</span>
                      </div>
                      <div className="flex items-center text-neutral-500">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm">{question.answers} answers</span>
                      </div>
                      <div className="text-sm text-neutral-500">
                        {question.views} views
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <img
                          src={question.author.avatar}
                          alt={question.author.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <div className="text-sm">
                          <span className="text-neutral-700 font-medium">
                            {question.author.name}
                          </span>
                          {question.author.isExpert && (
                            <Star className="h-3 w-3 text-warning-500 inline ml-1" />
                          )}
                          <div className="text-neutral-500 text-xs">
                            Level {question.author.level} • {question.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Answer Preview */}
                  {question.bestAnswer && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                        <span className="text-sm font-medium text-success-700">Best Answer</span>
                        <span className="ml-auto text-xs text-neutral-500">
                          {question.bestAnswer.votes} upvotes
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <img
                          src={question.bestAnswer.author.avatar}
                          alt={question.bestAnswer.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-neutral-900">
                              {question.bestAnswer.author.name}
                            </span>
                            {question.bestAnswer.author.isExpert && (
                              <span className="ml-2 flex items-center px-2 py-0.5 bg-warning-50 text-warning-700 text-xs rounded-full">
                                <Award className="h-3 w-3 mr-1" />
                                Expert
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 leading-relaxed">
                            {question.bestAnswer.content}
                          </p>
                          <div className="text-xs text-neutral-500 mt-1">
                            {question.bestAnswer.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 text-neutral-600 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Contributors</h3>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-900">{contributor.name}</span>
                        {contributor.isExpert && (
                          <Star className="h-3 w-3 text-warning-500 ml-1" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {contributor.reputation} rep • {contributor.answers} answers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Questions</span>
                  <span className="font-semibold">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Expert Answers</span>
                  <span className="font-semibold">8,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Active Members</span>
                  <span className="font-semibold">4,567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">This Week</span>
                  <span className="font-semibold text-success-600">+234 questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;