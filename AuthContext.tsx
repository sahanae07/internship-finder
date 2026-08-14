import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, StudentProfile, CompanyProfile, Notification, Match } from '../types';
import { api } from '../services/api';

interface UserSession {
  id: string;
  profileId: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextType {
  user: UserSession | null;
  studentProfile: StudentProfile | null;
  companyProfile: CompanyProfile | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: Notification[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  newMatchModalData: Match | null;
  login: (email: string, role?: Role, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: Role, demoId?: string) => Promise<void>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  triggerMatchModal: (match: Match | null) => void;
  resetPlatformDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [role, setRole] = useState<Role>('STUDENT');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(1);
  const [newMatchModalData, setNewMatchModalData] = useState<Match | null>(null);

  // Initialize with Student Demo Account on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedRole = (localStorage.getItem('internswipe_role') as Role) || 'STUDENT';
        await switchRole(savedRole);
      } catch (err) {
        console.error('Failed to init auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUserData = async (currentRole: Role, profileId: string) => {
    try {
      if (currentRole === 'STUDENT') {
        const res = await api.getStudent(profileId || 'student-1');
        if (res.success && res.data) {
          setStudentProfile(res.data);
          setCompanyProfile(null);
        }
      } else if (currentRole === 'COMPANY') {
        const res = await api.getCompany(profileId || 'comp-1');
        if (res.success && res.data) {
          setCompanyProfile(res.data);
          setStudentProfile(null);
        }
      }
      // Fetch notifications
      const notifsRes = await api.getNotifications(user?.id || (currentRole === 'STUDENT' ? 'user-student-1' : 'user-comp-1'));
      if (notifsRes.success) {
        setNotifications(notifsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const login = async (email: string, loginRole: Role = 'STUDENT', password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, loginRole, password);
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.user.role);
        localStorage.setItem('internswipe_role', res.user.role);
        if (res.user.role === 'STUDENT') {
          setStudentProfile(res.profile);
        } else if (res.user.role === 'COMPANY') {
          setCompanyProfile(res.profile);
        }
        await refreshNotifications();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    setCompanyProfile(null);
    setRole('STUDENT');
    localStorage.removeItem('internswipe_role');
  };

  const switchRole = async (newRole: Role, demoId?: string) => {
    setIsLoading(true);
    setRole(newRole);
    localStorage.setItem('internswipe_role', newRole);

    try {
      if (newRole === 'STUDENT') {
        const studentRes = await api.getStudent(demoId || 'student-1');
        const st = studentRes.data;
        if (st) {
          setUser({
            id: st.userId,
            profileId: st.id,
            name: st.name,
            email: st.email,
            role: 'STUDENT',
            avatar: st.avatar,
          });
          setStudentProfile(st);
          setCompanyProfile(null);
        }
      } else if (newRole === 'COMPANY') {
        const compRes = await api.getCompany(demoId || 'comp-1');
        const comp = compRes.data;
        if (comp) {
          setUser({
            id: comp.userId,
            profileId: comp.id,
            name: comp.companyName,
            email: 'recruiter@google.com',
            role: 'COMPANY',
            avatar: comp.logo,
          });
          setCompanyProfile(comp);
          setStudentProfile(null);
        }
      } else if (newRole === 'ADMIN') {
        setUser({
          id: 'user-admin',
          profileId: 'admin-1',
          name: 'Platform Administrator',
          email: 'admin@internswipe.demo',
          role: 'ADMIN',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        });
        setStudentProfile(null);
        setCompanyProfile(null);
      }
      await refreshNotifications();
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!studentProfile) return;
    try {
      const res = await api.updateStudent(studentProfile.id, updates);
      if (res.success) {
        setStudentProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to update student profile:', err);
    }
  };

  const updateCompanyProfile = async (updates: Partial<CompanyProfile>) => {
    if (!companyProfile) return;
    try {
      const res = await api.updateCompany(companyProfile.id, updates);
      if (res.success) {
        setCompanyProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to update company profile:', err);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications(user.id);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notif read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    try {
      await api.markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifs read:', err);
    }
  };

  const resetPlatformDemo = async () => {
    try {
      await api.resetDemoData();
      await switchRole('STUDENT');
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        companyProfile,
        role,
        isAuthenticated: !!user,
        isLoading,
        notifications,
        unreadNotificationCount,
        unreadMessageCount,
        newMatchModalData,
        login,
        logout,
        switchRole,
        updateStudentProfile,
        updateCompanyProfile,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        triggerMatchModal: setNewMatchModalData,
        resetPlatformDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
