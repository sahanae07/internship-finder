import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Internship, StudentProfile, SwipeAction, Match } from '../../types';
import { api } from '../../services/api';
import {
  Heart,
  X,
  Bookmark,
  Info,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Banknote,
  ShieldCheck,
  Zap,
  ArrowRight,
  Keyboard,
  RefreshCw,
} from 'lucide-react';

interface SwipeDeckProps {
  internships: Internship[];
  student: StudentProfile | null;
  onSwipe: (action: SwipeAction, internship: Internship) => void;
  onMatch: (match: Match) => void;
  onOpenDetails: (internship: Internship) => void;
  onOpenMatchExplanation: (internship: Internship) => void;
  onRefreshList: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  internships,
  student,
  onSwipe,
  onMatch,
  onOpenDetails,
  onOpenMatchExplanation,
  onRefreshList,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<{ index: number; action: SwipeAction; internship: Internship }[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const currentInternship = internships[currentIndex];
  const nextInternship = internships[currentIndex + 1];
  const thirdInternship = internships[currentIndex + 2];

  // Motion values for front card drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);

  const executeSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentInternship || !student || isSwiping) return;
      setIsSwiping(true);
      setSwipeDirection(action === 'LIKE' ? 'right' : 'left');

      const targetIntern = currentInternship;

      // Update history for rewind
      setHistory((prev) => [...prev, { index: currentIndex, action, internship: targetIntern }]);
      onSwipe(action, targetIntern);

      try {
        const res = await api.recordSwipe({
          actorRole: 'STUDENT',
          studentId: student.id,
          internshipId: targetIntern.id,
          companyId: targetIntern.companyId,
          action,
        });

        if (res.success && res.matchCreated && res.match) {
          onMatch(res.match);
        }
      } catch (err) {
        console.error('Swipe recording error:', err);
      }

      // Move to next card after exit animation
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        x.set(0);
        setSwipeDirection(null);
        setIsSwiping(false);
      }, 250);
    },
    [currentInternship, student, currentIndex, isSwiping, onSwipe, onMatch, x]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        executeSwipe('LIKE');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        executeSwipe('PASS');
      } else if (e.key === 'ArrowUp' && currentInternship) {
        e.preventDefault();
        if (student) api.toggleSaveInternship(student.id, currentInternship.id);
      } else if (e.key === 'ArrowDown' && currentInternship) {
        e.preventDefault();
        onOpenDetails(currentInternship);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeSwipe, currentInternship, student, onOpenDetails]);

  const handleRewind = () => {
    if (history.length === 0 || isSwiping) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(last.index);
  };

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 400) {
      executeSwipe('LIKE');
    } else if (offset < -100 || velocity < -400) {
      executeSwipe('PASS');
    } else {
      x.set(0);
    }
  };

  // When no more cards in stack
  if (!currentInternship) {
    return (
      <div id="swipe-empty-state" className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto min-h-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-3xl mb-5 text-purple-400">
          ✨
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2">You're All Caught Up!</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          You've swiped through all available internships matching your current criteria. Check back soon for new postings from top tech startups!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            id="refresh-swipes-btn"
            onClick={() => {
              setCurrentIndex(0);
              onRefreshList();
            }}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset & Explore All
          </button>
          {history.length > 0 && (
            <button
              id="rewind-last-card-btn"
              onClick={handleRewind}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Rewind Last Card
            </button>
          )}
        </div>
      </div>
    );
  }

  const score = currentInternship.compatibilityScore || 88;

  return (
    <div id="swipe-deck-container" className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* Cards Stack Box */}
      <div className="relative w-full h-[540px] sm:h-[580px] select-none">
        {/* Layer 3: Third Card (Lowest in stack) */}
        {thirdInternship && (
          <div className="absolute inset-0 top-6 scale-[0.90] opacity-35 pointer-events-none rounded-3xl bg-slate-900 border border-slate-800 shadow-xl" />
        )}

        {/* Layer 2: Next Card */}
        {nextInternship && (
          <div className="absolute inset-0 top-3 scale-[0.95] opacity-70 pointer-events-none rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden border border-slate-700">
                <img src={nextInternship.companyLogo} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold">{nextInternship.companyName}</div>
                <div className="text-base font-bold text-white line-clamp-1">{nextInternship.title}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400">₹{nextInternship.stipend.toLocaleString()}/mo • {nextInternship.workType}</div>
          </div>
        )}

        {/* Layer 1: Front Active Card */}
        <AnimatePresence>
          <motion.div
            id={`internship-card-${currentInternship.id}`}
            key={currentInternship.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={
              swipeDirection === 'right'
                ? { x: 500, opacity: 0, rotate: 25 }
                : swipeDirection === 'left'
                ? { x: -500, opacity: 0, rotate: -25 }
                : { x: 0, opacity: 1 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-750 shadow-2xl shadow-purple-950/20 overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-grab active:cursor-grabbing border-purple-500/20"
          >
            {/* Stamp Overlays */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-4 border-emerald-500 text-emerald-400 font-black text-2xl tracking-wider uppercase rotate-[-15deg] bg-emerald-950/60 backdrop-blur-sm shadow-xl"
            >
              LIKE ❤️
            </motion.div>

            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-4 border-rose-500 text-rose-400 font-black text-2xl tracking-wider uppercase rotate-[15deg] bg-rose-950/60 backdrop-blur-sm shadow-xl"
            >
              PASS ❌
            </motion.div>

            {/* Top Row: Company & AI Match score badge */}
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white p-1 border border-slate-700 shadow-md flex-shrink-0">
                    <img
                      src={currentInternship.companyLogo}
                      alt={currentInternship.companyName}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-200">{currentInternship.companyName}</span>
                      {currentInternship.companyVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      )}
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                      {currentInternship.category}
                    </span>
                  </div>
                </div>

                {/* AI Compatibility Score Badge */}
                <button
                  id="view-ai-score-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMatchExplanation(currentInternship);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 text-purple-200 hover:brightness-125 transition shadow-lg shadow-purple-900/30"
                  title="Click for AI Match Breakdown"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span className="text-xs font-black text-white">{score}%</span>
                  <span className="text-[10px] uppercase font-bold text-purple-300 hidden sm:inline">AI Match</span>
                </button>
              </div>

              {/* Title & Key Specs */}
              <div className="mt-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {currentInternship.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-sm">
                    <Banknote className="w-4 h-4" /> ₹{currentInternship.stipend.toLocaleString()}/mo
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" /> {currentInternship.workType}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {currentInternship.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Description snippet & Skills Chips */}
            <div className="relative z-10 my-3">
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {currentInternship.description}
              </p>

              <div className="mt-3.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentInternship.requiredSkills.slice(0, 5).map((skill) => {
                    const isMatched = student?.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                          isMatched
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isMatched && <span className="text-emerald-400 mr-1">✓</span>}
                        {skill}
                      </span>
                    );
                  })}
                  {currentInternship.requiredSkills.length > 5 && (
                    <span className="px-2 py-1 rounded-xl text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      +{currentInternship.requiredSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Card Footer: View Details Trigger */}
            <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                id="card-view-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(currentInternship);
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <Info className="w-4 h-4" /> View Full Role Details
              </button>

              <span className="text-[11px] text-slate-500">
                {currentInternship.applicantsCount} Applied • {currentInternship.likesCount} Interested
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Control Buttons Bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6">
        {/* Rewind */}
        <button
          id="swipe-rewind-btn"
          onClick={handleRewind}
          disabled={history.length === 0 || isSwiping}
          aria-label="Rewind previous card"
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shadow-lg transition active:scale-95"
          title="Rewind (Undo)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass (Dislike) */}
        <button
          id="swipe-pass-btn"
          onClick={() => executeSwipe('PASS')}
          disabled={isSwiping}
          aria-label="Pass internship"
          className="w-16 h-16 rounded-full bg-slate-900 hover:bg-rose-950/40 border-2 border-rose-500/60 text-rose-500 hover:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/30 transition active:scale-90 hover:scale-105"
          title="Pass (Left Arrow)"
        >
          <X className="w-8 h-8 stroke-[2.5]" />
        </button>

        {/* Save / Bookmark */}
        <button
          id="swipe-save-btn"
          onClick={async () => {
            if (student && currentInternship) {
              await api.toggleSaveInternship(student.id, currentInternship.id);
            }
          }}
          disabled={isSwiping}
          aria-label="Bookmark internship"
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 flex items-center justify-center shadow-lg transition active:scale-95"
          title="Save (Up Arrow)"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* Like (Interest) */}
        <button
          id="swipe-like-btn"
          onClick={() => executeSwipe('LIKE')}
          disabled={isSwiping}
          aria-label="Like and express interest"
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-900/40 transition active:scale-90 hover:scale-105"
          title="Like (Right Arrow)"
        >
          <Heart className="w-8 h-8 fill-white stroke-none" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">←</kbd> Pass
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">→</kbd> Like
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">↑</kbd> Save
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">↓</kbd> Details
        </span>
      </div>
    </div>
  );
};
