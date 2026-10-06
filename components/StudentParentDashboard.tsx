import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  BookOpen,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  FileText,
  Bell,
  Send,
  Sparkles,
  HeartHandshake,
  UserCheck,
  Target,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageCircle,
  Info,
  CheckSquare,
  Activity,
  Award,
  ShieldCheck,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  Users,
  Megaphone,
  FolderArchive
} from 'lucide-react';
import { Child, Therapist, TherapyDefinition, AttendanceStatus, View, UserRole, TherapyProgram, ParentComment } from '../types';
import {
  getStoredComments,
  getCommentsForStudent,
  addParentComment
} from '../utils/parentCommentStorage';

interface StudentParentDashboardProps {
  child: Child;
  allChildren?: Child[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  therapyPrograms?: TherapyProgram[];
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  onNavigate: (view: View) => void;
  user: { name: string; photoUrl?: string; role?: string };
  userRole?: UserRole;
  onOpenNotificationCenter?: () => void;
}

export const StudentParentDashboard: React.FC<StudentParentDashboardProps> = ({
  child: propChild,
  allChildren,
  therapists,
  therapyTypes,
  therapyPrograms = [],
  attendanceNotes,
  attendanceRecords,
  onNavigate,
  user,
  userRole,
  onOpenNotificationCenter
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(propChild.id);

  useEffect(() => {
    setSelectedChildId(propChild.id);
  }, [propChild.id]);

  const child = useMemo(() => {
    if (allChildren && allChildren.length > 0) {
      const found = allChildren.find(c => c.id === selectedChildId);
      if (found) return found;
    }
    return propChild;
  }, [allChildren, selectedChildId, propChild]);

  // Interactive feedback form states
  const [feedbackDate, setFeedbackDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackPhoto, setFeedbackPhoto] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitSuccess, setFeedbackSubmitSuccess] = useState<boolean>(false);
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState<'all' | 'responded' | 'waiting'>('all');

  // Modal dialog states
  const [isNoteDetailOpen, setIsNoteDetailOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState<boolean>(false);
  const [quickMessageText, setQuickMessageText] = useState<string>('');
  const [messageSentToast, setMessageSentToast] = useState<boolean>(false);

  // Load comments dynamically
  const [parentComments, setParentComments] = useState<ParentComment[]>(() => {
    return getCommentsForStudent(child.id);
  });

  useEffect(() => {
    setParentComments(getCommentsForStudent(child.id));
  }, [child.id]);

  // Re-fetch comments when storage changes or on mount
  const refreshComments = () => {
    setParentComments(getCommentsForStudent(child.id));
  };

  // Next session details
  const nextSession = useMemo(() => {
    const recurring = child.recurringSessions || [];
    const first = recurring[0] || {
      day: 'Senin',
      time: '08:00 - 09:00',
      type: 'OT',
      therapistId: 'T11'
    };
    const therapistObj = therapists.find(t => t.id === first.therapistId) || therapists[0];
    return {
      day: first.day,
      dateFormatted: 'Senin, 5 Oktober 2026',
      time: first.time,
      type: first.type,
      therapist: therapistObj?.name || 'Rilla Serando, S.Tr.Kes',
      room: 'Ruang Terapi Okupasi 2 (Lt. 1)',
      status: 'Terkonfirmasi',
      countdown: '2 Hari Lagi'
    };
  }, [child, therapists]);

  // Latest clinical therapy note
  const latestNote = useMemo(() => {
    const dates = Object.keys(attendanceNotes).sort((a, b) => b.localeCompare(a));
    for (const d of dates) {
      const dayNotes = attendanceNotes[d];
      if (dayNotes) {
        for (const sessId of Object.keys(dayNotes)) {
          if (sessId.includes(child.id)) {
            const n = dayNotes[sessId];
            const thId = typeof n === 'object' ? n.therapistId : undefined;
            const th = therapists.find(t => t.id === thId) || therapists[0];
            return {
              date: d,
              note: typeof n === 'string' ? n : n.note,
              type: typeof n === 'object' ? n.type : 'OT',
              therapist: th,
              photoUrls: typeof n === 'object' ? n.photoUrls : [],
              hasAudio: typeof n === 'object' && !!n.audioUrl
            };
          }
        }
      }
    }
    // Fallback enterprise clinical note for Adriel
    return {
      date: '2026-09-28',
      note: 'Siswa menunjukkan peningkatan kemampuan fokus selama 15 menit dan mampu menyelesaikan aktivitas motorik dengan bantuan minimal. Kontak mata semakin konsisten saat instruksi 2 tahap.',
      type: 'OT',
      therapist: therapists[0] || { name: 'Rilla Serando, S.Tr.Kes' },
      photoUrls: [
        'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80'
      ],
      hasAudio: false
    };
  }, [attendanceNotes, child, therapists]);

  // Dynamic monthly attendance calculated from attendanceRecords (synced with Admin Presensi)
  const studentMonthlyAttendance = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysOfWeekList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    let totalSessions = 0;
    let present = 0;
    let absent = 0;
    let permit = 0;

    if (child.recurringSessions && child.recurringSessions.length > 0) {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayIndex = date.getDay();
        const dayOfWeekName = daysOfWeekList[dayIndex === 0 ? 6 : dayIndex - 1];
        const localKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isoKey = date.toISOString().split('T')[0];

        const daySessions = child.recurringSessions.filter(rs => rs.day === dayOfWeekName);
        totalSessions += daySessions.length;

        daySessions.forEach(rs => {
          const sessId = `s-recur-${child.id}-${dayOfWeekName.replace(/\s/g, '')}-${rs.time}`;
          const status = attendanceRecords[localKey]?.[sessId] || attendanceRecords[isoKey]?.[sessId];
          if (status === AttendanceStatus.PRESENT) present++;
          else if (status === AttendanceStatus.ABSENT) absent++;
          else if (status === AttendanceStatus.PERMIT) permit++;
        });
      }
    }

    const evaluated = present + absent + permit;
    const rate = evaluated > 0 ? Math.round((present / evaluated) * 100) : 95;

    return {
      totalSessions: totalSessions || 20,
      present: present || 19,
      absent: absent || 1,
      permit,
      evaluated,
      rate
    };
  }, [child, attendanceRecords]);

  // Smart Notifications & Clinic Announcements for this Student
  const smartNotifications = [
    {
      id: 'notif-announcement-1',
      type: 'pengumuman',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      tag: 'Pengumuman Resmi',
      title: '📢 Libur Nasional & Penyesuaian Jadwal Terapi',
      description: 'Penyesuaian jadwal pada libur nasional mendatang. Sesi pengganti ananda dapat dikonfirmasikan bersama admin klinik.',
      time: '1 jam lalu',
      action: () => onOpenNotificationCenter ? onOpenNotificationCenter() : onNavigate('papanJadwal')
    },
    {
      id: 'notif-1',
      type: 'jadwal',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      tag: 'Jadwal Ananda',
      title: `Sesi Terapi Okupasi (OT) ${child.name.split(' ')[0]}`,
      description: 'Pukul 08:00 - 09:00 WIB bersama Terapis Rilla Serando, S.Tr.Kes di Ruang Pelangi 2.',
      time: 'Besok, 08:00',
      action: () => onNavigate('papanJadwal')
    },
    {
      id: 'notif-2',
      type: 'feedback',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      tag: 'Feedback Terapis',
      title: `Tanggapan Terapis: Perkembangan ${child.name.split(' ')[0]}`,
      description: '"Terima kasih atas catatannya. Stimulasi sensori playdough di rumah sudah berdampak positif pada kekuatan jemari ananda."',
      time: '3 jam lalu',
      action: () => {
        const el = document.getElementById('feedback-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'notif-announcement-2',
      type: 'pengumuman',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      tag: 'Pengumuman Resmi',
      title: '📢 Webinar Parenting: Stimulasi Sensori & Bahasa',
      description: 'Seminar edukatif khusus orang tua murid Pelangi360 pada hari Sabtu, 18 Oktober 2026 pukul 09:00 WIB.',
      time: 'Hari ini',
      action: () => onOpenNotificationCenter ? onOpenNotificationCenter() : onNavigate('dashboard')
    },
    {
      id: 'notif-3',
      type: 'catatan',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      tag: 'Catatan Terapi',
      title: `Catatan Hasil Evaluasi Sesi Terapi ${child.name.split(' ')[0]}`,
      description: 'Evaluasi sesi atensi dan koordinasi motorik halus ananda telah diunggah oleh terapis utama.',
      time: 'Kemarin',
      action: () => setIsNoteDetailOpen(true)
    },
    {
      id: 'notif-4',
      type: 'tagihan',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      tag: 'Tagihan Siswa',
      title: `Tagihan Terapi Bulan Oktober 2026 - ${child.name.split(' ')[0]}`,
      description: 'Invoice paket terapi bulan berjalan ananda telah diterbitkan. Batas pembayaran tanggal 10 Oktober 2026.',
      time: '7 hari lagi',
      action: () => onNavigate('tagihan')
    }
  ];

  // Professional Activity Timeline
  const activityTimeline = [
    {
      dotColor: 'bg-teal-400 ring-teal-500/30',
      timeLabel: 'Hari ini',
      title: 'Feedback diterima',
      desc: 'Terapis Rilla Serando menanggapi catatan feedback terkait latihan motorik halus dan konsentrasi ananda di rumah.',
      badge: 'Respon Terapis'
    },
    {
      dotColor: 'bg-blue-400 ring-blue-500/30',
      timeLabel: 'Kemarin',
      title: 'Catatan terapi ditambahkan',
      desc: 'Catatan evaluasi sesi Terapi Okupasi (OT) selesai diinput: Ananda mencapai target fokus selama 15 menit penuh.',
      badge: 'Catatan Klinis'
    },
    {
      dotColor: 'bg-purple-400 ring-purple-500/30',
      timeLabel: '3 Hari lalu',
      title: 'Jadwal terapi diperbarui',
      desc: 'Sesi tambahan Terapi Wicara (TW) dijadwalkan ulang untuk hari Senin pukul 11:00 WIB sesuai konfirmasi.',
      badge: 'Jadwal'
    },
    {
      dotColor: 'bg-amber-400 ring-amber-500/30',
      timeLabel: '7 Hari lalu',
      title: 'Target baru ditetapkan',
      desc: 'Target intervensi bulan Oktober resmi diperbarui: Fokus 80%, artikulasi wicara 2 tahap, dan kemandirian berpakaian.',
      badge: 'Target Kurikulum'
    }
  ];

  // Handle Parent Feedback submission
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    setIsSubmittingFeedback(true);
    setTimeout(() => {
      addParentComment({
        sessionDate: feedbackDate,
        therapyType: 'OT',
        studentId: child.id,
        studentName: child.name,
        parentId: 'parent-adriel',
        parentName: child.parentName || 'Orang Tua Adriel',
        homeCondition: feedbackComment,
        comment: feedbackComment,
        homeActivities: 'Latihan di rumah sesuai arahan terapis',
        rating: 5,
        attachments: feedbackPhoto ? [feedbackPhoto] : [],
        isDraft: false
      });

      refreshComments();
      setIsSubmittingFeedback(false);
      setFeedbackSubmitSuccess(true);
      setFeedbackComment('');
      setFeedbackPhoto('');

      setTimeout(() => {
        setFeedbackSubmitSuccess(false);
      }, 4000);
    }, 600);
  };

  // Direct quick message to therapist
  const handleSendDirectMessage = () => {
    if (!quickMessageText.trim()) return;
    addParentComment({
      sessionDate: new Date().toISOString().split('T')[0],
      therapyType: 'OT',
      studentId: child.id,
      studentName: child.name,
      parentId: 'parent-adriel',
      parentName: child.parentName || 'Orang Tua Adriel',
      homeCondition: quickMessageText,
      comment: quickMessageText,
      homeActivities: 'Pesan langsung via dashboard portal keluarga',
      rating: 5,
      isDraft: false
    });
    refreshComments();
    setQuickMessageText('');
    setIsDirectMessageOpen(false);
    setMessageSentToast(true);
    setTimeout(() => setMessageSentToast(false), 3500);
  };

  // Filtered comments for the feedback list
  const filteredComments = useMemo(() => {
    if (feedbackFilterStatus === 'responded') {
      return parentComments.filter(c => c.replies && c.replies.length > 0);
    }
    if (feedbackFilterStatus === 'waiting') {
      return parentComments.filter(c => !c.replies || c.replies.length === 0);
    }
    return parentComments;
  }, [parentComments, feedbackFilterStatus]);

  // Overall student target indicators
  const targets = [
    { label: 'Fokus 80%', completed: true, status: 'Baik', color: 'emerald' },
    { label: 'Motorik Halus', completed: true, status: 'Baik', color: 'emerald' },
    { label: 'Regulasi Emosi', completed: false, status: 'Perlu Perhatian', color: 'amber' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {messageSentToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-400/30"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">Pesan Anda berhasil dikirimkan kepada tim terapis.</span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER DASHBOARD                                                       */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Welcome Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {userRole === 'terapis' ? 'Dasbor Terapi Siswa' : 'Dashboard Akun Siswa & Orang Tua'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                Real-Time Synchronized
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang, {userRole === 'terapis' ? user.name.split(' ')[0] : child.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              {userRole === 'terapis' 
                ? 'Pantau program intervensi, jadwal sesi, dan catatan harian siswa secara real-time.' 
                : 'Pantau jadwal terapi, target program intervensi, dan komunikasi dengan terapis secara real-time.'}
            </p>
          </div>

          {/* Right: Student Profile & Action Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            {/* Student Profile Tag with Switcher for Terapis */}
            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl px-3.5 py-2">
              <div className="relative">
                <img
                  src={child.photoUrl || `https://i.pravatar.cc/100?u=${child.id}`}
                  alt={child.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div className="text-left">
                {allChildren && allChildren.length > 1 && userRole === 'terapis' ? (
                  <div>
                    <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Pilih Siswa Terapi:</label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none focus:border-indigo-500 max-w-[170px]"
                    >
                      {allChildren.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold text-white block leading-tight truncate max-w-[140px]">
                      {child.name}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-300 block">
                      Kelas: {child.className || '3 MWS'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            {userRole === 'terapis' ? (
              <button
                onClick={() => onNavigate('bukuCatatanTerapi')}
                className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                title="Buka Buku Catatan Terapi EMR"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-semibold">Catatan EMR</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dokumenSiswa')}
                  className="px-3.5 py-2 rounded-2xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 font-medium text-xs flex items-center gap-2 border border-teal-500/30 shadow-md transition-all cursor-pointer"
                  title="Buka Dokumen Perkembangan Saya"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span className="font-semibold">Dokumen Saya</span>
                </button>
                <button
                  onClick={() => setIsDirectMessageOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  title="Kirim Pesan ke Terapis"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold">Pesan Terapis</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO CARD SISWA (Premium Healthcare Hero Card)                         */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-teal-950/60 border border-indigo-500/30 p-6 sm:p-7 shadow-xl shadow-indigo-950/40 backdrop-blur-md">
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Photo & Student Bio (lg:col-span-5) */}
          <div className="lg:col-span-5 flex items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={child.photoUrl || `https://i.pravatar.cc/100?u=${child.id}`}
                alt={child.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/40 shadow-xl"
              />
              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow">
                Aktif
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  Rekam Medis: {child.id}
                </span>
                <span className="text-xs text-slate-400">Usia: 10 Tahun</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {child.name}
              </h2>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Program Terapi:</span>
                  <span className="font-semibold text-indigo-300">Terapi Okupasi (OT) & Wicara (TW)</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Terapis Utama:</span>
                  <span className="font-semibold text-teal-300">Rilla Serando, S.Tr.Kes & Adisty Ayuningtyas</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Target Bulan Ini (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Target Bulan Ini
              </span>
              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Oktober 2026
              </span>
            </div>

            <div className="space-y-2.5">
              {targets.map((tgt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    {tgt.completed ? (
                      <span className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                        ◻
                      </span>
                    )}
                    <span className="font-semibold text-white">{tgt.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tgt.color === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {tgt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Progress Program Kemajuan (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Progress Program
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Baik
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-white tracking-tight">78%</span>
                <span className="text-xs text-slate-400 font-medium">Selesai</span>
              </div>

              {/* Progress Bar with multi-accent gradient */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 shadow-sm"
                />
              </div>
            </div>

            {/* Indikator Warna Legend */}
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Hijau: Baik
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Kuning: Perhatian
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Merah: Tindak Lanjut
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RINGKASAN CEPAT (4 SUMMARY CARDS / KPIS)                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sesi Terapi Bulan Ini */}
        <div
          onClick={() => onNavigate('papanJadwal')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sesi Terapi Bulan Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">12 Sesi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-semibold">8 Selesai • 4 Terjadwal</span>
            <span className="text-slate-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
              Lihat <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Tingkat Kehadiran */}
        <div
          onClick={() => onNavigate('rekapKehadiran')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tingkat Kehadiran
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{studentMonthlyAttendance.rate}%</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              studentMonthlyAttendance.rate >= 85 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              {studentMonthlyAttendance.rate >= 85 ? 'Baik' : 'Perlu Evaluasi'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Presensi Real-Time
            </span>
            <span className="text-slate-400 font-mono">
              {studentMonthlyAttendance.present}/{studentMonthlyAttendance.totalSessions} sesi ({studentMonthlyAttendance.absent} absen)
            </span>
          </div>
        </div>

        {/* Card 3: Target Tercapai */}
        <div
          onClick={() => onNavigate('programTerapi')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Tercapai
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">8 dari 10</span>
            <span className="text-xs text-purple-300 font-semibold">Sasaran</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-semibold">80% Kurikulum Tuntas</span>
            <span className="text-slate-500 flex items-center gap-1 group-hover:text-purple-400 transition-colors">
              Rincian <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Feedback Orang Tua */}
        <div
          onClick={() => {
            const el = document.getElementById('feedback-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-teal-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Feedback Orang Tua
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">4 Feedback</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-teal-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Ditanggapi
            </span>
            <span className="text-slate-500">Dua arah aktif</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 & 6. DUAL CARDS: JADWAL TERAPI BERIKUTNYA & CATATAN TERAPI TERBARU       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* JADWAL TERAPI BERIKUTNYA (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Jadwal Terapi Berikutnya</h3>
                  <p className="text-xs text-slate-400">Sesi terdekat yang telah terjadwal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {nextSession.countdown}
              </span>
            </div>

            {/* Main Schedule Highlight Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-500/30 space-y-3.5 mb-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{nextSession.dateFormatted}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-black rounded-lg uppercase tracking-wider">
                  {nextSession.type}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">Waktu Terapi</span>
                <span className="text-lg font-black text-white">{nextSession.time} WIB</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-500/20 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Terapis:</span>
                  <span className="font-bold text-white">{nextSession.therapist}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ruangan:</span>
                  <span className="font-bold text-indigo-300">{nextSession.room}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Konfirmasi:</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {nextSession.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              💡 Harap hadir 10 menit sebelum sesi dimulai agar ananda memiliki waktu transisi & adaptasi sensorik yang nyaman.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Lihat kalender lengkap klinik</span>
            <button
              onClick={() => onNavigate('papanJadwal')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Lihat Jadwal Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CATATAN TERAPI TERBARU (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Catatan Terapi Terbaru</h3>
                  <p className="text-xs text-slate-400">Evaluasi klinis dan catatan perkembangan dari sesi terakhir</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Terverifikasi Terapis
              </span>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Nama Terapis</span>
                <span className="font-bold text-white truncate block">
                  {latestNote.therapist?.name || 'Rilla Serando, S.Tr.Kes'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Tanggal</span>
                <span className="font-bold text-white">
                  {new Date(latestNote.date).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Jenis Terapi</span>
                <span className="font-bold text-teal-400">
                  {latestNote.type === 'OT' ? 'Terapi Okupasi (OT)' : latestNote.type === 'TW' ? 'Terapi Wicara (TW)' : latestNote.type}
                </span>
              </div>
            </div>

            {/* Note Snippet */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 relative">
              <span className="text-3xl text-teal-500/30 font-serif absolute top-1 left-2 select-none">“</span>
              <p className="pl-4 italic">
                "{latestNote.note}"
              </p>
            </div>

            {/* Photos thumbnail preview if available */}
            {latestNote.photoUrls && latestNote.photoUrls.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Foto Dokumentasi:
                </span>
                <div className="flex gap-2">
                  {latestNote.photoUrls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt="Dokumentasi"
                      onClick={() => setIsNoteDetailOpen(true)}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Tersedia dokumentasi lengkap & program latihan rumah
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try {
                    sessionStorage.setItem('pelangi360_open_therapy_history', 'true');
                  } catch {}
                  onNavigate('bukuCatatanTerapi');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Buka seluruh buku riwayat catatan terapi"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Buku Riwayat Catatan</span>
              </button>
              <button
                onClick={() => setIsNoteDetailOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. FEEDBACK ORANG TUA (Interactive Feedback Form & Timeline)              */}
      {/* ========================================================================= */}
      <div id="feedback-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Feedback Orang Tua</h3>
              <p className="text-xs text-slate-400">
                Komunikasi dua arah: sampaikan perkembangan kondisi anak di rumah kepada tim terapis
              </p>
            </div>
          </div>

          {/* Status Tracker: Belum Ada Komentar | Menunggu Tanggapan | Sudah Ditanggapi */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFeedbackFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                feedbackFilterStatus === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({parentComments.length})
            </button>
            <button
              onClick={() => setFeedbackFilterStatus('waiting')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                feedbackFilterStatus === 'waiting'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Menunggu Tanggapan
            </button>
            <button
              onClick={() => setFeedbackFilterStatus('responded')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                feedbackFilterStatus === 'responded'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sudah Ditanggapi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Kirim Feedback Baru (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              Tulis Feedback Baru
            </h4>

            {feedbackSubmitSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Feedback berhasil dikirimkan ke terapis ananda!</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={feedbackDate}
                  onChange={e => setFeedbackDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Komentar & Catatan Rumah
                </label>
                <textarea
                  rows={4}
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder="Ceritakan respon ananda setelah terapi, kemajuan di rumah, atau pertanyaan untuk terapis..."
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Lampiran Foto (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={feedbackPhoto}
                    onChange={e => setFeedbackPhoto(e.target.value)}
                    placeholder="URL Foto (https://...)"
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFeedbackPhoto(
                        'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                    title="Gunakan Contoh Foto"
                  >
                    Contoh
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback || !feedbackComment.trim()}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingFeedback ? 'Mengirim...' : 'Kirim Feedback'}</span>
              </button>
            </form>
          </div>

          {/* Right List: Riwayat Komentar Orang Tua & Balasan Terapis (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
              <span>Riwayat Komentar Orang Tua</span>
              <span className="text-xs text-slate-400 font-normal">
                {filteredComments.length} Riwayat Tersimpan
              </span>
            </h4>

            {filteredComments.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Belum Ada Komentar pada kategori ini.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredComments.map(item => {
                  const hasReply = item.replies && item.replies.length > 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all"
                    >
                      {/* Header of Item */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.parentName}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(item.sessionDate || item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {hasReply ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Ditanggapi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Clock3 className="w-3 h-3" /> Menunggu Tanggapan Terapis
                          </span>
                        )}
                      </div>

                      {/* Parent Comment Text */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        {item.comment || item.homeCondition}
                      </p>

                      {/* Photo attachment if available */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="flex gap-2">
                          {item.attachments.map((att, idx) => (
                            <img
                              key={idx}
                              src={att}
                              alt=""
                              className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                            />
                          ))}
                        </div>
                      )}

                      {/* Therapist Reply Section */}
                      {hasReply && (
                        <div className="mt-2 pl-4 border-l-2 border-teal-500/60 space-y-2">
                          {item.replies.map(rep => (
                            <div key={rep.id} className="bg-teal-950/20 border border-teal-500/20 p-3 rounded-xl">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-teal-300">
                                  {rep.therapistName} (Terapis)
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(rep.createdAt).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{rep.reply}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8 & 9. DUAL SECTION: AKTIVITAS TERBARU & NOTIFIKASI PINTAR                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AKTIVITAS TERBARU (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Aktivitas Terbaru</h3>
                <p className="text-xs text-slate-400">Linimasa riwayat penanganan dan intervensi ananda</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-400">Timeline Klinis</span>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {activityTimeline.map((act, i) => (
              <div key={i} className="relative group">
                {/* Dot indicator */}
                <div
                  className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-slate-900 ${act.dotColor}`}
                />
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{act.title}</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {act.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{act.desc}</p>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {act.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PENGUMUMAN & NOTIFIKASI SISWA (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Pengumuman & Notifikasi Siswa</h3>
                <p className="text-xs text-slate-400">Pemberitahuan khusus ananda & pengumuman resmi klinik</p>
              </div>
            </div>
            {onOpenNotificationCenter ? (
              <button
                onClick={onOpenNotificationCenter}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Pusat Notifikasi ({smartNotifications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {smartNotifications.length} Info
              </span>
            )}
          </div>

          <div className="space-y-3">
            {smartNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={notif.action}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${notif.badgeColor}`}>
                      {notif.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{notif.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. QUICK ACTION                                                          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Quick Action
          </h3>
          <p className="text-xs text-slate-400">Akses cepat menuju menu dan laporan penting terapi</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Quick Action 1: Buku Catatan Terapi */}
          <button
            onClick={() => onNavigate('bukuCatatanTerapi')}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-teal-400 transition-colors">
                Buku Catatan Terapi
              </span>
              <span className="text-[10px] text-slate-400">Lembar catatan sesi</span>
            </div>
          </button>

          {/* Quick Action 2: Buku Riwayat Catatan */}
          <button
            onClick={() => {
              try {
                sessionStorage.setItem('pelangi360_open_therapy_history', 'true');
              } catch {}
              onNavigate('bukuCatatanTerapi');
            }}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">
                Buku Riwayat Catatan
              </span>
              <span className="text-[10px] text-slate-400">Arsip seluruh sesi</span>
            </div>
          </button>

          {/* Quick Action 3: Jadwal Terapi */}
          <button
            onClick={() => onNavigate('papanJadwal')}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-indigo-400 transition-colors">
                Jadwal Terapi
              </span>
              <span className="text-[10px] text-slate-400">Kalender & sesi rutin</span>
            </div>
          </button>

          {/* Quick Action 4: Kirim Feedback */}
          <button
            onClick={() => {
              const el = document.getElementById('feedback-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition-colors">
                Kirim Feedback
              </span>
              <span className="text-[10px] text-slate-400">Komunikasi terapis</span>
            </div>
          </button>

          {/* Quick Action 4: Lihat Progres */}
          <button
            onClick={() => onNavigate('rekapPerkembangan')}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-purple-400 transition-colors">
                Lihat Progres
              </span>
              <span className="text-[10px] text-slate-400">Statistik tumbuh kembang</span>
            </div>
          </button>

          {/* Quick Action 5: Rapor Terapi */}
          <button
            onClick={() => onNavigate('rapot')}
            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 text-left group cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">
                Rapor Terapi
              </span>
              <span className="text-[10px] text-slate-400">Laporan cetak resmi</span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. FOOTER DASHBOARD                                                      */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 uppercase tracking-wider font-semibold text-[11px]">
              Total Sesi Telah Diikuti
            </span>
            <span className="text-lg font-black text-white">48 Sesi</span>
            <p className="text-[11px] text-slate-400 mt-1">Sejak awal pendaftaran tahun ajaran 2025/2026</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-1 uppercase tracking-wider font-semibold text-[11px]">
              Program Terapi Aktif
            </span>
            <span className="text-sm font-bold text-teal-400 block">Terapi Okupasi (OT) & Wicara (TW)</span>
            <p className="text-[11px] text-slate-400 mt-1">2 Sesi Rutin per Minggu</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-1 uppercase tracking-wider font-semibold text-[11px]">
              Tanggal Evaluasi Berikutnya
            </span>
            <span className="text-sm font-bold text-amber-400 block">15 November 2026</span>
            <p className="text-[11px] text-slate-400 mt-1">Evaluasi Berkala Tengah Semester</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-1 uppercase tracking-wider font-semibold text-[11px]">
              Kontak Klinik & Bantuan
            </span>
            <span className="text-xs font-bold text-white block">Klinik Tumbuh Kembang Pelangi360</span>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-600/30 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Admin: +62 812-3456-7890</span>
            </a>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>Pelangi360 Enterprise Healthcare • Hak Cipta Terlindungi.</span>
          <span>Didesain dengan pendekatan holistik untuk mendampingi setiap langkah tumbuh kembang ananda.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL CATATAN TERAPI                                              */}
      {/* ========================================================================= */}
      {isNoteDetailOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                  Rekam Medis Sesi
                </span>
                <h3 className="text-lg font-black text-white">Catatan Klinis Lengkap Terapi</h3>
              </div>
              <button
                onClick={() => setIsNoteDetailOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Terapis Penanggung Jawab</span>
                <span className="font-bold text-white">{latestNote.therapist?.name}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tanggal & Jenis Terapi</span>
                <span className="font-bold text-teal-400">
                  {latestNote.date} • {latestNote.type}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                Hasil Observasi & Evaluasi Sesi
              </span>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                <p className="mb-2">"{latestNote.note}"</p>
                <p className="text-slate-400">
                  Target tercapai: Ananda mampu mempertahankan atensi mandiri selama 15 menit dan menyelesaikan aktivitas koordinasi motorik halus dengan instruksi minimal.
                </p>
              </div>
            </div>

            {latestNote.photoUrls && latestNote.photoUrls.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Foto Dokumentasi Aktivitas
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {latestNote.photoUrls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt="Dokumentasi Sesi"
                      className="w-full h-36 rounded-xl object-cover border border-slate-700"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
              <span className="font-bold block mb-1">Rekomendasi Latihan di Rumah:</span>
              <span>
                Lanjutkan latihan meremas playdough 10-15 menit per hari dan latih ananda memakai sepatu mandiri dengan metode prompting bertahap.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsNoteDetailOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setIsNoteDetailOpen(false);
                  onNavigate('bukuCatatanTerapi');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Buka Buku Catatan Terapi
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: NOTIFIKASI PINTAR LENGKAP                                  */}
      {/* ========================================================================= */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Pusat Notifikasi Pintar</h3>
              </div>
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {smartNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setIsNotificationDrawerOpen(false);
                    n.action();
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${n.badgeColor}`}>
                      {n.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KIRIM PESAN CEPAT KE TERAPIS                                      */}
      {/* ========================================================================= */}
      {isDirectMessageOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Kirim Pesan ke Terapis</h3>
              </div>
              <button
                onClick={() => setIsDirectMessageOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Tujuan Penerima:</span>
              <span className="font-bold text-white">Rilla Serando, S.Tr.Kes (Terapis Utama)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Isi Pesan
              </label>
              <textarea
                rows={4}
                value={quickMessageText}
                onChange={e => setQuickMessageText(e.target.value)}
                placeholder="Tuliskan pertanyaan atau informasi kondisi ananda..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsDirectMessageOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSendDirectMessage}
                disabled={!quickMessageText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Sekarang</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
