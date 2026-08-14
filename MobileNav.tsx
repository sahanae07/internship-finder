import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Compass, MessageSquare, FileText, Bot, Briefcase, User, Building2 } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const { role } = useAuth();

  if (role === 'ADMIN') return null;

  const studentItems = [
    { id: 'swipe', label: 'Discover', icon: Compass },
    { id: 'messages', label: 'Matches', icon: MessageSquare },
    { id: 'resume-analyzer', label: 'ATS Resume', icon: FileText },
    { id: 'career-coach', label: 'InternAI', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const companyItems = [
    { id: 'company-swipe', label: 'Swipe Talent', icon: Compass },
    { id: 'company-dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'messages', label: 'Chats', icon: MessageSquare },
    { id: 'company-profile', label: 'Profile', icon: Building2 },
  ];

  const items = role === 'STUDENT' ? studentItems : companyItems;

  return (
    <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-tab-${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
