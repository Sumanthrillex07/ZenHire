import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../api/chatApi';
import { ChatMessage } from '../types';
import { Sparkles, Bot, Send, X, Loader2, User as UserIcon } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do my skills match open Backend roles?',
    'What should I prepare for technical assessments?',
    'How can I optimize my resume for higher ranking?',
  ];

  useEffect(() => {
    if (isOpen && isAuthenticated && user?.role === 'ROLE_CANDIDATE' && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isAuthenticated || user?.role !== 'ROLE_CANDIDATE') {
    return null;
  }

  const loadHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const history = await chatApi.getHistory();
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const tempCandidateMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'CANDIDATE',
      message: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempCandidateMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(textToSend);
      const replyText = res.reply || res.message || res.aiMessage?.message || '';
      const aiMsg: ChatMessage = {
        id: res.aiMessage?.id || `ai-${Date.now()}`,
        sender: 'AI',
        message: replyText,
        createdAt: res.aiMessage?.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'AI',
        message: 'Sorry, I encountered an issue processing your request. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight">AI Career Advisor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[420px] h-[520px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  ZenHire Advisor
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 rounded">
                    Gemini 1.5
                  </span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Context-grounded career assistance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {isFetchingHistory ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700/50 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Hi, {user.name.split(' ')[0]}!
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs leading-relaxed">
                  I have analyzed your verified skills, resume, and test performance. How can I help accelerate your job search?
                </p>
                <div className="w-full space-y-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700/60 transition-colors shadow-2xs"
                    >
                      &bull; {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'CANDIDATE' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'AI' && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'CANDIDATE'
                        ? 'bg-emerald-600 text-white rounded-br-xs font-medium shadow-xs'
                        : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/60 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.message}
                  </div>

                  {msg.sender === 'CANDIDATE' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>Advisor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts strip when messages exist */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-950/40 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {quickPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors disabled:opacity-50 text-[11px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs, skills, or interviews..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
