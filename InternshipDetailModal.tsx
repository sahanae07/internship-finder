import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Internship, StudentProfile } from '../../types';
import {
  Building2,
  MapPin,
  Clock,
  Banknote,
  CheckCircle2,
  Sparkles,
  X,
  Bookmark,
  Send,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';

interface InternshipDetailModalProps {
  internship: Internship | null;
  student: StudentProfile | null;
  onClose: () => void;
  onApplySuccess?: () => void;
  onOpenMatchExplanation?: (internship: Internship) => void;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  student,
  onClose,
  onApplySuccess,
  onOpenMatchExplanation,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!internship) return null;

  const handleApply = async () => {
    if (!student) return;
    setIsApplying(true);
    try {
      const res = await api.createApplication({
        studentId: student.id,
        internshipId: internship.id,
        coverLetter: coverLetter.trim() || `I am excited to apply for the ${internship.title} role.`,
      });
      if (res.success) {
        setApplied(true);
        if (onApplySuccess) onApplySuccess();
      }
    } catch (err) {
      console.error('Error applying:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!student) return;
    const res = await api.toggleSaveInternship(student.id, internship.id);
    if (res.success) {
      setIsSaved(res.isSaved);
    }
  };

  return (
    <AnimatePresence>
      <div id="internship-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          id="internship-detail-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col"
        >
          {/* Top Banner & Header */}
          <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
            <button
              id="close-internship-detail-btn"
              onClick={onClose}
              aria-label="Close details"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white p-1 flex-shrink-0 border border-slate-700 shadow-md">
                <img
                  src={internship.companyLogo}
                  alt={internship.companyName}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 pr-8">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-white">{internship.companyName}</span>
                  {internship.companyVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                    {internship.category}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {internship.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                    <Banknote className="w-4 h-4" /> ₹{internship.stipend.toLocaleString()}/mo
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {internship.workType} ({internship.location})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {internship.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Match Badge pill if present */}
            {internship.compatibilityScore && (
              <div
                onClick={() => onOpenMatchExplanation && onOpenMatchExplanation(internship)}
                className="mt-4 p-3 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:bg-purple-900/45 transition"
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    {internship.compatibilityScore}%
                  </div>
                  <div>
                    <div className="font-bold text-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> High AI Compatibility Match
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Matches {internship.requiredSkills.slice(0, 3).join(', ')} in your profile
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                  Why? <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">About The Internship</h4>
              <p className="text-slate-300 leading-relaxed">{internship.description}</p>
            </div>

            {/* Responsibilities */}
            {internship.responsibilities && internship.responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Key Responsibilities</h4>
                <ul className="space-y-1.5">
                  {internship.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {internship.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-purple-300 border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {internship.preferredSkills && internship.preferredSkills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Good To Have</h4>
                <div className="flex flex-wrap gap-2">
                  {internship.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-800/60 text-slate-400 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Benefits */}
            {internship.perks && internship.perks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Perks & Learning
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {internship.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Metadata Box */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-slate-400">Openings</div>
                <div className="font-semibold text-white mt-0.5">{internship.openings || 3} Positions</div>
              </div>
              <div>
                <div className="text-slate-400">Experience</div>
                <div className="font-semibold text-white mt-0.5">{internship.experienceLevel || 'Beginner'}</div>
              </div>
              <div>
                <div className="text-slate-400">Deadline</div>
                <div className="font-semibold text-white mt-0.5">{internship.deadline || 'Rolling basis'}</div>
              </div>
            </div>

            {/* Quick Application Box / Form */}
            {showApplyForm && !applied && (
              <div className="p-4 rounded-2xl bg-slate-800 border border-purple-500/40 space-y-3">
                <div className="font-bold text-white text-sm">Write a Quick Note to Recruiter</div>
                <textarea
                  id="apply-cover-letter-input"
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Hi ${internship.companyName} team, I am eager to contribute with my background in ${student?.skills.slice(0, 3).join(', ') || 'software engineering'}...`}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {applied && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Application Submitted Successfully! Track it under Applications tab.
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <button
              id="bookmark-internship-modal-btn"
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border transition flex items-center justify-center ${
                isSaved
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={isSaved ? 'Saved' : 'Save for later'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-purple-400' : ''}`} />
            </button>

            {!applied ? (
              !showApplyForm ? (
                <button
                  id="open-apply-form-btn"
                  onClick={() => setShowApplyForm(true)}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" /> Apply for Internship
                </button>
              ) : (
                <button
                  id="submit-application-btn"
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
                >
                  {isApplying ? 'Submitting...' : 'Confirm & Submit Application'}
                </button>
              )
            ) : (
              <button
                id="close-after-applied-btn"
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition text-sm"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
