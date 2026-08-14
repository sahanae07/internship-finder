import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  MockInterviewQuestion,
  InterviewAnswerFeedback,
  Internship,
} from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  RotateCcw,
  Building2,
  Briefcase,
  Layers,
  Award,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import Markdown from 'react-markdown';

export const InterviewPrepStudio: React.FC = () => {
  const { studentProfile } = useAuth();

  // Mode & setup states
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  const [customJobTitle, setCustomJobTitle] = useState('AI & Full Stack Engineer Intern');
  const [customCompanyName, setCustomCompanyName] = useState('Google Cloud');
  const [customJobDescription, setCustomJobDescription] = useState(
    'Looking for an enthusiastic Software Engineer Intern to build generative AI solutions and scalable full-stack web applications. Proficiency with React, TypeScript, Node.js, and Python ML APIs required.'
  );
  const [roundType, setRoundType] = useState<'Mixed' | 'Technical' | 'Behavioral' | 'System Design'>('Mixed');
  const [isCustomJD, setIsCustomJD] = useState(false);

  // Simulation Session State
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Answer & Evaluation State
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, InterviewAnswerFeedback>>({});
  const [showHint, setShowHint] = useState(false);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);

  // Voice/Audio States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load available internships for quick selection
  useEffect(() => {
    api.getInternships({ status: 'ACTIVE' }).then((res) => {
      if (res.success && res.data.length > 0) {
        setInternships(res.data);
        const first = res.data[0];
        setSelectedInternshipId(first.id);
        setCustomJobTitle(first.title);
        setCustomCompanyName(first.companyName);
        setCustomJobDescription(
          `${first.title} at ${first.companyName}.\nCategory: ${first.category}\nRequired Skills: ${first.requiredSkills.join(', ')}\n${first.description}\nResponsibilities:\n${first.responsibilities.join('\n')}`
        );
      }
    });

    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      stopSpeechSynthesis();
      stopRecording();
    };
  }, []);

  // Handle internship selection change
  const handleInternshipSelect = (id: string) => {
    setSelectedInternshipId(id);
    if (id === 'custom') {
      setIsCustomJD(true);
    } else {
      setIsCustomJD(false);
      const found = internships.find((i) => i.id === id);
      if (found) {
        setCustomJobTitle(found.title);
        setCustomCompanyName(found.companyName);
        setCustomJobDescription(
          `${found.title} at ${found.companyName}.\nCategory: ${found.category}\nRequired Skills: ${found.requiredSkills.join(', ')}\n${found.description}\nResponsibilities:\n${found.responsibilities.join('\n')}`
        );
      }
    }
  };

  // Generate Mock Questions with AI
  const handleStartInterview = async () => {
    if (!customJobDescription.trim()) return;
    setGeneratingQuestions(true);
    setQuestions([]);
    setCurrentIndex(0);
    setFeedbackMap({});
    setStudentAnswer('');

    try {
      const res = await api.generateMockInterviewQuestions({
        jobTitle: customJobTitle,
        companyName: customCompanyName,
        jobDescription: customJobDescription,
        roundType,
        studentId: studentProfile?.id,
      });

      if (res.success && res.data.length > 0) {
        setQuestions(res.data);
        setSessionActive(true);
        // Automatically speak the first question to immerse candidate
        speakText(res.data[0].question);
      }
    } catch (err) {
      console.error('Failed to generate mock questions:', err);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice-To-Text (Speech Recognition)
  const startRecording = () => {
    stopSpeechSynthesis();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please type your answer directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setMicPermissionDenied(false);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const newText = finalTranscript || interimTranscript;
        if (newText) {
          setStudentAnswer((prev) => {
            // If starting fresh or appending
            return finalTranscript ? (prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()) : prev;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Mic start error:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Submit answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim() || evaluating) return;
    stopRecording();
    stopSpeechSynthesis();
    setEvaluating(true);

    const currentQuestion = questions[currentIndex];
    try {
      const res = await api.evaluateInterviewAnswer({
        question: currentQuestion,
        studentAnswer,
        jobDescription: customJobDescription,
        studentId: studentProfile?.id,
      });

      if (res.success && res.data) {
        setFeedbackMap((prev) => ({
          ...prev,
          [currentQuestion.id]: res.data,
        }));
        // Read out the recruiter critique
        if (res.data.overallVerbalCritique) {
          speakText(res.data.overallVerbalCritique);
        }
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentFeedback = currentQ ? feedbackMap[currentQ.id] : null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Average score calculator
  const answeredCount = Object.keys(feedbackMap).length;
  const avgScore =
    answeredCount > 0
      ? Math.round(
          Object.values(feedbackMap).reduce((acc, curr) => acc + curr.score, 0) / answeredCount
        )
      : 0;

  return (
    <div id="interview-prep-studio" className="w-full flex flex-col space-y-6">
      {/* Top Banner / Breadcrumb */}
      {!sessionActive ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/10 via-pink-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">AI Job-Specific Mock Interview Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Voice-To-Text AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Gemini 3.7 parses company job descriptions to generate probing technical & behavioral questions, scoring your verbal answers in real time.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-slate-800/80">
            {/* Choose Target Internship or Custom */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Select Target Opportunity
              </label>
              <select
                id="interview-opportunity-select"
                value={isCustomJD ? 'custom' : selectedInternshipId}
                onChange={(e) => handleInternshipSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 transition"
              >
                {internships.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.companyName} - {intern.title} ({intern.category})
                  </option>
                ))}
                <option value="custom">✨ Enter Custom Company & Job Description</option>
              </select>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Interview Round Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Mixed', 'Technical', 'Behavioral', 'System Design'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRoundType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition text-left flex items-center justify-between ${
                        roundType === type
                          ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>{type}</span>
                      {roundType === type && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Details & Job Description */}
            <div className="space-y-3 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name</label>
                  <input
                    id="interview-company-input"
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    placeholder="e.g. Google Cloud, Stripe, Microsoft"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Role Title</label>
                  <input
                    id="interview-role-input"
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="e.g. AI / Full Stack Engineer Intern"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Job Description & Role Requirements (Analyzed by AI)
                  </label>
                  <span className="text-[11px] text-slate-500">{customJobDescription.length} characters</span>
                </div>
                <textarea
                  id="interview-jd-textarea"
                  rows={4}
                  value={customJobDescription}
                  onChange={(e) => setCustomJobDescription(e.target.value)}
                  placeholder="Paste the full job posting requirements, tech stack, and responsibilities here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Microphone enabled for live voice answer speech-to-text</span>
                </div>

                <button
                  id="start-mock-interview-btn"
                  onClick={handleStartInterview}
                  disabled={generatingQuestions || !customJobDescription.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  {generatingQuestions ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Custom Mock Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Mock Interview</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview Simulator Screen */
        <div className="space-y-6">
          {/* Header Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{customCompanyName}</h3>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-purple-300">{customJobTitle}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    Round: {roundType}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Step Pills */}
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const hasFeedback = !!feedbackMap[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      stopRecording();
                      stopSpeechSynthesis();
                      setCurrentIndex(idx);
                      setStudentAnswer('');
                      setShowHint(false);
                      setShowIdealAnswer(false);
                      speakText(questions[idx].question);
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      currentIndex === idx
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                        : hasFeedback
                        ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {hasFeedback ? <Check className="w-4 h-4" /> : idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopRecording();
                  stopSpeechSynthesis();
                  setSessionActive(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Change Role / JD
              </button>
            </div>
          </div>

          {/* Current Question Stage Card */}
          {currentQ && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                    {currentQ.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>

                {/* Question Audio Speaker */}
                <button
                  id="speak-question-btn"
                  onClick={() => (isSpeaking ? stopSpeechSynthesis() : speakText(currentQ.question))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                    isSpeaking
                      ? 'bg-purple-600 text-white border-purple-500 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Read question aloud"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{isSpeaking ? 'Pause Audio' : 'Hear Recruiter'}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-3">
                "{currentQ.question}"
              </h2>

              {/* Recruiter Context */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-6 text-xs text-slate-400 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Why the recruiter asks this: </span>
                  <span>{currentQ.context}</span>
                </div>
              </div>

              {/* Evaluation Criteria Tags */}
              <div className="mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Key Evaluation Criteria to Hit:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentQ.expectedCriteria.map((crit, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {crit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Need a Hint Accordion */}
              <div className="mb-6">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                >
                  <span>{showHint ? 'Hide Strategy Hint' : '💡 Need a Hint / Structure Guide?'}</span>
                  {showHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showHint && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                    <p className="font-medium">{currentQ.sampleHint}</p>
                  </div>
                )}
              </div>

              {/* Answer Input Section (Voice-To-Text + Textarea) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>Your Answer (Spoken or Written)</span>
                    {isRecording && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold animate-pulse border border-red-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        RECORDING ({formatTime(recordingSeconds)})
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2">
                    {/* Voice-to-Text Button */}
                    <button
                      id="voice-recording-toggle-btn"
                      onClick={toggleRecording}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/20'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecording ? 'Stop Recording' : '🎙️ Record Voice Answer'}</span>
                    </button>

                    {studentAnswer && (
                      <button
                        onClick={() => setStudentAnswer('')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
                        title="Clear answer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Speech recognition helper banner if denied */}
                {micPermissionDenied && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Microphone access was blocked. You can still type your full answer in the box below!</span>
                  </div>
                )}

                {/* Animated Voice Waveform when recording */}
                {isRecording && (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-center gap-1.5">
                    <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-1 h-8 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-12 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <div className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-1 h-10 bg-purple-400 rounded-full animate-bounce [animation-delay:0.25s]" />
                    <span className="text-xs font-semibold text-purple-300 ml-3">
                      Listening... Speak clearly into your mic. Your speech is transcribing in real time.
                    </span>
                  </div>
                )}

                {/* Transcribed text area */}
                <textarea
                  id="interview-student-answer-box"
                  rows={5}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Click 'Record Voice Answer' to speak, or type your structured response here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {studentAnswer.trim() ? `${studentAnswer.trim().split(/\s+/).length} words` : '0 words'}
                  </span>

                  <button
                    id="submit-interview-answer-btn"
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !studentAnswer.trim()}
                    className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>AI Evaluator Analyzing Response...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit for Instant AI Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Feedback Breakdown Display */}
              {currentFeedback && (
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
                  {/* Score Ribbon */}
                  <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex flex-col items-center justify-center text-white shadow-xl shadow-purple-600/30">
                          <span className="text-2xl font-extrabold leading-none">{currentFeedback.score}</span>
                          <span className="text-[9px] uppercase font-bold text-purple-200 tracking-wider">/ 100</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">
                              {currentFeedback.score >= 85
                                ? '🏆 Excellent Candidate Response'
                                : currentFeedback.score >= 70
                                ? '👍 Strong Foundation & Good Effort'
                                : '📈 Needs Further Practice'}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400">
                            Evaluated against {customCompanyName}'s {customJobTitle} requirements
                          </p>
                        </div>
                      </div>

                      {/* Sub Scores */}
                      <div className="flex items-center gap-4">
                        <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-xs font-bold text-indigo-400">{currentFeedback.clarityScore}%</div>
                          <div className="text-[10px] text-slate-400">Clarity & STAR</div>
                        </div>
                        <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="text-xs font-bold text-emerald-400">{currentFeedback.technicalDepthScore}%</div>
                          <div className="text-[10px] text-slate-400">Tech Depth</div>
                        </div>
                      </div>
                    </div>

                    {/* Spoken Verbal Critique Card */}
                    <div className="mt-4 pt-4 border-t border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-900/20 p-3.5 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-purple-200 italic leading-relaxed">
                          "{currentFeedback.overallVerbalCritique}"
                        </p>
                      </div>

                      <button
                        onClick={() => speakText(currentFeedback.overallVerbalCritique)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition flex items-center gap-1 flex-shrink-0"
                      >
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    </div>
                  </div>

                  {/* Strengths & Improvements Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-4">
                      <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
                        <CheckCircle2 className="w-4 h-4" /> What You Did Well
                      </h5>
                      <ul className="space-y-2">
                        {currentFeedback.strengths.map((s, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-4">
                      <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-3">
                        <AlertCircle className="w-4 h-4" /> Recommendations for Top Tier Score
                      </h5>
                      <ul className="space-y-2">
                        {currentFeedback.improvements.map((imp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Model Answer Snippet Accordion */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <button
                      onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Exemplary Model Response Outline
                      </span>
                      {showIdealAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showIdealAnswer && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <p className="mb-2 text-slate-400">
                          Here is how a lead engineer would structure this response concisely:
                        </p>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300">
                          {currentFeedback.modelAnswerSnippet}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up question trigger */}
                  {currentFeedback.followUpQuestion && (
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                          Likely Follow-Up Question from Recruiter:
                        </span>
                        <p className="text-xs font-semibold text-white">"{currentFeedback.followUpQuestion}"</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        if (currentIndex > 0) {
                          stopRecording();
                          stopSpeechSynthesis();
                          setCurrentIndex((prev) => prev - 1);
                          setStudentAnswer('');
                          setShowHint(false);
                          setShowIdealAnswer(false);
                          speakText(questions[currentIndex - 1].question);
                        }
                      }}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => {
                          stopRecording();
                          stopSpeechSynthesis();
                          setCurrentIndex((prev) => prev + 1);
                          setStudentAnswer('');
                          setShowHint(false);
                          setShowIdealAnswer(false);
                          speakText(questions[currentIndex + 1].question);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> All Questions Completed!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
