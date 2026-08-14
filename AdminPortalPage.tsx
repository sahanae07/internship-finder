import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlatformStats, CompanyProfile, ReportItem, CompanyVerificationStatus } from '../types';
import { api } from '../services/api';
import {
  Shield,
  CheckCheck,
  AlertTriangle,
  Users,
  Building2,
  Briefcase,
  Heart,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const { resetPlatformDemo } = useAuth();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'SAFETY' | 'METRICS'>('VERIFICATIONS');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, compRes, repRes] = await Promise.all([
        api.getPlatformStats(),
        api.getCompanies(),
        api.getReports(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (compRes.success && compRes.data) setCompanies(compRes.data);
      if (repRes.success && repRes.data) setReports(repRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateVerification = async (companyId: string, status: CompanyVerificationStatus) => {
    try {
      const res = await api.updateCompanyVerification(companyId, status);
      if (res.success) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? { ...c, verificationStatus: status } : c))
        );
      }
    } catch (err) {
      console.error('Error updating verification:', err);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      const res = await api.resolveReport(reportId, status);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  return (
    <div id="admin-portal-page" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30 mb-2">
            <Shield className="w-3.5 h-3.5 text-red-400" /> Platform Administration & Trust
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Trust, Safety & Governance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review company verification documents, audit reported listings, and monitor matching throughput.
          </p>
        </div>

        <button
          onClick={resetPlatformDemo}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-purple-400" /> Reset Demo Seed Data
        </button>
      </div>

      {/* KPI Overview Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Total Students</span>
            <div className="text-xl font-black text-white">{stats.totalStudents}</div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Registered Orgs</span>
            <div className="text-xl font-black text-indigo-400">{stats.totalCompanies}</div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Live Roles</span>
            <div className="text-xl font-black text-emerald-400">{stats.totalInternships}</div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Total Swipes</span>
            <div className="text-xl font-black text-pink-400">{stats.totalSwipes}</div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Mutual Matches</span>
            <div className="text-xl font-black text-purple-400">{stats.totalMatches}</div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Active Pipeline</span>
            <div className="text-xl font-black text-amber-400">{stats.totalApplications}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('VERIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'VERIFICATIONS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCheck className="w-4 h-4" /> Company Verification Queue
        </button>

        <button
          onClick={() => setActiveTab('SAFETY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'SAFETY'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Safety & Reports ({reports.filter((r) => r.status === 'PENDING').length})
        </button>
      </div>

      {/* Verification Queue View */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Employer Verification Requests</h3>
              <span className="text-xs text-slate-400">{companies.length} Registered Employers</span>
            </div>

            <div className="space-y-3">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                      <img src={comp.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{comp.companyName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            comp.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : comp.verificationStatus === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {comp.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {comp.industry} • {comp.location} • {comp.companySize}
                      </p>
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {comp.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      onClick={() => handleUpdateVerification(comp.id, 'VERIFIED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Verification
                    </button>
                    <button
                      onClick={() => handleUpdateVerification(comp.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition flex items-center gap-1 border border-rose-500/30"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety & Moderation Reports */}
      {activeTab === 'SAFETY' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Reported Entities & Suspicious Content</h3>
            <span className="text-xs text-slate-400">Automated Fraud Filter Active</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      {rep.targetType}: {rep.targetName}
                    </span>
                    <span className="text-xs font-bold text-white">{rep.reason}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{rep.details}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Reported by {rep.reporterName} • Status: {rep.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <button
                    onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                  >
                    Action & Resolve
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
