import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Save, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  StickyNote,
  ChevronRight,
  ChevronLeft,
  History,
  CheckCircle2,
  Target,
  Hash,
  Paperclip,
  Smile,
  X,
  Image as ImageIcon,
  Trash2,
  Wand2,
  Activity,
  CheckSquare,
  Square,
  Plus,
  Copy,
  ExternalLink,
  Bookmark,
  Printer,
  Download,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Sparkles,
  Radio,
  Play,
  RotateCcw,
  Volume2,
  AlertCircle,
  FileAudio,
  MessageSquareHeart,
  MessageCircle,
  HeartHandshake
} from 'lucide-react';
import { Child, Therapist, TherapySession, AttendanceStatus, TherapyDefinition, TherapyProgram, DetailedProgress, TherapyProgramCategory, UserRole, RecurringSession } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TherapyPrintPreviewModal } from './TherapyPrintPreviewModal';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { exportPagesToPdf, triggerBrowserA4Print, formatTherapyNotebookDownloadFileName } from '../utils/rapotPdfGenerator';
import { CommunicationHistoryChat } from './CommunicationHistoryChat';
import { getStoredComments, notifyTherapyNoteCreated } from '../utils/parentCommentStorage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TherapyNoteBookPageProps {
  children: Child[];
  allChildren?: (Child | any)[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  onUpdateSession: (childId: string, sessionId: string, updates: Partial<TherapySession>) => void;
  onUpdateSessionWithDate?: (dateKey: string, sessionId: string, updates: any) => void;
  therapyPrograms: TherapyProgram[];
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  attendanceRecords?: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  onNavigateToProgram?: (childId: string, therapyType?: TherapyProgramCategory) => void;
  logoUrl?: string;
  userRole?: UserRole;
  loggedInUserId?: string | null;
  loggedInUser?: { name: string; photoUrl?: string; role?: string };
  daysOfWeek?: string[];
  onSelectDate?: (date: Date) => void;
}

const DEFAULT_INTERVENTION_PROGRAMS = [
  { label: 'Berdoa', checked: false },
  { label: 'Sensori Integrasi', checked: false },
  { label: 'Aktivitas Terapeutik', checked: false },
  { label: 'Bahasa Reseptif', checked: false },
  { label: 'Bahasa Ekspresif', checked: false },
  { label: 'Motorik Oral', checked: false },
  { label: 'Evaluasi', checked: false }
];

const ensureInterventionPrograms = (existingPrograms?: Array<{ label: string; checked: boolean }>): Array<{ label: string; checked: boolean }> => {
  if (!existingPrograms || existingPrograms.length === 0) {
    return [...DEFAULT_INTERVENTION_PROGRAMS];
  }
  const result = [...existingPrograms];
  const itemsToAdd = ['Bahasa Reseptif', 'Bahasa Ekspresif', 'Motorik Oral'];
  itemsToAdd.forEach(label => {
    if (!result.some(p => p.label.toLowerCase() === label.toLowerCase())) {
      const evalIdx = result.findIndex(p => p.label.toLowerCase() === 'evaluasi');
      if (evalIdx !== -1) {
        result.splice(evalIdx, 0, { label, checked: false });
      } else {
        result.push({ label, checked: false });
      }
    }
  });
  return result;
};

const TherapyNoteBookPage: React.FC<TherapyNoteBookPageProps> = ({ 
  children, 
  allChildren,
  therapists, 
  therapyTypes,
  onUpdateSession,
  onUpdateSessionWithDate,
  therapyPrograms,
  attendanceNotes,
  attendanceRecords,
  onNavigateToProgram,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png',
  userRole = 'terapis',
  loggedInUserId = null,
  loggedInUser = { name: 'Terapis', photoUrl: '', role: 'terapis' },
  daysOfWeek,
  onSelectDate
}) => {
  // 3 Tab Utama: 1. Catatan Terapi, 2. Forum Komunikasi, 3. Buku Riwayat Catatan
  const [activeMainTab, setActiveMainTab] = useState<'catatan' | 'komunikasi' | 'riwayat'>('catatan');
  const [showStructuredFields, setShowStructuredFields] = useState(true);
  const [sessionGoal, setSessionGoal] = useState('');
  const [sessionActivities, setSessionActivities] = useState('');
  const [sessionOutcome, setSessionOutcome] = useState('');
  const [childProgress, setChildProgress] = useState('');
  const [sessionObstacles, setSessionObstacles] = useState('');
  const [nextTarget, setNextTarget] = useState('');
  const [homeSuggestions, setHomeSuggestions] = useState('');

  const isFamilyPortal = userRole === 'siswa' || userRole === 'orang_tua';
  const isManager = userRole === 'manager' || userRole === 'kepala_sekolah';
  const isTherapist = !isFamilyPortal;

  const targetStudentId = isFamilyPortal ? (loggedInUserId || 'C-ADRIEL') : null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(() => {
    if (targetStudentId) return targetStudentId;
    return children[0]?.id || allChildren?.[0]?.id || null;
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(0);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showHistory, setShowHistory] = useState(false);
  const [showProgram, setShowProgram] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedHistoryNotes, setSelectedHistoryNotes] = useState<string[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('ALL');
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportProgress, setPdfExportProgress] = useState(0);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  const [printModalAutoPrint, setPrintModalAutoPrint] = useState(false);
  const [printModalAutoDownload, setPrintModalAutoDownload] = useState(false);
  const [printModalSpecificNotes, setPrintModalSpecificNotes] = useState<(TherapySession & { date: string })[] | null>(null);
  const [programCategoryTab, setProgramCategoryTab] = useState<TherapyProgramCategory>('OT');
  const [detailedProgress, setDetailedProgress] = useState<DetailedProgress>({
    interventionPrograms: [...DEFAULT_INTERVENTION_PROGRAMS],
    exerciseProgress: [
      { label: 'Kontak mata', checked: false },
      { label: 'Proprioseptif', checked: false },
      { label: 'Vestibular', checked: false },
      { label: 'Fine motor', checked: false },
      { label: 'Gross motor', checked: false }
    ],
    functionalActivities: [
      { activity: '', independence: '', accuracy: '' }
    ],
    weaknessObservations: [
      { label: 'Inatensi', checked: false },
      { label: 'Regulasi', checked: false },
      { label: 'Respon Instruksi', checked: false }
    ],
    responseToIntervention: ''
  });

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Check if session storage requested to open history directly
  useEffect(() => {
    try {
      const shouldOpen = sessionStorage.getItem('pelangi360_open_therapy_history');
      if (shouldOpen === 'true') {
        setShowHistory(true);
        setActiveMainTab('riwayat');
        setShowProgram(false);
        sessionStorage.removeItem('pelangi360_open_therapy_history');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const daysList = useMemo(() => daysOfWeek || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'], [daysOfWeek]);

  // Compute Indonesian day name for selectedDate (e.g., Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu)
  const selectedDayOfWeek = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const dayIndex = d.getDay(); // 0 is Minggu, 1 is Senin, ...
      return daysList[dayIndex === 0 ? 6 : dayIndex - 1] || 'Senin';
    } catch {
      return 'Senin';
    }
  }, [selectedDate, daysList]);

  // Resolves logged-in therapist id
  const myTherapistId = useMemo(() => {
    if (loggedInUserId) return loggedInUserId;
    if (loggedInUser?.name) {
      const match = therapists.find(t => 
        t.name.toLowerCase().includes(loggedInUser.name.toLowerCase()) ||
        loggedInUser.name.toLowerCase().includes(t.name.toLowerCase())
      );
      if (match) return match.id;
    }
    return therapists[0]?.id || 'T11';
  }, [loggedInUserId, loggedInUser, therapists]);

  // Filter state for therapist: 'ALL' (Semua Siswa Terjadwal) vs 'MINE' (Jadwal Saya)
  const [therapistFilter, setTherapistFilter] = useState<'ALL' | 'MINE'>('ALL');

  // Source children pool (respects family portal privacy vs therapist full view)
  const sourceChildren = useMemo(() => {
    if (isFamilyPortal) {
      if (targetStudentId) {
        const match = allChildren?.find(c => c.id === targetStudentId) || children.find(c => c.id === targetStudentId);
        return match ? [match] : children;
      }
      return children;
    }
    return (allChildren && allChildren.length > 0) ? allChildren : children;
  }, [allChildren, children, isFamilyPortal, targetStudentId]);

  // Dynamically compute scheduled children & their sessions for selectedDate
  const scheduledChildrenForDate = useMemo<Child[]>(() => {
    const dateKey = selectedDate;
    const notesForDate = attendanceNotes[dateKey] || {};
    const recordsForDate = attendanceRecords?.[dateKey] || {};
    const list: Child[] = [];

    sourceChildren.forEach((child: any) => {
      if (child.status === 'Non-Aktif') return;

      const sessionsForDay: TherapySession[] = [];
      const seenSessionIds = new Set<string>();

      // 1. From recurringSessions matching selectedDayOfWeek
      if (child.recurringSessions && Array.isArray(child.recurringSessions)) {
        child.recurringSessions.forEach((rec: RecurringSession) => {
          if (rec.day === selectedDayOfWeek) {
            let assignedTherapistId = rec.therapistId;
            if (!assignedTherapistId || assignedTherapistId === 'any') {
              const matchedTherapist = therapists.find(t => t.specialties?.includes(rec.type as string));
              assignedTherapistId = matchedTherapist?.id || therapists[0]?.id || 'T11';
            }

            const sessionId = `s-recur-${child.id}-${selectedDayOfWeek.replace(/\s/g, '')}-${rec.time}`;
            seenSessionIds.add(sessionId);

            const noteVal = notesForDate[sessionId];

            let noteText = '';
            let photoUrls: string[] = [];
            let detailedProgress: DetailedProgress | undefined = undefined;
            let audioUrl: string | undefined = undefined;
            let audioDuration: number | undefined = undefined;
            let sessionGoal = '';
            let activitiesDone = '';
            let therapyResult = '';
            let childProgress = '';
            let obstaclesFound = '';
            let nextTarget = '';
            let homeActivityAdvice = '';

            if (noteVal) {
              if (typeof noteVal === 'string') {
                noteText = noteVal;
              } else {
                noteText = noteVal.note || '';
                photoUrls = noteVal.photoUrls || [];
                detailedProgress = noteVal.detailedProgress;
                audioUrl = noteVal.audioUrl;
                audioDuration = noteVal.audioDuration;
                sessionGoal = noteVal.sessionGoal || '';
                activitiesDone = noteVal.activitiesDone || '';
                therapyResult = noteVal.therapyResult || '';
                childProgress = noteVal.childProgress || '';
                obstaclesFound = noteVal.obstaclesFound || '';
                nextTarget = noteVal.nextTarget || '';
                homeActivityAdvice = noteVal.homeActivityAdvice || '';
              }
            }

            const status = recordsForDate[sessionId] || AttendanceStatus.PENDING;

            sessionsForDay.push({
              id: sessionId,
              type: rec.type,
              therapistId: assignedTherapistId,
              time: rec.time,
              status: status,
              note: noteText,
              photoUrls: photoUrls,
              audioUrl: audioUrl,
              audioDuration: audioDuration,
              detailedProgress: detailedProgress,
              sessionGoal,
              activitiesDone,
              therapyResult,
              childProgress,
              obstaclesFound,
              nextTarget,
              homeActivityAdvice
            });
          }
        });
      }

      // 2. Also include any extra session or recorded note for this date
      Object.keys(notesForDate).forEach(sId => {
        if (
          !seenSessionIds.has(sId) &&
          (sId.includes(`-${child.id}-`) || sId.includes(`-${child.id}`) || sId.startsWith(`s-recur-${child.id}-`) || sId.startsWith(`s-man-${child.id}-`))
        ) {
          seenSessionIds.add(sId);
          const noteVal = notesForDate[sId];
          if (noteVal) {
            let noteText = typeof noteVal === 'string' ? noteVal : (noteVal.note || '');
            let photoUrls = typeof noteVal === 'object' ? (noteVal.photoUrls || []) : [];
            let detailedProgress = typeof noteVal === 'object' ? noteVal.detailedProgress : undefined;
            let audioUrl = typeof noteVal === 'object' ? noteVal.audioUrl : undefined;
            let audioDuration = typeof noteVal === 'object' ? noteVal.audioDuration : undefined;
            let therapyType = typeof noteVal === 'object' ? (noteVal.type || 'OT') : 'OT';
            let therapistId = typeof noteVal === 'object' ? (noteVal.therapistId || myTherapistId) : myTherapistId;

            let timeLabel = '08:00 - 09:00';
            const parts = sId.split('-');
            if (parts.length >= 5) {
              timeLabel = parts[parts.length - 1];
            }

            sessionsForDay.push({
              id: sId,
              type: therapyType,
              therapistId: therapistId,
              time: timeLabel,
              status: recordsForDate[sId] || AttendanceStatus.PRESENT,
              note: noteText,
              photoUrls,
              audioUrl,
              audioDuration,
              detailedProgress
            });
          }
        }
      });

      if (sessionsForDay.length > 0) {
        sessionsForDay.sort((a, b) => a.time.localeCompare(b.time));
        list.push({
          ...child,
          sessions: sessionsForDay
        });
      }
    });

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sourceChildren, selectedDayOfWeek, selectedDate, attendanceNotes, attendanceRecords, therapists, myTherapistId]);

  // Filtered scheduled children by therapistFilter and search term
  const filteredScheduledChildren = useMemo(() => {
    return scheduledChildrenForDate.filter(child => {
      // 1. Therapist filter (Semua Siswa vs Jadwal Saya)
      if (!isFamilyPortal && therapistFilter === 'MINE') {
        const hasMySession = child.sessions.some(s => 
          s.therapistId === myTherapistId || 
          s.therapistId === loggedInUserId ||
          !s.therapistId || 
          s.therapistId === 'any'
        );
        if (!hasMySession) return false;
      }

      // 2. Search query filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = child.name.toLowerCase().includes(q);
        const matchesClass = child.className?.toLowerCase().includes(q);
        const matchesType = child.sessions.some(s => s.type.toLowerCase().includes(q));
        return matchesName || matchesClass || matchesType;
      }

      return true;
    });
  }, [scheduledChildrenForDate, isFamilyPortal, therapistFilter, myTherapistId, loggedInUserId, searchTerm]);

  // Count of scheduled students for current therapist
  const myScheduledChildrenCount = useMemo(() => {
    return scheduledChildrenForDate.filter(child => 
      child.sessions.some(s => 
        s.therapistId === myTherapistId || 
        s.therapistId === loggedInUserId ||
        !s.therapistId || 
        s.therapistId === 'any'
      )
    ).length;
  }, [scheduledChildrenForDate, myTherapistId, loggedInUserId]);

  // For compatibility with legacy variable references:
  const childrenWithSessionsAtDate = filteredScheduledChildren;

  // Keep selectedChildId and activeSessionId valid when date or schedule changes
  useEffect(() => {
    if (isFamilyPortal) return;
    if (scheduledChildrenForDate.length > 0) {
      const isCurrentChildScheduled = scheduledChildrenForDate.some(c => c.id === selectedChildId);
      if (!isCurrentChildScheduled) {
        const firstChild = scheduledChildrenForDate[0];
        setSelectedChildId(firstChild.id);
        setActiveSessionId(firstChild.sessions[0]?.id || null);
      }
    }
  }, [scheduledChildrenForDate, isFamilyPortal, selectedChildId]);

  const selectedChild = useMemo(() => {
    if (selectedChildId) {
      const matchInScheduled = scheduledChildrenForDate.find(c => c.id === selectedChildId);
      if (matchInScheduled) return matchInScheduled;

      const matchInSource = sourceChildren.find((c: any) => c.id === selectedChildId);
      if (matchInSource) {
        const rec = matchInSource.recurringSessions?.find((r: any) => r.day === selectedDayOfWeek) || matchInSource.recurringSessions?.[0];
        const sType = rec?.type || 'OT';
        const sTime = rec?.time || '08:00 - 09:00';
        const sTherapist = rec?.therapistId || myTherapistId;
        const sessionId = `s-recur-${matchInSource.id}-${selectedDayOfWeek.replace(/\s/g, '')}-${sTime}`;
        const noteVal = attendanceNotes[selectedDate]?.[sessionId];

        return {
          ...matchInSource,
          sessions: [{
            id: sessionId,
            type: sType,
            time: sTime,
            therapistId: sTherapist,
            status: AttendanceStatus.PENDING,
            note: typeof noteVal === 'string' ? noteVal : (noteVal?.note || ''),
            photoUrls: noteVal?.photoUrls || [],
            detailedProgress: noteVal?.detailedProgress,
            audioUrl: noteVal?.audioUrl,
            audioDuration: noteVal?.audioDuration
          }]
        };
      }
    }
    return filteredScheduledChildren[0] || scheduledChildrenForDate[0] || sourceChildren[0];
  }, [selectedChildId, scheduledChildrenForDate, sourceChildren, selectedDayOfWeek, selectedDate, attendanceNotes, myTherapistId, filteredScheduledChildren]);

  const childProgram = therapyPrograms.find(p => p.childId === selectedChildId);

  const formatIndonesianDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
  };

  // All historical notes for this child compiled from all dates in attendanceNotes & sessions
  const allPastNotes = useMemo(() => {
    const cid = selectedChildId || selectedChild?.id;
    if (!cid) return [];
    
    const list: (TherapySession & { date: string })[] = [];
    const seen = new Set<string>();
    
    // 1. Check all entries in attendanceNotes across dates
    Object.keys(attendanceNotes || {}).forEach(dateKey => {
         const dateEntries = attendanceNotes[dateKey] || {};
         Object.keys(dateEntries).forEach(sessionId => {
             if (
               sessionId.includes(`-${cid}-`) || 
               sessionId.includes(`-${cid}`) || 
               sessionId.startsWith(`s-recur-${cid}-`) || 
               sessionId.startsWith(`s-man-${cid}-`)
             ) {
                 const rawVal = dateEntries[sessionId];
                 if (!rawVal) return;
                 
                 let noteText = '';
                 let photoUrls: string[] = [];
                 let detailedProgress: DetailedProgress | undefined = undefined;
                 let audioUrl: string | undefined = undefined;
                 let audioDuration: number | undefined = undefined;
                 let therapyType = 'OT';
                 let therapistId = '';
                 
                 if (typeof rawVal === 'string') {
                     noteText = rawVal;
                 } else {
                     noteText = rawVal.note || '';
                     photoUrls = rawVal.photoUrls || [];
                     detailedProgress = rawVal.detailedProgress;
                     audioUrl = rawVal.audioUrl;
                     audioDuration = rawVal.audioDuration;
                     therapyType = rawVal.type || 'OT';
                     therapistId = rawVal.therapistId || '';
                 }
                 
                 if (noteText || photoUrls.length > 0 || detailedProgress || audioUrl) {
                     let timeLabel = '08:00';
                     const parts = sessionId.split('-');
                     if (sessionId.includes('recur') && parts.length >= 5) {
                         timeLabel = parts[parts.length - 1];
                     } else if (sessionId.includes('man')) {
                         timeLabel = 'Sesi Khusus';
                     }

                     const dateLabel = formatIndonesianDate(dateKey);
                     const uniqueKey = `${dateKey}_${sessionId}`;
                     if (!seen.has(uniqueKey)) {
                       seen.add(uniqueKey);
                       list.push({
                           id: sessionId,
                           date: dateKey,
                           type: therapyType,
                           therapistId: therapistId,
                           time: `${dateLabel} • ${timeLabel}`,
                           status: AttendanceStatus.PRESENT,
                           note: noteText,
                           photoUrls,
                           audioUrl,
                           audioDuration,
                           detailedProgress
                       });
                     }
                 }
             }
         });
    });

    // 2. Also check selectedChild's direct sessions if they contain notes/photos/progress
    if (selectedChild?.sessions) {
      selectedChild.sessions.forEach((sess: any) => {
        if (sess.note || (sess.photoUrls && sess.photoUrls.length > 0) || sess.detailedProgress || sess.audioUrl) {
          const uniqueKey = `${selectedDate}_${sess.id}`;
          if (!seen.has(uniqueKey) && !seen.has(sess.id)) {
            seen.add(uniqueKey);
            const dateLabel = formatIndonesianDate(selectedDate);
            list.push({
              id: sess.id,
              date: selectedDate,
              type: sess.type,
              therapistId: sess.therapistId,
              time: `${dateLabel} • ${sess.time}`,
              status: AttendanceStatus.PRESENT,
              note: sess.note || '',
              photoUrls: sess.photoUrls || [],
              audioUrl: sess.audioUrl,
              audioDuration: sess.audioDuration,
              detailedProgress: sess.detailedProgress
            });
          }
        }
      });
    }

    // 3. Fallback rich initial records for child if no attendanceNotes yet
    if (list.length === 0 && selectedChild) {
      const progs = selectedChild.recurringSessions?.map(s => s.type) || ['OT', 'TW'];
      const defaultTherapistId = therapists[0]?.id || 'T11';

      list.push({
        id: `sample-${selectedChild.id}-1`,
        date: '2026-09-28',
        type: progs[0] || 'OT',
        therapistId: defaultTherapistId,
        time: 'Senin, 28 September 2026 • 08:00 - 09:00',
        status: AttendanceStatus.PRESENT,
        note: `Sesi Terapi ${progs[0] || 'Okupasi'}: Ananda ${selectedChild.name} menunjukkan regulasi sensorik dan atensi mandiri yang sangat baik. Mampu fokus pada aktivitas meja selama 15 menit tanpa distraksi berarti dan merespon instruksi terapis dengan kooperatif.`,
        sessionGoal: 'Meningkatkan rentang fokus mandiri, atensi visual, dan koordinasi bilateral.',
        activitiesDone: 'Sensori integrasi ayunan vestibular, puzzle 3D tingkat menengah, dan meronce manik pola warna.',
        therapyResult: 'Mampu mempertahankan konsentrasi selama 15 menit dan menyelesaikan tugas mandiri 85%.',
        childProgress: 'Regulasi emosi meningkat signifikan, lebih adaptif terhadap transisi pergantian alat permainan.',
        obstaclesFound: 'Tidak ada kendala yang berarti, anak kooperatif sepanjang 60 menit sesi.',
        nextTarget: 'Melatih kemampuan motorik halus memegang alat tulis pola tripod dan stabilitas postural.',
        homeActivityAdvice: 'Latihan kontak mata responsif sebelum makan dan stimulasi meremas playdough 10 menit setiap sore.',
        detailedProgress: {
          interventionPrograms: ensureInterventionPrograms(),
          exerciseProgress: [
            { label: 'Kontak mata', checked: true },
            { label: 'Proprioseptif', checked: true },
            { label: 'Vestibular', checked: false },
            { label: 'Fine motor', checked: true },
            { label: 'Gross motor', checked: true }
          ],
          functionalActivities: [
            { activity: 'Menyusun puzzle geometri 3D', independence: 'Mandiri', accuracy: '90%' },
            { activity: 'Meronce pola warna 10 butir', independence: 'Mandiri (Bantuan Minimal)', accuracy: '85%' }
          ],
          weaknessObservations: [
            { label: 'Inatensi', checked: false },
            { label: 'Regulasi', checked: false },
            { label: 'Respon Instruksi', checked: false }
          ],
          responseToIntervention: 'Sangat responsif dan kooperatif dengan media terapeutik interaktif.'
        }
      });

      list.push({
        id: `sample-${selectedChild.id}-2`,
        date: '2026-09-24',
        type: progs[1] || 'TW',
        therapistId: therapists[1]?.id || defaultTherapistId,
        time: 'Kamis, 24 September 2026 • 10:00 - 11:00',
        status: AttendanceStatus.PRESENT,
        note: `Sesi Terapi ${progs[1] || 'Wicara'}: Latihan artikulasi fonem bilabial (b, p, m) dan pengenalan kosakata ekspresif. Ananda ${selectedChild.name} mampu menirukan kata 2 suku kata dan mengidentifikasi 8 kartu gambar benda secara mandiri.`,
        sessionGoal: 'Peningkatan bahasa reseptif, imitasi verbal 2 suku kata, dan artikulasi fonem dasar.',
        activitiesDone: 'Tebak gambar kosakata benda sehari-hari, latihan oral motor meniup peluit, dan cermin visual.',
        therapyResult: 'Mampu menirukan 8 dari 10 kata dengan artikulasi jelas dan kontak mata konsisten.',
        childProgress: 'Keberanian bersuara meningkat, mulai spontan menyebutkan nama mainan yang diinginkan.',
        obstaclesFound: 'Sedikit terdistraksi di 5 menit awal sesi, kembali fokus setelah diberikan media cermin visual.',
        nextTarget: 'Meningkatkan ekspresi verbal 2 kata bermakna (SPO sederhana) dan pemahaman instruksi 2 tahap.',
        homeActivityAdvice: 'Ajak ananda menyebutkan nama benda di sekitar rumah saat beraktivitas santai bersama keluarga.',
        detailedProgress: {
          interventionPrograms: ensureInterventionPrograms(),
          exerciseProgress: [
            { label: 'Kontak mata', checked: true },
            { label: 'Proprioseptif', checked: false },
            { label: 'Vestibular', checked: false },
            { label: 'Fine motor', checked: false },
            { label: 'Gross motor', checked: false }
          ],
          functionalActivities: [
            { activity: 'Menirukan kata benda bergambar', independence: 'Mandiri', accuracy: '80%' },
            { activity: 'Meniup peluit oral motor', independence: 'Mandiri', accuracy: '90%' }
          ],
          weaknessObservations: [
            { label: 'Inatensi', checked: false },
            { label: 'Regulasi', checked: false },
            { label: 'Respon Instruksi', checked: false }
          ],
          responseToIntervention: 'Antusias melihat gerakan bibir terapis di cermin visual.'
        }
      });
    }

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceNotes, selectedChildId, selectedChild, selectedDate, therapists]);

  // Robust session resolution: today's session, selected history session, or latest past note
  const activeSession = useMemo<TherapySession | undefined>(() => {
    // 1. Try finding by activeSessionId in today's sessions
    if (activeSessionId && selectedChild?.sessions) {
      const matchToday = selectedChild.sessions.find((s: any) => s.id === activeSessionId);
      if (matchToday) return matchToday;
    }

    // 2. Try finding by activeSessionId in allPastNotes
    if (activeSessionId && allPastNotes.length > 0) {
      const matchPast = allPastNotes.find(s => s.id === activeSessionId);
      if (matchPast) return matchPast;
    }

    // 3. Fallback to today's first session
    if (selectedChild?.sessions && selectedChild.sessions.length > 0) {
      return selectedChild.sessions[0];
    }

    // 4. Fallback to latest past note from history archive
    if (allPastNotes.length > 0) {
      return allPastNotes[0];
    }

    // 5. Fallback to synthetic shell from recurring sessions
    if (selectedChild) {
      const rec = selectedChild.recurringSessions?.[0] || { type: 'OT', time: '08:00 - 09:00', therapistId: 'T11' };
      return {
        id: `virtual-${selectedChild.id}`,
        type: rec.type,
        time: rec.time,
        therapistId: rec.therapistId,
        status: AttendanceStatus.PRESENT,
        note: '',
        photoUrls: []
      } as TherapySession;
    }

    return undefined;
  }, [selectedChild, activeSessionId, allPastNotes]);

  // Keep activeSessionId in sync with resolved activeSession
  useEffect(() => {
    if (!activeSessionId && activeSession) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId]);

  // Auto-select child and session for student & family portal
  useEffect(() => {
    if (isFamilyPortal && !selectedChildId) {
      const targetChild = (targetStudentId ? (allChildren?.find(c => c.id === targetStudentId) || children.find(c => c.id === targetStudentId)) : null) || children[0] || allChildren?.[0];
      if (targetChild) {
        setSelectedChildId(targetChild.id);
        if (targetChild.sessions && targetChild.sessions.length > 0) {
          setActiveSessionId(targetChild.sessions[0].id);
        }
      }
    }
  }, [isFamilyPortal, selectedChildId, children, allChildren, targetStudentId]);

  useEffect(() => {
    if (isFamilyPortal && selectedChild && !activeSessionId && selectedChild.sessions && selectedChild.sessions.length > 0) {
      setActiveSessionId(selectedChild.sessions[0].id);
    }
  }, [isFamilyPortal, selectedChild, activeSessionId]);

  // Synchronize therapy program tab with active session type
  useEffect(() => {
    if (activeSession?.type) {
      let cat: TherapyProgramCategory = 'OT';
      const uType = activeSession.type.toUpperCase();
      if (uType === 'TW' || uType === 'WICARA') cat = 'TW';
      else if (uType === 'FT' || uType === 'FISIOTERAPI') cat = 'FT';
      else if (uType === 'REMEDIAL' || uType === 'REM') cat = 'REM';
      else if (uType === 'HT' || uType === 'HIDROTERAPI' || uType === 'HYDRO') cat = 'HT';
      else if (uType === 'BERKUDA' || uType === 'TERAPI BERKUDA' || uType === 'EQUINE') cat = 'BERKUDA';
      setProgramCategoryTab(cat);
    }
  }, [activeSession?.type]);

  // Synchronize clinical note fields with active session
  useEffect(() => {
    if (activeSession) {
      setSessionGoal(activeSession.sessionGoal || 'Meningkatkan rentang konsentrasi dan atensi fokus selama 15 menit mandiri serta kontak mata responsif.');
      setSessionActivities(activeSession.activitiesDone || 'Latihan sensori integrasi vestibular ayunan, permainan balok susun dengan instruksi 2 tahap, dan puzzle berurutan.');
      setSessionOutcome(activeSession.therapyResult || 'Ananda mampu mempertahankan fokus selama 12 menit dan merespon panggilan nama dengan kontak mata 4 dari 5 kesempatan.');
      setChildProgress(activeSession.childProgress || 'Regulasi emosi meningkat signifikan, lebih tenang menghadapi transisi kegiatan dan mulai meminimalisir tantrum.');
      setSessionObstacles(activeSession.obstaclesFound || 'Sedikit terdistraksi oleh stimulus suara keras dari luar ruangan pada 5 menit awal sesi.');
      setNextTarget(activeSession.nextTarget || 'Meningkatkan kemampuan meniru kata 2 suku kata dan latihan motorik halus memegang sendok secara mandiri.');
      setHomeSuggestions(activeSession.homeActivityAdvice || 'Ajak ananda melakukan latihan kontak mata sebelum makan dan stimulasi meremas playdough 10 menit setiap sore bersama keluarga.');
      setNoteText(activeSession.note || '');
      setSelectedPhotos(activeSession.photoUrls || []);
      setVoiceNoteUrl(activeSession.audioUrl || null);
      setVoiceNoteDuration(activeSession.audioDuration || 0);
      if (activeSession.detailedProgress) {
        setDetailedProgress({
          ...activeSession.detailedProgress,
          interventionPrograms: ensureInterventionPrograms(activeSession.detailedProgress.interventionPrograms)
        });
      }
    }
  }, [activeSession?.id, selectedChildId]);

  // Status Feedback: Menunggu Feedback vs Sudah Diberi Feedback
  const hasParentFeedback = useMemo(() => {
    if (!selectedChildId) return false;
    const comments = getStoredComments();
    return comments.some(c => 
      c.studentId === selectedChildId && 
      (c.sessionDate === selectedDate || (activeSessionId && c.sessionId === activeSessionId)) && 
      !c.isDraft
    );
  }, [selectedChildId, selectedDate, activeSessionId]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setNoteText(prev => {
            const trimmed = prev.trim();
            const prefix = trimmed ? (trimmed.endsWith('.') ? ' ' : '. ') : '';
            const capitalized = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1);
            return prev + prefix + capitalized;
          });
          setLiveTranscript('');
        } else if (interim) {
          setLiveTranscript(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
          setMicPermissionError("Izin mikrofon belum diberikan. Silakan aktifkan izin mikrofon di browser Anda.");
          setTimeout(() => setMicPermissionError(null), 6000);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.log("Recognition auto-restart:", e);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Use a second effect to handle the start/stop based on isListening state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    } else {
      try {
        recognitionRef.current.stop();
        setLiveTranscript('');
      } catch (e) {
        // Already stopped
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicPermissionError("Browser ini belum mendukung Speech Recognition. Anda tetap bisa menggunakan tombol 'Rekam Voice Note' untuk merekam suara.");
      setTimeout(() => setMicPermissionError(null), 5000);
      return;
    }
    setMicPermissionError(null);
    setIsListening(prev => !prev);
  };

  const startVoiceNoteRecording = async () => {
    setMicPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setVoiceNoteUrl(base64data);
        };
        reader.readAsDataURL(audioBlob);

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecordingVoiceNote(true);
      setRecordingSeconds(0);

      // Concurrently activate Speech Recognition so spoken words are also dictated into text!
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && recognitionRef.current) {
        setIsListening(true);
      }

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setMicPermissionError("Tidak dapat mengakses mikrofon. Pastikan Anda mengizinkan akses mic pada browser.");
      setTimeout(() => setMicPermissionError(null), 6000);
    }
  };

  const stopVoiceNoteRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setVoiceNoteDuration(recordingSeconds || 1);
    setIsRecordingVoiceNote(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (isListening) {
      setIsListening(false);
    }
    setLiveTranscript('');
  };

  const cancelVoiceNoteRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingVoiceNote(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (isListening) {
      setIsListening(false);
    }
    setLiveTranscript('');
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setVoiceNoteUrl(dataUrl);

      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setVoiceNoteDuration(Math.round(tempAudio.duration));
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteVoiceNote = () => {
    setVoiceNoteUrl(null);
    setVoiceNoteDuration(0);
  };

  const handleSelectSession = (childId: string, sessionId: string) => {
    setSelectedChildId(childId);
    setActiveSessionId(sessionId);
    const child = children.find(c => c.id === childId);
    const session = child?.sessions.find(s => s.id === sessionId);
    setNoteText(session?.note || '');
    setSelectedPhotos(session?.photoUrls || []);
    setVoiceNoteUrl(session?.audioUrl || null);
    setVoiceNoteDuration(session?.audioDuration || 0);
    setIsRecordingVoiceNote(false);
    setLiveTranscript('');
    
    // Set detailed progress if exists, otherwise reset to default
    if (session?.detailedProgress) {
        setDetailedProgress({
          ...session.detailedProgress,
          interventionPrograms: ensureInterventionPrograms(session.detailedProgress.interventionPrograms)
        });
    } else {
        setDetailedProgress({
            interventionPrograms: [...DEFAULT_INTERVENTION_PROGRAMS],
            exerciseProgress: [
              { label: 'Kontak mata', checked: false },
              { label: 'Proprioseptif', checked: false },
              { label: 'Vestibular', checked: false },
              { label: 'Fine motor', checked: false },
              { label: 'Gross motor', checked: false }
            ],
            functionalActivities: [
              { activity: '', independence: '', accuracy: '' }
            ],
            weaknessObservations: [
              { label: 'Inatensi', checked: false },
              { label: 'Regulasi', checked: false },
              { label: 'Respon Instruksi', checked: false }
            ],
            responseToIntervention: ''
        });
    }
    
    setSaveStatus('idle');
    setShowHistory(false);
    setShowProgram(false);
    setActiveMainTab('catatan');
    setSelectedHistoryNotes([]);
  };

  const handleEditHistoryNote = (sessionId: string) => {
    if (!selectedChildId && selectedChild) {
      setSelectedChildId(selectedChild.id);
    }
    setActiveSessionId(sessionId);
    
    const session = allPastNotes.find(s => s.id === sessionId);
    setNoteText(session?.note || '');
    setSelectedPhotos(session?.photoUrls || []);
    setVoiceNoteUrl(session?.audioUrl || null);
    setVoiceNoteDuration(session?.audioDuration || 0);
    setIsRecordingVoiceNote(false);
    setLiveTranscript('');
    
    if (session?.detailedProgress) {
        setDetailedProgress({
          ...session.detailedProgress,
          interventionPrograms: ensureInterventionPrograms(session.detailedProgress.interventionPrograms)
        });
    } else {
        setDetailedProgress({
            interventionPrograms: [...DEFAULT_INTERVENTION_PROGRAMS],
            exerciseProgress: [
              { label: 'Kontak mata', checked: false },
              { label: 'Proprioseptif', checked: false },
              { label: 'Vestibular', checked: false },
              { label: 'Fine motor', checked: false },
              { label: 'Gross motor', checked: false }
            ],
            functionalActivities: [
              { activity: '', independence: '', accuracy: '' }
            ],
            weaknessObservations: [
              { label: 'Inatensi', checked: false },
              { label: 'Regulasi', checked: false },
              { label: 'Respon Instruksi', checked: false }
            ],
            responseToIntervention: ''
        });
    }

    if (session) {
      setSessionGoal(session.sessionGoal || 'Meningkatkan rentang konsentrasi dan atensi fokus selama 15 menit mandiri serta kontak mata responsif.');
      setSessionActivities(session.activitiesDone || 'Latihan sensori integrasi vestibular ayunan, permainan balok susun dengan instruksi 2 tahap, dan puzzle berurutan.');
      setSessionOutcome(session.therapyResult || 'Ananda mampu mempertahankan fokus selama 12 menit dan merespon panggilan nama dengan kontak mata 4 dari 5 kesempatan.');
      setChildProgress(session.childProgress || 'Regulasi emosi meningkat signifikan, lebih tenang menghadapi transisi kegiatan dan mulai meminimalisir tantrum.');
      setSessionObstacles(session.obstaclesFound || 'Sedikit terdistraksi oleh stimulus suara keras dari luar ruangan pada 5 menit awal sesi.');
      setNextTarget(session.nextTarget || 'Meningkatkan kemampuan meniru kata 2 suku kata dan latihan motorik halus memegang sendok secara mandiri.');
      setHomeSuggestions(session.homeActivityAdvice || 'Ajak ananda melakukan latihan kontak mata sebelum makan dan stimulasi meremas playdough 10 menit setiap sore bersama keluarga.');
    }

    setShowHistory(false);
    setShowProgram(false);
    setActiveMainTab('catatan');
    setSaveStatus('idle');
  };

  const toggleHistorySelection = (sessionId: string) => {
    setSelectedHistoryNotes(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const toggleSelectAllHistory = () => {
    if (selectedHistoryNotes.length === allPastNotes.length) {
      setSelectedHistoryNotes([]);
    } else {
      setSelectedHistoryNotes(allPastNotes.map(n => n.id));
    }
  };

  const toggleExpandNote = (noteId: string) => {
    setExpandedNoteIds(prev => 
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const filteredHistoryNotes = useMemo(() => {
    return allPastNotes.filter(note => {
      // Category filter
      if (historyCategoryFilter !== 'ALL') {
        const uType = (note.type || '').toUpperCase();
        if (historyCategoryFilter === 'OT' && uType !== 'OT' && !uType.includes('OKUPASI')) return false;
        if (historyCategoryFilter === 'TW' && uType !== 'TW' && !uType.includes('WICARA')) return false;
        if (historyCategoryFilter === 'FT' && uType !== 'FT' && !uType.includes('FISIO')) return false;
        if (historyCategoryFilter === 'REM' && uType !== 'REM' && !uType.includes('REMEDIAL')) return false;
        if (historyCategoryFilter === 'HT' && uType !== 'HT' && !uType.includes('HIDRO') && !uType.includes('HYDRO')) return false;
        if (historyCategoryFilter === 'BERKUDA' && uType !== 'BERKUDA' && !uType.includes('KUDA') && !uType.includes('EQUINE')) return false;
      }

      // Keyword search
      if (historySearch.trim()) {
        const query = historySearch.toLowerCase();
        const noteMatch = (note.note || '').toLowerCase().includes(query);
        const timeMatch = (note.time || '').toLowerCase().includes(query);
        const dateMatch = (note.date || '').toLowerCase().includes(query);
        const therapist = therapists.find(t => t.id === note.therapistId);
        const therapistMatch = (therapist?.name || '').toLowerCase().includes(query);
        const respMatch = (note.detailedProgress?.responseToIntervention || '').toLowerCase().includes(query);
        if (!noteMatch && !timeMatch && !dateMatch && !therapistMatch && !respMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allPastNotes, historyCategoryFilter, historySearch, therapists]);

  const targetNotesForPrint = useMemo(() => {
    if (printModalSpecificNotes && printModalSpecificNotes.length > 0) {
      return printModalSpecificNotes;
    }
    if (selectedHistoryNotes.length > 0) {
      return allPastNotes.filter(n => selectedHistoryNotes.includes(n.id));
    }
    return allPastNotes;
  }, [allPastNotes, selectedHistoryNotes, printModalSpecificNotes]);

  const handlePrint = (notesOverride?: (TherapySession & { date: string })[]) => {
    if (!selectedChild) return;
    setPrintModalSpecificNotes(notesOverride || null);
    setPrintModalAutoPrint(true);
    setPrintModalAutoDownload(false);
    setShowPrintPreviewModal(true);
  };

  const handlePrintSingleNote = (note: TherapySession & { date: string }) => {
    handlePrint([note]);
  };

  const handleDownloadPdf = (notesOverride?: (TherapySession & { date: string })[]) => {
    if (!selectedChild) return;
    setPrintModalSpecificNotes(notesOverride || null);
    setPrintModalAutoPrint(false);
    setPrintModalAutoDownload(true);
    setShowPrintPreviewModal(true);
  };

  const handleDownloadSingleNotePdf = (note: TherapySession & { date: string }) => {
    handleDownloadPdf([note]);
  };

  const handleOpenPrintPreview = (notesOverride?: (TherapySession & { date: string })[]) => {
    if (!selectedChild) return;
    setPrintModalSpecificNotes(notesOverride || null);
    setPrintModalAutoPrint(false);
    setPrintModalAutoDownload(false);
    setShowPrintPreviewModal(true);
  };

  const handleCopyProgramToNote = (item: any) => {
    setNoteText(prev => {
      const header = `[Target Terapi: ${item.targetTerapi}]`;
      const activity = `- Aktivitas: ${item.aktifitasTerapi}`;
      const desc = item.keterangan ? `- Keterangan: ${item.keterangan}` : '';
      const addition = `${header}\n${activity}${desc ? '\n' + desc : ''}`;
      return prev ? `${prev}\n\n${addition}` : addition;
    });
  };

  const handleAddToFunctionalActivities = (item: any) => {
    setDetailedProgress(prev => {
      const labelText = item.aktifitasTerapi || item.targetTerapi;
      const alreadyExists = prev.functionalActivities.some(a => a.activity.toLowerCase() === labelText.toLowerCase());
      if (alreadyExists) return prev;
      
      let updatedList = [...prev.functionalActivities];
      if (updatedList.length === 1 && updatedList[0].activity === '') {
        updatedList = [{ activity: labelText, independence: '', accuracy: '' }];
      } else {
        updatedList.push({ activity: labelText, independence: '', accuracy: '' });
      }
      
      return {
        ...prev,
        functionalActivities: updatedList
      };
    });
  };

  const handleAddToInterventionList = (item: any) => {
    setDetailedProgress(prev => {
      const labelText = item.aktifitasTerapi || item.targetTerapi;
      const alreadyExists = prev.interventionPrograms.some(ip => ip.label.toLowerCase() === labelText.toLowerCase());
      if (alreadyExists) return prev;
      
      return {
        ...prev,
        interventionPrograms: [
          ...prev.interventionPrograms,
          { label: labelText, checked: true }
        ]
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenProgramMenu = (overrideCategory?: TherapyProgramCategory) => {
    if (!selectedChild) return;
    // Auto-save current session note if content is being written
    if (selectedChildId && activeSessionId && (noteText || (selectedPhotos && selectedPhotos.length > 0))) {
      onUpdateSession(selectedChildId, activeSessionId, { 
          note: noteText,
          photoUrls: selectedPhotos,
          detailedProgress: detailedProgress,
          type: activeSession?.type,
          therapistId: activeSession?.therapistId
      });
    }
    const catToOpen = overrideCategory || (activeSession?.type as TherapyProgramCategory) || programCategoryTab || 'OT';
    if (onNavigateToProgram) {
      onNavigateToProgram(selectedChild.id, catToOpen);
    } else {
      setShowProgram(!showProgram);
      setShowHistory(false);
    }
  };

  const handleSaveNote = () => {
    if (selectedChildId && activeSessionId) {
      setSaveStatus('saving');
      setTimeout(() => {
        onUpdateSession(selectedChildId, activeSessionId, { 
            note: noteText,
            photoUrls: selectedPhotos,
            audioUrl: voiceNoteUrl || undefined,
            audioDuration: voiceNoteDuration || undefined,
            detailedProgress: detailedProgress,
            type: activeSession?.type,
            therapistId: activeSession?.therapistId,
            sessionGoal,
            activitiesDone: sessionActivities,
            therapyResult: sessionOutcome,
            childProgress,
            obstaclesFound: sessionObstacles,
            nextTarget,
            homeActivityAdvice: homeSuggestions
        });
        // Send notification to parents that latest therapy note is ready!
        if (selectedChild) {
          notifyTherapyNoteCreated(selectedChild.name, selectedDate);
        }
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus('idle');
          // Clear active session to signal completion and ready for next
          setActiveSessionId(null);
          setNoteText('');
          setSelectedPhotos([]);
          setVoiceNoteUrl(null);
          setVoiceNoteDuration(0);
          setIsRecordingVoiceNote(false);
        }, 1500);
      }, 800);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-text-heading tracking-tight flex items-center gap-3">
            {logoUrl ? (
              <div className="p-1.5 bg-white rounded-xl border border-amber-900/10 shadow-sm flex items-center justify-center">
                <img src={logoUrl} alt="Logo Pelangi Lazuardi" className="h-8 w-8 object-contain" />
              </div>
            ) : (
              <span className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="h-7 w-7 text-primary" />
              </span>
            )}
            Buku Catatan Terapi
          </h2>
          <p className="text-text-muted mt-1">Dokumentasi progres harian anak dalam sesi terapi secara profesional.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-3 bg-surface border-2 border-surface-light rounded-2xl text-text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              className="w-full pl-12 pr-4 py-3 bg-surface border-2 border-surface-light rounded-2xl text-text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Student / Family Portal Header Banner */}
      {isFamilyPortal && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-black text-amber-950 text-base">
                  Buku Catatan Terapi — {selectedChild?.name || 'Siswa'}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-600/30">
                  Akun Siswa / Portal Keluarga
                </span>
              </div>
              <p className="text-amber-900/80 text-xs mt-0.5">
                Akses rekam medis digital, evaluasi harian, foto dokumentasi, pesan suara, dan seluruh arsip riwayat catatan terapi ananda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('riwayat');
                setShowHistory(true);
                setShowProgram(false);
              }}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95",
                showHistory || activeMainTab === 'riwayat'
                  ? "bg-amber-800 text-white shadow-amber-900/30 ring-2 ring-amber-400"
                  : "bg-slate-900 hover:bg-black text-white shadow-slate-900/20"
              )}
            >
              <History className="h-4 w-4 text-amber-400" />
              <span>Buka Buku Riwayat Catatan ({allPastNotes.length})</span>
            </button>
            {(showHistory || activeMainTab === 'riwayat') && (
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('catatan');
                  setShowHistory(false);
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white/80 hover:bg-white text-slate-700 border border-slate-300 transition-all cursor-pointer"
              >
                Lihat Lembar Catatan
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Side: Session Register & Book Index (1/4 width) */}
        <div className={cn(
          "lg:col-span-1 bg-[#FDFBF7] border-2 border-amber-900/15 rounded-[2rem] overflow-hidden flex flex-col shadow-md transition-all duration-300 relative",
          activeSessionId ? "hidden lg:flex" : "flex"
        )}
          style={{
            boxShadow: '0 4px 14px rgba(45, 27, 20, 0.08), 0 1px 3px rgba(45, 27, 20, 0.06)'
          }}
        >
          {/* Header styled like a catalog register tab */}
          <div className="p-4 border-b-2 border-amber-900/10 bg-gradient-to-r from-amber-100/80 via-amber-50/60 to-amber-100/80 flex items-center justify-between">
            <h3 className="font-serif font-black text-amber-950 flex items-center gap-2 text-sm tracking-tight">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-4 w-4 object-contain" />
              ) : (
                <BookOpen className="h-4 w-4 text-amber-800" />
              )}
              <span>Indeks Sesi Terapi</span>
            </h3>
            <span className="px-2.5 py-1 bg-amber-900/10 text-amber-900 text-[10px] font-black rounded-lg uppercase tracking-wider font-mono">
              {new Date(selectedDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {/* Dedicated Student/Family Card & Quick History Access */}
            {isFamilyPortal && selectedChild && (
              <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-900/15 rounded-2xl shadow-xs space-y-2.5 mb-3">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={selectedChild.photoUrl || `https://i.pravatar.cc/100?u=${selectedChild.id}`}
                    alt={selectedChild.name}
                    className="h-10 w-10 rounded-xl object-cover border border-amber-900/20 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-serif font-black text-xs text-amber-950 truncate leading-tight">
                      {selectedChild.name}
                    </p>
                    <p className="text-[10px] text-amber-800 font-semibold mt-0.5">
                      Kelas: {selectedChild.className || '3 MWS'} • Akun Siswa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('riwayat');
                    setShowHistory(true);
                    setShowProgram(false);
                  }}
                  className={cn(
                    "w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95",
                    showHistory || activeMainTab === 'riwayat'
                      ? "bg-amber-800 text-white ring-2 ring-amber-400"
                      : "bg-slate-900 hover:bg-black text-white"
                  )}
                  title="Buka seluruh buku riwayat catatan terapi anak"
                >
                  <History className="h-4 w-4 text-amber-400" />
                  <span>Buka Buku Riwayat ({allPastNotes.length})</span>
                </button>
              </div>
            )}

            {childrenWithSessionsAtDate.map(child => (
              <div key={child.id} className="space-y-1.5 mb-4">
                <div className="px-2 py-1 flex items-center justify-between">
                  <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest truncate max-w-[120px] font-serif">{child.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-amber-800/80 font-bold bg-amber-100/60 px-2 py-0.5 rounded-md">{child.className}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChildId(child.id);
                        setActiveSessionId(child.sessions[0]?.id || null);
                        setShowHistory(true);
                        setShowProgram(false);
                        setActiveMainTab('riwayat');
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded text-[9px] font-bold transition-all shadow-2xs cursor-pointer"
                      title={`Buka Riwayat Catatan ${child.name}`}
                    >
                      <History className="h-3 w-3 text-amber-800" />
                      <span>Riwayat</span>
                    </button>
                  </div>
                </div>
                {child.sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(child.id, session.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-2xl transition-all border-2 flex items-center gap-3 group relative cursor-pointer",
                        activeSessionId === session.id 
                          ? "bg-[#FAF7EE] border-amber-700 shadow-md ring-2 ring-amber-500/20 translate-x-1" 
                          : "bg-white/90 border-amber-900/10 hover:border-amber-400 hover:bg-[#FAF7EE]/70 shadow-sm"
                      )}
                    >
                      <div className="relative">
                        <img 
                          src={child.photoUrl} 
                          alt={child.name} 
                          className="h-10 w-10 rounded-xl object-cover border border-amber-900/20 shadow-sm flex-shrink-0"
                        />
                        <div className="absolute -top-1 -left-1 w-3.5 h-1.5 bg-amber-200/90 rounded-[2px] shadow-[0_1px_1px_rgba(0,0,0,0.15)] rotate-[-15deg] pointer-events-none" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-serif font-black text-sm truncate", activeSessionId === session.id ? "text-amber-950 font-bold" : "text-slate-800")}>
                          {child.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <Clock className="h-3 w-3 text-amber-800" />
                          <span className="font-mono">{session.time}</span>
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-black uppercase tracking-tight">
                            {session.type}
                          </span>
                        </div>
                      </div>
                      {(session.note || (session.photoUrls && session.photoUrls.length > 0)) && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                           <CheckCircle2 className="h-3 w-3" />
                           <span className="hidden sm:inline">Tercatat</span>
                        </div>
                      )}
                    </button>
                ))}
              </div>
            ))}

            {/* If Student Portal has past sessions, show them directly in the index list! */}
            {isFamilyPortal && allPastNotes.length > 0 && (
              <div className="pt-2 border-t border-amber-900/10 space-y-1.5">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-900/70 uppercase tracking-widest font-serif">
                    Daftar Riwayat Catatan
                  </span>
                  <span className="text-[9px] font-bold text-amber-800/80 bg-amber-100 px-1.5 py-0.5 rounded">
                    {allPastNotes.length} Sesi
                  </span>
                </div>

                {allPastNotes.slice(0, 8).map((pastNote) => {
                  const isCurrentActive = activeSession?.id === pastNote.id;
                  const typeDef = therapyTypes.find(t => t.id === pastNote.type);
                  return (
                    <button
                      key={pastNote.id}
                      onClick={() => handleEditHistoryNote(pastNote.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl transition-all border flex items-center gap-2.5 group cursor-pointer relative",
                        isCurrentActive && !showHistory && activeMainTab !== 'riwayat'
                          ? "bg-[#FAF7EE] border-amber-700 shadow-sm ring-2 ring-amber-500/20 translate-x-0.5" 
                          : "bg-white/80 border-slate-200 hover:border-amber-400 hover:bg-[#FAF7EE]/60"
                      )}
                      title={`Buka catatan sesi ${pastNote.time}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        {pastNote.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {pastNote.time}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {typeDef?.name || pastNote.type} • {therapists.find(t => t.id === pastNote.therapistId)?.name || 'Terapis'}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Lihat</span>
                      </div>
                    </button>
                  );
                })}

                {allPastNotes.length > 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMainTab('riwayat');
                      setShowHistory(true);
                      setShowProgram(false);
                    }}
                    className="w-full py-2 text-center text-[11px] font-black text-amber-900 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    + Lihat seluruh {allPastNotes.length} riwayat catatan...
                  </button>
                )}
              </div>
            )}

            {childrenWithSessionsAtDate.length === 0 && !isFamilyPortal && (
              <div className="text-center py-12 px-4">
                <User className="h-12 w-12 text-amber-900/20 mx-auto mb-3" />
                <p className="text-amber-900/50 text-sm italic font-serif">Belum ada sesi untuk pencarian ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: The Physical Notebook View (3/4 width) */}
        <div className={cn(
          "lg:col-span-3 transition-all duration-300 relative",
          !activeSessionId && !activeSession ? "hidden lg:block" : "block"
        )}>
          <AnimatePresence mode="wait">
            {activeSession ? (
              <motion.div
                key={activeSession.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full relative"
              >
                {/* Physical Chapter Index Tabs protruding on the Right Edge */}
                <div className="hidden xl:flex flex-col gap-2 absolute -right-3 top-24 z-30 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => { setShowProgram(false); setShowHistory(false); setActiveMainTab('catatan'); }}
                    className={cn(
                      "px-3 py-3 rounded-r-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex flex-col items-center gap-2 border-y border-r cursor-pointer",
                      !showProgram && !showHistory && activeMainTab === 'catatan'
                        ? "bg-[#FAF7EE] text-amber-950 border-amber-300 translate-x-1 shadow-amber-900/20 font-bold" 
                        : "bg-amber-100 hover:bg-[#FAF7EE] text-slate-600 border-amber-200"
                    )}
                    title="Lembar Catatan Sesi"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="[writing-mode:vertical-lr] rotate-180 py-1">Catatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowProgram(!showProgram); setShowHistory(false); }}
                    className={cn(
                      "px-3 py-3 rounded-r-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex flex-col items-center gap-2 border-y border-r cursor-pointer",
                      showProgram 
                        ? "bg-indigo-600 text-white border-indigo-700 translate-x-1 shadow-indigo-600/30" 
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    )}
                    title="Target Program Terapi"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span className="[writing-mode:vertical-lr] rotate-180 py-1">Program</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { 
                      const next = !showHistory && activeMainTab !== 'riwayat';
                      setShowHistory(next); 
                      setShowProgram(false); 
                      if (next) setActiveMainTab('riwayat');
                      else setActiveMainTab('catatan');
                    }}
                    className={cn(
                      "px-3 py-3 rounded-r-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex flex-col items-center gap-2 border-y border-r cursor-pointer",
                      showHistory || activeMainTab === 'riwayat'
                        ? "bg-amber-800 text-white border-amber-900 translate-x-1 shadow-amber-900/30 font-bold" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                    )}
                    title="Buku Riwayat Catatan Sesi Sebelumnya"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="[writing-mode:vertical-lr] rotate-180 py-1">Riwayat</span>
                  </button>
                </div>

                {/* Hardcover Leather Casing with 3D Page Stack */}
                <div 
                  className="h-full bg-gradient-to-br from-[#2D1B14] via-[#1E110B] to-[#120A07] p-2.5 lg:p-4 rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden border-4 border-[#3D251C]"
                  style={{
                    boxShadow: '3px 1px 0 #F1EBDB, 6px 2px 0 #E7DFC9, 9px 3px 0 #DDD4BD, 12px 4px 0 #D2C8AF, 16px 20px 35px rgba(0,0,0,0.45)'
                  }}
                >
                  {/* Stitched leather thread perimeter */}
                  <div className="absolute inset-2 lg:inset-3 rounded-[2rem] border border-dashed border-amber-600/30 pointer-events-none z-20" />
                  
                  {/* Brass Corner Brackets */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/40 rounded-tl-xl pointer-events-none z-20" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/40 rounded-tr-xl pointer-events-none z-20" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/40 rounded-bl-xl pointer-events-none z-20" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/40 rounded-br-xl pointer-events-none z-20" />

                  {/* Silk Bookmark Ribbon */}
                  <div 
                    className="absolute top-0 right-14 lg:right-24 w-7 lg:w-9 h-20 lg:h-28 shadow-lg z-30 pointer-events-none"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)' }}
                  >
                    <div className="w-full h-full bg-gradient-to-b from-rose-950 via-rose-700 to-rose-800 relative">
                      <div className="absolute inset-y-0 left-1 w-[1px] bg-rose-400/30" />
                      <div className="absolute inset-y-0 right-1 w-[1px] bg-rose-400/30" />
                    </div>
                  </div>

                  {/* The Inner Paper Page */}
                  <div className="h-full bg-[#FAF7EE] rounded-[1.8rem] shadow-inner flex flex-col relative overflow-hidden border border-amber-900/10">
                    {/* Spine Gutter Shadow (Lipatan Tengah Buku) */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 lg:w-24 bg-gradient-to-r from-black/15 via-black/5 to-transparent pointer-events-none z-20" />

                    {/* Wire Binder Coils along the Left Edge */}
                    <div className="absolute left-[-6px] lg:left-[-10px] top-6 bottom-6 flex flex-col justify-between py-2 z-30 pointer-events-none">
                      {[...Array(14)].map((_, i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-2.5 lg:w-3 h-2 lg:h-2.5 bg-[#23150F] rounded-full shadow-inner border border-black/40" />
                          <div className="w-5 lg:w-7 h-2 lg:h-2.5 -ml-1 bg-gradient-to-r from-amber-200 via-slate-100 to-amber-300 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.35)] border border-slate-300" />
                        </div>
                      ))}
                    </div>

                    {/* Double Red Margin Line */}
                    <div className="absolute left-12 lg:left-20 top-0 bottom-0 w-[2px] bg-red-400/40 pointer-events-none z-10" />
                    <div className="absolute left-[52px] lg:left-[84px] top-0 bottom-0 w-[1px] bg-red-400/20 pointer-events-none z-10" />

                    {/* Back button for mobile */}
                    <button 
                      onClick={() => {
                        setActiveSessionId(null);
                        setSelectedChildId(null);
                      }}
                      className="lg:hidden absolute top-4 left-4 z-40 p-2 bg-white/90 rounded-full shadow-md border border-slate-200 flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>

                    {/* Notebook Header */}
                    <div className="pl-14 lg:pl-24 pr-4 lg:pr-8 pt-8 lg:pt-9 pb-5 border-b-2 border-amber-900/10 flex flex-col sm:flex-row items-start justify-between bg-amber-50/40 gap-4 relative z-20">
                      <div className="flex items-center gap-5">
                        {/* Polaroid / Washi-Taped Student Photo */}
                        <div className="relative group/photo">
                          {/* Washi tape strip */}
                          <div 
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-amber-200/80 border border-amber-300/80 shadow-sm z-10 rotate-[-3deg] backdrop-blur-[1px]"
                            style={{ clipPath: 'polygon(0% 15%, 8% 0%, 92% 0%, 100% 20%, 96% 85%, 90% 100%, 10% 100%, 0% 85%)' }}
                          />
                          <div className="bg-white p-1.5 pb-2 rounded-2xl shadow-md border border-amber-900/15 rotate-[-2deg] transition-transform hover:rotate-0">
                            <img 
                              src={selectedChild?.photoUrl} 
                              alt={selectedChild?.name} 
                              className="h-16 w-16 lg:h-18 lg:w-18 rounded-xl object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          {/* Clinical Header Stamp */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {logoUrl && (
                              <img 
                                src={logoUrl} 
                                alt="Logo Pelangi Lazuardi" 
                                className="h-5 w-5 object-contain" 
                              />
                            )}
                            <span className="text-[10px] font-serif font-black tracking-widest text-amber-900/80 uppercase">
                              BUKU CATATAN TERAPI - PELANGI LAZUARDI
                            </span>
                          </div>

                          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-serif italic">
                            {selectedChild?.name}
                          </h3>

                          <div className="flex flex-wrap gap-2.5 mt-2.5 items-center">
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-amber-900/10 shadow-sm">
                              <Calendar className="h-3 w-3 text-amber-700" />
                              <span>{formatIndonesianDate((activeSession as any)?.date || selectedDate)}</span>
                              {(activeSession as any)?.date && (activeSession as any)?.date !== selectedDate && (
                                <span className="ml-1 px-1.5 py-0.2 bg-amber-200/90 text-amber-900 text-[9px] font-black rounded-md">
                                  Riwayat
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-amber-900/10 shadow-sm">
                              <Hash className="h-3 w-3 text-amber-700" />
                              <span>{therapyTypes.find(t => t.id === activeSession.type)?.name || activeSession.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-amber-900/10 shadow-sm">
                              <Clock className="h-3 w-3 text-amber-700" />
                              <span className="font-mono">{activeSession.time}</span>
                            </div>
                            {therapists.find(t => t.id === activeSession.therapistId) && (
                              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-amber-900/10 shadow-sm">
                                <User className="h-3 w-3 text-amber-700" />
                                <span className="truncate max-w-[150px]">{therapists.find(t => t.id === activeSession.therapistId)?.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    <div className="flex flex-col items-end gap-3">
                      {/* 3 Tab Utama: 1. Catatan Terapi, 2. Forum Komunikasi, 3. Buku Riwayat Catatan */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-amber-900/10 rounded-2xl shadow-inner border border-amber-900/15">
                        <button 
                          onClick={() => { setActiveMainTab('catatan'); setShowProgram(false); setShowHistory(false); }}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                            activeMainTab === 'catatan' && !showHistory && !showProgram
                              ? "bg-slate-900 text-white shadow-md"
                              : "text-slate-700 hover:bg-white/60"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>1. Catatan Terapi</span>
                        </button>

                        <button 
                          onClick={() => { setActiveMainTab('komunikasi'); setShowProgram(false); setShowHistory(false); }}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                            activeMainTab === 'komunikasi' && !showHistory && !showProgram
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                              : "text-slate-700 hover:bg-white/60"
                          )}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>2. Forum Komunikasi</span>
                        </button>

                        <button 
                          onClick={() => { setActiveMainTab('riwayat'); setShowProgram(false); setShowHistory(true); }}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                            (activeMainTab === 'riwayat' || showHistory)
                              ? "bg-amber-800 text-white shadow-md shadow-amber-800/20"
                              : "text-slate-700 hover:bg-white/60"
                          )}
                          title="Buka seluruh buku riwayat catatan terapi"
                        >
                          <History className="h-3.5 w-3.5 text-amber-300" />
                          <span>3. Buku Riwayat Catatan</span>
                          {allPastNotes.length > 0 && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                              (activeMainTab === 'riwayat' || showHistory) ? "bg-amber-950 text-amber-200" : "bg-amber-200/80 text-amber-900"
                            )}>
                              {allPastNotes.length}
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => handleOpenProgramMenu()}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border bg-white/70 hover:bg-white text-slate-700 border-slate-200 active:scale-95 group shadow-xs cursor-pointer"
                          title={`Buka Menu Program Terapi untuk ${selectedChild?.name || 'Siswa'}`}
                        >
                          <Target className="h-3 w-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                          <span>Menu Program</span>
                          <ExternalLink className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <button 
                          onClick={() => { 
                            const next = !showHistory && activeMainTab !== 'riwayat';
                            setShowHistory(next); 
                            setShowProgram(false);
                            if (next) setActiveMainTab('riwayat');
                            else setActiveMainTab('catatan');
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border shadow-xs cursor-pointer",
                            showHistory || activeMainTab === 'riwayat' ? "bg-amber-800 text-white border-amber-800" : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
                          )}
                        >
                          <History className="h-3 w-3" />
                          {showHistory || activeMainTab === 'riwayat' ? "Tutup Riwayat" : `Buku Riwayat (${allPastNotes.length})`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main content area (Current Note or History or Dedicated Tabs) */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Tab 2: Dedicated Forum Komunikasi Chat Layer */}
                    {activeMainTab === 'komunikasi' && !showHistory && !showProgram && selectedChild && (
                      <div className="flex-1 p-4 lg:p-8 pl-14 lg:pl-24 overflow-y-auto custom-scrollbar bg-[#FAF9F0]">
                        <CommunicationHistoryChat
                          student={selectedChild}
                          therapists={therapists}
                          userRole={userRole}
                          loggedInUserId={loggedInUserId}
                          loggedInUser={loggedInUser}
                          sessionDate={selectedDate}
                          activeSession={activeSession}
                          scheduledTherapist={therapists.find(t => t.id === activeSession?.therapistId)}
                        />
                      </div>
                    )}

                    {/* Tab 1: Catatan Terapi Sheet Layer */}
                    <div className={cn(
                      "flex-1 flex flex-col transition-all duration-500",
                      (showHistory || showProgram || activeMainTab === 'komunikasi' || activeMainTab === 'riwayat') ? "w-0 opacity-0 pointer-events-none overflow-hidden" : "w-full opacity-100"
                    )}>
                      {/* Note Writing Area */}
                      <div className="flex-1 p-4 lg:p-8 pl-14 lg:pl-24 flex flex-col relative overflow-y-auto custom-scrollbar">


                        {/* ================= READ-ONLY CLINICAL SHEET UNTUK PORTAL KELUARGA ================= */}
                        {isFamilyPortal ? (
                          <div className="space-y-6">
                            {/* Metadata Ringkasan Sesi */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/90 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                  Tanggal Terapi
                                </span>
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                  <Calendar className="w-4 h-4 text-amber-700" />
                                  <span>{formatIndonesianDate((activeSession as any)?.date || selectedDate)}</span>
                                  {(activeSession as any)?.date && (activeSession as any)?.date !== selectedDate && (
                                    <span className="ml-1 px-1.5 py-0.2 bg-amber-200/80 text-amber-900 text-[9px] font-black rounded">
                                      Riwayat
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/90 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                  Nama Terapis
                                </span>
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                  <User className="w-4 h-4 text-indigo-600" />
                                  <span>{therapists.find(t => t.id === activeSession?.therapistId)?.name || loggedInUser?.name || 'Rilla Serando, S.Tr.Kes'}</span>
                                </div>
                              </div>

                              <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/90 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                  Jenis Terapi
                                </span>
                                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                                  <Hash className="w-4 h-4 text-teal-600" />
                                  <span>{therapyTypes.find(t => t.id === activeSession?.type)?.name || activeSession?.type || 'Okupasi Terapi (OT)'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Catatan Observasi Naratif Terapis */}
                            <div className="p-5 bg-white/90 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Catatan Observasi Naratif Terapis
                              </span>
                              <p className="text-sm text-slate-800 leading-relaxed italic font-serif">
                                "{noteText || 'Ananda mengikuti seluruh rangkaian kegiatan terapi dengan kooperatif dan menunjukkan antusiasme tinggi.'}"
                              </p>

                              {voiceNoteUrl && (
                                <div className="pt-3 border-t border-slate-100">
                                  <VoiceNotePlayer 
                                    audioUrl={voiceNoteUrl}
                                    duration={voiceNoteDuration}
                                    title={`Voice Note Sesi • ${selectedChild?.name || 'Siswa'}`}
                                    dateLabel={new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Lampiran Foto/Dokumen */}
                            {selectedPhotos.length > 0 && (
                              <div className="p-5 bg-white/90 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                  Lampiran Dokumentasi Foto Sesi ({selectedPhotos.length})
                                </span>
                                <div className="flex flex-wrap gap-4">
                                  {selectedPhotos.map((photo, i) => (
                                    <div key={i} className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
                                      <img src={photo} alt="" className="h-28 w-28 object-cover group-hover:scale-105 transition-transform" />
                                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        Foto #{i + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* ================= THERAPIST / ADMIN NOTE EDITOR ================= */
                          <>
                        {/* Top Action Toolbar for Lembar Progres Sesi */}
                        <div className="mb-6 p-4 rounded-2xl bg-white/70 border border-slate-200 shadow-sm backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-7 bg-primary rounded-full" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-slate-800 italic font-serif">Lembar Progres Sesi</h4>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Tersimpan otomatis
                                </span>
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                {selectedPhotos.length > 0 ? `${selectedPhotos.length} Foto Terlampir` : 'Catatan EMR & Dokumentasi Terapi Anak'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Suara Dikte Button */}
                            <button
                              type="button"
                              onClick={toggleListening}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm group active:scale-95 cursor-pointer",
                                isListening 
                                  ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-emerald-600/20" 
                                  : "bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-emerald-700"
                              )}
                              title={isListening ? "Hentikan Dikte Suara" : "Mulai Dikte Suara (Teks Otomatis ke Catatan)"}
                            >
                              {isListening ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                                  <Mic className="h-4 w-4" />
                                  <span>Dikte AKTIF</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Mic className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                  <span>Dikte Suara</span>
                                </div>
                              )}
                            </button>

                            {/* Voice Note Button */}
                            {!isRecordingVoiceNote ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={startVoiceNoteRecording}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 shadow-sm active:scale-95 group cursor-pointer",
                                    voiceNoteUrl
                                      ? "bg-amber-100 border-amber-300 text-amber-900"
                                      : "bg-white border-slate-200 text-slate-700 hover:border-amber-500/50 hover:text-amber-800"
                                  )}
                                  title="Rekam Voice Note (Pesan Suara) langsung dengan mikrofon"
                                >
                                  <Radio className={cn("h-4 w-4 text-amber-700 transition-transform group-hover:scale-110", voiceNoteUrl && "text-amber-900")} />
                                  <span>{voiceNoteUrl ? "Voice Note Terpasang" : "Rekam Voice Note"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => audioFileInputRef.current?.click()}
                                  className="p-2.5 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-500/50 text-slate-600 hover:text-amber-800 transition-colors shadow-sm cursor-pointer"
                                  title="Unggah File Audio / Voice Note (.mp3, .m4a, .wav)"
                                >
                                  <FileAudio className="h-4 w-4" />
                                </button>
                                <input 
                                  type="file" 
                                  ref={audioFileInputRef} 
                                  className="hidden" 
                                  accept="audio/*" 
                                  onChange={handleAudioFileUpload} 
                                />
                              </div>
                            ) : (
                              /* Active Recording Indicator in Toolbar */
                              <div className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/30 animate-pulse border border-rose-700">
                                <div className="h-2.5 w-2.5 bg-white rounded-full animate-ping" />
                                <span className="text-xs font-black font-mono tracking-wider">
                                  REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                                <button
                                  type="button"
                                  onClick={stopVoiceNoteRecording}
                                  className="ml-2 px-2.5 py-1 bg-white text-rose-700 hover:bg-rose-50 text-[11px] font-black rounded-lg shadow-xs cursor-pointer"
                                >
                                  Selesai
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelVoiceNoteRecording}
                                  className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                  title="Batal rekam"
                                >
                                  ✕
                                </button>
                              </div>
                            )}

                            {/* Lampirkan Foto Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 border-slate-200 bg-white hover:border-primary/50 text-slate-700 hover:text-primary shadow-sm active:scale-95 group cursor-pointer"
                              title="Lampirkan foto aktivitas terapi anak"
                            >
                              <Paperclip className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                              <span>Lampiran Foto</span>
                              {selectedPhotos.length > 0 && (
                                <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full leading-none">
                                  {selectedPhotos.length}
                                </span>
                              )}
                            </button>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={handleFileChange}
                            />

                            {/* Simpan ke Buku Siswa Button */}
                            <button
                              onClick={handleSaveNote}
                              disabled={saveStatus === 'saving' || (!noteText.trim() && !voiceNoteUrl && !showHistory)}
                              className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md group active:scale-95 border",
                                saveStatus === 'success' 
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20"
                                  : "bg-[#2D2D2D] text-white border-[#2D2D2D] hover:bg-black hover:shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                              )}
                              title="Simpan catatan ke buku harian siswa"
                            >
                              {saveStatus === 'saving' ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Menyimpan...</span>
                                </>
                              ) : saveStatus === 'success' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                  <span>Tersimpan!</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                  <span>Simpan ke Buku Siswa</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Mic Permission Warning Banner */}
                        {micPermissionError && (
                          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs font-bold text-rose-800 shadow-sm animate-shake">
                            <div className="flex items-center gap-2.5">
                              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                              <span>{micPermissionError}</span>
                            </div>
                            <button onClick={() => setMicPermissionError(null)} className="p-1 hover:bg-rose-100 rounded-lg text-rose-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Live Recording Full Banner with Equalizer */}
                        {isRecordingVoiceNote && (
                          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 w-full sm:w-auto">
                              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30 animate-pulse shrink-0">
                                <Mic className="h-6 w-6" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-wide truncate">
                                    Sedang Merekam Voice Note
                                  </h5>
                                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-md font-mono text-xs font-black shrink-0">
                                    {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                  Bicara dengan santai. Suara Anda sedang direkam dan teks otomatis didiktekan ke lembar catatan.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                onClick={stopVoiceNoteRecording}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                              >
                                <Check className="h-4 w-4 stroke-[3]" />
                                <span>Selesai & Simpan VN</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelVoiceNoteRecording}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                                <span>Batal</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Live Transcription Live Feedback */}
                        {liveTranscript && (
                          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 shadow-xs animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <span className="font-black text-[10px] uppercase text-emerald-700 shrink-0">Dikte Berjalan:</span>
                            <span className="italic font-medium text-slate-800">"{liveTranscript}..."</span>
                          </div>
                        )}

                        {/* Attached Voice Note Audio Player */}
                        {voiceNoteUrl && !isRecordingVoiceNote && (
                          <div className="mb-6">
                            <VoiceNotePlayer 
                              audioUrl={voiceNoteUrl}
                              duration={voiceNoteDuration}
                              title={`Voice Note Sesi • ${selectedChild?.name || 'Siswa'}`}
                              dateLabel={new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              onReRecord={startVoiceNoteRecording}
                              onDelete={handleDeleteVoiceNote}
                            />
                          </div>
                        )}



                        {/* Textarea for note */}
                        <div className="min-h-[300px] mb-8 relative bg-white/40 rounded-2xl overflow-hidden border-2 border-slate-200/50 group-hover:border-primary/30 transition-colors">
                          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '100% 2.5rem',
                            marginTop: '2.4rem'
                          }} />
                          
                          <textarea
                            ref={textareaRef}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Mulai tuliskan atau diktekan suara Anda untuk mencatat perkembangan anak di sini..."
                            className="w-full h-full p-8 bg-transparent relative z-10 resize-none focus:outline-none text-[#2D2D2D] text-lg leading-[2.5rem] placeholder:text-slate-300 placeholder:italic placeholder:font-serif font-medium"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>

                        {/* Photo Attachments View */}
                        {selectedPhotos.length > 0 && (
                          <div className="mt-2 mb-8 p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <ImageIcon className="h-4 w-4 text-primary" />
                                 Lampiran Foto Sesi ({selectedPhotos.length})
                              </h5>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5 text-primary" />
                                Tambah Foto
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-4">
                               {selectedPhotos.map((photo, i) => (
                                 <div key={i} className="relative group/photo">
                                     <img src={photo} alt={`Attachment ${i+1}`} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-lg rotate-[1deg]" />
                                     <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                       #{i + 1}
                                     </div>
                                     <button 
                                       type="button"
                                       onClick={() => removePhoto(i)}
                                       className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                                       title="Hapus foto ini"
                                     >
                                        <X className="h-3 w-3" />
                                     </button>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Summary suggestion button */}
                        <div className="flex justify-start mb-12">
                           <button className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
                              <Wand2 className="h-3.5 w-3.5" />
                              Buat Ringkasan Otomatis
                           </button>
                        </div>

                        {/* Detailed Progress Form based on user image */}
                        <div className="space-y-12">
                          {/* Row 1: Intervention Programs & Exercise Progress */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Program Intervensi */}
                             <div className="bg-white/40 border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Program Intervensi</span>
                                  <div className="flex items-center gap-4">
                                     <button 
                                      onClick={() => {
                                        setDetailedProgress({
                                          ...detailedProgress,
                                          interventionPrograms: [...detailedProgress.interventionPrograms, { label: 'Program Baru', checked: false }]
                                        });
                                      }}
                                      className="p-1 hover:bg-white/10 rounded-lg text-white"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checklist</span>
                                  </div>
                                </div>
                                <div className="p-4 space-y-3">
                                   {detailedProgress.interventionPrograms.map((item, idx) => (
                                     <div key={idx} className="flex items-center justify-between gap-4 group/row">
                                        <div className="flex items-center gap-2 flex-1">
                                          {detailedProgress.interventionPrograms.length > 1 && (
                                            <button 
                                              onClick={() => {
                                                setDetailedProgress({
                                                  ...detailedProgress,
                                                  interventionPrograms: detailedProgress.interventionPrograms.filter((_, i) => i !== idx)
                                                });
                                              }}
                                              className="opacity-0 group-hover/row:opacity-100 text-slate-300 hover:text-rose-400 transition-all shrink-0"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                          <input 
                                            className="bg-transparent border-none p-0 text-xs font-bold text-slate-600 uppercase tracking-tight focus:ring-0 outline-none w-full"
                                            value={item.label}
                                            onChange={(e) => {
                                              const newList = [...detailedProgress.interventionPrograms];
                                              newList[idx] = { ...item, label: e.target.value };
                                              setDetailedProgress({ ...detailedProgress, interventionPrograms: newList });
                                            }}
                                          />
                                        </div>
                                        <button 
                                          onClick={() => {
                                            const newList = [...detailedProgress.interventionPrograms];
                                            newList[idx] = { ...item, checked: !item.checked };
                                            setDetailedProgress({ ...detailedProgress, interventionPrograms: newList });
                                          }}
                                          className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                            item.checked ? "bg-slate-700 border-slate-700 text-white" : "bg-white border-slate-200"
                                          )}
                                        >
                                          {item.checked && <CheckSquare className="h-4 w-4" />}
                                        </button>
                                     </div>
                                   ))}
                                </div>
                             </div>

                             {/* Kemajuan Latihan */}
                             <div className="bg-white/40 border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="bg-indigo-900 px-4 py-2 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Kemajuan Latihan</span>
                                  <div className="flex items-center gap-4">
                                     <button 
                                      onClick={() => {
                                        setDetailedProgress({
                                          ...detailedProgress,
                                          exerciseProgress: [...detailedProgress.exerciseProgress, { label: 'Latihan Baru', checked: false }]
                                        });
                                      }}
                                      className="p-1 hover:bg-white/10 rounded-lg text-white"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                     <div className="flex gap-4">
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Checklist</span>
                                     </div>
                                  </div>
                                </div>
                                <div className="p-4 space-y-3">
                                   {detailedProgress.exerciseProgress.map((item, idx) => (
                                     <div key={idx} className="flex items-center justify-between gap-2 group/row">
                                        <div className="flex items-center gap-2 flex-1">
                                           {detailedProgress.exerciseProgress.length > 1 && (
                                              <button 
                                                onClick={() => {
                                                  setDetailedProgress({
                                                    ...detailedProgress,
                                                    exerciseProgress: detailedProgress.exerciseProgress.filter((_, i) => i !== idx)
                                                  });
                                                }}
                                                className="opacity-0 group-hover/row:opacity-100 text-slate-300 hover:text-rose-400 transition-all shrink-0"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                           )}
                                           <input 
                                              className="bg-transparent border-none p-0 text-xs font-bold text-slate-600 uppercase tracking-tight focus:ring-0 outline-none w-full"
                                              value={item.label}
                                              onChange={(e) => {
                                                const newList = [...detailedProgress.exerciseProgress];
                                                newList[idx] = { ...item, label: e.target.value };
                                                setDetailedProgress({ ...detailedProgress, exerciseProgress: newList });
                                              }}
                                            />
                                        </div>
                                        <button 
                                          onClick={() => {
                                            const newList = [...detailedProgress.exerciseProgress];
                                            newList[idx] = { ...item, checked: !item.checked };
                                            setDetailedProgress({ ...detailedProgress, exerciseProgress: newList });
                                          }}
                                          className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                            item.checked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200"
                                          )}
                                        >
                                          {item.checked && <CheckSquare className="h-4 w-4" />}
                                        </button>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>

                          {/* Row 2: Aktifitas Fungsional */}
                          <div className="bg-white/40 border border-slate-200 rounded-2xl overflow-hidden">
                             <div className="bg-orange-600 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-orange-200" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Aktifitas Fungsional</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setDetailedProgress({
                                      ...detailedProgress,
                                      functionalActivities: [...detailedProgress.functionalActivities, { activity: '', independence: '', accuracy: '' }]
                                    });
                                  }}
                                  className="p-1 hover:bg-white/10 rounded-lg text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                             </div>
                             <div className="p-4 space-y-4">
                                <div className="grid grid-cols-12 gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                                   <div className="col-span-6">Nama Aktivitas</div>
                                   <div className="col-span-3 text-center">Nilai Kemandirian</div>
                                   <div className="col-span-3 text-center">% Keakuratan</div>
                                </div>
                                <div className="space-y-2">
                                  {detailedProgress.functionalActivities.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2">
                                       <div className="col-span-6 relative flex items-center">
                                          <input 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-orange-500/10 outline-none"
                                            value={item.activity}
                                            placeholder="..."
                                            onChange={(e) => {
                                              const newList = [...detailedProgress.functionalActivities];
                                              newList[idx] = { ...item, activity: e.target.value };
                                              setDetailedProgress({ ...detailedProgress, functionalActivities: newList });
                                            }}
                                          />
                                          {detailedProgress.functionalActivities.length > 1 && (
                                            <button 
                                              onClick={() => {
                                                setDetailedProgress({
                                                  ...detailedProgress,
                                                  functionalActivities: detailedProgress.functionalActivities.filter((_, i) => i !== idx)
                                                });
                                              }}
                                              className="absolute -left-8 text-slate-300 hover:text-rose-400 transition-colors"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                       </div>
                                       <div className="col-span-3">
                                          <input 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-center focus:ring-2 focus:ring-orange-500/10 outline-none"
                                            value={item.independence}
                                            placeholder="..."
                                            onChange={(e) => {
                                              const newList = [...detailedProgress.functionalActivities];
                                              newList[idx] = { ...item, independence: e.target.value };
                                              setDetailedProgress({ ...detailedProgress, functionalActivities: newList });
                                            }}
                                          />
                                       </div>
                                       <div className="col-span-3">
                                          <input 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-center focus:ring-2 focus:ring-orange-500/10 outline-none"
                                            value={item.accuracy}
                                            placeholder="0%"
                                            onChange={(e) => {
                                              const newList = [...detailedProgress.functionalActivities];
                                              newList[idx] = { ...item, accuracy: e.target.value };
                                              setDetailedProgress({ ...detailedProgress, functionalActivities: newList });
                                            }}
                                          />
                                       </div>
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>

                          {/* Row 3: Pengamatan Kelemahan */}
                          <div className="bg-white/40 border border-slate-200 rounded-2xl p-6">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-4 bg-rose-500 rounded-full" />
                                  <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Pengamatan Kelemahan</h5>
                                </div>
                                <button 
                                  onClick={() => {
                                    setDetailedProgress({
                                      ...detailedProgress,
                                      weaknessObservations: [...detailedProgress.weaknessObservations, { label: 'Kelemahan Baru', checked: false }]
                                    });
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                             </div>
                             <div className="flex flex-wrap gap-x-12 gap-y-6">
                                {detailedProgress.weaknessObservations.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 group/weakness">
                                     <button 
                                        onClick={() => {
                                          const newList = [...detailedProgress.weaknessObservations];
                                          newList[idx] = { ...item, checked: !item.checked };
                                          setDetailedProgress({ ...detailedProgress, weaknessObservations: newList });
                                        }}
                                        className={cn(
                                          "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                          item.checked ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white border-slate-200"
                                        )}
                                     >
                                        {item.checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-100" />}
                                     </button>
                                     <div className="flex items-center gap-2">
                                        <input 
                                          className={cn(
                                            "bg-transparent border-none p-0 text-xs font-bold uppercase tracking-tight focus:ring-0 outline-none w-32",
                                            item.checked ? "text-slate-800" : "text-slate-400"
                                          )}
                                          value={item.label}
                                          onChange={(e) => {
                                            const newList = [...detailedProgress.weaknessObservations];
                                            newList[idx] = { ...item, label: e.target.value };
                                            setDetailedProgress({ ...detailedProgress, weaknessObservations: newList });
                                          }}
                                        />
                                        {detailedProgress.weaknessObservations.length > 1 && (
                                          <button 
                                            onClick={() => {
                                              setDetailedProgress({
                                                ...detailedProgress,
                                                weaknessObservations: detailedProgress.weaknessObservations.filter((_, i) => i !== idx)
                                              });
                                            }}
                                            className="opacity-0 group-hover/weakness:opacity-100 text-slate-300 hover:text-rose-400 transition-all"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        )}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          {/* Row 4: Final Questions */}
                          <div className="space-y-6 pt-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Respon Ananda Terhadap Intervensi</label>
                                <textarea 
                                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none shadow-sm min-h-[150px] resize-none"
                                  value={detailedProgress.responseToIntervention}
                                  onChange={(e) => setDetailedProgress({ ...detailedProgress, responseToIntervention: e.target.value })}
                                  placeholder="..."
                                />
                             </div>
                          </div>
                        </div>
                        </>
                      )}
                      </div>
                    </div>

                    {/* Program Layer */}
                    <div className={cn(
                      "transition-all duration-500 bg-white border-l border-slate-200 flex flex-col",
                      showProgram ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 pointer-events-none absolute inset-0 z-0"
                    )}>
                       <div className="p-4 lg:p-8 pl-14 lg:pl-24 flex-1 overflow-y-auto custom-scrollbar">
                         <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-indigo-100 rounded-xl">
                                  <Target className="h-6 w-6 text-indigo-600" />
                                </div>
                               <div>
                                  <h4 className="text-2xl font-black text-slate-800 italic font-serif uppercase tracking-tight">Program Terapi Anak</h4>
                                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Target Intervensi Jangka Waktu • {selectedChild?.name}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenProgramMenu(programCategoryTab)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                                title={`Buka Menu Program Terapi untuk ${selectedChild?.name || 'Siswa'}`}
                              >
                                <Target className="h-3.5 w-3.5" />
                                <span>Buka di Menu Program Terapi</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                              <button onClick={() => setShowProgram(false)} className="p-2 hover:bg-slate-100 rounded-full" title="Tutup Panel">
                                 <X className="h-5 w-5 text-slate-400" />
                              </button>
                            </div>
                         </div>

                         {/* Category tab selector inside Lihat Program sidebar */}
                         <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-100 rounded-2xl mb-8">
                           {[
                             { id: 'OT' as const, label: 'Okupasi', color: 'bg-teal-600' },
                             { id: 'TW' as const, label: 'Wicara', color: 'bg-violet-600' },
                             { id: 'FT' as const, label: 'Fisioterapi', color: 'bg-amber-600' },
                             { id: 'REM' as const, label: 'Remedial', color: 'bg-pink-600' },
                             { id: 'HT' as const, label: 'Hidro', color: 'bg-sky-600' },
                             { id: 'BERKUDA' as const, label: 'Berkuda', color: 'bg-emerald-600' }
                           ].map((cat) => (
                             <button
                               key={cat.id}
                               type="button"
                               onClick={() => setProgramCategoryTab(cat.id)}
                               className={cn(
                                 "py-2 px-1 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all text-center truncate",
                                 programCategoryTab === cat.id 
                                   ? `${cat.color} text-white shadow-md` 
                                   : 'text-slate-400 hover:bg-white hover:text-slate-600'
                               )}
                             >
                               {cat.label}
                             </button>
                           ))}
                         </div>

                         {!childProgram || childProgram.items.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[2rem] p-6">
                               <Target className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada program terapi terdaftar untuk {selectedChild?.name}</p>
                               <button
                                 onClick={() => handleOpenProgramMenu()}
                                 className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-sm"
                               >
                                 <Plus className="h-3.5 w-3.5" />
                                 <span>Susun Program di Menu Program Terapi</span>
                                 <ExternalLink className="h-3 w-3" />
                               </button>
                            </div>
                         ) : (() => {
                            const catFilteredItems = childProgram.items.filter(item => item.therapyType === programCategoryTab) || [];
                            return catFilteredItems.length === 0 ? (
                              <div className="py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] p-6">
                                 <Target className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada program {
                                   programCategoryTab === 'OT' ? 'Okupasi' :
                                   programCategoryTab === 'TW' ? 'Wicara' :
                                   programCategoryTab === 'FT' ? 'Fisioterapi' :
                                   programCategoryTab === 'REM' ? 'Remedial' :
                                   programCategoryTab === 'HT' ? 'Hidroterapi' : 'Terapi Berkuda'
                                 } terdaftar untuk {selectedChild?.name}</p>
                                 <button
                                   onClick={() => handleOpenProgramMenu(programCategoryTab)}
                                   className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-sm"
                                 >
                                   <Plus className="h-3.5 w-3.5" />
                                   <span>Tambah di Menu Program Terapi</span>
                                   <ExternalLink className="h-3 w-3" />
                                 </button>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                 {catFilteredItems.map((item, idx) => (
                                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 relative overflow-hidden group">
                                       <div className={cn(
                                         "absolute top-0 left-0 w-2 h-full",
                                         item.therapyType === 'OT' ? 'bg-teal-500' :
                                         item.therapyType === 'TW' ? 'bg-violet-500' :
                                         item.therapyType === 'FT' ? 'bg-amber-500' :
                                         item.therapyType === 'REM' || item.therapyType === 'REMEDIAL' ? 'bg-pink-500' :
                                         item.therapyType === 'HT' ? 'bg-sky-500' : 'bg-emerald-500'
                                       )} />
                                       <div className="flex justify-between items-center mb-4">
                                          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                                             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Target : {item.targetWaktu}</span>
                                          </div>
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Item #0{idx + 1}</span>
                                       </div>
                                       
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                          <div>
                                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Terapi</h5>
                                             <p className="text-sm font-bold text-slate-800 leading-relaxed">{item.targetTerapi}</p>
                                          </div>
                                          <div>
                                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktivitas Terapi</h5>
                                             <p className="text-sm font-medium text-slate-600 leading-relaxed italic font-serif">{item.aktifitasTerapi}</p>
                                          </div>
                                          {item.keterangan && (
                                            <div className="md:col-span-2 pt-4 border-t border-slate-200/50">
                                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</h5>
                                               <p className="text-[11px] font-medium text-slate-500 italic">{item.keterangan}</p>
                                            </div>
                                          )}
                                       </div>

                                       {/* Integration Actions */}
                                       <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                                         <button
                                           type="button"
                                           onClick={() => handleCopyProgramToNote(item)}
                                           className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                           title="Salin target dan aktivitas ke catatan di atas"
                                         >
                                           <Copy className="h-3.5 w-3.5" />
                                           Salin ke Catatan
                                         </button>
                                         
                                         <button
                                           type="button"
                                           onClick={() => handleAddToFunctionalActivities(item)}
                                           className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                           title="Tambahkan aktivitas ini ke tabel Aktivitas Fungsional di bawah"
                                         >
                                           <Activity className="h-3.5 w-3.5" />
                                           + Aktifitas Fungsional
                                         </button>

                                         <button
                                           type="button"
                                           onClick={() => handleAddToInterventionList(item)}
                                           className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                           title="Tambahkan aktivitas ini ke checklist Program Intervensi"
                                         >
                                           <Plus className="h-3.5 w-3.5" />
                                           + Program Intervensi
                                         </button>

                                         <button
                                           type="button"
                                           onClick={() => handleOpenProgramMenu(item.therapyType)}
                                           className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer ml-auto"
                                           title="Buka dan kelola program ini di Menu Program Terapi"
                                         >
                                           <Target className="h-3.5 w-3.5" />
                                           Buka di Menu Program
                                           <ExternalLink className="h-3 w-3" />
                                         </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                            );
                         })()}
                       </div>
                    </div>

                    {/* History Layer */}
                    <div className={cn(
                      "transition-all duration-500 bg-[#FAF9F0] border-l border-slate-200 flex flex-col",
                      (showHistory || activeMainTab === 'riwayat') ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 pointer-events-none"
                    )}>
                      <div className="p-4 lg:p-8 pl-14 lg:pl-24 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Top History Header */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-6 mb-6 border-b border-amber-900/10 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl border border-amber-900/15 shadow-sm">
                                <History className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-2xl font-black text-slate-800 italic font-serif flex items-center gap-2">
                                  <span>Arsip & Riwayat Catatan Terapi</span>
                                </h4>
                                <p className="text-slate-500 text-xs font-medium">
                                  Dokumentasi perkembangan klinis <strong>{selectedChild?.name || 'Siswa'}</strong> • Total <strong>{allPastNotes.length}</strong> sesi catatan
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Main Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            {allPastNotes.length > 0 && (
                              <>
                                {/* Select All Button */}
                                <button 
                                  onClick={toggleSelectAllHistory}
                                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer active:scale-95"
                                  title="Pilih semua atau batalkan pilihan catatan"
                                >
                                  {selectedHistoryNotes.length === allPastNotes.length ? (
                                    <>
                                      <CheckSquare className="h-3.5 w-3.5 text-amber-800" />
                                      <span>Batal Pilih Semua</span>
                                    </>
                                  ) : (
                                    <>
                                      <Square className="h-3.5 w-3.5 text-slate-400" />
                                      <span>Pilih Semua ({allPastNotes.length})</span>
                                    </>
                                  )}
                                </button>
                                
                                {/* Print Preview Modal Trigger */}
                                <button 
                                  onClick={() => handleOpenPrintPreview()}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer"
                                  title="Buka pratinjau dokumen cetak format A4"
                                >
                                  <Eye className="h-3.5 w-3.5 text-amber-800" />
                                  <span>Pratinjau Dokumen (A4)</span>
                                </button>

                                {/* Direct Print Button */}
                                <button 
                                  onClick={() => handlePrint()}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-black text-white transition-all shadow-md active:scale-95 cursor-pointer"
                                  title="Cetak langsung menggunakan kertas ukuran A4"
                                >
                                  <Printer className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{selectedHistoryNotes.length > 0 ? `Cetak (${selectedHistoryNotes.length}) A4` : `Cetak Semua (${allPastNotes.length}) A4`}</span>
                                </button>

                                {/* Direct Download PDF Button */}
                                <button 
                                  onClick={() => handleDownloadPdf()}
                                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                                  title="Download seluruh rekam catatan sebagai file PDF resmi ukuran A4"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>{selectedHistoryNotes.length > 0 ? `Unduh PDF (${selectedHistoryNotes.length}) A4` : `Unduh PDF Semua (${allPastNotes.length}) A4`}</span>
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => {
                                setShowHistory(false);
                                setActiveMainTab('catatan');
                              }} 
                              className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer ml-1"
                              title="Tutup Riwayat & Kembali ke Lembar Sesi"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="mb-8 p-3.5 bg-white/80 border border-amber-900/10 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                          <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                              type="text"
                              value={historySearch}
                              onChange={(e) => setHistorySearch(e.target.value)}
                              placeholder="Cari isi catatan, tanggal, terapis..."
                              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                            {historySearch && (
                              <button 
                                onClick={() => setHistorySearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Therapy Category Filter Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                            {[
                              { id: 'ALL', label: `Semua (${allPastNotes.length})` },
                              { id: 'OT', label: 'Okupasi' },
                              { id: 'TW', label: 'Wicara' },
                              { id: 'FT', label: 'Fisioterapi' },
                              { id: 'REM', label: 'Remedial' },
                              { id: 'HT', label: 'Hidro' },
                              { id: 'BERKUDA', label: 'Berkuda' },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                onClick={() => setHistoryCategoryFilter(pill.id)}
                                className={cn(
                                  "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  historyCategoryFilter === pill.id
                                    ? "bg-amber-800 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Timeline of Notes */}
                        <div className="space-y-8 pb-12">
                          {filteredHistoryNotes.length > 0 ? (
                            filteredHistoryNotes.map((note, idx) => {
                              const isSelected = selectedHistoryNotes.includes(note.id);
                              const isExpanded = expandedNoteIds.includes(note.id);
                              const therapist = therapists.find(t => t.id === note.therapistId);
                              const typeDef = therapyTypes.find(t => t.id === note.type);

                              return (
                                <div 
                                  key={note.id} 
                                  className={cn(
                                    "relative pl-8 sm:pl-10 border-l-2 transition-all duration-300",
                                    isSelected ? "border-amber-800" : "border-slate-300"
                                  )}
                                >
                                  {/* Interactive Checkbox Dot on Timeline */}
                                  <button
                                    type="button" 
                                    className={cn(
                                      "absolute -left-[11px] top-4 h-5 w-5 rounded-full border-2 shadow-xs cursor-pointer transition-all duration-300 z-10 flex items-center justify-center",
                                      isSelected ? "bg-amber-800 border-amber-800 scale-110 text-white" : "bg-white border-slate-300 hover:border-amber-800"
                                    )}
                                    onClick={() => toggleHistorySelection(note.id)}
                                    title={isSelected ? "Batalkan pilihan catatan ini" : "Pilih catatan ini untuk dicetak"}
                                  >
                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                  </button>

                                  {/* Note Card */}
                                  <div 
                                    className={cn(
                                      "p-5 sm:p-7 rounded-[2rem] border relative group overflow-hidden max-w-3xl transition-all duration-300",
                                      isSelected 
                                        ? "bg-white border-amber-800 shadow-xl ring-2 ring-amber-800/10" 
                                        : "bg-white/90 border-amber-900/10 hover:border-amber-400 shadow-md"
                                    )}
                                  >
                                    <div className={cn(
                                      "absolute top-0 left-0 w-2 h-full transition-colors",
                                      isSelected ? "bg-amber-800" : "bg-amber-600/30"
                                    )} />

                                    {/* Header of Note Card */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-900/10 px-3 py-1 rounded-xl">
                                          <Calendar className="h-3.5 w-3.5 text-amber-800" />
                                          <span className="text-xs font-bold text-slate-800">{note.time}</span>
                                        </div>
                                        {therapist && (
                                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                                            <User className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="text-xs font-bold text-slate-700">{therapist.name}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-950 text-[10px] font-black rounded-lg uppercase tracking-wider font-mono">
                                          {typeDef?.name || note.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                          Sesi #{filteredHistoryNotes.length - idx}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Note Quotation */}
                                    {note.note ? (
                                      <div className="relative mb-5 p-4 bg-[#FDFBF7] rounded-2xl border border-amber-900/10">
                                        <p className="text-slate-800 leading-relaxed font-serif italic text-base whitespace-pre-wrap">
                                          "{note.note}"
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-slate-400 italic text-xs mb-4">Tidak ada catatan teks tertulis.</p>
                                    )}

                                    {/* Voice Note Player in History Item */}
                                    {note.audioUrl && (
                                      <div className="mb-5">
                                        <VoiceNotePlayer 
                                          audioUrl={note.audioUrl}
                                          duration={note.audioDuration}
                                          title={`Voice Note Terapis • ${note.time}`}
                                          compact={false}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Photo Attachments Preview Strip */}
                                    {note.photoUrls && note.photoUrls.length > 0 && (
                                      <div className="mb-5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                                          <ImageIcon className="h-3.5 w-3.5 text-amber-800" />
                                          <span>Lampiran Dokumentasi Foto ({note.photoUrls.length})</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                          {note.photoUrls.map((url, i) => (
                                            <div key={i} className="relative group/pic rounded-xl overflow-hidden border border-slate-200 shadow-sm w-20 h-20">
                                              <img 
                                                src={url} 
                                                alt={`Dokumentasi ${i + 1}`} 
                                                className="h-full w-full object-cover group-hover/pic:scale-110 transition-transform duration-300"
                                              />
                                              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tl-md">
                                                #{i + 1}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Collapsible Clinical Evaluation Details */}
                                    {note.detailedProgress && (
                                      <div className="mb-4">
                                        <button
                                          type="button"
                                          onClick={() => toggleExpandNote(note.id)}
                                          className="flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-900/15 transition-all cursor-pointer"
                                        >
                                          <Activity className="h-3.5 w-3.5 text-amber-800" />
                                          <span>{isExpanded ? 'Sembunyikan Rincian Evaluasi Klinis' : 'Lihat Rincian Evaluasi Klinis'}</span>
                                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        </button>

                                        {isExpanded && (
                                          <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4 animate-fade-in text-xs">
                                            {/* Checklist Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {/* Program Intervensi */}
                                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                                <p className="font-black text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                                                  Program Intervensi
                                                </p>
                                                <div className="space-y-1">
                                                  {note.detailedProgress.interventionPrograms.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between text-slate-600 text-[11px]">
                                                      <span>{p.label}</span>
                                                      <span className={p.checked ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                                                        {p.checked ? '✓ Tercapai' : '—'}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Kemajuan Latihan */}
                                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                                <p className="font-black text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                                                  Kemajuan Latihan
                                                </p>
                                                <div className="space-y-1">
                                                  {note.detailedProgress.exerciseProgress.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between text-slate-600 text-[11px]">
                                                      <span>{p.label}</span>
                                                      <span className={p.checked ? 'text-indigo-600 font-bold' : 'text-slate-300'}>
                                                        {p.checked ? '✓ Terlihat' : '—'}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Functional Activities Table */}
                                            {note.detailedProgress.functionalActivities && note.detailedProgress.functionalActivities.length > 0 && note.detailedProgress.functionalActivities[0].activity && (
                                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <div className="bg-slate-100 px-3 py-1.5 flex justify-between font-black text-[10px] text-slate-700 uppercase">
                                                  <span>Aktivitas Fungsional</span>
                                                  <div className="flex gap-6">
                                                    <span>Kemandirian</span>
                                                    <span>Akurasi</span>
                                                  </div>
                                                </div>
                                                <div className="divide-y divide-slate-100 p-2 space-y-1.5">
                                                  {note.detailedProgress.functionalActivities.map((fa, i) => (
                                                    <div key={i} className="flex justify-between items-center text-slate-700 text-[11px]">
                                                      <span className="font-bold">{fa.activity}</span>
                                                      <div className="flex gap-6 text-right">
                                                        <span className="text-slate-600">{fa.independence || '-'}</span>
                                                        <span className="font-mono font-bold text-slate-900">{fa.accuracy || '-'}</span>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            {/* Respon Intervensi */}
                                            {note.detailedProgress.responseToIntervention && (
                                              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-900/15">
                                                <p className="font-black text-[10px] uppercase text-amber-900 mb-0.5">Respon Terhadap Intervensi:</p>
                                                <p className="text-slate-800 italic text-xs leading-relaxed font-serif">
                                                  "{note.detailedProgress.responseToIntervention}"
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Card Footer Actions */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <button 
                                          type="button"
                                          onClick={() => toggleHistorySelection(note.id)}
                                          className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                            isSelected 
                                              ? "bg-amber-800 text-white" 
                                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                          )}
                                        >
                                          {isSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                          <span>{isSelected ? 'Terpilih untuk Dokumen' : 'Pilih untuk Dicetak'}</span>
                                        </button>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrintSingleNote(note);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                          title="Cetak khusus sesi ini dalam format kertas A4"
                                        >
                                          <Printer className="h-3.5 w-3.5 text-slate-500" />
                                          <span>Cetak Sesi Ini (A4)</span>
                                        </button>

                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadSingleNotePdf(note);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-900/15 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                          title="Unduh sesi ini sebagai file PDF A4"
                                        >
                                          <Download className="h-3.5 w-3.5 text-amber-700" />
                                          <span>Unduh PDF (A4)</span>
                                        </button>

                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenPrintPreview([note]);
                                          }}
                                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                          title="Pratinjau lembar A4 sesi ini"
                                        >
                                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Pratinjau</span>
                                        </button>

                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditHistoryNote(note.id);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black rounded-xl transition-colors cursor-pointer"
                                          title="Buka catatan ini di lembar buku catatan"
                                        >
                                          <StickyNote className="h-3.5 w-3.5 text-amber-800" />
                                          <span>{isFamilyPortal ? "Buka di Lembar Buku" : "Muat di Catatan"}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-20 bg-white/60 rounded-[2rem] border-2 border-dashed border-slate-200 p-8">
                               <StickyNote className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                               <p className="text-lg font-serif italic text-slate-700">
                                 {historySearch || historyCategoryFilter !== 'ALL' ? 'Tidak ada catatan yang cocok dengan pencarian / filter ini.' : 'Belum ada catatan riwayat permanen untuk siswa ini.'}
                                </p>
                               <p className="text-xs text-slate-400 mt-1">
                                 Catatan yang disimpan di lembar buku harian akan otomatis tersimpan dalam arsip ini.
                               </p>
                               {(historySearch || historyCategoryFilter !== 'ALL') && (
                                 <button
                                   onClick={() => {
                                     setHistorySearch('');
                                     setHistoryCategoryFilter('ALL');
                                   }}
                                   className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-bold hover:bg-amber-900 transition-all cursor-pointer"
                                 >
                                   Reset Filter & Tampilkan Semua
                                 </button>
                               )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Print Container for Browser Print (Strict A4 Sheets) */}
                  <div className="hidden print:block print:bg-white print:p-0" ref={printRef}>
                    <div className="a4-sheet therapy-print-sheet a4-print-page w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[10mm_12mm] bg-white text-slate-900 flex flex-col justify-between relative overflow-hidden">
                      {/* Kop Surat Resmi */}
                      <div className="border-b-2 border-amber-900/30 pb-3 mb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={logoUrl} 
                              alt="Logo" 
                              className="w-12 h-12 object-contain"
                            />
                            <div>
                              <h1 className="text-base font-black text-slate-900 tracking-tight uppercase leading-tight font-serif">
                                Yayasan Pelangi Lazuardi
                              </h1>
                              <p className="text-amber-900 text-[10px] font-black tracking-widest uppercase">
                                Lazuardi Therapy Center • Rekam Medis & Catatan Klinis
                              </p>
                              <p className="text-slate-400 text-[8px] font-medium mt-0.5">
                                Jl. Lazuardi No. 1, Jakarta Selatan • Telp: (021) 1234567 • www.lazuardi.sch.id
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-black rounded uppercase font-mono">
                              LTC/{selectedChild?.id || 'SISWA'}/{new Date().getFullYear()}
                            </span>
                            <p className="text-[9px] text-slate-500 font-semibold mt-1">
                              Tgl Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Title Banner */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-serif">
                            Laporan Rekam Catatan Terapi Siswa
                          </h2>
                          <span className="text-[9px] font-bold text-slate-400">
                            Total {targetNotesForPrint.length} Sesi Terlapor
                          </span>
                        </div>
                      </div>

                      {/* Student Profile Strip */}
                      <div className="mb-4 p-3 bg-amber-50/50 rounded-xl border border-amber-900/15 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedChild?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChild?.name}`} 
                            alt={selectedChild?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-900/20 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {selectedChild?.name}
                              </h3>
                              <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-amber-900/10 text-amber-950 font-mono">
                                ID: {selectedChild?.id}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mt-1">
                              <span>Kelas: <strong>{selectedChild?.className || '-'}</strong></span>
                              <span>•</span>
                              <span>Orang Tua: <strong>{selectedChild?.parentName || selectedChild?.motherName || '-'}</strong></span>
                              <span>•</span>
                              <span>Status: <strong className="text-emerald-700">Aktif Terapi</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right border-l border-amber-900/15 pl-4">
                          <p className="text-[9px] font-black uppercase text-amber-900/70 tracking-wider">Total Catatan</p>
                          <p className="text-xl font-black text-amber-950">{targetNotesForPrint.length} Sesi</p>
                        </div>
                      </div>

                      {/* Notes Body */}
                      <div className="flex-1 space-y-4 overflow-hidden">
                        {targetNotesForPrint.slice(0, 3).map((note, index) => {
                          const therapist = therapists.find(t => t.id === note.therapistId);
                          const typeDef = therapyTypes.find(t => t.id === note.type);

                          return (
                            <div key={note.id || index} className="border border-slate-200 rounded-xl p-3.5 bg-white relative overflow-hidden break-inside-avoid">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-600" />
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] font-black text-slate-900 flex items-center gap-1 font-serif">
                                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                    <span>{note.time}</span>
                                  </span>
                                  {therapist && (
                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      Terapis: {therapist.name}
                                    </span>
                                  )}
                                </div>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-950 font-black text-[9px] rounded uppercase">
                                  {typeDef?.name || note.type}
                                </span>
                              </div>
                              {note.note && (
                                <p className="text-[11px] leading-relaxed text-slate-800 font-serif italic whitespace-pre-wrap mb-2">
                                  "{note.note}"
                                </p>
                              )}
                              {note.audioUrl && (
                                <div className="mb-2 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[8px] font-bold text-amber-900 flex items-center gap-1.5">
                                  <span>🎙️</span>
                                  <span>Voice Note Terapis Terlampir {note.audioDuration ? `(${Math.round(note.audioDuration)} detik)` : ''}</span>
                                </div>
                              )}
                              {note.detailedProgress && (
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[9px]">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-slate-200 rounded-lg p-1.5 bg-slate-50/60">
                                      <p className="font-bold text-slate-700 uppercase text-[8px] mb-1">Intervensi</p>
                                      {note.detailedProgress.interventionPrograms.map((p, i) => (
                                        <div key={i} className="flex justify-between text-slate-600">
                                          <span>{p.label}</span>
                                          <span>{p.checked ? '✓' : '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="border border-slate-200 rounded-lg p-1.5 bg-slate-50/60">
                                      <p className="font-bold text-slate-700 uppercase text-[8px] mb-1">Kemajuan</p>
                                      {note.detailedProgress.exerciseProgress.map((p, i) => (
                                        <div key={i} className="flex justify-between text-slate-600">
                                          <span>{p.label}</span>
                                          <span>{p.checked ? '✓' : '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Signatures */}
                      <div className="mt-4 pt-3 border-t border-slate-200 break-inside-avoid">
                        <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
                          <div>
                            <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Terapis Penanggung Jawab,</p>
                            <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                            <p className="font-black text-slate-800 uppercase">Terapis LTC</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Koordinator Terapi,</p>
                            <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                            <p className="font-black text-slate-800 uppercase">Koord. Klinis LTC</p>
                          </div>
                          <div>
                            <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Orang Tua / Wali,</p>
                            <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                            <p className="font-black text-slate-800 uppercase">{selectedChild?.parentName || selectedChild?.motherName || selectedChild?.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 mt-2">
                        <span>Dokumen Resmi Rekam Catatan Klinis • Yayasan Pelangi Lazuardi</span>
                        <span>Dicetak melalui Sistem Informasi Terapi Pelangi Lazuardi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            ) : (
              /* Closed Hardcover Leather Therapy Book Cover State */
              <div className="h-full flex items-center justify-center p-4 lg:p-8">
                <div 
                  className="w-full max-w-xl bg-gradient-to-br from-[#2D1B14] via-[#1E110B] to-[#120A07] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border-4 border-[#3D251C] relative overflow-hidden text-center group"
                  style={{
                    boxShadow: '4px 2px 0 #F1EBDB, 8px 4px 0 #E7DFC9, 12px 6px 0 #DDD4BD, 16px 8px 0 #D2C8AF, 20px 24px 40px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Stitched seam inside cover */}
                  <div className="absolute inset-4 lg:inset-6 rounded-[2rem] border-2 border-dashed border-amber-500/30 pointer-events-none" />
                  
                  {/* Brass corner brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/50 rounded-tl-xl pointer-events-none" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400/50 rounded-tr-xl pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400/50 rounded-bl-xl pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/50 rounded-br-xl pointer-events-none" />

                  {/* Hanging silk bookmark ribbon */}
                  <div 
                    className="absolute top-0 right-16 w-8 h-32 bg-gradient-to-b from-rose-900 via-rose-700 to-rose-800 shadow-xl z-10 pointer-events-none"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)' }}
                  >
                    <div className="w-full h-full relative">
                      <div className="absolute inset-y-0 left-1 w-[1px] bg-rose-400/30" />
                      <div className="absolute inset-y-0 right-1 w-[1px] bg-rose-400/30" />
                    </div>
                  </div>

                  {/* Gold foil emblem & typography */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center mb-6 shadow-inner ring-4 ring-amber-400/10 p-2 overflow-hidden bg-white/10 backdrop-blur-sm">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo Pelangi Lazuardi" className="w-14 h-14 object-contain filter drop-shadow" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-amber-300 drop-shadow" />
                      )}
                    </div>

                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300/80 mb-2 font-serif">
                      BUKU CATATAN TERAPI - PELANGI LAZUARDI
                    </p>

                    <h3 className="text-3xl lg:text-4xl font-black font-serif italic text-amber-100 tracking-tight mb-3 drop-shadow-md">
                      Buku Catatan Terapi Siswa
                    </h3>

                    <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent my-3" />

                    <p className="text-amber-200/75 text-sm max-w-md leading-relaxed font-sans mb-8">
                      Buku harian digital rekam perkembangan klinis & intervensi terapi. Pilih sesi siswa pada daftar indeks di sebelah kiri untuk membuka lembar catatan.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {childrenWithSessionsAtDate.length > 0 ? (
                        <button
                          onClick={() => {
                            const firstChild = childrenWithSessionsAtDate[0];
                            if (firstChild && firstChild.sessions.length > 0) {
                              handleSelectSession(firstChild.id, firstChild.sessions[0].id);
                            }
                          }}
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Buka Buku Sesi Pertama</span>
                        </button>
                      ) : allPastNotes.length > 0 ? (
                        <button
                          onClick={() => {
                            if (allPastNotes[0]) {
                              handleEditHistoryNote(allPastNotes[0].id);
                            }
                          }}
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Buka Catatan Sesi Terakhir</span>
                        </button>
                      ) : null}

                      {allPastNotes.length > 0 ? (
                        <button
                          onClick={() => {
                            setActiveMainTab('riwayat');
                            setShowHistory(true);
                            setShowProgram(false);
                          }}
                          className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-amber-400/30 text-amber-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer"
                        >
                          <History className="w-4 h-4 text-amber-400" />
                          <span>Buka Buku Riwayat Catatan ({allPastNotes.length})</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dedicated Print & PDF Preview Modal */}
      <TherapyPrintPreviewModal
        isOpen={showPrintPreviewModal}
        onClose={() => {
          setShowPrintPreviewModal(false);
          setPrintModalAutoPrint(false);
          setPrintModalAutoDownload(false);
          setPrintModalSpecificNotes(null);
        }}
        child={selectedChild}
        notes={targetNotesForPrint}
        therapists={therapists}
        therapyTypes={therapyTypes}
        logoUrl={logoUrl}
        autoPrint={printModalAutoPrint}
        autoDownloadPdf={printModalAutoDownload}
      />
    </div>
  );
};

export default TherapyNoteBookPage;
