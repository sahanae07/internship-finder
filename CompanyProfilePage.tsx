import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompanyProfile } from '../types';
import {
  Building2,
  ShieldCheck,
  Globe,
  MapPin,
  Users,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

export const CompanyProfilePage: React.FC = () => {
  const { companyProfile, updateCompanyProfile } = useAuth();

  const [formData, setFormData] = useState<CompanyProfile>(
    companyProfile || {
      id: 'comp-1',
      userId: 'user-comp-1',
      companyName: 'Google',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      description:
        'Building world-class cloud, AI, and consumer experiences for billions of global users. Our virtual internship program matches students with high-impact production engineering teams.',
      industry: 'Technology & Cloud AI',
      website: 'https://google.com',
      location: 'Mountain View, CA / Remote Global',
      companySize: '10,000+ employees',
      foundedYear: 1998,
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [isSaved, setIsSaved] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const handleSave = async () => {
    await updateCompanyProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRequestVerification = () => {
    setVerificationSubmitted(true);
    setTimeout(() => setVerificationSubmitted(false), 4000);
  };

  return (
    <div id="company-profile-page" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30 mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Employer Branding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Company Profile & Verification</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Display your organization credentials to build trust with student applicants.
          </p>
        </div>

        <button
          id="save-company-profile-btn"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Company profile updated successfully!
        </div>
      )}

      {/* Verification Status Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Verified Employer Seal</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {formData.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verified companies receive 3.4x higher right-swipe response rates and priority listing in student discovery.
            </p>
          </div>
        </div>

        {formData.verificationStatus !== 'VERIFIED' && (
          <button
            onClick={handleRequestVerification}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" /> Submit GST / Certificate
          </button>
        )}
      </div>

      {verificationSubmitted && (
        <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-purple-400" /> Verification documents submitted for Admin review.
        </div>
      )}

      {/* Form Fields */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" /> Organization Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Official Website</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Company Size</label>
            <input
              type="text"
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Headquarters Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Founded Year</label>
            <input
              type="number"
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Company Bio & Culture</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
