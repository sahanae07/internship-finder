import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Message } from '../types';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  Sparkles,
  Calendar,
  Award,
  FileText,
  Clock,
  CheckCheck,
  Building2,
  User,
  Search,
  ExternalLink,
  Zap,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface MatchesAndChatPageProps {
  initialMatchId?: string | null;
  onNavigate?: (page: string) => void;
}

export const MatchesAndChatPage: React.FC<MatchesAndChatPageProps> = ({
  initialMatchId,
  onNavigate,
}) => {
  const { user, role, studentProfile, companyProfile } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Modals for Recruiter Actions inside chat
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStipend, setOfferStipend] = useState('₹45,000 / month');
  const [offerDuration, setOfferDuration] = useState('3 Months');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const queryParams =
          role === 'STUDENT'
            ? { studentId: studentProfile?.id || 'student-1' }
            : { companyId: companyProfile?.id || 'comp-1' };

        const res = await api.getMatches(queryParams);
        if (res.success && res.data) {
          setMatches(res.data);
          if (res.data.length > 0) {
            const found = initialMatchId
              ? res.data.find((m) => m.id === initialMatchId) || res.data[0]
              : res.data[0];
            setActiveMatch(found);
          }
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [role, studentProfile?.id, companyProfile?.id, initialMatchId]);

  // Fetch messages when active match changes
  useEffect(() => {
    if (!activeMatch) return;
    const fetchMessages = async () => {
      try {
        const res = await api.getMessages(activeMatch.id);
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [activeMatch]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string, messageType: 'TEXT' | 'OFFER_INTERVIEW' = 'TEXT') => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeMatch || sending) return;

    setSending(true);
    try {
      const senderName =
        role === 'STUDENT'
          ? studentProfile?.name || 'Student'
          : companyProfile?.companyName || 'Recruiter';
      const senderAvatar =
        role === 'STUDENT'
          ? studentProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          : companyProfile?.logo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100';

      const res = await api.sendMessage({
        matchId: activeMatch.id,
        senderId: user?.id || (role === 'STUDENT' ? 'user-student-1' : 'user-comp-1'),
        senderRole: role === 'STUDENT' ? 'STUDENT' : 'COMPANY',
        senderName,
        senderAvatar,
        content: text,
        type: messageType,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setInputText('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !activeMatch) return;
    const text = `📅 Interview Invitation: We would like to schedule a virtual technical round with you on ${interviewDate}. Note: ${interviewNote || 'Looking forward to meeting you!'}`;
    await handleSendMessage(text, 'OFFER_INTERVIEW');
    setShowInterviewModal(false);
    setInterviewDate('');
    setInterviewNote('');
  };

  const handleSendOffer = async () => {
    if (!activeMatch) return;
    const text = `🎉 Official Internship Offer: We are thrilled to extend an offer for ${activeMatch.internship.title} at ${offerStipend} for ${offerDuration}. Welcome aboard!`;
    await handleSendMessage(text, 'TEXT');
    setShowOfferModal(false);
  };

  const filteredMatches = matches.filter((m) => {
    const searchTarget =
      role === 'STUDENT'
        ? `${m.company.companyName} ${m.internship.title}`
        : `${m.student.name} ${m.student.college} ${m.internship.title}`;
    return searchTarget.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const studentQuickPrompts = [
    'Hello! Thank you for the mutual match. I am thrilled about this opportunity.',
    'Could you share more about the project scope for this virtual internship?',
    'Here is my latest GitHub repository featuring my full-stack projects.',
  ];

  const recruiterQuickPrompts = [
    'Hi! We loved your profile and projects. Are you available for a quick chat this week?',
    'Could you share your experience with FastAPI and React state management?',
    'We are reviewing top shortlisted applicants and would like to move to the interview stage.',
  ];

  const quickPrompts = role === 'STUDENT' ? studentQuickPrompts : recruiterQuickPrompts;

  return (
    <div id="matches-and-chat-page" className="max-w-7xl mx-auto px-4 py-4 sm:py-6 h-[calc(100vh-130px)] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
        {/* Left Column: Matches List */}
        <div className="md:col-span-4 lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-800 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {role === 'STUDENT' ? 'Mutual Matches' : 'Matched Candidates'}
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                {matches.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-matches-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={role === 'STUDENT' ? 'Search companies or roles...' : 'Search student candidates...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Matches Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading matches...</div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No matches found</p>
                <p className="text-xs text-slate-500">
                  {role === 'STUDENT'
                    ? 'Swipe right on virtual internships in the Discover tab to create new matches!'
                    : 'Swipe right on student profiles in Talent Swipe to create matches!'}
                </p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const isSelected = activeMatch?.id === m.id;
                const avatar = role === 'STUDENT' ? m.company.logo : m.student.avatar;
                const title = role === 'STUDENT' ? m.company.companyName : m.student.name;
                const subtitle = m.internship.title;
                const badge = role === 'STUDENT' ? `₹${m.internship.stipend.toLocaleString()}` : m.student.degree;

                return (
                  <button
                    key={m.id}
                    id={`match-item-${m.id}`}
                    onClick={() => setActiveMatch(m)}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition ${
                      isSelected
                        ? 'bg-purple-600/15 border-l-4 border-purple-500'
                        : 'hover:bg-slate-850 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 relative">
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white truncate">{title}</h3>
                        <span className="text-[10px] text-slate-500">Just now</span>
                      </div>
                      <p className="text-[11px] text-purple-300 font-medium truncate mt-0.5">{subtitle}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                          {badge}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Box */}
        <div className="md:col-span-8 lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden">
          {activeMatch ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                    <img
                      src={role === 'STUDENT' ? activeMatch.company.logo : activeMatch.student.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {role === 'STUDENT' ? activeMatch.company.companyName : activeMatch.student.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Mutual Match
                      </span>
                    </div>
                    <p className="text-xs text-purple-300">
                      {activeMatch.internship.title} • ₹{activeMatch.internship.stipend.toLocaleString()}/mo
                    </p>
                  </div>
                </div>

                {/* Recruiter Action Buttons */}
                <div className="flex items-center gap-2">
                  {role === 'COMPANY' && (
                    <>
                      <button
                        id="schedule-interview-trigger-btn"
                        onClick={() => setShowInterviewModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                      </button>
                      <button
                        id="send-offer-trigger-btn"
                        onClick={() => setShowOfferModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <Award className="w-3.5 h-3.5" /> Make Offer
                      </button>
                    </>
                  )}
                  {role === 'STUDENT' && (
                    <button
                      onClick={() => onNavigate && onNavigate('profile')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-400" /> Share Resume
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                {/* Match Announcement Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-indigo-900/30 border border-purple-500/30 text-center max-w-md mx-auto space-y-1 shadow-lg">
                  <div className="inline-flex p-2 rounded-full bg-purple-500/20 text-purple-300 mb-1">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <h4 className="text-xs font-bold text-white">It's a Match!</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Both sides swiped right on {activeMatch.internship.title}. Start the conversation to align on onboarding and interview steps.
                  </p>
                </div>

                {/* Messages List */}
                {messages.map((m) => {
                  const isMe =
                    role === 'STUDENT'
                      ? m.senderRole === 'STUDENT'
                      : m.senderRole === 'COMPANY';

                  const isInterviewInvite = m.type === 'OFFER_INTERVIEW' || m.content.includes('Interview Invitation');

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 mt-0.5">
                          <img src={m.senderAvatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isInterviewInvite
                            ? 'bg-purple-950 border border-purple-500/50 text-purple-100 shadow-lg'
                            : isMe
                            ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center justify-between gap-4">
                          <span>{m.senderName}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>

                      {isMe && (
                        <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/30 overflow-hidden flex-shrink-0 mt-0.5">
                          <img src={m.senderAvatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Prompt Chips */}
              <div className="p-3 border-t border-slate-800 bg-slate-900 flex-shrink-0 space-y-2">
                {/* Prompt Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      disabled={sending}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-medium whitespace-nowrap transition flex-shrink-0 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    id="chat-message-input"
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${role === 'STUDENT' ? activeMatch.company.companyName : activeMatch.student.name}...`}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                  <button
                    id="chat-send-btn"
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    aria-label="Send message"
                    className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition active:scale-95 shadow-md shadow-purple-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Select a match to chat</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                When you match mutually with a candidate or internship post, direct messaging and interview scheduling unlock automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && activeMatch && (
        <div id="schedule-interview-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Schedule Technical Interview</h3>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Candidate</label>
                <input
                  type="text"
                  disabled
                  value={`${activeMatch.student.name} (${activeMatch.internship.title})`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Date & Time</label>
                <input
                  id="interview-date-input"
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meeting Details / Google Meet link</label>
                <textarea
                  id="interview-notes-input"
                  rows={3}
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="e.g. 45-min live coding session on Google Meet: meet.google.com/abc-def-ghi"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="confirm-schedule-interview-btn"
                onClick={handleScheduleInterview}
                disabled={!interviewDate}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow transition"
              >
                Send Interview Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Offer Modal */}
      {showOfferModal && activeMatch && (
        <div id="send-offer-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Extend Virtual Internship Offer</h3>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Candidate</label>
                <input
                  type="text"
                  disabled
                  value={`${activeMatch.student.name}`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Monthly Stipend</label>
                <input
                  id="offer-stipend-input"
                  type="text"
                  value={offerStipend}
                  onChange={(e) => setOfferStipend(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                <input
                  id="offer-duration-input"
                  type="text"
                  value={offerDuration}
                  onChange={(e) => setOfferDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="confirm-send-offer-btn"
                onClick={handleSendOffer}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow transition"
              >
                Dispatch Official Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
