import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Trophy, RotateCcw, Calculator } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Option {
  id: string;
  type: 'call' | 'put';
  strike: number;
  premium: number;
  expiration: string;
  underlying: string;
  currentPrice: number;
}

interface Position {
  option: Option;
  quantity: number;
  action: 'buy' | 'sell';
  cost: number;
}

interface PayoffData {
  price: number;
  profit: number;
}

const OptionsSimulator: React.FC = () => {
  const { user } = useAuth();
  const [selectedStock] = useState({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 175,
    volatility: 0.25
  });
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [cash, setCash] = useState(10000);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [payoffData, setPayoffData] = useState<PayoffData[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const availableOptions: Option[] = [
    {
      id: '1',
      type: 'call',
      strike: 170,
      premium: 8.50,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    },
    {
      id: '2',
      type: 'call',
      strike: 175,
      premium: 5.25,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    },
    {
      id: '3',
      type: 'call',
      strike: 180,
      premium: 2.75,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    },
    {
      id: '4',
      type: 'put',
      strike: 170,
      premium: 3.25,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    },
    {
      id: '5',
      type: 'put',
      strike: 175,
      premium: 6.00,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    },
    {
      id: '6',
      type: 'put',
      strike: 180,
      premium: 9.50,
      expiration: '30 days',
      underlying: 'AAPL',
      currentPrice: 175
    }
  ];

  const calculatePayoff = (stockPrice: number, position: Position): number => {
    const { option, quantity, action } = position;
    let intrinsicValue = 0;
    
    if (option.type === 'call') {
      intrinsicValue = Math.max(0, stockPrice - option.strike);
    } else {
      intrinsicValue = Math.max(0, option.strike - stockPrice);
    }
    
    const optionValue = intrinsicValue;
    const multiplier = action === 'buy' ? 1 : -1;
    
    return (optionValue - option.premium) * quantity * 100 * multiplier;
  };

  const calculateTotalPayoff = (stockPrice: number): number => {
    return positions.reduce((total, position) => {
      return total + calculatePayoff(stockPrice, position);
    }, 0);
  };

  const generatePayoffChart = () => {
    const priceRange = [];
    const minPrice = selectedStock.currentPrice * 0.7;
    const maxPrice = selectedStock.currentPrice * 1.3;
    const step = (maxPrice - minPrice) / 50;
    
    for (let price = minPrice; price <= maxPrice; price += step) {
      priceRange.push({
        price: Math.round(price),
        profit: calculateTotalPayoff(price)
      });
    }
    
    setPayoffData(priceRange);
  };

  const executeOrder = () => {
    if (!selectedOption) return;
    
    const cost = selectedOption.premium * quantity * 100;
    const totalCost = action === 'buy' ? cost : -cost;
    
    if (action === 'buy' && cost > cash) {
      toast.error('Insufficient funds!');
      return;
    }
    
    const newPosition: Position = {
      option: selectedOption,
      quantity,
      action,
      cost: totalCost
    };
    
    setPositions([...positions, newPosition]);
    setCash(cash - totalCost);
    
    toast.success(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${selectedOption.type} option(s)`);
    setSelectedOption(null);
    setQuantity(1);
  };

  const closePosition = (index: number) => {
    const position = positions[index];
    const currentValue = calculateOptionValue(position.option);
    const pnl = action === 'buy' ? 
      (currentValue - position.option.premium) * position.quantity * 100 :
      (position.option.premium - currentValue) * position.quantity * 100;
    
    setCash(cash + position.cost + pnl);
    setPositions(positions.filter((_, i) => i !== index));
    
    toast.success(`Position closed. P&L: $${pnl.toFixed(2)}`);
  };

  const calculateOptionValue = (option: Option): number => {
    // Simplified option pricing - in reality would use Black-Scholes
    const intrinsic = option.type === 'call' ? 
      Math.max(0, selectedStock.currentPrice - option.strike) :
      Math.max(0, option.strike - selectedStock.currentPrice);
    
    const timeValue = option.premium - intrinsic;
    return intrinsic + (timeValue * 0.8); // Assume some time decay
  };

  const resetGame = () => {
    setPositions([]);
    setCash(10000);
    setSelectedOption(null);
    setQuantity(1);
    setGameComplete(false);
    setPayoffData([]);
  };

  const completeGame = async () => {
    setGameComplete(true);
    
    if (user) {
      const totalPnL = cash - 10000;
      const xpEarned = Math.max(0, Math.round(totalPnL / 10 + 100));
      
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'options-simulator',
            score: Math.round(totalPnL),
            xp_earned: xpEarned,
            game_data: { positions, finalCash: cash, totalPnL },
          });

        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`Options trading complete! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  useEffect(() => {
    if (positions.length > 0) {
      generatePayoffChart();
    }
  }, [positions]);

  const totalPnL = cash - 10000;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Options Simulator</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Learn options trading with {selectedStock.symbol} at ${selectedStock.currentPrice}
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
            <p className="text-sm text-primary-600 dark:text-primary-400">Available Cash</p>
            <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
              ${cash.toLocaleString()}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            totalPnL >= 0 ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20'
          }`}>
            <p className={`text-sm ${
              totalPnL >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
            }`}>
              Total P&L
            </p>
            <p className={`text-xl font-bold ${
              totalPnL >= 0 ? 'text-success-900 dark:text-success-100' : 'text-error-900 dark:text-error-100'
            }`}>
              ${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
            <p className="text-sm text-warning-600 dark:text-warning-400">Open Positions</p>
            <p className="text-xl font-bold text-warning-900 dark:text-warning-100">
              {positions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Options */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Available Options</h3>
          <div className="space-y-3">
            {availableOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOption?.id === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        option.type === 'call' 
                          ? 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                          : 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
                      }`}>
                        {option.type.toUpperCase()}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        ${option.strike}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Expires in {option.expiration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      ${option.premium}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      per contract
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Panel */}
          {selectedOption && (
            <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Place Order</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setAction('buy')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    action === 'buy'
                      ? 'bg-success-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setAction('sell')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    action === 'sell'
                      ? 'bg-error-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Quantity (contracts)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="mb-3 p-2 bg-white dark:bg-neutral-800 rounded border">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Cost:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    ${(selectedOption.premium * quantity * 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={executeOrder}
                disabled={action === 'buy' && (selectedOption.premium * quantity * 100) > cash}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                {action === 'buy' ? 'Buy' : 'Sell'} {quantity} Contract{quantity > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Positions & Payoff */}
        <div className="space-y-6">
          {/* Current Positions */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Positions</h3>
            
            {positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((position, index) => {
                  const currentValue = calculateOptionValue(position.option);
                  const pnl = position.action === 'buy' ? 
                    (currentValue - position.option.premium) * position.quantity * 100 :
                    (position.option.premium - currentValue) * position.quantity * 100;
                  
                  return (
                    <div key={index} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              position.option.type === 'call' 
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                                : 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
                            }`}>
                              {position.option.type.toUpperCase()}
                            </span>
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              ${position.option.strike}
                            </span>
                            <span className={`text-xs ${
                              position.action === 'buy' ? 'text-success-600' : 'text-error-600'
                            }`}>
                              {position.action.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {position.quantity} contract{position.quantity > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${pnl >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </p>
                          <button
                            onClick={() => closePosition(index)}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                No positions yet. Select an option to start trading!
              </p>
            )}
          </div>

          {/* Payoff Diagram */}
          {payoffData.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Payoff Diagram at Expiration
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payoffData}>
                    <XAxis dataKey="price" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit/Loss']}
                      labelFormatter={(price: number) => `Stock Price: $${price}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Game Button */}
      {positions.length > 0 && (
        <div className="text-center">
          <button
            onClick={completeGame}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Complete Trading Session
          </button>
        </div>
      )}

      {/* Game Complete Modal */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full p-6 text-center">
            <Trophy className="h-16 w-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Trading Session Complete!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Final P&L: ${totalPnL.toFixed(2)}
            </p>
            
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsSimulator;