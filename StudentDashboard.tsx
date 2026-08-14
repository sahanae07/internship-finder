import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Internship, Match, Application } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Compass,
  Briefcase,
  MessageSquare,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  MapPin,
  Banknote,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  onOpenDetails: (internship: Internship) => void;
  onOpenMatchExplanation: (internship: Internship) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenDetails,
  onOpenMatchExplanation,
}) => {
  const { studentProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<Internship[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const studentId = studentProfile?.id || 'student-1';
        const [recRes, matchRes, appRes] = await Promise.all([
          api.getRecommendations(studentId),
          api.getMatches({ studentId }),
          api.getApplications({ studentId }),
        ]);

        if (recRes.success) setRecommendations(recRes.data || []);
        if (matchRes.success) setMatches(matchRes.data || []);
        if (appRes.success) setApplications(appRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [studentProfile?.id]);

  // Profile completion score calculation
  const profileCompletionTasks = [
    { label: 'Basic Info & College', completed: !!studentProfile?.college },
    { label: 'Technical Skills Added', completed: (studentProfile?.skills.length || 0) >= 3 },
    { label: 'Featured Portfolio Project', completed: (studentProfile?.projects.length || 0) >= 1 },
    { label: 'Resume ATS Uploaded', completed: !!studentProfile?.resumeUrl },
  ];
  const completedTasksCount = profileCompletionTasks.filter((t) => t.completed).length;
  const completionPercentage = Math.round((completedTasksCount / profileCompletionTasks.length) * 100);

  return (
    <div id="student-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> AI Career Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {studentProfile?.name.split(' ')[0] || 'Aarav'}! 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              You have <span className="text-purple-300 font-bold">{recommendations.length} high-match internships</span> waiting for review based on your {studentProfile?.preferredDomains.join(' & ') || 'software'} background.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="start-swiping-cta-btn"
              onClick={() => onNavigate('swipe')}
              className="py-3 px-6 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 transition active:scale-95 flex items-center gap-2 text-xs sm:text-sm"
            >
              <Compass className="w-4 h-4" /> Start Swiping Deck
            </button>
            <button
              id="ai-resume-check-btn"
              onClick={() => onNavigate('resume-analyzer')}
              className="py-3 px-5 rounded-2xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4 text-purple-400" /> Run ATS Resume Scan
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Profile Completion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Strength Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Strength</span>
              <span className="text-sm font-extrabold text-purple-400">{completionPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
            </div>

            <div className="space-y-2">
              {profileCompletionTasks.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{t.label}</span>
                  {t.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-purple-400 text-[11px] font-semibold cursor-pointer" onClick={() => onNavigate('profile')}>
                      + Add
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Edit Student Profile <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mutual Matches Metric */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold">
                Mutual Interest
              </span>
            </div>
            <div className="text-3xl font-black text-white">{matches.length}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Mutual Company Matches</div>
            <p className="text-xs text-slate-400 mt-2">
              Companies that swiped right on your profile and are ready to chat!
            </p>
          </div>

          <button
            onClick={() => onNavigate('messages')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            Open Recruiter Chats <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Applications Metric */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                Pipeline
              </span>
            </div>
            <div className="text-3xl font-black text-white">{applications.length}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Active Applications</div>
            <p className="text-xs text-slate-400 mt-2">
              Track recruitment stage progression from Applied to Interview.
            </p>
          </div>

          <button
            onClick={() => onNavigate('applications')}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Track Status Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top AI Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" /> High-Match Virtual Internships
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by AI compatibility with your skills ({studentProfile?.skills.slice(0, 3).join(', ')})
            </p>
          </div>

          <button
            onClick={() => onNavigate('swipe')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View All in Swipe Deck <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.slice(0, 6).map((internship) => {
            const score = internship.compatibilityScore || 85;
            return (
              <div
                key={internship.id}
                id={`rec-internship-${internship.id}`}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white p-1 border border-slate-700 flex-shrink-0">
                        <img
                          src={internship.companyLogo}
                          alt={internship.companyName}
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          {internship.companyName}
                          {internship.companyVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-medium">
                          {internship.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenMatchExplanation(internship)}
                      className="px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1"
                      title="View AI Match Breakdown"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      {score}%
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                    {internship.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {internship.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {internship.requiredSkills.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">₹{internship.stipend.toLocaleString()}/mo</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetails(internship)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onOpenDetails(internship)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
