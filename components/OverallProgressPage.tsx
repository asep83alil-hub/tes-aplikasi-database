import React, { useState, useMemo, useEffect } from 'react';
import { Child, TherapyDefinition, Therapist, DetailedProgress, AttendanceStatus } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Printer, 
  TrendingUp, 
  Activity, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Award, 
  Heart, 
  Clock, 
  ArrowLeft, 
  ChevronRight,
  ClipboardList,
  Save,
  Trash2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OverallProgressPageProps {
  children: Child[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  userRole: 'admin' | 'siswa' | 'terapis' | null;
  loggedInUserId: string | null;
  onUpdateSessionWithDate?: (dateKey: string, sessionId: string, updates: { type?: string; note?: string; photoUrls?: string[]; detailedProgress?: DetailedProgress; therapistId?: string }) => void;
  onDeleteAttendanceNote?: (dateKey: string, sessionId: string) => void;
}

const clsx = (...classes: any[]) => classes.filter(Boolean).join(' ');

// Helper to format Indonesian dates
const formatIndonesianDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const OverallProgressPage: React.FC<OverallProgressPageProps> = ({
  children,
  therapists,
  therapyTypes,
  attendanceNotes,
  userRole,
  loggedInUserId,
  onUpdateSessionWithDate,
  onDeleteAttendanceNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapyType, setSelectedTherapyType] = useState<string>('ALL');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  
  // Custom Evaluasi Ringkasan (Quarterly persistent reviews)
  const [quarterlyEvaluation, setQuarterlyEvaluation] = useState<string>('');
  const [savedReviews, setSavedReviews] = useState<{ [childId: string]: string }>({});

  // Manual record form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTherapyType, setFormTherapyType] = useState<string>('OT');
  const [formTherapistId, setFormTherapistId] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  
  const [formInterventions, setFormInterventions] = useState<{ label: string; checked: boolean }[]>([
    { label: 'Berdoa', checked: false },
    { label: 'Sensori Integrasi', checked: false },
    { label: 'Aktivitas Terapeutik', checked: false },
    { label: 'Evaluasi', checked: false }
  ]);
  
  const [formExercises, setFormExercises] = useState<{ label: string; checked: boolean }[]>([
    { label: 'Kontak mata', checked: false },
    { label: 'Proprioseptif', checked: false },
    { label: 'Vestibular', checked: false },
    { label: 'Fine motor', checked: false },
    { label: 'Gross motor', checked: false }
  ]);

  const handleOpenNewForm = () => {
    setEditingSessionId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    
    const initialType = selectedTherapyType !== 'ALL' ? selectedTherapyType : 'OT';
    setFormTherapyType(initialType);
    
    // Default therapist id
    const matchedTherapist = therapists.find(t => t.specialties?.includes(initialType)) || therapists[0];
    setFormTherapistId(matchedTherapist?.id || '');
    
    setFormNote('');
    setFormInterventions([
      { label: 'Berdoa', checked: false },
      { label: 'Sensori Integrasi', checked: false },
      { label: 'Aktivitas Terapeutik', checked: false },
      { label: 'Evaluasi', checked: false }
    ]);
    setFormExercises([
      { label: 'Kontak mata', checked: false },
      { label: 'Proprioseptif', checked: false },
      { label: 'Vestibular', checked: false },
      { label: 'Fine motor', checked: false },
      { label: 'Gross motor', checked: false }
    ]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (session: any) => {
    setEditingSessionId(session.id);
    setFormDate(session.date);
    setFormTherapyType(session.therapyType || 'OT');
    setFormTherapistId(session.therapistId || '');
    setFormNote(session.note || '');
    
    if (session.detailedProgress) {
      if (session.detailedProgress.interventionPrograms) {
        setFormInterventions(session.detailedProgress.interventionPrograms.map((p: any) => ({ ...p })));
      } else {
        setFormInterventions([
          { label: 'Berdoa', checked: false },
          { label: 'Sensori Integrasi', checked: false },
          { label: 'Aktivitas Terapeutik', checked: false },
          { label: 'Evaluasi', checked: false }
        ]);
      }
      
      if (session.detailedProgress.exerciseProgress) {
        setFormExercises(session.detailedProgress.exerciseProgress.map((e: any) => ({ ...e })));
      } else {
        setFormExercises([
          { label: 'Kontak mata', checked: false },
          { label: 'Proprioseptif', checked: false },
          { label: 'Vestibular', checked: false },
          { label: 'Fine motor', checked: false },
          { label: 'Gross motor', checked: false }
        ]);
      }
    } else {
      setFormInterventions([
        { label: 'Berdoa', checked: false },
        { label: 'Sensori Integrasi', checked: false },
        { label: 'Aktivitas Terapeutik', checked: false },
        { label: 'Evaluasi', checked: false }
      ]);
      setFormExercises([
        { label: 'Kontak mata', checked: false },
        { label: 'Proprioseptif', checked: false },
        { label: 'Vestibular', checked: false },
        { label: 'Fine motor', checked: false },
        { label: 'Gross motor', checked: false }
      ]);
    }
    setIsFormOpen(true);
  };

  const handleSaveForm = () => {
    if (!selectedChildId) return;
    if (!onUpdateSessionWithDate) {
      alert("Operasi penulisan tidak didukung");
      return;
    }
    
    const sessionId = editingSessionId || `s-man-${selectedChildId}-${Date.now()}`;
    
    const detailedProgress = {
      interventionPrograms: formInterventions,
      exerciseProgress: formExercises,
      functionalActivities: [
        { activity: '', independence: '', accuracy: '' }
      ],
      weaknessObservations: [
        { label: 'Inatensi', checked: false },
        { label: 'Regulasi', checked: false },
        { label: 'Respon Instruksi', checked: false }
      ],
      responseToIntervention: ''
    };
    
    onUpdateSessionWithDate(formDate, sessionId, {
      type: formTherapyType,
      note: formNote,
      photoUrls: [], 
      detailedProgress,
      therapistId: formTherapistId
    });
    
    setIsFormOpen(false);
    setEditingSessionId(null);
  };

  const handleDeleteRecord = (date: string, sessionId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan perkembangan ini secara permanen?")) return;
    if (onDeleteAttendanceNote) {
      onDeleteAttendanceNote(date, sessionId);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('quarterlyEvaluations');
    if (stored) {
      try {
        setSavedReviews(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveReview = (childId: string) => {
    const updated = { ...savedReviews, [childId]: quarterlyEvaluation };
    setSavedReviews(updated);
    localStorage.setItem('quarterlyEvaluations', JSON.stringify(updated));
    alert('Evaluasi umum berhasil disimpan!');
  };

  // Synchronize input area when active child changes
  useEffect(() => {
    if (selectedChildId) {
      setQuarterlyEvaluation(savedReviews[selectedChildId] || '');
    } else {
      setQuarterlyEvaluation('');
    }
  }, [selectedChildId, savedReviews]);

  // Comprehensive extraction of session history notes for each child
  const childDevelopmentHistory = useMemo(() => {
    const recordsMap: { [childId: string]: any[] } = {};
    
    Object.keys(attendanceNotes || {}).forEach(dateKey => {
      const dateEntries = attendanceNotes[dateKey] || {};
      
      Object.keys(dateEntries).forEach(sessionId => {
        // ID format analysis: s-recur-{childId}-{day}-{time} or s-man-{childId}-{timestamp}-{time}
        const matchesRecur = sessionId.match(/^s-recur-([^-]+)-/);
        const matchesMan = sessionId.match(/^s-man-([^-]+)-/);
        const extractedChildId = matchesRecur ? matchesRecur[1] : (matchesMan ? matchesMan[1] : null);
        
        if (!extractedChildId) return;
        
        const rawVal = dateEntries[sessionId];
        if (!rawVal) return;
        
        let noteText = '';
        let photoUrls: string[] = [];
        let detailedProgress: DetailedProgress | undefined = undefined;
        let therapyType = 'OT';
        let therapistId = '';
        
        if (typeof rawVal === 'string') {
          noteText = rawVal;
        } else {
          noteText = rawVal.note || '';
          photoUrls = rawVal.photoUrls || [];
          detailedProgress = rawVal.detailedProgress;
          therapyType = rawVal.type || 'OT';
          therapistId = rawVal.therapistId || '';
        }
        
        // Filter empty notes but check for progress milestones too
        if (noteText || photoUrls.length > 0 || detailedProgress) {
          if (!recordsMap[extractedChildId]) {
            recordsMap[extractedChildId] = [];
          }
          
          let totalInterventions = detailedProgress?.interventionPrograms?.length || 0;
          let completedInterventions = detailedProgress?.interventionPrograms?.filter(i => i.checked)?.length || 0;
          
          let totalExercises = detailedProgress?.exerciseProgress?.length || 0;
          let completedExercises = detailedProgress?.exerciseProgress?.filter(e => e.checked)?.length || 0;
          
          let completedRatio = 0;
          if ((totalInterventions + totalExercises) > 0) {
            completedRatio = parseFloat((((completedInterventions + completedExercises) / (totalInterventions + totalExercises)) * 100).toFixed(0));
          }

          recordsMap[extractedChildId].push({
            id: sessionId,
            date: dateKey,
            note: noteText,
            photoUrls,
            detailedProgress,
            therapyType,
            therapistId,
            completedRatio,
            completedInterventions,
            totalInterventions,
            completedExercises,
            totalExercises
          });
        }
      });
    });

    // Sort every list descending by date
    Object.keys(recordsMap).forEach(cid => {
      recordsMap[cid].sort((a, b) => b.date.localeCompare(a.date));
    });

    return recordsMap;
  }, [attendanceNotes]);

  // Aggregate student progress tracking
  const studentOverallData = useMemo(() => {
    return children.map(child => {
      const history = childDevelopmentHistory[child.id] || [];
      const totalSessionsWithNotes = history.length;
      
      // Calculate latest completed checkpoints
      const latestSession = history[0]; // sorted descending, so 0 is latest
      const latestNote = latestSession ? latestSession.note : 'Belum ada catatan sesi';
      const lastUpdatedDate = latestSession ? latestSession.date : null;
      const latestCompletionRate = latestSession ? latestSession.completedRatio : 0;
      const latestTherapyType = latestSession ? latestSession.therapyType : 'OT';
      const latestTherapistId = latestSession ? latestSession.therapistId : '';

      // Mean success rates across all documented sessions
      let totalCompletedCheckpoints = 0;
      let totalPossibleCheckpoints = 0;
      history.forEach(session => {
        totalCompletedCheckpoints += (session.completedInterventions + session.completedExercises);
        totalPossibleCheckpoints += (session.totalInterventions + session.totalExercises);
      });
      const cumulativeSuccessRate = totalPossibleCheckpoints > 0 
        ? parseFloat(((totalCompletedCheckpoints / totalPossibleCheckpoints) * 100).toFixed(0))
        : 0;

      // Extract all unique therapy programs active
      const therapiesAssigned = Array.from(new Set(child.sessions?.map(s => s.type) || []));

      return {
        ...child,
        history,
        totalSessionsWithNotes,
        latestNote,
        lastUpdatedDate,
        latestCompletionRate,
        latestTherapyType,
        latestTherapistId,
        cumulativeSuccessRate,
        therapiesAssigned
      };
    });
  }, [children, childDevelopmentHistory]);

  // Filter based on search, role boundaries (such as parent and therapist views), and selected filters
  const filteredStudents = useMemo(() => {
    let result = studentOverallData;

    // Boundary constraints for roles
    if (userRole === 'siswa') {
      result = result.filter(c => c.id === loggedInUserId);
    } else if (userRole === 'terapis') {
      // Find therapists specialties or kids with active sessions assigned
      const currentTherapist = therapists.find(t => t.id === loggedInUserId);
      if (currentTherapist) {
        const specialties = currentTherapist.specialties || [];
        result = result.filter(c => 
          c.sessions?.some(s => s.therapistId === loggedInUserId) || 
          c.recurringSessions?.some(rs => rs.therapistId === loggedInUserId)
        );
      }
    }

    // Interactive filters
    if (searchTerm) {
      const uSearch = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(uSearch) || 
        s.id.toLowerCase().includes(uSearch) ||
        s.history.some(h => h.note.toLowerCase().includes(uSearch))
      );
    }

    if (selectedTherapyType !== 'ALL') {
      result = result.filter(s => 
        s.therapiesAssigned.includes(selectedTherapyType) ||
        s.history.some(h => h.therapyType === selectedTherapyType)
      );
    }

    return result;
  }, [studentOverallData, userRole, loggedInUserId, searchTerm, selectedTherapyType, therapists]);

  // Calculate high-level global metrics for dashboard cards
  const summaryMetrics = useMemo(() => {
    const activeReviews = Object.keys(savedReviews).length;
    let totalNotesRecorded = 0;
    let highestProgressionChildName = '-';
    let maxProgression = 0;

    studentOverallData.forEach(student => {
      totalNotesRecorded += student.totalSessionsWithNotes;
      if (student.cumulativeSuccessRate > maxProgression && student.totalSessionsWithNotes > 0) {
        maxProgression = student.cumulativeSuccessRate;
        highestProgressionChildName = student.name;
      }
    });

    return {
      totalStudentsCount: children.length,
      totalNotesRecorded,
      highestProgressionChildName,
      maxProgression,
      activeReviews
    };
  }, [children, studentOverallData, savedReviews]);

  // Child detailed analysis section
  const activeChild = useMemo(() => {
    return studentOverallData.find(s => s.id === selectedChildId);
  }, [studentOverallData, selectedChildId]);

  // Formatting chart data for Recharts: Timeline showing milestone completion rates over time
  const childChartData = useMemo(() => {
    if (!activeChild || activeChild.history.length === 0) return [];
    
    // Reverse historical records to show chronological ordering (oldest -> newest)
    return [...activeChild.history]
      .reverse()
      .map(entry => ({
        dateLabel: entry.date.split('-').slice(1).join('-'), // MM-DD
        fullNameDate: formatIndonesianDate(entry.date),
        'Tingkat Capaian (%)': entry.completedRatio,
        'Target Terapi': entry.totalInterventions + entry.totalExercises,
        'Tercapai': entry.completedInterventions + entry.completedExercises
      }));
  }, [activeChild]);

  // Aggregate completion statistics for therapy groups (OT, TW, etc) to display on active child detail panels
  const activeChildSubMetrics = useMemo(() => {
    if (!activeChild) return null;

    const res: { [key: string]: { total: number; completed: number; rate: number } } = {
      'OT': { total: 0, completed: 0, rate: 0 },
      'TW': { total: 0, completed: 0, rate: 0 },
      'FT': { total: 0, completed: 0, rate: 0 },
      'REMEDIAL': { total: 0, completed: 0, rate: 0 }
    };

    activeChild.history.forEach(entry => {
      const type = entry.therapyType;
      const targetKey = res[type] ? type : 'OT';
      res[targetKey].total += (entry.totalInterventions + entry.totalExercises);
      res[targetKey].completed += (entry.completedInterventions + entry.completedExercises);
    });

    Object.keys(res).forEach(k => {
      const item = res[k];
      item.rate = item.total > 0 ? parseFloat(((item.completed / item.total) * 100).toFixed(0)) : 0;
    });

    return res;
  }, [activeChild]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="student-overall-progress" className="p-4 sm:p-8 min-h-screen">
      {/* Absolute Header Layout */}
      <div className="max-w-7xl mx-auto w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight italic uppercase font-serif">Pusat Perkembangan Siswa</h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Rekapitulasi Capaian Terapi, Jurnal Notes & Evaluasi Komprehensif</p>
        </div>
        
        {/* Print Action button */}
        {activeChild && (
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-xs font-extrabold rounded-2xl border-2 border-primary-light/30 shadow-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Printer className="h-4 w-4" />
            CETAK REKAPITULASI
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedChildId ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl mx-auto space-y-6 print:hidden"
          >
            {/* Summary metrics widgets (Bento Grid layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-surface border border-surface-light rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500">
                  <Users className="h-24 w-24 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-text-muted">TOTAL SISWA</p>
                  <p className="text-3xl font-black text-text-heading font-serif mt-1">{summaryMetrics.totalStudentsCount}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="p-5 bg-surface border border-surface-light rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500">
                  <BookOpen className="h-24 w-24 text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-text-muted">SESI DICATAT</p>
                  <p className="text-3xl font-black text-text-heading font-serif mt-1">{summaryMetrics.totalNotesRecorded}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
              </div>

              <div className="p-5 bg-surface border border-surface-light rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500">
                  <TrendingUp className="h-24 w-24 text-success" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-text-muted">PERKEMBANGAN TERTINGGI</p>
                  <p className="text-lg font-bold text-text-heading mt-1 truncate max-w-[150px]">{summaryMetrics.highestProgressionChildName}</p>
                  <p className="text-xs text-success font-extrabold mt-0.5">+{summaryMetrics.maxProgression}% Gol Tercapai</p>
                </div>
                <div className="p-3 bg-success/10 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>

              <div className="p-5 bg-surface border border-surface-light rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500">
                  <Award className="h-24 w-24 text-warning" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-text-muted">EVALUASI UMUM</p>
                  <p className="text-3xl font-black text-text-heading font-serif mt-1">{summaryMetrics.activeReviews}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-2xl">
                  <Award className="h-6 w-6 text-warning" />
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="p-4 bg-surface border border-surface-light rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto flex-grow relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="h-4 w-4 text-text-muted" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama anak, ID, atau kata kunci catatan sesi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border-2 border-surface-light hover:border-text-muted focus:border-primary rounded-2xl text-sm font-medium transition-all text-text-heading placeholder-text-muted focus:outline-none"
                />
              </div>

              <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-surface-light rounded-2xl text-xs font-bold text-text-muted mr-1">
                  <Filter className="h-3 w-3" />
                  <span>FILTER TERAPI:</span>
                </div>
                <div className="flex bg-background border border-surface-light rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => setSelectedTherapyType('ALL')}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      selectedTherapyType === 'ALL'
                        ? "bg-primary text-white shadow-md font-extrabold"
                        : "text-text-muted hover:text-text-heading hover:bg-surface-light/30"
                    )}
                  >
                    Semua
                  </button>
                  {therapyTypes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTherapyType(t.id)}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        selectedTherapyType === t.id
                          ? "bg-primary text-white shadow-md font-extrabold"
                          : "text-text-muted hover:text-text-heading hover:bg-surface-light/30"
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Students Progression Directory */}
            <div className="p-6 bg-surface border border-surface-light rounded-3xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-light">
                      <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest pl-3">Siswa</th>
                      <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Kehadiran & Sesi Notes</th>
                      <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Persentase Target Tercapai</th>
                      <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest pl-4">Target Terakhir</th>
                      <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest pr-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-light">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const progressPercentage = student.cumulativeSuccessRate;
                        
                        return (
                          <tr key={student.id} className="group hover:bg-surface-light/10 transition-colors">
                            <td className="py-4 pl-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={student.photoUrl || "https://i.pravatar.cc/150"}
                                  alt={student.name}
                                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-primary/20 bg-background flex-shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-text-heading group-hover:text-primary transition-colors">{student.name}</p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[10px] bg-background border border-surface-light text-text-muted font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">{student.id}</span>
                                    {student.therapiesAssigned.map(t => {
                                      const typeDef = therapyTypes.find(def => def.id === t);
                                      return (
                                        <span 
                                          key={t}
                                          style={{ borderColor: typeDef?.color ? `${typeDef.color}40` : '#ccc' }}
                                          className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-md text-text-muted"
                                        >
                                          {t}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 text-center">
                              <span className="text-sm font-black text-text-heading">{student.totalSessionsWithNotes}</span>
                              <span className="text-xs text-text-muted font-bold block mt-0.5">Sesi Ber-Catatan</span>
                            </td>

                            <td className="py-4">
                              <div className="max-w-[150px] mx-auto">
                                <div className="flex items-center justify-between text-xs font-extrabold text-text-heading mb-1.5">
                                  <span className="text-[10px] font-black text-text-muted">CUMULATIVE RA</span>
                                  <span className="text-primary font-black">{progressPercentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-background border border-surface-light rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500" 
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-4 pl-4">
                              {student.lastUpdatedDate ? (
                                <div className="max-w-[280px]">
                                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatIndonesianDate(student.lastUpdatedDate)}</span>
                                  </div>
                                  <p className="text-xs text-text-heading font-medium mt-1 truncate italic">"{student.latestNote}"</p>
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted italic">Belum ada progres terdokumentasi</span>
                              )}
                            </td>

                            <td className="py-4 pr-3 text-right">
                              <button
                                onClick={() => setSelectedChildId(student.id)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-background border-2 border-surface-light hover:border-primary rounded-xl text-xs font-black text-text-heading hover:text-primary transition-all shadow-sm"
                              >
                                Detail Progres
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <p className="text-sm text-text-muted italic">Tidak ada siswa yang sesuai dengan filter pencarian.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header / Navigasi kembali */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-light print:hidden">
              <button
                onClick={() => setSelectedChildId(null)}
                className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-text-heading transition-colors uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4" />
                KEMBALI KE REKAP SISWA
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 bg-background border-2 border-surface-light hover:border-text-muted rounded-xl text-xs font-black text-text-heading transition-all shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  CETAK LAPORAN
                </button>
              </div>
            </div>

            {/* PRINT-ONLY HEADER HEADER */}
            <div className="hidden print:block border-b-4 border-double border-slate-900 pb-6 mb-8 text-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black italic font-serif tracking-tight uppercase">Pelangi Lazuardi RC</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Lembaga Terapi & Intervensi Perkembangan Perkembangan Anak</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Jl. Lazuardi GCS Jakarta | Telp: (021) 7500123 | pelangi@lazuardi.sch.id</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 font-serif font-black italic">LAPORAN PERKEMBANGAN KOMPREHENSIF</span>
                  <p className="text-[10px] text-slate-500 mt-2">Dibuat tanggal: {formatIndonesianDate(new Date().toISOString().split('T')[0])}</p>
                </div>
              </div>
            </div>

            {/* Profil Siswa & Program At Glance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="p-6 bg-surface border border-surface-light rounded-3xl shadow-sm space-y-4 print:border-slate-300 print:text-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={activeChild?.photoUrl || "https://i.pravatar.cc/150"}
                    alt={activeChild?.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-primary/20 bg-background"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg uppercase tracking-widest">{activeChild?.id}</span>
                    <h2 className="text-lg sm:text-xl font-black text-text-heading font-serif mt-1 print:text-slate-950">{activeChild?.name}</h2>
                    <p className="text-xs text-text-muted mt-0.5 font-bold uppercase tracking-wider">{activeChild?.className || "Kelompok Siswa"}</p>
                  </div>
                </div>

                <div className="divide-y divide-surface-light print:divide-slate-200">
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-text-muted font-bold">TOTAL CATATAN PROGRAM</span>
                    <span className="font-extrabold text-text-heading">{activeChild?.totalSessionsWithNotes} Sesi</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-text-muted font-bold">RATA-RATA PENCAPAIAN TARGET</span>
                    <span className="font-black text-primary text-sm">+{activeChild?.cumulativeSuccessRate}%</span>
                  </div>
                  <div className="py-2.5 flex flex-col gap-1 text-xs">
                    <span className="text-text-muted font-bold uppercase tracking-wider">PROGRAM TERAPI UTAMA</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeChild?.therapiesAssigned.map(t => {
                        const typeDef = therapyTypes.find(def => def.id === t);
                        return (
                          <span 
                            key={t}
                            style={{ borderColor: typeDef?.color ? `${typeDef.color}60` : '#ccc' }}
                            className="bg-background px-2.5 py-1 text-[10px] font-black border rounded-lg text-text-heading uppercase tracking-widest"
                          >
                            {typeDef?.name || t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Development breakdown across categories */}
              <div className="lg:col-span-2 p-6 bg-surface border border-surface-light rounded-3xl shadow-sm print:border-slate-300 print:text-slate-800">
                <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-4 font-serif">Aktivitas Program Menurut Jenis Terapi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeChildSubMetrics && Object.keys(activeChildSubMetrics).map(typeKey => {
                    const metrics = activeChildSubMetrics[typeKey];
                    const typeDef = therapyTypes.find(def => def.id === typeKey);
                    if (!typeDef && metrics.total === 0) return null;
                    
                    return (
                      <div key={typeKey} className="p-4 bg-background/50 border border-surface-light rounded-2xl print:border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: typeDef?.color || '#999' }}
                            />
                            <span className="text-xs font-black text-text-heading uppercase tracking-widest">{typeDef?.name || typeKey}</span>
                          </div>
                          <span className="text-xs font-black text-text-muted">{metrics.completed}/{metrics.total} Target</span>
                        </div>

                        <div className="h-2 w-full bg-surface border border-surface-light rounded-full overflow-hidden mt-3">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${metrics.rate}%`, 
                              backgroundColor: typeDef?.color || 'var(--color-primary)' 
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-text-muted mt-1.5">
                          <span>TINGKAT CAPAIAN GOL</span>
                          <span className="text-text-heading">{metrics.rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grafik Capaian Target Perkembangan (Timeline Chart) */}
            {childChartData.length > 0 && (
              <div className="p-6 bg-surface border border-surface-light rounded-3xl shadow-sm print:hidden">
                <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 font-serif">Visualisasi Tren Perkembangan Milestones</h3>
                
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={childChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="progGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="dateLabel" 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        fontWeight="bold" 
                        domain={[0, 100]} 
                        tickFormatter={(v) => `${v}%`}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Tingkat Capaian (%)" 
                        stroke="var(--color-primary)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#progGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-text-muted text-center font-extrabold uppercase mt-3">Sumbu X: Tanggal Sesi Terapi • Sumbu Y: Persentase Target Milestones yang Tercapai</p>
              </div>
            )}

            {/* Jurnal Notes Sesi Terapi & Progress Log */}
            <div className="p-6 bg-surface border border-surface-light rounded-3xl shadow-sm print:border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
                <h3 className="text-sm font-black text-text-heading uppercase tracking-wider font-serif">Catatan Harian Sesi & Milestones Terapi</h3>
                
                {onUpdateSessionWithDate && userRole !== 'siswa' && (
                  <button
                    onClick={handleOpenNewForm}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    TAMBAH SESI MANUAL
                  </button>
                )}
              </div>
              <h3 className="hidden print:block text-sm font-black text-slate-950 uppercase tracking-wider mb-6 font-serif">Catatan Harian Sesi & Milestones Terapi</h3>

              <div className="space-y-6 relative border-l-2 border-surface-light/70 pl-6 ml-4 print:border-slate-300">
                {activeChild?.history && activeChild.history.length > 0 ? (
                  activeChild.history.map((session, index) => {
                    const typeDef = therapyTypes.find(def => def.id === session.therapyType);
                    const therapist = therapists.find(t => t.id === session.therapistId);
                    
                    return (
                      <div key={session.id} className="relative group page-break-avoid">
                        {/* Dot indicator */}
                        <div 
                          className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-4 border-surface shadow-md transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: typeDef?.color || 'var(--color-primary)' }}
                        />
                        
                        <div className="p-5 bg-background/50 border border-surface-light rounded-2xl shadow-sm print:border-slate-200 print:text-slate-800">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                            <div>
                              <span className="text-[10px] text-text-muted font-bold block">{formatIndonesianDate(session.date)}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span 
                                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg text-white"
                                  style={{ backgroundColor: typeDef?.color || '#999' }}
                                >
                                  {typeDef?.name || session.therapyType}
                                </span>
                                <span className="text-xs font-bold text-text-heading print:text-slate-900">
                                  Terapis: {therapist?.name || session.therapistId || "Staf Pelangi Lazuardi"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-xl font-bold">
                                Milestone Tercapai: {session.completedRatio}%
                              </span>
                              {onUpdateSessionWithDate && userRole !== 'siswa' && (
                                <div className="flex items-center gap-1 print:hidden ml-2">
                                  <button 
                                    onClick={() => handleOpenEditForm(session)}
                                    className="p-1.5 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors"
                                    title="Ubah Catatan"
                                  >
                                    <ClipboardList className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteRecord(session.date, session.id)}
                                    className="p-1.5 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded-lg transition-colors"
                                    title="Hapus Catatan"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress targets checklists review section */}
                          {session.detailedProgress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-3 border-t border-surface-light/50 print:border-slate-200">
                              {session.detailedProgress.interventionPrograms && session.detailedProgress.interventionPrograms.some(i => i.checked) && (
                                <div>
                                  <span className="text-[10px] font-black tracking-widest text-text-muted uppercase block mb-1.5">Interpensi program :</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {session.detailedProgress.interventionPrograms.filter(i => i.checked).map((itUrl, i) => (
                                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-success/15 text-success border border-success/30 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {itUrl.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {session.detailedProgress.exerciseProgress && session.detailedProgress.exerciseProgress.some(e => e.checked) && (
                                <div>
                                  <span className="text-[10px] font-black tracking-widest text-text-muted uppercase block mb-1.5">Aktivitas motorik :</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {session.detailedProgress.exerciseProgress.filter(e => e.checked).map((itUrl, i) => (
                                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-secondary/15 text-secondary border border-secondary/30 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {itUrl.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Detailed progress comments notes */}
                          {session.note && (
                            <div className="mt-2 bg-background p-3.5 rounded-xl border border-surface-light/40 print:bg-white print:border-slate-200">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Catatan Terapis</span>
                              <p className="text-xs sm:text-sm text-text-heading font-medium leading-relaxed whitespace-pre-line print:text-slate-900">
                                {session.note}
                              </p>
                            </div>
                          )}

                          {/* Session photos documentation */}
                          {session.photoUrls && session.photoUrls.length > 0 && (
                            <div className="mt-4 print:hidden">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">Dokumentasi Terapi</span>
                              <div className="flex flex-wrap gap-2">
                                {session.photoUrls.map((href, index) => (
                                  <img
                                    key={index}
                                    src={href}
                                    alt={`Foto dokumentasi perkembagan ${activeChild?.name}`}
                                    className="h-20 w-24 rounded-xl object-cover hover:scale-105 active:scale-95 transition-transform bg-background/50 cursor-zoom-in"
                                    referrerPolicy="no-referrer"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-background/30 border border-dashed border-surface-light rounded-3xl">
                    <p className="text-xs text-text-muted italic">Belum ada progres perkembangan harian yang ditambahkan untuk anak ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Evaluasi Umum & Catatan Berjangka (Quarterly/Monthly General Evaluation Builder) */}
            <div className="p-6 bg-surface border border-surface-light rounded-3xl shadow-sm print:border-slate-300 page-break-avoid">
              <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-4 font-serif print:text-slate-950">Evaluasi Umum & Rekomendasi Jangka Panjang</h3>
              
              <p className="text-xs text-text-muted leading-relaxed mb-4 print:hidden">
                Catatan evaluasi komprehensif ini digunakan untuk mencatatkan kesimpulan perkembangan siswa secara berkala (misal Bulanan atau Triwulan), terpisah dari entri harian sesi. Anda dapat mencetak laporan perkembangan komprehensif lengkap dengan ringkasan evaluasi ini.
              </p>
              
              <div className="space-y-4">
                <textarea
                  value={quarterlyEvaluation}
                  onChange={(e) => setQuarterlyEvaluation(e.target.value)}
                  placeholder="Ketik ringkasan evaluasi perkembangan, kesimpulan program intervensi, kendala keseluruhan, dan prioritas home program untuk periode evaluasi ini di sini..."
                  rows={6}
                  className="w-full p-4 bg-background border-2 border-surface-light hover:border-text-muted focus:border-primary rounded-2xl text-xs sm:text-sm font-medium leading-relaxed transition-all text-text-heading focus:outline-none placeholder-text-muted print:bg-white print:border-slate-300 print:text-slate-900"
                />

                <div className="flex items-center justify-between gap-4 print:hidden">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                    Terakhir diubah: Tersimpan lokal di perangkat
                  </span>

                  <button
                    onClick={() => activeChild && handleSaveReview(activeChild.id)}
                    className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    SIMPAN EVALUASI UMUM
                  </button>
                </div>
              </div>
            </div>

            {/* PRINT-ONLY SIGNATURE SECTION */}
            <div className="hidden print:block mt-16 text-slate-800">
              <p className="text-xs italic text-center text-slate-500 mb-12">Akhir dari laporan perkembangan siswa Pelangi Lazuardi RC.</p>
              
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="space-y-16">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Mengetahui/Menyetujui,</p>
                    <p className="text-[10px] text-slate-500">Terapis Pelaksana</p>
                  </div>
                  <div>
                    <div className="w-40 border-b border-slate-600 mx-auto" />
                    <p className="text-xs font-bold mt-1.5">Abdul Ghofar, AMd.OT., S.Pd.</p>
                    <p className="text-[9px] text-slate-500">Terapis Penanggung Jawab</p>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Mengetahui,</p>
                    <p className="text-[10px] text-slate-500">Manager Pelangi Lazuardi RC</p>
                  </div>
                  <div>
                    <div className="w-40 border-b border-slate-600 mx-auto" />
                    <p className="text-xs font-bold mt-1.5">Asep Suherman, S.E., M.M.</p>
                    <p className="text-[9px] text-slate-500">Pimpinan Pusat Pelangi Lazuardi</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Form Tambah/Ubah Catatan Perkembangan */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-surface-light rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-text-heading"
            >
              <div className="flex items-center justify-between border-b border-surface-light pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black font-serif uppercase tracking-tight text-primary">
                    {editingSessionId ? 'UBAH CATATAN SEBAGAI TERAPIS' : 'TAMBAH CATATAN MANUAL BARU'}
                  </h3>
                  <p className="text-xs text-text-muted font-bold uppercase mt-1">
                    Untuk Siswa: <span className="text-text-heading">{activeChild?.name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-surface-light/50 rounded-xl text-text-muted hover:text-text-heading transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Date & Therapy Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted tracking-widest mb-1.5">TANGGAL SESI</label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-surface-light rounded-xl text-xs font-bold text-text-heading focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted tracking-widest mb-1.5">JENIS TERAPI</label>
                    <select
                      value={formTherapyType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormTherapyType(newType);
                        // Auto-assign therapist
                        const matchedTherapist = therapists.find(t => t.specialties?.includes(newType)) || therapists[0];
                        if (matchedTherapist) setFormTherapistId(matchedTherapist.id);
                      }}
                      className="w-full px-3 py-2.5 bg-background border border-surface-light rounded-xl text-xs font-bold text-text-heading focus:outline-none focus:border-primary"
                    >
                      {therapyTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted tracking-widest mb-1.5">TERAPIS</label>
                    <select
                      value={formTherapistId}
                      onChange={(e) => setFormTherapistId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-surface-light rounded-xl text-xs font-bold text-text-heading focus:outline-none focus:border-primary"
                    >
                      <option value="">Pilih Terapis</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Milestones */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-surface-light pb-2 mb-3">MILESTONES & PROGRAM INTERVENSI</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Intervensi Programs Checklist */}
                    <div>
                      <span className="block text-[10px] font-black uppercase text-text-heading mb-2">1. Intervensi Pelaksanaan</span>
                      <div className="space-y-2 bg-background/50 p-3 rounded-2xl border border-surface-light">
                        {formInterventions.map((item, index) => (
                          <label key={index} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer py-1.5 px-2 hover:bg-surface-light/20 rounded-lg transition-colors select-none">
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={(e) => {
                                const updated = [...formInterventions];
                                updated[index].checked = e.target.checked;
                                setFormInterventions(updated);
                              }}
                              className="rounded text-primary focus:ring-primary h-4 w-4 bg-background border-surface-light"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Exercise Goals Checklist */}
                    <div>
                      <span className="block text-[10px] font-black uppercase text-text-heading mb-2">2. Aktivitas Motorik & Sensorik</span>
                      <div className="space-y-2 bg-background/50 p-3 rounded-2xl border border-surface-light">
                        {formExercises.map((item, index) => (
                          <label key={index} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer py-1.5 px-2 hover:bg-surface-light/20 rounded-lg transition-colors select-none">
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={(e) => {
                                const updated = [...formExercises];
                                updated[index].checked = e.target.checked;
                                setFormExercises(updated);
                              }}
                              className="rounded text-primary focus:ring-primary h-4 w-4 bg-background border-surface-light"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note / Comments Textarea */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-text-muted tracking-widest mb-1.5">CATATAN DAN EVALUASI HASIL TERAPI</label>
                  <textarea 
                    rows={4}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Tuliskan catatan kemajuan anak selama sesi, kendala yang dihadapi, kepatuhan instruksi..."
                    className="w-full p-4 bg-background border border-surface-light focus:outline-none focus:border-primary rounded-2xl text-xs sm:text-sm font-medium leading-relaxed transition-all text-text-heading placeholder-text-muted"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-light">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-background border-2 border-surface-light hover:border-text-muted rounded-xl text-xs font-black text-text-heading transition-all whitespace-nowrap"
                  >
                    BATAL
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-dark transition-all whitespace-nowrap"
                  >
                    SIMPAN CATATAN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled Print Rules helper styles in index.css or injected */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #student-overall-progress {
            padding: 0px !important;
            margin: 0px !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .page-break-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
};

export default OverallProgressPage;
