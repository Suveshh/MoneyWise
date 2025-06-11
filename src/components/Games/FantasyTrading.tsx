import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Portfolio {
  cash: number;
  stocks: { [symbol: string]: { shares: number; avgPrice: number } };
  totalValue: number;
}

const FantasyTrading: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 100000,
    stocks: {},
    totalValue: 100000,
  });
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Mock stock data - in production, this would come from a real API
  const mockStocks: Stock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.42, changePercent: -0.54 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.67, changePercent: 1.52 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88, change: -8.23, changePercent: -0.25 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: 12.35, changePercent: 5.23 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 18.92, changePercent: 2.21 },
    { symbol: 'META', name: 'Meta Platforms', price: 485.73, change: -3.45, changePercent: -0.71 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 487.83, change: 7.28, changePercent: 1.51 },
  ];

  useEffect(() => {
    loadPortfolio();
    setStocks(mockStocks);
    
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 3,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('game_data')
        .eq('user_id', user.id)
        .eq('game_id', 'fantasy-trading')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.game_data) {
        setPortfolio(data.game_data);
      }
    } catch (error) {
      console.log('No existing portfolio found, starting fresh');
    }
  };

  const savePortfolio = async (newPortfolio: Portfolio) => {
    if (!user) return;

    try {
      await supabase
        .from('game_sessions')
        .upsert({
          user_id: user.id,
          game_id: 'fantasy-trading',
          score: Math.round(newPortfolio.totalValue),
          xp_earned: Math.max(0, Math.round((newPortfolio.totalValue - 100000) / 1000)),
          game_data: newPortfolio,
        });
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const calculatePortfolioValue = (currentPortfolio: Portfolio, currentStocks: Stock[]) => {
    let stockValue = 0;
    Object.entries(currentPortfolio.stocks).forEach(([symbol, holding]) => {
      const stock = currentStocks.find(s => s.symbol === symbol);
      if (stock) {
        stockValue += holding.shares * stock.price;
      }
    });
    return currentPortfolio.cash + stockValue;
  };

  const executeTrade = async () => {
    if (!selectedStock || !user) return;

    setLoading(true);
    
    try {
      const newPortfolio = { ...portfolio };
      const totalCost = selectedStock.price * quantity;

      if (tradeType === 'buy') {
        if (totalCost > newPortfolio.cash) {
          toast.error('Insufficient funds!');
          return;
        }

        newPortfolio.cash -= totalCost;
        
        if (newPortfolio.stocks[selectedStock.symbol]) {
          const currentHolding = newPortfolio.stocks[selectedStock.symbol];
          const totalShares = currentHolding.shares + quantity;
          const totalValue = (currentHolding.shares * currentHolding.avgPrice) + totalCost;
          newPortfolio.stocks[selectedStock.symbol] = {
            shares: totalShares,
            avgPrice: totalValue / totalShares,
          };
        } else {
          newPortfolio.stocks[selectedStock.symbol] = {
            shares: quantity,
            avgPrice: selectedStock.price,
          };
        }

        toast.success(`Bought ${quantity} shares of ${selectedStock.symbol}`);
      } else {
        const holding = newPortfolio.stocks[selectedStock.symbol];
        if (!holding || holding.shares < quantity) {
          toast.error('Insufficient shares!');
          return;
        }

        newPortfolio.cash += totalCost;
        holding.shares -= quantity;
        
        if (holding.shares === 0) {
          delete newPortfolio.stocks[selectedStock.symbol];
        }

        toast.success(`Sold ${quantity} shares of ${selectedStock.symbol}`);
      }

      newPortfolio.totalValue = calculatePortfolioValue(newPortfolio, stocks);
      setPortfolio(newPortfolio);
      await savePortfolio(newPortfolio);
      
      setQuantity(1);
      setSelectedStock(null);
    } catch (error) {
      toast.error('Trade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPortfolio = async () => {
    const freshPortfolio: Portfolio = {
      cash: 100000,
      stocks: {},
      totalValue: 100000,
    };
    
    setPortfolio(freshPortfolio);
    await savePortfolio(freshPortfolio);
    toast.success('Portfolio reset successfully!');
  };

  const currentValue = calculatePortfolioValue(portfolio, stocks);
  const totalReturn = currentValue - 100000;
  const returnPercent = (totalReturn / 100000) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Fantasy Trading Portfolio</h2>
          <button
            onClick={resetPortfolio}
            className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Portfolio
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400">Total Value</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  ${currentValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          
          <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success-600 dark:text-success-400">Cash</p>
                <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                  ${portfolio.cash.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            totalReturn >= 0 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : 'bg-error-50 dark:bg-error-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  totalReturn >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  Total Return
                </p>
                <p className={`text-2xl font-bold ${
                  totalReturn >= 0 
                    ? 'text-success-900 dark:text-success-100' 
                    : 'text-error-900 dark:text-error-100'
                }`}>
                  ${totalReturn.toLocaleString()}
                </p>
              </div>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success-600 dark:text-success-400" />
              ) : (
                <TrendingDown className="h-8 w-8 text-error-600 dark:text-error-400" />
              )}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            returnPercent >= 0 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : 'bg-error-50 dark:bg-error-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  returnPercent >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  Return %
                </p>
                <p className={`text-2xl font-bold ${
                  returnPercent >= 0 
                    ? 'text-success-900 dark:text-success-100' 
                    : 'text-error-900 dark:text-error-100'
                }`}>
                  {returnPercent.toFixed(2)}%
                </p>
              </div>
              <Trophy className={`h-8 w-8 ${
                returnPercent >= 0 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-error-600 dark:text-error-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Market */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Stock Market</h3>
          <div className="space-y-3">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStock?.symbol === stock.symbol
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">{stock.symbol}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      ${stock.price.toFixed(2)}
                    </p>
                    <div className={`flex items-center text-sm ${
                      stock.change >= 0 ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {/* Trade Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Place Trade</h3>
            
            {selectedStock ? (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 dark:text-white">{selectedStock.symbol}</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedStock.name}</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    ${selectedStock.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      tradeType === 'buy'
                        ? 'bg-success-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      tradeType === 'sell'
                        ? 'bg-error-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Total Cost:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      ${(selectedStock.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={executeTrade}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-success-600 hover:bg-success-700 text-white'
                      : 'bg-error-600 hover:bg-error-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${quantity} Shares`}
                </button>
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
                Select a stock to start trading
              </p>
            )}
          </div>

          {/* Holdings */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Your Holdings</h3>
            
            {Object.keys(portfolio.stocks).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(portfolio.stocks).map(([symbol, holding]) => {
                  const stock = stocks.find(s => s.symbol === symbol);
                  const currentValue = stock ? holding.shares * stock.price : 0;
                  const gainLoss = currentValue - (holding.shares * holding.avgPrice);
                  const gainLossPercent = ((currentValue - (holding.shares * holding.avgPrice)) / (holding.shares * holding.avgPrice)) * 100;

                  return (
                    <div key={symbol} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white">{symbol}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {holding.shares} shares @ ${holding.avgPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            ${currentValue.toFixed(2)}
                          </p>
                          <p className={`text-sm ${gainLoss >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                No holdings yet. Start trading to build your portfolio!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyTrading;