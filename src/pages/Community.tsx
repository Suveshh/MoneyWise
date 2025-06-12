import React, { useState, useEffect } from 'react';
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
  Award,
  X,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    isExpert: boolean;
  };
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  timeAgo: string;
  hasExpertAnswer: boolean;
  bestAnswer?: {
    author: {
      name: string;
      avatar: string;
      isExpert: boolean;
      title?: string;
    };
    content: string;
    votes: number;
    timeAgo: string;
  };
}

const Community: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'recent', name: 'Recent', icon: Clock },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'unanswered', name: 'Unanswered', icon: MessageSquare },
    { id: 'experts', name: 'Expert Answers', icon: Star },
  ];

  const availableTags = [
    'stocks', 'options', 'crypto', 'technical-analysis', 'fundamental-analysis',
    'portfolio', 'beginner', 'risk-management', 'dividends', 'etf'
  ];

  const mockQuestions: Question[] = [
    {
      id: '1',
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
      id: '2',
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
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      // In a real app, this would load from Supabase
      // For now, we'll use mock data and add any user-created questions
      const savedQuestions = localStorage.getItem('community-questions');
      const userQuestions = savedQuestions ? JSON.parse(savedQuestions) : [];
      setQuestions([...userQuestions, ...mockQuestions]);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions(mockQuestions);
    }
  };

  const handleAddQuestion = async () => {
    if (!user) {
      toast.error('Please log in to ask a question');
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setLoading(true);

    try {
      const question: Question = {
        id: Date.now().toString(),
        title: newQuestion.title,
        content: newQuestion.content,
        author: {
          name: user.name,
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
          level: user.level || 1,
          isExpert: user.role === 'expert',
        },
        tags: newQuestion.tags,
        votes: 0,
        answers: 0,
        views: 0,
        timeAgo: 'just now',
        hasExpertAnswer: false,
      };

      // Save to localStorage (in real app, would save to Supabase)
      const savedQuestions = localStorage.getItem('community-questions');
      const userQuestions = savedQuestions ? JSON.parse(savedQuestions) : [];
      userQuestions.unshift(question);
      localStorage.setItem('community-questions', JSON.stringify(userQuestions));

      setQuestions(prev => [question, ...prev]);
      setNewQuestion({ title: '', content: '', tags: [] });
      setShowAddQuestion(false);
      toast.success('Question posted successfully!');
    } catch (error) {
      toast.error('Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newQuestion.tags.includes(newTag.trim()) && newQuestion.tags.length < 5) {
      setNewQuestion(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewQuestion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              Investment Community
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Ask questions, share knowledge, and learn from fellow investors and experts.
            </p>
          </div>
          <button 
            onClick={() => setShowAddQuestion(true)}
            className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
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
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <button className="flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
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
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex-1 mr-4">
                      {question.title}
                    </h3>
                    {question.hasExpertAnswer && (
                      <span className="flex items-center px-2 py-1 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 text-xs rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Expert Answer
                      </span>
                    )}
                  </div>

                  {/* Question Content */}
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                    {question.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Question Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-sm">{question.votes}</span>
                      </div>
                      <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm">{question.answers} answers</span>
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
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
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                            {question.author.name}
                          </span>
                          {question.author.isExpert && (
                            <Star className="h-3 w-3 text-warning-500 inline ml-1" />
                          )}
                          <div className="text-neutral-500 dark:text-neutral-400 text-xs">
                            Level {question.author.level} • {question.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Answer Preview */}
                  {question.bestAnswer && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                        <span className="text-sm font-medium text-success-700 dark:text-success-400">Best Answer</span>
                        <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
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
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {question.bestAnswer.author.name}
                            </span>
                            {question.bestAnswer.author.isExpert && (
                              <span className="ml-2 flex items-center px-2 py-0.5 bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 text-xs rounded-full">
                                <Award className="h-3 w-3 mr-1" />
                                Expert
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {question.bestAnswer.content}
                          </p>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 text-neutral-600 dark:text-neutral-400 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Top Contributors</h3>
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
                        <span className="font-medium text-neutral-900 dark:text-white">{contributor.name}</span>
                        {contributor.isExpert && (
                          <Star className="h-3 w-3 text-warning-500 ml-1" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {contributor.reputation} rep • {contributor.answers} answers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Questions</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Expert Answers</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">8,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Active Members</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">4,567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">This Week</span>
                  <span className="font-semibold text-success-600 dark:text-success-400">+234 questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Ask a Question</h2>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Question Title
                  </label>
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What's your investment question?"
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Question Details
                  </label>
                  <textarea
                    value={newQuestion.content}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Provide more details about your question..."
                    rows={6}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Tags (up to 5)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newQuestion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-primary-900 dark:hover:text-primary-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    />
                    <button
                      onClick={addTag}
                      disabled={!newTag.trim() || newQuestion.tags.length >= 5}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {availableTags.filter(tag => !newQuestion.tags.includes(tag)).map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (newQuestion.tags.length < 5) {
                            setNewQuestion(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          }
                        }}
                        className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 rounded transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddQuestion(false)}
                    className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    disabled={loading || !newQuestion.title.trim() || !newQuestion.content.trim()}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Question
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
