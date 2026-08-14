import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Internship, Application, ApplicationStatus, WorkType } from '../types';
import { api } from '../services/api';
import {
  Briefcase,
  PlusCircle,
  Users,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  Filter,
  Trash2,
  X,
  Zap,
} from 'lucide-react';

interface CompanyDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const CompanyDashboardPage: React.FC<CompanyDashboardPageProps> = ({ onNavigate }) => {
  const { companyProfile } = useAuth();

  const [postings, setPostings] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedPosting, setSelectedPosting] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  // Post Internship Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Full-Stack');
  const [newStipend, setNewStipend] = useState(40000);
  const [newDuration, setNewDuration] = useState('3 Months');
  const [newWorkType, setNewWorkType] = useState<WorkType>('REMOTE');
  const [newOpenings, setNewOpenings] = useState(2);
  const [newSkills, setNewSkills] = useState('React, TypeScript, Node.js, Tailwind CSS');
  const [newDescription, setNewDescription] = useState(
    'We are looking for a proactive Software Engineering Intern to join our cloud platform team. You will build user-facing features, optimize API endpoints, and collaborate on scalable architecture.'
  );

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const companyId = companyProfile?.id || 'comp-1';
      const [internshipsRes, appsRes] = await Promise.all([
        api.getInternships({ companyId }),
        api.getApplications({ companyId }),
      ]);

      if (internshipsRes.success && internshipsRes.data) {
        setPostings(internshipsRes.data);
        if (internshipsRes.data.length > 0) {
          setSelectedPosting(internshipsRes.data[0]);
        }
      }

      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [companyProfile?.id]);

  const handleCreatePost = async () => {
    if (!newTitle.trim()) return;
    setIsPosting(true);
    try {
      const res = await api.createInternship({
        companyId: companyProfile?.id || 'comp-1',
        title: newTitle,
        category: newCategory,
        stipend: Number(newStipend),
        duration: newDuration,
        workType: newWorkType,
        openings: Number(newOpenings),
        requiredSkills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
        description: newDescription,
        responsibilities: [
          'Design and deploy responsive web components with stateful caching.',
          'Collaborate directly with senior engineering mentors during sprint reviews.',
        ],
        perks: ['1-on-1 Mentorship', 'Pre-Placement PPO Offer', 'Certificate of Completion'],
      });

      if (res.success && res.data) {
        setPostings((prev) => [res.data, ...prev]);
        setSelectedPosting(res.data);
        setShowPostModal(false);
        setNewTitle('');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      const res = await api.updateApplicationStatus(appId, status, `Status changed to ${status}`);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status } : a))
        );
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const currentPostingApps = applications.filter((app) =>
    selectedPosting ? app.internshipId === selectedPosting.id : true
  );

  return (
    <div id="company-dashboard-page" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Employer Talent Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {companyProfile?.companyName || 'Recruiter'} Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your virtual internship openings, candidate funnel, and match pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('company-swipe')}
            className="px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs border border-purple-500/30 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> Swipe Talent Deck
          </button>

          <button
            id="post-new-internship-modal-trigger"
            onClick={() => setShowPostModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Post New Internship
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Postings</span>
          <div className="text-2xl font-black text-white">{postings.length}</div>
          <span className="text-[10px] text-emerald-400 font-bold">100% Live</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Applicants</span>
          <div className="text-2xl font-black text-purple-400">{applications.length}</div>
          <span className="text-[10px] text-purple-300 font-bold">From Top Engineering Colleges</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Interviews Scheduled</span>
          <div className="text-2xl font-black text-pink-400">
            {applications.filter((a) => a.status === 'INTERVIEW').length}
          </div>
          <span className="text-[10px] text-pink-300 font-bold">In Active Progression</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Offers Extended</span>
          <div className="text-2xl font-black text-emerald-400">
            {applications.filter((a) => a.status === 'SELECTED').length}
          </div>
          <span className="text-[10px] text-emerald-300 font-bold">Candidates Hired</span>
        </div>
      </div>

      {/* Active Listings Selector & Applicant Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Job Postings List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Your Openings ({postings.length})
            </h2>
          </div>

          <div className="space-y-3">
            {postings.map((p) => {
              const isSelected = selectedPosting?.id === p.id;
              const appCount = applications.filter((a) => a.internshipId === p.id).length;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPosting(p)}
                  className={`p-4 rounded-3xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-lg'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{p.title}</h3>
                      <div className="text-xs text-purple-300 font-semibold mt-0.5">
                        ₹{p.stipend.toLocaleString()}/mo • {p.workType}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">{appCount} Applicants</span>
                    <span className="text-slate-500">{p.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Applicants Funnel & Review */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Applicants for {selectedPosting?.title || 'All Roles'}
                </h3>
                <p className="text-xs text-slate-400">
                  Review student profiles, shortlists, and change candidate stages.
                </p>
              </div>

              <button
                onClick={() => onNavigate('messages')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Open Chats
              </button>
            </div>

            {currentPostingApps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No applicants yet for this position</p>
                <p>Use the Talent Swipe deck to discover proactive students and send direct invites!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentPostingApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                        <img src={app.student.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{app.student.name}</h4>
                          <span className="px-2 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            GPA {app.student.gpa || '8.9'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {app.student.college} • {app.student.degree}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {app.student.skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Funnel Stage Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      <span className="text-[11px] font-bold text-purple-300 mr-2">{app.status}</span>

                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, 'SHORTLISTED')}
                        className="px-2.5 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white text-xs font-semibold border border-pink-500/30 transition"
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, 'INTERVIEW')}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 transition"
                      >
                        Interview
                      </button>

                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, 'SELECTED')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white text-xs font-semibold border border-emerald-500/30 transition"
                      >
                        Hire
                      </button>

                      <button
                        onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Internship Modal */}
      {showPostModal && (
        <div id="post-internship-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Create Virtual Internship Posting</h3>
              </div>
              <button onClick={() => setShowPostModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Title</label>
                <input
                  id="new-internship-title-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI Systems Engineer Intern, Frontend React Developer"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Stipend (₹)</label>
                  <input
                    id="new-internship-stipend-input"
                    type="number"
                    value={newStipend}
                    onChange={(e) => setNewStipend(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 3 Months, 6 Months"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Type</label>
                  <select
                    value={newWorkType}
                    onChange={(e) => setNewWorkType(e.target.value as WorkType)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="REMOTE">Virtual / Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Skills (Comma separated)</label>
                <input
                  id="new-internship-skills-input"
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, PostgreSQL, Docker"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description & Responsibilities</label>
                <textarea
                  id="new-internship-desc-input"
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="submit-post-internship-btn"
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || isPosting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition"
              >
                {isPosting ? 'Publishing...' : 'Publish Internship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
