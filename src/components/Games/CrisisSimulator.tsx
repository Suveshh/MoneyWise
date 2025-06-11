import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Shield, Target, Trophy, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MarketData {
  day: number;
  sp500: number;
  portfolio: number;
}

interface Crisis {
  id: string;
  name: string;
  description: string;
  startDate: string;
  duration: number;
  severity: 'moderate' | 'severe' | 'extreme';
}

interface Decision {
  id: string;
  day: number;
  event: string;
  options: {
    text: string;
    impact: number;
    explanation: string;
  }[];
}

const CrisisSimulator: React.FC = () => {
  const { user } = useAuth();
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(1000000);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const crises: Crisis[] = [
    {
      id: '2008-financial',
      name: '2008 Financial Crisis',
      description: 'Navigate the subprime mortgage crisis and global financial meltdown.',
      startDate: 'September 2008',
      duration: 180,
      severity: 'extreme',
    },
    {
      id: 'covid-2020',
      name: 'COVID-19 Pandemic',
      description: 'Manage your portfolio during the global pandemic and market volatility.',
      startDate: 'March 2020',
      duration: 120,
      severity: 'severe',
    },
    {
      id: 'dotcom-2000',
      name: 'Dot-com Bubble Burst',
      description: 'Survive the technology stock crash of the early 2000s.',
      startDate: 'March 2000',
      duration: 150,
      severity: 'severe',
    },
  ];

  const generateDecisions = (crisis: Crisis, day: number): Decision[] => {
    const decisions: Decision[] = [];
    
    if (crisis.id === '2008-financial') {
      if (day === 10) {
        decisions.push({
          id: '1',
          day,
          event: 'Lehman Brothers files for bankruptcy. Markets are in freefall.',
          options: [
            {
              text: 'Sell all risky assets immediately',
              impact: -5,
              explanation: 'Panic selling locks in losses but provides cash safety.',
            },
            {
              text: 'Hold current positions and wait',
              impact: -15,
              explanation: 'Holding during panic can lead to severe short-term losses.',
            },
            {
              text: 'Gradually reduce risk exposure',
              impact: -8,
              explanation: 'Measured approach reduces losses while maintaining some upside.',
            },
            {
              text: 'Buy defensive stocks and bonds',
              impact: 2,
              explanation: 'Flight to quality assets can provide stability during crisis.',
            },
          ],
        });
      } else if (day === 30) {
        decisions.push({
          id: '2',
          day,
          event: 'Government announces bank bailout package. Some stability returns.',
          options: [
            {
              text: 'Start buying beaten-down bank stocks',
              impact: 15,
              explanation: 'Government support makes banks attractive at low prices.',
            },
            {
              text: 'Remain in cash and wait for clarity',
              impact: 0,
              explanation: 'Safe but misses potential recovery opportunities.',
            },
            {
              text: 'Diversify into international markets',
              impact: 5,
              explanation: 'Global diversification provides some protection.',
            },
            {
              text: 'Increase bond allocation',
              impact: 3,
              explanation: 'Bonds provide stability but limited upside potential.',
            },
          ],
        });
      }
    } else if (crisis.id === 'covid-2020') {
      if (day === 5) {
        decisions.push({
          id: '3',
          day,
          event: 'WHO declares COVID-19 a pandemic. Markets crash 30% in weeks.',
          options: [
            {
              text: 'Buy technology and healthcare stocks',
              impact: 20,
              explanation: 'Pandemic accelerates digital transformation and healthcare needs.',
            },
            {
              text: 'Sell travel and hospitality stocks',
              impact: 10,
              explanation: 'These sectors will be severely impacted by lockdowns.',
            },
            {
              text: 'Move to cash and wait',
              impact: -5,
              explanation: 'Missing the rapid recovery that follows government intervention.',
            },
            {
              text: 'Buy everything at discount prices',
              impact: 15,
              explanation: 'Broad buying during panic can be profitable but risky.',
            },
          ],
        });
      }
    }
    
    return decisions;
  };

  const startCrisis = (crisis: Crisis) => {
    setSelectedCrisis(crisis);
    setCurrentDay(0);
    setPortfolioValue(1000000);
    setMarketData([{ day: 0, sp500: 100, portfolio: 100 }]);
    setGameComplete(false);
    setDecisions([]);
    
    // Generate initial market decline
    const initialData: MarketData[] = [{ day: 0, sp500: 100, portfolio: 100 }];
    setMarketData(initialData);
  };

  const simulateMarketDay = () => {
    if (!selectedCrisis) return;
    
    const newDay = currentDay + 1;
    const crisis = selectedCrisis;
    
    // Generate market movement based on crisis severity
    let marketChange = 0;
    let portfolioChange = 0;
    
    if (crisis.severity === 'extreme') {
      marketChange = (Math.random() - 0.7) * 4; // Mostly negative, high volatility
    } else if (crisis.severity === 'severe') {
      marketChange = (Math.random() - 0.6) * 3;
    } else {
      marketChange = (Math.random() - 0.5) * 2;
    }
    
    // Portfolio performance relative to market
    portfolioChange = marketChange + (Math.random() - 0.5) * 1;
    
    const lastData = marketData[marketData.length - 1];
    const newMarketValue = lastData.sp500 * (1 + marketChange / 100);
    const newPortfolioValue = lastData.portfolio * (1 + portfolioChange / 100);
    
    setMarketData(prev => [...prev, {
      day: newDay,
      sp500: newMarketValue,
      portfolio: newPortfolioValue,
    }]);
    
    setPortfolioValue(prev => prev * (1 + portfolioChange / 100));
    setCurrentDay(newDay);
    
    // Check for decision points
    const decisions = generateDecisions(crisis, newDay);
    if (decisions.length > 0) {
      setCurrentDecision(decisions[0]);
    }
    
    // Check if crisis is complete
    if (newDay >= crisis.duration) {
      completeGame();
    }
  };

  const makeDecision = async (optionIndex: number) => {
    if (!currentDecision) return;
    
    const option = currentDecision.options[optionIndex];
    setDecisions(prev => [...prev, option.text]);
    
    // Apply decision impact
    const impactMultiplier = 1 + (option.impact / 100);
    setPortfolioValue(prev => prev * impactMultiplier);
    
    // Update market data with decision impact
    setMarketData(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        portfolio: updated[lastIndex].portfolio * impactMultiplier,
      };
      return updated;
    });
    
    toast.success(option.explanation);
    setCurrentDecision(null);
  };

  const completeGame = async () => {
    setGameComplete(true);
    
    if (user && selectedCrisis) {
      const finalReturn = ((portfolioValue - 1000000) / 1000000) * 100;
      const xpEarned = Math.max(0, Math.round(finalReturn * 10 + 100));
      
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'crisis-simulator',
            score: Math.round(finalReturn),
            xp_earned: xpEarned,
            game_data: {
              crisis: selectedCrisis.id,
              finalValue: portfolioValue,
              decisions: decisions,
              duration: currentDay,
            },
          });

        // Update user XP
        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`Crisis survived! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  const resetGame = () => {
    setSelectedCrisis(null);
    setCurrentDay(0);
    setPortfolioValue(1000000);
    setMarketData([]);
    setCurrentDecision(null);
    setGameComplete(false);
    setDecisions([]);
  };

  // Auto-advance simulation
  useEffect(() => {
    if (selectedCrisis && !gameComplete && !currentDecision) {
      const timer = setTimeout(() => {
        simulateMarketDay();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCrisis, currentDay, gameComplete, currentDecision]);

  if (!selectedCrisis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Crisis Simulator
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Test your investment skills during historical market crises. Make strategic decisions
            and see how your portfolio performs under extreme market stress.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crises.map((crisis) => (
              <div
                key={crisis.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                onClick={() => startCrisis(crisis)}
              >
                <div className="flex items-center mb-3">
                  <AlertTriangle className={`h-6 w-6 mr-2 ${
                    crisis.severity === 'extreme' ? 'text-error-600' :
                    crisis.severity === 'severe' ? 'text-warning-600' :
                    'text-yellow-600'
                  }`} />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    crisis.severity === 'extreme' ? 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400' :
                    crisis.severity === 'severe' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {crisis.severity}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {crisis.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  {crisis.description}
                </p>
                
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{crisis.startDate}</span>
                  <span>{crisis.duration} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentReturn = ((portfolioValue - 1000000) / 1000000) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {selectedCrisis.name}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Day {currentDay} of {selectedCrisis.duration}
            </p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <p className="text-sm text-primary-600 dark:text-primary-400">Portfolio Value</p>
            <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
              ${portfolioValue.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            currentReturn >= 0 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : 'bg-error-50 dark:bg-error-900/20'
          }`}>
            <p className={`text-sm ${
              currentReturn >= 0 
                ? 'text-success-600 dark:text-success-400' 
                : 'text-error-600 dark:text-error-400'
            }`}>
              Total Return
            </p>
            <p className={`text-xl font-bold ${
              currentReturn >= 0 
                ? 'text-success-900 dark:text-success-100' 
                : 'text-error-900 dark:text-error-100'
            }`}>
              {currentReturn.toFixed(2)}%
            </p>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Crisis Progress</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {Math.round((currentDay / selectedCrisis.duration) * 100)}%
            </p>
          </div>
          
          <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
            <p className="text-sm text-warning-600 dark:text-warning-400">Decisions Made</p>
            <p className="text-xl font-bold text-warning-900 dark:text-warning-100">
              {decisions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Performance vs Market
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketData}>
              <XAxis dataKey="day" />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
              <Line
                type="monotone"
                dataKey="sp500"
                stroke="#ef4444"
                strokeWidth={2}
                name="S&P 500"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#2563eb"
                strokeWidth={2}
                name="Your Portfolio"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision Modal */}
      {currentDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-warning-600 mr-2" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Crisis Decision - Day {currentDecision.day}
              </h3>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {currentDecision.event}
            </p>
            
            <div className="space-y-3">
              {currentDecision.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => makeDecision(index)}
                  className="w-full p-4 text-left border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {option.text}
                    </span>
                    <span className={`text-sm font-semibold ${
                      option.impact >= 0 ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {option.impact >= 0 ? '+' : ''}{option.impact}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full p-6 text-center">
            <Trophy className="h-16 w-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Crisis Survived!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              You navigated {selectedCrisis.name} with a {currentReturn.toFixed(2)}% return
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <p className="text-sm text-primary-600 dark:text-primary-400">Final Value</p>
                <p className="text-lg font-bold text-primary-900 dark:text-primary-100">
                  ${portfolioValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                <p className="text-sm text-success-600 dark:text-success-400">XP Earned</p>
                <p className="text-lg font-bold text-success-900 dark:text-success-100">
                  {Math.max(0, Math.round(currentReturn * 10 + 100))}
                </p>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try Another Crisis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisSimulator;