import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, User, Video, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCall from '../VideoCall/VideoCall';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
}

interface MentorChatProps {
  mentor: {
    id: number;
    name: string;
    avatar: string;
    title: string;
  };
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const MentorChat: React.FC<MentorChatProps> = ({ 
  mentor, 
  isOpen, 
  onClose, 
  isMinimized, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm ${mentor.name}. I'm here to help you with your investment questions. What would you like to discuss today?`,
      sender: 'mentor',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate mentor response
    setTimeout(() => {
      const mentorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMentorResponse(inputValue),
        sender: 'mentor',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, mentorResponse]);
    }, 1000);
  };

  const generateMentorResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Let me share my perspective on that...",
      "Based on my experience in the market, I'd recommend...",
      "I've seen this situation many times. Here's what typically works...",
      "That's an important concept to understand. Let me explain...",
      "Good thinking! You're on the right track. Consider this as well...",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
  };

  if (!isOpen) return null;

  if (isVideoCallActive) {
    return (
      <VideoCall
        roomId={`mentor-${mentor.id}`}
        userName="Student"
        onEndCall={endVideoCall}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed bottom-4 right-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{mentor.name}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{mentor.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={startVideoCall}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Start Video Call"
            >
              <Video className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Minimize2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-primary-600' 
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3 text-white" />
                      ) : (
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                    </div>
                    <div className={`px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' 
                          ? 'text-primary-200' 
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${mentor.name}...`}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MentorChat;