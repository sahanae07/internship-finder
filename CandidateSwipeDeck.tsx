import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { StudentProfile, CompanyProfile, SwipeAction, Match } from '../../types';
import { api } from '../../services/api';
import {
  Heart,
  X,
  Sparkles,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  MapPin,
  Clock,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Award,
} from 'lucide-react';

interface CandidateSwipeDeckProps {
  candidates: (StudentProfile & { compatibilityScore: number; targetInternshipTitle: string })[];
  company: CompanyProfile | null;
  targetInternshipId: string;
  onSwipe: (action: SwipeAction, candidate: StudentProfile) => void;
  onMatch: (match: Match) => void;
  onRefresh: () => void;
}

export const CandidateSwipeDeck: React.FC<CandidateSwipeDeckProps> = ({
  candidates,
  company,
  targetInternshipId,
  onSwipe,
  onMatch,
  onRefresh,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const currentCandidate = candidates[currentIndex];
  const nextCandidate = candidates[currentIndex + 1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);

  const executeSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentCandidate || !company || isSwiping) return;
      setIsSwiping(true);
      setSwipeDirection(action === 'LIKE' ? 'right' : 'left');

      const target = currentCandidate;
      onSwipe(action, target);

      try {
        const res = await api.recordSwipe({
          actorRole: 'COMPANY',
          studentId: target.id,
          internshipId: targetInternshipId || 'intern-1',
          companyId: company.id,
          action,
        });

        if (res.success && res.matchCreated && res.match) {
          onMatch(res.match);
        }
      } catch (err) {
        console.error('Candidate swipe failed:', err);
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        x.set(0);
        setSwipeDirection(null);
        setIsSwiping(false);
      }, 250);
    },
    [currentCandidate, company, targetInternshipId, isSwiping, onSwipe, onMatch, x]
  );

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

  if (!currentCandidate) {
    return (
      <div id="candidate-empty-state" className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto min-h-[500px] bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl mb-5 text-indigo-400">
          🎓
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-2">All Candidates Reviewed!</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          You have reviewed all available student applicants in this talent pool. New students register daily on InternSwipe.
        </p>
        <button
          id="refresh-candidates-btn"
          onClick={() => {
            setCurrentIndex(0);
            onRefresh();
          }}
          className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Reset Candidate Deck
        </button>
      </div>
    );
  }

  return (
    <div id="candidate-swipe-deck" className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* Card Stack Container */}
      <div className="relative w-full h-[560px] sm:h-[600px] select-none">
        {/* Next candidate card background layer */}
        {nextCandidate && (
          <div className="absolute inset-0 top-3 scale-[0.95] opacity-60 pointer-events-none rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center gap-3">
              <img src={nextCandidate.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <div className="text-base font-bold text-white">{nextCandidate.name}</div>
                <div className="text-xs text-slate-400">{nextCandidate.college}</div>
              </div>
            </div>
          </div>
        )}

        {/* Active Candidate Card */}
        <AnimatePresence>
          <motion.div
            id={`candidate-card-${currentCandidate.id}`}
            key={currentCandidate.id}
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
            className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-2xl shadow-indigo-950/20 overflow-hidden flex flex-col justify-between p-5 sm:p-6 cursor-grab active:cursor-grabbing"
          >
            {/* Stamps */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-4 border-emerald-500 text-emerald-400 font-black text-2xl uppercase rotate-[-15deg] bg-emerald-950/70 backdrop-blur-sm"
            >
              INTERESTED ❤️
            </motion.div>

            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 z-20 pointer-events-none px-4 py-1.5 rounded-2xl border-4 border-rose-500 text-rose-400 font-black text-2xl uppercase rotate-[15deg] bg-rose-950/70 backdrop-blur-sm"
            >
              PASS ❌
            </motion.div>

            {/* Candidate Header */}
            <div>
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg flex-shrink-0">
                  <img
                    src={currentCandidate.avatar}
                    alt={currentCandidate.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                      {currentCandidate.name}
                    </h3>
                    <div className="px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      {currentCandidate.compatibilityScore}%
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 mt-1 font-semibold">
                    <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{currentCandidate.college}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {currentCandidate.degree} • {currentCandidate.year}
                  </div>
                </div>
              </div>

              {/* Bio & Availability */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                {currentCandidate.bio}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {currentCandidate.availability}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {currentCandidate.preferredJobType} ({currentCandidate.location})
                </span>
              </div>
            </div>

            {/* Candidate Skills & Projects */}
            <div className="my-2 space-y-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCandidate.skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Project */}
              {currentCandidate.projects && currentCandidate.projects.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-purple-300">
                      <FolderGit2 className="w-3.5 h-3.5" /> Featured Project: {currentCandidate.projects[0].title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {currentCandidate.projects[0].description}
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer: Role evaluating */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Evaluating for: <span className="font-semibold text-white">{currentCandidate.targetInternshipTitle}</span></span>
              {currentCandidate.github && (
                <a
                  href={currentCandidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Recruiter Controls Bar */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          id="recruiter-pass-btn"
          onClick={() => executeSwipe('PASS')}
          disabled={isSwiping}
          className="w-16 h-16 rounded-full bg-slate-900 hover:bg-rose-950/40 border-2 border-rose-500/60 text-rose-500 hover:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/30 transition active:scale-90 hover:scale-105"
          title="Pass Candidate"
        >
          <X className="w-8 h-8 stroke-[2.5]" />
        </button>

        <button
          id="recruiter-like-btn"
          onClick={() => executeSwipe('LIKE')}
          disabled={isSwiping}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-900/40 transition active:scale-90 hover:scale-105"
          title="Express Mutual Interest (Match)"
        >
          <Heart className="w-8 h-8 fill-white stroke-none" />
        </button>
      </div>
    </div>
  );
};
