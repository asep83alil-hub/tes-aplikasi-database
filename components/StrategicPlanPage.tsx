import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  StrategicYearData, 
  StrategicItem, 
  StrategicStatus, 
  StrategicArtifact, 
  UserRole 
} from '../types';
import { 
  STRATEGIC_CATEGORIES, 
  getStoredStrategicPlans, 
  saveStoredStrategicPlans, 
  resetStrategicPlansToDefault 
} from '../utils/strategicStorage';
import { formatCurrency } from './BillingPage';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Target, 
  Award, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Clock3, 
  Hourglass, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  ExternalLink, 
  Download, 
  Eye, 
  Printer, 
  RotateCcw, 
  Search, 
  Filter, 
  Layers, 
  BarChart3, 
  Check, 
  X, 
  Sparkles, 
  Building2, 
  FileCheck, 
  ChevronRight, 
  ShieldCheck, 
  SlidersHorizontal,
  FolderOpen,
  PenTool,
  Settings2
} from 'lucide-react';

export interface StrategicSignerConfig {
  roleTitle: string; // e.g. "Diverifikasi Oleh,"
  departmentTitle: string; // e.g. "Tim Perencana & Penjamin Mutu"
  name: string; // e.g. "Dr. Hj. Lazuardi Utama, M.Pd"
  nip?: string; // e.g. "NIP. 19780512 200501 2 003"
  signatureImage?: string; // Base64
}

export interface StrategicPrintSignatureConfig {
  location: string;
  dateString: string;
  layout: '2-columns' | '3-columns';
  signer1: StrategicSignerConfig;
  signer2: StrategicSignerConfig;
  signer3: StrategicSignerConfig;
}

const DEFAULT_SIGNATURE_CONFIG: StrategicPrintSignatureConfig = {
  location: 'Tangerang Selatan',
  dateString: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  layout: '2-columns',
  signer1: {
    roleTitle: 'Diverifikasi Oleh,',
    departmentTitle: 'Tim Perencana & Penjamin Mutu',
    name: 'Dr. Hj. Lazuardi Utama, M.Pd',
    nip: 'NIP. 19780512 200501 2 003',
    signatureImage: ''
  },
  signer2: {
    roleTitle: 'Menyetujui,',
    departmentTitle: 'Direktur Pelangi Lazuardi',
    name: 'dr. Nurul Fadhilah, Sp.KFR',
    nip: 'SIP. 446.1/102/IP.DOK/2022',
    signatureImage: ''
  },
  signer3: {
    roleTitle: 'Mengetahui,',
    departmentTitle: 'Kepala Layanan Klinis & Terapi',
    name: 'H. Ahmad Fauzi, S.Psi., M.Si',
    nip: '',
    signatureImage: ''
  }
};

interface StrategicPlanPageProps {
  data?: StrategicYearData[];
  onUpdate?: (newData: StrategicYearData[]) => void;
  logoUrl?: string;
  userRole?: UserRole;
}

const STATUS_CONFIG: Record<StrategicStatus, { label: string; color: string; badge: string; bg: string; icon: any }> = {
  'Done': { 
    label: 'Selesai (Done)', 
    color: '#10b981', 
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: CheckCircle2
  },
  'On Progress': { 
    label: 'Sedang Berjalan', 
    color: '#6366f1', 
    badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    icon: Clock3
  },
  'Pending': { 
    label: 'Tertunda (Pending)', 
    color: '#f59e0b', 
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: AlertTriangle
  },
  'Not Started': { 
    label: 'Belum Dimulai', 
    color: '#94a3b8', 
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    bg: 'bg-slate-500/10',
    icon: Hourglass
  }
};

const StrategicPlanPage: React.FC<StrategicPlanPageProps> = ({
  data: propsData,
  onUpdate: propsOnUpdate,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png',
  userRole = 'manager'
}) => {
  // Persistent State
  const [plans, setPlans] = useState<StrategicYearData[]>(() => {
    if (propsData && propsData.length > 0) return propsData;
    return getStoredStrategicPlans();
  });

  const [activeYear, setActiveYear] = useState<string>('');
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  // View & Filter States
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'analytics'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'with-evidence' | 'no-evidence'>('all');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StrategicItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Signature Settings for Print
  const [isSignatureSettingsOpen, setIsSignatureSettingsOpen] = useState(true);
  const [signatureConfig, setSignatureConfig] = useState<StrategicPrintSignatureConfig>(() => {
    try {
      const raw = localStorage.getItem('pelangi360_strategic_signatures_v2');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_SIGNATURE_CONFIG;
  });

  const handleUpdateSignatures = (newCfg: StrategicPrintSignatureConfig) => {
    setSignatureConfig(newCfg);
    try {
      localStorage.setItem('pelangi360_strategic_signatures_v2', JSON.stringify(newCfg));
    } catch (e) {}
  };

  const handleSignerImageUpload = (slot: 'signer1' | 'signer2' | 'signer3', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated: StrategicPrintSignatureConfig = {
          ...signatureConfig,
          [slot]: {
            ...signatureConfig[slot],
            signatureImage: reader.result
          }
        };
        handleUpdateSignatures(updated);
        setToastMessage('Tanda tangan digital berhasil dimuat.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignerImage = (slot: 'signer1' | 'signer2' | 'signer3') => {
    const updated: StrategicPrintSignatureConfig = {
      ...signatureConfig,
      [slot]: {
        ...signatureConfig[slot],
        signatureImage: ''
      }
    };
    handleUpdateSignatures(updated);
    setToastMessage('Tanda tangan digital dihapus.');
  };

  // Artifact Drawer / Modal State
  const [activeArtifactItem, setActiveArtifactItem] = useState<StrategicItem | null>(null);
  const [previewArtifact, setPreviewArtifact] = useState<StrategicArtifact | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Set default active year
  useEffect(() => {
    if (plans.length > 0 && !activeYear) {
      setActiveYear(plans[0].year);
    }
  }, [plans, activeYear]);

  // Sync to prop and storage
  const handleUpdatePlans = (newPlans: StrategicYearData[]) => {
    setPlans(newPlans);
    saveStoredStrategicPlans(newPlans);
    if (propsOnUpdate) propsOnUpdate(newPlans);
  };

  const activeYearData = useMemo(() => {
    return plans.find(p => p.year === activeYear) || plans[0];
  }, [plans, activeYear]);

  // Statistics
  const stats = useMemo(() => {
    if (!activeYearData || !activeYearData.items) {
      return { total: 0, done: 0, onProgress: 0, pending: 0, notStarted: 0, avgProgress: 0, totalBudget: 0, totalArtifacts: 0, itemsWithArtifacts: 0 };
    }
    const items = activeYearData.items;
    const total = items.length;
    const done = items.filter(i => i.status === 'Done').length;
    const onProgress = items.filter(i => i.status === 'On Progress').length;
    const pending = items.filter(i => i.status === 'Pending').length;
    const notStarted = items.filter(i => i.status === 'Not Started').length;
    const totalProg = items.reduce((sum, i) => sum + (i.progress || 0), 0);
    const avgProgress = total > 0 ? Math.round(totalProg / total) : 0;
    const totalBudget = items.reduce((sum, i) => sum + (i.budget || 0), 0);
    const totalArtifacts = items.reduce((sum, i) => sum + (i.artifacts?.length || 0), 0);
    const itemsWithArtifacts = items.filter(i => i.artifacts && i.artifacts.length > 0).length;

    return { total, done, onProgress, pending, notStarted, avgProgress, totalBudget, totalArtifacts, itemsWithArtifacts };
  }, [activeYearData]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!activeYearData?.items) return [];

    return activeYearData.items.filter(item => {
      // Category filter
      if (categoryFilter !== 'Semua' && item.category !== categoryFilter) return false;

      // Status filter
      if (statusFilter !== 'Semua' && item.status !== statusFilter) return false;

      // Evidence filter
      if (evidenceFilter === 'with-evidence' && (!item.artifacts || item.artifacts.length === 0)) return false;
      if (evidenceFilter === 'no-evidence' && item.artifacts && item.artifacts.length > 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchProgram = item.program.toLowerCase().includes(q);
        const matchKpi = (item.kpi || '').toLowerCase().includes(q);
        const matchPic = (item.pic || '').toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchArtifacts = item.artifacts?.some(a => a.name.toLowerCase().includes(q) || (a.notes || '').toLowerCase().includes(q));
        if (!matchProgram && !matchKpi && !matchPic && !matchCategory && !matchNotes && !matchArtifacts) return false;
      }

      return true;
    });
  }, [activeYearData, categoryFilter, statusFilter, evidenceFilter, searchQuery]);

  // Add / Edit Item Save Handler
  const handleSaveItem = (itemData: Omit<StrategicItem, 'id'> & { id?: string }) => {
    if (!activeYearData) return;

    let updatedItems: StrategicItem[];
    if (editingItem) {
      updatedItems = activeYearData.items.map(i => i.id === editingItem.id ? { ...itemData, id: i.id } as StrategicItem : i);
      setToastMessage(`Program "${itemData.program}" berhasil diperbarui.`);
    } else {
      const newItem: StrategicItem = {
        ...itemData,
        id: `sp-${Date.now()}`,
        artifacts: itemData.artifacts || []
      };
      updatedItems = [...activeYearData.items, newItem];
      setToastMessage(`Program baru "${itemData.program}" berhasil ditambahkan.`);
    }

    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  // Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    if (!window.confirm(`Hapus program kerja "${name}" beserta seluruh bukti/artefak yang terlampir?`)) return;
    const updatedItems = activeYearData.items.filter(i => i.id !== id);
    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);
    setToastMessage(`Program "${name}" telah dihapus.`);
  };

  // Quick Progress & Status Update
  const handleUpdateItemStatus = (id: string, newStatus: StrategicStatus) => {
    const updatedItems = activeYearData.items.map(i => {
      if (i.id === id) {
        return { 
          ...i, 
          status: newStatus,
          progress: newStatus === 'Done' ? 100 : (i.progress === 100 ? 50 : i.progress)
        };
      }
      return i;
    });
    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);
  };

  const handleUpdateItemProgress = (id: string, newProgress: number) => {
    const updatedItems = activeYearData.items.map(i => {
      if (i.id === id) {
        const nextStatus: StrategicStatus = newProgress === 100 ? 'Done' : (newProgress === 0 ? 'Not Started' : 'On Progress');
        return { ...i, progress: newProgress, status: nextStatus };
      }
      return i;
    });
    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);
  };

  // Add Artifact Handler
  const handleAddArtifact = (itemId: string, artifact: Omit<StrategicArtifact, 'id' | 'uploadDate'>) => {
    const newArtifact: StrategicArtifact = {
      ...artifact,
      id: `art-${Date.now()}`,
      uploadDate: new Date().toISOString()
    };

    const updatedItems = activeYearData.items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          artifacts: [...(i.artifacts || []), newArtifact]
        };
      }
      return i;
    });

    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);

    // Refresh active artifact item in modal
    const updatedActive = updatedItems.find(i => i.id === itemId);
    if (updatedActive) setActiveArtifactItem(updatedActive);

    setToastMessage(`Bukti "${newArtifact.name}" berhasil diunggah.`);
  };

  // Delete Artifact Handler
  const handleDeleteArtifact = (itemId: string, artifactId: string) => {
    if (!window.confirm('Hapus bukti/artefak ini?')) return;

    const updatedItems = activeYearData.items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          artifacts: (i.artifacts || []).filter(a => a.id !== artifactId)
        };
      }
      return i;
    });

    const newPlans = plans.map(p => p.year === activeYear ? { ...p, items: updatedItems } : p);
    handleUpdatePlans(newPlans);

    const updatedActive = updatedItems.find(i => i.id === itemId);
    if (updatedActive) setActiveArtifactItem(updatedActive);

    setToastMessage('Bukti/artefak telah dihapus.');
  };

  // Add Year
  const handleAddYear = () => {
    const yr = newYearInput.trim();
    if (!yr) return;
    if (plans.some(p => p.year === yr)) {
      alert('Tahun program tersebut sudah terdaftar.');
      return;
    }
    const newPlans = [{ year: yr, items: [] }, ...plans];
    handleUpdatePlans(newPlans);
    setActiveYear(yr);
    setNewYearInput('');
    setIsAddingYear(false);
    setToastMessage(`Tahun program ${yr} berhasil dibuat.`);
  };

  // Reset to Default
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan Rencana Strategis ke format default Pelangi Lazuardi lengkap dengan contoh program dan artefak?')) {
      const def = resetStrategicPlansToDefault();
      handleUpdatePlans(def);
      setActiveYear(def[0].year);
      setToastMessage('Rencana Strategis berhasil direset ke standar Pelangi Lazuardi.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!activeYearData?.items) return;
    const headers = ['Tahun', 'Bidang/Kategori', 'Program Kerja', 'Indikator (KPI)', 'PIC', 'Timeline', 'Anggaran (IDR)', 'Progress (%)', 'Status', 'Catatan', 'Jumlah Bukti / Artefak', 'Nama Artefak'];
    const rows = activeYearData.items.map(i => [
      `"${activeYear}"`,
      `"${i.category}"`,
      `"${i.program.replace(/"/g, '""')}"`,
      `"${(i.kpi || '').replace(/"/g, '""')}"`,
      `"${i.pic}"`,
      `"${i.timeline}"`,
      i.budget || 0,
      `${i.progress}%`,
      `"${i.status}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
      i.artifacts?.length || 0,
      `"${(i.artifacts?.map(a => a.name).join('; ') || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Strategic_Plan_Pelangi_Lazuardi_${activeYear.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Data Strategic Plan berhasil diekspor.');
  };

  // Chart Data for Analytics View
  const statusChartData = useMemo(() => {
    return [
      { name: 'Selesai', value: stats.done, color: STATUS_CONFIG['Done'].color },
      { name: 'Sedang Berjalan', value: stats.onProgress, color: STATUS_CONFIG['On Progress'].color },
      { name: 'Tertunda', value: stats.pending, color: STATUS_CONFIG['Pending'].color },
      { name: 'Belum Dimulai', value: stats.notStarted, color: STATUS_CONFIG['Not Started'].color }
    ].filter(d => d.value > 0);
  }, [stats]);

  const categoryChartData = useMemo(() => {
    if (!activeYearData?.items) return [];
    const catMap: Record<string, { total: number; progressSum: number; budget: number; artifacts: number }> = {};

    activeYearData.items.forEach(i => {
      if (!catMap[i.category]) {
        catMap[i.category] = { total: 0, progressSum: 0, budget: 0, artifacts: 0 };
      }
      catMap[i.category].total += 1;
      catMap[i.category].progressSum += i.progress;
      catMap[i.category].budget += (i.budget || 0);
      catMap[i.category].artifacts += (i.artifacts?.length || 0);
    });

    return Object.entries(catMap).map(([name, val]) => ({
      name,
      avgProgress: Math.round(val.progressSum / val.total),
      totalPrograms: val.total,
      artifacts: val.artifacts
    }));
  }, [activeYearData]);

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border-2 border-primary text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in-up">
          <Sparkles className="w-5 h-5 text-primary shrink-0 animate-pulse" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- Executive Banner --- */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-purple-950/80 to-slate-900 border border-purple-500/20 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Strategic Plan
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Pelangi Lazuardi
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                {stats.totalArtifacts} Bukti & Artefak Terunggah
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Rencana Strategis & Manajemen Artefak</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pemantauan roadmap program kerja institusi, realisasi KPI sasaran mutu klinis, serta manajemen dokumen bukti fisik pertanggungjawaban kegiatan secara transparan.
            </p>
          </div>

          {/* Action Buttons & Year Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Year Switcher Pills */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
              {plans.map(p => (
                <button
                  key={p.year}
                  onClick={() => setActiveYear(p.year)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeYear === p.year
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.year}
                </button>
              ))}

              {isAddingYear ? (
                <div className="flex items-center gap-1 pl-1">
                  <input 
                    type="text"
                    placeholder="YYYY/YYYY"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="w-24 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg border border-purple-500/40 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleAddYear} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsAddingYear(false)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingYear(true)}
                  className="px-2 py-1 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
                  title="Tambah Tahun Program Baru"
                >
                  + Tahun
                </button>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Program</span>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="Pratinjau & Cetak Laporan Rencana Strategis Resmi"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                title="Ekspor Data ke CSV"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetDefault}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                title="Reset ke Rencana Strategis Standar Pelangi Lazuardi"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Executive Progress & Artifact Audit Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-surface border border-surface-light rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Tingkat Eksekusi Program</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">{stats.avgProgress}%</span>
                <span className="text-xs font-semibold text-emerald-400">
                  {stats.done}/{stats.total} Selesai
                </span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-light/60">
            <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-surface-light/30">
              <div 
                className="h-full rounded-full transition-all duration-700 bg-linear-to-r from-purple-500 to-indigo-400"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted mt-2">
              <span>{stats.onProgress} program berjalan</span>
              <span>{stats.pending} tertunda</span>
            </div>
          </div>
        </div>

        {/* Artifacts Audit Compliance Card */}
        <div className="bg-surface border border-surface-light rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Kelengkapan Bukti & Artefak</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-teal-400">{stats.totalArtifacts}</span>
                <span className="text-xs text-muted">Dokumen/Foto</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-light/60">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
              <span className="text-slate-300">Cakupan Bukti:</span>
              <span className="text-teal-400">
                {stats.total > 0 ? Math.round((stats.itemsWithArtifacts / stats.total) * 100) : 0}% Program
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-surface-light/30">
              <div 
                className="h-full rounded-full bg-teal-500 transition-all duration-700"
                style={{ width: `${stats.total > 0 ? (stats.itemsWithArtifacts / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-muted mt-2">
              {stats.itemsWithArtifacts} dari {stats.total} program telah melampirkan artefak.
            </p>
          </div>
        </div>

        {/* Budget Allocation Card */}
        <div className="bg-surface border border-surface-light rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Alokasi Anggaran Strategis</span>
              <div className="mt-1">
                <span className="text-xl sm:text-2xl font-black text-white block truncate">
                  {formatCurrency(stats.totalBudget)}
                </span>
                <span className="text-[11px] text-muted">Periode {activeYear}</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-light/60">
            <p className="text-[11px] text-slate-300 leading-snug">
              Investasi sarana sensori, peningkatan sertifikasi praktisi terapis, dan digitalisasi mutu.
            </p>
          </div>
        </div>

        {/* Status Distribution Pills */}
        <div className="bg-surface border border-surface-light rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-3">Distribusi Status Program</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Done</span>
                <span className="font-mono font-black text-white">{stats.done}</span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <span className="text-indigo-400 font-bold">Progress</span>
                <span className="font-mono font-black text-white">{stats.onProgress}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <span className="text-amber-400 font-bold">Pending</span>
                <span className="font-mono font-black text-white">{stats.pending}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-between">
                <span className="text-slate-400 font-bold">Not Started</span>
                <span className="font-mono font-black text-white">{stats.notStarted}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 text-right">
            <span className="text-[11px] text-muted">Total: <strong className="text-white">{stats.total}</strong> Sasaran</span>
          </div>
        </div>
      </div>

      {/* --- Filter & View Mode Bar --- */}
      <div className="bg-surface border border-surface-light rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
        {/* Left: View Mode Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-background/80 rounded-xl border border-surface-light">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-purple-600 text-white shadow-md' : 'text-muted hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Matriks Tabel</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'kanban' ? 'bg-purple-600 text-white shadow-md' : 'text-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Papan Kanban</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'analytics' ? 'bg-purple-600 text-white shadow-md' : 'text-muted hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik & Audit</span>
          </button>
        </div>

        {/* Right: Filters & Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-2xl justify-end flex-wrap">
          {/* Search */}
          <div className="relative min-w-[170px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text"
              placeholder="Cari program, KPI, PIC, bukti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-surface-light text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-surface-light text-white text-xs rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-purple-500"
          >
            <option value="Semua">Semua Bidang</option>
            {STRATEGIC_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-surface-light text-white text-xs rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-purple-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Done">Selesai (Done)</option>
            <option value="On Progress">Sedang Berjalan</option>
            <option value="Pending">Tertunda</option>
            <option value="Not Started">Belum Dimulai</option>
          </select>

          {/* Evidence Filter */}
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value as any)}
            className="bg-background border border-surface-light text-white text-xs rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">Semua Bukti</option>
            <option value="with-evidence">Ada Bukti / Artefak</option>
            <option value="no-evidence">Belum Ada Bukti</option>
          </select>
        </div>
      </div>

      {/* --- VIEW MODE 1: MATRIKS TABEL DENGAN MANAJEMEN BUKTI --- */}
      {viewMode === 'table' && (
        <div className="bg-surface border border-surface-light rounded-3xl shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 bg-background/50 border-b border-surface-light flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Daftar Program Kerja & Pertanggungjawaban Artefak ({activeYear})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Setiap item dilengkapi pengawasan PIC, timeline, progress berkala, dan dokumentasi bukti fisik.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              {filteredItems.length} Program
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left divide-y divide-surface-light">
              <thead className="bg-surface-light/60 text-muted uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5 w-40">Bidang / Kategori</th>
                  <th className="px-4 py-3.5 min-w-[240px]">Program Kerja & Sasaran KPI</th>
                  <th className="px-3.5 py-3.5 w-36">PIC & Waktu</th>
                  <th className="px-3.5 py-3.5 w-32">Anggaran</th>
                  <th className="px-4 py-3.5 w-48 text-center">Progress Realisasi</th>
                  <th className="px-3.5 py-3.5 w-28 text-center">Status</th>
                  <th className="px-4 py-3.5 w-48 text-center">Bukti / Artefak</th>
                  <th className="px-3.5 py-3.5 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-light/60">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">Tidak ada program yang sesuai dengan filter.</p>
                      <button
                        onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                        className="mt-3 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        + Tambah Program Kerja
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG['Not Started'];
                    const categoryDef = STRATEGIC_CATEGORIES.find(c => c.id === item.category);
                    const artifactCount = item.artifacts?.length || 0;

                    return (
                      <tr key={item.id} className="hover:bg-surface-light/30 transition-colors">
                        {/* Category */}
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${categoryDef?.bg || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                            {item.category}
                          </span>
                        </td>

                        {/* Program & KPI */}
                        <td className="px-4 py-4 align-top space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{item.program}</h4>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            <strong className="text-purple-400">KPI: </strong>
                            {item.kpi}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-muted italic bg-background/50 p-1.5 rounded-lg border border-surface-light/50">
                              "{item.notes}"
                            </p>
                          )}
                        </td>

                        {/* PIC & Timeline */}
                        <td className="px-3.5 py-4 align-top space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs">
                            <User className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                            <span>{item.pic}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted text-[11px]">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.timeline}</span>
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-3.5 py-4 align-top font-mono font-bold text-slate-200">
                          {item.budget ? formatCurrency(item.budget) : '-'}
                        </td>

                        {/* Progress Slider */}
                        <td className="px-4 py-4 align-middle">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                              <span className="text-muted">Capaian:</span>
                              <span className={item.progress === 100 ? 'text-emerald-400' : 'text-purple-400'}>
                                {item.progress}%
                              </span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={item.progress}
                              onChange={(e) => handleUpdateItemProgress(item.id, parseInt(e.target.value) || 0)}
                              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-purple-500"
                              title="Geser untuk update progress cepat"
                            />
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-3.5 py-4 align-middle text-center">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateItemStatus(item.id, e.target.value as StrategicStatus)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none ${statusConf.badge}`}
                          >
                            <option value="Done">Selesai (Done)</option>
                            <option value="On Progress">On Progress</option>
                            <option value="Pending">Pending</option>
                            <option value="Not Started">Not Started</option>
                          </select>
                        </td>

                        {/* Artifacts Upload & Management Button */}
                        <td className="px-4 py-4 align-middle text-center">
                          <button
                            onClick={() => setActiveArtifactItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center w-full transition-all cursor-pointer ${
                              artifactCount > 0
                                ? 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 shadow-xs'
                                : 'bg-surface-light hover:bg-purple-500/20 text-muted hover:text-purple-300 border border-surface-light'
                            }`}
                            title="Buka & Kelola Bukti / Artefak Program"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>
                              {artifactCount > 0 ? `${artifactCount} Bukti` : '+ Upload'}
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-4 align-middle text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }}
                              className="p-1.5 text-indigo-400 hover:text-white rounded-lg hover:bg-surface-light transition-all cursor-pointer"
                              title="Edit Program Kerja"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.program)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Hapus Program Kerja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* --- VIEW MODE 2: KANBAN ROADMAP VIEW --- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Not Started', 'On Progress', 'Pending', 'Done'] as StrategicStatus[]).map(statusKey => {
            const itemsInStatus = filteredItems.filter(i => i.status === statusKey);
            const statusConf = STATUS_CONFIG[statusKey];
            const StatusIcon = statusConf.icon;

            return (
              <div 
                key={statusKey}
                className="bg-surface border border-surface-light rounded-3xl p-4 shadow-lg flex flex-col space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-light">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${statusConf.bg}`}>
                      <StatusIcon className="w-4 h-4" style={{ color: statusConf.color }} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{statusConf.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-background text-muted">
                    {itemsInStatus.length}
                  </span>
                </div>

                {/* Cards in this column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {itemsInStatus.length === 0 ? (
                    <div className="py-8 text-center text-muted/60 text-xs italic">
                      Tidak ada program di kolom ini
                    </div>
                  ) : (
                    itemsInStatus.map(item => {
                      const catDef = STRATEGIC_CATEGORIES.find(c => c.id === item.category);
                      const artifactCount = item.artifacts?.length || 0;

                      return (
                        <div 
                          key={item.id}
                          className="bg-background/80 border border-surface-light hover:border-purple-500/40 rounded-2xl p-4 shadow-sm space-y-2.5 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${catDef?.bg || 'bg-slate-800 text-slate-300'}`}>
                              {item.category}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.program)}
                                className="p-1 text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug">{item.program}</h4>

                          <p className="text-[11px] text-muted line-clamp-2">
                            <strong className="text-purple-300">KPI: </strong>
                            {item.kpi}
                          </p>

                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                              <span className="text-muted">Progress</span>
                              <span className="text-white">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-surface-light rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ width: `${item.progress}%`, backgroundColor: statusConf.color }}
                              />
                            </div>
                          </div>

                          {/* Footer with PIC and Artifacts Button */}
                          <div className="pt-2 border-t border-surface-light/60 flex items-center justify-between text-[11px]">
                            <span className="text-indigo-300 font-semibold truncate max-w-[120px]">
                              {item.pic}
                            </span>

                            <button
                              onClick={() => setActiveArtifactItem(item)}
                              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-all cursor-pointer ${
                                artifactCount > 0
                                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                                  : 'bg-surface-light text-muted hover:text-white'
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{artifactCount} Bukti</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Column Quick Add */}
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsItemModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl border border-dashed border-surface-light hover:border-purple-500/40 text-muted hover:text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah di Status Ini</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VIEW MODE 3: ANALYTICS & AUDIT VIEW --- */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-surface border border-surface-light rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Distribusi Status Program Kerja ({activeYear})
              </h3>
              <p className="text-xs text-muted mt-0.5">Proporsi program kerja berdasarkan tahapan eksekusi.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12, fontSize: 12, color: '#fff' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-light/60 text-center text-xs">
              <div>
                <span className="text-emerald-400 font-bold block">{stats.done}</span>
                <span className="text-muted text-[10px]">Selesai</span>
              </div>
              <div>
                <span className="text-indigo-400 font-bold block">{stats.onProgress}</span>
                <span className="text-muted text-[10px]">Berjalan</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block">{stats.pending}</span>
                <span className="text-muted text-[10px]">Tertunda</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">{stats.notStarted}</span>
                <span className="text-muted text-[10px]">Belum Mulai</span>
              </div>
            </div>
          </div>

          {/* Progress per Category Bar Chart */}
          <div className="bg-surface border border-surface-light rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                Capaian Progress Rata-rata per Bidang (%)
              </h3>
              <p className="text-xs text-muted mt-0.5">Persentase kemajuan program kerja di setiap divisi.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12, fontSize: 12 }} 
                  />
                  <Bar dataKey="avgProgress" name="Progress (%)" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-2xl bg-background/60 border border-surface-light text-xs text-slate-300">
              <span className="font-bold text-purple-400">Audit Bukti Fisik: </span>
              Terdapat <strong>{stats.totalArtifacts} bukti</strong> terunggah pada <strong>{stats.itemsWithArtifacts} dari {stats.total} program</strong>. Seluruh bukti siap diunduh dan diverifikasi saat akreditasi atau audit dewan yayasan.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- MODAL TAMBAH / EDIT PROGRAM KERJA --- */}
      {/* ========================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in-up">
          <div className="bg-surface border border-surface-light rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-surface-light pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {editingItem ? 'Edit Program Rencana Strategis' : 'Tambah Program Rencana Strategis Baru'}
                  </h3>
                  <p className="text-xs text-muted">Periode Tahun Program: {activeYear}</p>
                </div>
              </div>
              <button onClick={() => setIsItemModalOpen(false)} className="p-2 text-muted hover:text-white rounded-xl hover:bg-surface-light">
                <X className="w-5 h-5" />
              </button>
            </div>

            <StrategicItemForm
              initialItem={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setIsItemModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- DRAWER / MODAL KELOLA BUKTI & ARTEFAK --- */}
      {/* ========================================================= */}
      {activeArtifactItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in-up">
          <div className="bg-surface border border-surface-light rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-light pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
                  <Paperclip className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {activeArtifactItem.category}
                    </span>
                    <span className="text-xs text-muted">Tahun {activeYear}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5 line-clamp-1">
                    Kelola Bukti & Artefak: {activeArtifactItem.program}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveArtifactItem(null)} 
                className="p-2 text-muted hover:text-white rounded-xl hover:bg-surface-light cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Upload Section + Artifacts Grid */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Upload Form Box */}
              <ArtifactUploadBox 
                onUpload={(artifact) => handleAddArtifact(activeArtifactItem.id, artifact)} 
              />

              {/* Existing Artifacts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Daftar Bukti / Artefak Terlampir ({activeArtifactItem.artifacts?.length || 0})
                  </h4>
                  <span className="text-[11px] text-teal-400 font-semibold">
                    Terverifikasi untuk Audit Mutu
                  </span>
                </div>

                {!activeArtifactItem.artifacts || activeArtifactItem.artifacts.length === 0 ? (
                  <div className="p-8 text-center bg-background/50 rounded-2xl border border-surface-light text-muted">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">Belum ada bukti fisik atau artefak yang diunggah untuk program ini.</p>
                    <p className="text-[11px] text-muted/60 mt-0.5">Unggah foto dokumentasi, berita acara, sertifikat, atau laporan PDF di atas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeArtifactItem.artifacts.map(art => (
                      <div 
                        key={art.id}
                        className="bg-background/80 border border-surface-light rounded-2xl p-4 space-y-3 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            art.type === 'image' ? 'bg-indigo-500/20 text-indigo-400' :
                            art.type === 'pdf' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-teal-500/20 text-teal-400'
                          }`}>
                            {art.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white line-clamp-1">{art.name}</h5>
                            <p className="text-[10px] text-muted font-mono truncate">{art.fileName || 'file_artefak'}</p>
                            {art.notes && (
                              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 italic">"{art.notes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Image Preview Thumbnail if image */}
                        {art.type === 'image' && art.url && (
                          <div 
                            onClick={() => setPreviewArtifact(art)}
                            className="h-28 rounded-xl overflow-hidden border border-surface-light cursor-pointer relative group"
                          >
                            <img src={art.url} alt={art.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" />
                              <span>Lihat Foto</span>
                            </div>
                          </div>
                        )}

                        {/* Metadata & Actions */}
                        <div className="pt-2 border-t border-surface-light/60 flex items-center justify-between text-[10px] text-muted">
                          <span>{new Date(art.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>

                          <div className="flex items-center gap-1.5">
                            {art.url && (
                              <button
                                onClick={() => setPreviewArtifact(art)}
                                className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-surface-light transition-all cursor-pointer"
                                title="Lihat Pratinjau Artefak"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={art.url}
                              download={art.fileName || 'artefak_pelangi_lazuardi'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-teal-300 hover:text-white rounded-lg hover:bg-surface-light transition-all cursor-pointer"
                              title="Unduh Berkas"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleDeleteArtifact(activeArtifactItem.id, art.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Hapus Bukti"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-surface-light flex justify-end shrink-0">
              <button
                onClick={() => setActiveArtifactItem(null)}
                className="px-5 py-2.5 bg-surface-light hover:bg-surface-light/80 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- LIGHTBOX MODAL UNTUK PREVIEW BUKTI --- */}
      {/* ========================================================= */}
      {previewArtifact && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up" onClick={() => setPreviewArtifact(null)}>
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">{previewArtifact.name}</h4>
                <p className="text-xs text-slate-400">{previewArtifact.fileName || 'Berkas Bukti / Artefak'}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewArtifact.url}
                  download={previewArtifact.fileName || 'artefak'}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
                <button 
                  onClick={() => setPreviewArtifact(null)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-4">
              {previewArtifact.type === 'image' ? (
                <img src={previewArtifact.url} alt={previewArtifact.name} className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-16 h-16 text-indigo-400 mx-auto" />
                  <h5 className="text-white font-bold text-sm">{previewArtifact.fileName}</h5>
                  <p className="text-xs text-slate-400">Berkas dokumen PDF atau dokumen eksternal.</p>
                  <a
                    href={previewArtifact.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Dokumen di Tab Baru</span>
                  </a>
                </div>
              )}
            </div>

            {previewArtifact.notes && (
              <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                Catatan: {previewArtifact.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* --- MODAL PRINT PREVIEW DOKUMEN RESMI STRATEGIC PLAN --- */}
      {/* ========================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pratinjau Dokumen Rencana Strategis Resmi</h3>
                  <p className="text-xs text-slate-400">Pelangi Lazuardi - Pusat Terapi Tumbuh Kembang Anak ({activeYear})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Sheet Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              {/* Interactive Signature Settings Toolbar (Hidden on Print) */}
              <div className="print:hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 max-w-4xl mx-auto shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Pengaturan Kolom Nama Tanda Tangan Cetak</span>
                        <span className="text-[10px] font-normal text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          Bisa Diedit & Upload TTD
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Sesuaikan nama penandatangan, jabatan, tempat/tanggal, atau unggah tanda tangan digital untuk dicetak pada dokumen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Layout Selector: 2 vs 3 Signatures */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateSignatures({ ...signatureConfig, layout: '2-columns' })}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          signatureConfig.layout === '2-columns'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2 Kolom TTD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSignatures({ ...signatureConfig, layout: '3-columns' })}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          signatureConfig.layout === '3-columns'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        3 Kolom TTD
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSignatureSettingsOpen(!isSignatureSettingsOpen)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>{isSignatureSettingsOpen ? 'Tutup Panel' : 'Edit Kolom TTD'}</span>
                    </button>
                  </div>
                </div>

                {isSignatureSettingsOpen && (
                  <div className="pt-3 border-t border-slate-800 space-y-4 animate-fade-in-up">
                    {/* Location & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Tempat / Kota Pengesahan</label>
                        <input 
                          type="text"
                          value={signatureConfig.location}
                          onChange={(e) => handleUpdateSignatures({ ...signatureConfig, location: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500"
                          placeholder="Tangerang Selatan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Dokumen Pengesahan</label>
                        <input 
                          type="text"
                          value={signatureConfig.dateString}
                          onChange={(e) => handleUpdateSignatures({ ...signatureConfig, dateString: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500"
                          placeholder="30 September 2026"
                        />
                      </div>
                    </div>

                    {/* Columns Grid */}
                    <div className={`grid grid-cols-1 ${signatureConfig.layout === '3-columns' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 text-xs`}>
                      {/* Signer 1: Pembuat / Verifikator */}
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-400 text-[11px]">Kolom TTD 1 (Pembuat / Verifikator)</span>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Label Status / Peran</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer1.roleTitle}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer1: { ...signatureConfig.signer1, roleTitle: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs"
                            placeholder="Diverifikasi Oleh,"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Bagian</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer1.departmentTitle}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer1: { ...signatureConfig.signer1, departmentTitle: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold"
                            placeholder="Tim Perencana & Penjamin Mutu"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer1.name}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer1: { ...signatureConfig.signer1, name: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-purple-500/40 text-white rounded-lg p-1.5 text-xs font-bold"
                            placeholder="Dr. Hj. Lazuardi Utama, M.Pd"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">NIP / Identitas (Opsional)</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer1.nip || ''}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer1: { ...signatureConfig.signer1, nip: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                            placeholder="NIP. 19780512 200501 2 003"
                          />
                        </div>
                        {/* Upload Digital Signature */}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{signatureConfig.signer1.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer1', e.target.files[0])}
                            />
                          </label>
                          {signatureConfig.signer1.signatureImage && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveSignerImage('signer1')}
                              className="text-rose-400 hover:underline"
                            >
                              Hapus TTD
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Signer 3: Posisi Tengah jika 3 kolom */}
                      {signatureConfig.layout === '3-columns' && (
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-teal-400 text-[11px]">Kolom TTD 2 (Klinis / Medis)</span>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Label Status / Peran</label>
                            <input 
                              type="text"
                              value={signatureConfig.signer3.roleTitle}
                              onChange={(e) => handleUpdateSignatures({
                                ...signatureConfig,
                                signer3: { ...signatureConfig.signer3, roleTitle: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs"
                              placeholder="Mengetahui,"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Bagian</label>
                            <input 
                              type="text"
                              value={signatureConfig.signer3.departmentTitle}
                              onChange={(e) => handleUpdateSignatures({
                                ...signatureConfig,
                                signer3: { ...signatureConfig.signer3, departmentTitle: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold"
                              placeholder="Kepala Layanan Klinis & Terapi"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                            <input 
                              type="text"
                              value={signatureConfig.signer3.name}
                              onChange={(e) => handleUpdateSignatures({
                                ...signatureConfig,
                                signer3: { ...signatureConfig.signer3, name: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-teal-500/40 text-white rounded-lg p-1.5 text-xs font-bold"
                              placeholder="H. Ahmad Fauzi, S.Psi., M.Si"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">NIP / Identitas (Opsional)</label>
                            <input 
                              type="text"
                              value={signatureConfig.signer3.nip || ''}
                              onChange={(e) => handleUpdateSignatures({
                                ...signatureConfig,
                                signer3: { ...signatureConfig.signer3, nip: e.target.value }
                              })}
                              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                              placeholder="SIP / NIP"
                            />
                          </div>
                          {/* Upload Digital Signature */}
                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>{signatureConfig.signer3.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer3', e.target.files[0])}
                              />
                            </label>
                            {signatureConfig.signer3.signatureImage && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveSignerImage('signer3')}
                                className="text-rose-400 hover:underline"
                              >
                                Hapus TTD
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Signer 2: Pimpinan / Menyetujui */}
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 text-[11px]">Kolom TTD {signatureConfig.layout === '3-columns' ? '3' : '2'} (Pimpinan / Menyetujui)</span>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Label Status / Peran</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer2.roleTitle}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer2: { ...signatureConfig.signer2, roleTitle: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs"
                            placeholder="Menyetujui,"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Bagian</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer2.departmentTitle}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer2: { ...signatureConfig.signer2, departmentTitle: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold"
                            placeholder="Direktur Pelangi Lazuardi"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer2.name}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer2: { ...signatureConfig.signer2, name: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-emerald-500/40 text-white rounded-lg p-1.5 text-xs font-bold"
                            placeholder="dr. Nurul Fadhilah, Sp.KFR"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">SIP / NIP (Opsional)</label>
                          <input 
                            type="text"
                            value={signatureConfig.signer2.nip || ''}
                            onChange={(e) => handleUpdateSignatures({
                              ...signatureConfig,
                              signer2: { ...signatureConfig.signer2, nip: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                            placeholder="SIP. 446.1/102/IP.DOK/2022"
                          />
                        </div>
                        {/* Upload Digital Signature */}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{signatureConfig.signer2.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer2', e.target.files[0])}
                            />
                          </label>
                          {signatureConfig.signer2.signatureImage && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveSignerImage('signer2')}
                              className="text-rose-400 hover:underline"
                            >
                              Hapus TTD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Printable A4 Sheet */}
              <div className="a4-sheet bg-white text-slate-900 p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-6 text-xs font-sans">
                {/* Kop Surat Pelangi Lazuardi */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-purple-900 text-white flex items-center justify-center font-black text-xl">
                        PL
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                        PUSAT TERAPI TUMBUH KEMBANG ANAK PELANGI LAZUARDI
                      </h2>
                      <p className="text-[10px] text-slate-600">
                        Layanan Terpadu: Okupasi, Wicara, Fisioterapi, Remedial, Hidroterapi & Terapi Berkuda
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Jl. Merak No. 1, Cipayung, Ciputat, Tangerang Selatan • Telp: (021) 749-0012 • Web: lazuardi.sch.id
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-800 block">
                      DOKUMEN STRATEGIS
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      Tgl: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    LAPORAN CAPAIAN RENCANA STRATEGIS (STRATEGIC PLAN) & ARTEFAK AUDIT
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Periode Rencana Kerja: <strong>Tahun Ajaran {activeYear}</strong>
                  </p>
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Program</span>
                    <span className="text-base font-black text-slate-900">{stats.total} Program</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Program Selesai</span>
                    <span className="text-base font-black text-emerald-600">{stats.done} ({stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Rata-rata Progress</span>
                    <span className="text-base font-black text-purple-700">{stats.avgProgress}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Artefak Bukti Terunggah</span>
                    <span className="text-base font-black text-teal-700">{stats.totalArtifacts} Berkas</span>
                  </div>
                </div>

                {/* Detailed Table per Category */}
                <div className="space-y-5">
                  {STRATEGIC_CATEGORIES.map(cat => {
                    const catItems = (activeYearData?.items || []).filter(i => i.category === cat.id);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="border-b border-slate-300 pb-1 flex items-center justify-between">
                          <span className="font-bold text-[11px] text-slate-900 uppercase">
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {catItems.length} Program
                          </span>
                        </div>

                        <table className="w-full border-collapse border border-slate-300 text-[10px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700">
                              <th className="border border-slate-300 p-1.5 text-left w-1/3">Program Kerja & Sasaran KPI</th>
                              <th className="border border-slate-300 p-1.5 text-center w-24">PIC & Waktu</th>
                              <th className="border border-slate-300 p-1.5 text-right w-24">Anggaran</th>
                              <th className="border border-slate-300 p-1.5 text-center w-16">Progress</th>
                              <th className="border border-slate-300 p-1.5 text-center w-20">Status</th>
                              <th className="border border-slate-300 p-1.5 text-left w-48">Bukti / Artefak Fisik</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catItems.map(item => (
                              <tr key={item.id}>
                                <td className="border border-slate-300 p-1.5">
                                  <span className="font-bold block text-slate-900">{item.program}</span>
                                  <span className="text-[9px] text-slate-600 block mt-0.5">KPI: {item.kpi}</span>
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center">
                                  <span className="font-semibold block">{item.pic}</span>
                                  <span className="text-[9px] text-slate-500 block">{item.timeline}</span>
                                </td>
                                <td className="border border-slate-300 p-1.5 text-right font-mono">
                                  {item.budget ? formatCurrency(item.budget) : '-'}
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center font-bold font-mono">
                                  {item.progress}%
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center font-bold">
                                  {item.status}
                                </td>
                                <td className="border border-slate-300 p-1.5 text-[9px] text-slate-700">
                                  {item.artifacts && item.artifacts.length > 0 ? (
                                    <ul className="list-disc pl-3 space-y-0.5">
                                      {item.artifacts.map(a => (
                                        <li key={a.id} className="truncate">
                                          {a.name}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-slate-400 italic">Belum ada bukti</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Signatures with Editable Name Columns */}
                <div className="pt-8 border-t border-slate-300 space-y-4">
                  {/* Location and Date */}
                  <div className="text-right text-[11px] text-slate-700 font-medium">
                    <span>{signatureConfig.location}, {signatureConfig.dateString}</span>
                  </div>

                  <div className={`grid ${signatureConfig.layout === '3-columns' ? 'grid-cols-3' : 'grid-cols-2'} gap-6 text-center text-xs`}>
                    {/* Signer 1: Pembuat / Verifikator */}
                    <div className="flex flex-col items-center">
                      <p className="text-slate-500 text-[10px]">{signatureConfig.signer1.roleTitle}</p>
                      <p className="font-bold text-slate-900 mt-0.5">{signatureConfig.signer1.departmentTitle}</p>
                      <div className="h-16 w-full flex items-center justify-center my-1">
                        {signatureConfig.signer1.signatureImage ? (
                          <img src={signatureConfig.signer1.signatureImage} alt="TTD 1" className="h-14 max-w-[140px] object-contain" />
                        ) : (
                          <div className="h-14" />
                        )}
                      </div>
                      <input 
                        type="text"
                        value={signatureConfig.signer1.name}
                        onChange={(e) => handleUpdateSignatures({
                          ...signatureConfig,
                          signer1: { ...signatureConfig.signer1, name: e.target.value }
                        })}
                        className="font-bold underline text-slate-900 text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none w-full"
                        title="Klik untuk mengubah nama penandatangan"
                      />
                      {signatureConfig.signer1.nip && (
                        <p className="text-[9px] text-slate-500 mt-0.5">{signatureConfig.signer1.nip}</p>
                      )}
                    </div>

                    {/* Signer 3 (Middle if 3 columns) */}
                    {signatureConfig.layout === '3-columns' && (
                      <div className="flex flex-col items-center">
                        <p className="text-slate-500 text-[10px]">{signatureConfig.signer3.roleTitle}</p>
                        <p className="font-bold text-slate-900 mt-0.5">{signatureConfig.signer3.departmentTitle}</p>
                        <div className="h-16 w-full flex items-center justify-center my-1">
                          {signatureConfig.signer3.signatureImage ? (
                            <img src={signatureConfig.signer3.signatureImage} alt="TTD 3" className="h-14 max-w-[140px] object-contain" />
                          ) : (
                            <div className="h-14" />
                          )}
                        </div>
                        <input 
                          type="text"
                          value={signatureConfig.signer3.name}
                          onChange={(e) => handleUpdateSignatures({
                            ...signatureConfig,
                            signer3: { ...signatureConfig.signer3, name: e.target.value }
                          })}
                          className="font-bold underline text-slate-900 text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none w-full"
                          title="Klik untuk mengubah nama penandatangan"
                        />
                        {signatureConfig.signer3.nip && (
                          <p className="text-[9px] text-slate-500 mt-0.5">{signatureConfig.signer3.nip}</p>
                        )}
                      </div>
                    )}

                    {/* Signer 2: Pimpinan / Menyetujui */}
                    <div className="flex flex-col items-center">
                      <p className="text-slate-500 text-[10px]">{signatureConfig.signer2.roleTitle}</p>
                      <p className="font-bold text-slate-900 mt-0.5">{signatureConfig.signer2.departmentTitle}</p>
                      <div className="h-16 w-full flex items-center justify-center my-1">
                        {signatureConfig.signer2.signatureImage ? (
                          <img src={signatureConfig.signer2.signatureImage} alt="TTD 2" className="h-14 max-w-[140px] object-contain" />
                        ) : (
                          <div className="h-14" />
                        )}
                      </div>
                      <input 
                        type="text"
                        value={signatureConfig.signer2.name}
                        onChange={(e) => handleUpdateSignatures({
                          ...signatureConfig,
                          signer2: { ...signatureConfig.signer2, name: e.target.value }
                        })}
                        className="font-bold underline text-slate-900 text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none w-full"
                        title="Klik untuk mengubah nama penandatangan"
                      />
                      {signatureConfig.signer2.nip && (
                        <p className="text-[9px] text-slate-500 mt-0.5">{signatureConfig.signer2.nip}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// =========================================================================
// Helper Component: Box Upload Bukti & Artefak
// =========================================================================
interface ArtifactUploadBoxProps {
  onUpload: (artifact: Omit<StrategicArtifact, 'id' | 'uploadDate'>) => void;
}

const ArtifactUploadBox: React.FC<ArtifactUploadBoxProps> = ({ onUpload }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'image' | 'pdf' | 'document' | 'link'>('image');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [notes, setNotes] = useState('');
  const [uploaderName, setUploaderName] = useState('Staf Pelangi Lazuardi');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Determine type
    if (file.type.startsWith('image/')) {
      setType('image');
    } else if (file.type === 'application/pdf') {
      setType('pdf');
    } else {
      setType('document');
    }

    // Convert to Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama bukti/artefak wajib diisi.');
      return;
    }
    if (!url.trim()) {
      alert('Silakan pilih berkas dokumen/foto atau masukkan tautan bukti.');
      return;
    }

    onUpload({
      name,
      type,
      url,
      fileName: fileName || name,
      fileSize: fileSize || 'Dokumen Digital',
      notes,
      uploaderName
    });

    // Reset Form
    setName('');
    setUrl('');
    setFileName('');
    setFileSize('');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background/90 rounded-2xl border border-teal-500/30 space-y-3.5">
      <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
        <Upload className="w-4 h-4" />
        <span>Unggah Bukti Baru (Foto Dokumentasi, Berita Acara, SOP, Sertifikat)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-200 block mb-1">Nama Bukti / Artefak *</label>
          <input 
            type="text"
            placeholder="Contoh: Foto Revitalisasi Ruang Sensori Baru"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="font-bold text-slate-200 block mb-1">Tipe Berkas / Artefak</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-surface border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500"
          >
            <option value="image">Foto / Dokumentasi Gambar (PNG, JPG, WebP)</option>
            <option value="pdf">Dokumen PDF (SOP, BAST, Laporan)</option>
            <option value="document">Dokumen Lainnya</option>
            <option value="link">Tautan Eksternal (Google Drive / Cloud)</option>
          </select>
        </div>
      </div>

      {/* File Upload Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-200 block mb-1">Pilih Berkas dari Komputer</label>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="w-full bg-surface border border-surface-light text-slate-300 rounded-xl p-2 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30"
          />
          {fileName && (
            <span className="text-[10px] text-teal-400 font-mono mt-1 block">
              ✓ Berkas terpilih: {fileName} ({fileSize})
            </span>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-200 block mb-1">Atau Masukkan URL / Tautan Berkas</label>
          <input 
            type="text"
            placeholder="https://drive.google.com/... atau URL dokumen"
            value={url.startsWith('data:') ? '(Berkas Lokal Base64 Telah Dimuat)' : url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={url.startsWith('data:')}
            className="w-full bg-surface border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Notes & Uploader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-200 block mb-1">Catatan / Ringkasan Bukti</label>
          <input 
            type="text"
            placeholder="Keterangan singkat hasil verifikasi kegiatan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-200 block mb-1">Nama Pengunggah / Verifikator</label>
          <input 
            type="text"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            className="w-full bg-surface border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-900/30 transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Lampirkan Bukti Ini</span>
        </button>
      </div>
    </form>
  );
};

// =========================================================================
// Helper Component: StrategicItemForm (Modal Tambah / Edit Program)
// =========================================================================
interface StrategicItemFormProps {
  initialItem: StrategicItem | null;
  onSave: (item: Omit<StrategicItem, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const StrategicItemForm: React.FC<StrategicItemFormProps> = ({ initialItem, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<StrategicItem, 'id'> & { id?: string }>({
    category: initialItem?.category || 'Layanan & Mutu Klinis',
    program: initialItem?.program || '',
    kpi: initialItem?.kpi || '',
    pic: initialItem?.pic || 'Koordinator Tim Terapi',
    timeline: initialItem?.timeline || 'Q1 - Q2 2026',
    progress: initialItem?.progress || 0,
    status: initialItem?.status || 'Not Started',
    budget: initialItem?.budget || 15000000,
    notes: initialItem?.notes || '',
    artifacts: initialItem?.artifacts || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.program.trim()) {
      alert('Nama program kerja wajib diisi.');
      return;
    }
    if (!formData.kpi.trim()) {
      alert('Indikator (KPI) keberhasilan program wajib diisi.');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="font-bold text-slate-200 block mb-1">Bidang / Kategori Strategis *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          >
            {STRATEGIC_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* PIC */}
        <div>
          <label className="font-bold text-slate-200 block mb-1">Penanggung Jawab (PIC) *</label>
          <input 
            type="text"
            placeholder="Contoh: Kepala Terapis Okupasi"
            value={formData.pic}
            onChange={(e) => setFormData(prev => ({ ...prev, pic: e.target.value }))}
            className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      {/* Program Name */}
      <div>
        <label className="font-bold text-slate-200 block mb-1">Nama Program Kerja Strategis *</label>
        <textarea 
          rows={2}
          placeholder="Contoh: Revitalisasi Ruang Sensori Integrasi & Pengadaan Dynamic Suspended Equipment"
          value={formData.program}
          onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
          className="w-full bg-background border border-surface-light text-white text-sm font-semibold rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>

      {/* KPI */}
      <div>
        <label className="font-bold text-slate-200 block mb-1">Indikator Keberhasilan (KPI) Terukur *</label>
        <textarea 
          rows={2}
          placeholder="Contoh: Tersedianya 3 set platform ayunan terapeutik dan lolos uji beban aman terapis"
          value={formData.kpi}
          onChange={(e) => setFormData(prev => ({ ...prev, kpi: e.target.value }))}
          className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>

      {/* Timeline & Budget & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="font-bold text-slate-200 block mb-1">Waktu Pelaksanaan</label>
          <input 
            type="text"
            placeholder="Q1 2026 / Semester 1"
            value={formData.timeline}
            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
            className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-200 block mb-1">Alokasi Anggaran (IDR)</label>
          <input 
            type="number"
            value={formData.budget || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
            className="w-full bg-background border border-surface-light text-white font-mono rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-200 block mb-1">Status Eksekusi</label>
          <select
            value={formData.status}
            onChange={(e) => {
              const st = e.target.value as StrategicStatus;
              setFormData(prev => ({
                ...prev,
                status: st,
                progress: st === 'Done' ? 100 : (prev.progress === 100 ? 50 : prev.progress)
              }));
            }}
            className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
          >
            <option value="Not Started">Belum Dimulai</option>
            <option value="On Progress">Sedang Berjalan</option>
            <option value="Pending">Tertunda (Pending)</option>
            <option value="Done">Selesai (Done)</option>
          </select>
        </div>
      </div>

      {/* Progress Slider */}
      <div className="p-3.5 rounded-2xl bg-background/50 border border-surface-light space-y-2">
        <div className="flex items-center justify-between font-bold">
          <span className="text-white">Capaian Progress Realisasi:</span>
          <span className="font-mono text-purple-400 text-sm">{formData.progress}%</span>
        </div>
        <input 
          type="range"
          min="0"
          max="100"
          step="5"
          value={formData.progress}
          onChange={(e) => {
            const p = parseInt(e.target.value) || 0;
            const nextSt: StrategicStatus = p === 100 ? 'Done' : (p === 0 ? 'Not Started' : 'On Progress');
            setFormData(prev => ({ ...prev, progress: p, status: nextSt }));
          }}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="font-bold text-slate-200 block mb-1">Catatan Tambahan & Evaluasi Tim</label>
        <textarea 
          rows={2}
          placeholder="Catatan kendala, hasil rapat koordinasi, atau rekomendasi lanjutan..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full bg-background border border-surface-light text-white rounded-xl p-2.5 focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-light">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-surface-light text-slate-300 font-semibold hover:bg-surface-light/80 transition-all cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
        >
          {initialItem ? 'Simpan Perubahan' : 'Tambahkan Program'}
        </button>
      </div>
    </form>
  );
};

export default StrategicPlanPage;
