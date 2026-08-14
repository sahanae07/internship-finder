import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResumeAnalysisResult, Internship } from '../types';
import { api } from '../services/api';
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Compass,
} from 'lucide-react';

interface ResumeAnalyzerPageProps {
  onOpenDetails: (internship: Internship) => void;
  onNavigate: (page: string) => void;
}

const SAMPLE_RESUME_TEXT = `AARAV SHARMA
Computer Science & Engineering Student | National Institute of Technology
Email: aarav.sharma@nit.edu | GitHub: github.com/aaravsharma-dev | LinkedIn: linkedin.com/in/aaravsharma

EDUCATION:
B.Tech in Computer Science & Engineering (2022 - 2026) | CGPA: 8.9/10
Relevant Coursework: Data Structures & Algorithms, Machine Learning, Database Management Systems, Computer Networks.

TECHNICAL SKILLS:
- Languages: Python, TypeScript, JavaScript, SQL, C++
- Frameworks & Libraries: React, Node.js, Express, PyTorch, Scikit-Learn, Tailwind CSS, FastAPI
- Databases & Tools: PostgreSQL, MongoDB, Git, Docker, RESTful APIs

PROJECTS:
1. DocuSummarizer - Real-time NLP Document Engine
   - Built full-stack document analysis tool using React, FastAPI, and Hugging Face Transformers.
   - Implemented token stream caching, reducing document query latency by 45%.
   - Processed 10,000+ test queries with zero downtime.

2. CryptoPulse - Distributed Market Analytics Dashboard
   - Engineered live cryptocurrency tracker using WebSocket feeds and React state machines.
   - Designed PostgreSQL schema with partitioned tables for historical time-series data.

ACHIEVEMENTS:
- Finalist, Smart India Hackathon 2024 (Built AI disaster response assistant).
- Solved 450+ LeetCode problems (Top 8% rating).`;

export const ResumeAnalyzerPage: React.FC<ResumeAnalyzerPageProps> = ({
  onOpenDetails,
  onNavigate,
}) => {
  const { studentProfile } = useAuth();
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [matchedInternships, setMatchedInternships] = useState<Internship[]>([]);

  const handleRunAnalysis = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResume(resumeText);
      if (res.success && res.data) {
        setResult(res.data);

        // Fetch matched internships
        const internshipsRes = await api.getInternships();
        if (internshipsRes.success && internshipsRes.data) {
          const recIds = res.data.recommendedInternshipIds || [];
          const filtered = internshipsRes.data.filter((i) =>
            recIds.includes(i.id) || res.data.skillsDetected.some((skill) => i.requiredSkills.includes(skill))
          );
          setMatchedInternships(filtered.slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setResumeText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="resume-analyzer-page" className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
          <Sparkles className="w-4 h-4 text-yellow-300" /> AI Resume ATS Evaluator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Score & Optimize Your Resume
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Powered by Gemini AI. Get instant ATS compatibility score, extract verified skills, identify missing industry competencies, and discover virtual internships that match your background.
        </p>
      </div>

      {/* Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-white text-sm">Resume Text or Project Summary</span>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="resume-file-input"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1.5 transition"
              >
                <UploadCloud className="w-4 h-4 text-purple-400" /> Upload File (.txt, .md)
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                id="load-sample-resume-btn"
                onClick={() => setResumeText(SAMPLE_RESUME_TEXT)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 text-xs font-semibold border border-slate-700 transition"
              >
                Load Sample Candidate
              </button>
            </div>
          </div>

          <textarea
            id="resume-content-textarea"
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text, skills, projects, and education credentials here..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500 transition leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {resumeText.split(/\s+/).filter(Boolean).length} Words • Ready for Gemini Analysis
            </span>

            <button
              id="analyze-resume-submit-btn"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !resumeText.trim()}
              className="py-3.5 px-8 rounded-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" /> Generate AI ATS Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {result && (
        <div id="resume-analysis-results" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Compatibility Score */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex items-center gap-5 shadow-xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
                <span className="text-2xl font-extrabold">{result.atsScore}</span>
                <span className="text-[10px] uppercase font-bold text-purple-200">/ 100 ATS</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> ATS Compatibility Score
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Overall Quality */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-5 shadow-xl">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0">
                <span className="text-2xl font-extrabold text-pink-400">{result.overallScore}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Quality</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-pink-400" /> Recruiter Impact Rating
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.projectsAnalysis}</p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detected Skills */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Skills Detected ({result.skillsDetected.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skillsDetected.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                  >
                    <span>✓</span> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* High ROI Missing Skills */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> High-Value Skills to Add Next ({result.missingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                  >
                    <span>+</span> {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Actionable Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Core Strengths Highlighted
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" /> Actionable Next Steps
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Matching Virtual Internships */}
          {matchedInternships.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-purple-400" /> Matching Internships on Platform
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Roles that match the technical stack extracted from your resume
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('swipe')}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Swipe All Roles <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchedInternships.map((intern) => (
                  <div
                    key={intern.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-purple-300">{intern.companyName}</div>
                      <div className="text-sm font-extrabold text-white line-clamp-1 mt-0.5">{intern.title}</div>
                      <div className="text-xs text-emerald-400 font-bold mt-1">₹{intern.stipend.toLocaleString()}/mo</div>
                    </div>

                    <button
                      onClick={() => onOpenDetails(intern)}
                      className="mt-3 w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-semibold text-xs transition"
                    >
                      View & 1-Click Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
