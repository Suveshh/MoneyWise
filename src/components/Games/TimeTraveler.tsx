import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Clock, Trophy, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface HistoricalPeriod {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  majorEvents: string[];
  initialSP500: number;
  finalSP500: number;
}

interface Investment {
  symbol: string;
  name: string;
  amount: number;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
}

interface MarketData {
  year: number;
  sp500: number;
  portfolio: number;
  events: string[];
}

const TimeTraveler: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<HistoricalPeriod | null>(null);
  const [currentYear, setCurrentYear] = useState(0);
  const [portfolio, setPortfolio] = useState<Investment[]>([]);
  const [cash, setCash] = useState(100000);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const historicalPeriods: HistoricalPeriod[] = [
    {
      id: 'dotcom-boom',
      name: 'Dot-com Boom (1995-2000)',
      startYear: 1995,
      endYear: 2000,
      description: 'Experience the rise and fall of internet stocks during the dot-com bubble.',
      majorEvents: [
        '1995: Netscape IPO launches internet investing',
        '1997: Amazon goes public',
        '1998: Google founded',
        '1999: Day trading becomes popular',
        '2000: Dot-com bubble bursts'
      ],
      initialSP500: 615,
      finalSP500: 1469
    },
    {
      id: 'financial-crisis',
      name: 'Financial Crisis Era (2005-2010)',
      startYear: 2005,
      endYear: 2010,
      description: 'Navigate the housing bubble, financial crisis, and market recovery.',
      majorEvents: [
        '2005: Housing market peaks',
        '2007: Subprime crisis begins',
        '2008: Lehman Brothers collapses',
        '2009: Market hits bottom',
        '2010: Recovery begins'
      ],
      initialSP500: 1248,
      finalSP500: 1257
    },
    {
      id: 'tech-recovery',
      name: 'Tech Recovery (2010-2015)',
      startYear: 2010,
      endYear: 2015,
      description: 'Ride the wave of mobile technology and social media growth.',
      majorEvents: [
        '2010: iPad launches',
        '2011: LinkedIn IPO',
        '2012: Facebook IPO',
        '2013: Twitter IPO',
        '2014: Mobile-first investing'
      ],
      initialSP500: 1257,
      finalSP500: 2043
    }
  ];

  const availableStocks = {
    'dotcom-boom': [
      { symbol: 'AMZN', name: 'Amazon', basePrice: 18, volatility: 0.8 },
      { symbol: 'MSFT', name: 'Microsoft', basePrice: 39, volatility: 0.6 },
      { symbol: 'AAPL', name: 'Apple', basePrice: 4, volatility: 0.7 },
      { symbol: 'ORCL', name: 'Oracle', basePrice: 15, volatility: 0.5 },
      { symbol: 'CSCO', name: 'Cisco', basePrice: 8, volatility: 0.9 }
    ],
    'financial-crisis': [
      { symbol: 'JPM', name: 'JPMorgan Chase', basePrice: 43, volatility: 0.7 },
      { symbol: 'BAC', name: 'Bank of America', basePrice: 47, volatility: 0.9 },
      { symbol: 'GS', name: 'Goldman Sachs', basePrice: 134, volatility: 0.8 },
      { symbol: 'XOM', name: 'ExxonMobil', basePrice: 56, volatility: 0.6 },
      { symbol: 'GE', name: 'General Electric', basePrice: 35, volatility: 0.7 }
    ],
    'tech-recovery': [
      { symbol: 'AAPL', name: 'Apple', basePrice: 27, volatility: 0.5 },
      { symbol: 'GOOGL', name: 'Google', basePrice: 307, volatility: 0.4 },
      { symbol: 'FB', name: 'Facebook', basePrice: 38, volatility: 0.8 },
      { symbol: 'NFLX', name: 'Netflix', basePrice: 53, volatility: 0.9 },
      { symbol: 'TSLA', name: 'Tesla', basePrice: 17, volatility: 1.2 }
    ]
  };

  const startPeriod = (period: HistoricalPeriod) => {
    setSelectedPeriod(period);
    setCurrentYear(period.startYear);
    setPortfolio([]);
    setCash(100000);
    setMarketData([{
      year: period.startYear,
      sp500: period.initialSP500,
      portfolio: 100000,
      events: ['Starting investment journey']
    }]);
    setGameComplete(false);
    setIsPlaying(true);
  };

  const buyStock = (symbol: string, amount: number) => {
    if (!selectedPeriod) return;
    
    const stocks = availableStocks[selectedPeriod.id as keyof typeof availableStocks];
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const currentPrice = calculateCurrentPrice(stock, currentYear - selectedPeriod.startYear);
    const shares = amount / currentPrice;
    
    if (amount > cash) {
      toast.error('Insufficient funds!');
      return;
    }

    const newInvestment: Investment = {
      symbol,
      name: stock.name,
      amount,
      shares,
      purchasePrice: currentPrice,
      currentPrice,
      purchaseDate: `${currentYear}`
    };

    setPortfolio([...portfolio, newInvestment]);
    setCash(cash - amount);
    toast.success(`Bought ${shares.toFixed(2)} shares of ${symbol}`);
  };

  const calculateCurrentPrice = (stock: any, yearsElapsed: number) => {
    // Simulate price movement based on historical patterns
    const baseGrowth = selectedPeriod?.id === 'dotcom-boom' ? 0.3 : 
                      selectedPeriod?.id === 'financial-crisis' ? -0.1 : 0.15;
    
    const randomFactor = (Math.random() - 0.5) * stock.volatility;
    const growth = baseGrowth + randomFactor;
    
    return stock.basePrice * Math.pow(1 + growth, yearsElapsed);
  };

  const advanceYear = () => {
    if (!selectedPeriod) return;
    
    const newYear = currentYear + 1;
    setCurrentYear(newYear);
    
    // Update portfolio values
    const updatedPortfolio = portfolio.map(investment => {
      const stocks = availableStocks[selectedPeriod.id as keyof typeof availableStocks];
      const stock = stocks.find(s => s.symbol === investment.symbol);
      if (stock) {
        const newPrice = calculateCurrentPrice(stock, newYear - selectedPeriod.startYear);
        return { ...investment, currentPrice: newPrice };
      }
      return investment;
    });
    setPortfolio(updatedPortfolio);
    
    // Calculate portfolio value
    const portfolioValue = cash + updatedPortfolio.reduce((sum, inv) => 
      sum + (inv.shares * inv.currentPrice), 0);
    
    // Add market data point
    const sp500Progress = selectedPeriod.initialSP500 + 
      ((selectedPeriod.finalSP500 - selectedPeriod.initialSP500) * 
       (newYear - selectedPeriod.startYear) / (selectedPeriod.endYear - selectedPeriod.startYear));
    
    const newDataPoint: MarketData = {
      year: newYear,
      sp500: sp500Progress,
      portfolio: portfolioValue,
      events: getYearEvents(newYear)
    };
    
    setMarketData([...marketData, newDataPoint]);
    
    if (newYear >= selectedPeriod.endYear) {
      completeGame(portfolioValue);
    }
  };

  const getYearEvents = (year: number): string[] => {
    if (!selectedPeriod) return [];
    
    const eventMap: { [key: string]: { [year: number]: string[] } } = {
      'dotcom-boom': {
        1996: ['Internet usage explodes'],
        1997: ['Amazon IPO raises $54M'],
        1998: ['Google founded in garage'],
        1999: ['Day trading mania peaks'],
        2000: ['Dot-com bubble bursts']
      },
      'financial-crisis': {
        2006: ['Housing prices peak'],
        2007: ['Subprime crisis emerges'],
        2008: ['Lehman Brothers fails'],
        2009: ['Market bottoms out'],
        2010: ['Recovery begins']
      },
      'tech-recovery': {
        2011: ['LinkedIn goes public'],
        2012: ['Facebook IPO'],
        2013: ['Twitter IPO'],
        2014: ['Mobile dominates'],
        2015: ['Tech stocks soar']
      }
    };
    
    return eventMap[selectedPeriod.id]?.[year] || [];
  };

  const completeGame = async (finalValue: number) => {
    setGameComplete(true);
    setIsPlaying(false);
    
    if (user && selectedPeriod) {
      const returnPercent = ((finalValue - 100000) / 100000) * 100;
      const xpEarned = Math.max(0, Math.round(returnPercent * 10 + 100));
      
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'time-traveler',
            score: Math.round(returnPercent),
            xp_earned: xpEarned,
            game_data: {
              period: selectedPeriod.id,
              finalValue,
              portfolio,
              yearsPlayed: currentYear - selectedPeriod.startYear
            },
          });

        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`Time travel complete! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  const resetGame = () => {
    setSelectedPeriod(null);
    setCurrentYear(0);
    setPortfolio([]);
    setCash(100000);
    setMarketData([]);
    setGameComplete(false);
    setIsPlaying(false);
  };

  const totalPortfolioValue = cash + portfolio.reduce((sum, inv) => 
    sum + (inv.shares * inv.currentPrice), 0);

  if (!selectedPeriod) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Time Traveler Investor
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Travel back in time and invest during major historical periods. 
            Learn how different eras affected the stock market.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {historicalPeriods.map((period) => (
              <div
                key={period.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                onClick={() => startPeriod(period)}
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {period.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  {period.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  {period.majorEvents.slice(0, 3).map((event, index) => (
                    <div key={index} className="text-xs text-neutral-500 dark:text-neutral-400">
                      • {event}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{period.startYear}-{period.endYear}</span>
                  <span>S&P: {period.initialSP500} → {period.finalSP500}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {selectedPeriod.name}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Current Year: {currentYear}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <p className="text-sm text-primary-600 dark:text-primary-400">Portfolio Value</p>
            <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
              ${totalPortfolioValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
            <p className="text-sm text-success-600 dark:text-success-400">Cash Available</p>
            <p className="text-xl font-bold text-success-900 dark:text-success-100">
              ${cash.toLocaleString()}
            </p>
          </div>
          <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
            <p className="text-sm text-warning-600 dark:text-warning-400">Total Return</p>
            <p className="text-xl font-bold text-warning-900 dark:text-warning-100">
              {((totalPortfolioValue - 100000) / 100000 * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Performance vs S&P 500
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Stocks */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Available Stocks</h3>
          <div className="space-y-3">
            {availableStocks[selectedPeriod.id as keyof typeof availableStocks].map((stock) => {
              const currentPrice = calculateCurrentPrice(stock, currentYear - selectedPeriod.startYear);
              return (
                <div key={stock.symbol} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">{stock.symbol}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      ${currentPrice.toFixed(2)}
                    </p>
                    <button
                      onClick={() => buyStock(stock.symbol, 1000)}
                      disabled={cash < 1000}
                      className="text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      Buy $1000
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio & Controls */}
        <div className="space-y-6">
          {/* Portfolio */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Holdings</h3>
            {portfolio.length > 0 ? (
              <div className="space-y-2">
                {portfolio.map((investment, index) => {
                  const currentValue = investment.shares * investment.currentPrice;
                  const gainLoss = currentValue - investment.amount;
                  const gainLossPercent = (gainLoss / investment.amount) * 100;
                  
                  return (
                    <div key={index} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white">{investment.symbol}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {investment.shares.toFixed(2)} shares
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            ${currentValue.toFixed(2)}
                          </p>
                          <p className={`text-sm ${gainLoss >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                No investments yet. Start buying stocks!
              </p>
            )}
          </div>

          {/* Time Controls */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Time Controls</h3>
            {!gameComplete ? (
              <button
                onClick={advanceYear}
                disabled={currentYear >= selectedPeriod.endYear}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                Advance to {currentYear + 1}
              </button>
            ) : (
              <div className="text-center">
                <Trophy className="h-12 w-12 text-warning-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Time Travel Complete!
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Final Portfolio Value: ${totalPortfolioValue.toLocaleString()}
                </p>
                <button
                  onClick={resetGame}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Try Another Period
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTraveler;