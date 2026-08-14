import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Building2, Shield, RotateCcw, Zap } from 'lucide-react';
import { api } from '../../services/api';

interface DemoTourBarProps {
  onNavigate?: (page: string) => void;
}

export const DemoTourBar: React.FC<DemoTourBarProps> = ({ onNavigate }) => {
  const { role, switchRole, resetPlatformDemo, triggerMatchModal, studentProfile } = useAuth();

  const handleTriggerTestMatch = async () => {
    try {
      // Simulate recruiter liking the student to create an immediate mutual match
      const res = await api.recordSwipe({
        actorRole: 'STUDENT',
        studentId: studentProfile?.id || 'student-1',
        internshipId: 'intern-1',
        companyId: 'comp-1',
        action: 'LIKE',
      });

      if (res.match) {
        triggerMatchModal(res.match);
      } else {
        const matchesRes = await api.getMatches({ studentId: studentProfile?.id || 'student-1' });
        if (matchesRes.data && matchesRes.data.length > 0) {
          triggerMatchModal(matchesRes.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="demo-tour-bar" className="w-full bg-slate-950 border-b border-purple-900/40 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
        <span className="font-bold text-slate-200 hidden sm:inline">InternSwipe Live Preview:</span>
        <span className="text-slate-400">Switch role persona to test full match ecosystem:</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Student Switcher */}
        <button
          id="demo-switch-student-btn"
          onClick={() => switchRole('STUDENT', 'student-1')}
          className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition ${
            role === 'STUDENT'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5 text-purple-300" /> Student View
        </button>

        {/* Recruiter Switcher */}
        <button
          id="demo-switch-company-btn"
          onClick={() => switchRole('COMPANY', 'comp-1')}
          className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition ${
            role === 'COMPANY'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-300" /> Recruiter View
        </button>

        {/* Admin Switcher */}
        <button
          id="demo-switch-admin-btn"
          onClick={() => switchRole('ADMIN')}
          className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition ${
            role === 'ADMIN'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-300" /> Admin
        </button>

        {/* Test Trigger Match */}
        <button
          id="demo-trigger-match-btn"
          onClick={handleTriggerTestMatch}
          className="px-3 py-1 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition active:scale-95"
          title="Instant Match Animation Trigger"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" /> Test Match UI 🎉
        </button>

        {/* Reset */}
        <button
          id="demo-reset-state-btn"
          onClick={resetPlatformDemo}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          title="Reset database to fresh seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
