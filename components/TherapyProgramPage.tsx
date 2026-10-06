import React, { useState, useMemo, useEffect } from 'react';
import { Child, TherapyProgram, TherapyProgramItem, TherapyProgramCategory, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ClipboardList, 
  FileText, 
  ChevronRight,
  Printer, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Target, 
  Activity, 
  Table as TableIcon, 
  LayoutGrid, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronDown, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Copy,
  Check,
  Layers,
  Award,
  Filter,
  CheckSquare,
  BookOpen,
  Info,
  SlidersHorizontal,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OccupationalTherapyIcon from './icons/OccupationalTherapyIcon';
import SpeechTherapyIcon from './icons/SpeechTherapyIcon';
import PhysiotherapyIcon from './icons/PhysiotherapyIcon';
import RemedialIcon from './icons/RemedialIcon';
import HydrotherapyIcon from './icons/HydrotherapyIcon';
import EquineTherapyIcon from './icons/EquineTherapyIcon';
import { ProgramPrintPreviewModal } from './ProgramPrintPreviewModal';

export interface ProgressOptionConfig {
  value: string;
  label: string;
  badgeClass: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
}

export const PROGRESS_STATUSES: ProgressOptionConfig[] = [
  {
    value: 'Belum Tercapai',
    label: 'Belum Tercapai',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-900',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30'
  },
  {
    value: 'Dalam Proses',
    label: 'Dalam Proses',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-900',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30'
  },
  {
    value: 'Tercapai Sebagian',
    label: 'Tercapai Sebagian',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
    dotColor: 'bg-sky-500',
    textColor: 'text-sky-700 dark:text-sky-300',
    borderColor: 'border-sky-200 dark:border-sky-900',
    bgLight: 'bg-sky-50 dark:bg-sky-950/30'
  },
  {
    value: 'Tercapai',
    label: 'Tercapai',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30'
  },
  {
    value: 'Perlu Evaluasi',
    label: 'Perlu Evaluasi',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
    dotColor: 'bg-purple-500',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-900',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30'
  }
];

export const getProgressConfig = (progres?: string): ProgressOptionConfig => {
  if (!progres) return PROGRESS_STATUSES[1]; // default 'Dalam Proses'
  const found = PROGRESS_STATUSES.find(p => p.value.toLowerCase() === progres.toLowerCase());
  if (found) return found;
  
  const lower = progres.toLowerCase();
  if (lower.includes('belum')) return PROGRESS_STATUSES[0];
  if (lower.includes('sebagian') || lower.includes('berkembang') || lower.includes('50%') || lower.includes('60%') || lower.includes('75%')) return PROGRESS_STATUSES[2];
  if (lower.includes('tercapai') || lower.includes('100%') || lower.includes('selesai')) return PROGRESS_STATUSES[3];
  if (lower.includes('evaluasi') || lower.includes('tunda')) return PROGRESS_STATUSES[4];
  if (lower.includes('proses') || lower.includes('jalan')) return PROGRESS_STATUSES[1];

  return {
    value: progres,
    label: progres,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    bgLight: 'bg-slate-50 dark:bg-slate-800'
  };
};

const calculateAge = (birthDateString?: string): string => {
  if (!birthDateString) return '-';
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return '-';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  if (years <= 0) return `${months} Bulan`;
  return `${years} Thn ${months > 0 ? `${months} Bln` : ''}`.trim();
};

interface TherapyProgramPageProps {
  children: Child[];
  programs: TherapyProgram[];
  onSaveProgram: (program: TherapyProgram) => void;
  initialChildId?: string | null;
  initialCategory?: TherapyProgramCategory;
  onBackToNotebook?: () => void;
  userRole?: UserRole;
  logoUrl?: string;
}

const standardProgramTemplates: Record<string, Array<{ targetWaktu: string; targetTerapi: string; aktifitasTerapi: string; keterangan: string; progres?: string }>> = {
  OT: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Meningkatkan fokus dan atensi terarah mandiri selama 10-15 menit',
      aktifitasTerapi: 'Menyusun puzzle 3D bertingkat dan pasak geometri sembari meminimalisir distraksi lingkungan.',
      keterangan: 'Diberikan stimulasi proprioseptif dan deep pressure di awal sesi untuk modulasi sensori.',
      progres: 'Tercapai Sebagian'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Melatih motorik halus, koordinasi bilateral kedua tangan, dan kekuatan pegangan tripod',
      aktifitasTerapi: 'Meronce manik-manik kecil berurutan dan menggunting kertas mengikuti pola kurva/melingkar.',
      keterangan: 'Fokus pada pola grip pensil / gunting tipe dynamic tripod yang ergonomis.',
      progres: 'Dalam Proses'
    }
  ],
  TW: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Meningkatkan pemahaman kalimat instruksi kompleks 2-3 langkah (bahasa reseptif)',
      aktifitasTerapi: 'Mengikuti instruksi beruntun (ambil benda warna merah, letakkan di meja, lalu duduk di kursi).',
      keterangan: 'Gunakan gestur minimal untuk melatih proses pemrosesan verbal auditorial anak.',
      progres: 'Tercapai'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Meningkatkan perbendaharaan kata aktif (ekspresif) dan perumusan kalimat SPOK mandiri',
      aktifitasTerapi: 'Bermain tebak gambar aksi sosial / kartu kosakata ekspresif dengan perumusan kalimat utuh.',
      keterangan: 'Dorong komunikasi spontan dan pelafalan artikulasi vokal konsonan yang jelas.',
      progres: 'Dalam Proses'
    }
  ],
  FT: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Peningkatan kekuatan postural, stabilitas core, dan kontrol panggul saat duduk mandiri',
      aktifitasTerapi: 'Latihan merangkak di atas matras busa tidak rata dan mempertahankan posisi quadruped/plank.',
      keterangan: 'Jaga posisi panggul simetris agar tidak miring atau kompensasi ke satu sisi.',
      progres: 'Dalam Proses'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Melatih keseimbangan dinamis, koordinasi lokomotor, dan melompat rintangan terkontrol',
      aktifitasTerapi: 'Melompati rintangan busa lunak setinggi 5-10cm dan menyusuri titian balok keseimbangan.',
      keterangan: 'Fasilitasi bantuan fisik minimal pada panggul sesuai tingkat kemandirian anak.',
      progres: 'Belum Tercapai'
    }
  ],
  REM: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Pengenalan konsep matematika konkret dasar, kuantitas objek, dan simbol angka 1-10',
      aktifitasTerapi: 'Menghitung manik/buah miniatur dan mengelompokkan ke wadah angka bersangkutan.',
      keterangan: 'Gunakan media taktil konkret dan repetisi verbal terarah.',
      progres: 'Dalam Proses'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Diskriminasi visual huruf fonem mirip (b, d, p, q) dan kemampuan pra-membaca kata bersuku 2',
      aktifitasTerapi: 'Mewarnai dan melingkari gelembung huruf berpasangan dengan kartu panduan visual warna kontras.',
      keterangan: 'Gunakan penanda visual warna yang kontras untuk memperkuat memori visual.',
      progres: 'Belum Tercapai'
    }
  ],
  HT: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Adaptasi air hangat, desensitisasi percikan, dan kontrol pernapasan ritmis di kolam terapi',
      aktifitasTerapi: 'Meniup gelembung di permukaan air, desensitisasi percikan wajah, dan mengapung telentang (back float).',
      keterangan: 'Memanfaatkan suhu air hangat kolam terapi untuk menurunkan spastisitas dan ketegangan motorik.',
      progres: 'Dalam Proses'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Meningkatkan daya tahan kardio-respirasi, kekuatan core, dan koordinasi kayuhan tungkai di air',
      aktifitasTerapi: 'Gerakan kayuhan kaki bergantian (flutter kicks) dengan kickboard dan berjalan mandiri di air setinggi dada.',
      keterangan: 'Memanfaatkan daya apung air (buoyancy) untuk latihan koordinasi dinamis tanpa tekanan sendi.',
      progres: 'Belum Tercapai'
    }
  ],
  BERKUDA: [
    {
      targetWaktu: '3 Bulan',
      targetTerapi: 'Adaptasi perilaku, regulasi emosi, dan kepatuhan menggunakan perlengkapan berkuda',
      aktifitasTerapi: 'Mengenakan helm dan sabuk keselamatan mandiri, mendekati kuda dengan tenang, dan mounting santai.',
      keterangan: 'Didampingi oleh terapis bersertifikasi dan tim side-walker untuk menjamin keselamatan maksimal.',
      progres: 'Tercapai Sebagian'
    },
    {
      targetWaktu: '6 Bulan',
      targetTerapi: 'Meningkatkan postur duduk tegak simetris, stabilitas batang tubuh (trunk), dan modulasi sensorik',
      aktifitasTerapi: 'Mempertahankan postur tegak saat kuda melangkah santai, memegang kendali tali simetris, dan latihan memindahkan ring.',
      keterangan: 'Input ritmis 3 dimensi dari langkah kuda merangsang tonus postural, kesadaran tubuh, dan kontrol panggul.',
      progres: 'Dalam Proses'
    }
  ]
};

export const TherapyProgramPage: React.FC<TherapyProgramPageProps> = ({ 
  children, 
  programs, 
  onSaveProgram,
  initialChildId,
  initialCategory,
  onBackToNotebook,
  userRole,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png'
}) => {
  const isReadOnly = userRole === 'siswa';

  // Selection & Navigation State
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    initialChildId || (userRole === 'siswa' && children[0]?.id ? children[0].id : children[0]?.id || null)
  );

  useEffect(() => {
    if (userRole === 'siswa' && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [userRole, children, selectedChildId]);

  useEffect(() => {
    if (initialChildId) {
      setSelectedChildId(initialChildId);
      setSearchTerm('');
    }
  }, [initialChildId]);

  const [activeTab, setActiveTab] = useState<TherapyProgramCategory>(initialCategory || 'OT');

  useEffect(() => {
    if (initialCategory) {
      setActiveTab(initialCategory);
    }
  }, [initialCategory]);

  // View Mode: 'table' (Spreadsheet View) | 'cards' (Clinical Cards Grid)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'has_program' | 'need_program'>('all');

  // Editing & Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Print & PDF modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printAutoPrint, setPrintAutoPrint] = useState(false);
  const [printAutoDownload, setPrintAutoDownload] = useState(false);

  // New/Edited item state
  const [tempItem, setTempItem] = useState<TherapyProgramItem>({
    id: '',
    therapyType: 'OT',
    targetWaktu: '3 Bulan',
    targetTerapi: '',
    aktifitasTerapi: '',
    keterangan: '',
    progres: 'Dalam Proses'
  });

  const selectedChild = useMemo(() => 
    children.find(c => c.id === selectedChildId), 
  [children, selectedChildId]);

  const currentProgram = useMemo(() => 
    programs.find(p => p.childId === selectedChildId) || {
      id: `prog-${selectedChildId || 'default'}`,
      childId: selectedChildId || '',
      items: [],
      lastUpdated: new Date().toISOString()
    }, 
  [programs, selectedChildId]);

  // Categories Definition with professional clinical metadata
  const categories: { 
    id: TherapyProgramCategory; 
    label: string; 
    shortLabel: string;
    clinicalTag: string;
    color: string; 
    textColor: string;
    lightBg: string;
    borderColor: string;
    badgeClass: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { 
      id: 'OT', 
      label: 'Okupasi Terapi', 
      shortLabel: 'Okupasi',
      clinicalTag: 'Sensori Integrasi & Kemandirian',
      color: 'bg-teal-600', 
      textColor: 'text-teal-700 dark:text-teal-300',
      lightBg: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-200 dark:border-teal-800',
      badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
      description: 'Sensori integrasi, motorik halus, modulasi atensi, regulasi diri, dan aktivitas fungsional sehari-hari.',
      Icon: OccupationalTherapyIcon 
    },
    { 
      id: 'TW', 
      label: 'Terapi Wicara', 
      shortLabel: 'Wicara',
      clinicalTag: 'Bahasa, Artikulasi & Komunikasi',
      color: 'bg-violet-600', 
      textColor: 'text-violet-700 dark:text-violet-300',
      lightBg: 'bg-violet-50 dark:bg-violet-950/40',
      borderColor: 'border-violet-200 dark:border-violet-800',
      badgeClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
      description: 'Bahasa reseptif, ekspresif, artikulasi fonem, oral motor, dan komunikasi dua arah fungsional.',
      Icon: SpeechTherapyIcon 
    },
    { 
      id: 'FT', 
      label: 'Fisioterapi', 
      shortLabel: 'Fisioterapi',
      clinicalTag: 'Motorik Kasar & Stabilitas Postur',
      color: 'bg-amber-600', 
      textColor: 'text-amber-700 dark:text-amber-300',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-800',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      description: 'Motorik kasar, stabilitas core, tonus otot, keseimbangan dinamis, dan koreksi postur fungsional.',
      Icon: PhysiotherapyIcon 
    },
    { 
      id: 'REM', 
      label: 'Remedial', 
      shortLabel: 'Remedial',
      clinicalTag: 'Pra-Akademik & Kognitif',
      color: 'bg-pink-600', 
      textColor: 'text-pink-700 dark:text-pink-300',
      lightBg: 'bg-pink-50 dark:bg-pink-950/40',
      borderColor: 'border-pink-200 dark:border-pink-800',
      badgeClass: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20',
      description: 'Stimulasi pra-akademik, diskriminasi visual huruf mirip, konsep kuantitas angka, dan pemahaman teks.',
      Icon: RemedialIcon 
    },
    { 
      id: 'HT', 
      label: 'Hidroterapi', 
      shortLabel: 'Hidro',
      clinicalTag: 'Relaksasi Air & Kondisioning',
      color: 'bg-sky-600', 
      textColor: 'text-sky-700 dark:text-sky-300',
      lightBg: 'bg-sky-50 dark:bg-sky-950/40',
      borderColor: 'border-sky-200 dark:border-sky-800',
      badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
      description: 'Pemanfaatan suhu air hangat kolam terapi untuk relaksasi spastisitas, pernapasan, dan kayuhan tanpa beban sendi.',
      Icon: HydrotherapyIcon 
    },
    { 
      id: 'BERKUDA', 
      label: 'Terapi Berkuda', 
      shortLabel: 'Berkuda',
      clinicalTag: 'Hippotherapy & Keseimbangan 3D',
      color: 'bg-emerald-600', 
      textColor: 'text-emerald-700 dark:text-emerald-300',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      description: 'Stimulasi gerak ritmis 3 dimensi langkah kuda untuk penguatan panggul, kesadaran postural, dan modulasi emosi.',
      Icon: EquineTherapyIcon 
    },
  ];

  // Filtered children for the directory sidebar
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      const matchSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (child.className && child.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (child.parentName && child.parentName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchSearch) return false;

      if (studentStatusFilter === 'has_program') {
        const prog = programs.find(p => p.childId === child.id);
        return prog && prog.items && prog.items.length > 0;
      }
      if (studentStatusFilter === 'need_program') {
        const prog = programs.find(p => p.childId === child.id);
        return !prog || !prog.items || prog.items.length === 0;
      }
      return true;
    });
  }, [children, searchTerm, studentStatusFilter, programs]);

  // Filtered program items for the active category
  const filteredProgramItems = useMemo(() => {
    return currentProgram.items.filter(item => {
      if (activeTab === 'REM') {
        return item.therapyType === 'REM' || item.therapyType === 'REMEDIAL';
      }
      return item.therapyType === activeTab;
    });
  }, [currentProgram.items, activeTab]);

  // Overall program statistics for the selected child
  const stats = useMemo(() => {
    const totalItems = currentProgram.items.length;
    const tercapaiCount = currentProgram.items.filter(it => it.progres === 'Tercapai').length;
    const sebagianCount = currentProgram.items.filter(it => it.progres === 'Tercapai Sebagian').length;
    const prosesCount = currentProgram.items.filter(it => it.progres === 'Dalam Proses' || !it.progres).length;
    const belumCount = currentProgram.items.filter(it => it.progres === 'Belum Tercapai').length;
    const evaluasiCount = currentProgram.items.filter(it => it.progres === 'Perlu Evaluasi').length;

    const completionRate = totalItems > 0 ? Math.round(((tercapaiCount + sebagianCount * 0.5) / totalItems) * 100) : 0;

    return {
      totalItems,
      tercapaiCount,
      sebagianCount,
      prosesCount,
      belumCount,
      evaluasiCount,
      completionRate
    };
  }, [currentProgram.items]);

  // Handlers
  const handleAddItem = () => {
    if (isReadOnly) return;
    setEditingItemIndex(null);
    setFormError(null);
    setTempItem({
      id: `it-${Date.now()}`,
      therapyType: activeTab,
      targetWaktu: '3 Bulan',
      targetTerapi: '',
      aktifitasTerapi: '',
      keterangan: '',
      progres: 'Dalam Proses'
    });
    setIsEditing(true);
  };

  const handleEditItem = (id: string) => {
    if (isReadOnly) return;
    const itemIndex = currentProgram.items.findIndex(it => it.id === id);
    if (itemIndex === -1) return;
    setEditingItemIndex(itemIndex);
    setFormError(null);
    setTempItem({ 
      ...currentProgram.items[itemIndex],
      progres: currentProgram.items[itemIndex].progres || 'Dalam Proses'
    });
    setIsEditing(true);
  };

  const handleDuplicateItem = (id: string) => {
    if (isReadOnly) return;
    const item = currentProgram.items.find(it => it.id === id);
    if (!item) return;

    const duplicated: TherapyProgramItem = {
      ...item,
      id: `it-${Date.now()}`,
      targetTerapi: `${item.targetTerapi} (Salinan)`
    };

    onSaveProgram({
      ...currentProgram,
      items: [...currentProgram.items, duplicated],
      lastUpdated: new Date().toISOString()
    });
  };

  const handleDeleteItem = (id: string) => {
    if (isReadOnly) return;
    if (window.confirm('Hapus item program intervensi ini? Data yang terhapus tidak dapat dikembalikan.')) {
      const newItems = currentProgram.items.filter(it => it.id !== id);
      onSaveProgram({
        ...currentProgram,
        items: newItems,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleQuickChangeProgress = (itemId: string, newProgres: string) => {
    if (isReadOnly) return;
    const newItems = currentProgram.items.map(it => {
      if (it.id === itemId) {
        return { ...it, progres: newProgres };
      }
      return it;
    });
    onSaveProgram({
      ...currentProgram,
      items: newItems,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleSaveItem = () => {
    if (isReadOnly) return;
    if (!tempItem.targetTerapi.trim()) {
      setFormError('Target Terapi / Tujuan Intervensi wajib diisi.');
      return;
    }

    const newItems = [...currentProgram.items];
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = tempItem;
    } else {
      newItems.push(tempItem);
    }

    onSaveProgram({
      ...currentProgram,
      items: newItems,
      lastUpdated: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleLoadStandardTemplate = (categoryKey: TherapyProgramCategory) => {
    if (isReadOnly) return;
    const templates = standardProgramTemplates[categoryKey];
    if (!templates) return;

    if (filteredProgramItems.length > 0) {
      const confirmAdd = window.confirm(
        `Kategori ${categories.find(c => c.id === categoryKey)?.label} sudah memiliki ${filteredProgramItems.length} program. Apakah Anda ingin menambahkan template intervensi standar ke program yang sudah ada?`
      );
      if (!confirmAdd) return;
    }

    const newGeneratedItems: TherapyProgramItem[] = templates.map((t, idx) => ({
      id: `std-${categoryKey.toLowerCase()}-${Date.now()}-${idx + 1}`,
      therapyType: categoryKey,
      targetWaktu: t.targetWaktu,
      targetTerapi: t.targetTerapi,
      aktifitasTerapi: t.aktifitasTerapi,
      keterangan: t.keterangan,
      progres: t.progres || 'Dalam Proses'
    }));

    onSaveProgram({
      ...currentProgram,
      items: [...currentProgram.items, ...newGeneratedItems],
      lastUpdated: new Date().toISOString()
    });
  };

  const handleOpenPrintPreview = () => {
    setPrintAutoPrint(false);
    setPrintAutoDownload(false);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    setPrintAutoPrint(true);
    setPrintAutoDownload(false);
    setIsPrintModalOpen(true);
  };

  const handleDownloadPdf = () => {
    setPrintAutoPrint(false);
    setPrintAutoDownload(true);
    setIsPrintModalOpen(true);
  };

  const currentCat = categories.find(c => c.id === activeTab) || categories[0];
  const IconComp = currentCat.Icon;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* ================= TOP WORKSPACE HEADER ================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToNotebook && (
            <button 
              onClick={onBackToNotebook}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer group shrink-0"
              title="Kembali ke Buku Catatan Terapi"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Catatan Terapi</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  PROGRAM TERAPI INDIVIDUAL (IEP)
                </h1>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 hidden md:inline-flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  Rencana Intervensi Klinis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {selectedChild 
                  ? `Rencana kurikulum intervensi & capaian target untuk ${selectedChild.name}`
                  : 'Manajemen target waktu, kurikulum intervensi & evaluasi ketercapaian siswa'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        {selectedChild && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Tampilan Tabel Spreadsheet"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Tampilan Kartu Target Klinis"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Kartu</span>
              </button>
            </div>

            {/* Print & PDF Export Buttons */}
            <button 
              type="button"
              onClick={handleOpenPrintPreview}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer"
              title="Buka pratinjau lembar program format A4"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Pratinjau A4</span>
            </button>

            <button 
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
              title="Cetak langsung ke printer format A4"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button 
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-indigo-600/20 cursor-pointer active:scale-95"
              title="Unduh seluruh lembar program sebagai file PDF resmi"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>

            {!isReadOnly && (
              <button 
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Program</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ================= WORKSPACE BODY: SIDEBAR + CONTENT ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR: STUDENT DIRECTORY ================= */}
        {!isReadOnly && (
          <aside className="w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
            {/* Search and Filter */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari siswa atau kelas..."
                  className="w-full pl-9 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-slate-800 dark:text-white placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('all')}
                  className={`flex-1 py-1 rounded-md transition cursor-pointer text-center ${
                    studentStatusFilter === 'all' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Semua ({children.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('has_program')}
                  className={`flex-1 py-1 rounded-md transition cursor-pointer text-center ${
                    studentStatusFilter === 'has_program' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('need_program')}
                  className={`flex-1 py-1 rounded-md transition cursor-pointer text-center ${
                    studentStatusFilter === 'need_program' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Belum Ada
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredChildren.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <User className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-60" />
                  <p className="font-semibold">Tidak ada siswa ditemukan</p>
                  <p className="text-[11px] mt-0.5">Coba kata kunci pencarian lain.</p>
                </div>
              ) : (
                filteredChildren.map(child => {
                  const isSelected = selectedChildId === child.id;
                  const childProgram = programs.find(p => p.childId === child.id);
                  const itemCount = childProgram?.items?.length || 0;
                  const completedCount = childProgram?.items?.filter(it => it.progres === 'Tercapai').length || 0;
                  const completionPercentage = itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;

                  return (
                    <button
                      key={child.id}
                      onClick={() => { 
                        setSelectedChildId(child.id); 
                        setIsEditing(false); 
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left cursor-pointer border ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 shadow-xs' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {child.photoUrl ? (
                          <img 
                            src={child.photoUrl} 
                            alt={child.name} 
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center select-none">
                            {child.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        {itemCount > 0 && (
                          <span 
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" 
                            title={`${itemCount} program aktif`}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate leading-tight">
                            {child.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {child.className || 'Reguler'}
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            {itemCount} Target
                          </span>
                          {itemCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                                {completionPercentage}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                        isSelected ? 'translate-x-0 text-indigo-600 dark:text-indigo-400 font-bold' : '-translate-x-1 opacity-0'
                      }`} />
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {!selectedChild ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pilih Siswa Terlebih Dahulu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Pilih salah satu siswa dari direktori di samping untuk melihat rekam rencana intervensi, kurikulum terapi, dan progres capaian.
              </p>
            </div>
          ) : (
            <>
              {/* ================= 1. PATIENT / STUDENT CLINICAL BANNER ================= */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left: Identity snapshot */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="relative shrink-0">
                      {selectedChild.photoUrl ? (
                        <img 
                          src={selectedChild.photoUrl} 
                          alt={selectedChild.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center ring-2 ring-indigo-500/20 shadow-md">
                          {selectedChild.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-mono">
                          RM: {selectedChild.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          Kelas: {selectedChild.className || 'Reguler'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {selectedChild.status || 'Aktif'}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                        {selectedChild.name}
                      </h2>

                      {/* Clean unboxed metadata with separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>{selectedChild.gender || 'Laki-Laki'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Usia: <strong>{calculateAge(selectedChild.birthDate)}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Wali: {selectedChild.motherName || selectedChild.parentName || 'Keluarga'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantitative Outcome Metrics */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between min-w-[280px]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Tingkat Ketercapaian Target
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm tabular-nums">
                        {stats.completionRate}%
                      </span>
                    </div>

                    {/* Multi-segmented Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${stats.totalItems > 0 ? (stats.tercapaiCount / stats.totalItems) * 100 : 0}%` }}
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        title={`Tercapai: ${stats.tercapaiCount}`}
                      />
                      <div 
                        style={{ width: `${stats.totalItems > 0 ? (stats.sebagianCount / stats.totalItems) * 100 : 0}%` }}
                        className="bg-sky-500 h-full transition-all duration-500" 
                        title={`Sebagian: ${stats.sebagianCount}`}
                      />
                      <div 
                        style={{ width: `${stats.totalItems > 0 ? (stats.prosesCount / stats.totalItems) * 100 : 0}%` }}
                        className="bg-amber-500 h-full transition-all duration-500" 
                        title={`Dalam Proses: ${stats.prosesCount}`}
                      />
                      <div 
                        style={{ width: `${stats.totalItems > 0 ? (stats.belumCount / stats.totalItems) * 100 : 0}%` }}
                        className="bg-rose-500 h-full transition-all duration-500" 
                        title={`Belum Tercapai: ${stats.belumCount}`}
                      />
                    </div>

                    {/* Breakdown counts */}
                    <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-mono tabular-nums">{stats.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Tercapai</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{stats.tercapaiCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block">Proses</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">{stats.prosesCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Belum</span>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums">{stats.belumCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ================= 2. CLINICAL DISCIPLINE TABS ================= */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl">
                {categories.map((cat) => {
                  const CatIcon = cat.Icon;
                  const count = currentProgram.items.filter(it => 
                    cat.id === 'REM' 
                      ? (it.therapyType === 'REM' || it.therapyType === 'REMEDIAL')
                      : it.therapyType === cat.id
                  ).length;
                  const isActive = activeTab === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveTab(cat.id)}
                      className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                        isActive 
                          ? `${cat.color} text-white shadow-md shadow-slate-900/10` 
                          : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white shadow-2xs'
                      }`}
                    >
                      <CatIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.shortLabel}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ================= 3. DISCIPLINE BANNER & CONTROLS ================= */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl text-white ${currentCat.color} shadow-sm shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {currentCat.label}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {currentCat.clinicalTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {currentCat.description}
                    </p>
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-2 shrink-0">
                    {standardProgramTemplates[activeTab] && (
                      <button
                        type="button"
                        onClick={() => handleLoadStandardTemplate(activeTab)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl font-bold text-xs transition cursor-pointer"
                        title="Muat target & aktivitas standar untuk kategori ini"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Template Standar</span>
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Target Baru</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ================= 4. CONTENT VIEW (TABLE OR CARDS) ================= */}
              {filteredProgramItems.length === 0 ? (
                /* Empty state */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-slate-400 dark:text-slate-500">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white">
                      Belum Ada Rencana Program {currentCat.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
                      Susun target jangka pendek / panjang khusus intervensi {currentCat.label.toLowerCase()} untuk {selectedChild.name}. Anda juga dapat memuat kurikulum standar siap pakai.
                    </p>
                    
                    {!isReadOnly && (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Buat Target Pertama</span>
                        </button>

                        {standardProgramTemplates[activeTab] && (
                          <button
                            type="button"
                            onClick={() => handleLoadStandardTemplate(activeTab)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl font-bold text-xs transition cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Gunakan Template Standar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                /* ================= SPREADSHEET TABLE VIEW ================= */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-200 uppercase tracking-wider text-[11px] font-black border-b border-slate-800">
                          <th className="px-4 py-3.5 w-12 text-center">#</th>
                          <th className="px-4 py-3.5 min-w-[220px]">Target Terapi (Goal)</th>
                          <th className="px-4 py-3.5 w-36">Jangka Waktu</th>
                          <th className="px-4 py-3.5 min-w-[260px]">Rencana Aktivitas & Media Stimulasi</th>
                          <th className="px-4 py-3.5 w-44 text-center">Status Capaian</th>
                          <th className="px-4 py-3.5 min-w-[180px]">Catatan Klinis</th>
                          {!isReadOnly && <th className="px-4 py-3.5 w-24 text-center">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredProgramItems.map((item, idx) => {
                          const progressCfg = getProgressConfig(item.progres);

                          return (
                            <tr 
                              key={item.id} 
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                            >
                              {/* Row Index */}
                              <td className="px-4 py-3.5 text-center text-slate-400 font-mono font-bold bg-slate-50/40 dark:bg-slate-800/20">
                                {idx + 1}
                              </td>

                              {/* Target Terapi */}
                              <td className="px-4 py-3.5">
                                <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                  {item.targetTerapi || '-'}
                                </p>
                              </td>

                              {/* Target Waktu */}
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold text-[11px]">
                                  <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span>{item.targetWaktu || '3 Bulan'}</span>
                                </span>
                              </td>

                              {/* Aktivitas Terapi */}
                              <td className="px-4 py-3.5">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                  {item.aktifitasTerapi || '-'}
                                </p>
                              </td>

                              {/* Status Progres Dropdown */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                {isReadOnly ? (
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold ${progressCfg.badgeClass}`}>
                                    <span className={`w-2 h-2 rounded-full ${progressCfg.dotColor} shrink-0`} />
                                    <span>{progressCfg.label}</span>
                                  </div>
                                ) : (
                                  <div className="relative inline-block text-left">
                                    <select
                                      value={item.progres || 'Dalam Proses'}
                                      onChange={(e) => handleQuickChangeProgress(item.id, e.target.value)}
                                      className={`appearance-none inline-flex items-center pl-6 pr-7 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition shadow-2xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none ${progressCfg.badgeClass}`}
                                      title="Pilih status progres"
                                    >
                                      {PROGRESS_STATUSES.map(st => (
                                        <option key={st.value} value={st.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium py-1">
                                          {st.label}
                                        </option>
                                      ))}
                                    </select>
                                    <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${progressCfg.dotColor} pointer-events-none`} />
                                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
                                  </div>
                                )}
                              </td>

                              {/* Catatan Tambahan */}
                              <td className="px-4 py-3.5">
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                                  {item.keterangan || '-'}
                                </p>
                              </td>

                              {/* Actions */}
                              {!isReadOnly && (
                                <td className="px-4 py-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      type="button"
                                      onClick={() => handleEditItem(item.id)}
                                      className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                      title="Edit target program"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleDuplicateItem(item.id)}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                      title="Duplikasi target"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                      title="Hapus target"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ================= CLINICAL GOAL CARDS VIEW ================= */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProgramItems.map((item, idx) => {
                    const progressCfg = getProgressConfig(item.progres);

                    return (
                      <div 
                        key={item.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Card Top Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                                #{idx + 1}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {item.targetWaktu || '3 Bulan'}
                              </span>
                            </div>

                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${progressCfg.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${progressCfg.dotColor}`} />
                              <span>{progressCfg.label}</span>
                            </span>
                          </div>

                          {/* Target Statement */}
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                              Target Terapi & Capaian:
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug mt-0.5">
                              {item.targetTerapi}
                            </h4>
                          </div>

                          {/* Aktivitas */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Rencana Aktivitas & Media:
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {item.aktifitasTerapi || '-'}
                            </p>
                          </div>

                          {/* Catatan */}
                          {item.keterangan && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic flex items-start gap-1.5">
                              <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span>{item.keterangan}</span>
                            </p>
                          )}
                        </div>

                        {/* Card Bottom Controls */}
                        {!isReadOnly && (
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            {/* Quick status selector */}
                            <select
                              value={item.progres || 'Dalam Proses'}
                              onChange={(e) => handleQuickChangeProgress(item.id, e.target.value)}
                              className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              {PROGRESS_STATUSES.map(st => (
                                <option key={st.value} value={st.value}>{st.label}</option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditItem(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Duplikasi"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ================= PROGRAM EDITOR MODAL ================= */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                    <ClipboardList className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">
                      {editingItemIndex !== null ? 'Edit Target Program Intervensi' : 'Formulir Target Program Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Siswa: <strong className="text-white">{selectedChild?.name}</strong>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Row 1: Kategori & Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Disiplin Terapi <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-bold text-slate-800 dark:text-white cursor-pointer"
                      value={tempItem.therapyType}
                      onChange={(e) => setTempItem({ ...tempItem, therapyType: e.target.value as TherapyProgramCategory })}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label} ({cat.shortLabel})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Target Jangka Waktu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-bold text-slate-800 dark:text-white"
                        value={tempItem.targetWaktu}
                        onChange={(e) => setTempItem({ ...tempItem, targetWaktu: e.target.value })}
                        placeholder="Contoh: 3 Bulan / 6 Bulan / 1 Semester"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Target Terapi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Target Terapi / Tujuan Intervensi (Goal) <span className="text-rose-500">*</span>
                    </label>
                    {standardProgramTemplates[tempItem.therapyType] && !tempItem.targetTerapi && (
                      <button
                        type="button"
                        onClick={() => {
                          const t = standardProgramTemplates[tempItem.therapyType][0];
                          if (t) {
                            setTempItem({
                              ...tempItem,
                              targetWaktu: tempItem.targetWaktu || t.targetWaktu,
                              targetTerapi: t.targetTerapi,
                              aktifitasTerapi: tempItem.aktifitasTerapi || t.aktifitasTerapi,
                              keterangan: tempItem.keterangan || t.keterangan
                            });
                          }
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Gunakan Contoh Template
                      </button>
                    )}
                  </div>
                  <textarea 
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-slate-800 dark:text-white leading-relaxed"
                    value={tempItem.targetTerapi}
                    onChange={(e) => {
                      setTempItem({ ...tempItem, targetTerapi: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    placeholder="Contoh: Meningkatkan kemampuan atensi mandiri, modulasi sensori, atau kekuatan motorik..."
                  />
                </div>

                {/* Row 3: Aktivitas Terapi */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Rencana Aktivitas & Media Stimulasi Terapi
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-slate-800 dark:text-white leading-relaxed"
                    value={tempItem.aktifitasTerapi}
                    onChange={(e) => setTempItem({ ...tempItem, aktifitasTerapi: e.target.value })}
                    placeholder="Contoh rincian media: Puzzle 3D, titian balok, kartu flashcard, papan pelampung..."
                  />
                </div>

                {/* Row 4: Status Capaian */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Status Progres Capaian
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROGRESS_STATUSES.map(st => {
                      const isSelected = (tempItem.progres || 'Dalam Proses') === st.value;
                      return (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setTempItem({ ...tempItem, progres: st.value })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                            isSelected 
                              ? `${st.badgeClass} ring-2 ring-indigo-500/30 shadow-xs font-black` 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${st.dotColor} shrink-0`} />
                          <span className="truncate">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 5: Catatan Tambahan */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Catatan Klinis & Evaluasi Berkala
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-slate-800 dark:text-white"
                    value={tempItem.keterangan}
                    onChange={(e) => setTempItem({ ...tempItem, keterangan: e.target.value })}
                    placeholder="Contoh: Evaluasi berkala setiap akhir bulan, modulasi di awal sesi..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleSaveItem}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Rencana Program</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= PROGRAM A4 PRINT & PDF PREVIEW MODAL ================= */}
      <ProgramPrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintAutoPrint(false);
          setPrintAutoDownload(false);
        }}
        child={selectedChild}
        items={currentProgram.items}
        categories={categories}
        activeCategory={activeTab}
        autoPrint={printAutoPrint}
        autoDownloadPdf={printAutoDownload}
        logoUrl={logoUrl}
      />
    </div>
  );
};

export default TherapyProgramPage;
