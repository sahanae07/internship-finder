import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InterviewPrepStudio } from '../components/interview/InterviewPrepStudio';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Lightbulb,
  MessageSquare,
  Compass,
  ArrowRight,
  RotateCcw,
  Mic,
  Zap,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const CareerAssistantPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'prep' | 'chat'>('prep');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hello ${studentProfile?.name.split(' ')[0] || 'there'}! I'm **InternAI**, your dedicated virtual internship advisor and career mentor.

I can help you:
- 🎯 **Simulate Job-Specific Mock Interviews** with voice-to-text live scoring
- ✍️ **Draft personalized outreach messages** for companies you've matched with
- 🗺️ **Identify high-yield missing skills** to boost your compatibility score
- 🚀 **Polish project descriptions** with measurable impact

Switch to **Interview Prep Mode** above to practice real questions from company job postings!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await api.sendCareerAssistantMessage(query, history, studentProfile?.id);

      const botMsg: ChatMessage = {
        role: 'model',
        text: res.reply || "I'm here to help guide your virtual internship career!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'I ran into a temporary connection issue. Please feel free to retry your query.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    'Draft a recruiter message for a mutual match',
    'Give me 3 technical interview questions for React/Node.js',
    'What skills should I learn to qualify for AI/ML roles?',
    'How do I explain my project using the STAR method?',
  ];

  return (
    <div id="career-coach-page" className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">InternAI Career Suite</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Gemini 3.7 Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mock interview simulator & personalized career mentorship
            </p>
          </div>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            id="tab-interview-prep"
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'prep'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Interview Prep Mode</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-extrabold uppercase">
              Live Voice AI
            </span>
          </button>

          <button
            id="tab-career-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Career Coach Chat</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'prep' ? (
        <InterviewPrepStudio />
      ) : (
        /* Chat Assistant View */
        <div className="h-[calc(100vh-230px)] flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-6 backdrop-blur">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">Interactive Career & Recruiter Mentor</span>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    role: 'model',
                    text: 'Chat history cleared. How can I help you prepare or polish your career profile today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition flex items-center gap-1"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px]">Clear</span>
            </button>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                  }`}
                >
                  {m.role === 'model' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      m.role === 'user' ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 overflow-hidden flex-shrink-0 mt-1">
                    <img
                      src={studentProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  <span>InternAI is crafting your response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips */}
          <div className="pt-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              {promptSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium whitespace-nowrap transition flex-shrink-0 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-2 mt-1"
            >
              <input
                id="career-assistant-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask InternAI anything (e.g. How do I prepare for my Google ML interview?)..."
                disabled={loading}
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                id="career-assistant-send-btn"
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message to InternAI"
                className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition active:scale-95 shadow-md shadow-purple-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
