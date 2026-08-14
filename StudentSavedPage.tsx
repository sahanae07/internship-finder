import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Internship } from '../types';
import { api } from '../services/api';
import {
  Bookmark,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface StudentSavedPageProps {
  onOpenDetails: (internship: Internship) => void;
  onNavigate: (page: string) => void;
}

export const StudentSavedPage: React.FC<StudentSavedPageProps> = ({
  onOpenDetails,
  onNavigate,
}) => {
  const { studentProfile } = useAuth();
  const [savedList, setSavedList] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedInternships(studentProfile?.id || 'student-1');
      if (res.success && res.data) {
        setSavedList(res.data);
      }
    } catch (err) {
      console.error('Error fetching saved:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [studentProfile?.id]);

  const handleRemove = async (internshipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleSaveInternship(studentProfile?.id || 'student-1', internshipId);
      setSavedList((prev) => prev.filter((item) => item.id !== internshipId));
    } catch (err) {
      console.error('Error removing saved:', err);
    }
  };

  return (
    <div id="student-saved-page" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-500/30 mb-2">
            <Bookmark className="w-3.5 h-3.5 text-pink-400" /> Bookmarked Roles
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Saved Virtual Internships</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Positions you bookmarked for later application and review.
          </p>
        </div>

        <button
          onClick={() => onNavigate('swipe')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-purple-600/30"
        >
          <span>Discover More Roles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Saved Internships */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading bookmarked roles...</div>
      ) : savedList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No saved internships yet</h3>
          <p className="text-xs text-slate-400">
            When browsing virtual internships in the Discover deck, tap the bookmark icon to save roles for quick reference.
          </p>
          <button
            onClick={() => onNavigate('swipe')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg"
          >
            Start Swiping Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetails(item)}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition group cursor-pointer flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                      <img src={item.companyLogo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">{item.companyName}</div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    aria-label="Remove from saved"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs mt-3">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-medium flex items-center gap-1 border border-slate-700">
                    <MapPin className="w-3 h-3 text-slate-400" /> {item.location} ({item.workType})
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-medium flex items-center gap-1 border border-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" /> {item.duration}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-lg bg-purple-950/40 text-purple-300 text-[10px] font-semibold border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Stipend</span>
                  <div className="text-sm font-extrabold text-emerald-400">
                    ₹{item.stipend.toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs transition border border-purple-500/30"
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
