import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Internship, StudentProfile } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle, X, Zap, Target, BookOpen, Compass } from 'lucide-react';

interface MatchExplanationModalProps {
  internship: Internship | null;
  student: StudentProfile | null;
  onClose: () => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  internship,
  student,
  onClose,
}) => {
  if (!internship) return null;

  const score = internship.compatibilityScore || 85;
  const exp = internship.matchExplanation;

  const matchingSkills = exp?.matchingSkills || internship.requiredSkills.slice(0, 3);
  const missingSkills = exp?.missingSkills || ['AWS Cloud', 'Docker'];

  return (
    <AnimatePresence>
      <div id="ai-match-explanation-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          id="ai-match-explanation-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-purple-500/20 text-slate-100 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="close-match-explanation-btn"
            onClick={onClose}
            aria-label="Close match explanation"
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Compatibility Engine
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Why This Is A {score}% Match
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-5">
            Personalized analysis between <span className="text-slate-200 font-medium">{student?.name || 'Your Profile'}</span> and <span className="text-slate-200 font-medium">{internship.title}</span> at <span className="text-purple-300 font-medium">{internship.companyName}</span>.
          </p>

          {/* Score Gauge Block */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <span className="text-xl font-extrabold">{score}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-purple-200">Match</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                {score >= 85 ? 'High Mutual Fit' : score >= 70 ? 'Strong Candidate Potential' : 'Good Transferable Skills'}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {exp?.recommendationReason ||
                  `You have high technical alignment in ${matchingSkills.slice(0, 3).join(', ')} and matching work preference.`}
              </p>
            </div>
          </div>

          {/* Matched Skills */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Skills You Match ({matchingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchingSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                >
                  <span>✓</span> {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Skills to Learn / Bridge ({missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                  >
                    <span>•</span> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hybrid Formula Breakdown */}
          {exp?.breakdown && (
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Scoring Breakdown
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Technical Skill Overlap (40%)</span>
                    <span className="font-semibold text-slate-200">{exp.breakdown.skillScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${exp.breakdown.skillScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Career Interest & Domain (20%)</span>
                    <span className="font-semibold text-slate-200">{exp.breakdown.domainScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${exp.breakdown.domainScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Work Type & Remote Preference (10%)</span>
                    <span className="font-semibold text-slate-200">{exp.breakdown.workTypeScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${exp.breakdown.workTypeScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actionable recommendation */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-xs text-purple-200 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-purple-300">Recruiter Tip: </span>
              {exp?.recommendation || 'Swipe right to show mutual interest and highlight your relevant project code in the chat.'}
            </div>
          </div>

          <button
            id="got-it-match-btn"
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition border border-slate-700"
          >
            Close Analysis
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
