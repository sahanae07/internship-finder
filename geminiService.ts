import { GoogleGenAI } from '@google/genai';
import {
  StudentProfile,
  Internship,
  ResumeAnalysisResult,
  MatchExplanation,
  MockInterviewQuestion,
  InterviewAnswerFeedback,
} from '../src/types';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function analyzeResumeWithAI(
  resumeText: string,
  availableInternships: Internship[] = []
): Promise<ResumeAnalysisResult> {
  const ai = getAiClient();

  if (!ai) {
    // High-quality deterministic analyzer fallback
    return fallbackResumeAnalysis(resumeText, availableInternships);
  }

  try {
    const internshipContext = availableInternships
      .slice(0, 8)
      .map((i) => `ID: ${i.id} | Title: ${i.title} | Category: ${i.category} | Skills: ${i.requiredSkills.join(', ')}`)
      .join('\n');

    const prompt = `You are a Senior Tech Recruiter and ATS Career Advisor for college students.
Analyze the following student resume or project portfolio text and evaluate its quality, technical depth, and ATS compatibility.

RESUME CONTENT:
"""
${resumeText}
"""

AVAILABLE INTERNSHIPS ON PLATFORM:
${internshipContext}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "atsScore": number between 65 and 96,
  "overallScore": number between 70 and 98,
  "summary": "2 sentence executive summary of the student candidate's background and core strengths.",
  "skillsDetected": ["list", "of", "concrete", "technical", "skills", "found"],
  "missingSkills": ["list", "of", "high-value", "in-demand", "skills", "they", "should", "learn", "next"],
  "strengths": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "improvements": ["actionable advice 1", "actionable advice 2", "actionable advice 3"],
  "educationAnalysis": "1 sentence review of education details and coursework impact.",
  "projectsAnalysis": "1-2 sentence review of project complexity and measurable outcomes.",
  "recommendedInternshipIds": ["intern-1", "intern-2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text?.trim() || '';
    const parsed = JSON.parse(jsonText);

    return {
      atsScore: parsed.atsScore || 84,
      overallScore: parsed.overallScore || 88,
      summary: parsed.summary || 'Strong foundational developer with solid project credentials.',
      skillsDetected: parsed.skillsDetected || ['JavaScript', 'React', 'Python'],
      missingSkills: parsed.missingSkills || ['Docker', 'AWS'],
      strengths: parsed.strengths || ['Clear project structure', 'Relevant tech stack'],
      improvements: parsed.improvements || ['Quantify project impact with metrics'],
      educationAnalysis: parsed.educationAnalysis || 'Relevant technical coursework highlighted.',
      projectsAnalysis: parsed.projectsAnalysis || 'Demonstrated practical software development abilities.',
      recommendedInternshipIds: parsed.recommendedInternshipIds || ['intern-1', 'intern-2'],
    };
  } catch (err) {
    console.warn('Gemini resume analysis error, using fallback:', err);
    return fallbackResumeAnalysis(resumeText, availableInternships);
  }
}

export async function explainMatchWithAI(
  student: StudentProfile,
  internship: Internship,
  baseExplanation: MatchExplanation
): Promise<MatchExplanation> {
  const ai = getAiClient();
  if (!ai) return baseExplanation;

  try {
    const prompt = `You are the AI Match Engine for InternSwipe.
Evaluate the compatibility between this student candidate and the internship posting.

STUDENT PROFILE:
- Name: ${student.name}
- College/Degree: ${student.degree}, ${student.college}
- Skills: ${student.skills.join(', ')}
- Preferred Domain: ${student.preferredDomains.join(', ')}
- Availability: ${student.availability}

INTERNSHIP:
- Title: ${internship.title} at ${internship.companyName}
- Category: ${internship.category}
- Required Skills: ${internship.requiredSkills.join(', ')}
- Preferred Skills: ${internship.preferredSkills.join(', ')}
- Work Type: ${internship.workType}

Respond ONLY with valid JSON:
{
  "compatibilityScore": ${baseExplanation.compatibilityScore},
  "recommendationReason": "A concise 2-sentence explanation of why this is a great mutual match.",
  "recommendation": "1-sentence actionable next step for the student (e.g. Highlight your PyTorch project when messaging the recruiter)."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...baseExplanation,
      recommendationReason: parsed.recommendationReason || baseExplanation.recommendationReason,
      recommendation: parsed.recommendation || baseExplanation.recommendation,
    };
  } catch (err) {
    return baseExplanation;
  }
}

export async function careerAssistantChat(
  userQuery: string,
  history: { role: 'user' | 'model'; text: string }[],
  student?: StudentProfile
): Promise<string> {
  const ai = getAiClient();

  const studentContext = student
    ? `Student Name: ${student.name}, College: ${student.college}, Degree: ${student.degree}, Year: ${student.year}, Skills: ${student.skills.join(', ')}, Career Interests: ${student.preferredDomains.join(', ')}, Availability: ${student.availability}.`
    : 'College student looking for internships.';

  const systemInstruction = `You are InternAI, the dedicated AI Career Coach and Recruiter Mentor at InternSwipe.
Your mission is to help college students discover virtual and on-site internships, prepare for technical & behavioral interviews, craft tailored outreach notes to recruiters, and bridge technical skill gaps.

Current Student Profile Context:
${studentContext}

Guidelines:
- Give direct, practical, and highly encouraging advice.
- When asked to draft messages to recruiters, write concise, professional 3-sentence outreach messages.
- When asked for interview preparation, suggest 3 specific questions with bulleted answer outlines.
- If asked about missing skills or roadmaps, give a structured 4-week learning plan with high-yield topics.
- Keep responses clean, well-formatted, and avoid generic filler.`;

  if (!ai) {
    return fallbackCareerAssistantResponse(userQuery, student);
  }

  try {
    const formattedHistory = history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({
      message: userQuery,
    });

    return response.text || 'I am here to help you match and succeed in your internship search!';
  } catch (err) {
    console.warn('Gemini chat error, using fallback:', err);
    return fallbackCareerAssistantResponse(userQuery, student);
  }
}

function fallbackResumeAnalysis(text: string, internships: Internship[]): ResumeAnalysisResult {
  const textLower = text.toLowerCase();
  const allKnownSkills = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'PyTorch', 'TensorFlow',
    'Machine Learning', 'Docker', 'AWS', 'PostgreSQL', 'SQL', 'Git', 'Tailwind CSS',
    'FastAPI', 'Next.js', 'Go', 'Flutter', 'Figma', 'Linux', 'Cybersecurity', 'Kafka'
  ];

  const skillsDetected = allKnownSkills.filter((s) => textLower.includes(s.toLowerCase()));
  if (skillsDetected.length === 0) {
    skillsDetected.push('React', 'JavaScript', 'Python', 'Git', 'SQL');
  }

  const missingSkills = ['Docker & CI/CD', 'AWS Cloud Infrastructure', 'Unit & Integration Testing', 'System Design Patterns']
    .filter((s) => !skillsDetected.some((sd) => s.toLowerCase().includes(sd.toLowerCase())));

  const atsScore = Math.min(94, 72 + skillsDetected.length * 3);
  const overallScore = Math.min(96, 75 + skillsDetected.length * 3);

  const matchedIds = internships
    .filter((i) => i.requiredSkills.some((req) => skillsDetected.includes(req)))
    .slice(0, 3)
    .map((i) => i.id);

  return {
    atsScore,
    overallScore,
    summary: `Candidate showcases strong expertise in ${skillsDetected.slice(0, 3).join(', ')} with solid project foundations.`,
    skillsDetected,
    missingSkills,
    strengths: [
      `Well-defined tech stack centered on ${skillsDetected.slice(0, 2).join(' and ')}`,
      'Demonstrated project ownership and practical implementation',
      'Clear educational credentials and relevant focus areas',
    ],
    improvements: [
      'Quantify results (e.g. "reduced latency by 35%" or "served 5,000+ users")',
      'Add live deployment links and GitHub repository badges',
      'Include a concise 2-line professional headline at the top of your resume',
    ],
    educationAnalysis: 'Technical curriculum aligns well with high-demand junior software roles.',
    projectsAnalysis: 'Practical hands-on projects showcase ability to ship functional applications.',
    recommendedInternshipIds: matchedIds.length > 0 ? matchedIds : ['intern-1', 'intern-2'],
  };
}

function fallbackCareerAssistantResponse(query: string, student?: StudentProfile): string {
  const q = query.toLowerCase();
  const name = student?.name ? student.name.split(' ')[0] : 'there';

  if (q.includes('outreach') || q.includes('message') || q.includes('recruiter') || q.includes('cold')) {
    return `Here is a high-converting outreach message you can send to matched recruiters on InternSwipe:

---
**Subject / Message:**
"Hi [Recruiter Name],

I was thrilled to see our mutual match for the [Role Title] position! With my background in ${student?.skills.slice(0, 3).join(', ') || 'React, Node.js, and ML'} from ${student?.college || 'university'}, I recently built [Project Name] and would love to contribute to [Company Name]'s upcoming initiatives.

Looking forward to connecting when convenient!"
---
💡 *Tip: Keep it under 75 words and reference a specific project.*`;
  }

  if (q.includes('interview') || q.includes('prepare') || q.includes('questions')) {
    return `Here is a targeted 3-step preparation plan for your upcoming internship interviews:

1. **System & Architecture Breakdown (30 mins)**
   - Be ready to explain your top project (${student?.projects[0]?.title || 'your recent project'}): architecture diagram, state management choices, and trade-offs.

2. **Core Technical Concepts to Review**
   - **Frontend:** Component lifecycle, reconciliation, hooks dependencies, and render optimizations.
   - **Backend / Database:** Indexing strategies, REST vs gRPC vs WebSockets, and ACID properties.

3. **Behavioral STAR Stories**
   - Situation: A tough bug or deadline.
   - Task: What needed to be delivered.
   - Action: Your specific technical contribution.
   - Result: Measurable outcome.`;
  }

  if (q.includes('missing') || q.includes('skill') || q.includes('learn')) {
    return `Based on current internship market trends and your profile:

✅ **Your Core Strengths:** ${student?.skills.slice(0, 4).join(', ') || 'Solid frontend and programming basics'}
🚀 **High-ROI Skills to Add:**
1. **Containerization (Docker):** Packaging applications into reproducible containers.
2. **Cloud Basics (AWS/GCP):** Deploying serverless functions and managing S3/storage buckets.
3. **Automated Testing:** Writing unit tests with Jest/Vitest to demonstrate production readiness.

Would you like a 2-week learning roadmap for any of these?`;
  }

  return `Hello ${name}! As your InternAI career mentor, I can help you:
- 🎯 **Match Analysis:** Break down why specific internships fit your skill set.
- 💬 **Recruiter Pitching:** Draft customized messages for matched companies.
- 📋 **Resume Polish:** Identify missing keywords and quantify project achievements.
- 💡 **Mock Interview Prep:** Practice technical or behavioral interview scenarios.

What would you like to focus on right now?`;
}

export async function generateMockQuestionsWithAI(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  roundType: 'Technical' | 'Behavioral' | 'System Design' | 'Mixed' = 'Mixed',
  student?: StudentProfile
): Promise<MockInterviewQuestion[]> {
  const ai = getAiClient();
  if (!ai) {
    return fallbackMockQuestions(jobTitle, companyName, jobDescription, roundType);
  }

  try {
    const studentInfo = student
      ? `Candidate Profile: ${student.name}, Degree: ${student.degree}, Skills: ${student.skills.join(', ')}`
      : 'Candidate Profile: General college student';

    const prompt = `You are a Principal Engineering Lead and Interview Evaluator at ${companyName || 'a top tech company'}.
Generate 4 highly realistic, probing mock interview questions tailored strictly to this specific Job Description and target role.

ROLE: ${jobTitle || 'Software Engineer Intern'}
COMPANY: ${companyName || 'Tech Org'}
ROUND TYPE: ${roundType}
JOB DESCRIPTION & REQUIREMENTS:
"""
${jobDescription || 'Full stack engineering internship working on web services, database architecture, and scalable APIs.'}
"""
${studentInfo}

Ensure questions test realistic work scenarios, specific technologies mentioned in the JD, and behavioral situational awareness.

Respond ONLY with a JSON array of 4 objects matching this schema:
[
  {
    "id": "q1",
    "question": "The interview question text",
    "category": "Technical" | "Behavioral" | "System Design" | "Problem Solving" | "Domain",
    "difficulty": "Entry" | "Intermediate" | "Advanced",
    "context": "1-2 sentences explaining why the recruiter asks this based on the JD",
    "expectedCriteria": ["Key concept 1", "Key concept 2", "Key concept 3"],
    "sampleHint": "A short hint for the candidate on how to structure their thoughts",
    "idealAnswerOutline": "Brief bulleted guide of an exemplary response"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        id: item.id || `q-${idx + 1}-${Date.now()}`,
        question: item.question || 'How would you approach solving a performance bottleneck in your code?',
        category: item.category || (roundType === 'Behavioral' ? 'Behavioral' : 'Technical'),
        difficulty: item.difficulty || 'Intermediate',
        context: item.context || `Assesses core competencies required for ${jobTitle} at ${companyName}.`,
        expectedCriteria: Array.isArray(item.expectedCriteria) ? item.expectedCriteria : ['Clarity', 'Technical reasoning'],
        sampleHint: item.sampleHint || 'Use the STAR method or break down the problem into input, process, and output.',
        idealAnswerOutline: item.idealAnswerOutline || 'Define the scenario, explain the trade-offs, and summarize the outcome.',
      }));
    }

    return fallbackMockQuestions(jobTitle, companyName, jobDescription, roundType);
  } catch (err) {
    console.warn('Gemini question generation error, falling back:', err);
    return fallbackMockQuestions(jobTitle, companyName, jobDescription, roundType);
  }
}

export async function evaluateInterviewAnswerWithAI(
  question: MockInterviewQuestion,
  studentAnswer: string,
  jobDescription: string,
  student?: StudentProfile
): Promise<InterviewAnswerFeedback> {
  const ai = getAiClient();
  if (!ai) {
    return fallbackAnswerEvaluation(question, studentAnswer);
  }

  try {
    const prompt = `You are an expert Technical Interviewer evaluating a candidate's spoken/written interview response.
Provide an objective, constructive evaluation with both a numerical score breakdown and verbal critique.

INTERVIEW QUESTION:
"${question.question}"
Category: ${question.category}
Expected Key Points: ${question.expectedCriteria.join(', ')}

TARGET JOB CONTEXT:
"""
${jobDescription || 'Software Engineering Internship'}
"""

CANDIDATE'S ANSWER (Transcribed from Voice/Text):
"""
${studentAnswer}
"""

Respond ONLY with a JSON object matching this schema:
{
  "score": number between 40 and 98 (Overall suitability),
  "clarityScore": number between 50 and 98 (Structure, flow, STAR method application),
  "technicalDepthScore": number between 45 and 98 (Accuracy, specific terminology, trade-offs),
  "strengths": ["bullet point 1 on what they did well", "bullet point 2"],
  "improvements": ["concrete tip on what was missing or could be sharper", "another recommendation"],
  "modelAnswerSnippet": "2-3 sentences showing an exemplary concise answer to this specific question",
  "followUpQuestion": "A natural follow-up question the interviewer would ask next",
  "overallVerbalCritique": "A warm, natural 2-3 sentence verbal critique suitable for audio playback / Text-To-Speech. Example: 'Good job identifying the state management trade-offs! To make your answer stand out even more, make sure to quantify the performance gain and mention how you would handle error boundaries.'"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      score: parsed.score || 82,
      clarityScore: parsed.clarityScore || 85,
      technicalDepthScore: parsed.technicalDepthScore || 80,
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        ? parsed.strengths
        : ['Clear communication style', 'Directly addressed the core scenario'],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        ? parsed.improvements
        : ['Provide specific performance numbers', 'Discuss alternative edge cases'],
      modelAnswerSnippet: parsed.modelAnswerSnippet || 'In my previous project, I isolated bottlenecks using profiler tools, refactored redundant renders, and validated the 30% speedup with automated benchmarks.',
      followUpQuestion: parsed.followUpQuestion || 'How would your solution scale if traffic increased tenfold?',
      overallVerbalCritique: parsed.overallVerbalCritique || `Nice response! You communicated the core concept clearly. For your next attempt, highlight specific metrics and edge-case handling to demonstrate production-grade experience.`,
    };
  } catch (err) {
    console.warn('Gemini interview answer evaluation error, falling back:', err);
    return fallbackAnswerEvaluation(question, studentAnswer);
  }
}

function fallbackMockQuestions(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  roundType: string
): MockInterviewQuestion[] {
  const jdLower = (jobDescription || '').toLowerCase();
  const isMl = jdLower.includes('ml') || jdLower.includes('ai') || jdLower.includes('python') || jdLower.includes('model');
  const isReact = jdLower.includes('react') || jdLower.includes('frontend') || jdLower.includes('javascript') || jdLower.includes('web');

  if (roundType === 'Behavioral') {
    return [
      {
        id: 'q-beh-1',
        question: `Tell me about a time you had to learn a completely new framework or tool under a tight internship or project deadline.`,
        category: 'Behavioral',
        difficulty: 'Entry',
        context: `Tests adaptability and independent problem-solving at ${companyName || 'our company'}.`,
        expectedCriteria: ['Clear STAR framework', 'Proactive learning strategy', 'Measurable project delivery'],
        sampleHint: 'Structure your answer: Situation (the stack change), Task (the deliverable), Action (documentation & pairing), Result (on-time delivery).',
        idealAnswerOutline: 'Mention finding official docs, building a proof-of-concept, and unblocking the team ahead of schedule.',
      },
      {
        id: 'q-beh-2',
        question: `Describe a situation where you had a disagreement with a team member on a technical design decision. How did you resolve it?`,
        category: 'Behavioral',
        difficulty: 'Intermediate',
        context: `Evaluates communication, empathy, and constructive engineering debate.`,
        expectedCriteria: ['Respectful discussion', 'Data-driven decision making', 'Alignment with product goals'],
        sampleHint: 'Focus on how you evaluated trade-offs (e.g. latency vs code complexity) with benchmarks instead of personal opinion.',
        idealAnswerOutline: 'Proposed a benchmark test, gathered evidence, agreed on the best fit for user requirements, and committed as a unified team.',
      },
      {
        id: 'q-beh-3',
        question: `What motivated you to apply specifically for the ${jobTitle || 'Software Intern'} role at ${companyName || 'this company'}, and how does it fit your career trajectory?`,
        category: 'Behavioral',
        difficulty: 'Entry',
        context: `Measures genuine company alignment and intrinsic passion for the team's mission.`,
        expectedCriteria: ['Specific knowledge of company products', 'Clear personal goal alignment', 'Eagerness to contribute'],
        sampleHint: 'Reference specific tech blogs, open-source work, or user products built by the company.',
        idealAnswerOutline: 'Highlight specific initiatives of the organization and connect your academic/project background directly to their roadmap.',
      },
    ];
  }

  if (isMl) {
    return [
      {
        id: 'q-ml-1',
        question: `How do you diagnose and mitigate overfitting in a deep learning or classification model during training?`,
        category: 'Technical',
        difficulty: 'Intermediate',
        context: `Core competency for AI/ML engineering roles at ${companyName || 'the organization'}.`,
        expectedCriteria: ['Loss curves divergence detection', 'Regularization (Dropout, L1/L2)', 'Data augmentation & early stopping', 'Cross-validation'],
        sampleHint: 'Discuss monitoring validation loss vs training loss, and provide 2-3 concrete regularization techniques.',
        idealAnswerOutline: 'Start by explaining training vs validation curve divergence, then detail dropout, weight decay, early stopping, and data synthesis.',
      },
      {
        id: 'q-ml-2',
        question: `Walk me through how you would build an end-to-end inference pipeline for serving LLM or image embeddings in real time with low latency.`,
        category: 'System Design',
        difficulty: 'Intermediate',
        context: `Assesses production ML engineering and deployment capabilities mentioned in the JD.`,
        expectedCriteria: ['Model quantization / ONNX', 'Vector indexing (HNSW, Pinecone, FAISS)', 'Asynchronous batching & caching', 'API throughput'],
        sampleHint: 'Break it into: Model optimization (quantization/distillation) -> Vector indexing -> Caching layer -> API gateway.',
        idealAnswerOutline: 'Describe containerizing with FastAPI/Triton, caching frequent queries in Redis, using quantization for 4x speedup, and indexing vectors.',
      },
      {
        id: 'q-ml-3',
        question: `Can you explain the difference between Precision and Recall? In what scenario would you prioritize Recall over Precision?`,
        category: 'Problem Solving',
        difficulty: 'Entry',
        context: `Evaluates fundamental statistical and business metric comprehension.`,
        expectedCriteria: ['Formulas for Precision & Recall', 'Cost of False Negatives vs False Positives', 'Concrete application example (e.g. Fraud / Disease detection)'],
        sampleHint: 'Recall is vital when missing a positive case (False Negative) is catastrophic, like medical diagnoses or security intrusion.',
        idealAnswerOutline: 'Define Precision (TP/(TP+FP)) and Recall (TP/(TP+FN)). Illustrate with security/health where missing an anomaly causes severe harm.',
      },
    ];
  }

  // Default Full-Stack / Software Engineering questions
  return [
    {
      id: 'q-swe-1',
      question: `How does React's Virtual DOM reconciliation algorithm work, and what strategies do you use to prevent unnecessary re-renders in complex dashboards?`,
      category: 'Technical',
      difficulty: 'Intermediate',
      context: `Directly checks front-end performance knowledge required in the ${jobTitle || 'Engineering'} job description.`,
      expectedCriteria: ['Diffing algorithm & key prop importance', 'useMemo / useCallback memoization', 'Component decomposition', 'Profiling tools'],
      sampleHint: 'Explain how React builds the lightweight VDOM tree, computes diffs, batches updates, and how React.memo and primitive deps optimize cycles.',
      idealAnswerOutline: 'Describe virtual tree comparison, the O(n) heuristic diffing algorithm, stable keys, and targeted hook memoization with DevTools verification.',
    },
    {
      id: 'q-swe-2',
      question: `When designing a REST or WebSocket API for real-time applications (like notifications or chat), how do you ensure reliability and idempotency?`,
      category: 'System Design',
      difficulty: 'Intermediate',
      context: `Tests system architecture and full-stack backend skills specified in the job posting.`,
      expectedCriteria: ['Idempotency keys & unique message UUIDs', 'Connection reconnection / heartbeat protocols', 'Database transactional integrity', 'Backoff strategies'],
      sampleHint: 'Mention client-generated UUIDs for idempotency, Redis Pub/Sub for horizontal scaling, and exponential backoff retry mechanisms.',
      idealAnswerOutline: 'Propose assigning idempotent UUIDs per message, persisting state in PostgreSQL with ACID guarantees, and maintaining heartbeat ping/pongs.',
    },
    {
      id: 'q-swe-3',
      question: `Tell me about a challenging bug you encountered in a recent project. How did you isolate the root cause, and what did you learn?`,
      category: 'Problem Solving',
      difficulty: 'Entry',
      context: `Gauges structured debugging methodology and post-mortem reflection.`,
      expectedCriteria: ['Systematic isolation (logs, breakpoints, reproduction)', 'Root cause identification', 'Automated regression test addition'],
      sampleHint: 'Avoid saying "I just tried random things". Show a scientific debugging approach: hypothesize, isolate, inspect logs, patch, and write test.',
      idealAnswerOutline: 'State the bug symptom, explain using Chrome DevTools/Server logs to isolate a race condition, implement the fix, and add a unit test.',
    },
  ];
}

function fallbackAnswerEvaluation(
  question: MockInterviewQuestion,
  studentAnswer: string
): InterviewAnswerFeedback {
  const wordCount = (studentAnswer || '').trim().split(/\s+/).filter(Boolean).length;
  const ansLower = (studentAnswer || '').toLowerCase();

  let score = 75;
  let clarityScore = 78;
  let technicalDepthScore = 72;

  const matchedKeywords = question.expectedCriteria.filter((crit) =>
    ansLower.includes(crit.toLowerCase().split(' ')[0])
  );

  if (wordCount > 40) {
    score += Math.min(15, wordCount / 10);
    clarityScore += 8;
  }
  if (matchedKeywords.length > 0) {
    technicalDepthScore += matchedKeywords.length * 6;
    score += matchedKeywords.length * 4;
  }

  score = Math.min(95, Math.max(60, Math.round(score)));
  clarityScore = Math.min(96, Math.max(65, Math.round(clarityScore)));
  technicalDepthScore = Math.min(94, Math.max(55, Math.round(technicalDepthScore)));

  const strengths = [
    'Good articulation of the high-level concept and problem space',
    matchedKeywords.length > 0
      ? `Effectively mentioned key concepts: ${matchedKeywords.join(', ')}`
      : 'Maintained a structured, easy-to-follow conversational flow',
  ];

  const improvements = [
    'Quantify the impact with measurable metrics (e.g. latency reduced, user load sustained)',
    `Deepen technical explanation by referencing: ${question.expectedCriteria.slice(0, 2).join(' and ')}`,
  ];

  return {
    score,
    clarityScore,
    technicalDepthScore,
    strengths,
    improvements,
    modelAnswerSnippet: question.idealAnswerOutline || 'A strong answer clearly breaks down the approach, highlights trade-offs, and validates results with empirical metrics.',
    followUpQuestion: 'How would you test and benchmark this implementation in a production environment with high concurrency?',
    overallVerbalCritique: `Great effort! You explained the foundation well with a score of ${score}%. To take it to the top tier, incorporate concrete performance metrics and discuss edge cases.`,
  };
}

