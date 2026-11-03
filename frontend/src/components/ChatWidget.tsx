import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../api/chatApi';
import { ChatMessage } from '../types';
import { Sparkles, Send, X, Bot, User as UserIcon, Loader2 } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt chips
  const quickPrompts = [
    'Which jobs match my profile?',
    'How can I improve my match score?',
    'What assessment should I take next?',
    'Review my resume skills',
  ];

  // Only candidates get the career assistant
  if (!isAuthenticated || user?.role !== 'ROLE_CANDIDATE') {
    return null;
  }

  // Fetch history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const history = await chatApi.getHistory();
      setMessages(history);
    } catch {
      // Ignore or empty
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
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="font-semibold text-sm">AI Career Advisor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[550px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  ZenHire Advisor
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    Gemini 1.5
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">Context-grounded career assistance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isFetchingHistory ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h5 className="text-sm font-semibold text-white mb-1">Hi, {user.name.split(' ')[0]}!</h5>
                <p className="text-xs text-slate-400 mb-4 max-w-xs">
                  I have analyzed your verified skills, resume, and test performance. How can I help you accelerate your job search?
                </p>
                <div className="w-full space-y-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left px-3 py-2 text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/60 transition-colors hover:text-white"
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
                    <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'CANDIDATE'
                        ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>

                  {msg.sender === 'CANDIDATE' && (
                    <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts strip when messages exist */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 border-t border-slate-800/50 bg-slate-950/40 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {quickPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700/60 transition-colors disabled:opacity-50"
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
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about jobs, skills, or interviews..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

