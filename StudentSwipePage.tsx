import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SwipeDeck } from '../components/swipe/SwipeDeck';
import { Internship, SwipeAction, Match } from '../types';
import { api } from '../services/api';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  MapPin,
  Banknote,
  RotateCcw,
  CheckCircle,
  X,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface StudentSwipePageProps {
  onOpenDetails: (internship: Internship) => void;
  onOpenMatchExplanation: (internship: Internship) => void;
  onNavigate: (page: string) => void;
}

export const StudentSwipePage: React.FC<StudentSwipePageProps> = ({
  onOpenDetails,
  onOpenMatchExplanation,
  onNavigate,
}) => {
  const { studentProfile, triggerMatchModal } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [workType, setWorkType] = useState('ALL');
  const [minStipend, setMinStipend] = useState(0);

  const [swipeCount, setSwipeCount] = useState(0);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await api.getDiscoverInternships({
        studentId: studentProfile?.id || 'student-1',
        category: category !== 'ALL' ? category : undefined,
        workType: workType !== 'ALL' ? workType : undefined,
        minStipend: minStipend > 0 ? minStipend : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setInternships(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [category, workType, minStipend, studentProfile?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleSwipeAction = (action: SwipeAction, internship: Internship) => {
    setSwipeCount((prev) => prev + 1);
  };

  const handleMatchCreated = (match: Match) => {
    triggerMatchModal(match);
  };

  const categories = ['ALL', 'Artificial Intelligence', 'Software Engineering', 'Full Stack Development', 'Product Design', 'Backend Engineering', 'Mobile App Development', 'Cybersecurity'];
  const workTypes = ['ALL', 'REMOTE', 'HYBRID', 'ON_SITE'];

  return (
    <div id="student-swipe-page" className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            id="swipe-search-input"
            type="text"
            placeholder="Search roles, tech skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            id="toggle-filter-drawer-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              showFilters || category !== 'ALL' || workType !== 'ALL' || minStipend > 0
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(category !== 'ALL' || workType !== 'ALL' || minStipend > 0) && (
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            )}
          </button>

          <button
            id="view-ai-recommendations-btn"
            onClick={() => onNavigate('dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div id="swipe-filter-drawer" className="mb-6 p-4 rounded-3xl bg-slate-900 border border-slate-800 text-xs space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">Refine Matching Pool</span>
            <button
              onClick={() => {
                setCategory('ALL');
                setWorkType('ALL');
                setMinStipend(0);
                setSearch('');
              }}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Reset Filters
            </button>
          </div>

          {/* Category Chips */}
          <div>
            <div className="text-slate-400 font-semibold mb-2">Role Domain:</div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    category === cat
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {cat === 'ALL' ? 'All Domains' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Work Type & Stipend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <div className="text-slate-400 font-semibold mb-2">Location / Work Type:</div>
              <div className="flex flex-wrap gap-1.5">
                {workTypes.map((wt) => (
                  <button
                    key={wt}
                    onClick={() => setWorkType(wt)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition ${
                      workType === wt
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {wt === 'ALL' ? 'All Types' : wt.toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 font-semibold mb-2">
                <span>Minimum Stipend:</span>
                <span className="text-emerald-400 font-bold">₹{minStipend.toLocaleString()}/mo</span>
              </div>
              <input
                id="min-stipend-range"
                type="range"
                min={0}
                max={60000}
                step={5000}
                value={minStipend}
                onChange={(e) => setMinStipend(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Swipe Deck Content */}
      <div className="mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[450px]">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
            <p className="text-sm text-slate-400">Loading AI compatibility scores...</p>
          </div>
        ) : (
          <SwipeDeck
            internships={internships}
            student={studentProfile}
            onSwipe={handleSwipeAction}
            onMatch={handleMatchCreated}
            onOpenDetails={onOpenDetails}
            onOpenMatchExplanation={onOpenMatchExplanation}
            onRefreshList={fetchInternships}
          />
        )}
      </div>
    </div>
  );
};
