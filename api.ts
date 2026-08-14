import {
  StudentProfile,
  CompanyProfile,
  Internship,
  Swipe,
  Match,
  Application,
  Message,
  Notification,
  ReportItem,
  PlatformStats,
  MatchExplanation,
  ResumeAnalysisResult,
  SwipeAction,
  ApplicationStatus,
  CompanyVerificationStatus,
  MockInterviewQuestion,
  InterviewAnswerFeedback,
} from '../types';

export const api = {
  // Auth
  async login(email: string, role?: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, password }),
    });
    return res.json();
  },

  async register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resetPassword(email: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Students
  async getStudents(): Promise<{ success: boolean; data: StudentProfile[] }> {
    const res = await fetch('/api/students');
    return res.json();
  },

  async getStudent(id: string): Promise<{ success: boolean; data: StudentProfile }> {
    const res = await fetch(`/api/students/${id}`);
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<{ success: boolean; data: StudentProfile }> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Companies
  async getCompanies(): Promise<{ success: boolean; data: CompanyProfile[] }> {
    const res = await fetch('/api/companies');
    return res.json();
  },

  async getCompany(id: string): Promise<{ success: boolean; data: CompanyProfile }> {
    const res = await fetch(`/api/companies/${id}`);
    return res.json();
  },

  async updateCompany(id: string, updates: Partial<CompanyProfile>): Promise<{ success: boolean; data: CompanyProfile }> {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Internships
  async getInternships(params?: {
    category?: string;
    workType?: string;
    minStipend?: number;
    search?: string;
    companyId?: string;
    status?: string;
  }): Promise<{ success: boolean; data: Internship[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.workType) query.set('workType', params.workType);
    if (params?.minStipend) query.set('minStipend', params.minStipend.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/internships?${query.toString()}`);
    return res.json();
  },

  async getInternship(id: string): Promise<{ success: boolean; data: Internship }> {
    const res = await fetch(`/api/internships/${id}`);
    return res.json();
  },

  async createInternship(data: any): Promise<{ success: boolean; data: Internship }> {
    const res = await fetch('/api/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateInternship(id: string, updates: Partial<Internship>): Promise<{ success: boolean; data: Internship }> {
    const res = await fetch(`/api/internships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteInternship(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/internships/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Swiping & Discover
  async getDiscoverInternships(params?: {
    studentId?: string;
    category?: string;
    workType?: string;
    minStipend?: number;
    search?: string;
  }): Promise<{ success: boolean; data: Internship[] }> {
    const query = new URLSearchParams();
    query.set('role', 'STUDENT');
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.category) query.set('category', params.category);
    if (params?.workType) query.set('workType', params.workType);
    if (params?.minStipend) query.set('minStipend', params.minStipend.toString());
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/swipes/discover?${query.toString()}`);
    return res.json();
  },

  async getDiscoverStudents(params?: {
    companyId?: string;
    targetInternshipId?: string;
  }): Promise<{ success: boolean; data: (StudentProfile & { compatibilityScore: number; targetInternshipTitle: string })[] }> {
    const query = new URLSearchParams();
    query.set('role', 'COMPANY');
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.targetInternshipId) query.set('targetInternshipId', params.targetInternshipId);

    const res = await fetch(`/api/swipes/discover?${query.toString()}`);
    return res.json();
  },

  async recordSwipe(data: {
    actorRole: 'STUDENT' | 'COMPANY';
    studentId: string;
    internshipId: string;
    companyId: string;
    action: SwipeAction;
  }): Promise<{
    success: boolean;
    swipe: Swipe;
    matchCreated: boolean;
    match?: Match;
  }> {
    const res = await fetch('/api/swipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Matches
  async getMatches(params?: { studentId?: string; companyId?: string }): Promise<{ success: boolean; data: Match[] }> {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.companyId) query.set('companyId', params.companyId);
    const res = await fetch(`/api/matches?${query.toString()}`);
    return res.json();
  },

  async getMatch(id: string): Promise<{ success: boolean; data: Match }> {
    const res = await fetch(`/api/matches/${id}`);
    return res.json();
  },

  // Applications
  async getApplications(params?: {
    studentId?: string;
    companyId?: string;
    internshipId?: string;
    status?: ApplicationStatus;
  }): Promise<{ success: boolean; data: Application[] }> {
    const query = new URLSearchParams();
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.companyId) query.set('companyId', params.companyId);
    if (params?.internshipId) query.set('internshipId', params.internshipId);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/applications?${query.toString()}`);
    return res.json();
  },

  async createApplication(data: {
    studentId: string;
    internshipId: string;
    coverLetter?: string;
    resumeUrl?: string;
  }): Promise<{ success: boolean; data: Application }> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    note?: string
  ): Promise<{ success: boolean; data: Application }> {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  // Saved Bookmarks
  async getSavedInternships(studentId: string): Promise<{ success: boolean; data: Internship[]; savedIds: string[] }> {
    const res = await fetch(`/api/saved?studentId=${studentId}`);
    return res.json();
  },

  async toggleSaveInternship(studentId: string, internshipId: string): Promise<{ success: boolean; isSaved: boolean }> {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, internshipId }),
    });
    return res.json();
  },

  // Messages
  async getMessages(matchId: string): Promise<{ success: boolean; data: Message[] }> {
    const res = await fetch(`/api/messages?matchId=${matchId}`);
    return res.json();
  },

  async sendMessage(data: {
    matchId: string;
    senderId: string;
    senderRole: 'STUDENT' | 'COMPANY';
    senderName: string;
    senderAvatar: string;
    content: string;
    type?: 'TEXT' | 'RESUME' | 'FILE' | 'OFFER_INTERVIEW';
    fileUrl?: string;
    fileName?: string;
  }): Promise<{ success: boolean; data: Message }> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(userId: string): Promise<{ success: boolean; data: Notification[] }> {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async markAllNotificationsRead(userId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  // Recommendations
  async getRecommendations(studentId: string): Promise<{ success: boolean; data: Internship[] }> {
    const res = await fetch(`/api/recommendations?studentId=${studentId}`);
    return res.json();
  },

  // AI Engines
  async analyzeResume(resumeText: string): Promise<{ success: boolean; data: ResumeAnalysisResult }> {
    const res = await fetch('/api/ai/resume-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });
    return res.json();
  },

  async getMatchExplanation(studentId: string, internshipId: string): Promise<{ success: boolean; data: MatchExplanation }> {
    const res = await fetch('/api/ai/match-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, internshipId }),
    });
    return res.json();
  },

  async sendCareerAssistantMessage(
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    studentId?: string
  ): Promise<{ success: boolean; reply: string }> {
    const res = await fetch('/api/ai/career-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, studentId }),
    });
    return res.json();
  },

  async generateMockInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    roundType?: 'Technical' | 'Behavioral' | 'System Design' | 'Mixed';
    studentId?: string;
  }): Promise<{ success: boolean; data: MockInterviewQuestion[] }> {
    const res = await fetch('/api/ai/interview-prep/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async evaluateInterviewAnswer(params: {
    question: MockInterviewQuestion;
    studentAnswer: string;
    jobDescription?: string;
    studentId?: string;
  }): Promise<{ success: boolean; data: InterviewAnswerFeedback }> {
    const res = await fetch('/api/ai/interview-prep/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<{ success: boolean; data: PlatformStats }> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async getPlatformStats(): Promise<{ success: boolean; data: PlatformStats }> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async getAdminReports(): Promise<{ success: boolean; data: ReportItem[] }> {
    const res = await fetch('/api/admin/reports');
    return res.json();
  },

  async getReports(): Promise<{ success: boolean; data: ReportItem[] }> {
    const res = await fetch('/api/admin/reports');
    return res.json();
  },

  async fileReport(data: {
    reporterId: string;
    reporterName: string;
    targetType: 'INTERNSHIP' | 'COMPANY' | 'STUDENT';
    targetId: string;
    targetName: string;
    reason: string;
    details: string;
  }): Promise<{ success: boolean; data: ReportItem }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resolveReport(id: string, status: 'RESOLVED' | 'DISMISSED'): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/reports/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async verifyCompany(companyId: string, status: CompanyVerificationStatus): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/verify-company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, status }),
    });
    return res.json();
  },

  async updateCompanyVerification(companyId: string, status: CompanyVerificationStatus): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/verify-company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, status }),
    });
    return res.json();
  },

  async removeSavedInternship(studentId: string, internshipId: string): Promise<{ success: boolean; isSaved: boolean }> {
    return this.toggleSaveInternship(studentId, internshipId);
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
    return res.json();
  },
};
