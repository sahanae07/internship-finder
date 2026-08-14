export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';

export type WorkType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type InternshipStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EXPIRED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export type CompanyVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type SwipeAction = 'LIKE' | 'PASS';

export interface ProjectItem {
  title: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  college: string;
  degree: string;
  year: string;
  bio: string;
  skills: string[];
  projects: ProjectItem[];
  certifications: string[];
  resumeUrl?: string;
  preferredDomains: string[];
  preferredJobType: WorkType;
  availability: string; // e.g. 'Immediate (3-6 Months)'
  location: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  gpa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  logo: string;
  description: string;
  industry: string;
  website: string;
  location: string;
  companySize: string; // e.g. '50-200 employees'
  foundedYear: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  verificationStatus: CompanyVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyVerified: boolean;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  preferredSkills: string[];
  stipend: number;
  currency: string; // '₹' or 'INR'
  duration: string; // e.g. '3 Months'
  workType: WorkType;
  location: string;
  workingHours: string; // 'Flexible' | 'Full-time (40 hrs/wk)'
  experienceLevel: string; // 'Beginner' | 'Intermediate' | 'All levels'
  deadline: string;
  status: InternshipStatus;
  openings: number;
  perks: string[];
  responsibilities: string[];
  requirements: string[];
  likesCount: number;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
  // Computed AI match for currently logged-in student
  compatibilityScore?: number;
  matchExplanation?: MatchExplanation;
}

export interface MatchExplanation {
  compatibilityScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
  recommendation: string;
  breakdown: {
    skillScore: number; // 40%
    domainScore: number; // 20%
    experienceScore: number; // 15%
    availabilityScore: number; // 10%
    workTypeScore: number; // 10%
    locationScore: number; // 5%
  };
}

export interface Swipe {
  id: string;
  studentId: string;
  internshipId: string;
  companyId: string;
  action: SwipeAction;
  actorRole: 'STUDENT' | 'COMPANY';
  createdAt: string;
}

export interface Match {
  id: string;
  studentId: string;
  student: StudentProfile;
  companyId: string;
  company: CompanyProfile;
  internshipId: string;
  internship: Internship;
  createdAt: string;
  status: 'ACTIVE' | 'UNMATCHED';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountStudent?: number;
  unreadCountCompany?: number;
}

export interface Application {
  id: string;
  studentId: string;
  student: StudentProfile;
  internshipId: string;
  internship: Internship;
  companyId: string;
  company: CompanyProfile;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  timeline: {
    status: ApplicationStatus;
    date: string;
    note: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  senderRole: 'STUDENT' | 'COMPANY';
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'TEXT' | 'RESUME' | 'FILE' | 'OFFER_INTERVIEW';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'MATCH'
    | 'MESSAGE'
    | 'APPLICATION'
    | 'INTERNSHIP'
    | 'COMPANY_INTEREST'
    | 'AI_RECOMMENDATION'
    | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SavedInternship {
  id: string;
  studentId: string;
  internshipId: string;
  internship: Internship;
  createdAt: string;
}

export interface ResumeAnalysisResult {
  atsScore: number; // 0-100
  overallScore: number;
  summary: string;
  skillsDetected: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  educationAnalysis: string;
  projectsAnalysis: string;
  recommendedInternshipIds: string[];
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'INTERNSHIP' | 'COMPANY' | 'STUDENT';
  targetId: string;
  targetName: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalInternships: number;
  totalApplications: number;
  totalMatches: number;
  totalSwipes: number;
  activeOpportunities: number;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Problem Solving' | 'Domain';
  difficulty: 'Entry' | 'Intermediate' | 'Advanced';
  context: string;
  expectedCriteria: string[];
  sampleHint: string;
  idealAnswerOutline: string;
}

export interface InterviewAnswerFeedback {
  score: number;
  clarityScore: number;
  technicalDepthScore: number;
  strengths: string[];
  improvements: string[];
  modelAnswerSnippet: string;
  followUpQuestion: string;
  overallVerbalCritique: string;
}

export interface InterviewPrepSession {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  roundType: 'Technical' | 'Behavioral' | 'System Design' | 'Mixed';
  questions: MockInterviewQuestion[];
}

