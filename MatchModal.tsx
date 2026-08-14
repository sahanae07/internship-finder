import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Match } from '../../types';
import { MessageSquare, Sparkles, X, Compass } from 'lucide-react';

interface MatchModalProps {
  match: Match | null;
  onClose: () => void;
  onStartChat: (matchId: string) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, onClose, onStartChat }) => {
  useEffect(() => {
    if (match) {
      // Fire celebratory confetti burst
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ['#8b5cf6', '#ec4899', '#3b82f6'],
        });
        fire(0.2, {
          spread: 60,
          colors: ['#a855f7', '#6366f1', '#10b981'],
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          colors: ['#f43f5e', '#fbbf24', '#8b5cf6'],
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch (e) {
        console.log('Confetti triggered');
      }
    }
  }, [match]);

  if (!match) return null;

  return (
    <AnimatePresence>
      <div id="match-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          id="match-modal-card"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 p-6 sm:p-8 text-center text-white shadow-2xl shadow-purple-900/40"
        >
          {/* Close button */}
          <button
            id="close-match-modal-btn"
            onClick={onClose}
            aria-label="Close match dialog"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Mutual Interest Match
          </div>

          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.08, 1] }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 tracking-tight mb-2"
          >
            IT’S A MATCH! 🎉
          </motion.h2>

          <p className="text-slate-300 text-sm sm:text-base mb-6 font-medium">
            You and <span className="text-white font-semibold">{match.company.companyName}</span> are both excited about each other!
          </p>

          {/* Visual Avatar Connection */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 my-6">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-lg shadow-purple-500/20 ring-4 ring-purple-500/10">
                <img
                  src={match.student.avatar}
                  alt={match.student.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-300">
                Student
              </div>
            </motion.div>

            {/* Glowing Heart Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.25, type: 'spring' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/50 border-2 border-pink-300/40 animate-pulse"
            >
              <span className="text-xl">❤️</span>
            </motion.div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-indigo-400 bg-white p-1 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/10">
                <img
                  src={match.company.logo}
                  alt={match.company.companyName}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -left-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-300">
                Company
              </div>
            </motion.div>
          </div>

          {/* Internship Tag */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-6 text-left">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Matched Role</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">{match.internship.title}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-purple-300">
              <span>Stipend: ₹{match.internship.stipend.toLocaleString()}/mo</span>
              <span>•</span>
              <span>{match.internship.workType}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              id="match-start-chat-btn"
              onClick={() => {
                onClose();
                onStartChat(match.id);
              }}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 text-base"
            >
              <MessageSquare className="w-5 h-5" /> Start Recruiter Chat
            </button>

            <button
              id="match-keep-swiping-btn"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
            >
              <Compass className="w-4 h-4" /> Keep Swiping Discover
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
