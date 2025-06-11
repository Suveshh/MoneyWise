import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Trophy, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ChartData {
  time: string;
  price: number;
}

interface Question {
  id: string;
  symbol: string;
  data: ChartData[];
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const ChartMaster: React.FC = () => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Generate mock chart data
  const generateChartData = (pattern: string): ChartData[] => {
    const data: ChartData[] = [];
    let price = 100;
    
    for (let i = 0; i < 30; i++) {
      let change = 0;
      
      switch (pattern) {
        case 'uptrend':
          change = Math.random() * 2 - 0.5; // Mostly positive
          break;
        case 'downtrend':
          change = Math.random() * 2 - 1.5; // Mostly negative
          break;
        case 'sideways':
          change = Math.random() * 1 - 0.5; // Small movements
          break;
        case 'volatile':
          change = Math.random() * 6 - 3; // Large swings
          break;
        default:
          change = Math.random() * 2 - 1;
      }
      
      price += change;
      data.push({
        time: `Day ${i + 1}`,
        price: Math.max(price, 10), // Prevent negative prices
      });
    }
    
    return data;
  };

  const mockQuestions: Question[] = [
    {
      id: '1',
      symbol: 'STOCK-A',
      data: generateChartData('uptrend'),
      question: 'What pattern does this chart show?',
      options: ['Uptrend', 'Downtrend', 'Sideways Movement', 'Head and Shoulders'],
      correct: 0,
      explanation: 'This chart shows a clear uptrend with higher highs and higher lows over time.',
    },
    {
      id: '2',
      symbol: 'STOCK-B',
      data: generateChartData('downtrend'),
      question: 'Based on this chart, what would be the best action?',
      options: ['Buy immediately', 'Wait for reversal signal', 'Short the stock', 'Hold current position'],
      correct: 1,
      explanation: 'In a downtrend, it\'s often best to wait for a reversal signal before buying.',
    },
    {
      id: '3',
      symbol: 'STOCK-C',
      data: generateChartData('volatile'),
      question: 'What type of market condition does this represent?',
      options: ['Bull market', 'Bear market', 'Volatile/Choppy market', 'Stable market'],
      correct: 2,
      explanation: 'This chart shows high volatility with frequent price swings in both directions.',
    },
    {
      id: '4',
      symbol: 'STOCK-D',
      data: generateChartData('sideways'),
      question: 'What trading strategy would work best here?',
      options: ['Trend following', 'Range trading', 'Momentum trading', 'Buy and hold'],
      correct: 1,
      explanation: 'In sideways markets, range trading (buying at support, selling at resistance) works best.',
    },
    {
      id: '5',
      symbol: 'STOCK-E',
      data: generateChartData('uptrend'),
      question: 'If you owned this stock, what would you do?',
      options: ['Sell immediately', 'Hold and monitor', 'Buy more', 'Set a stop loss'],
      correct: 3,
      explanation: 'In an uptrend, setting a stop loss helps protect gains while allowing for continued upside.',
    },
  ];

  useEffect(() => {
    setQuestions(mockQuestions);
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
      toast.success('Correct! +20 XP');
    } else {
      toast.error('Incorrect. Study the explanation!');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setGameComplete(true);
    const finalScore = score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0);
    const xpEarned = finalScore * 20;
    
    if (user) {
      try {
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_id: 'chart-master',
            score: finalScore,
            xp_earned: xpEarned,
            game_data: { totalQuestions: questions.length, correctAnswers: finalScore },
          });

        // Update user XP
        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpEarned })
          .eq('id', user.id);

        toast.success(`Game complete! Earned ${xpEarned} XP`);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
    setQuestions(mockQuestions.map(q => ({ ...q, data: generateChartData(q.id) })));
  };

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        {!gameComplete ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Chart Master</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Score</p>
                  <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{score}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">XP</p>
                  <p className="text-xl font-bold text-success-600 dark:text-success-400">{score * 20}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-6">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Chart */}
            <div className="mb-6">
              <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {question.symbol} - Price Chart
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={question.data}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {question.question}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? index === question.correct
                            ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
                            : 'border-error-500 bg-error-50 dark:bg-error-900/20'
                          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : showResult && index === question.correct
                        ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {showResult && (
              <div className={`p-4 rounded-lg mb-6 ${
                selectedAnswer === question.correct
                  ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
                  : 'bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800'
              }`}>
                <div className="flex items-center mb-2">
                  {selectedAnswer === question.correct ? (
                    <Trophy className="h-5 w-5 text-success-600 dark:text-success-400 mr-2" />
                  ) : (
                    <Target className="h-5 w-5 text-error-600 dark:text-error-400 mr-2" />
                  )}
                  <span className={`font-semibold ${
                    selectedAnswer === question.correct
                      ? 'text-success-900 dark:text-success-100'
                      : 'text-error-900 dark:text-error-100'
                  }`}>
                    {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className={`${
                  selectedAnswer === question.correct
                    ? 'text-success-800 dark:text-success-200'
                    : 'text-error-800 dark:text-error-200'
                }`}>
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={restartGame}
                className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </button>
              
              {!showResult ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Game'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Game Complete */
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Game Complete!
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
              You scored {score} out of {questions.length} questions correct
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <p className="text-sm text-primary-600 dark:text-primary-400">Final Score</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {score}/{questions.length}
                </p>
              </div>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                <p className="text-sm text-success-600 dark:text-success-400">XP Earned</p>
                <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                  {score * 20}
                </p>
              </div>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                <p className="text-sm text-warning-600 dark:text-warning-400">Accuracy</p>
                <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>
            
            <button
              onClick={restartGame}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartMaster;