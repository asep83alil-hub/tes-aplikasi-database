import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, 
  Calendar, 
  ClipboardCheck, 
  CreditCard, 
  CheckCheck, 
  X, 
  ChevronRight,
  Clock,
  MessageSquareHeart,
  Megaphone,
  UserPlus,
  Briefcase,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Target,
  ArrowRight,
  Plus,
  Send,
  Users,
  UserCheck,
  Sparkles,
  Trash2,
  ArrowLeft,
  Radio,
  Share2
} from 'lucide-react';
import { View, UserRole } from '../types';
import { 
  AppNotification, 
  NotificationCategory, 
  getStoredNotifications, 
  saveStoredNotifications, 
  filterNotificationsForUser,
  sanitizeNotification,
  createAnnouncementNotification,
  deleteStoredNotification
} from '../utils/notificationStorage';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  userRole?: UserRole;
  currentStudentId?: string;
  currentStudentName?: string;
  currentUserName?: string;
  onUnreadCountChange?: (count: number) => void;
  allChildren?: any[];
  allTherapists?: any[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  userRole = 'admin',
  currentStudentId = 'C-ADRIEL',
  currentStudentName = 'Adriel Djulian Putra Aditya',
  currentUserName = 'Admin Klinik',
  onUnreadCountChange,
  allChildren = [],
  allTherapists = []
}) => {
  // Navigation / View state inside modal
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');

  // Selected Notification for Detail Modal
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  // Announcement Creator Form State
  const [targetAudience, setTargetAudience] = useState<
    'all' | 'all_students' | 'specific_student' | 'all_therapists' | 'specific_therapist' | 'management'
  >('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [announcementCategory, setAnnouncementCategory] = useState<NotificationCategory>('pengumuman');
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementDesc, setAnnouncementDesc] = useState<string>('');
  const [targetView, setTargetView] = useState<View>('dashboard');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Safe string coercion for student name and id
  const safeStudentName = String(currentStudentName || 'Adriel Djulian Putra Aditya').trim();
  const safeStudentFirstName = safeStudentName.split(/\s+/)[0] || 'Adriel';
  const safeStudentId = String(currentStudentId || 'C-ADRIEL').trim();
  const isStudentRole = userRole === 'siswa' || userRole === 'orang_tua';
  const canCreateAnnouncement = userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin';

  // Resolved lists of children and therapists with safe fallback
  const studentList = useMemo(() => {
    if (Array.isArray(allChildren) && allChildren.length > 0) {
      return allChildren;
    }
    try {
      const stored = localStorage.getItem('pelangi360_children');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { id: 'C-ADRIEL', name: 'Adriel Djulian Putra Aditya', parentName: 'Aditya' },
      { id: 'C102', name: 'Bagas Pratama', parentName: 'Hendro' },
      { id: 'C103', name: 'Cantika Dewi', parentName: 'Dewi' },
      { id: 'C104', name: 'Davin Alamsyah', parentName: 'Bambang' },
      { id: 'C105', name: 'Elvano Rizky', parentName: 'Rizky' }
    ];
  }, [allChildren]);

  const therapistList = useMemo(() => {
    if (Array.isArray(allTherapists) && allTherapists.length > 0) {
      return allTherapists;
    }
    try {
      const stored = localStorage.getItem('allTherapists');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { id: 'T-RILLA', name: 'Rilla Serando, S.Tr.Kes', specialties: ['OT'] },
      { id: 'T-ADISTY', name: 'Adisty Ayuningtyas, A.Md.TW', specialties: ['TW'] },
      { id: 'T-LINA', name: 'Lina Marlina, S.Psi', specialties: ['SI'] },
      { id: 'T-DIMAS', name: 'Dimas Satria, S.FT', specialties: ['FT'] }
    ];
  }, [allTherapists]);

  // Set default student if empty
  useEffect(() => {
    if (!selectedStudentId && studentList.length > 0) {
      setSelectedStudentId(studentList[0].id);
    }
  }, [studentList, selectedStudentId]);

  // Set default therapist if empty
  useEffect(() => {
    if (!selectedTherapistId && therapistList.length > 0) {
      setSelectedTherapistId(therapistList[0].id);
    }
  }, [therapistList, selectedTherapistId]);

  // Load and refresh notifications safely
  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    try {
      const timer = setTimeout(() => {
        try {
          const raw = getStoredNotifications();
          const safeData = Array.isArray(raw) 
            ? raw.map(sanitizeNotification).filter((n): n is AppNotification => n !== null) 
            : [];
          setNotifications(safeData);
          setIsLoading(false);
        } catch (err) {
          console.error("Error reading notifications:", err);
          setHasError(true);
          setIsLoading(false);
        }
      }, 50);

      return () => clearTimeout(timer);
    } catch (e) {
      console.error("Fatal error loading notifications:", e);
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  // Initial and on-open effect
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Reload when opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      setViewMode('list');
      setFormError(null);
      setFormSuccess(null);
    }
  }, [isOpen, loadNotifications]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedNotification) {
          setSelectedNotification(null);
        } else if (viewMode === 'create') {
          setViewMode('list');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedNotification, viewMode, onClose]);

  // Filter based on user role and student identity (bulletproof null-safe)
  const userNotifications = useMemo<AppNotification[]>(() => {
    try {
      const rawList = Array.isArray(notifications) ? notifications : [];
      const filtered = filterNotificationsForUser(
        rawList,
        userRole,
        safeStudentId,
        safeStudentName
      );
      return Array.isArray(filtered) ? filtered : [];
    } catch (e) {
      console.error("Error filtering notifications:", e);
      return [];
    }
  }, [notifications, userRole, safeStudentId, safeStudentName]);

  // Calculate unread count strictly for this user's view
  const unreadCount = useMemo(() => {
    return userNotifications.filter(item => item && !item.isRead).length;
  }, [userNotifications]);

  // Synchronize unread count upward
  useEffect(() => {
    if (typeof onUnreadCountChange === 'function') {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Final Filter by Active Category & Read Status
  const displayedNotifications = useMemo(() => {
    return userNotifications.filter((item) => {
      if (!item) return false;
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (filterReadStatus === 'unread' && item.isRead) {
        return false;
      }
      if (filterReadStatus === 'read' && !item.isRead) {
        return false;
      }
      return true;
    });
  }, [userNotifications, activeCategory, filterReadStatus]);

  // Mark all as read
  const handleMarkAllAsRead = () => {
    try {
      const updated = notifications.map(item => {
        if (!item) return item;
        const belongsToUser = userNotifications.some(u => u && u.id === item.id);
        if (belongsToUser) {
          return { ...item, isRead: true };
        }
        return item;
      });
      setNotifications(updated);
      saveStoredNotifications(updated);
      if (typeof onUnreadCountChange === 'function') {
        onUnreadCountChange(0);
      }
    } catch (e) {
      console.error("Error marking all as read:", e);
    }
  };

  // Mark single item as read and open detail popup
  const handleItemClick = (item: AppNotification) => {
    if (!item) return;
    try {
      if (!item.isRead) {
        const updated = notifications.map(n => (n && n.id === item.id ? { ...n, isRead: true } : n));
        setNotifications(updated);
        saveStoredNotifications(updated);
      }
      setSelectedNotification(item);
    } catch (e) {
      console.error("Error handling notification click:", e);
    }
  };

  // Navigate to target view from detail modal
  const handleNavigateFromDetail = (item: AppNotification) => {
    if (!item) return;
    try {
      setSelectedNotification(null);
      onClose();

      let target: View = item.targetView || 'dashboard';
      if (item.category === 'assessment') {
        target = 'laporanAssesment';
      } else if (item.category === 'program') {
        target = 'programTerapi';
      } else if (item.category === 'catatan') {
        target = 'bukuCatatanTerapi';
      } else if (item.category === 'keuangan') {
        target = 'tagihan';
      } else if (item.category === 'terapi' || item.category === 'kehadiran') {
        target = 'papanJadwal';
      } else if (item.category === 'pengumuman') {
        target = 'dashboard';
      }

      if (typeof onNavigate === 'function') {
        onNavigate(target);
      }
    } catch (e) {
      console.error("Error navigating from notification:", e);
    }
  };

  // Delete notification (Admin & Manager)
  const handleDeleteNotification = (notificationId: string) => {
    if (!notificationId) return;
    try {
      deleteStoredNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Apply Quick Preset to Announcement Form
  const applyQuickPreset = (preset: {
    title: string;
    description: string;
    category: NotificationCategory;
    targetAudience: 'all' | 'all_students' | 'specific_student' | 'all_therapists' | 'specific_therapist' | 'management';
    targetView: View;
  }) => {
    setAnnouncementTitle(preset.title);
    setAnnouncementDesc(preset.description);
    setAnnouncementCategory(preset.category);
    setTargetAudience(preset.targetAudience);
    setTargetView(preset.targetView);
    setFormError(null);
  };

  // Handle Submit Announcement
  const handleSubmitAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const title = announcementTitle.trim();
    const desc = announcementDesc.trim();

    if (!title) {
      setFormError('Mohon masukkan judul pengumuman.');
      return;
    }

    if (!desc) {
      setFormError('Mohon isi pesan atau keterangan pengumuman.');
      return;
    }

    let targetStudentName: string | undefined = undefined;
    if (targetAudience === 'specific_student') {
      if (!selectedStudentId) {
        setFormError('Mohon pilih siswa yang dituju.');
        return;
      }
      const foundStudent = studentList.find(s => s.id === selectedStudentId);
      targetStudentName = foundStudent?.name || selectedStudentId;
    }

    let targetTherapistName: string | undefined = undefined;
    if (targetAudience === 'specific_therapist') {
      if (!selectedTherapistId) {
        setFormError('Mohon pilih terapis yang dituju.');
        return;
      }
      const foundTherapist = therapistList.find(t => t.id === selectedTherapistId);
      targetTherapistName = foundTherapist?.name || selectedTherapistId;
    }

    setIsSubmitting(true);

    try {
      const created = createAnnouncementNotification({
        title,
        description: desc,
        category: announcementCategory,
        targetAudience,
        targetStudentId: targetAudience === 'specific_student' ? selectedStudentId : undefined,
        targetStudentName,
        targetTherapistId: targetAudience === 'specific_therapist' ? selectedTherapistId : undefined,
        targetTherapistName,
        targetView,
        senderName: currentUserName || 'Admin Pelangi 360',
        senderRole: userRole || 'admin'
      });

      // Reload notifications in modal
      const raw = getStoredNotifications();
      setNotifications(raw);

      // Determine friendly target text for feedback
      let targetLabel = 'Semua Pengguna';
      if (targetAudience === 'all_students') targetLabel = 'Seluruh Siswa & Orang Tua';
      else if (targetAudience === 'specific_student') targetLabel = `Ananda ${targetStudentName || selectedStudentId}`;
      else if (targetAudience === 'all_therapists') targetLabel = 'Seluruh Tim Terapis';
      else if (targetAudience === 'specific_therapist') targetLabel = `Terapis ${targetTherapistName || selectedTherapistId}`;
      else if (targetAudience === 'management') targetLabel = 'Internal Manajemen Saja';

      setFormSuccess(`Pengumuman berhasil diterbitkan kepada: ${targetLabel}!`);
      setIsSubmitting(false);

      // Reset form after short delay and switch back to list
      setTimeout(() => {
        setAnnouncementTitle('');
        setAnnouncementDesc('');
        setFormSuccess(null);
        setViewMode('list');
      }, 1200);

    } catch (err) {
      console.error("Error creating announcement:", err);
      setFormError('Gagal menerbitkan pengumuman. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (category?: NotificationCategory) => {
    switch (category) {
      case 'pengumuman':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      case 'terapi':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'kehadiran':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'catatan':
        return <MessageSquareHeart className="w-4 h-4 text-teal-400" />;
      case 'program':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'assessment':
        return <ClipboardCheck className="w-4 h-4 text-indigo-400" />;
      case 'keuangan':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'sdm':
        return <Briefcase className="w-4 h-4 text-rose-400" />;
      case 'registrasi':
        return <UserPlus className="w-4 h-4 text-sky-400" />;
      case 'operasional':
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category?: NotificationCategory) => {
    switch (category) {
      case 'pengumuman':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'terapi':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'kehadiran':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'catatan':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'program':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'assessment':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'keuangan':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'sdm':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'registrasi':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'operasional':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryLabel = (category?: NotificationCategory) => {
    switch (category) {
      case 'pengumuman': return 'Pengumuman';
      case 'terapi': return 'Jadwal Terapi';
      case 'kehadiran': return 'Kehadiran';
      case 'catatan': return 'Catatan Terapi';
      case 'program': return 'Program Terapi';
      case 'assessment': return 'Assessment';
      case 'keuangan': return 'Tagihan & Keuangan';
      case 'sdm': return 'SDM';
      case 'registrasi': return 'Registrasi';
      case 'operasional': return 'Operasional';
      default: return 'Pemberitahuan';
    }
  };

  // Helper for delivery target label badge
  const renderDeliveryBadge = (item: AppNotification) => {
    if (!item.targetAudience && !item.isAnnouncement && !item.studentId) return null;

    if (item.targetAudience === 'all' || item.isAnnouncement) {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Megaphone className="w-2.5 h-2.5 text-amber-400" />
          Semua Pengguna
        </span>
      );
    }
    if (item.targetAudience === 'all_students') {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
          <Users className="w-2.5 h-2.5 text-teal-400" />
          Seluruh Siswa
        </span>
      );
    }
    if (item.targetAudience === 'specific_student' || item.studentId) {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
          <UserCheck className="w-2.5 h-2.5 text-blue-400" />
          Khusus: {item.studentName?.split(' ')[0] || item.studentId}
        </span>
      );
    }
    if (item.targetAudience === 'all_therapists') {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
          <Briefcase className="w-2.5 h-2.5 text-purple-400" />
          Seluruh Terapis
        </span>
      );
    }
    if (item.targetAudience === 'specific_therapist') {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <Briefcase className="w-2.5 h-2.5 text-rose-400" />
          Khusus: {item.therapistName?.split(' ')[0] || 'Terapis'}
        </span>
      );
    }
    if (item.targetAudience === 'management') {
      return (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1">
          <Shield className="w-2.5 h-2.5 text-slate-400" />
          Manajemen
        </span>
      );
    }
    return null;
  };

  // Category Tabs tailored specifically for Student & Parent role
  const availableTabs = useMemo(() => {
    if (isStudentRole) {
      return [
        { id: 'all', label: 'Semua' },
        { id: 'pengumuman', label: '📢 Pengumuman' },
        { id: 'terapi', label: '📅 Jadwal' },
        { id: 'kehadiran', label: '⏱️ Kehadiran' },
        { id: 'catatan', label: '💬 Catatan' },
        { id: 'program', label: '🎯 Program' },
        { id: 'assessment', label: '📋 Assessment' },
        { id: 'keuangan', label: '💳 Tagihan' },
      ];
    }

    return [
      { id: 'all', label: 'Semua' },
      { id: 'pengumuman', label: '📢 Pengumuman' },
      { id: 'terapi', label: '📅 Jadwal' },
      { id: 'kehadiran', label: '⏱️ Kehadiran' },
      { id: 'catatan', label: '💬 Catatan' },
      { id: 'program', label: '🎯 Program' },
      { id: 'assessment', label: '📋 Assessment' },
      { id: 'keuangan', label: '💳 Keuangan' },
      { id: 'registrasi', label: '📝 Registrasi' },
      { id: 'sdm', label: '👥 SDM' },
    ];
  }, [isStudentRole]);

  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      {/* Backdrop overlay for smooth dismissal */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Dropdown Panel Anchored from Top-Right Header */}
      <div 
        className="fixed top-14 sm:top-16 right-3 sm:right-6 w-[94vw] sm:w-[500px] max-h-[88vh] bg-slate-900 text-slate-100 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Pusat Notifikasi"
      >
        {/* ================= HEADER ================= */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/98 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  {viewMode === 'create' ? 'Buat Pengumuman Baru' : 'Notifikasi'}
                </h3>
                {viewMode === 'list' && (
                  unreadCount > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm tabular-nums">
                      {unreadCount > 99 ? '99+' : unreadCount} belum dibaca
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Semua dibaca
                    </span>
                  )
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-xs">
                {viewMode === 'create'
                  ? 'Kirim siaran pengumuman sesuai sasaran yang dituju'
                  : isStudentRole 
                  ? `Agenda ananda ${safeStudentFirstName} & info klinik`
                  : 'Pemberitahuan jadwal, registrasi, medis & operasional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Buat Pengumuman Khusus Admin / Manager */}
            {canCreateAnnouncement && viewMode === 'list' && (
              <button 
                onClick={() => setViewMode('create')}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-xl shadow-md transition cursor-pointer active:scale-95"
                title="Buat pengumuman baru untuk siswa, terapis, atau seluruh pengguna"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buat Pengumuman</span>
              </button>
            )}

            {viewMode === 'create' && (
              <button 
                onClick={() => setViewMode('list')}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                title="Kembali ke Daftar Notifikasi"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
            )}

            {viewMode === 'list' && unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Tandai semua notifikasi telah dibaca"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= VIEW MODE: FORM BUAT PENGUMUMAN ================= */}
        {viewMode === 'create' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-950/40">
            {/* Feedback Message */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAnnouncement} className="space-y-4 text-xs">
              {/* 1. Target Sasaran Penerima (Sesuai Yang Dituju) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block text-xs flex items-center justify-between">
                  <span>1. Sasaran Penerima Pengumuman:</span>
                  <span className="text-[11px] text-indigo-400 font-semibold">Wajib Ditentukan</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Semua Pengguna', sub: 'Publik (Siswa & Tim)', icon: Users },
                    { id: 'all_students', label: 'Seluruh Siswa', sub: 'Semua Wali Murid', icon: Megaphone },
                    { id: 'specific_student', label: 'Siswa Tertentu', sub: '1 Siswa Spesifik', icon: UserCheck },
                    { id: 'all_therapists', label: 'Seluruh Terapis', sub: 'Semua Tenaga Medis', icon: Briefcase },
                    { id: 'specific_therapist', label: 'Terapis Tertentu', sub: '1 Terapis Spesifik', icon: Briefcase },
                    { id: 'management', label: 'Manajemen', sub: 'Admin & Manager', icon: Shield },
                  ].map(tgt => {
                    const Icon = tgt.icon;
                    const isSelected = targetAudience === tgt.id;
                    return (
                      <button
                        type="button"
                        key={tgt.id}
                        onClick={() => {
                          setTargetAudience(tgt.id as any);
                          setFormError(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-transparent'}`} />
                        </div>
                        <span className="font-bold text-[11px] block">{tgt.label}</span>
                        <span className="text-[10px] text-slate-400">{tgt.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Selector: Siswa Spesifik */}
              {targetAudience === 'specific_student' && (
                <div className="p-3 bg-slate-900/90 border border-indigo-500/30 rounded-xl space-y-1.5 animate-fade-in">
                  <label className="text-slate-300 font-bold block text-xs flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Pilih Siswa / Pasien yang Dituju:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id}) - Wali: {s.parentName || 'Orang Tua'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-indigo-300">
                    * Notifikasi ini hanya akan tampil di akun siswa tersebut, tidak akan dapat dilihat oleh siswa lain.
                  </p>
                </div>
              )}

              {/* Conditional Selector: Terapis Spesifik */}
              {targetAudience === 'specific_therapist' && (
                <div className="p-3 bg-slate-900/90 border border-indigo-500/30 rounded-xl space-y-1.5 animate-fade-in">
                  <label className="text-slate-300 font-bold block text-xs flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Pilih Terapis yang Dituju:
                  </label>
                  <select
                    value={selectedTherapistId}
                    onChange={(e) => setSelectedTherapistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {therapistList.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialties ? t.specialties.join(', ') : 'Spesialis'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. Template Cepat (Quick Presets) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Template Cepat Pengumuman:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyQuickPreset({
                      title: '📢 Pengumuman: Libur Nasional & Penyesuaian Jadwal Terapi',
                      description: 'Klinik Pelangi 360 mengumumkan bahwa pada tanggal merah libur nasional, sesi terapi tatap muka ditiadakan. Sesi terapi pengganti dapat dikoordinasikan langsung melalui admin resepsionis.',
                      category: 'pengumuman',
                      targetAudience: 'all',
                      targetView: 'dashboard'
                    })}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    ⚡ Libur Nasional
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPreset({
                      title: '📢 Webinar Parenting: Stimulasi Sensori & Bahasa Mandiri',
                      description: 'Mengundang seluruh ayah dan bunda siswa Pelangi Lazuardi untuk berpartisipasi dalam sesi webinar daring bersama tim dokter dan psikolog pada Sabtu pukul 09:30 WIB.',
                      category: 'pengumuman',
                      targetAudience: 'all_students',
                      targetView: 'dashboard'
                    })}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    ⚡ Webinar Parenting
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPreset({
                      title: '💳 Tagihan Biaya Terapi Baru Periode Bulan Berjalan',
                      description: 'Pemberitahuan: Rincian invoice dan tagihan biaya terapi telah diterbitkan. Mohon melakukan konfirmasi pembayaran sebelum tanggal jatuh tempo.',
                      category: 'keuangan',
                      targetAudience: 'all_students',
                      targetView: 'tagihan'
                    })}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    ⚡ Tagihan Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPreset({
                      title: '📋 Laporan Hasil Evaluasi Assessment Telah Selesai',
                      description: 'Laporan hasil assessment klinis komprehensif ananda telah selesai ditelaah oleh tim asesor. Ayah dan bunda dapat melihat detail laporan pada menu Hasil Assessment.',
                      category: 'assessment',
                      targetAudience: 'specific_student',
                      targetView: 'assesmentAnak'
                    })}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    ⚡ Hasil Assessment
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPreset({
                      title: '🎯 Target Kurikulum Terapi (IEP) Diperbarui',
                      description: 'Target kurikulum terapi individual ananda telah diperbarui oleh terapis penanggung jawab sesuai dengan evaluasi kemajuan motorik dan wicara terbaru.',
                      category: 'program',
                      targetAudience: 'specific_student',
                      targetView: 'programTerapi'
                    })}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    ⚡ Program Terapi
                  </button>
                </div>
              </div>

              {/* 3. Kategori & Navigasi Terkait */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Kategori Notifikasi:</label>
                  <select
                    value={announcementCategory}
                    onChange={(e) => setAnnouncementCategory(e.target.value as NotificationCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="pengumuman">📢 Pengumuman Umum</option>
                    <option value="terapi">📅 Jadwal Terapi</option>
                    <option value="kehadiran">⏱️ Kehadiran</option>
                    <option value="catatan">💬 Catatan Sesi Terapi</option>
                    <option value="program">🎯 Program Terapi (IEP)</option>
                    <option value="assessment">📋 Hasil Assessment</option>
                    <option value="keuangan">💳 Tagihan & Biaya</option>
                    <option value="sdm">👥 SDM & Manajemen</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Arahkan Menu Saat Diklik:</label>
                  <select
                    value={targetView}
                    onChange={(e) => setTargetView(e.target.value as View)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="dashboard">Dasbor Utama</option>
                    <option value="papanJadwal">Papan Jadwal Terapi</option>
                    <option value="laporanAssesment">Hasil Assessment</option>
                    <option value="programTerapi">Program Terapi (IEP)</option>
                    <option value="bukuCatatanTerapi">Buku Catatan Terapi</option>
                    <option value="tagihan">Tagihan Siswa</option>
                    <option value="rekapKehadiran">Rekapitulasi Kehadiran</option>
                  </select>
                </div>
              </div>

              {/* 4. Judul Pengumuman */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Judul Pengumuman:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 📢 Pengumuman Penyesuaian Jadwal Terapi"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* 5. Isi Deskripsi Pengumuman */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Isi Pesan / Keterangan Pengumuman:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan isi pengumuman secara jelas dan ramah di sini..."
                  value={announcementDesc}
                  onChange={(e) => setAnnouncementDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Pengumuman'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================= VIEW MODE: DAFTAR NOTIFIKASI ================= */
          <>
            {/* Filter Toolbar */}
            <div className="p-2 sm:px-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-col gap-1.5 shrink-0">
              {/* Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 text-xs">
                {availableTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeCategory === tab.id 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status Filter Toggle */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 text-[11px] font-medium">Status Baca:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setFilterReadStatus('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      filterReadStatus === 'all' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFilterReadStatus('unread')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      filterReadStatus === 'unread' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Belum Dibaca
                  </button>
                  <button
                    onClick={() => setFilterReadStatus('read')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      filterReadStatus === 'read' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sudah Dibaca
                  </button>
                </div>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar min-h-[260px] max-h-[58vh]">
              {/* 1. LOADING STATE */}
              {isLoading && (
                <div className="py-14 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Memuat notifikasi...</p>
                </div>
              )}

              {/* 2. ERROR STATE */}
              {!isLoading && hasError && (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-rose-300">Gagal memuat notifikasi.</p>
                  <button
                    onClick={loadNotifications}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              )}

              {/* 3. EMPTY STATE */}
              {!isLoading && !hasError && displayedNotifications.length === 0 && (
                <div className="py-14 px-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-2">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    {isStudentRole ? '🔔 Belum ada notifikasi untuk Anda' : '🔔 Belum ada notifikasi'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {filterReadStatus === 'unread' 
                      ? 'Semua notifikasi dalam kategori ini telah dibaca.' 
                      : isStudentRole
                        ? 'Belum ada notifikasi baru untuk Anda saat ini. Semua pembaruan jadwal terapi, kehadiran, catatan sesi, program terapi, assessment, dan tagihan akan tampil di sini.'
                        : 'Belum ada notifikasi baru saat ini. Gunakan tombol "Buat Pengumuman" untuk menyiarkan informasi ke siswa atau tim.'}
                  </p>
                  {canCreateAnnouncement && (
                    <button
                      onClick={() => setViewMode('create')}
                      className="mt-3 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Pengumuman Sekarang</span>
                    </button>
                  )}
                </div>
              )}

              {/* 4. NOTIFICATION LIST ITEMS */}
              {!isLoading && !hasError && displayedNotifications.map((item) => {
                if (!item) return null;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 group relative border ${
                      item.isRead 
                        ? 'border-transparent hover:bg-slate-800/40 text-slate-300' 
                        : 'bg-indigo-500/8 border-indigo-500/20 hover:bg-indigo-500/15 text-white'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${getCategoryBadgeClass(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {getCategoryLabel(item.category)}
                          </span>
                          {/* Sasaran Penerima Badge */}
                          {canCreateAnnouncement && renderDeliveryBadge(item)}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 font-mono shrink-0">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.timeFormatted}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold truncate mt-1 ${item.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40">
                        <span className="text-[11px] text-indigo-400 font-semibold group-hover:text-indigo-300 flex items-center gap-1">
                          Buka rincian
                          <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                        {!item.isRead ? (
                          <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Baru
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-slate-500" />
                            Sudah dibaca
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs text-slate-400 px-4 shrink-0">
              <span>{userNotifications.length} Total Notifikasi</span>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setFilterReadStatus('all');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= DETAIL POPUP MODAL ================= */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedNotification(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${getCategoryBadgeClass(selectedNotification.category)}`}>
                  {getCategoryIcon(selectedNotification.category)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {getCategoryLabel(selectedNotification.category)}
                    </span>
                    {renderDeliveryBadge(selectedNotification)}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-normal">
                {selectedNotification.description}
              </div>

              {/* Metadata Info */}
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                {selectedNotification.createdBy && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Diterbitkan Oleh:</span>
                    <span className="font-semibold text-slate-200">{selectedNotification.createdBy}</span>
                  </div>
                )}
                {selectedNotification.studentName && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Siswa Penerima:</span>
                    <span className="font-semibold text-indigo-300">{selectedNotification.studentName} ({selectedNotification.studentId})</span>
                  </div>
                )}
                {selectedNotification.therapistName && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Terapis Penerima:</span>
                    <span className="font-semibold text-purple-300">{selectedNotification.therapistName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedNotification.timeFormatted}</span>
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sudah Dibaca
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2.5">
              {/* Tombol Hapus untuk Admin / Manager */}
              {canCreateAnnouncement ? (
                <button
                  type="button"
                  onClick={() => handleDeleteNotification(selectedNotification.id)}
                  className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer transition flex items-center gap-1"
                  title="Hapus / tarik notifikasi ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateFromDetail(selectedNotification)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition active:scale-95"
                >
                  <span>
                    {selectedNotification.category === 'assessment' 
                      ? 'Buka Hasil Assessment'
                      : selectedNotification.category === 'program'
                      ? 'Buka Program Terapi'
                      : selectedNotification.category === 'catatan'
                      ? 'Buka Buku Catatan Terapi'
                      : selectedNotification.category === 'keuangan'
                      ? 'Buka Menu Tagihan'
                      : selectedNotification.category === 'terapi' || selectedNotification.category === 'kehadiran'
                      ? 'Buka Jadwal Terapi'
                      : 'Buka Halaman Terkait'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenterModal;
