import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentProfile, ProjectItem, WorkType } from '../types';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Link,
  Save,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface StudentProfilePageProps {
  onNavigate: (page: string) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigate }) => {
  const { studentProfile, updateStudentProfile } = useAuth();

  const [formData, setFormData] = useState<StudentProfile>(
    studentProfile || {
      id: 'student-1',
      userId: 'user-student-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@nit.edu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      college: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      year: '3rd Year (Class of 2026)',
      bio: 'Passionate full-stack developer and ML enthusiast seeking 3-6 month virtual software engineering internships.',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
      projects: [
        {
          title: 'DocuSummarizer NLP',
          description: 'Real-time document summarizer using FastAPI token streams & HuggingFace transformers.',
          technologies: ['FastAPI', 'React', 'PyTorch', 'Tailwind CSS'],
          link: 'https://github.com/aaravsharma/docusummarizer',
        },
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'Google Data Analytics Certificate'],
      preferredDomains: ['Full-Stack Web', 'AI/ML Engineering', 'Cloud DevOps'],
      preferredJobType: 'REMOTE' as WorkType,
      availability: 'Immediate (3-6 Months)',
      location: 'Bangalore / Remote',
      github: 'https://github.com/aaravsharma',
      linkedin: 'https://linkedin.com/in/aaravsharma',
      portfolio: 'https://aaravsharma.dev',
      gpa: '8.9 / 10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [newSkill, setNewSkill] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // New Project State
  const [newProject, setNewProject] = useState<ProjectItem>({
    title: '',
    description: '',
    technologies: [],
    link: '',
  });
  const [projectTechInput, setProjectTechInput] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
    setNewProject({ title: '', description: '', technologies: [], link: '' });
    setProjectTechInput('');
  };

  const handleRemoveProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async () => {
    await updateStudentProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="student-profile-page" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 mb-2">
            <User className="w-3.5 h-3.5 text-purple-400" /> Student Profile Card
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Candidate Profile</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            This card is presented to recruiters during talent swipe. Maintain up-to-date skills for optimal AI matching.
          </p>
        </div>

        <button
          id="save-student-profile-btn"
          onClick={handleSaveProfile}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {/* Save Success Alert */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidate profile updated successfully!
        </div>
      )}

      {/* AI Resume Analyzer Promo Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Optimize with AI Resume Evaluator</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Score your resume against ATS benchmarks and extract verified skills automatically.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('resume-analyzer')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap shadow"
        >
          <span>Run ATS Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Profile Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" /> Basic & Academic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">College / University</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Degree & Major</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Graduation Year / Class</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">CGPA / Percentage</label>
              <input
                type="text"
                value={formData.gpa || ''}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Bio / Elevator Pitch</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" /> Technical Skills & Tools
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="e.g. Next.js, PyTorch, GraphQL, AWS..."
              className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-purple-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio Projects */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-400" /> Highlighted Projects
          </h2>

          {/* Existing Projects */}
          <div className="space-y-3">
            {formData.projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-300">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Link className="w-3 h-3" /> {proj.link}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveProject(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Project */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Add New Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <input
                type="text"
                placeholder="GitHub / Live Demo URL"
                value={newProject.link || ''}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Key accomplishments and engineering design..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tech Stack (comma separated, e.g. React, Node.js, Docker)"
                value={projectTechInput}
                onChange={(e) => {
                  setProjectTechInput(e.target.value);
                  setNewProject({
                    ...newProject,
                    technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  });
                }}
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <button
                onClick={handleAddProject}
                disabled={!newProject.title || !newProject.description}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" /> Links & Work Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub URL</label>
              <input
                type="text"
                value={formData.github || ''}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Portfolio Website</label>
              <input
                type="text"
                value={formData.portfolio || ''}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
