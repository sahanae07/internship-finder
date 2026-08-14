import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { DemoTourBar } from './components/common/DemoTourBar';
import { InternshipDetailModal } from './components/common/InternshipDetailModal';
import { MatchModal } from './components/common/MatchModal';
import { MatchExplanationModal } from './components/common/MatchExplanationModal';

// Pages
import { StudentSwipePage } from './pages/StudentSwipePage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { CareerAssistantPage } from './pages/CareerAssistantPage';
import { MatchesAndChatPage } from './pages/MatchesAndChatPage';
import { StudentApplicationsPage } from './pages/StudentApplicationsPage';
import { StudentSavedPage } from './pages/StudentSavedPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { CompanyDashboardPage } from './pages/CompanyDashboardPage';
import { CompanyCandidateSwipePage } from './pages/CompanyCandidateSwipePage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { AdminPortalPage } from './pages/AdminPortalPage';

import { Internship, Match } from './types';

const MainApp: React.FC = () => {
  const { role, studentProfile, newMatchModalData, triggerMatchModal } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>('swipe');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [explanationInternship, setExplanationInternship] = useState<Internship | null>(null);
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);

  // Synchronize default landing page when role switches
  React.useEffect(() => {
    if (role === 'STUDENT') {
      if (currentPage.startsWith('company') || currentPage.startsWith('admin')) {
        setCurrentPage('swipe');
      }
    } else if (role === 'COMPANY') {
      if (currentPage === 'swipe' || currentPage === 'career-coach' || currentPage === 'resume-analyzer') {
        setCurrentPage('company-dashboard');
      }
    } else if (role === 'ADMIN') {
      setCurrentPage('admin');
    }
  }, [role]);

  const handleNavigate = (page: string, extraData?: { matchId?: string }) => {
    setCurrentPage(page);
    if (extraData?.matchId) {
      setActiveChatMatchId(extraData.matchId);
    }
  };

  const handleStartChatFromMatch = (matchId: string) => {
    triggerMatchModal(null);
    setActiveChatMatchId(matchId);
    setCurrentPage('messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white pb-16 md:pb-0">
      {/* Top Interactive Demo Persona Switcher */}
      <DemoTourBar onNavigate={handleNavigate} />

      {/* Main App Navigation Bar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page Router */}
      <main className="flex-1">
        {/* STUDENT VIEWS */}
        {role === 'STUDENT' && (
          <>
            {currentPage === 'swipe' && (
              <StudentSwipePage
                onOpenDetails={(internship) => setSelectedInternship(internship)}
                onOpenMatchExplanation={(internship) => setExplanationInternship(internship)}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'student-dashboard' && (
              <StudentDashboard
                onOpenDetails={(internship) => setSelectedInternship(internship)}
                onOpenMatchExplanation={(internship) => setExplanationInternship(internship)}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'resume-analyzer' && (
              <ResumeAnalyzerPage
                onOpenDetails={(internship) => setSelectedInternship(internship)}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'career-coach' && <CareerAssistantPage />}

            {currentPage === 'messages' && (
              <MatchesAndChatPage
                initialMatchId={activeChatMatchId}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'applications' && (
              <StudentApplicationsPage
                onOpenDetails={(internship) => setSelectedInternship(internship)}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'saved' && (
              <StudentSavedPage
                onOpenDetails={(internship) => setSelectedInternship(internship)}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'profile' && <StudentProfilePage onNavigate={handleNavigate} />}
          </>
        )}

        {/* COMPANY VIEWS */}
        {role === 'COMPANY' && (
          <>
            {currentPage === 'company-dashboard' && (
              <CompanyDashboardPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'company-swipe' && (
              <CompanyCandidateSwipePage onNavigate={handleNavigate} />
            )}

            {currentPage === 'messages' && (
              <MatchesAndChatPage
                initialMatchId={activeChatMatchId}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'company-profile' && <CompanyProfilePage />}
          </>
        )}

        {/* ADMIN VIEWS */}
        {role === 'ADMIN' && (
          <>
            {(currentPage === 'admin' || currentPage === 'admin-verifications') && (
              <AdminPortalPage />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}

      {/* 1. Internship Details & 1-Click Apply Modal */}
      {selectedInternship && (
        <InternshipDetailModal
          internship={selectedInternship}
          student={studentProfile}
          onClose={() => setSelectedInternship(null)}
          onOpenMatchExplanation={(internship) => {
            setSelectedInternship(null);
            setExplanationInternship(internship);
          }}
          onApplySuccess={() => {
            // Can show toast or trigger navigation
          }}
        />
      )}

      {/* 2. AI Match Compatibility Breakdown Modal */}
      {explanationInternship && (
        <MatchExplanationModal
          internship={explanationInternship}
          student={studentProfile}
          onClose={() => setExplanationInternship(null)}
        />
      )}

      {/* 3. Celebratory It's a Match! Modal with Confetti */}
      {newMatchModalData && (
        <MatchModal
          match={newMatchModalData}
          onClose={() => triggerMatchModal(null)}
          onStartChat={handleStartChatFromMatch}
        />
      )}

      {/* Bottom Navigation for Mobile Devices */}
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
