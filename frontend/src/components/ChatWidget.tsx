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
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#ea2845] to-[#780f20] hover:opacity-95 text-white rounded-full shadow-lg shadow-[#ea2845]/25 transition-all duration-200 hover:scale-105 active:scale-95 font-sans"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-tight">AI Career Advisor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[420px] h-[520px] max-h-[85vh] bg-white dark:bg-[#0b0b0b] border border-[#e3dede] dark:border-[#373535] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-4 py-3 bg-[#f5f2f2] dark:bg-[#050303] border-b border-[#e3dede] dark:border-[#1e1c1c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ea2845] to-[#780f20] flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium font-sans text-[#0c0909] dark:text-white flex items-center gap-1.5">
                  ZenHire Advisor
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#ea2845]/15 text-[#ea2845] border border-[#ea2845]/30 rounded-full">
                    Gemini 1.5
                  </span>
                </h4>
                <p className="text-[10px] font-mono text-[#6e6868] dark:text-[#9b9a9a]">Context-grounded career intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#9b9a9a] hover:text-[#0c0909] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f8] dark:bg-[#050303]/70 font-mono">
            {isFetchingHistory ? (
              <div className="h-full flex items-center justify-center text-[#9b9a9a] text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5 text-[#ea2845]" /> Loading history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ea2845]/10 border border-[#ea2845]/25 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-[#ea2845]" />
                </div>
                <h5 className="text-sm font-medium font-sans text-[#0c0909] dark:text-white mb-1">
                  Hi, {user.name.split(' ')[0]}!
                </h5>
                <p className="text-xs font-mono text-[#6e6868] dark:text-[#9b9a9a] mb-4 max-w-xs leading-relaxed">
                  I have analyzed your verified skills, parsed resume, and test metrics. How can I help with your job search?
                </p>
                <div className="w-full space-y-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-[#181818] hover:bg-[#f2eded] dark:hover:bg-[#201e1e] text-[#0c0909] dark:text-[#d4d0d0] rounded-xl border border-[#ded9d9] dark:border-[#373535] transition-colors shadow-2xs font-mono"
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
                    <div className="w-6 h-6 rounded-lg bg-[#ea2845]/10 border border-[#ea2845]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-[#ea2845]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-[18px] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'CANDIDATE'
                        ? 'bg-[#050303] text-white dark:bg-white dark:text-[#050303] rounded-br-xs font-medium shadow-xs'
                        : 'bg-white dark:bg-[#181818] text-[#0c0909] dark:text-white border border-[#ded9d9] dark:border-[#373535] rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.message}
                  </div>

                  {msg.sender === 'CANDIDATE' && (
                    <div className="w-6 h-6 rounded-lg bg-[#050303] text-white dark:bg-white dark:text-[#050303] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-[#ea2845]/10 border border-[#ea2845]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-[#ea2845]" />
                </div>
                <div className="bg-white dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[18px] px-3.5 py-2.5 text-xs text-[#6e6868] dark:text-[#9b9a9a] flex items-center gap-1.5 shadow-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ea2845]" />
                  <span>Advisor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts strip when messages exist */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 border-t border-[#e3dede] dark:border-[#1e1c1c] bg-[#f5f2f2] dark:bg-[#050303] flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {quickPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-[#181818] hover:bg-[#eae55] dark:hover:bg-[#201e1e] text-[#0c0909] dark:text-[#d4d0d0] rounded-full border border-[#ded9d9] dark:border-[#373535] transition-colors disabled:opacity-50 text-[11px] font-mono"
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
            className="p-3 bg-white dark:bg-[#0b0b0b] border-t border-[#e3dede] dark:border-[#1e1c1c] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs, skills, or assessments..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 bg-[#faf8f8] dark:bg-[#181818] border border-[#ded9d9] dark:border-[#373535] rounded-[24px] text-xs font-mono text-[#0c0909] dark:text-white placeholder-[#9b9a9a] focus:outline-none focus:border-[#ea2845]/70 focus:ring-1 focus:ring-[#ea2845]/20 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#050303] text-white dark:bg-white dark:text-[#050303] hover:opacity-90 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
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
