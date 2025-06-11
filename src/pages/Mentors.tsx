import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  Calendar, 
  MessageSquare, 
  Video, 
  Badge,
  Clock,
  DollarSign,
  Filter,
  Search
} from 'lucide-react';
import MentorChat from '../components/Chat/MentorChat';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [activeMentorChat, setActiveMentorChat] = useState<any>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'stocks', name: 'Stock Trading' },
    { id: 'options', name: 'Options Trading' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'fundamental', name: 'Fundamental Analysis' },
    { id: 'technical', name: 'Technical Analysis' },
    { id: 'portfolio', name: 'Portfolio Management' },
  ];

  const mentors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Senior Portfolio Manager',
      company: 'Goldman Sachs',
      experience: '15+ years',
      rating: 4.9,
      reviews: 1247,
      specialty: ['stocks', 'portfolio', 'fundamental'],
      price: 150,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Former Goldman Sachs portfolio manager with expertise in equity research and risk management. Helped over 1000 students build successful investment strategies.',
      achievements: ['CFA Charter', 'Harvard MBA', 'Top 1% Mentor'],
      nextAvailable: 'Today 2:00 PM',
      languages: ['English', 'Mandarin'],
      sessionsCompleted: 2847,
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'Options Trading Specialist',
      company: 'Interactive Brokers',
      experience: '12+ years',
      rating: 4.8,
      reviews: 856,
      specialty: ['options', 'technical'],
      price: 120,
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Options trading expert who has trained institutional traders. Specializes in complex options strategies and risk management techniques.',
      achievements: ['Series 7 & 63', 'Options Institute Graduate', 'Expert Mentor Badge'],
      nextAvailable: 'Tomorrow 10:00 AM',
      languages: ['English', 'Spanish'],
      sessionsCompleted: 1632,
    },
    {
      id: 3,
      name: 'Emily Johnson',
      title: 'Cryptocurrency Analyst',
      company: 'Coinbase',
      experience: '8+ years',
      rating: 4.7,
      reviews: 623,
      specialty: ['crypto', 'technical'],
      price: 100,
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Early crypto adopter and blockchain technology expert. Helps students understand cryptocurrency markets and DeFi opportunities.',
      achievements: ['Blockchain Certified', 'Coinbase Alumni', 'Rising Star Mentor'],
      nextAvailable: 'Dec 30, 3:00 PM',
      languages: ['English'],
      sessionsCompleted: 945,
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Technical Analysis Expert',
      company: 'Morgan Stanley',
      experience: '18+ years',
      rating: 4.9,
      reviews: 1456,
      specialty: ['technical', 'stocks'],
      price: 180,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Renowned technical analyst with deep expertise in chart patterns and market psychology. Author of "Modern Technical Analysis" bestseller.',
      achievements: ['CMT Charter', 'Published Author', 'Master Mentor'],
      nextAvailable: 'Dec 31, 1:00 PM',
      languages: ['English', 'Korean'],
      sessionsCompleted: 3241,
    },
    {
      id: 5,
      name: 'Jennifer Liu',
      title: 'Fundamental Analyst',
      company: 'Vanguard',
      experience: '10+ years',
      rating: 4.8,
      reviews: 734,
      specialty: ['fundamental', 'stocks', 'portfolio'],
      price: 130,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Fundamental analysis specialist focused on value investing and long-term wealth building. Passionate about teaching sustainable investment practices.',
      achievements: ['CPA License', 'Wharton Alumni', 'Top Rated Mentor'],
      nextAvailable: 'Jan 2, 11:00 AM',
      languages: ['English', 'Cantonese'],
      sessionsCompleted: 1789,
    },
    {
      id: 6,
      name: 'Robert Thompson',
      title: 'Risk Management Director',
      company: 'BlackRock',
      experience: '20+ years',
      rating: 4.9,
      reviews: 987,
      specialty: ['portfolio', 'fundamental'],
      price: 200,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      bio: 'Senior risk management professional with decades of experience in institutional asset management. Expert in portfolio optimization and risk assessment.',
      achievements: ['FRM Certification', 'Stanford MBA', 'Elite Mentor Status'],
      nextAvailable: 'Jan 3, 4:00 PM',
      languages: ['English'],
      sessionsCompleted: 2156,
    },
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || mentor.specialty.includes(selectedSpecialty);
    const matchesExperience = selectedExperience === 'all' || 
                             (selectedExperience === 'senior' && parseInt(mentor.experience) >= 15) ||
                             (selectedExperience === 'mid' && parseInt(mentor.experience) >= 8 && parseInt(mentor.experience) < 15) ||
                             (selectedExperience === 'junior' && parseInt(mentor.experience) < 8);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const startChat = (mentor: any) => {
    setActiveMentorChat(mentor);
    setIsChatMinimized(false);
  };

  const closeChat = () => {
    setActiveMentorChat(null);
  };

  const toggleChatMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Book Expert Mentors
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Get personalized guidance from certified market professionals. 
            Schedule 1-on-1 sessions with experienced traders and analysts.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              {specialties.map(specialty => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>

            {/* Experience Filter */}
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="all">All Experience</option>
              <option value="senior">Senior (15+ years)</option>
              <option value="mid">Mid-level (8-15 years)</option>
              <option value="junior">Early Career (&lt;8 years)</option>
            </select>

            {/* Sort */}
            <select className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white">
              <option>Sort by Rating</option>
              <option>Sort by Price (Low to High)</option>
              <option>Sort by Price (High to Low)</option>
              <option>Sort by Experience</option>
            </select>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Mentor Header */}
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{mentor.name}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{mentor.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{mentor.company} • {mentor.experience}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-warning-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                    </div>
                    <span className="mx-2 text-neutral-300">•</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{mentor.reviews} reviews</span>
                    <span className="mx-2 text-neutral-300">•</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{mentor.sessionsCompleted} sessions</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">${mentor.price}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">per hour</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 leading-relaxed">
                {mentor.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.specialty.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs rounded-full"
                  >
                    {specialties.find(s => s.id === spec)?.name}
                  </span>
                ))}
              </div>

              {/* Achievements */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                    <Badge className="h-3 w-3 mr-1 text-secondary-600" />
                    {achievement}
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                <strong>Languages:</strong> {mentor.languages.join(', ')}
              </div>

              {/* Next Available */}
              <div className="flex items-center text-sm text-success-600 mb-4">
                <Clock className="h-4 w-4 mr-2" />
                Next available: {mentor.nextAvailable}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </button>
                <button 
                  onClick={() => startChat(mentor)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </button>
                <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Sessions Section */}
        <div className="mt-16 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-secondary-200" />
            <h2 className="text-3xl font-bold mb-4">Live Expert Sessions</h2>
            <p className="text-xl text-secondary-100 mb-6 max-w-2xl mx-auto">
              Join live group sessions and webinars with market experts. 
              Ask questions in real-time and learn from other students.
            </p>
            
            {/* Upcoming Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/20 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-1">Market Analysis Masterclass</h3>
                <p className="text-sm text-secondary-100 mb-2">with Dr. Sarah Chen</p>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Today, 7:00 PM EST
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-1">Options Trading Basics</h3>
                <p className="text-sm text-secondary-100 mb-2">with Michael Rodriguez</p>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Tomorrow, 2:00 PM EST
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-1">Crypto Market Outlook</h3>
                <p className="text-sm text-secondary-100 mb-2">with Emily Johnson</p>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Dec 31, 4:00 PM EST
                </div>
              </div>
            </div>
            
            <button className="bg-white text-secondary-600 px-8 py-3 rounded-lg font-semibold hover:bg-secondary-50 transition-colors">
              View All Live Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Mentor Chat */}
      {activeMentorChat && (
        <MentorChat
          mentor={activeMentorChat}
          isOpen={true}
          onClose={closeChat}
          isMinimized={isChatMinimized}
          onToggleMinimize={toggleChatMinimize}
        />
      )}
    </div>
  );
};

export default Mentors;