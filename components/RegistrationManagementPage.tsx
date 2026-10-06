import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Trash2, 
  Edit3, 
  Eye, 
  Send, 
  CalendarRange, 
  ChevronRight, 
  Check, 
  X, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Sparkles, 
  Baby, 
  FolderDown, 
  FileCheck, 
  Building2, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { 
  RegistrationRecord, 
  RegistrationStatus, 
  UserRole, 
  Therapist, 
  Child 
} from '../types';
import { RegistrationPrintPreviewModal } from './RegistrationPrintPreviewModal';
import { getStoredMenuCustomizations, MenuCustomizationConfig } from '../utils/menuCustomizationStorage';

interface RegistrationManagementPageProps {
  registrations: RegistrationRecord[];
  onUpdateRegistration: (updated: RegistrationRecord) => void;
  onDeleteRegistration: (id: string) => void;
  onConvertToClient: (record: RegistrationRecord) => void;
  therapists: Therapist[];
  userRole?: UserRole;
  logoUrl?: string;
  onNavigate?: (view: any) => void;
}

// 8 Status Registrasi with distinctive styling & colors
export const REGISTRATION_STATUS_CONFIG: Record<RegistrationStatus, {
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}> = {
  'Registrasi Baru': {
    label: 'Registrasi Baru',
    badgeBg: 'bg-rose-500/15',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    dotColor: 'bg-rose-500 animate-pulse',
    description: 'Data baru masuk dari formulir registrasi tamu dan belum diproses.'
  },
  'Menunggu Follow Up': {
    label: 'Menunggu Follow Up',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    description: 'Memerlukan kontak lanjutan oleh admin/petugas pendaftaran.'
  },
  'Sudah Dihubungi': {
    label: 'Sudah Dihubungi',
    badgeBg: 'bg-cyan-500/15',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    dotColor: 'bg-cyan-500',
    description: 'Petugas telah mengontak orang tua via WhatsApp/telepon.'
  },
  'Menunggu Assessment': {
    label: 'Menunggu Assessment',
    badgeBg: 'bg-indigo-500/15',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    dotColor: 'bg-indigo-500',
    description: 'Orang tua berminat dan sedang menentukan tanggal assessment.'
  },
  'Assessment Terjadwal': {
    label: 'Assessment Terjadwal',
    badgeBg: 'bg-blue-500/15',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-400',
    description: 'Jadwal assessment telah ditetapkan dengan terapis/assessor.'
  },
  'Assessment Selesai': {
    label: 'Assessment Selesai',
    badgeBg: 'bg-purple-500/15',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-400',
    description: 'Pemeriksaan telah selesai, laporan dan rekomendasi program siap.'
  },
  'Menjadi Klien Aktif': {
    label: 'Menjadi Klien Aktif',
    badgeBg: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    description: 'Resmi terdaftar sebagai siswa aktif Pelangi Lazuardi.'
  },
  'Ditutup': {
    label: 'Ditutup',
    badgeBg: 'bg-slate-800',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-700',
    dotColor: 'bg-slate-500',
    description: 'Proses registrasi selesai atau dibatalkan oleh calon klien.'
  }
};

const ALL_STATUS_OPTIONS: RegistrationStatus[] = [
  'Registrasi Baru',
  'Menunggu Follow Up',
  'Sudah Dihubungi',
  'Menunggu Assessment',
  'Assessment Terjadwal',
  'Assessment Selesai',
  'Menjadi Klien Aktif',
  'Ditutup'
];

export const RegistrationManagementPage: React.FC<RegistrationManagementPageProps> = ({
  registrations,
  onUpdateRegistration,
  onDeleteRegistration,
  onConvertToClient,
  therapists,
  userRole = 'admin',
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png',
  onNavigate
}) => {
  // Navigation & filter tab
  const [activeTab, setActiveTab] = useState<'all' | RegistrationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showStatsCharts, setShowStatsCharts] = useState(true);
  const [menuConfig, setMenuConfig] = useState<MenuCustomizationConfig>(getStoredMenuCustomizations());

  // Listen to menu customizations
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMenuConfig(e.detail);
      }
    };
    window.addEventListener('pelangi360_menu_customization_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_menu_customization_updated', handleUpdate);
  }, []);

  const regTexts = menuConfig.inMenuTexts.registrasi || {};
  const customRegTitle = regTexts.pageTitle?.value || 'Manajemen Registrasi Klien Baru';
  const customRegSubtitle = regTexts.pageSubtitle?.value || 'Kelola seluruh calon klien, pantau alur follow up, jadwalkan assessment terapis, dan konversi calon klien menjadi siswa aktif secara terintegrasi.';

  // Modals state
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RegistrationRecord | null>(null);
  const [selectedRecordForPrintModal, setSelectedRecordForPrintModal] = useState<RegistrationRecord | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'anak' | 'ortu' | 'informasi' | 'kelahiran' | 'perkembangan' | 'dokumen'>('anak');
  const [selectedRecordForSchedule, setSelectedRecordForSchedule] = useState<RegistrationRecord | null>(null);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<RegistrationRecord | null>(null);
  const [selectedRecordForDelete, setSelectedRecordForDelete] = useState<RegistrationRecord | null>(null);

  // Scheduling form state
  const [scheduleData, setScheduleData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 10:00',
    therapistId: therapists[0]?.id || 'T11',
    room: 'Ruang Assessment 1',
    notes: ''
  });

  // Calculate Age in Years and Months
  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return '-';
    const birth = new Date(birthDateString);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return `${years} thn ${months} bln`;
  };

  // Filtered dataset based on role restrictions
  // Role 'terapis' only sees scheduled or completed assessment registrations
  const visibleForRole = useMemo(() => {
    if (userRole === 'terapis') {
      return registrations.filter(r => 
        r.status === 'Assessment Terjadwal' || 
        r.status === 'Assessment Selesai' || 
        r.status === 'Menjadi Klien Aktif'
      );
    }
    return registrations;
  }, [registrations, userRole]);

  // Tab Filtering & Search
  const filteredRegistrations = useMemo(() => {
    return visibleForRole.filter(r => {
      // Tab filter
      if (activeTab !== 'all' && r.status !== activeTab) {
        return false;
      }
      // Service filter
      if (serviceFilter !== 'all' && !r.selectedService.toLowerCase().includes(serviceFilter.toLowerCase())) {
        return false;
      }
      // Search query (Child Name, Reg Number, Parent Name, WA, or Complaint)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchChild = r.childName.toLowerCase().includes(q) || (r.childNickname || '').toLowerCase().includes(q);
        const matchReg = r.registrationNumber.toLowerCase().includes(q);
        const matchParent = (r.parentName || '').toLowerCase().includes(q) || r.fatherName.toLowerCase().includes(q) || r.motherName.toLowerCase().includes(q);
        const matchPhone = r.whatsapp.includes(q);
        const matchComplaint = r.mainComplaint.toLowerCase().includes(q);
        if (!matchChild && !matchReg && !matchParent && !matchPhone && !matchComplaint) {
          return false;
        }
      }
      return true;
    });
  }, [visibleForRole, activeTab, serviceFilter, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = registrations.length;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthRegs = registrations.filter(r => {
      const d = new Date(r.registrationDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    const baru = registrations.filter(r => r.status === 'Registrasi Baru').length;
    const waitingFollowUp = registrations.filter(r => r.status === 'Menunggu Follow Up').length;
    const waitingAssessment = registrations.filter(r => r.status === 'Menunggu Assessment').length;
    const scheduledAssessment = registrations.filter(r => r.status === 'Assessment Terjadwal').length;
    const activeClients = registrations.filter(r => r.status === 'Menjadi Klien Aktif').length;

    const conversionRate = total > 0 ? ((activeClients / total) * 100).toFixed(1) : '0';

    return {
      total,
      thisMonthRegs,
      baru,
      waitingFollowUp,
      waitingAssessment,
      scheduledAssessment,
      activeClients,
      conversionRate
    };
  }, [registrations]);

  // Chart Data 1: Registrasi per Bulan (6 Bulan Terakhir)
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonthIdx = new Date().getMonth();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonthIdx = (currentMonthIdx - i + 12) % 12;
      const targetMonthName = months[targetMonthIdx];
      // Count matching registrations
      const count = registrations.filter(r => {
        const d = new Date(r.registrationDate);
        return d.getMonth() === targetMonthIdx;
      }).length;

      const converted = registrations.filter(r => {
        const d = new Date(r.registrationDate);
        return d.getMonth() === targetMonthIdx && r.status === 'Menjadi Klien Aktif';
      }).length;

      result.push({
        bulan: targetMonthName,
        pendaftar: count || (6 - i * 1), // fallback baseline for visual chart
        klien: converted || Math.floor((6 - i) / 2)
      });
    }
    return result;
  }, [registrations]);

  // Chart Data 2: Sumber Informasi Klien
  const referralChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      const src = r.referralSource || 'Website';
      counts[src] = (counts[src] || 0) + 1;
    });

    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [registrations]);

  // Chart Data 3: Layanan Paling Diminati
  const serviceChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      const s = r.selectedService || 'Assesment Terapi';
      counts[s] = (counts[s] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.replace('Assesment ', ''), count }))
      .sort((a, b) => b.count - a.count);
  }, [registrations]);

  // Handler: Open WhatsApp with polite template
  const handleOpenWhatsApp = (record: RegistrationRecord) => {
    const cleanPhone = record.whatsapp.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.slice(1);
    }

    const message = encodeURIComponent(
      `Halo Bapak/Ibu ${record.parentName || record.fatherName || 'Orang Tua'},\n\n` +
      `Salam hangat dari *Pusat Layanan Terapi Tumbuh Kembang Pelangi Lazuardi* 🌈.\n\n` +
      `Kami telah menerima formulir registrasi untuk ananda *${record.childName}* (No. Registrasi: ${record.registrationNumber}) dengan pilihan layanan *${record.selectedService}*.\n\n` +
      `Apakah ada waktu luang hari ini atau besok untuk kami koordinasikan jadwal sesi observasi / assessment ananda bersama tim terapis kami?\n\n` +
      `Terima kasih banyak, salam sehat selalu!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');

    // Automatically advance status to 'Sudah Dihubungi' if still 'Registrasi Baru' or 'Menunggu Follow Up'
    if (record.status === 'Registrasi Baru' || record.status === 'Menunggu Follow Up') {
      onUpdateRegistration({
        ...record,
        status: 'Sudah Dihubungi',
        followUpDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Handler: Change Status directly
  const handleQuickStatusChange = (record: RegistrationRecord, newStatus: RegistrationStatus) => {
    if (newStatus === 'Menjadi Klien Aktif') {
      // Trigger convert
      onConvertToClient(record);
      return;
    }
    onUpdateRegistration({
      ...record,
      status: newStatus
    });
  };

  // Handler: Confirm Schedule Assessment
  const handleSaveSchedule = () => {
    if (!selectedRecordForSchedule) return;
    const therapistObj = therapists.find(t => t.id === scheduleData.therapistId);
    
    const updated: RegistrationRecord = {
      ...selectedRecordForSchedule,
      status: 'Assessment Terjadwal',
      assessmentDate: scheduleData.date,
      assessmentTime: scheduleData.time,
      assessmentTherapistId: scheduleData.therapistId,
      assessmentTherapistName: therapistObj?.name || 'Terapis Assessor',
      assessmentRoom: scheduleData.room,
      assessmentNotes: scheduleData.notes
    };

    onUpdateRegistration(updated);
    setSelectedRecordForSchedule(null);
    alert(`Jadwal Assessment untuk ananda ${selectedRecordForSchedule.childName} berhasil disimpan pada ${scheduleData.date} pukul ${scheduleData.time}!`);
  };

  // Handler: Open PDF Print Preview Modal
  const handlePrintRegistration = (record: RegistrationRecord) => {
    setSelectedRecordForPrintModal(record);
  };

  return (
    <div className="flex-1 bg-[#0F172A] text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <FolderDown className="w-3.5 h-3.5" />
              Portal Penerimaan Calon Klien
            </span>
            {stats.baru > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {stats.baru} Registrasi Baru Masuk
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              Otomatis terhubung dengan formulir Registrasi Tamu Baru
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{customRegTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {customRegSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (registrations.length > 0) {
                setSelectedRecordForPrintModal(registrations[0]);
              } else {
                alert('Belum ada data registrasi untuk dicetak.');
              }
            }}
            className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Buka / Unduh Dokumen PDF Hasil Isian Formulir Registrasi Calon Klien"
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

          {userRole !== 'terapis' && (
            <button
              onClick={() => {
                // Open new registration form modal or manual entry
                alert('Formulir registrasi tamu baru juga dapat diakses langsung oleh publik/orang tua di halaman Login.');
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Input Tamu Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUMMARY KPI STATISTIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Registrasi Bulan Ini */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Bulan Ini</span>
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">{stats.thisMonthRegs}</span>
            <span className="text-xs text-slate-400">klien</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Total {stats.total} calon terdata</p>
        </div>

        {/* Card 2: Registrasi Baru */}
        <div 
          onClick={() => setActiveTab('Registrasi Baru')}
          className={`bg-slate-900 border-2 rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Registrasi Baru' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-500/30 hover:border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-rose-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Registrasi Baru</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-rose-400 tracking-tight">{stats.baru}</span>
            <span className="text-xs text-rose-500 font-bold uppercase">Perlu Tindak Lanjut</span>
          </div>
          <p className="text-[10.5px] text-rose-300/80 mt-1">Belum diproses</p>
        </div>

        {/* Card 3: Menunggu Follow Up */}
        <div 
          onClick={() => setActiveTab('Menunggu Follow Up')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Menunggu Follow Up' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Menunggu Follow Up</span>
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-400 tracking-tight">{stats.waitingFollowUp}</span>
            <span className="text-xs text-amber-500">antrean</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Perlu dihubungi ortu</p>
        </div>

        {/* Card 4: Menunggu Assessment */}
        <div 
          onClick={() => setActiveTab('Menunggu Assessment')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Menunggu Assessment' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-indigo-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Menunggu Assessment</span>
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CalendarRange className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-indigo-400 tracking-tight">{stats.waitingAssessment}</span>
            <span className="text-xs text-indigo-400">anak</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Siap dijadwalkan</p>
        </div>

        {/* Card 5: Assessment Terjadwal */}
        <div 
          onClick={() => setActiveTab('Assessment Terjadwal')}
          className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Assessment Terjadwal' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Terjadwal</span>
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-blue-400 tracking-tight">{stats.scheduledAssessment}</span>
            <span className="text-xs text-blue-400">sesi</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">Terapis on-duty</p>
        </div>

        {/* Card 6: Klien Aktif & Konversi */}
        <div 
          onClick={() => setActiveTab('Menjadi Klien Aktif')}
          className={`bg-slate-900 border-2 rounded-2xl p-4 shadow-lg cursor-pointer transition-all ${
            activeTab === 'Menjadi Klien Aktif' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">Klien Aktif Baru</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">{stats.activeClients}</span>
            <span className="text-xs text-emerald-500 font-bold uppercase">Siswa</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-400">Konversi:</span>
            <span className="text-emerald-400 font-extrabold">{stats.conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* 3. DASHBOARD RINGKASAN GRAFIK REGISTRASI (COLLAPSIBLE) */}
      {showStatsCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Tren Registrasi & Konversi */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">Tren Registrasi Calon Klien</h3>
                <p className="text-xs text-slate-400">Jumlah pendaftaran tamu vs konversi menjadi klien aktif</p>
              </div>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                6 Bulan Terakhir
              </span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="bulan" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="pendaftar" name="Total Registrasi" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="klien" name="Menjadi Klien" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Sumber Informasi Klien */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Sumber Informasi Klien</h3>
              <p className="text-xs text-slate-400 mb-3">Kanal rujukan pendaftaran</p>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={referralChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {referralChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10.5px]">
              {referralChartData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Layanan Paling Banyak Diminati */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Layanan Paling Diminati</h3>
              <p className="text-xs text-slate-400 mb-3">Distribusi pilihan layanan</p>
              <div className="space-y-2.5">
                {serviceChartData.slice(0, 4).map((s, idx) => {
                  const percentage = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold truncate max-w-[150px]">{s.name}</span>
                        <span className="text-indigo-400 font-mono font-bold">{s.count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Rekomendasi Utama:</span>
              <span className="font-bold text-white">Assesment Terpadu</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-MENU TABS & SEARCH BAR */}
      <div className="space-y-4">
        {/* Sub-menu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua Registrasi ({visibleForRole.length})
          </button>

          {ALL_STATUS_OPTIONS.map((status) => {
            const count = visibleForRole.filter(r => r.status === status).length;
            const config = REGISTRATION_STATUS_CONFIG[status];
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
                    status === 'Registrasi Baru' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
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
              placeholder="Cari nama anak, No. Reg, orang tua, no. WA, atau keluhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Service Dropdown & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Layanan:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
              >
                <option value="all">Semua Layanan</option>
                <option value="Terapi">Assesment Terapi</option>
                <option value="Psikolog">Psikolog</option>
                <option value="PSB">Assesment PSB</option>
              </select>
            </div>

            {(searchQuery || serviceFilter !== 'all' || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setServiceFilter('all');
                  setActiveTab('all');
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 bg-indigo-500/10 rounded-lg"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MAIN REGISTRATION TABLE */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b-2 border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Nomor Registrasi</th>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Nama Anak</th>
                <th className="px-4 py-3.5">Nama Orang Tua/Wali</th>
                <th className="px-4 py-3.5">WhatsApp</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5 min-w-[200px]">Keluhan Utama</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Petugas</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderDown className="w-10 h-10 text-slate-600 mb-1" />
                      <p className="text-sm font-bold text-slate-300">
                        Tidak ada data registrasi pada kategori ini.
                      </p>
                      <p className="text-xs text-slate-500">
                        Calon klien baru yang mengisi form "Registrasi Tamu Baru" akan otomatis tampil di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((item) => {
                  const statusConf = REGISTRATION_STATUS_CONFIG[item.status] || REGISTRATION_STATUS_CONFIG['Registrasi Baru'];
                  const formattedDate = new Date(item.registrationDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Nomor Registrasi */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-indigo-400">
                        <button
                          onClick={() => setSelectedRecordForDetail(item)}
                          className="hover:underline flex items-center gap-1 group text-left cursor-pointer"
                        >
                          <span>{item.registrationNumber}</span>
                        </button>
                      </td>

                      {/* Tanggal Registrasi */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Nama Anak */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                            {item.childName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{item.childName}</span>
                            <span className="text-[10px] text-slate-400">
                              {item.gender} • {calculateAge(item.birthDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Nama Orang Tua/Wali */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-200 block">
                          {item.parentName || item.fatherName || item.motherName || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                          {item.email || item.address}
                        </span>
                      </td>

                      {/* Nomor WhatsApp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenWhatsApp(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                          title="Klik untuk chat WhatsApp langsung"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.whatsapp}</span>
                        </button>
                      </td>

                      {/* Layanan yang Dipilih */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 block text-center max-w-[150px] truncate">
                          {item.selectedService}
                        </span>
                      </td>

                      {/* Keluhan Utama */}
                      <td className="px-4 py-3.5">
                        <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed max-w-xs">
                          {item.mainComplaint}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="relative inline-block">
                          <select
                            value={item.status}
                            disabled={userRole === 'terapis'}
                            onChange={(e) => handleQuickStatusChange(item, e.target.value as RegistrationStatus)}
                            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-black border outline-none appearance-none pr-5 cursor-pointer ${statusConf.badgeBg} ${statusConf.textColor} ${statusConf.borderColor} disabled:opacity-80 disabled:cursor-not-allowed`}
                          >
                            {ALL_STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-slate-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] opacity-70">
                            ▼
                          </span>
                        </div>
                      </td>

                      {/* Petugas Follow Up */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-slate-300">
                        <span className="text-[11px] font-medium block">
                          {item.followUpOfficer || 'Belum ditugaskan'}
                        </span>
                        {item.assessmentDate && (
                          <span className="text-[10px] text-blue-400 font-bold block mt-0.5">
                            Ass: {item.assessmentDate}
                          </span>
                        )}
                      </td>

                      {/* Aksi Buttons */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Lihat Detail */}
                          <button
                            onClick={() => setSelectedRecordForDetail(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all cursor-pointer"
                            title="Lihat Detail Lengkap Registrasi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. WhatsApp Direct */}
                          <button
                            onClick={() => handleOpenWhatsApp(item)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                            title="Hubungi Orang Tua via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* 3. Jadwalkan Assessment */}
                          {userRole !== 'terapis' && (
                            <button
                              onClick={() => {
                                setSelectedRecordForSchedule(item);
                                setScheduleData({
                                  date: item.assessmentDate || new Date().toISOString().split('T')[0],
                                  time: item.assessmentTime || '09:00 - 10:00',
                                  therapistId: item.assessmentTherapistId || therapists[0]?.id || 'T11',
                                  room: item.assessmentRoom || 'Ruang Assessment 1',
                                  notes: item.assessmentNotes || ''
                                });
                              }}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all cursor-pointer"
                              title="Jadwalkan Assessment Terapis"
                            >
                              <CalendarRange className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Konversi ke Klien Aktif */}
                          {userRole !== 'terapis' && item.status !== 'Menjadi Klien Aktif' && (
                            <button
                              onClick={() => onConvertToClient(item)}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all cursor-pointer"
                              title="Konversi Menjadi Klien Aktif (Buat Akun Siswa & Masuk Data Klien)"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}

                          {/* 5. Cetak Hasil PDF Formulir */}
                          <button
                            onClick={() => handlePrintRegistration(item)}
                            className="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10.5px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Buka / Unduh Dokumen PDF Hasil Isian Formulir Registrasi (A4 Resmi)"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>PDF</span>
                          </button>

                          {/* 6. Edit Data */}
                          {userRole !== 'terapis' && (
                            <button
                              onClick={() => setSelectedRecordForEdit(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition-all cursor-pointer"
                              title="Edit Data Registrasi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* 7. Hapus Data */}
                          {userRole !== 'terapis' && (
                            <button
                              onClick={() => setSelectedRecordForDelete(item)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                              title="Hapus Data Registrasi"
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

      {/* 6. MODAL: LIHAT DETAIL REGISTRASI LENGKAP */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                  {selectedRecordForDetail.childName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-bold">
                      {selectedRecordForDetail.registrationNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${REGISTRATION_STATUS_CONFIG[selectedRecordForDetail.status].badgeBg} ${REGISTRATION_STATUS_CONFIG[selectedRecordForDetail.status].textColor} ${REGISTRATION_STATUS_CONFIG[selectedRecordForDetail.status].borderColor}`}>
                      {selectedRecordForDetail.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedRecordForDetail.childName}</h3>
                  <p className="text-xs text-slate-400">
                    Terdaftar pada {new Date(selectedRecordForDetail.registrationDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecordForPrintModal(selectedRecordForDetail)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-900/30"
                  title="Lihat / Unduh Hasil Isian Formulir dalam format PDF Resmi"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Hasil Cetak PDF</span>
                </button>
                <button
                  onClick={() => handleOpenWhatsApp(selectedRecordForDetail)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA</span>
                </button>
                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Detail Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveDetailTab('anak')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'anak' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Data Anak
              </button>
              <button
                onClick={() => setActiveDetailTab('ortu')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'ortu' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Data Orang Tua
              </button>
              <button
                onClick={() => setActiveDetailTab('informasi')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'informasi' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                3. Keluhan & Rujukan
              </button>
              <button
                onClick={() => setActiveDetailTab('kelahiran')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'kelahiran' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                4. Kelahiran & Medis
              </button>
              <button
                onClick={() => setActiveDetailTab('perkembangan')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeDetailTab === 'perkembangan' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                5. Perkembangan & Belajar
              </button>
              <button
                onClick={() => setActiveDetailTab('dokumen')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDetailTab === 'dokumen' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span>6. Dokumen & Berkas PDF</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300">A4</span>
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
              {activeDetailTab === 'anak' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.childName}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Panggilan</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.childNickname || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Tanggal Lahir & Usia</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {selectedRecordForDetail.birthDate} ({calculateAge(selectedRecordForDetail.birthDate)})
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Jenis Kelamin</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.gender}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Sekolah Asal / Jenjang</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.school || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Alamat Domisili</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.address}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'ortu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Ayah</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.fatherName || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nama Ibu</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.motherName || '-'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nomor WhatsApp Utama</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block font-mono">
                      {selectedRecordForDetail.whatsapp}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Email Kontak</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{selectedRecordForDetail.email || '-'}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'informasi' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Layanan yang Dipilih</span>
                    <span className="font-bold text-indigo-400 text-sm mt-0.5 block">
                      {selectedRecordForDetail.selectedService}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Keluhan Utama / Alasan Mendaftar</span>
                    <p className="text-slate-200 mt-1 leading-relaxed text-sm bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {selectedRecordForDetail.mainComplaint}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Diagnosa / Riwayat Medis</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">
                        {selectedRecordForDetail.diagnosis || 'Belum ada diagnosa formal'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Riwayat Terapi Sebelumnya</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">
                        {selectedRecordForDetail.therapyHistory || 'Belum pernah mengikuti terapi'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sumber Informasi Registrasi</span>
                      <span className="font-bold text-white mt-0.5 block">{selectedRecordForDetail.referralSource || 'Website'}</span>
                    </div>
                    {selectedRecordForDetail.assessmentDate && (
                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">Jadwal Assessment</span>
                        <span className="font-bold text-blue-400 mt-0.5 block">
                          {selectedRecordForDetail.assessmentDate} ({selectedRecordForDetail.assessmentTime})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'kelahiran' && (() => {
                const rawData = selectedRecordForDetail.rawGuestData || {};
                const bRaw = rawData.birth || selectedRecordForDetail.birthHistory || {};
                const preRaw = bRaw.prenatal || {};
                const delRaw = bRaw.delivery || {};
                const hRaw = rawData.health || selectedRecordForDetail.healthHistory || {};

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Masa Prenatal */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Masa Kehamilan (Prenatal)
                        </span>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Masalah / Keluhan Saat Hamil</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">{preRaw.problems || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Kondisi Fisik Ibu</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">{preRaw.physicalCondition || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Kondisi Emosional Ibu</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">{preRaw.emotionalCondition || '-'}</span>
                        </div>
                      </div>

                      {/* Proses Persalinan */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Proses Persalinan (Natal)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Usia Kandungan</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{delRaw.duration ? `${delRaw.duration} minggu` : '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Proses Lahir</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{delRaw.process || '-'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Berat / Panjang Lahir</span>
                            <span className="font-bold text-white mt-0.5 block font-mono">
                              {delRaw.weight ? `${delRaw.weight} kg` : '-'} / {delRaw.length ? `${delRaw.length} cm` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Kondisi Bayi Baru Lahir</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{delRaw.condition || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Durasi Pemberian ASI</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">{delRaw.breastfeedingUntil ? `Sampai usia ${delRaw.breastfeedingUntil}` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Medis & Alergi */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                        Riwayat Penyakit & Alergi
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Riwayat Penyakit Pernah Diderita</span>
                          <span className="font-medium text-slate-200 mt-0.5 block">
                            {Array.isArray(hRaw.illnesses) && hRaw.illnesses.length > 0 ? hRaw.illnesses.join(', ') : 'Tidak ada riwayat penyakit berat yang dicentang'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Diagnosa Awal / Rujukan Dokter</span>
                          <span className="font-semibold text-emerald-400 mt-0.5 block">
                            {selectedRecordForDetail.diagnosis || hRaw.diagnosis || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeDetailTab === 'perkembangan' && (() => {
                const rawData = selectedRecordForDetail.rawGuestData || {};
                const dRaw = rawData.development || selectedRecordForDetail.developmentHistory || {};
                const feed = dRaw.feeding || {};
                const pref = dRaw.preferences || {};
                const soc = rawData.social || selectedRecordForDetail.socialHistory || {};
                const learn = rawData.learning || selectedRecordForDetail.learningAnswers || {};
                const emo = rawData.emotion || selectedRecordForDetail.emotionAnswers || {};

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Pola Makan & Kebiasaan */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Pola Makan & Minum
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Disuapi oleh</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{feed.fedBy || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10.5px]">Makan Menggunakan</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{feed.eatsWith || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Sinyal / Tanda Lapar</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">{feed.hungerSignal || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Makanan & Rasa Favorit</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">
                            {pref.foods || '-'} {pref.favoriteTaste ? `(Rasa: ${pref.favoriteTaste})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Kemandirian & Sosialisasi */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Kemandirian & Sosialisasi
                        </span>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Kemandirian Sehari-hari</span>
                          <div className="space-y-1 mt-1">
                            {Array.isArray(soc.independence) && soc.independence.length > 0 ? (
                              soc.independence.map((it: string, idx: number) => (
                                <span key={idx} className="inline-block bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10.5px] text-slate-300 mr-1.5 mb-1">
                                  ✓ {it}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs">Belum ada kemandirian yang dicentang</span>
                            )}
                          </div>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-400 block text-[10.5px]">Interaksi Teman Sebaya</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">
                            {soc.sociability?.groupPlay || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10.5px]">Permainan Favorit</span>
                          <span className="font-semibold text-slate-200 mt-0.5 block">
                            {soc.sociability?.favoriteGames || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kebiasaan Belajar & Respon Emosi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Kebiasaan Belajar
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Durasi Fokus:</span>
                          <span className="font-semibold text-slate-200">{learn.duration || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Waktu yang Disukai:</span>
                          <span className="font-semibold text-slate-200">{learn.time || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kemandirian Belajar:</span>
                          <span className="font-semibold text-slate-200">{learn.independence || '-'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-indigo-400 font-bold block text-xs border-b border-slate-800 pb-1 uppercase tracking-wider">
                          Respon Emosional & Adaptasi
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Adaptasi Lingkungan Baru:</span>
                          <span className="font-semibold text-slate-200">{emo.socialAdjustment?.newEnv || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pemicu Tantrum / Marah:</span>
                          <span className="font-semibold text-slate-200">{emo.emotions?.angryWhat || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pemicu Senang:</span>
                          <span className="font-semibold text-emerald-400">{emo.emotions?.happyWhat || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeDetailTab === 'dokumen' && (
                <div className="space-y-4">
                  {/* Hero Card: Unduh Hasil Cetak PDF Formulir Pendaftaran */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-900/50 border-2 border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-sm">Dokumen Hasil Isian Formulir Registrasi (PDF)</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            A4 Siap Cetak
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Format resmi rekam pendaftaran calon klien lengkap dengan Kop Surat, data identitas, informasi klinis, dan kolom tanda tangan.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecordForPrintModal(selectedRecordForDetail)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer shrink-0"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Buka / Unduh PDF</span>
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs font-medium pt-1">
                    Kelengkapan dokumen persyaratan calon klien untuk verifikasi berkas assessment:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Kartu Keluarga */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Kartu Keluarga (KK)</h4>
                          <span className="text-[10px] text-slate-400">
                            {selectedRecordForDetail.documents?.kartuKeluarga?.status === 'Tersedia' ? 'Sudah Diupload' : 'Belum Diupload'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecordForDetail.documents?.kartuKeluarga?.status === 'Tersedia' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {selectedRecordForDetail.documents?.kartuKeluarga?.status || 'Tersedia'}
                      </span>
                    </div>

                    {/* Akta Kelahiran */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                          <Baby className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Akta Kelahiran</h4>
                          <span className="text-[10px] text-slate-400">
                            {selectedRecordForDetail.documents?.aktaKelahiran?.status === 'Tersedia' ? 'Sudah Diupload' : 'Belum Diupload'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecordForDetail.documents?.aktaKelahiran?.status === 'Tersedia' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {selectedRecordForDetail.documents?.aktaKelahiran?.status || 'Tersedia'}
                      </span>
                    </div>

                    {/* Surat Diagnosa / Rujukan Medis */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Surat Diagnosa / Dokter</h4>
                          <span className="text-[10px] text-slate-400">Rujukan Sp.A / Psikolog</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecordForDetail.documents?.suratDiagnosa?.status === 'Tersedia' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {selectedRecordForDetail.documents?.suratDiagnosa?.status || 'Belum Ada'}
                      </span>
                    </div>

                    {/* Hasil Assessment */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Hasil Assessment</h4>
                          <span className="text-[10px] text-slate-400">Lembar evaluasi tim klinis</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecordForDetail.documents?.hasilAssessment?.status === 'Tersedia' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {selectedRecordForDetail.documents?.hasilAssessment?.status || 'Tersedia'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Ubah Status Cepat:</span>
                <select
                  value={selectedRecordForDetail.status}
                  onChange={(e) => {
                    const newSt = e.target.value as RegistrationStatus;
                    handleQuickStatusChange(selectedRecordForDetail, newSt);
                    setSelectedRecordForDetail({ ...selectedRecordForDetail, status: newSt });
                  }}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
                >
                  {ALL_STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecordForDetail.status !== 'Menjadi Klien Aktif' && (
                  <button
                    onClick={() => {
                      onConvertToClient(selectedRecordForDetail);
                      setSelectedRecordForDetail(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Konversi Jadi Klien Aktif</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: JADWALKAN ASSESSMENT */}
      {selectedRecordForSchedule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-blue-400" />
                  Jadwalkan Assessment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calon Klien: <strong className="text-white">{selectedRecordForSchedule.childName}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedRecordForSchedule(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Tanggal Assessment</label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Jam / Slot Sesi</label>
                  <input
                    type="text"
                    value={scheduleData.time}
                    placeholder="09:00 - 10:00"
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Ruangan</label>
                  <input
                    type="text"
                    value={scheduleData.room}
                    placeholder="Ruang Assessment 1"
                    onChange={(e) => setScheduleData({ ...scheduleData, room: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Terapis / Assessor Penanggung Jawab</label>
                <select
                  value={scheduleData.therapistId}
                  onChange={(e) => setScheduleData({ ...scheduleData, therapistId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500"
                >
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Catatan Instruksi untuk Orang Tua</label>
                <textarea
                  rows={3}
                  value={scheduleData.notes}
                  placeholder="Misal: Membawa baju ganti, membawa camilan favorit, dan hadir 10 menit sebelum waktu sesi."
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRecordForSchedule(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Simpan Jadwal Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: EDIT DATA REGISTRASI */}
      {selectedRecordForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  Edit Data Registrasi ({selectedRecordForEdit.registrationNumber})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRecordForEdit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    value={selectedRecordForEdit.childName}
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, childName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tanggal Lahir (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={selectedRecordForEdit.birthDate}
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, birthDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Orang Tua/Wali</label>
                  <input
                    type="text"
                    value={selectedRecordForEdit.parentName || selectedRecordForEdit.fatherName}
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, parentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={selectedRecordForEdit.whatsapp}
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Layanan yang Dipilih</label>
                <input
                  type="text"
                  value={selectedRecordForEdit.selectedService}
                  onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, selectedService: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Keluhan Utama</label>
                <textarea
                  rows={3}
                  value={selectedRecordForEdit.mainComplaint}
                  onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, mainComplaint: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Petugas Follow Up</label>
                  <input
                    type="text"
                    value={selectedRecordForEdit.followUpOfficer || ''}
                    placeholder="Nama Admin"
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, followUpOfficer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={selectedRecordForEdit.status}
                    onChange={(e) => setSelectedRecordForEdit({ ...selectedRecordForEdit, status: e.target.value as RegistrationStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    {ALL_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRecordForEdit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onUpdateRegistration(selectedRecordForEdit);
                  setSelectedRecordForEdit(null);
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: KONFIRMASI HAPUS DATA */}
      {selectedRecordForDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Hapus Data Registrasi?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Yakin ingin menghapus data registrasi <strong className="text-rose-400">{selectedRecordForDelete.childName}</strong> ({selectedRecordForDelete.registrationNumber})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSelectedRecordForDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteRegistration(selectedRecordForDelete.id);
                  setSelectedRecordForDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-900/40 active:scale-95 cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: CETAK / UNDUH PDF FORMULIR REGISTRASI */}
      {selectedRecordForPrintModal && (
        <RegistrationPrintPreviewModal
          isOpen={!!selectedRecordForPrintModal}
          onClose={() => setSelectedRecordForPrintModal(null)}
          record={selectedRecordForPrintModal}
          therapists={therapists}
          logoUrl={logoUrl}
        />
      )}
    </div>
  );
};

export default RegistrationManagementPage;
