import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Target, Trophy, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'stock' | 'bond' | 'etf' | 'commodity' | 'crypto';
  sector: string;
  risk: number; // 1-10
  expectedReturn: number; // annual %
  correlation: { [key: string]: number };
  price: number;
}

interface PortfolioItem {
  asset: Asset;
  allocation: number; // percentage
  amount: number; // dollar amount
}

const BuildPortfolio: React.FC = () => {
  const { user } = useAuth();
  const [budget] = useState(100000);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [availableAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      type: 'stock',
      sector: 'Technology',
      risk: 6,
      expectedReturn: 12,
      correlation: { 'MSFT': 0.7, 'GOOGL': 0.6, 'SPY': 0.8 },
      price: 175.43
    },
    {
      id: '2',
      name: 'Microsoft Corp.',
      symbol: 'MSFT',
      type: 'stock',
      sector: 'Technology',
      risk: 5,
      expectedReturn: 11,
      correlation: { 'AAPL': 0.7, 'GOOGL': 0.65, 'SPY': 0.75 },
      price: 378.85
    },
    {
      id: '3',
      name: 'S&P 500 ETF',
      symbol: 'SPY',
      type: 'etf',
      sector: 'Diversified',
      risk: 4,
      expectedReturn: 8,
      correlation: { 'AAPL': 0.8, 'MSFT': 0.75, 'BND': -0.2 },
      price: 485.73
    },
    {
      id: '4',
      name: 'Vanguard Bond ETF',
      symbol: 'BND',
      type: 'bond',
      sector: 'Fixed Income',
      risk: 2,
      expectedReturn: 4,
      correlation: { 'SPY': -0.2, 'GLD': 0.1, 'AAPL': -0.1 },
      price: 78.45
    },
    {
      id: '5',
      name: 'Gold ETF',
      symbol: 'GLD',
      type: 'commodity',
      sector: 'Commodities',
      risk: 7,
      expectedReturn: 6,
      correlation: { 'BND': 0.1, 'SPY': -0.1, 'BTC': 0.3 },
      price: 185.67
    },
    {
      id: '6',
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'crypto',
      sector: 'Cryptocurrency',
      risk: 10,
      expectedReturn: 15,
      correlation: { 'GLD': 0.3, 'SPY': 0.2, 'AAPL': 0.1 },
      price: 42000
    }
  ]);
  
  const [gameComplete, setGameComplete] = useState(false);
  const [scores, setScores] = useState({
    diversification: 0,
    riskManagement: 0,
    expectedReturn: 0,
    overall: 0
  });

  const addToPortfolio = (asset: Asset, allocation: number) => {
    const amount = (budget * allocation) / 100;
    const existingIndex = portfolio.findIndex(item => item.asset.id === asset.id);
    
    if (existingIndex >= 0) {
      const newPortfolio = [...portfolio];
      newPortfolio[existingIndex].allocation += allocation;
      newPortfolio[existingIndex].amount += amount;
      setPortfolio(newPortfolio);
    } else {
      setPortfolio([...portfolio, { asset, allocation, amount }]);
    }
  };

  const removeFromPortfolio = (assetId: string) => {
    setPortfolio(portfolio.filter(item => item.asset.id !== assetId));
  };

  const calculateScores = () => {
    if (portfolio.length === 0) return;

    // Diversification Score (0-100)
    const sectorCount = new Set(portfolio.map(item => item.asset.sector)).size;
    const typeCount = new Set(portfolio.map(item => item.asset.type)).size;
    const diversificationScore = Math.min(100, (sectorCount * 15) + (typeCount * 10) + (portfolio.length * 5));

    // Risk Management Score (0-100)
    const avgRisk = portfolio.reduce((sum, item) => sum + (item.asset.risk * item.allocation), 0) / 100;
    const riskScore = Math.max(0, 100 - (avgRisk * 8));

    // Expected Return Score (0-100)
    const avgReturn = portfolio.reduce((sum, item) => sum + (item.asset.expectedReturn * item.allocation), 0) / 100;
    const returnScore = Math.min(100, avgReturn * 6);

    // Overall Score
    const overallScore = (diversificationScore + riskScore + returnScore) / 3;

    setScores({
      diversification: Math.round(diversificationScore),
      riskManagement: Math.round(riskScore),
      expectedReturn: Math.round(returnScore),
      overall: Math.round(overallScore)
    });
  };

  const completeGame = async () => {
    calculateScores();
    setGameComplete(true);
    
    if (user) {
      const xpEarned = Math.round(scores.overall * 2);
      
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'build-portfolio',
            score: scores.overall,
            xp_earned: xpEarned,
            game_data: { portfolio, scores },
          });

        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`Portfolio built! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  const resetGame = () => {
    setPortfolio([]);
    setGameComplete(false);
    setScores({ diversification: 0, riskManagement: 0, expectedReturn: 0, overall: 0 });
  };

  const totalAllocation = portfolio.reduce((sum, item) => sum + item.allocation, 0);
  const remainingBudget = budget - portfolio.reduce((sum, item) => sum + item.amount, 0);

  const pieData = portfolio.map(item => ({
    name: item.asset.symbol,
    value: item.allocation,
    color: getAssetColor(item.asset.type)
  }));

  function getAssetColor(type: string) {
    const colors = {
      stock: '#3b82f6',
      bond: '#10b981',
      etf: '#f59e0b',
      commodity: '#ef4444',
      crypto: '#8b5cf6'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        {!gameComplete ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Build-a-Portfolio</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Create a diversified investment portfolio with $100,000
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

            {/* Budget Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <p className="text-sm text-primary-600 dark:text-primary-400">Total Budget</p>
                <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
                  ${budget.toLocaleString()}
                </p>
              </div>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                <p className="text-sm text-success-600 dark:text-success-400">Allocated</p>
                <p className="text-xl font-bold text-success-900 dark:text-success-100">
                  {totalAllocation.toFixed(1)}%
                </p>
              </div>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                <p className="text-sm text-warning-600 dark:text-warning-400">Remaining</p>
                <p className="text-xl font-bold text-warning-900 dark:text-warning-100">
                  ${remainingBudget.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Assets */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Available Assets</h3>
                <div className="space-y-3">
                  {availableAssets.map((asset) => (
                    <div key={asset.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white">{asset.symbol}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900 dark:text-white">${asset.price.toLocaleString()}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{asset.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Risk: {asset.risk}/10</span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Return: {asset.expectedReturn}%</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          className="flex-1"
                          onChange={(e) => {
                            const allocation = parseInt(e.target.value);
                            if (allocation > 0) {
                              addToPortfolio(asset, allocation);
                            }
                          }}
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400 w-12">0-50%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Visualization */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Portfolio</h3>
                
                {portfolio.length > 0 ? (
                  <>
                    {/* Pie Chart */}
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Portfolio Items */}
                    <div className="space-y-2 mb-6">
                      {portfolio.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                          <div>
                            <span className="font-medium text-neutral-900 dark:text-white">{item.asset.symbol}</span>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
                              {item.allocation}%
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-neutral-900 dark:text-white">
                              ${item.amount.toLocaleString()}
                            </p>
                            <button
                              onClick={() => removeFromPortfolio(item.asset.id)}
                              className="text-xs text-error-600 hover:text-error-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalAllocation >= 80 && (
                      <button
                        onClick={completeGame}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Analyze Portfolio
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    <Target className="h-12 w-12 mx-auto mb-4" />
                    <p>Start building your portfolio by selecting assets</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results */
          <div className="text-center">
            <Trophy className="h-16 w-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Portfolio Analysis Complete!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <p className="text-sm text-primary-600 dark:text-primary-400">Diversification</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {scores.diversification}/100
                </p>
              </div>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                <p className="text-sm text-success-600 dark:text-success-400">Risk Management</p>
                <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                  {scores.riskManagement}/100
                </p>
              </div>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                <p className="text-sm text-warning-600 dark:text-warning-400">Expected Return</p>
                <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                  {scores.expectedReturn}/100
                </p>
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Overall Score</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {scores.overall}/100
                </p>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Build Another Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildPortfolio;