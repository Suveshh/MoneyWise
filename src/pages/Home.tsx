import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Brain, 
  Users, 
  Trophy, 
  Star, 
  ArrowRight,
  GamepadIcon,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Target
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized investment advice and explanations with Gemini AI integration.',
    },
    {
      icon: GamepadIcon,
      title: 'Interactive Games',
      description: 'Master trading through engaging simulations and financial challenges.',
    },
    {
      icon: Users,
      title: 'Expert Mentorship',
      description: 'Book one-on-one sessions with certified market professionals.',
    },
    {
      icon: MessageSquare,
      title: 'Community Learning',
      description: 'Connect with peers, ask questions, and share investment insights.',
    },
    {
      icon: Trophy,
      title: 'Gamified Progress',
      description: 'Earn badges, maintain streaks, and climb the leaderboards.',
    },
    {
      icon: BarChart3,
      title: 'Real Market Data',
      description: 'Practice with live stock data and historical market scenarios.',
    },
  ];

  const games = [
    {
      title: 'Fantasy Stock Trading',
      description: 'Invest virtual money in real stocks and track your portfolio performance.',
      difficulty: 'Beginner',
      players: '12,543',
    },
    {
      title: 'Crisis Simulator',
      description: 'Navigate historical market crashes and learn crisis management.',
      difficulty: 'Advanced',
      players: '8,234',
    },
    {
      title: 'Chart Master',
      description: 'Identify patterns and predict stock movements from real charts.',
      difficulty: 'Intermediate',
      players: '15,678',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'MoneyWise transformed my understanding of investing. The games make learning fun!',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Business Major',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'The AI explanations are incredibly helpful. Complex concepts become easy to understand.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Recent Graduate',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'Expert mentorship helped me start investing with confidence. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6 animate-fade-in">
              Master the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Stock Market
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Learn investing through interactive games, AI-powered guidance, and expert mentorship. 
              Build your financial future with confidence and real-world skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/games"
                    className="inline-flex items-center px-8 py-4 bg-white hover:bg-neutral-50 text-primary-600 border-2 border-primary-600 rounded-xl font-semibold transition-all duration-200"
                  >
                    Try Demo Games
                    <GamepadIcon className="ml-2 h-5 w-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Learn Investing
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              From beginner-friendly games to advanced market simulations, 
              we provide comprehensive tools for financial education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Popular Learning Games
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Practice investing skills through engaging simulations and challenges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    game.difficulty === 'Beginner' ? 'bg-success-100 text-success-700' :
                    game.difficulty === 'Intermediate' ? 'bg-warning-100 text-warning-700' :
                    'bg-error-100 text-error-700'
                  }`}>
                    {game.difficulty}
                  </span>
                  <div className="flex items-center text-neutral-500 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {game.players}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {game.title}
                </h3>
                <p className="text-neutral-600 mb-4">{game.description}</p>
                <Link
                  to="/games"
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                >
                  Play Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              What Students Are Saying
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Join thousands of students who have transformed their financial knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join over 50,000 students learning smart investing through games and expert guidance.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-neutral-50 text-primary-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;