import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, Users, DollarSign, Trophy, RotateCcw, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Company {
  name: string;
  industry: string;
  stage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'scale' | 'ipo-ready' | 'public';
  valuation: number;
  revenue: number;
  employees: number;
  funding: number;
  burnRate: number;
  marketShare: number;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  options: {
    text: string;
    cost: number;
    effects: {
      revenue?: number;
      valuation?: number;
      employees?: number;
      burnRate?: number;
      marketShare?: number;
    };
    risk: number;
  }[];
}

interface MarketEvent {
  title: string;
  description: string;
  effect: {
    revenue?: number;
    valuation?: number;
    marketShare?: number;
  };
}

const StartupIPO: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company>({
    name: 'TechStart Inc.',
    industry: 'SaaS',
    stage: 'idea',
    valuation: 100000,
    revenue: 0,
    employees: 1,
    funding: 50000,
    burnRate: 5000,
    marketShare: 0
  });
  
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [companyHistory, setCompanyHistory] = useState<any[]>([]);
  const [ipoPrice, setIpoPrice] = useState(0);

  const decisions: Decision[] = [
    {
      id: 'product-development',
      title: 'Product Development Strategy',
      description: 'How should we approach building our initial product?',
      options: [
        {
          text: 'Build MVP quickly with basic features',
          cost: 10000,
          effects: { revenue: 5000, valuation: 50000 },
          risk: 0.2
        },
        {
          text: 'Invest in comprehensive product development',
          cost: 30000,
          effects: { revenue: 15000, valuation: 100000 },
          risk: 0.1
        },
        {
          text: 'Outsource development to reduce costs',
          cost: 15000,
          effects: { revenue: 8000, valuation: 60000 },
          risk: 0.3
        }
      ]
    },
    {
      id: 'hiring',
      title: 'Team Building',
      description: 'We need to expand our team. What\'s our hiring strategy?',
      options: [
        {
          text: 'Hire experienced senior developers',
          cost: 50000,
          effects: { employees: 3, burnRate: 15000, valuation: 80000 },
          risk: 0.1
        },
        {
          text: 'Hire junior developers and train them',
          cost: 25000,
          effects: { employees: 5, burnRate: 10000, valuation: 40000 },
          risk: 0.2
        },
        {
          text: 'Use freelancers and contractors',
          cost: 20000,
          effects: { employees: 2, burnRate: 8000, valuation: 30000 },
          risk: 0.3
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing Strategy',
      description: 'How should we acquire our first customers?',
      options: [
        {
          text: 'Invest heavily in digital marketing',
          cost: 40000,
          effects: { revenue: 25000, marketShare: 2, valuation: 120000 },
          risk: 0.2
        },
        {
          text: 'Focus on organic growth and referrals',
          cost: 5000,
          effects: { revenue: 10000, marketShare: 1, valuation: 50000 },
          risk: 0.1
        },
        {
          text: 'Partner with established companies',
          cost: 20000,
          effects: { revenue: 20000, marketShare: 3, valuation: 100000 },
          risk: 0.15
        }
      ]
    },
    {
      id: 'funding',
      title: 'Funding Round',
      description: 'We need more capital. What funding option should we pursue?',
      options: [
        {
          text: 'Raise Series A from VCs',
          cost: 0,
          effects: { funding: 2000000, valuation: 8000000, burnRate: 50000 },
          risk: 0.2
        },
        {
          text: 'Bootstrap and use revenue',
          cost: 0,
          effects: { funding: 100000, valuation: 500000 },
          risk: 0.1
        },
        {
          text: 'Seek angel investors',
          cost: 0,
          effects: { funding: 500000, valuation: 2000000, burnRate: 20000 },
          risk: 0.15
        }
      ]
    }
  ];

  const marketEvents: MarketEvent[] = [
    {
      title: 'Market Boom',
      description: 'The tech market is experiencing unprecedented growth!',
      effect: { valuation: 1.5, revenue: 1.3 }
    },
    {
      title: 'Economic Downturn',
      description: 'Economic uncertainty affects tech valuations.',
      effect: { valuation: 0.7, revenue: 0.8 }
    },
    {
      title: 'New Competitor',
      description: 'A well-funded competitor enters your market.',
      effect: { marketShare: 0.8, revenue: 0.9 }
    },
    {
      title: 'Regulatory Changes',
      description: 'New regulations favor your business model.',
      effect: { valuation: 1.2, marketShare: 1.1 }
    }
  ];

  const generateDecision = (): Decision => {
    const availableDecisions = decisions.filter(d => {
      if (d.id === 'funding' && company.stage === 'idea') return false;
      if (d.id === 'marketing' && company.stage === 'idea') return false;
      return true;
    });
    
    return availableDecisions[Math.floor(Math.random() * availableDecisions.length)];
  };

  const makeDecision = (optionIndex: number) => {
    if (!currentDecision) return;
    
    const option = currentDecision.options[optionIndex];
    
    // Check if company can afford the decision
    if (option.cost > company.funding) {
      toast.error('Insufficient funding for this decision!');
      return;
    }
    
    // Apply effects with some randomness based on risk
    const riskFactor = Math.random() < option.risk ? 0.5 : 1;
    
    const newCompany = { ...company };
    newCompany.funding -= option.cost;
    
    Object.entries(option.effects).forEach(([key, value]) => {
      if (key === 'revenue' || key === 'valuation' || key === 'employees' || key === 'burnRate' || key === 'marketShare') {
        if (key === 'employees' || key === 'burnRate') {
          newCompany[key] += value * riskFactor;
        } else {
          newCompany[key] += value * riskFactor;
        }
      }
    });
    
    // Update company stage based on metrics
    updateCompanyStage(newCompany);
    
    setCompany(newCompany);
    setCurrentDecision(null);
    
    const successMessage = riskFactor === 1 ? 'Decision executed successfully!' : 'Decision had mixed results due to market conditions.';
    toast.success(successMessage);
  };

  const updateCompanyStage = (comp: Company) => {
    if (comp.valuation >= 1000000000 && comp.revenue >= 100000000) {
      comp.stage = 'ipo-ready';
    } else if (comp.valuation >= 100000000 && comp.revenue >= 10000000) {
      comp.stage = 'scale';
    } else if (comp.valuation >= 10000000 && comp.revenue >= 1000000) {
      comp.stage = 'growth';
    } else if (comp.revenue >= 100000) {
      comp.stage = 'mvp';
    } else if (comp.valuation >= 500000) {
      comp.stage = 'prototype';
    }
  };

  const advanceQuarter = () => {
    const newQuarter = currentQuarter + 1;
    setCurrentQuarter(newQuarter);
    
    // Apply quarterly effects
    const newCompany = { ...company };
    newCompany.funding -= newCompany.burnRate;
    
    // Random market event
    if (Math.random() < 0.3) {
      const event = marketEvents[Math.floor(Math.random() * marketEvents.length)];
      applyMarketEvent(newCompany, event);
      toast.info(`Market Event: ${event.title}`);
    }
    
    // Check for bankruptcy
    if (newCompany.funding <= 0 && newCompany.revenue < newCompany.burnRate) {
      toast.error('Company ran out of funding! Game Over.');
      setGameComplete(true);
      return;
    }
    
    // Add to history
    setCompanyHistory([...companyHistory, {
      quarter: newQuarter,
      valuation: newCompany.valuation,
      revenue: newCompany.revenue,
      funding: newCompany.funding
    }]);
    
    setCompany(newCompany);
    
    // Check for IPO readiness
    if (newCompany.stage === 'ipo-ready' && !gameComplete) {
      initiateIPO(newCompany);
    } else if (newQuarter % 2 === 0) {
      // Present decision every 2 quarters
      setCurrentDecision(generateDecision());
    }
  };

  const applyMarketEvent = (comp: Company, event: MarketEvent) => {
    Object.entries(event.effect).forEach(([key, multiplier]) => {
      if (key === 'valuation' || key === 'revenue' || key === 'marketShare') {
        comp[key] *= multiplier;
      }
    });
  };

  const initiateIPO = async (comp: Company) => {
    const calculatedIPOPrice = Math.round(comp.valuation / 10000000); // Price per share
    setIpoPrice(calculatedIPOPrice);
    setGameComplete(true);
    
    if (user) {
      const score = Math.round(comp.valuation / 1000000); // Score in millions
      const xpEarned = Math.max(100, score * 10);
      
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'startup-ipo',
            score,
            xp_earned: xpEarned,
            game_data: {
              finalCompany: comp,
              quarters: currentQuarter,
              ipoPrice: calculatedIPOPrice
            },
          });

        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`IPO successful! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  const resetGame = () => {
    setCompany({
      name: 'TechStart Inc.',
      industry: 'SaaS',
      stage: 'idea',
      valuation: 100000,
      revenue: 0,
      employees: 1,
      funding: 50000,
      burnRate: 5000,
      marketShare: 0
    });
    setCurrentQuarter(1);
    setCurrentDecision(null);
    setGameComplete(false);
    setCompanyHistory([]);
    setIpoPrice(0);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'idea': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
      'prototype': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'mvp': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      'growth': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      'scale': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      'ipo-ready': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      'public': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[stage as keyof typeof colors] || colors.idea;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{company.name}</h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(company.stage)}`}>
                {company.stage.replace('-', ' ').toUpperCase()}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                Quarter {currentQuarter} • {company.industry}
              </span>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <p className="text-sm text-primary-600 dark:text-primary-400">Valuation</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
              ${(company.valuation / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
            <p className="text-sm text-success-600 dark:text-success-400">Revenue</p>
            <p className="text-lg font-bold text-success-900 dark:text-success-100">
              ${(company.revenue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
            <p className="text-sm text-warning-600 dark:text-warning-400">Funding</p>
            <p className="text-lg font-bold text-warning-900 dark:text-warning-100">
              ${(company.funding / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">Employees</p>
            <p className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
              {company.employees}
            </p>
          </div>
          <div className="bg-error-50 dark:bg-error-900/20 p-4 rounded-lg">
            <p className="text-sm text-error-600 dark:text-error-400">Burn Rate</p>
            <p className="text-lg font-bold text-error-900 dark:text-error-100">
              ${(company.burnRate / 1000).toFixed(0)}K/Q
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {companyHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Valuation Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={companyHistory}>
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, 'Valuation']} />
                  <Line
                    type="monotone"
                    dataKey="valuation"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Financial Metrics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyHistory}>
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="funding" fill="#f59e0b" name="Funding" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {currentDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Strategic Decision - Quarter {currentQuarter}
              </h3>
            </div>
            
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              {currentDecision.title}
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {currentDecision.description}
            </p>
            
            <div className="space-y-3">
              {currentDecision.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => makeDecision(index)}
                  disabled={option.cost > company.funding}
                  className="w-full p-4 text-left border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {option.text}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-error-600">
                        ${(option.cost / 1000).toFixed(0)}K
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        option.risk <= 0.1 ? 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400' :
                        option.risk <= 0.2 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400' :
                        'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
                      }`}>
                        {option.risk <= 0.1 ? 'Low Risk' : option.risk <= 0.2 ? 'Medium Risk' : 'High Risk'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Effects: {Object.entries(option.effects).map(([key, value]) => 
                      `${key}: +${typeof value === 'number' ? (value / 1000).toFixed(0) + 'K' : value}`
                    ).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Controls */}
      {!gameComplete && !currentDecision && (
        <div className="text-center">
          <button
            onClick={advanceQuarter}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
          >
            <Zap className="h-4 w-4 mr-2" />
            Advance to Quarter {currentQuarter + 1}
          </button>
        </div>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
          <Trophy className="h-16 w-16 text-warning-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            {company.stage === 'ipo-ready' ? 'IPO Successful!' : 'Game Over'}
          </h2>
          
          {company.stage === 'ipo-ready' ? (
            <div>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
                Congratulations! Your company went public at ${ipoPrice} per share
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <p className="text-sm text-primary-600 dark:text-primary-400">Final Valuation</p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                    ${(company.valuation / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                  <p className="text-sm text-success-600 dark:text-success-400">IPO Price</p>
                  <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                    ${ipoPrice}
                  </p>
                </div>
                <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                  <p className="text-sm text-warning-600 dark:text-warning-400">Quarters</p>
                  <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                    {currentQuarter}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
              Your startup ran out of funding. Better luck next time!
            </p>
          )}
          
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            Start New Company
          </button>
        </div>
      )}
    </div>
  );
};

export default StartupIPO;