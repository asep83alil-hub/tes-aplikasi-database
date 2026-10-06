import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Check, 
  Download, 
  Upload, 
  HelpCircle, 
  Eye, 
  Layers, 
  Tag, 
  LayoutDashboard, 
  ShieldCheck, 
  BookOpen, 
  Settings, 
  Plus, 
  Trash2, 
  FileText,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  CalendarRange,
  Users,
  ClipboardCheck,
  ClipboardList,
  UserCog,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { View } from '../types';
import { 
  AppCustomTexts, 
  getStoredCustomTexts, 
  saveStoredCustomTexts, 
  resetCustomTextsToDefault, 
  DEFAULT_CUSTOM_TEXTS, 
  exportCustomTextsJSON, 
  importCustomTextsJSON 
} from '../utils/textCustomizationStorage';
import { appendActivityLog } from '../utils/rbacStorage';

interface TextCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
  onSaved?: (updatedTexts: AppCustomTexts) => void;
}

export const TextCustomizerModal: React.FC<TextCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentUserId = 'USR-MGR-01',
  currentUserName = 'Manager Nurul Aini',
  onSaved
}) => {
  const [formData, setFormData] = useState<AppCustomTexts>(() => getStoredCustomTexts());
  const [activeTab, setActiveTab] = useState<'menus' | 'branding' | 'dashboard' | 'modules' | 'dictionary' | 'backup'>('menus');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [newDictKey, setNewDictKey] = useState('');
  const [newDictValue, setNewDictValue] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getStoredCustomTexts());
      setHasChanges(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  if (!isOpen) return null;

  // Handle updates for nested fields
  const handleMenuLabelChange = (viewId: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      menuLabels: { ...prev.menuLabels, [viewId]: val }
    }));
    setHasChanges(true);
  };

  const handleMenuDescChange = (viewId: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      menuDescriptions: { ...prev.menuDescriptions, [viewId]: val }
    }));
    setHasChanges(true);
  };

  const handleGroupLabelChange = (groupId: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      menuGroupLabels: { ...prev.menuGroupLabels, [groupId]: val }
    }));
    setHasChanges(true);
  };

  const handleBrandingChange = (key: keyof AppCustomTexts['branding'], val: string) => {
    setFormData(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: val }
    }));
    setHasChanges(true);
  };

  const handleDashboardChange = (key: keyof AppCustomTexts['dashboard'], val: string) => {
    setFormData(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, [key]: val }
    }));
    setHasChanges(true);
  };

  const handleModulesChange = (key: keyof AppCustomTexts['modules'], val: string) => {
    setFormData(prev => ({
      ...prev,
      modules: { ...prev.modules, [key]: val }
    }));
    setHasChanges(true);
  };

  const handleRolesChange = (key: keyof AppCustomTexts['roles'], val: string) => {
    setFormData(prev => ({
      ...prev,
      roles: { ...prev.roles, [key]: val }
    }));
    setHasChanges(true);
  };

  const handleDictionaryChange = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      uiDictionary: { ...prev.uiDictionary, [key]: val }
    }));
    setHasChanges(true);
  };

  const handleDeleteDictionaryItem = (key: string) => {
    setFormData(prev => {
      const next = { ...prev.uiDictionary };
      delete next[key];
      return { ...prev, uiDictionary: next };
    });
    setHasChanges(true);
    showToast(`Entri teks "${key}" dihapus`, 'info');
  };

  const handleAddDictionaryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDictKey.trim() || !newDictValue.trim()) return;
    const cleanKey = newDictKey.trim().toLowerCase().replace(/\s+/g, '_');
    setFormData(prev => ({
      ...prev,
      uiDictionary: { ...prev.uiDictionary, [cleanKey]: newDictValue.trim() }
    }));
    setNewDictKey('');
    setNewDictValue('');
    setHasChanges(true);
    showToast(`Berhasil menambahkan entri "${cleanKey}"`, 'success');
  };

  // Reset single menu item to default
  const handleResetSingleMenu = (viewId: string) => {
    const defaultLabel = DEFAULT_CUSTOM_TEXTS.menuLabels[viewId];
    const defaultDesc = DEFAULT_CUSTOM_TEXTS.menuDescriptions[viewId];
    if (defaultLabel) {
      handleMenuLabelChange(viewId, defaultLabel);
    }
    if (defaultDesc) {
      handleMenuDescChange(viewId, defaultDesc);
    }
    showToast(`Menu "${viewId}" dikembalikan ke teks standar`, 'info');
  };

  // Save all custom texts
  const handleSaveAll = () => {
    saveStoredCustomTexts(formData, currentUserName);
    
    // Log activity
    appendActivityLog({
      userId: currentUserId,
      userName: currentUserName,
      userRole: 'manager',
      actionType: 'UPDATE',
      description: 'Manager memperbarui kustomisasi tulisan seluruh menu & aplikasi',
      target: 'Kustomisasi Teks Aplikasi'
    });

    setHasChanges(false);
    showToast('Semua perubahan tulisan menu & aplikasi berhasil disimpan!', 'success');
    if (onSaved) {
      onSaved(formData);
    }
  };

  // Reset all to system defaults
  const handleConfirmResetAll = () => {
    const defaultData = resetCustomTextsToDefault(currentUserName);
    setFormData(defaultData);
    setHasChanges(false);
    setIsResetConfirmOpen(false);

    appendActivityLog({
      userId: currentUserId,
      userName: currentUserName,
      userRole: 'manager',
      actionType: 'UPDATE',
      description: 'Manager mengembalikan semua tulisan aplikasi ke bawaan pabrik',
      target: 'Reset Teks Sistem'
    });

    showToast('Seluruh tulisan berhasil direset ke standar bawaan sistem!', 'info');
    if (onSaved) {
      onSaved(defaultData);
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const jsonStr = exportCustomTextsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kustomisasi_tulisan_pelangi360_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File backup kustomisasi tulisan berhasil diunduh', 'success');
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importCustomTextsJSON(content, currentUserName);
        if (success) {
          const reloaded = getStoredCustomTexts();
          setFormData(reloaded);
          setHasChanges(false);
          showToast('Data kustomisasi tulisan berhasil diimpor & diterapkan!', 'success');
          if (onSaved) onSaved(reloaded);
        } else {
          showToast('Format file JSON tidak valid. Pastikan file sesuai struktur.', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Grouped menu structure for Tab 1
  const MENU_SECTIONS = [
    {
      groupId: 'operasional',
      title: formData.menuGroupLabels.operasional || 'OPERASIONAL',
      icon: LayoutDashboard,
      color: 'text-indigo-400',
      items: [
        { id: 'dashboard', defaultName: 'Dasbor Utama', icon: LayoutDashboard },
        { id: 'registrasi', defaultName: 'Registrasi Calon Klien', icon: Users },
        { id: 'papanJadwal', defaultName: 'Jadwal Terapi', icon: CalendarRange },
        { id: 'rekapKehadiran', defaultName: 'Kehadiran Siswa', icon: ClipboardList },
        { id: 'manajemenAnak', defaultName: 'Manajemen Anak & Siswa', icon: Users },
        { id: 'programTerapi', defaultName: 'Program Terapi', icon: Layers },
        { id: 'bukuCatatanTerapi', defaultName: 'Buku Catatan Terapi (EMR)', icon: BookOpen },
        { id: 'rapot', defaultName: 'Rapor Terapi', icon: ClipboardList },
      ]
    },
    {
      groupId: 'assessment',
      title: formData.menuGroupLabels.assessment || 'ASSESSMENT',
      icon: ClipboardCheck,
      color: 'text-emerald-400',
      items: [
        { id: 'assesmentAnak', defaultName: 'Assessment Anak', icon: ClipboardCheck },
        { id: 'laporanAssesment', defaultName: 'Hasil Assessment', icon: FileText },
      ]
    },
    {
      groupId: 'sdm',
      title: formData.menuGroupLabels.sdm || 'SDM & TERAPIS',
      icon: UserCog,
      color: 'text-amber-400',
      items: [
        { id: 'manajemenTerapis', defaultName: 'Manajemen SDM Terapis', icon: UserCog },
      ]
    },
    {
      groupId: 'keuangan',
      title: formData.menuGroupLabels.keuangan || 'KEUANGAN & KASIR',
      icon: CreditCard,
      color: 'text-cyan-400',
      items: [
        { id: 'tagihan', defaultName: 'Tagihan & Invoice', icon: CreditCard },
        { id: 'laporanPemasukan', defaultName: 'Pembayaran Kasir', icon: Tag },
        { id: 'piutang', defaultName: 'Piutang & Tunggakan', icon: CreditCard },
        { id: 'laporanKeuangan', defaultName: 'Laporan Keuangan', icon: FileText },
      ]
    },
    {
      groupId: 'laporan',
      title: formData.menuGroupLabels.laporan || 'LAPORAN & STRATEGI',
      icon: BarChart3,
      color: 'text-purple-400',
      items: [
        { id: 'pusatLaporan', defaultName: 'Pusat Laporan & KPI', icon: BarChart3 },
        { id: 'balancedScorecard', defaultName: 'Balanced Scorecard', icon: Sliders },
        { id: 'strategicPlan', defaultName: 'Strategic Plan', icon: Sparkles },
      ]
    },
    {
      groupId: 'pengaturan',
      title: formData.menuGroupLabels.pengaturan || 'PENGATURAN SISTEM',
      icon: Settings,
      color: 'text-rose-400',
      items: [
        { id: 'manajemenPengguna', defaultName: 'Manajemen Pengguna', icon: Users },
        { id: 'rolePermission', defaultName: 'Manajemen Role & Hak Akses', icon: ShieldCheck },
        { id: 'pengaturan', defaultName: 'Pengaturan Sistem', icon: Settings },
      ]
    }
  ];

  // Filtered menus based on search
  const filteredMenuSections = useMemo(() => {
    if (!searchQuery.trim()) return MENU_SECTIONS;
    const q = searchQuery.toLowerCase();
    return MENU_SECTIONS.map(section => {
      const filteredItems = section.items.filter(item => {
        const customLabel = (formData.menuLabels[item.id] || '').toLowerCase();
        const defaultName = item.defaultName.toLowerCase();
        const customDesc = (formData.menuDescriptions[item.id] || '').toLowerCase();
        const id = item.id.toLowerCase();
        return customLabel.includes(q) || defaultName.includes(q) || customDesc.includes(q) || id.includes(q);
      });
      return { ...section, items: filteredItems };
    }).filter(s => s.items.length > 0 || s.title.toLowerCase().includes(q));
  }, [MENU_SECTIONS, searchQuery, formData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-3 animate-fade-in-up ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50' 
            : toastMessage.type === 'error'
            ? 'bg-rose-950/95 text-rose-200 border-rose-500/40 shadow-rose-950/50'
            : 'bg-indigo-950/95 text-indigo-200 border-indigo-500/40 shadow-indigo-950/50'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Modal Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Kustomisasi Tulisan & Menu Aplikasi
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Khusus Manager
                </span>
                {hasChanges && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    Ada Perubahan Belum Disimpan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kelola dan ubah seluruh tulisan pada menu navigasi, judul grup, identitas lembaga, istilah medis, dan teks antarmuka di seluruh aplikasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Tabs Navigation */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('menus')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'menus'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>1. Tulisan Setiap Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'branding'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>2. Branding & Identitas</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Dasbor & Statistik</span>
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'modules'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>4. Modul & Peran</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'dictionary'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>5. Kamus Teks Bebas</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'backup'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>6. Cadangan & Reset</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tulisan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar bg-slate-900/60">
          
          {/* TAB 1: MENU & NAVIGASI */}
          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-purple-300 block mb-0.5">Petunjuk Kustomisasi Menu:</span>
                  <span className="text-slate-300">
                    Anda dapat mengubah <strong>Judul Kategori (Grup Sidebar)</strong>, <strong>Nama Label Menu</strong>, serta <strong>Deskripsi Sub-menu</strong>. 
                    Semua perubahan yang disimpan akan langsung diterapkan pada Sidebar, Header Breadcrumb, dan Hak Akses Role di seluruh aplikasi secara otomatis.
                  </span>
                </div>
              </div>

              {filteredMenuSections.map(section => (
                <div key={section.groupId} className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  {/* Category Group Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                        Kategori Menu:
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="text-xs text-slate-400 font-medium shrink-0">Judul Grup:</label>
                      <input
                        type="text"
                        value={formData.menuGroupLabels[section.groupId] || ''}
                        onChange={(e) => handleGroupLabelChange(section.groupId, e.target.value)}
                        placeholder={section.title}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-purple-500 w-full sm:w-60"
                      />
                    </div>
                  </div>

                  {/* Items List in this Group */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {section.items.map(item => {
                      const ItemIcon = item.icon;
                      const currentLabel = formData.menuLabels[item.id] || item.defaultName;
                      const currentDesc = formData.menuDescriptions[item.id] || '';
                      const isEdited = currentLabel !== item.defaultName || currentDesc !== DEFAULT_CUSTOM_TEXTS.menuDescriptions[item.id];

                      return (
                        <div 
                          key={item.id} 
                          className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isEdited 
                              ? 'bg-purple-950/20 border-purple-500/30' 
                              : 'bg-slate-900/60 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-[200px]">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-200 truncate">{currentLabel}</span>
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                                  {item.id}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5">
                                Asli: {item.defaultName}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Tulisan Menu di Sidebar:
                              </label>
                              <input
                                type="text"
                                value={formData.menuLabels[item.id] || ''}
                                onChange={(e) => handleMenuLabelChange(item.id, e.target.value)}
                                placeholder={item.defaultName}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Keterangan / Sub-label Menu:
                              </label>
                              <input
                                type="text"
                                value={formData.menuDescriptions[item.id] || ''}
                                onChange={(e) => handleMenuDescChange(item.id, e.target.value)}
                                placeholder="Deskripsi ringkas fungsi menu..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          {isEdited && (
                            <button
                              onClick={() => handleResetSingleMenu(item.id)}
                              className="self-end md:self-center p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                              title="Kembalikan tulisan menu ini ke standar"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reset</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: BRANDING & IDENTITAS */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  Identitas Aplikasi & Sidebar Brand
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nama Utama Aplikasi (Brand Name):
                    </label>
                    <input
                      type="text"
                      value={formData.branding.appName}
                      onChange={(e) => handleBrandingChange('appName', e.target.value)}
                      placeholder="Contoh: Pelangi360"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Ditampilkan di header sidebar dan breadcrumb utama.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Badge Edisi Sistem (App Badge):
                    </label>
                    <input
                      type="text"
                      value={formData.branding.appBadge}
                      onChange={(e) => handleBrandingChange('appBadge', e.target.value)}
                      placeholder="Contoh: Enterprise / Pro / Ultimate"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-purple-400 font-extrabold focus:outline-none focus:border-purple-500 uppercase"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Badge kecil di samping nama aplikasi di sidebar.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Slogan / Sub-nama Aplikasi:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.appSubtitle}
                      onChange={(e) => handleBrandingChange('appSubtitle', e.target.value)}
                      placeholder="Contoh: Lazuardi Therapy & Growth Center"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nama Lembaga / Yayasan:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.institutionName}
                      onChange={(e) => handleBrandingChange('institutionName', e.target.value)}
                      placeholder="Contoh: Terapi Pelangi Lazuardi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Placeholder Kotak Pencarian Menu:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.headerSearchPlaceholder}
                      onChange={(e) => handleBrandingChange('headerSearchPlaceholder', e.target.value)}
                      placeholder="Contoh: Cari menu... (⌘K)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tulisan Tombol Keluar:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.logoutButtonText}
                      onChange={(e) => handleBrandingChange('logoutButtonText', e.target.value)}
                      placeholder="Contoh: Keluar Sesi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-rose-300 focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Login Page Custom Texts */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Tulisan di Halaman Login & Akses Masuk
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Judul Kartu Login (Branding Side):
                    </label>
                    <input
                      type="text"
                      value={formData.branding.loginTitle}
                      onChange={(e) => handleBrandingChange('loginTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Subjudul Kartu Login:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.loginSubtitle}
                      onChange={(e) => handleBrandingChange('loginSubtitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Ucapan Sambutan (Form Side):
                    </label>
                    <input
                      type="text"
                      value={formData.branding.loginWelcome}
                      onChange={(e) => handleBrandingChange('loginWelcome', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Teks Instruksi Login:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.loginInstruction}
                      onChange={(e) => handleBrandingChange('loginInstruction', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Teks Tombol Submit Login:
                    </label>
                    <input
                      type="text"
                      value={formData.branding.loginButtonText}
                      onChange={(e) => handleBrandingChange('loginButtonText', e.target.value)}
                      className="w-full sm:w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-indigo-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DASBOR & STATISTIK */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Judul & Ucapan di Halaman Dasbor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Judul Halaman Dasbor:
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.pageTitle}
                      onChange={(e) => handleDashboardChange('pageTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Judul Sambutan Pengguna:
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.greetingTitle}
                      onChange={(e) => handleDashboardChange('greetingTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Subjudul / Slogan Sambutan Dasbor:
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.greetingSubtitle}
                      onChange={(e) => handleDashboardChange('greetingSubtitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* KPI Cards Titles */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Label Kartu Indikator Metrik (KPI Cards)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      KPI 1: Siswa Aktif
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.kpiActivePatients}
                      onChange={(e) => handleDashboardChange('kpiActivePatients', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      KPI 2: Jadwal Sesi Hari Ini
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.kpiScheduledToday}
                      onChange={(e) => handleDashboardChange('kpiScheduledToday', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      KPI 3: Tingkat Kehadiran
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.kpiAttendanceRate}
                      onChange={(e) => handleDashboardChange('kpiAttendanceRate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      KPI 4: Tenaga Terapis Aktif
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.kpiActiveTherapists}
                      onChange={(e) => handleDashboardChange('kpiActiveTherapists', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      KPI 5: Estimasi Sesi Bulanan
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.kpiMonthlySessions}
                      onChange={(e) => handleDashboardChange('kpiMonthlySessions', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Judul Tabel Jadwal Hari Ini
                    </label>
                    <input
                      type="text"
                      value={formData.dashboard.todayScheduleHeader}
                      onChange={(e) => handleDashboardChange('todayScheduleHeader', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MODUL & PERAN */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              {/* Modules Header Titles */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Judul Halaman Modul Utama
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Buku Catatan Terapi (EMR):
                    </label>
                    <input
                      type="text"
                      value={formData.modules.emrNotebookTitle}
                      onChange={(e) => handleModulesChange('emrNotebookTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Program Terapi:
                    </label>
                    <input
                      type="text"
                      value={formData.modules.therapyProgramTitle}
                      onChange={(e) => handleModulesChange('therapyProgramTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Rapor Terapi:
                    </label>
                    <input
                      type="text"
                      value={formData.modules.rapotTitle}
                      onChange={(e) => handleModulesChange('rapotTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Assessment:
                    </label>
                    <input
                      type="text"
                      value={formData.modules.assessmentTitle}
                      onChange={(e) => handleModulesChange('assessmentTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Papan Jadwal:
                    </label>
                    <input
                      type="text"
                      value={formData.modules.scheduleTitle}
                      onChange={(e) => handleModulesChange('scheduleTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modul Tagihan & Keuangan:
                    </label>
                    <input
                      type="text"
                      value={formData.modules.billingTitle}
                      onChange={(e) => handleModulesChange('billingTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Role Names */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Nama Sebutan Role / Peran Pengguna di UI
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(formData.roles).map(([roleKey, roleName]) => (
                    <div key={roleKey}>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Role: {roleKey}
                      </label>
                      <input
                        type="text"
                        value={roleName}
                        onChange={(e) => handleRolesChange(roleKey as keyof AppCustomTexts['roles'], e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KAMUS TEKS BEBAS (UNIVERSAL DICTIONARY) */}
          {activeTab === 'dictionary' && (
            <div className="space-y-6">
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Sliders className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-indigo-300 block mb-0.5">Kamus Teks Lengkap Aplikasi:</span>
                  <span className="text-slate-300">
                    Halaman ini memuat kata kunci teks, tombol aksi, istilah, dan status dalam aplikasi. Anda dapat mengubah teks pengganti untuk setiap kata atau menambahkan kunci baru secara bebas.
                  </span>
                </div>
              </div>

              {/* Add New Dictionary Key Form */}
              <form onSubmit={handleAddDictionaryItem} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kunci Kata (Key ID):
                  </label>
                  <input
                    type="text"
                    value={newDictKey}
                    onChange={(e) => setNewDictKey(e.target.value)}
                    placeholder="Contoh: btn_save_profile / status_active"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Teks Tampilan Baru:
                  </label>
                  <input
                    type="text"
                    value={newDictValue}
                    onChange={(e) => setNewDictValue(e.target.value)}
                    placeholder="Contoh: Simpan Profil Siswa"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Entri</span>
                </button>
              </form>

              {/* Dictionary Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-4">Kunci ID (Key)</th>
                        <th className="py-2.5 px-4">Teks Tampilan</th>
                        <th className="py-2.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {Object.entries(formData.uiDictionary)
                        .filter(([key, val]) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q);
                        })
                        .map(([key, val]) => (
                          <tr key={key} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-2.5 px-4 font-mono text-[11px] text-indigo-300 align-middle">
                              {key}
                            </td>
                            <td className="py-2 px-4 align-middle">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleDictionaryChange(key, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                              />
                            </td>
                            <td className="py-2 px-4 text-right align-middle">
                              <button
                                onClick={() => handleDeleteDictionaryItem(key)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Hapus entri ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CADANGAN & RESET */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Export Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Ekspor Cadangan Tulisan (JSON)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Unduh file konfigurasi seluruh tulisan aplikasi yang telah Anda ubah untuk disimpan sebagai cadangan atau dipindahkan ke perangkat lain.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Impor Konfigurasi Tulisan (JSON)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Pulihkan atau terapkan konfigurasi teks dari file backup JSON yang telah Anda siapkan sebelumnya.
                    </p>
                  </div>
                  <label className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File JSON & Terapkan</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Default Card */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Kembalikan Semua Tulisan ke Standar Bawaan Pabrik</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Tindakan ini akan mereset seluruh nama menu navigasi, identitas branding, istilah, dan kamus teks kembali ke pengaturan awal sistem Pelangi360.
                  </p>
                </div>

                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset ke Bawaan</span>
                </button>
              </div>

              {/* Reset Confirmation Dialog */}
              {isResetConfirmOpen && (
                <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-2xl animate-fade-in-up space-y-3">
                  <p className="text-xs font-semibold text-rose-300">
                    Apakah Anda yakin ingin menghapus semua kustomisasi tulisan dan kembali ke teks awal sistem?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmResetAll}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Ya, Reset Sekarang
                    </button>
                    <button
                      onClick={() => setIsResetConfirmOpen(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Terakhir diperbarui: {new Date(formData.lastUpdated).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} oleh {formData.updatedBy || 'Manager'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Tutup
            </button>

            <button
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Tulisan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
