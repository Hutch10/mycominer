/**
 * Coach Chat Panel Component
 * Main conversational interface for coach interactions
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CoachSession, ConversationTurn, SessionContext, UserProfile } from '../utils/coachTypes';

interface CoachChatPanelProps {
  session: CoachSession;
  userProfile: UserProfile;
  onSendMessage?: (message: string) => void;
  onUpdateSession?: (session: CoachSession) => void;
  showHistory?: boolean;
}

export const CoachChatPanel: React.FC<CoachChatPanelProps> = ({
  session,
  userProfile,
  onSendMessage,
  onUpdateSession,
  showHistory = true,
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.conversationHistory]);

  const handleSend = () => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Add user message to history
    const userTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'user',
      content: message,
      metadata: {
        intent: parseIntent(message),
        entities: parseEntities(message),
      },
    };

    const updatedSession = {
      ...session,
      conversationHistory: [...session.conversationHistory, userTurn],
    };

    // Simulate coach response
    setTimeout(() => {
      const coachResponse = generateCoachResponse(message, userProfile, session.mode);
      const coachTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        type: 'coach',
        content: coachResponse,
      };

      const finalSession = {
        ...updatedSession,
        conversationHistory: [...updatedSession.conversationHistory, coachTurn],
        lastUpdated: new Date().toISOString(),
      };

      onUpdateSession?.(finalSession);
      onSendMessage?.(message);
      setMessage('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {session.mode.replace(/-/g, ' ').toUpperCase()}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {session.conversationHistory.length} turns
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.conversationHistory.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              No conversation yet. Ask me anything about {session.mode.replace(/-/g, ' ')}!
            </p>
          </div>
        )}

        {session.conversationHistory.map(turn => (
          <div
            key={turn.id}
            className={`flex ${turn.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                turn.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
              }`}
            >
              <p className="text-sm">{turn.content}</p>
              <p
                className={`text-xs mt-1 ${
                  turn.type === 'user'
                    ? 'text-blue-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {new Date(turn.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Parse user intent from message
 */
function parseIntent(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('recommend') || lower.includes('suggest')) return 'ask-for-recommendation';
  if (lower.includes('how') || lower.includes('what is')) return 'ask-question';
  if (lower.includes('help') || lower.includes('problem') || lower.includes('issue'))
    return 'ask-for-help';
  if (lower.includes('can i') || lower.includes('should i')) return 'ask-for-advice';

  return 'general-inquiry';
}

/**
 * Parse entities from message
 */
function parseEntities(message: string): string[] {
  const entities: string[] = [];
  const keywords = [
    'oyster', 'shiitake', 'lions mane', 'reishi', 'turkey tail', 'king oyster',
    'straw', 'sawdust', 'grain', 'coffee', 'temperature', 'humidity',
    'contamination', 'mold', 'fuzzy feet', 'pins', 'fruiting'
  ];

  const lower = message.toLowerCase();
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      entities.push(keyword);
    }
  }

  return entities;
}

/**
 * Generate coach response (simplified for demo)
 */
function generateCoachResponse(message: string, profile: UserProfile, mode: string): string {
  const responses = [
    `That's a great question about ${mode.replace(/-/g, ' ')}! Based on your ${profile.skillLevel} skill level, I'd recommend...`,
    `I can help with that! For someone with your ${profile.equipment} equipment, the best approach is...`,
    `Based on your interest in ${profile.goals[0]?.type || 'mushroom cultivation'}, let me suggest...`,
    `That's important for success. Given your ${profile.climate} climate, I'd focus on...`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
