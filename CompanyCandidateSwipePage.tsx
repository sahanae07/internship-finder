import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentProfile, Internship, Match, SwipeAction } from '../types';
import { api } from '../services/api';
import { CandidateSwipeDeck } from '../components/swipe/CandidateSwipeDeck';
import {
  Compass,
  Briefcase,
  Sparkles,
  Users,
  Filter,
  CheckCircle2,
  Heart,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface CompanyCandidateSwipePageProps {
  onNavigate: (page: string) => void;
}

export const CompanyCandidateSwipePage: React.FC<CompanyCandidateSwipePageProps> = ({
  onNavigate,
}) => {
  const { companyProfile, triggerMatchModal } = useAuth();

  const [postings, setPostings] = useState<Internship[]>([]);
  const [selectedPostingId, setSelectedPostingId] = useState<string>('');
  const [candidates, setCandidates] = useState<
    (StudentProfile & { compatibilityScore: number; targetInternshipTitle: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch postings and initial candidate pool
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const companyId = companyProfile?.id || 'comp-1';
        const internshipsRes = await api.getInternships({ companyId });

        let currentPostId = '';
        if (internshipsRes.success && internshipsRes.data && internshipsRes.data.length > 0) {
          setPostings(internshipsRes.data);
          currentPostId = internshipsRes.data[0].id;
          setSelectedPostingId(currentPostId);
        }

        const studentsRes = await api.getStudents();
        if (studentsRes.success && studentsRes.data) {
          const selectedJob = internshipsRes.data?.find((p) => p.id === currentPostId);
          const enriched = studentsRes.data.map((st, idx) => {
            // Compute demo compatibility score based on required skills
            const reqSkills = selectedJob?.requiredSkills || ['React', 'TypeScript', 'Node.js'];
            const common = st.skills.filter((sk) => reqSkills.some((r) => r.toLowerCase() === sk.toLowerCase()));
            const baseScore = 75 + Math.min(23, common.length * 8 + (idx % 3) * 3);

            return {
              ...st,
              compatibilityScore: Math.min(99, baseScore),
              targetInternshipTitle: selectedJob?.title || 'Software Engineer Intern',
            };
          });

          setCandidates(enriched);
        }
      } catch (err) {
        console.error('Error loading talent pool:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [companyProfile?.id]);

  const handlePostingChange = async (postId: string) => {
    setSelectedPostingId(postId);
    const selectedJob = postings.find((p) => p.id === postId);
    if (!selectedJob) return;

    setCandidates((prev) =>
      prev.map((c) => {
        const common = c.skills.filter((sk) =>
          selectedJob.requiredSkills.some((r) => r.toLowerCase() === sk.toLowerCase())
        );
        return {
          ...c,
          compatibilityScore: Math.min(98, 70 + common.length * 9),
          targetInternshipTitle: selectedJob.title,
        };
      })
    );
  };

  const handleSwipe = (action: SwipeAction, candidate: StudentProfile) => {
    // console.log(`Company swiped ${action} on candidate:`, candidate.name);
  };

  const handleMatch = (match: Match) => {
    triggerMatchModal(match);
  };

  return (
    <div id="company-candidate-swipe-page" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 mb-2">
            <Compass className="w-3.5 h-3.5 text-purple-400" /> Recruiter Discovery Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Talent Swipe & Fast Matching</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Swipe through pre-screened student candidates scored directly against your job requirements.
          </p>
        </div>

        {/* Posting Filter Select */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Target Role:</label>
          <select
            id="recruiter-swipe-role-select"
            value={selectedPostingId}
            onChange={(e) => handlePostingChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 transition"
          >
            {postings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (₹{p.stipend.toLocaleString()}/mo)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swipe Deck Container */}
      <div className="flex justify-center">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading student talent deck...</div>
        ) : (
          <CandidateSwipeDeck
            candidates={candidates}
            company={companyProfile}
            targetInternshipId={selectedPostingId || 'intern-1'}
            onSwipe={handleSwipe}
            onMatch={handleMatch}
            onRefresh={() => {
              // Reload candidate pool
              api.getStudents().then((res) => {
                if (res.data) {
                  const selectedJob = postings.find((p) => p.id === selectedPostingId);
                  setCandidates(
                    res.data.map((st) => ({
                      ...st,
                      compatibilityScore: 88,
                      targetInternshipTitle: selectedJob?.title || 'Software Engineer Intern',
                    }))
                  );
                }
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
