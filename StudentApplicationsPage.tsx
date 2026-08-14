import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Application, ApplicationStatus, Internship } from '../types';
import { api } from '../services/api';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Award,
  Filter,
} from 'lucide-react';

interface StudentApplicationsPageProps {
  onOpenDetails: (internship: Internship) => void;
  onNavigate: (page: string) => void;
}

export const StudentApplicationsPage: React.FC<StudentApplicationsPageProps> = ({
  onOpenDetails,
  onNavigate,
}) => {
  const { studentProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications({ studentId: studentProfile?.id || 'student-1' });
      if (res.success && res.data) {
        setApplications(res.data);
        if (res.data.length > 0) {
          setSelectedApp(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [studentProfile?.id]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Offer Selected
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30 flex items-center gap-1 animate-pulse">
            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Interview Stage
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold border border-pink-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Shortlisted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> In Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-semibold border border-slate-700">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
            Applied
          </span>
        );
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'INTERVIEW') return app.status === 'INTERVIEW';
    if (filterStatus === 'SELECTED') return app.status === 'SELECTED';
    if (filterStatus === 'SHORTLISTED') return app.status === 'SHORTLISTED';
    if (filterStatus === 'ACTIVE') return app.status !== 'REJECTED';
    return true;
  });

  return (
    <div id="student-applications-page" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Career Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Applications & Interviews</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track real-time candidate progression, recruiter feedback notes, and scheduled video rounds.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'ACTIVE', 'INTERVIEW', 'SELECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === filter
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'All Applications' : filter === 'ACTIVE' ? 'Active Pipeline' : filter === 'INTERVIEW' ? 'Interviews' : 'Offers Received'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: List + Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No applications in this view</h3>
              <p className="text-xs text-slate-400">
                Explore virtual internships in the Discover tab and apply directly!
              </p>
              <button
                onClick={() => onNavigate('swipe')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
              >
                Discover Internships
              </button>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  id={`app-card-${app.id}`}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-3xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                        <img src={app.company.logo} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-300">{app.company.companyName}</div>
                        <h3 className="text-sm font-extrabold text-white line-clamp-1">{app.internship.title}</h3>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">
                          ₹{app.internship.stipend.toLocaleString()}/mo • {app.internship.workType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    {getStatusBadge(app.status)}
                    <span className="text-[11px] text-slate-500">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Application Detailed View */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                    <img src={selectedApp.company.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400">{selectedApp.company.companyName}</span>
                    <h2 className="text-xl font-black text-white">{selectedApp.internship.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedApp.internship.location} • ₹{selectedApp.internship.stipend.toLocaleString()}/month • {selectedApp.internship.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(selectedApp.internship)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    View Job <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('messages')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message Recruiter
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Current Application Status</span>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                {selectedApp.status === 'SELECTED' && (
                  <div className="text-right">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow animate-pulse">
                      Offer Extended 🎉
                    </span>
                  </div>
                )}
              </div>

              {/* Application Lifecycle Stages Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" /> Progression Timeline
                </h3>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {selectedApp.timeline?.map((step, idx) => (
                    <div key={idx} className="relative pl-8 space-y-0.5">
                      <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">
                          {step.status}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(step.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{step.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover Letter Sent */}
              {selectedApp.coverLetter && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Cover Note Submitted
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                    "{selectedApp.coverLetter}"
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              Select an application from the list to view its complete interview timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
