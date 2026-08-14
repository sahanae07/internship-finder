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
  SwipeAction,
  ApplicationStatus,
  CompanyVerificationStatus,
} from '../src/types';
import {
  SEED_COMPANIES,
  SEED_STUDENTS,
  SEED_INTERNSHIPS,
  SEED_SWIPES,
  SEED_MATCHES,
  SEED_APPLICATIONS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_REPORTS,
} from './seedData';

class DataStore {
  private companies: CompanyProfile[] = [];
  private students: StudentProfile[] = [];
  private internships: Internship[] = [];
  private swipes: Swipe[] = [];
  private matches: Match[] = [];
  private applications: Application[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];
  private savedInternships: Map<string, Set<string>> = new Map(); // studentId -> Set of internshipIds
  private reports: ReportItem[] = [];

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed() {
    this.companies = JSON.parse(JSON.stringify(SEED_COMPANIES));
    this.students = JSON.parse(JSON.stringify(SEED_STUDENTS));
    this.internships = JSON.parse(JSON.stringify(SEED_INTERNSHIPS));
    this.swipes = JSON.parse(JSON.stringify(SEED_SWIPES));
    this.matches = JSON.parse(JSON.stringify(SEED_MATCHES));
    this.applications = JSON.parse(JSON.stringify(SEED_APPLICATIONS));
    this.messages = JSON.parse(JSON.stringify(SEED_MESSAGES));
    this.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));
    this.reports = JSON.parse(JSON.stringify(SEED_REPORTS));

    this.savedInternships.clear();
    this.savedInternships.set('student-1', new Set(['intern-4', 'intern-5']));
  }

  // ---- AI MATCHING HYBRID ALGORITHM ----
  public calculateMatchScore(student: StudentProfile, internship: Internship): MatchExplanation {
    const studentSkillsLower = student.skills.map((s) => s.toLowerCase().trim());
    const requiredSkillsLower = internship.requiredSkills.map((s) => s.toLowerCase().trim());
    const preferredSkillsLower = internship.preferredSkills.map((s) => s.toLowerCase().trim());

    // 1. Skill Similarity (40% weight)
    const matchingRequired: string[] = [];
    const missingSkills: string[] = [];

    internship.requiredSkills.forEach((skill) => {
      const match = studentSkillsLower.some(
        (stSkill) => stSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(stSkill)
      );
      if (match) {
        matchingRequired.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const matchingPreferred: string[] = [];
    internship.preferredSkills.forEach((skill) => {
      const match = studentSkillsLower.some(
        (stSkill) => stSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(stSkill)
      );
      if (match) {
        matchingPreferred.push(skill);
      }
    });

    const totalRequired = Math.max(1, internship.requiredSkills.length);
    const reqRatio = matchingRequired.length / totalRequired;
    const prefRatio =
      internship.preferredSkills.length > 0
        ? matchingPreferred.length / internship.preferredSkills.length
        : 1;

    const skillScore = Math.min(100, Math.round((reqRatio * 0.75 + prefRatio * 0.25) * 100));

    // 2. Career Interest / Domain Fit (20% weight)
    const domainMatch = student.preferredDomains.some(
      (d) =>
        d.toLowerCase().includes(internship.category.toLowerCase()) ||
        internship.category.toLowerCase().includes(d.toLowerCase()) ||
        internship.title.toLowerCase().includes(d.toLowerCase())
    );
    const domainScore = domainMatch ? 100 : 40;

    // 3. Experience & Year Level (15% weight)
    let experienceScore = 85;
    if (student.year.includes('3rd') || student.year.includes('4th')) {
      experienceScore = 95;
    } else if (student.year.includes('1st')) {
      experienceScore = 70;
    }

    // 4. Availability (10% weight)
    let availabilityScore = 90;
    if (student.availability.toLowerCase().includes('immediate')) {
      availabilityScore = 100;
    }

    // 5. Work Type Fit (10% weight)
    let workTypeScore = 80;
    if (
      student.preferredJobType === internship.workType ||
      internship.workType === 'REMOTE'
    ) {
      workTypeScore = 100;
    } else if (student.preferredJobType === 'REMOTE' && internship.workType === 'ONSITE') {
      workTypeScore = 50;
    }

    // 6. Location (5% weight)
    let locationScore = 85;
    if (internship.workType === 'REMOTE') {
      locationScore = 100;
    } else if (
      internship.location.toLowerCase().includes('bengaluru') &&
      student.location.toLowerCase().includes('bengaluru')
    ) {
      locationScore = 100;
    }

    // Hybrid formula
    const totalWeightedScore = Math.round(
      skillScore * 0.4 +
        domainScore * 0.2 +
        experienceScore * 0.15 +
        availabilityScore * 0.1 +
        workTypeScore * 0.1 +
        locationScore * 0.05
    );

    const compatibilityScore = Math.max(52, Math.min(99, totalWeightedScore));

    const matchingSkills = Array.from(new Set([...matchingRequired, ...matchingPreferred]));

    let recommendationReason = '';
    let recommendation = '';

    if (compatibilityScore >= 85) {
      recommendationReason = `Exceptional alignment with your technical skills (${matchingSkills.slice(0, 3).join(', ')}) and preferred domain (${internship.category}).`;
      recommendation = 'Strongly Recommended: High probability of mutual interview match.';
    } else if (compatibilityScore >= 70) {
      recommendationReason = `Solid overlap in ${matchingSkills.slice(0, 2).join(', ')}. Brush up on ${missingSkills.slice(0, 2).join(', ') || 'specialized concepts'}.`;
      recommendation = 'Good Match: Review required skills and tailor your application.';
    } else {
      recommendationReason = `Some transferable skills in ${matchingSkills[0] || 'general programming'}, but requires learning ${missingSkills.slice(0, 3).join(', ')}.`;
      recommendation = 'Explore: Good learning opportunity if you wish to expand your domain.';
    }

    return {
      compatibilityScore,
      matchingSkills,
      missingSkills,
      recommendationReason,
      recommendation,
      breakdown: {
        skillScore,
        domainScore,
        experienceScore,
        availabilityScore,
        workTypeScore,
        locationScore,
      },
    };
  }

  // ---- STUDENTS ----
  public getStudents(): StudentProfile[] {
    return this.students;
  }

  public getStudentById(id: string): StudentProfile | undefined {
    return this.students.find((s) => s.id === id || s.userId === id);
  }

  public updateStudent(id: string, updates: Partial<StudentProfile>): StudentProfile | undefined {
    const index = this.students.findIndex((s) => s.id === id || s.userId === id);
    if (index === -1) return undefined;
    this.students[index] = {
      ...this.students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.students[index];
  }

  // ---- COMPANIES ----
  public getCompanies(): CompanyProfile[] {
    return this.companies;
  }

  public getCompanyById(id: string): CompanyProfile | undefined {
    return this.companies.find((c) => c.id === id || c.userId === id);
  }

  public updateCompany(id: string, updates: Partial<CompanyProfile>): CompanyProfile | undefined {
    const index = this.companies.findIndex((c) => c.id === id || c.userId === id);
    if (index === -1) return undefined;
    this.companies[index] = {
      ...this.companies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.companies[index];
  }

  public verifyCompany(companyId: string, status: CompanyVerificationStatus): boolean {
    const company = this.getCompanyById(companyId);
    if (!company) return false;
    company.verificationStatus = status;
    company.updatedAt = new Date().toISOString();

    // Update internships verified flag
    this.internships.forEach((item) => {
      if (item.companyId === company.id) {
        item.companyVerified = status === 'VERIFIED';
      }
    });

    return true;
  }

  // ---- INTERNSHIPS ----
  public getInternships(filters?: {
    category?: string;
    workType?: string;
    minStipend?: number;
    search?: string;
    companyId?: string;
    status?: string;
  }): Internship[] {
    let result = [...this.internships];

    if (filters?.companyId) {
      result = result.filter((i) => i.companyId === filters.companyId);
    }
    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter((i) => i.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.workType && filters.workType !== 'ALL') {
      result = result.filter((i) => i.workType === filters.workType);
    }
    if (filters?.minStipend && filters.minStipend > 0) {
      result = result.filter((i) => i.stipend >= filters.minStipend!);
    }
    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.companyName.toLowerCase().includes(q) ||
          i.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          i.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getInternshipById(id: string): Internship | undefined {
    return this.internships.find((i) => i.id === id);
  }

  public createInternship(data: Omit<Internship, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'applicantsCount'>): Internship {
    const company = this.getCompanyById(data.companyId);
    const newInternship: Internship = {
      ...data,
      id: `intern-${Date.now()}`,
      companyName: company?.companyName || data.companyName || 'Acme Corp',
      companyLogo: company?.logo || data.companyLogo || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
      companyVerified: company?.verificationStatus === 'VERIFIED',
      likesCount: 0,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.internships.unshift(newInternship);
    return newInternship;
  }

  public updateInternship(id: string, updates: Partial<Internship>): Internship | undefined {
    const index = this.internships.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    this.internships[index] = {
      ...this.internships[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.internships[index];
  }

  public deleteInternship(id: string): boolean {
    const prevLen = this.internships.length;
    this.internships = this.internships.filter((i) => i.id !== id);
    return this.internships.length < prevLen;
  }

  // ---- DISCOVERY SWIPE ENGINE ----
  public getDiscoverInternshipsForStudent(
    studentId: string,
    filters?: {
      category?: string;
      workType?: string;
      minStipend?: number;
      search?: string;
    }
  ): Internship[] {
    const student = this.getStudentById(studentId) || this.students[0];

    // Find all internships the student has already swiped on or applied to
    const swipedInternshipIds = new Set(
      this.swipes
        .filter((s) => s.studentId === student.id && s.actorRole === 'STUDENT')
        .map((s) => s.internshipId)
    );

    const appliedInternshipIds = new Set(
      this.applications.filter((a) => a.studentId === student.id).map((a) => a.internshipId)
    );

    let eligible = this.internships.filter(
      (i) =>
        i.status === 'ACTIVE' &&
        !swipedInternshipIds.has(i.id) &&
        !appliedInternshipIds.has(i.id)
    );

    if (filters?.category && filters.category !== 'ALL') {
      eligible = eligible.filter(
        (i) => i.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    if (filters?.workType && filters.workType !== 'ALL') {
      eligible = eligible.filter((i) => i.workType === filters.workType);
    }
    if (filters?.minStipend && filters.minStipend > 0) {
      eligible = eligible.filter((i) => i.stipend >= filters.minStipend!);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      eligible = eligible.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.companyName.toLowerCase().includes(q) ||
          i.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Attach AI scores and sort descending by compatibility
    const withScores = eligible.map((intern) => {
      const explanation = this.calculateMatchScore(student, intern);
      return {
        ...intern,
        compatibilityScore: explanation.compatibilityScore,
        matchExplanation: explanation,
      };
    });

    return withScores.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
  }

  public getDiscoverStudentsForCompany(
    companyId: string,
    internshipId?: string
  ): (StudentProfile & { compatibilityScore: number; targetInternshipTitle: string })[] {
    const company = this.getCompanyById(companyId) || this.companies[0];
    const companyInternships = this.internships.filter((i) => i.companyId === company.id);
    const targetInternship =
      (internshipId ? this.getInternshipById(internshipId) : companyInternships[0]) ||
      this.internships[0];

    // Find student IDs already swiped by this company for this internship
    const swipedStudentIds = new Set(
      this.swipes
        .filter(
          (s) =>
            s.companyId === company.id &&
            s.actorRole === 'COMPANY' &&
            (!internshipId || s.internshipId === internshipId)
        )
        .map((s) => s.studentId)
    );

    const eligible = this.students.filter((s) => !swipedStudentIds.has(s.id));

    return eligible.map((student) => {
      const matchExp = this.calculateMatchScore(student, targetInternship);
      return {
        ...student,
        compatibilityScore: matchExp.compatibilityScore,
        targetInternshipTitle: targetInternship.title,
      };
    });
  }

  // ---- RECORD SWIPE & MUTUAL MATCHING ----
  public recordSwipe(
    actorRole: 'STUDENT' | 'COMPANY',
    studentId: string,
    internshipId: string,
    companyId: string,
    action: SwipeAction
  ): {
    swipe: Swipe;
    matchCreated: boolean;
    match?: Match;
  } {
    // Check if swipe already exists
    const existingIndex = this.swipes.findIndex(
      (s) =>
        s.studentId === studentId &&
        s.internshipId === internshipId &&
        s.actorRole === actorRole
    );

    let swipe: Swipe;
    if (existingIndex !== -1) {
      this.swipes[existingIndex].action = action;
      this.swipes[existingIndex].createdAt = new Date().toISOString();
      swipe = this.swipes[existingIndex];
    } else {
      swipe = {
        id: `swipe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId,
        internshipId,
        companyId,
        action,
        actorRole,
        createdAt: new Date().toISOString(),
      };
      this.swipes.push(swipe);
    }

    // Update counts on internship
    const intern = this.getInternshipById(internshipId);
    if (intern && action === 'LIKE' && actorRole === 'STUDENT') {
      intern.likesCount += 1;
    }

    if (action === 'PASS') {
      return { swipe, matchCreated: false };
    }

    // Check for mutual like
    // If student liked -> Check if company already liked student OR if company automatically likes high-match students
    let isMutual = false;
    if (actorRole === 'STUDENT') {
      const companySwiped = this.swipes.find(
        (s) =>
          s.studentId === studentId &&
          s.companyId === companyId &&
          s.actorRole === 'COMPANY' &&
          s.action === 'LIKE'
      );
      // For demo engagement: If company already liked OR if student has high compatibility with company's featured roles
      if (companySwiped) {
        isMutual = true;
      } else {
        // Create reciprocal company like for realistic interactive experience
        const student = this.getStudentById(studentId);
        if (student && intern) {
          const score = this.calculateMatchScore(student, intern).compatibilityScore;
          if (score >= 75 || Math.random() > 0.35) {
            isMutual = true;
            this.swipes.push({
              id: `swipe-recip-${Date.now()}`,
              studentId,
              internshipId,
              companyId,
              action: 'LIKE',
              actorRole: 'COMPANY',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } else {
      // Company liked student -> Check if student liked internship
      const studentSwiped = this.swipes.find(
        (s) =>
          s.studentId === studentId &&
          s.internshipId === internshipId &&
          s.actorRole === 'STUDENT' &&
          s.action === 'LIKE'
      );
      if (studentSwiped) {
        isMutual = true;
      }
    }

    if (isMutual) {
      // Check if match already exists
      const existingMatch = this.matches.find(
        (m) =>
          m.studentId === studentId &&
          m.companyId === companyId &&
          m.internshipId === internshipId
      );

      if (existingMatch) {
        return { swipe, matchCreated: true, match: existingMatch };
      }

      const student = this.getStudentById(studentId) || this.students[0];
      const company = this.getCompanyById(companyId) || this.companies[0];
      const internship = this.getInternshipById(internshipId) || this.internships[0];

      const newMatch: Match = {
        id: `match-${Date.now()}`,
        studentId: student.id,
        student,
        companyId: company.id,
        company,
        internshipId: internship.id,
        internship,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        lastMessage: `You and ${company.companyName} matched for ${internship.title}! Say hi!`,
        lastMessageAt: new Date().toISOString(),
        unreadCountStudent: 1,
        unreadCountCompany: 0,
      };

      this.matches.unshift(newMatch);

      // Create introductory greeting message from recruiter
      const introMsg: Message = {
        id: `msg-${Date.now()}`,
        matchId: newMatch.id,
        senderId: company.userId,
        senderRole: 'COMPANY',
        senderName: `${company.companyName} Recruiting Team`,
        senderAvatar: company.logo,
        content: `Hi ${student.name.split(' ')[0]}! We saw your profile on InternSwipe and are excited about your background for the ${internship.title} position. Let’s connect!`,
        type: 'TEXT',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      this.messages.push(introMsg);

      // Notifications
      this.notifications.unshift({
        id: `notif-${Date.now()}-1`,
        userId: student.userId,
        title: "It's a Match! 🎉",
        message: `You and ${company.companyName} liked each other for ${internship.title}. Start chatting now!`,
        type: 'MATCH',
        link: '/messages',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      this.notifications.unshift({
        id: `notif-${Date.now()}-2`,
        userId: company.userId,
        title: 'New Student Match!',
        message: `${student.name} (${student.college}) matched with your ${internship.title} role.`,
        type: 'MATCH',
        link: '/messages',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return { swipe, matchCreated: true, match: newMatch };
    }

    return { swipe, matchCreated: false };
  }

  // ---- MATCHES ----
  public getMatches(studentId?: string, companyId?: string): Match[] {
    let list = [...this.matches];
    if (studentId) {
      list = list.filter((m) => m.studentId === studentId);
    }
    if (companyId) {
      list = list.filter((m) => m.companyId === companyId);
    }
    return list;
  }

  public getMatchById(matchId: string): Match | undefined {
    return this.matches.find((m) => m.id === matchId);
  }

  // ---- APPLICATIONS ----
  public getApplications(filters?: {
    studentId?: string;
    companyId?: string;
    internshipId?: string;
    status?: ApplicationStatus;
  }): Application[] {
    let list = [...this.applications];
    if (filters?.studentId) {
      list = list.filter((a) => a.studentId === filters.studentId);
    }
    if (filters?.companyId) {
      list = list.filter((a) => a.companyId === filters.companyId);
    }
    if (filters?.internshipId) {
      list = list.filter((a) => a.internshipId === filters.internshipId);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    return list;
  }

  public createApplication(data: {
    studentId: string;
    internshipId: string;
    coverLetter?: string;
    resumeUrl?: string;
  }): Application {
    const student = this.getStudentById(data.studentId) || this.students[0];
    const internship = this.getInternshipById(data.internshipId) || this.internships[0];
    const company = this.getCompanyById(internship.companyId) || this.companies[0];

    const newApp: Application = {
      id: `app-${Date.now()}`,
      studentId: student.id,
      student,
      internshipId: internship.id,
      internship,
      companyId: company.id,
      company,
      status: 'APPLIED',
      coverLetter: data.coverLetter || 'I am excited to apply for this internship opportunity.',
      resumeUrl: data.resumeUrl || student.resumeUrl || 'https://internswipe.demo/resumes/default-resume.pdf',
      timeline: [
        {
          status: 'APPLIED',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Application submitted successfully on InternSwipe',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    internship.applicantsCount += 1;
    this.applications.unshift(newApp);

    // Notification to company
    this.notifications.unshift({
      id: `notif-app-${Date.now()}`,
      userId: company.userId,
      title: 'New Internship Application',
      message: `${student.name} applied for ${internship.title}.`,
      type: 'APPLICATION',
      link: '/company/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newApp;
  }

  public updateApplicationStatus(
    appId: string,
    status: ApplicationStatus,
    note?: string
  ): Application | undefined {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return undefined;

    app.status = status;
    app.updatedAt = new Date().toISOString();
    app.timeline.push({
      status,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: note || `Status updated to ${status}`,
    });

    // Notify student
    this.notifications.unshift({
      id: `notif-status-${Date.now()}`,
      userId: app.student.userId,
      title: 'Application Status Updated',
      message: `Your application for ${app.internship.title} at ${app.company.companyName} is now: ${status.replace('_', ' ')}.`,
      type: 'APPLICATION',
      link: '/student/applications',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return app;
  }

  // ---- SAVED INTERNSHIPS ----
  public getSavedInternshipIds(studentId: string): string[] {
    return Array.from(this.savedInternships.get(studentId) || []);
  }

  public toggleSaveInternship(studentId: string, internshipId: string): { isSaved: boolean } {
    if (!this.savedInternships.has(studentId)) {
      this.savedInternships.set(studentId, new Set());
    }
    const set = this.savedInternships.get(studentId)!;
    if (set.has(internshipId)) {
      set.delete(internshipId);
      return { isSaved: false };
    } else {
      set.add(internshipId);
      return { isSaved: true };
    }
  }

  public getSavedInternships(studentId: string): Internship[] {
    const ids = this.getSavedInternshipIds(studentId);
    return this.internships.filter((i) => ids.includes(i.id));
  }

  // ---- MESSAGES & CHAT ----
  public getMessagesForMatch(matchId: string): Message[] {
    return this.messages.filter((m) => m.matchId === matchId).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  public sendMessage(data: {
    matchId: string;
    senderId: string;
    senderRole: 'STUDENT' | 'COMPANY';
    senderName: string;
    senderAvatar: string;
    content: string;
    type?: 'TEXT' | 'RESUME' | 'FILE' | 'OFFER_INTERVIEW';
    fileUrl?: string;
    fileName?: string;
  }): Message {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      matchId: data.matchId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      content: data.content,
      type: data.type || 'TEXT',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(msg);

    // Update match last message
    const match = this.getMatchById(data.matchId);
    if (match) {
      match.lastMessage = data.content;
      match.lastMessageAt = msg.createdAt;
      if (data.senderRole === 'STUDENT') {
        match.unreadCountCompany = (match.unreadCountCompany || 0) + 1;
      } else {
        match.unreadCountStudent = (match.unreadCountStudent || 0) + 1;
      }
    }

    return msg;
  }

  // ---- NOTIFICATIONS ----
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId || n.userId === 'all');
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') {
        n.isRead = true;
      }
    });
  }

  // ---- REPORTS & ADMIN ----
  public getReports(): ReportItem[] {
    return this.reports;
  }

  public fileReport(data: Omit<ReportItem, 'id' | 'status' | 'createdAt'>): ReportItem {
    const newReport: ReportItem = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  public resolveReport(id: string, status: 'RESOLVED' | 'DISMISSED'): boolean {
    const report = this.reports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      return true;
    }
    return false;
  }

  public getPlatformStats(): PlatformStats {
    return {
      totalUsers: this.students.length + this.companies.length + 1,
      totalStudents: this.students.length,
      totalCompanies: this.companies.length,
      totalInternships: this.internships.length,
      totalApplications: this.applications.length,
      totalMatches: this.matches.length,
      totalSwipes: this.swipes.length,
      activeOpportunities: this.internships.filter((i) => i.status === 'ACTIVE').length,
    };
  }
}

export const db = new DataStore();
