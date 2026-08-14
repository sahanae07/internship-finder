import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Sparkles,
  MessageSquare,
  FileText,
  Briefcase,
  Bookmark,
  Bell,
  Bot,
  User,
  LogOut,
  Building2,
  Shield,
  CheckCheck,
  PlusCircle,
  Menu,
  X,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const {
    user,
    role,
    logout,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    studentProfile,
    companyProfile,
  } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const studentNavItems: NavItem[] = [
    { id: 'swipe', label: 'Discover', icon: Compass },
    { id: 'messages', label: 'Matches & Chat', icon: MessageSquare },
    { id: 'resume-analyzer', label: 'AI Resume ATS', icon: FileText, highlight: true },
    { id: 'career-coach', label: 'InternAI Coach', icon: Bot },
    { id: 'applications', label: 'My Applications', icon: Briefcase },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  const companyNavItems: NavItem[] = [
    { id: 'company-swipe', label: 'Talent Swipe', icon: Compass },
    { id: 'company-dashboard', label: 'Postings & Applicants', icon: Briefcase },
    { id: 'messages', label: 'Candidate Chats', icon: MessageSquare },
    { id: 'company-profile', label: 'Company Profile', icon: Building2 },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', label: 'Admin Dashboard', icon: Shield },
    { id: 'admin-verifications', label: 'Company Verifications', icon: CheckCheck },
  ];

  const currentNavItems =
    role === 'STUDENT' ? studentNavItems : role === 'COMPANY' ? companyNavItems : adminNavItems;

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => onNavigate(role === 'STUDENT' ? 'swipe' : role === 'COMPANY' ? 'company-dashboard' : 'admin')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition">
              <Flame className="w-6 h-6 fill-white stroke-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">Intern<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Swipe</span></span>
              </div>
              <div className="text-[10px] text-purple-300 font-semibold tracking-wider uppercase -mt-1">
                AI Virtual Matching
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  } ${item.highlight ? 'relative' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="px-1.5 py-0.2 rounded-full bg-pink-600 text-white text-[9px] font-bold uppercase tracking-wider ml-0.5 animate-pulse">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Post Job Quick CTA for Recruiters */}
            {role === 'COMPANY' && (
              <button
                id="header-post-job-btn"
                onClick={() => onNavigate('company-dashboard')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> Post Internship
              </button>
            )}

            {/* Notifications Bell Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                aria-label="Open notifications"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 relative transition"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showNotifMenu && (
                <div
                  id="notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <span className="font-bold text-white text-sm">Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        id="mark-all-read-btn"
                        onClick={markAllNotificationsRead}
                        className="text-purple-400 hover:text-purple-300 text-[11px] font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) onNavigate(n.link);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            n.isRead
                              ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                              : 'bg-purple-950/30 border-purple-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-white text-xs">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Role Menu */}
            <div ref={profileRef} className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-500/40 bg-purple-900">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[100px]">{user?.name || 'Aarav'}</div>
                  <div className="text-[10px] font-semibold text-purple-400 uppercase">{role}</div>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div
                  id="profile-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 text-xs z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="font-bold text-white">{user?.name}</div>
                    <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  </div>

                  <button
                    id="menu-profile-link-btn"
                    onClick={() => {
                      onNavigate(role === 'STUDENT' ? 'profile' : 'company-profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Edit Profile
                  </button>

                  <button
                    id="menu-resume-link-btn"
                    onClick={() => {
                      onNavigate('resume-analyzer');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <FileText className="w-4 h-4 text-purple-400" /> AI Resume ATS
                  </button>

                  <button
                    id="menu-logout-btn"
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      onNavigate('landing');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1 text-sm animate-in slide-in-from-top-2">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 transition text-left ${
                  isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
