import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/dataStore';
import {
  analyzeResumeWithAI,
  explainMatchWithAI,
  careerAssistantChat,
  generateMockQuestionsWithAI,
  evaluateInterviewAnswerWithAI,
} from './server/geminiService';
import { Role } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, status: 'online', app: 'InternSwipe', time: new Date().toISOString() });
  });

  // --- AUTHENTICATION ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Demo account matching
    if (email === 'student@internswipe.demo' || role === 'STUDENT') {
      const student = db.getStudentById('student-1') || db.getStudents()[0];
      return res.json({
        success: true,
        user: {
          id: student.userId,
          profileId: student.id,
          name: student.name,
          email: student.email,
          role: 'STUDENT',
          avatar: student.avatar,
        },
        profile: student,
        token: `demo-jwt-token-student-${Date.now()}`,
      });
    }

    if (email === 'company@internswipe.demo' || role === 'COMPANY') {
      const company = db.getCompanyById('comp-1') || db.getCompanies()[0];
      return res.json({
        success: true,
        user: {
          id: company.userId,
          profileId: company.id,
          name: company.companyName,
          email: 'recruiter@google.com',
          role: 'COMPANY',
          avatar: company.logo,
        },
        profile: company,
        token: `demo-jwt-token-company-${Date.now()}`,
      });
    }

    if (email === 'admin@internswipe.demo' || role === 'ADMIN') {
      return res.json({
        success: true,
        user: {
          id: 'user-admin',
          profileId: 'admin-1',
          name: 'Platform Administrator',
          email: 'admin@internswipe.demo',
          role: 'ADMIN',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        token: `demo-jwt-token-admin-${Date.now()}`,
      });
    }

    // Dynamic user lookup
    const foundStudent = db.getStudents().find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (foundStudent) {
      return res.json({
        success: true,
        user: {
          id: foundStudent.userId,
          profileId: foundStudent.id,
          name: foundStudent.name,
          email: foundStudent.email,
          role: 'STUDENT',
          avatar: foundStudent.avatar,
        },
        profile: foundStudent,
        token: `jwt-token-${Date.now()}`,
      });
    }

    // Default fallback student session
    const defaultStudent = db.getStudents()[0];
    return res.json({
      success: true,
      user: {
        id: defaultStudent.userId,
        profileId: defaultStudent.id,
        name: defaultStudent.name,
        email: defaultStudent.email,
        role: 'STUDENT',
        avatar: defaultStudent.avatar,
      },
      profile: defaultStudent,
      token: `jwt-token-${Date.now()}`,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { role, name, email, companyName, college, degree, skills, industry, location } = req.body;

    if (role === 'COMPANY') {
      const newCompany = {
        id: `comp-${Date.now()}`,
        userId: `user-comp-${Date.now()}`,
        companyName: companyName || name || 'New Startup',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
        description: req.body.description || 'Innovative technology company hiring top student interns.',
        industry: industry || 'Technology',
        website: req.body.website || 'https://example.com',
        location: location || 'Remote / Bengaluru',
        companySize: req.body.companySize || '20-50 employees',
        foundedYear: req.body.foundedYear || 2024,
        verificationStatus: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.getCompanies().push(newCompany);

      return res.status(201).json({
        success: true,
        user: {
          id: newCompany.userId,
          profileId: newCompany.id,
          name: newCompany.companyName,
          email: email || 'company@example.com',
          role: 'COMPANY',
          avatar: newCompany.logo,
        },
        profile: newCompany,
        token: `jwt-token-${Date.now()}`,
      });
    } else {
      const newStudent = {
        id: `student-${Date.now()}`,
        userId: `user-student-${Date.now()}`,
        name: name || 'New Student',
        email: email || 'student@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        college: college || 'National Institute of Technology',
        degree: degree || 'B.Tech in Computer Science',
        year: req.body.year || '3rd Year',
        bio: req.body.bio || 'Aspiring engineer eager to learn and build high impact products.',
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : ['React', 'JavaScript', 'Python']),
        projects: [],
        certifications: [],
        preferredDomains: req.body.preferredDomains || ['Web Development', 'AI/ML'],
        preferredJobType: req.body.preferredJobType || 'REMOTE',
        availability: req.body.availability || 'Immediate (3 Months)',
        location: location || 'Remote / India',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.getStudents().push(newStudent);

      return res.status(201).json({
        success: true,
        user: {
          id: newStudent.userId,
          profileId: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          role: 'STUDENT',
          avatar: newStudent.avatar,
        },
        profile: newStudent,
        token: `jwt-token-${Date.now()}`,
      });
    }
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email } = req.body;
    return res.json({
      success: true,
      message: `Password reset link has been dispatched to ${email || 'your email address'}.`,
    });
  });

  // --- STUDENTS ---
  app.get('/api/students', (req: Request, res: Response) => {
    const students = db.getStudents();
    res.json({ success: true, data: students });
  });

  app.get('/api/students/:id', (req: Request, res: Response) => {
    const student = db.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, data: student });
  });

  app.put('/api/students/:id', (req: Request, res: Response) => {
    const updated = db.updateStudent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, data: updated });
  });

  // --- COMPANIES ---
  app.get('/api/companies', (_req: Request, res: Response) => {
    const companies = db.getCompanies();
    res.json({ success: true, data: companies });
  });

  app.get('/api/companies/:id', (req: Request, res: Response) => {
    const company = db.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    res.json({ success: true, data: company });
  });

  app.put('/api/companies/:id', (req: Request, res: Response) => {
    const updated = db.updateCompany(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: updated });
  });

  // --- INTERNSHIPS ---
  app.get('/api/internships', (req: Request, res: Response) => {
    const { category, workType, minStipend, search, companyId, status } = req.query;
    const internships = db.getInternships({
      category: category as string,
      workType: workType as string,
      minStipend: minStipend ? Number(minStipend) : undefined,
      search: search as string,
      companyId: companyId as string,
      status: status as string,
    });
    res.json({ success: true, data: internships });
  });

  app.get('/api/internships/:id', (req: Request, res: Response) => {
    const internship = db.getInternshipById(req.params.id);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    res.json({ success: true, data: internship });
  });

  app.post('/api/internships', (req: Request, res: Response) => {
    const newInternship = db.createInternship(req.body);
    res.status(201).json({ success: true, data: newInternship });
  });

  app.put('/api/internships/:id', (req: Request, res: Response) => {
    const updated = db.updateInternship(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    res.json({ success: true, data: updated });
  });

  app.delete('/api/internships/:id', (req: Request, res: Response) => {
    const deleted = db.deleteInternship(req.params.id);
    res.json({ success: deleted });
  });

  // --- DISCOVERY & SWIPING (CORE FEATURE) ---
  app.get('/api/swipes/discover', (req: Request, res: Response) => {
    const { role, studentId, companyId, category, workType, minStipend, search, targetInternshipId } = req.query;

    if (role === 'COMPANY') {
      const candidates = db.getDiscoverStudentsForCompany(
        (companyId as string) || 'comp-1',
        targetInternshipId as string
      );
      return res.json({ success: true, data: candidates });
    } else {
      const internships = db.getDiscoverInternshipsForStudent(
        (studentId as string) || 'student-1',
        {
          category: category as string,
          workType: workType as string,
          minStipend: minStipend ? Number(minStipend) : undefined,
          search: search as string,
        }
      );
      return res.json({ success: true, data: internships });
    }
  });

  app.post('/api/swipes', (req: Request, res: Response) => {
    const { actorRole, studentId, internshipId, companyId, action } = req.body;

    if (!studentId || !internshipId || !companyId || !action) {
      return res.status(400).json({ success: false, message: 'Missing required swipe parameters' });
    }

    const result = db.recordSwipe(
      actorRole || 'STUDENT',
      studentId,
      internshipId,
      companyId,
      action
    );

    res.json({
      success: true,
      swipe: result.swipe,
      matchCreated: result.matchCreated,
      match: result.match,
    });
  });

  // --- MATCHES ---
  app.get('/api/matches', (req: Request, res: Response) => {
    const { studentId, companyId } = req.query;
    const matches = db.getMatches(studentId as string, companyId as string);
    res.json({ success: true, data: matches });
  });

  app.get('/api/matches/:id', (req: Request, res: Response) => {
    const match = db.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    res.json({ success: true, data: match });
  });

  // --- APPLICATIONS ---
  app.get('/api/applications', (req: Request, res: Response) => {
    const { studentId, companyId, internshipId, status } = req.query;
    const applications = db.getApplications({
      studentId: studentId as string,
      companyId: companyId as string,
      internshipId: internshipId as string,
      status: status as any,
    });
    res.json({ success: true, data: applications });
  });

  app.post('/api/applications', (req: Request, res: Response) => {
    const { studentId, internshipId, coverLetter, resumeUrl } = req.body;
    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: 'Student ID and Internship ID are required' });
    }
    const appRecord = db.createApplication({ studentId, internshipId, coverLetter, resumeUrl });
    res.status(201).json({ success: true, data: appRecord });
  });

  app.put('/api/applications/:id/status', (req: Request, res: Response) => {
    const { status, note } = req.body;
    const updated = db.updateApplicationStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: updated });
  });

  // --- SAVED BOOKMARKS ---
  app.get('/api/saved', (req: Request, res: Response) => {
    const { studentId } = req.query;
    const saved = db.getSavedInternships((studentId as string) || 'student-1');
    const ids = db.getSavedInternshipIds((studentId as string) || 'student-1');
    res.json({ success: true, data: saved, savedIds: ids });
  });

  app.post('/api/saved/toggle', (req: Request, res: Response) => {
    const { studentId, internshipId } = req.body;
    const result = db.toggleSaveInternship(studentId || 'student-1', internshipId);
    res.json({ success: true, isSaved: result.isSaved });
  });

  // --- CHAT & MESSAGING ---
  app.get('/api/messages', (req: Request, res: Response) => {
    const { matchId } = req.query;
    if (!matchId) {
      return res.status(400).json({ success: false, message: 'matchId is required' });
    }
    const messages = db.getMessagesForMatch(matchId as string);
    res.json({ success: true, data: messages });
  });

  app.post('/api/messages', (req: Request, res: Response) => {
    const { matchId, senderId, senderRole, senderName, senderAvatar, content, type, fileUrl, fileName } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({ success: false, message: 'matchId and content are required' });
    }

    const message = db.sendMessage({
      matchId,
      senderId,
      senderRole,
      senderName,
      senderAvatar,
      content,
      type,
      fileUrl,
      fileName,
    });

    // If sent by student, simulate realistic recruiter reply after brief delay for demo interactivity
    if (senderRole === 'STUDENT') {
      setTimeout(() => {
        const match = db.getMatchById(matchId);
        if (match) {
          db.sendMessage({
            matchId,
            senderId: match.company.userId,
            senderRole: 'COMPANY',
            senderName: `${match.company.companyName} Talent Team`,
            senderAvatar: match.company.logo,
            content: `Thanks for the update! We are reviewing your technical profile for ${match.internship.title} and will update your application status shortly.`,
            type: 'TEXT',
          });
        }
      }, 3000);
    }

    res.status(201).json({ success: true, data: message });
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', (req: Request, res: Response) => {
    const { userId } = req.query;
    const notifs = db.getNotifications((userId as string) || 'user-student-1');
    res.json({ success: true, data: notifs });
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    const { userId } = req.body;
    db.markAllNotificationsRead(userId || 'user-student-1');
    res.json({ success: true });
  });

  // --- RECOMMENDATIONS ---
  app.get('/api/recommendations', (req: Request, res: Response) => {
    const { studentId } = req.query;
    const student = db.getStudentById((studentId as string) || 'student-1') || db.getStudents()[0];
    const allInternships = db.getInternships({ status: 'ACTIVE' });

    const scored = allInternships.map((internship) => {
      const matchExplanation = db.calculateMatchScore(student, internship);
      return {
        ...internship,
        compatibilityScore: matchExplanation.compatibilityScore,
        matchExplanation,
      };
    });

    scored.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

    res.json({ success: true, data: scored.slice(0, 10) });
  });

  // --- AI ENGINE ENDPOINTS ---
  app.post('/api/ai/resume-analysis', async (req: Request, res: Response) => {
    try {
      const { resumeText } = req.body;
      const allInternships = db.getInternships({ status: 'ACTIVE' });
      const analysis = await analyzeResumeWithAI(
        resumeText || 'Full stack developer proficient in React, TypeScript, Node.js, Python, and SQL.',
        allInternships
      );
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      console.error('Resume analysis endpoint error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Resume analysis failed' });
    }
  });

  app.post('/api/ai/match-analysis', async (req: Request, res: Response) => {
    try {
      const { studentId, internshipId } = req.body;
      const student = db.getStudentById(studentId || 'student-1') || db.getStudents()[0];
      const internship = db.getInternshipById(internshipId || 'intern-1') || db.getInternships()[0];

      const baseExp = db.calculateMatchScore(student, internship);
      const enhancedExp = await explainMatchWithAI(student, internship, baseExp);

      res.json({ success: true, data: enhancedExp });
    } catch (err: any) {
      console.error('Match analysis endpoint error:', err);
      res.status(500).json({ success: false, message: 'Match explanation failed' });
    }
  });

  app.post('/api/ai/career-assistant', async (req: Request, res: Response) => {
    try {
      const { message, history, studentId } = req.body;
      const student = studentId ? db.getStudentById(studentId) : undefined;
      const reply = await careerAssistantChat(message || 'Hello', history || [], student);
      res.json({ success: true, reply });
    } catch (err: any) {
      console.error('Career assistant error:', err);
      res.status(500).json({ success: false, message: 'Career assistant request failed' });
    }
  });

  app.post('/api/ai/interview-prep/generate', async (req: Request, res: Response) => {
    try {
      const { jobTitle, companyName, jobDescription, roundType, studentId } = req.body;
      const student = studentId ? db.getStudentById(studentId) : undefined;
      const questions = await generateMockQuestionsWithAI(
        jobTitle || 'Software Engineer Intern',
        companyName || 'Tech Partner',
        jobDescription || '',
        roundType || 'Mixed',
        student
      );
      res.json({ success: true, data: questions });
    } catch (err: any) {
      console.error('Interview prep generation error:', err);
      res.status(500).json({ success: false, message: 'Failed to generate interview questions' });
    }
  });

  app.post('/api/ai/interview-prep/evaluate', async (req: Request, res: Response) => {
    try {
      const { question, studentAnswer, jobDescription, studentId } = req.body;
      if (!question || !studentAnswer) {
        return res.status(400).json({ success: false, message: 'Question and answer are required' });
      }
      const student = studentId ? db.getStudentById(studentId) : undefined;
      const feedback = await evaluateInterviewAnswerWithAI(
        question,
        studentAnswer,
        jobDescription || '',
        student
      );
      res.json({ success: true, data: feedback });
    } catch (err: any) {
      console.error('Interview answer evaluation error:', err);
      res.status(500).json({ success: false, message: 'Failed to evaluate interview answer' });
    }
  });

  // --- ADMIN & REPORTS ---
  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    const stats = db.getPlatformStats();
    res.json({ success: true, data: stats });
  });

  app.get('/api/admin/reports', (_req: Request, res: Response) => {
    res.json({ success: true, data: db.getReports() });
  });

  app.post('/api/reports', (req: Request, res: Response) => {
    const report = db.fileReport(req.body);
    res.status(201).json({ success: true, data: report });
  });

  app.put('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
    const { status } = req.body;
    const success = db.resolveReport(req.params.id, status || 'RESOLVED');
    res.json({ success });
  });

  app.put('/api/admin/verify-company', (req: Request, res: Response) => {
    const { companyId, status } = req.body;
    const success = db.verifyCompany(companyId, status || 'VERIFIED');
    res.json({ success });
  });

  app.post('/api/admin/reset-demo', (_req: Request, res: Response) => {
    db.resetToSeed();
    res.json({ success: true, message: 'Database reset to initial demo state successfully' });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InternSwipe Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
