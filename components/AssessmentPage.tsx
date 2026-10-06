import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Trash2, 
  Edit3, 
  Eye, 
  UserPlus, 
  ChevronRight, 
  Check, 
  X, 
  Sparkles, 
  FileCheck, 
  Upload, 
  Download, 
  Stethoscope, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Brain, 
  Activity, 
  FolderDown, 
  RefreshCw, 
  Tag, 
  ExternalLink,
  MessageSquare,
  Baby,
  Smile,
  Save,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  MessageCircle,
  CalendarRange
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Cell 
} from 'recharts';
import { 
  Child, 
  Therapist, 
  TherapyDefinition, 
  AssessmentStatus, 
  UserRole, 
  RegistrationRecord,
  AssessmentStudentItem,
  AssessmentTeamAssignment,
  AssessmentDocument,
  AssessmentStudentStatus
} from '../types';
import { 
  getStoredAssessmentStudents, 
  saveStoredAssessmentStudents, 
  syncAssessmentWithRegistrations, 
  AVAILABLE_PSYCHOLOGISTS,
  formatAssessmentSchedule,
  ASSESSMENT_TIME_PRESETS,
  ASSESSMENT_ROOM_PRESETS 
} from '../utils/assessmentStorage';

interface AssessmentPageProps {
  allChildren?: Child[];
  onUpdateStatus?: (childId: string, newStatus: AssessmentStatus) => void;
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  registrations?: RegistrationRecord[];
  onUpdateRegistration?: (updated: RegistrationRecord) => void;
  userRole?: UserRole;
  loggedInUserId?: string | null;
  onNavigate?: (view: any) => void;
  logoUrl?: string;
}

export const ASSESSMENT_STATUS_CONFIG: Record<AssessmentStudentStatus, {
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}> = {
  'Menunggu Assessment': {
    label: 'Menunggu Assessment',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-400',
    description: 'Data calon klien baru menunggu penentuan jadwal dan penugasan tim klinis.'
  },
  'Assessment Terjadwal': {
    label: 'Assessment Terjadwal',
    badgeBg: 'bg-blue-500/15',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-400 animate-pulse',
    description: 'Jadwal assessment, ruangan, dan tim 3 terapis + 1 psikolog telah ditentukan.'
  },
  'Sedang Proses': {
    label: 'Sedang Proses',
    badgeBg: 'bg-purple-500/15',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-400 animate-pulse',
    description: 'Sesi observasi & pemeriksaan klinis sedang berlangsung di klinik.'
  },
  'Assessment Selesai': {
    label: 'Assessment Selesai',
    badgeBg: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    description: 'Observasi selesai, berkas laporan & rekomendasi program siap ditinjau.'
  },
  'Menjadi Klien Aktif': {
    label: 'Menjadi Klien Aktif',
    badgeBg: 'bg-teal-500/15',
    textColor: 'text-teal-300',
    borderColor: 'border-teal-500/30',
    dotColor: 'bg-teal-300',
    description: 'Resmi terdaftar sebagai siswa terapi aktif Pelangi Lazuardi.'
  }
};

export const ALL_ASSESSMENT_STATUS_OPTIONS: AssessmentStudentStatus[] = [
  'Menunggu Assessment',
  'Assessment Terjadwal',
  'Sedang Proses',
  'Assessment Selesai',
  'Menjadi Klien Aktif'
];

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  allChildren = [],
  onUpdateStatus,
  therapists = [],
  therapyTypes = [],
  registrations = [],
  onUpdateRegistration,
  userRole = 'admin',
  loggedInUserId = null,
  onNavigate,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png'
}) => {
  // Assessment Students List (persisted in localStorage)
  const [students, setStudents] = useState<AssessmentStudentItem[]>(() => {
    const stored = getStoredAssessmentStudents();
    if (registrations && registrations.length > 0) {
      return syncAssessmentWithRegistrations(stored, registrations);
    }
    return stored;
  });

  // Filter & Search States
  const [activeTab, setActiveTab] = useState<'ALL' | AssessmentStudentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [therapistFilter, setTherapistFilter] = useState('ALL');
  const [showStatsCharts, setShowStatsCharts] = useState(true);

  // Modals States
  const [selectedStudentForTeam, setSelectedStudentForTeam] = useState<AssessmentStudentItem | null>(null);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<AssessmentStudentItem | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<{ doc: AssessmentDocument; student: AssessmentStudentItem } | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<AssessmentStudentItem | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'identitas' | 'ortu' | 'jadwal' | 'tim' | 'berkas'>('identitas');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Role Access Control: Only Manager and Admin can edit assessment data
  const canEdit = userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin';

  // Calculate Age in Years and Months (Matching Registration)
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return '-';
    try {
      const birth = new Date(birthDateString);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
        years--;
        months += 12;
      }
      return `${years} thn ${months} bln`;
    } catch {
      return '-';
    }
  };

  // WhatsApp Direct Coordination Handler
  const handleOpenWhatsApp = (student: AssessmentStudentItem) => {
    const cleanPhone = (student.whatsapp || '').replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.slice(1);
    }

    const sched = formatAssessmentSchedule(student.assessmentDate, student.assessmentTime, student.assessmentRoom);
    const schedInfo = sched.isScheduled 
      ? `pada hari *${sched.dayName}, ${sched.formattedDate}* pukul *${sched.timeText}* di *${sched.roomText}*`
      : 'dalam waktu dekat';

    const message = encodeURIComponent(
      `Halo Bapak/Ibu ${student.parentName || 'Orang Tua'},\n\n` +
      `Salam hangat dari *Pusat Layanan Asesmen & Terapi Pelangi Lazuardi* 🌈.\n\n` +
      `Kami ingin mengonfirmasi jadwal assessment klinis untuk ananda *${student.childName}* (No. Reg: ${student.registrationNumber}) ${schedInfo}.\n\n` +
      `Tim pemeriksa ananda terdiri dari:\n` +
      `• Terapis 1: ${student.team.therapist1Name || 'Terapis Okupasi'}\n` +
      `• Terapis 2: ${student.team.therapist2Name || 'Terapis Wicara'}\n` +
      `• Terapis 3: ${student.team.therapist3Name || 'Fisioterapis'}\n` +
      `• Psikolog: ${student.team.psychologistName || 'Psikolog Anak'}\n\n` +
      `Mohon konfirmasi kesiapan ananda dan mohon hadir 15 menit sebelum sesi dimulai. Terima kasih!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // Quick Status Change directly from table row (Only Manager and Admin)
  const handleQuickStatusChange = (student: AssessmentStudentItem, newStatus: AssessmentStudentStatus) => {
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk mengubah status asesmen.');
      return;
    }
    const updated = students.map(s => s.id === student.id ? { ...s, status: newStatus } : s);
    updateStudentsState(updated);
    showToast(`Status ${student.childName} diubah ke "${newStatus}"`);
  };

  // Delete student with confirmation (Only Manager and Admin)
  const handleDeleteStudent = (studentId: string) => {
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk menghapus data siswa asesmen.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus data siswa asesmen ini?')) {
      const updated = students.filter(s => s.id !== studentId);
      updateStudentsState(updated);
      showToast('Data siswa asesmen berhasil dihapus.');
    }
  };

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state whenever registrations prop updates
  useEffect(() => {
    if (registrations && registrations.length > 0) {
      setStudents(prev => {
        const synced = syncAssessmentWithRegistrations(prev, registrations);
        saveStoredAssessmentStudents(synced);
        return synced;
      });
    }
  }, [registrations]);

  // Save to localStorage when students state changes
  const updateStudentsState = (updatedList: AssessmentStudentItem[]) => {
    setStudents(updatedList);
    saveStoredAssessmentStudents(updatedList);
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    const scheduled = students.filter(s => s.status === 'Assessment Terjadwal').length;
    const inProgress = students.filter(s => s.status === 'Sedang Proses').length;
    const completed = students.filter(s => s.status === 'Assessment Selesai' || s.status === 'Menjadi Klien Aktif').length;
    const waiting = students.filter(s => s.status === 'Menunggu Assessment').length;
    const totalDocs = students.reduce((acc, curr) => acc + (curr.documents?.length || 0), 0);
    return { total, scheduled, inProgress, completed, waiting, totalDocs };
  }, [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Tab Status
      if (activeTab !== 'ALL' && student.status !== activeTab) {
        return false;
      }
      // Service Filter
      if (serviceFilter !== 'ALL') {
        const hasService = student.interestedServices?.some(s => s.toLowerCase().includes(serviceFilter.toLowerCase())) ||
                           student.selectedService.toLowerCase().includes(serviceFilter.toLowerCase());
        if (!hasService) return false;
      }
      // Therapist Filter
      if (therapistFilter !== 'ALL') {
        const team = student.team;
        const matches = team.therapist1Id === therapistFilter || 
                        team.therapist2Id === therapistFilter || 
                        team.therapist3Id === therapistFilter ||
                        team.psychologistId === therapistFilter;
        if (!matches) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          student.childName.toLowerCase().includes(q) ||
          (student.childNickname && student.childNickname.toLowerCase().includes(q)) ||
          student.registrationNumber.toLowerCase().includes(q) ||
          student.parentName.toLowerCase().includes(q) ||
          student.whatsapp.includes(q) ||
          (student.diagnosis && student.diagnosis.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [students, activeTab, serviceFilter, therapistFilter, searchQuery]);

  // Form State for Team Assignment Modal
  const [teamForm, setTeamForm] = useState<{
    therapist1Id: string;
    therapist1Type: string;
    therapist2Id: string;
    therapist2Type: string;
    therapist3Id: string;
    therapist3Type: string;
    psychologistId: string;
    assessmentDate: string;
    assessmentTime: string;
    assessmentRoom: string;
    assessmentNotes: string;
    status: AssessmentStudentStatus;
  }>({
    therapist1Id: '',
    therapist1Type: 'Terapi Okupasi (OT)',
    therapist2Id: '',
    therapist2Type: 'Terapi Wicara (TW)',
    therapist3Id: '',
    therapist3Type: 'Fisioterapi (FT)',
    psychologistId: 'PSY-01',
    assessmentDate: '',
    assessmentTime: '09:00 - 11:30',
    assessmentRoom: 'Ruang Sensori Integrasi & Wicara',
    assessmentNotes: '',
    status: 'Assessment Terjadwal'
  });

  // Open Team Modal
  const handleOpenTeamModal = (student: AssessmentStudentItem) => {
    setSelectedStudentForTeam(student);
    setTeamForm({
      therapist1Id: student.team.therapist1Id || (therapists[0]?.id || ''),
      therapist1Type: student.team.therapist1Type || 'Terapi Okupasi (OT)',
      therapist2Id: student.team.therapist2Id || (therapists[1]?.id || ''),
      therapist2Type: student.team.therapist2Type || 'Terapi Wicara (TW)',
      therapist3Id: student.team.therapist3Id || (therapists[2]?.id || ''),
      therapist3Type: student.team.therapist3Type || 'Fisioterapi (FT)',
      psychologistId: student.team.psychologistId || AVAILABLE_PSYCHOLOGISTS[0].id,
      assessmentDate: student.assessmentDate || new Date().toISOString().split('T')[0],
      assessmentTime: student.assessmentTime || '09:00 - 11:30',
      assessmentRoom: student.assessmentRoom || 'Ruang Sensori Integrasi & Wicara',
      assessmentNotes: student.assessmentNotes || '',
      status: student.status
    });
  };

  // Save Team Modal
  const handleSaveTeamModal = () => {
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk mengubah jadwal dan penugasan tim.');
      return;
    }
    if (!selectedStudentForTeam) return;

    const t1 = therapists.find(t => t.id === teamForm.therapist1Id);
    const t2 = therapists.find(t => t.id === teamForm.therapist2Id);
    const t3 = therapists.find(t => t.id === teamForm.therapist3Id);
    const psy = AVAILABLE_PSYCHOLOGISTS.find(p => p.id === teamForm.psychologistId);

    const updatedTeam: AssessmentTeamAssignment = {
      therapist1Id: teamForm.therapist1Id,
      therapist1Name: t1 ? t1.name : '',
      therapist1Type: teamForm.therapist1Type,
      therapist2Id: teamForm.therapist2Id,
      therapist2Name: t2 ? t2.name : '',
      therapist2Type: teamForm.therapist2Type,
      therapist3Id: teamForm.therapist3Id,
      therapist3Name: t3 ? t3.name : '',
      therapist3Type: teamForm.therapist3Type,
      psychologistId: teamForm.psychologistId,
      psychologistName: psy ? psy.name : '',
      psychologistTitle: psy ? psy.title : ''
    };

    const updatedList = students.map(s => {
      if (s.id === selectedStudentForTeam.id) {
        return {
          ...s,
          team: updatedTeam,
          assessmentDate: teamForm.assessmentDate,
          assessmentTime: teamForm.assessmentTime,
          assessmentRoom: teamForm.assessmentRoom,
          assessmentNotes: teamForm.assessmentNotes,
          status: teamForm.status
        };
      }
      return s;
    });

    updateStudentsState(updatedList);
    showToast(`Tim penugasan untuk ${selectedStudentForTeam.childName} berhasil disimpan!`);
    setSelectedStudentForTeam(null);
  };

  // Form State for Document Upload Modal
  const [uploadDocForm, setUploadDocForm] = useState<{
    title: string;
    category: AssessmentDocument['category'];
    notes: string;
    fileName: string;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc' | 'file';
    fileUrl?: string;
  }>({
    title: '',
    category: 'Rujukan Dokter',
    notes: '',
    fileName: '',
    fileSize: '',
    fileType: 'pdf'
  });

  const [activeDocsTab, setActiveDocsTab] = useState<'list' | 'upload'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDocsModal = (student: AssessmentStudentItem) => {
    setSelectedStudentForDocs(student);
    setActiveDocsTab('list');
    setUploadDocForm({
      title: '',
      category: 'Rujukan Dokter',
      notes: '',
      fileName: '',
      fileSize: '',
      fileType: 'pdf'
    });
  };

  // Handle Local File Selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let fType: 'pdf' | 'image' | 'doc' | 'file' = 'file';
      if (ext === 'pdf') fType = 'pdf';
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) fType = 'image';
      else if (['doc', 'docx'].includes(ext || '')) fType = 'doc';

      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      // Read as DataURL for image preview
      const reader = new FileReader();
      reader.onload = () => {
        setUploadDocForm(prev => ({
          ...prev,
          fileName: file.name,
          fileSize: sizeStr,
          fileType: fType,
          fileUrl: typeof reader.result === 'string' ? reader.result : undefined,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ")
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Document Upload
  const handleUploadDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk mengunggah berkas dokumen.');
      return;
    }
    if (!selectedStudentForDocs) return;
    if (!uploadDocForm.title.trim()) {
      alert('Silakan masukkan judul berkas dokumen.');
      return;
    }

    const currentUserName = userRole === 'manager' ? 'Manajer Layanan' : 'Admin Asesmen';

    const newDoc: AssessmentDocument = {
      id: `DOC-${Date.now()}`,
      title: uploadDocForm.title.trim(),
      category: uploadDocForm.category,
      fileName: uploadDocForm.fileName || `${uploadDocForm.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: uploadDocForm.fileSize || '1.1 MB',
      fileType: uploadDocForm.fileType,
      fileUrl: uploadDocForm.fileUrl,
      uploadedBy: currentUserName,
      uploadedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      notes: uploadDocForm.notes.trim()
    };

    const updatedList = students.map(s => {
      if (s.id === selectedStudentForDocs.id) {
        return {
          ...s,
          documents: [newDoc, ...(s.documents || [])]
        };
      }
      return s;
    });

    updateStudentsState(updatedList);
    
    // Update local selected student
    const updatedSelected = updatedList.find(s => s.id === selectedStudentForDocs.id);
    if (updatedSelected) setSelectedStudentForDocs(updatedSelected);

    showToast(`Berkas "${newDoc.title}" berhasil diunggah!`);
    setActiveDocsTab('list');
    setUploadDocForm({
      title: '',
      category: 'Rujukan Dokter',
      notes: '',
      fileName: '',
      fileSize: '',
      fileType: 'pdf'
    });
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk menghapus berkas dokumen.');
      return;
    }
    if (!selectedStudentForDocs) return;
    if (confirm('Apakah Anda yakin ingin menghapus berkas dokumen ini?')) {
      const updatedList = students.map(s => {
        if (s.id === selectedStudentForDocs.id) {
          return {
            ...s,
            documents: (s.documents || []).filter(d => d.id !== docId)
          };
        }
        return s;
      });

      updateStudentsState(updatedList);
      const updatedSelected = updatedList.find(s => s.id === selectedStudentForDocs.id);
      if (updatedSelected) setSelectedStudentForDocs(updatedSelected);
      showToast('Berkas dokumen berhasil dihapus.');
    }
  };

  // Add New Student Form State
  const [newStudentForm, setNewStudentForm] = useState({
    childName: '',
    childNickname: '',
    birthDate: '2021-01-01',
    gender: 'Laki-Laki' as 'Laki-Laki' | 'Perempuan',
    parentName: '',
    whatsapp: '',
    selectedService: 'Assesment Terapi',
    mainComplaint: '',
    diagnosis: '',
    therapist1Id: therapists[0]?.id || '',
    therapist2Id: therapists[1]?.id || '',
    therapist3Id: therapists[2]?.id || '',
    psychologistId: AVAILABLE_PSYCHOLOGISTS[0].id
  });

  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Akses Dibatasi: Hanya akun Manajer dan Admin yang memiliki izin untuk menambah siswa asesmen baru.');
      return;
    }
    if (!newStudentForm.childName.trim()) {
      alert('Nama siswa asesmen wajib diisi.');
      return;
    }

    const nextNumber = `REG-2026-${String(students.length + 1).padStart(3, '0')}`;
    const t1 = therapists.find(t => t.id === newStudentForm.therapist1Id);
    const t2 = therapists.find(t => t.id === newStudentForm.therapist2Id);
    const t3 = therapists.find(t => t.id === newStudentForm.therapist3Id);
    const psy = AVAILABLE_PSYCHOLOGISTS.find(p => p.id === newStudentForm.psychologistId);

    const newStudent: AssessmentStudentItem = {
      id: `ASM-${Date.now()}`,
      registrationNumber: nextNumber,
      childName: newStudentForm.childName.trim(),
      childNickname: newStudentForm.childNickname.trim() || newStudentForm.childName.split(' ')[0],
      birthDate: newStudentForm.birthDate,
      gender: newStudentForm.gender,
      parentName: newStudentForm.parentName.trim() || 'Orang Tua Siswa',
      whatsapp: newStudentForm.whatsapp.trim() || '08123456789',
      selectedService: newStudentForm.selectedService,
      mainComplaint: newStudentForm.mainComplaint.trim() || 'Konsultasi dan asesmen tumbuh kembang.',
      diagnosis: newStudentForm.diagnosis.trim() || 'Suspek Keterlambatan Bicara & Sensori',
      interestedServices: ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)'],
      status: 'Assessment Terjadwal',
      assessmentDate: new Date().toISOString().split('T')[0],
      assessmentTime: '09:00 - 11:30',
      assessmentRoom: 'Ruang Sensori Integrasi & Wicara 1',
      team: {
        therapist1Id: newStudentForm.therapist1Id,
        therapist1Name: t1 ? t1.name : '',
        therapist1Type: 'Terapi Okupasi (OT)',
        therapist2Id: newStudentForm.therapist2Id,
        therapist2Name: t2 ? t2.name : '',
        therapist2Type: 'Terapi Wicara (TW)',
        therapist3Id: newStudentForm.therapist3Id,
        therapist3Name: t3 ? t3.name : '',
        therapist3Type: 'Fisioterapi (FT)',
        psychologistId: newStudentForm.psychologistId,
        psychologistName: psy ? psy.name : '',
        psychologistTitle: psy ? psy.title : ''
      },
      documents: [
        {
          id: `DOC-NEW-${Date.now()}`,
          title: 'Formulir Pendaftaran Asesmen Awal',
          category: 'Formulir Pendaftaran',
          fileName: `Formulir_${newStudentForm.childName.replace(/\s+/g, '_')}.pdf`,
          fileSize: '820 KB',
          fileType: 'pdf',
          uploadedBy: 'Petugas Asesmen',
          uploadedAt: 'Hari ini',
          notes: 'Pendaftaran mandiri siswa asesmen baru.'
        }
      ]
    };

    const updated = [newStudent, ...students];
    updateStudentsState(updated);
    showToast(`Siswa asesmen baru "${newStudent.childName}" berhasil ditambahkan!`);
    setIsAddStudentModalOpen(false);
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status: AssessmentStudentStatus) => {
    switch (status) {
      case 'Assessment Terjadwal':
        return {
          bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400 animate-pulse'
        };
      case 'Sedang Proses':
        return {
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400 animate-pulse'
        };
      case 'Assessment Selesai':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      case 'Menjadi Klien Aktif':
        return {
          bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
          dot: 'bg-teal-300'
        };
      case 'Menunggu Assessment':
      default:
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-sm border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER SECTION (MATCHING REGISTRATION MODEL) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Portal Layanan Asesmen Terpadu
            </span>
            {metrics.waiting > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {metrics.waiting} Menunggu Penjadwalan
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              Otomatis terhubung dengan formulir Registrasi & Rekomendasi Terapi
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Manajemen Asesmen Siswa (Klinis & Observasi)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Kelola jadwal assessment terpadu, penetapan tim klinis (maksimal 3 terapis & 1 psikolog), serta monitoring berkas dokumen observasi calon siswa secara terintegrasi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (filteredStudents.length > 0) {
                setSelectedStudentForDetail(filteredStudents[0]);
              } else {
                alert('Belum ada data siswa asesmen.');
              }
            }}
            className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Buka Lembar Hasil Asesmen Klinis"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Cetak Hasil PDF</span>
          </button>

          <button
            onClick={() => setShowStatsCharts(!showStatsCharts)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>{showStatsCharts ? 'Sembunyikan Grafik' : 'Lihat Analitik'}</span>
          </button>

          {canEdit && (
            <button
              onClick={() => {
                if (registrations && registrations.length > 0) {
                  const synced = syncAssessmentWithRegistrations(students, registrations);
                  updateStudentsState(synced);
                  showToast('Data siswa berhasil disinkronkan dengan menu Registrasi!');
                } else {
                  showToast('Semua data registrasi sudah mutakhir.');
                }
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Sinkronkan dengan data calon klien dari menu Registrasi"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Sinkron Registrasi</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Siswa Asesmen</span>
            </button>
          )}

          {!canEdit && (
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Akses Lihat Saja (Read-Only)</span>
            </span>
          )}
        </div>
      </div>

      {/* BANNER MODE LIHAT SAJA (HANYA MUNCUL BILA BUKAN ADMIN / MANAJER) */}
      {!canEdit && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>Mode Akses Lihat Saja (Read-Only)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Peran: {userRole || 'Pengguna'}
                </span>
              </h4>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Anda hanya memiliki izin membaca data. Wewenang untuk <strong>menambah siswa</strong>, <strong>mengubah jadwal & tim</strong>, <strong>mengubah status</strong>, serta <strong>mengunggah/menghapus dokumen</strong> hanya diberikan kepada akun <strong>Manajer</strong> dan <strong>Admin</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUMMARY KPI STATISTIC CARDS (6 CARDS - REGISTRATION MODEL) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Siswa Asesmen */}
        <div 
          onClick={() => setActiveTab('ALL')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
            activeTab === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Asesmen</span>
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">{metrics.total}</span>
            <span className="text-xs text-slate-400">anak</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Calon & siswa aktif</p>
        </div>

        {/* Card 2: Menunggu Assessment */}
        <div 
          onClick={() => setActiveTab('Menunggu Assessment')}
          className={`bg-slate-900 border-2 rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Menunggu Assessment' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Menunggu Jadwal</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-400 tracking-tight">{metrics.waiting}</span>
            <span className="text-xs text-amber-500 font-bold uppercase">Antrean</span>
          </div>
          <p className="text-[10.5px] text-amber-300/80 mt-1">Belum dijadwalkan</p>
        </div>

        {/* Card 3: Assessment Terjadwal */}
        <div 
          onClick={() => setActiveTab('Assessment Terjadwal')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Assessment Terjadwal' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Terjadwal</span>
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-blue-400 tracking-tight">{metrics.scheduled}</span>
            <span className="text-xs text-blue-400 font-bold">sesi</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Tim & waktu siap</p>
        </div>

        {/* Card 4: Sedang Proses */}
        <div 
          onClick={() => setActiveTab('Sedang Proses')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Sedang Proses' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-800 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-purple-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Sedang Proses</span>
            <span className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-purple-400 tracking-tight">{metrics.inProgress}</span>
            <span className="text-xs text-purple-400">anak</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Observasi berjalan</p>
        </div>

        {/* Card 5: Assessment Selesai */}
        <div 
          onClick={() => setActiveTab('Assessment Selesai')}
          className={`bg-slate-900 border-2 rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Assessment Selesai' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Asesmen Selesai</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">{metrics.completed}</span>
            <span className="text-xs text-emerald-500 font-bold uppercase">Selesai</span>
          </div>
          <p className="text-[10.5px] text-emerald-300/80 mt-1">Laporan & rapot siap</p>
        </div>

        {/* Card 6: Berkas Dokumen & Klien Aktif */}
        <div 
          className="bg-slate-900 border rounded-2xl p-4 shadow-lg transition-all border-slate-800 hover:border-teal-500/50"
        >
          <div className="flex items-center justify-between text-teal-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Berkas Dokumen</span>
            <span className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
              <FolderDown className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-teal-400 tracking-tight">{metrics.totalDocs}</span>
            <span className="text-xs text-teal-400">file</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-400">Terapis On-Duty:</span>
            <span className="text-teal-400 font-extrabold">{therapists.length} Terapis</span>
          </div>
        </div>
      </div>

      {/* 3. DASHBOARD RINGKASAN GRAFIK ASESMEN (COLLAPSIBLE - MODEL REGISTRASI) */}
      {showStatsCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Tren Asesmen */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">Tren Pelaksanaan Asesmen Klinis</h3>
                <p className="text-xs text-slate-400">Jumlah siswa asesmen terdaftar vs asesmen selesai</p>
              </div>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                Semester Berjalan
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { bulan: 'Mei', terjadwal: 4, selesai: 3 },
                  { bulan: 'Jun', terjadwal: 6, selesai: 5 },
                  { bulan: 'Jul', terjadwal: 8, selesai: 7 },
                  { bulan: 'Agu', terjadwal: 7, selesai: 6 },
                  { bulan: 'Sep', terjadwal: 9, selesai: 8 },
                  { bulan: 'Okt', terjadwal: metrics.scheduled + metrics.waiting, selesai: metrics.completed }
                ]}>
                  <XAxis dataKey="bulan" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="terjadwal" name="Terdaftar / Jadwal" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="selesai" name="Asesmen Selesai" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Distribusi Layanan & Tim Assessor */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Layanan Asesmen Paling Diminati</h3>
              <p className="text-xs text-slate-400 mb-3">Distribusi pilihan intervensi awal calon siswa</p>
              <div className="space-y-2.5">
                {[
                  { name: 'Terapi Okupasi (OT)', count: students.filter(s => s.interestedServices?.some(i => i.includes('Okupasi')) || s.team.therapist1Type?.includes('Okupasi')).length || 4, color: 'from-indigo-500 to-cyan-400' },
                  { name: 'Terapi Wicara (TW)', count: students.filter(s => s.interestedServices?.some(i => i.includes('Wicara')) || s.team.therapist2Type?.includes('Wicara')).length || 3, color: 'from-teal-500 to-emerald-400' },
                  { name: 'Fisioterapi (FT)', count: students.filter(s => s.interestedServices?.some(i => i.includes('Fisio')) || s.team.therapist3Type?.includes('Fisio')).length || 2, color: 'from-amber-500 to-orange-400' },
                  { name: 'Psikologi & Tumbuh Kembang', count: students.filter(s => s.team.psychologistId).length || 4, color: 'from-purple-500 to-pink-500' }
                ].map((s, idx) => {
                  const percentage = metrics.total > 0 ? Math.min(100, Math.round((s.count / metrics.total) * 100)) : 25;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold truncate max-w-[200px]">{s.name}</span>
                        <span className="text-indigo-400 font-mono font-bold">{s.count} anak ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${s.color} h-full rounded-full transition-all`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Assessor Utama:</span>
              <span className="font-bold text-emerald-400">Dr. Dian Kusumawardhani, Sp.KFR</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-MENU TABS & SEARCH BAR (IDENTIK MODEL REGISTRASI) */}
      <div className="space-y-4">
        {/* Sub-menu Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua Siswa Asesmen ({students.length})
          </button>

          {ALL_ASSESSMENT_STATUS_OPTIONS.map((status) => {
            const count = students.filter(s => s.status === status).length;
            const config = ASSESSMENT_STATUS_CONFIG[status];
            const isActive = activeTab === status;

            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border-2 border-indigo-500 shadow-sm'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
                <span>{status}</span>
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    status === 'Menunggu Assessment' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Query */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama siswa, No. Reg, orang tua, no. WA, atau keluhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Service & Therapist Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Layanan:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">Semua Layanan</option>
                <option value="Okupasi">Terapi Okupasi (OT)</option>
                <option value="Wicara">Terapi Wicara (TW)</option>
                <option value="Fisioterapi">Fisioterapi (FT)</option>
                <option value="Sensori">Sensori Integrasi (SI)</option>
                <option value="Psikolog">Psikolog</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Tim:</span>
              <select
                value={therapistFilter}
                onChange={(e) => setTherapistFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 cursor-pointer max-w-[160px] truncate"
              >
                <option value="ALL">Semua Tenaga</option>
                {therapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                {AVAILABLE_PSYCHOLOGISTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Psikolog)</option>
                ))}
              </select>
            </div>

            {(searchQuery || serviceFilter !== 'ALL' || therapistFilter !== 'ALL' || activeTab !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setServiceFilter('ALL');
                  setTherapistFilter('ALL');
                  setActiveTab('ALL');
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 bg-indigo-500/10 rounded-lg cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MAIN ASESMEN TABLE (TAMPILAN MODEL REGISTRASI) */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b-2 border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5 whitespace-nowrap">Nomor Registrasi</th>
                <th className="px-4 py-3.5 min-w-[210px]">Waktu & Jadwal Asesmen</th>
                <th className="px-4 py-3.5 min-w-[180px]">Nama Siswa Asesmen</th>
                <th className="px-4 py-3.5 min-w-[160px]">Orang Tua / Kontak</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5 min-w-[200px]">Keluhan / Diagnosis</th>
                <th className="px-4 py-3.5 min-w-[230px]">Tim Ditugaskan (3 Terapis & 1 Psikolog)</th>
                <th className="px-3.5 py-3.5 text-center">Berkas</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderDown className="w-10 h-10 text-slate-600 mb-1" />
                      <p className="text-sm font-bold text-slate-300">
                        Tidak ada siswa asesmen pada kategori ini.
                      </p>
                      <p className="text-xs text-slate-500">
                        Data calon klien dari formulir Registrasi otomatis tersinkron dan tampil di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const statusConf = ASSESSMENT_STATUS_CONFIG[student.status] || ASSESSMENT_STATUS_CONFIG['Menunggu Assessment'];
                  const sched = formatAssessmentSchedule(student.assessmentDate, student.assessmentTime, student.assessmentRoom);
                  const docCount = student.documents?.length || 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* 1. Nomor Registrasi */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-indigo-400">
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="hover:underline flex items-center gap-1 group text-left cursor-pointer"
                          title="Klik untuk lihat detail lengkap siswa asesmen"
                        >
                          <span>{student.registrationNumber}</span>
                        </button>
                      </td>

                      {/* 2. WAKTU & JADWAL ASESMEN (PROMINEN, JELAS & MUDAH DIBACA) */}
                      <td className="px-4 py-3.5">
                        {sched.isScheduled ? (
                          <div className="space-y-1.5">
                            {/* Hari & Tanggal */}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="font-extrabold text-white text-xs whitespace-nowrap">
                                {sched.dayName}, {sched.formattedDate}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ml-1 ${sched.relativeBg}`}>
                                {sched.relativeLabel}
                              </span>
                            </div>

                            {/* Waktu Jam Sesi Prominen */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-black shadow-xs">
                              <Clock className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
                              <span className="tabular-nums font-mono text-xs">{sched.timeText}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({sched.durationText})</span>
                            </div>

                            {/* Ruangan */}
                            <div className="flex items-center gap-1 text-[10.5px] text-amber-300 font-semibold truncate max-w-[200px]">
                              <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{sched.roomText}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10.5px] font-bold">
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                              <span>Belum Terjadwal</span>
                            </span>
                            <button
                              onClick={() => handleOpenTeamModal(student)}
                              className="text-[10.5px] text-indigo-400 hover:text-indigo-300 font-bold block underline cursor-pointer"
                            >
                              {canEdit ? '+ Tentukan Waktu' : '👁️ Rincian Jadwal'}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 3. Nama Siswa Asesmen */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            {student.photoUrl ? (
                              <img 
                                src={student.photoUrl} 
                                alt={student.childName} 
                                className="w-8 h-8 rounded-xl object-cover border border-slate-700 shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                                {student.childName.charAt(0)}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[8px] font-black bg-indigo-600 text-white">
                              {student.gender === 'Laki-Laki' ? 'L' : 'P'}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-white block hover:text-indigo-300 cursor-pointer" onClick={() => setSelectedStudentForDetail(student)}>
                              {student.childName}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block">
                              {student.childNickname ? `(${student.childNickname}) • ` : ''}
                              {calculateAge(student.birthDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Orang Tua / Kontak (Identik Model Registrasi) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-200 block text-xs">
                          {student.parentName || student.fatherName || '-'}
                        </span>
                        <div className="mt-1">
                          <button
                            onClick={() => handleOpenWhatsApp(student)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                            title="Klik untuk koordinasi via WhatsApp langsung"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{student.whatsapp}</span>
                          </button>
                        </div>
                      </td>

                      {/* 5. Layanan */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 block text-center max-w-[140px] truncate">
                          {student.selectedService}
                        </span>
                        {student.interestedServices && student.interestedServices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-[140px]">
                            {student.interestedServices.slice(0, 2).map((srv, idx) => (
                              <span key={idx} className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {srv.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 6. Keluhan & Diagnosis */}
                      <td className="px-4 py-3.5">
                        <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed max-w-xs" title={student.mainComplaint}>
                          {student.mainComplaint}
                        </p>
                        {student.diagnosis && (
                          <span className="inline-block mt-1 text-[10px] text-indigo-300 font-semibold truncate max-w-xs">
                            Diag: {student.diagnosis}
                          </span>
                        )}
                      </td>

                      {/* 7. Tim Klinis Ditugaskan (Maks 3 Terapis & 1 Psikolog) */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {/* 3 Terapis */}
                          <div className="space-y-0.5">
                            {student.team.therapist1Name && (
                              <div className="flex items-center gap-1 text-[10.5px]">
                                <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-300">T1</span>
                                <span className="font-semibold text-slate-200 truncate max-w-[170px]">{student.team.therapist1Name}</span>
                              </div>
                            )}
                            {student.team.therapist2Name && (
                              <div className="flex items-center gap-1 text-[10.5px]">
                                <span className="text-[9px] font-bold px-1 rounded bg-teal-500/20 text-teal-300">T2</span>
                                <span className="font-semibold text-slate-200 truncate max-w-[170px]">{student.team.therapist2Name}</span>
                              </div>
                            )}
                            {student.team.therapist3Name && (
                              <div className="flex items-center gap-1 text-[10.5px]">
                                <span className="text-[9px] font-bold px-1 rounded bg-purple-500/20 text-purple-300">T3</span>
                                <span className="font-semibold text-slate-200 truncate max-w-[170px]">{student.team.therapist3Name}</span>
                              </div>
                            )}
                          </div>

                          {/* 1 Psikolog */}
                          <div className="flex items-center gap-1 text-[10.5px] pt-0.5 border-t border-slate-800/80">
                            <span className="text-[9px] font-bold px-1 rounded bg-indigo-500/20 text-indigo-300">🧠 Psy</span>
                            <span className="font-bold text-indigo-200 truncate max-w-[170px]">
                              {student.team.psychologistName || 'Dr. Dian Kusumawardhani'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenTeamModal(student)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold block pt-0.5 hover:underline cursor-pointer"
                          >
                            {canEdit ? '⚙️ Atur Tim & Waktu' : '👁️ Rincian Tim & Jadwal'}
                          </button>
                        </div>
                      </td>

                      {/* 8. Berkas Dokumen (Upload / View) */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenDocsModal(student)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            docCount > 0
                              ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                          title={canEdit ? "Lihat atau Unggah Berkas Dokumen Asesmen" : "Lihat Berkas Dokumen Asesmen"}
                        >
                          <FolderDown className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{docCount} Berkas</span>
                        </button>
                      </td>

                      {/* 9. Status Asesmen Dropdown (Hanya Manajer & Admin yang bisa edit) */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {canEdit ? (
                          <div className="relative inline-block">
                            <select
                              value={student.status}
                              onChange={(e) => handleQuickStatusChange(student, e.target.value as AssessmentStudentStatus)}
                              title="Ubah status asesmen (Izin Manajer/Admin)"
                              className={`px-2.5 py-1 rounded-xl text-[10.5px] font-black border outline-none appearance-none pr-5 cursor-pointer ${statusConf.badgeBg} ${statusConf.textColor} ${statusConf.borderColor}`}
                            >
                              {ALL_ASSESSMENT_STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="bg-slate-900 text-white">
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] opacity-70">
                              ▼
                            </span>
                          </div>
                        ) : (
                          <span 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border ${statusConf.badgeBg} ${statusConf.textColor} ${statusConf.borderColor}`}
                            title="Mode Lihat Saja: Hanya akun Manajer dan Admin yang dapat mengubah status asesmen"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`}></span>
                            <span>{student.status}</span>
                          </span>
                        )}
                      </td>

                      {/* 10. Aksi Buttons (Identik Model Registrasi) */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Detail */}
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all cursor-pointer"
                            title="Lihat Detail Lengkap Siswa Asesmen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. WhatsApp */}
                          <button
                            onClick={() => handleOpenWhatsApp(student)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                            title="Hubungi Orang Tua via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* 3. Atur Tim & Waktu Jadwal */}
                          <button
                            onClick={() => handleOpenTeamModal(student)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all cursor-pointer"
                            title={canEdit ? "Atur Waktu Jadwal & Penugasan Tim (3 Terapis & 1 Psikolog)" : "Lihat Waktu Jadwal & Tim Pemeriksa"}
                          >
                            <CalendarRange className="w-4 h-4" />
                          </button>

                          {/* 4. Berkas Dokumen */}
                          <button
                            onClick={() => handleOpenDocsModal(student)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white transition-all cursor-pointer"
                            title={canEdit ? "Kelola & Unggah Berkas Dokumen" : "Lihat Berkas Dokumen Asesmen"}
                          >
                            <FolderDown className="w-4 h-4" />
                          </button>

                          {/* 5. Hapus (Hanya Manajer & Admin) */}
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                              title="Hapus Data Siswa Asesmen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PENUGASAN TIM ASESMEN (3 TERAPIS & 1 PSIKOLOG) */}
      {selectedStudentForTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Penugasan Tim Asesmen Klinis</h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudentForTeam.childName} ({selectedStudentForTeam.registrationNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForTeam(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {!canEdit && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Akses Lihat Saja: Hanya akun Manajer dan Admin yang memiliki izin untuk mengubah jadwal asesmen atau penugasan tim.</span>
                </div>
              )}
              
              {/* Info Instruksi */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-indigo-200 text-xs">
                Setiap siswa asesmen dapat ditugaskan <strong>hingga 3 tenaga terapis</strong> (misal Okupasi, Wicara, Fisioterapi) dan <strong>1 tenaga psikolog/assessor klinis</strong> untuk pemeriksaan komprehensif.
              </div>

              {/* TIM 3 TERAPIS */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  Tenaga Terapis yang Ditugaskan (Maksimal 3 Terapis)
                </h4>

                {/* Terapis 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Terapis 1 (Utama)
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist1Id}
                      onChange={e => setTeamForm({ ...teamForm, therapist1Id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Pilih Terapis 1 --</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Kategori / Bidang Terapi 1
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist1Type}
                      onChange={e => setTeamForm({ ...teamForm, therapist1Type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="Terapi Okupasi (OT)">Terapi Okupasi (OT)</option>
                      <option value="Terapi Wicara (TW)">Terapi Wicara (TW)</option>
                      <option value="Fisioterapi (FT)">Fisioterapi (FT)</option>
                      <option value="Sensori Integrasi (SI)">Sensori Integrasi (SI)</option>
                      <option value="Remedial Terapi">Remedial Terapi</option>
                    </select>
                  </div>
                </div>

                {/* Terapis 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Terapis 2
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist2Id}
                      onChange={e => setTeamForm({ ...teamForm, therapist2Id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Pilih Terapis 2 (Opsional) --</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Kategori / Bidang Terapi 2
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist2Type}
                      onChange={e => setTeamForm({ ...teamForm, therapist2Type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="Terapi Wicara (TW)">Terapi Wicara (TW)</option>
                      <option value="Terapi Okupasi (OT)">Terapi Okupasi (OT)</option>
                      <option value="Fisioterapi (FT)">Fisioterapi (FT)</option>
                      <option value="Sensori Integrasi (SI)">Sensori Integrasi (SI)</option>
                      <option value="Remedial Terapi">Remedial Terapi</option>
                    </select>
                  </div>
                </div>

                {/* Terapis 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Terapis 3
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist3Id}
                      onChange={e => setTeamForm({ ...teamForm, therapist3Id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Pilih Terapis 3 (Opsional) --</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Kategori / Bidang Terapi 3
                    </label>
                    <select
                      disabled={!canEdit}
                      value={teamForm.therapist3Type}
                      onChange={e => setTeamForm({ ...teamForm, therapist3Type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="Fisioterapi (FT)">Fisioterapi (FT)</option>
                      <option value="Sensori Integrasi (SI)">Sensori Integrasi (SI)</option>
                      <option value="Remedial Terapi">Remedial Terapi</option>
                      <option value="Terapi Okupasi (OT)">Terapi Okupasi (OT)</option>
                      <option value="Terapi Wicara (TW)">Terapi Wicara (TW)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 1 PSIKOLOG / ASSESSOR KLINIS */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Tenaga Psikolog / Assessor Penilai (1 Psikolog)
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Pilih Psikolog / Dokter Assessor
                  </label>
                  <select
                    disabled={!canEdit}
                    value={teamForm.psychologistId}
                    onChange={e => setTeamForm({ ...teamForm, psychologistId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {AVAILABLE_PSYCHOLOGISTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} • {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* JADWAL & RUANGAN ASESMEN (MUDAH DIATUR & DIBACA) */}
              <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Waktu & Ruangan Pelaksanaan Asesmen
                  </h4>
                  <span className="text-[10px] text-slate-400">Mudah dibaca & otomatis diformat</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Tanggal Pemeriksaan *
                    </label>
                    <input
                      type="date"
                      disabled={!canEdit}
                      value={teamForm.assessmentDate}
                      onChange={e => setTeamForm({ ...teamForm, assessmentDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                    {teamForm.assessmentDate && (
                      <p className="text-[10px] text-emerald-400 font-bold mt-1 truncate">
                        {new Date(teamForm.assessmentDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Waktu / Jam Sesi *
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={teamForm.assessmentTime}
                      onChange={e => setTeamForm({ ...teamForm, assessmentTime: e.target.value })}
                      placeholder="e.g. 09:00 - 11:30 WIB"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold text-emerald-300 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Ruangan Pemeriksaan *
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={teamForm.assessmentRoom}
                      onChange={e => setTeamForm({ ...teamForm, assessmentRoom: e.target.value })}
                      placeholder="e.g. Ruang Sensori 1"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-semibold text-amber-300 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Pilihan Cepat Waktu Presets (Hanya untuk Admin/Manajer) */}
                {canEdit && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Pilihan Cepat Jam Sesi Asesmen:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ASSESSMENT_TIME_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTeamForm({ ...teamForm, assessmentTime: p.value })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            teamForm.assessmentTime === p.value
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pilihan Cepat Ruangan Presets (Hanya untuk Admin/Manajer) */}
                {canEdit && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Pilihan Cepat Ruangan:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ASSESSMENT_ROOM_PRESETS.map((rm, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTeamForm({ ...teamForm, assessmentRoom: rm })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            teamForm.assessmentRoom === rm
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {rm}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Catatan Instruksi Khusus untuk Tim Terapis & Psikolog
                  </label>
                  <textarea
                    rows={2}
                    disabled={!canEdit}
                    value={teamForm.assessmentNotes}
                    onChange={e => setTeamForm({ ...teamForm, assessmentNotes: e.target.value })}
                    placeholder="Catatan kebutuhan stimulus, instrumen evaluasi, atau perhatian khusus saat observasi anak..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Status Asesmen
                  </label>
                  <select
                    disabled={!canEdit}
                    value={teamForm.status}
                    onChange={e => setTeamForm({ ...teamForm, status: e.target.value as AssessmentStudentStatus })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-indigo-500 font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Menunggu Assessment">Menunggu Assessment</option>
                    <option value="Assessment Terjadwal">Assessment Terjadwal</option>
                    <option value="Sedang Proses">Sedang Proses</option>
                    <option value="Assessment Selesai">Assessment Selesai</option>
                    <option value="Menjadi Klien Aktif">Menjadi Klien Aktif</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              {canEdit ? (
                <>
                  <button
                    onClick={() => setSelectedStudentForTeam(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveTeamModal}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Penugasan Tim</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedStudentForTeam(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup (Mode Lihat Saja)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: BERKAS DOKUMEN ASESMEN (UPLOAD & LIHAT BERKAS) */}
      {selectedStudentForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Berkas Dokumen Asesmen Siswa</h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudentForDocs.childName} • {selectedStudentForDocs.registrationNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDocs(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigasi Tab: Berkas Tersedia vs Upload Berkas Baru */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDocsTab('list')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDocsTab === 'list'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Berkas Tersedia ({selectedStudentForDocs.documents?.length || 0})</span>
                </button>

                {canEdit && (
                  <button
                    onClick={() => setActiveDocsTab('upload')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeDocsTab === 'upload'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Upload Berkas Baru</span>
                  </button>
                )}
              </div>

              {!canEdit && (
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mode Baca (Hanya Manajer & Admin yang dapat upload/hapus)</span>
                </span>
              )}
            </div>

            {/* KONTEN TAB 1: DAFTAR BERKAS TERSEDIA */}
            {activeDocsTab === 'list' && (
              <div className="space-y-3">
                {(!selectedStudentForDocs.documents || selectedStudentForDocs.documents.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-300">Belum ada berkas yang diunggah</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Klik tab "Upload Berkas Baru" untuk mengunggah surat rujukan dokter atau hasil observasi.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedStudentForDocs.documents.map(doc => {
                      const isPdf = doc.fileType === 'pdf';
                      const isImg = doc.fileType === 'image';

                      return (
                        <div
                          key={doc.id}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPdf ? 'bg-rose-500/20 text-rose-400' : isImg ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                                {doc.category}
                              </span>
                              <h4 className="text-xs font-bold text-white mt-1 truncate" title={doc.title}>
                                {doc.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                                {doc.fileName} • {doc.fileSize}
                              </p>
                              <div className="text-[10px] text-slate-500 mt-1">
                                Oleh: <strong className="text-slate-300">{doc.uploadedBy}</strong> ({doc.uploadedAt})
                              </div>
                            </div>
                          </div>

                          {doc.notes && (
                            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 italic">
                              "{doc.notes}"
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => setSelectedDocForPreview({ doc, student: selectedStudentForDocs })}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Berkas</span>
                            </button>

                            {canEdit && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* KONTEN TAB 2: UPLOAD BERKAS BARU */}
            {activeDocsTab === 'upload' && (
              <form onSubmit={handleUploadDocumentSubmit} className="space-y-4">
                
                {/* File Dropzone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-indigo-950/10 transition-all space-y-2"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {uploadDocForm.fileName ? `Berkas terpilih: ${uploadDocForm.fileName}` : 'Klik untuk memilih berkas atau seret berkas ke sini'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Mendukung format PDF, Word (DOCX), atau Foto JPG/PNG (Maks 10MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Judul / Nama Dokumen *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadDocForm.title}
                      onChange={e => setUploadDocForm({ ...uploadDocForm, title: e.target.value })}
                      placeholder="e.g. Surat Rujukan Dokter Sp.A atau Hasil Tes"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Kategori Berkas
                    </label>
                    <select
                      value={uploadDocForm.category}
                      onChange={e => setUploadDocForm({ ...uploadDocForm, category: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="Rujukan Dokter">Rujukan Dokter</option>
                      <option value="Hasil Observasi Awal">Hasil Observasi Awal</option>
                      <option value="Formulir Pendaftaran">Formulir Pendaftaran</option>
                      <option value="Dokumen Identitas">Dokumen Identitas (KK / Akta)</option>
                      <option value="Laporan Psikologis">Laporan Psikologis</option>
                      <option value="Catatan Klinis Terapis">Catatan Klinis Terapis</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Catatan / Keterangan Tambahan untuk Tim Terapis
                    </label>
                    <textarea
                      rows={2}
                      value={uploadDocForm.notes}
                      onChange={e => setUploadDocForm({ ...uploadDocForm, notes: e.target.value })}
                      placeholder="Tuliskan catatan penting mengenai hasil pemeriksaan atau diagnosa yang ada di berkas ini..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveDocsTab('list')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Berkas Sekarang</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: PRATINJAU DOKUMEN KLINIS (DOCUMENT VIEWER) */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedDocForPreview.doc.title}</h3>
                  <p className="text-xs text-slate-400">
                    Siswa: {selectedDocForPreview.student.childName} ({selectedDocForPreview.student.registrationNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Digital Reader View */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner space-y-4 font-sans text-xs">
              {/* Header Surat Resmi */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h2 className="text-sm font-black uppercase text-indigo-950">Pelangi Lazuardi</h2>
                    <p className="text-[10px] text-slate-600">Pusat Layanan Terapi & Asesmen Tumbuh Kembang Terpadu</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <p className="font-bold text-slate-800">{selectedDocForPreview.student.registrationNumber}</p>
                  <p>{selectedDocForPreview.doc.uploadedAt}</p>
                </div>
              </div>

              {/* Rincian Berkas */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Kategori Berkas:</span>
                  <strong className="text-indigo-900">{selectedDocForPreview.doc.category}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nama File Asli:</span>
                  <strong className="text-slate-800 font-mono text-[10px]">{selectedDocForPreview.doc.fileName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Pengunggah Berkas:</span>
                  <strong className="text-slate-800">{selectedDocForPreview.doc.uploadedBy}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Ukuran File:</span>
                  <strong className="text-slate-800">{selectedDocForPreview.doc.fileSize}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px]">
                  <span className="text-slate-500">Jadwal & Waktu Asesmen:</span>
                  <strong className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    {selectedDocForPreview.student.assessmentDate 
                      ? `${selectedDocForPreview.student.assessmentDate} • ${selectedDocForPreview.student.assessmentTime || '09:00 - 11:30 WIB'} (${selectedDocForPreview.student.assessmentRoom || 'Ruang Asesmen'})` 
                      : 'Waktu Belum Ditentukan'}
                  </strong>
                </div>
              </div>

              {/* Image Preview if available */}
              {selectedDocForPreview.doc.fileUrl && selectedDocForPreview.doc.fileType === 'image' && (
                <div className="rounded-xl overflow-hidden border border-slate-300">
                  <img 
                    src={selectedDocForPreview.doc.fileUrl} 
                    alt="Preview" 
                    className="w-full max-h-72 object-contain bg-slate-100"
                  />
                </div>
              )}

              {/* Preview Content Text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Catatan Klinis & Ringkasan Pemeriksaan:
                </h4>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {selectedDocForPreview.doc.notes || 
                    `Dokumen ini merupakan arsip resmi pemeriksaan awal untuk ananda ${selectedDocForPreview.student.childName}. Tim terapis yang ditugaskan dapat menggunakan dokumen ini sebagai acuan penyusunan instrumen evaluasi dan kurikulum intervensi.`}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-200">
                Terverifikasi oleh Tim Asesmen Klinis Pelangi Lazuardi • Siap ditinjau oleh Terapis & Psikolog
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Format: <strong className="text-white uppercase">{selectedDocForPreview.doc.fileType}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => {
                    showToast(`Berkas "${selectedDocForPreview.doc.fileName}" berhasil diunduh.`);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL LENGKAP SISWA ASESMEN (MODEL TAB REGISTRASI) */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                  {selectedStudentForDetail.childName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-bold">
                      {selectedStudentForDetail.registrationNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${ASSESSMENT_STATUS_CONFIG[selectedStudentForDetail.status].badgeBg} ${ASSESSMENT_STATUS_CONFIG[selectedStudentForDetail.status].textColor} ${ASSESSMENT_STATUS_CONFIG[selectedStudentForDetail.status].borderColor}`}>
                      {selectedStudentForDetail.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedStudentForDetail.childName}</h3>
                  <p className="text-xs text-slate-400">
                    Layanan: <strong className="text-slate-200">{selectedStudentForDetail.selectedService}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWhatsApp(selectedStudentForDetail)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Detail Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveDetailTab('identitas')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'identitas' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Data Siswa
              </button>
              <button
                onClick={() => setActiveDetailTab('ortu')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'ortu' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Orang Tua & Kontak
              </button>
              <button
                onClick={() => setActiveDetailTab('jadwal')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'jadwal' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                3. Waktu & Jadwal Asesmen
              </button>
              <button
                onClick={() => setActiveDetailTab('tim')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'tim' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                4. Tim Klinis Ditugaskan
              </button>
              <button
                onClick={() => setActiveDetailTab('berkas')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDetailTab === 'berkas' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span>5. Berkas Dokumen</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300">
                  {selectedStudentForDetail.documents?.length || 0}
                </span>
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
              {activeDetailTab === 'identitas' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Lengkap Siswa</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedStudentForDetail.childName}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Panggilan</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedStudentForDetail.childNickname || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Tanggal Lahir & Usia</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {selectedStudentForDetail.birthDate} ({calculateAge(selectedStudentForDetail.birthDate)})
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Jenis Kelamin</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedStudentForDetail.gender}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Keluhan Utama / Alasan Asesmen</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">{selectedStudentForDetail.mainComplaint}</p>
                  </div>
                  {selectedStudentForDetail.diagnosis && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Diagnosis Awal / Catatan Klinis</span>
                      <p className="text-indigo-300 font-bold mt-1">{selectedStudentForDetail.diagnosis}</p>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'ortu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Orang Tua / Wali</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedStudentForDetail.parentName}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nomor WhatsApp</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block font-mono">{selectedStudentForDetail.whatsapp}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Alamat Domisili</span>
                    <span className="text-slate-300 block mt-0.5">{selectedStudentForDetail.address || 'Alamat belum diinput'}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'jadwal' && (
                <div className="space-y-4">
                  {(() => {
                    const sched = formatAssessmentSchedule(selectedStudentForDetail.assessmentDate, selectedStudentForDetail.assessmentTime, selectedStudentForDetail.assessmentRoom);
                    return (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            Status Penjadwalan Asesmen
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${sched.relativeBg}`}>
                            {sched.relativeLabel}
                          </span>
                        </div>
                        {sched.isScheduled ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[11px]">Hari & Tanggal</span>
                              <span className="font-bold text-white text-xs block mt-0.5">{sched.dayName}, {sched.formattedDate}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[11px]">Jam & Durasi</span>
                              <span className="font-bold text-emerald-400 text-xs block mt-0.5 font-mono">{sched.timeText}</span>
                              <span className="text-[10px] text-slate-400">({sched.durationText})</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[11px]">Ruangan</span>
                              <span className="font-bold text-amber-300 text-xs block mt-0.5">{sched.roomText}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-amber-400 font-semibold">Waktu asesmen belum ditentukan untuk siswa ini.</p>
                        )}
                        <button
                          onClick={() => {
                            setSelectedStudentForTeam(selectedStudentForDetail);
                            setSelectedStudentForDetail(null);
                          }}
                          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <CalendarRange className="w-3.5 h-3.5" />
                          <span>Ubah Waktu & Ruangan Asesmen</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeDetailTab === 'tim' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-400" />
                      Tim Penugasan Terapi (Maks 3 Terapis)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Terapis 1</span>
                        <span className="font-bold text-emerald-300 text-xs block mt-0.5">
                          {selectedStudentForDetail.team.therapist1Name || 'Belum Ditugaskan'}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedStudentForDetail.team.therapist1Type || '-'}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Terapis 2</span>
                        <span className="font-bold text-teal-300 text-xs block mt-0.5">
                          {selectedStudentForDetail.team.therapist2Name || 'Belum Ditugaskan'}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedStudentForDetail.team.therapist2Type || '-'}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Terapis 3</span>
                        <span className="font-bold text-purple-300 text-xs block mt-0.5">
                          {selectedStudentForDetail.team.therapist3Name || 'Belum Ditugaskan'}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedStudentForDetail.team.therapist3Type || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/30">
                    <span className="text-indigo-400 block text-[10px] uppercase font-bold">Psikolog / Dokter Assessor</span>
                    <span className="font-bold text-white text-xs block mt-0.5">
                      {selectedStudentForDetail.team.psychologistName || 'Dr. Dian Kusumawardhani, Sp.KFR'}
                    </span>
                    <span className="text-[10px] text-indigo-300">{selectedStudentForDetail.team.psychologistTitle || 'Dokter Spesialis & Assessor'}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'berkas' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Daftar Berkas Terunggah:</span>
                    {canEdit && (
                      <button
                        onClick={() => {
                          handleOpenDocsModal(selectedStudentForDetail);
                          setSelectedStudentForDetail(null);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>+ Upload Berkas Baru</span>
                      </button>
                    )}
                  </div>
                  {(!selectedStudentForDetail.documents || selectedStudentForDetail.documents.length === 0) ? (
                    <p className="text-slate-400 italic py-4">Belum ada berkas dokumen yang diunggah.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedStudentForDetail.documents.map(d => (
                        <div key={d.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white text-xs block truncate">{d.title}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{d.fileName} • {d.fileSize}</span>
                          </div>
                          <button
                            onClick={() => setSelectedDocForPreview({ doc: d, student: selectedStudentForDetail })}
                            className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-950/80">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Tambah Siswa Asesmen Baru</h3>
                  <p className="text-xs text-slate-400">Pendaftaran langsung untuk pemeriksaan asesmen</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.childName}
                    onChange={e => setNewStudentForm({ ...newStudentForm, childName: e.target.value })}
                    placeholder="e.g. Kenzo Rafasya Al-Fatih"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.childNickname}
                    onChange={e => setNewStudentForm({ ...newStudentForm, childNickname: e.target.value })}
                    placeholder="e.g. Kenzo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={newStudentForm.birthDate}
                    onChange={e => setNewStudentForm({ ...newStudentForm, birthDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={newStudentForm.gender}
                    onChange={e => setNewStudentForm({ ...newStudentForm, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.parentName}
                    onChange={e => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                    placeholder="e.g. Budi Santoso & Rina"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    No. WhatsApp Orang Tua
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.whatsapp}
                    onChange={e => setNewStudentForm({ ...newStudentForm, whatsapp: e.target.value })}
                    placeholder="e.g. 081234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Keluhan Utama / Alasan Asesmen
                  </label>
                  <textarea
                    rows={2}
                    value={newStudentForm.mainComplaint}
                    onChange={e => setNewStudentForm({ ...newStudentForm, mainComplaint: e.target.value })}
                    placeholder="Deskripsi keterlambatan atau kondisi yang memerlukan pemeriksaan..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Daftarkan Siswa Asesmen</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AssessmentPage;
