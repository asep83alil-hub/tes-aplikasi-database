import React, { useState, useEffect, useMemo } from 'react';
import { View, UserRole } from '../types';
import { 
  getStoredMenuCustomizations, 
  saveStoredMenuCustomizations, 
  resetMenuCustomizationsToDefault,
  MenuCustomizationConfig,
  DEFAULT_GROUPS,
  DEFAULT_MENU_LABELS,
  DEFAULT_IN_MENU_TEXTS
} from '../utils/menuCustomizationStorage';
import { 
  Sliders, 
  Type, 
  Layers, 
  Search, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Upload, 
  RefreshCw, 
  ChevronRight, 
  Eye, 
  CornerDownRight, 
  Plus, 
  Trash2, 
  Info,
  Check,
  FileSpreadsheet,
  ArrowRightLeft
} from 'lucide-react';
import EditMenuIcon from './icons/EditMenuIcon';

interface EditMenuPageProps {
  userRole?: UserRole;
  onNavigate?: (view: View) => void;
  logoUrl?: string;
  onConfigUpdated?: (config: MenuCustomizationConfig) => void;
}

export const EditMenuPage: React.FC<EditMenuPageProps> = ({
  userRole = 'manager',
  onNavigate,
  logoUrl,
  onConfigUpdated
}) => {
  // Strict Manager-Only Security Check
  const isManager = userRole === 'manager';

  const [config, setConfig] = useState<MenuCustomizationConfig>(getStoredMenuCustomizations());
  const [activeTab, setActiveTab] = useState<'menuSidebar' | 'insideMenu' | 'findReplace' | 'backup'>('menuSidebar');
  const [selectedViewForInsideText, setSelectedViewForInsideText] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Find & Replace state
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [replaceCountPreview, setReplaceCountPreview] = useState<number | null>(null);

  // New custom text key state for insideMenu tab
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isAddingNewKey, setIsAddingNewKey] = useState(false);

  // Listen to external storage sync if updated
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
      }
    };
    window.addEventListener('pelangi360_menu_customization_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_menu_customization_updated', handleUpdate);
  }, []);

  const triggerNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 3500);
  };

  const handleSaveAll = (customConfig?: MenuCustomizationConfig) => {
    const toSave = customConfig || config;
    saveStoredMenuCustomizations(toSave);
    setConfig(toSave);
    if (onConfigUpdated) {
      onConfigUpdated(toSave);
    }
    triggerNotification('Semua perubahan menu dan teks berhasil disimpan ke sistem!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset SEMUA nama menu dan teks tulisan ke pengaturan awal (bawaan pabrik)?')) {
      const def = resetMenuCustomizationsToDefault();
      setConfig(def);
      if (onConfigUpdated) {
        onConfigUpdated(def);
      }
      triggerNotification('Semua menu dan teks telah dikembalikan ke bawaan sistem.');
    }
  };

  // Update Brand
  const handleBrandChange = (field: 'appTitle' | 'appSubtitle' | 'badgeText', val: string) => {
    const updated: MenuCustomizationConfig = {
      ...config,
      brand: {
        ...config.brand,
        [field]: val
      }
    };
    setConfig(updated);
  };

  // Update Group label
  const handleGroupChange = (groupId: string, val: string) => {
    const updated: MenuCustomizationConfig = {
      ...config,
      groups: {
        ...config.groups,
        [groupId]: val
      }
    };
    setConfig(updated);
  };

  // Update Menu label
  const handleMenuLabelChange = (menuId: View, val: string) => {
    const updated: MenuCustomizationConfig = {
      ...config,
      menuLabels: {
        ...config.menuLabels,
        [menuId]: val
      }
    };
    setConfig(updated);
  };

  // Reset single menu label
  const handleResetSingleMenuLabel = (menuId: View) => {
    const def = DEFAULT_MENU_LABELS[menuId] || menuId;
    handleMenuLabelChange(menuId, def);
  };

  // Update Inside-menu text
  const handleInsideTextChange = (viewId: View, textKey: string, val: string) => {
    const currentViewTexts = config.inMenuTexts[viewId] || {};
    const currentItem = currentViewTexts[textKey] || {
      label: textKey,
      defaultValue: val,
      category: 'other'
    };

    const updated: MenuCustomizationConfig = {
      ...config,
      inMenuTexts: {
        ...config.inMenuTexts,
        [viewId]: {
          ...currentViewTexts,
          [textKey]: {
            ...currentItem,
            value: val
          }
        }
      }
    };
    setConfig(updated);
  };

  // Reset single inside text
  const handleResetSingleInsideText = (viewId: View, textKey: string) => {
    const defaultVal = DEFAULT_IN_MENU_TEXTS[viewId]?.[textKey]?.defaultValue || '';
    handleInsideTextChange(viewId, textKey, defaultVal);
  };

  // Add new custom key to insideMenu
  const handleAddNewKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) return;
    const sanitizedKey = newKeyName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    const currentViewTexts = config.inMenuTexts[selectedViewForInsideText] || {};

    const updated: MenuCustomizationConfig = {
      ...config,
      inMenuTexts: {
        ...config.inMenuTexts,
        [selectedViewForInsideText]: {
          ...currentViewTexts,
          [sanitizedKey]: {
            label: newKeyLabel.trim() || sanitizedKey,
            value: newKeyValue.trim(),
            defaultValue: newKeyValue.trim(),
            category: 'other'
          }
        }
      }
    };
    setConfig(updated);
    setNewKeyName('');
    setNewKeyLabel('');
    setNewKeyValue('');
    setIsAddingNewKey(false);
    triggerNotification(`Label kustom '${sanitizedKey}' berhasil ditambahkan.`);
  };

  // Delete custom key
  const handleDeleteKey = (viewId: View, textKey: string) => {
    const currentViewTexts = { ...(config.inMenuTexts[viewId] || {}) };
    delete currentViewTexts[textKey];
    const updated: MenuCustomizationConfig = {
      ...config,
      inMenuTexts: {
        ...config.inMenuTexts,
        [viewId]: currentViewTexts
      }
    };
    setConfig(updated);
    triggerNotification(`Label '${textKey}' berhasil dihapus.`);
  };

  // Calculate Find & Replace occurrences
  useEffect(() => {
    if (!findWord.trim()) {
      setReplaceCountPreview(null);
      return;
    }
    const regex = new RegExp(findWord, 'gi');
    let count = 0;

    // Check menu labels
    Object.values(config.menuLabels).forEach((lbl) => {
      const str = String(lbl || '');
      const matches = str.match(regex);
      if (matches) count += matches.length;
    });

    // Check groups
    Object.values(config.groups).forEach((grp) => {
      const str = String(grp || '');
      const matches = str.match(regex);
      if (matches) count += matches.length;
    });

    // Check inMenuTexts
    Object.values(config.inMenuTexts).forEach(viewObj => {
      if (viewObj) {
        Object.values(viewObj).forEach((item: any) => {
          const str = String(item?.value || '');
          const matches = str.match(regex);
          if (matches) count += matches.length;
        });
      }
    });

    setReplaceCountPreview(count);
  }, [findWord, config]);

  // Execute Global Find & Replace
  const handleExecuteReplace = () => {
    if (!findWord.trim()) return;
    const regex = new RegExp(findWord, 'gi');

    // 1. Clone config
    const newConfig = JSON.parse(JSON.stringify(config)) as MenuCustomizationConfig;

    // Replace in brand
    newConfig.brand.appTitle = newConfig.brand.appTitle.replace(regex, replaceWord);
    newConfig.brand.appSubtitle = newConfig.brand.appSubtitle.replace(regex, replaceWord);

    // Replace in groups
    Object.keys(newConfig.groups).forEach(g => {
      newConfig.groups[g] = newConfig.groups[g].replace(regex, replaceWord);
    });

    // Replace in menu labels
    Object.keys(newConfig.menuLabels).forEach(m => {
      const viewKey = m as View;
      if (newConfig.menuLabels[viewKey]) {
        newConfig.menuLabels[viewKey] = newConfig.menuLabels[viewKey]!.replace(regex, replaceWord);
      }
    });

    // Replace in inMenuTexts
    Object.keys(newConfig.inMenuTexts).forEach(v => {
      const viewKey = v as View;
      const texts = newConfig.inMenuTexts[viewKey];
      if (texts) {
        Object.keys(texts).forEach(k => {
          if (texts[k]?.value) {
            texts[k].value = texts[k].value.replace(regex, replaceWord);
          }
        });
      }
    });

    handleSaveAll(newConfig);
    setFindWord('');
    setReplaceWord('');
    setReplaceCountPreview(null);
    triggerNotification(`Berhasil mengganti kata "${findWord}" dengan "${replaceWord}" di seluruh menu dan teks!`);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pelangi360_menu_customizations_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          handleSaveAll(parsed);
          triggerNotification('Konfigurasi menu dan teks berhasil diimpor!');
        }
      } catch (err) {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If not manager, render strict access denied
  if (!isManager) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto my-12">
        <div className="bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Akses Dibatasi
          </span>
          <h2 className="text-2xl font-black text-white mt-3 mb-2">
            Akses Khusus Akun Manager
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
            Menu <strong>Edit Menu & Teks</strong> hanya dapat diakses oleh akun dengan role <strong>Manager</strong> untuk menjaga integritas standarisasi tata kelola nama menu dan isi sistem.
          </p>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left text-xs text-slate-400 mb-6 space-y-1">
            <div className="flex justify-between">
              <span>Peran Akun Anda Saat Ini:</span>
              <span className="font-bold text-amber-400 uppercase">{userRole || 'Tidak Teridentifikasi'}</span>
            </div>
            <div className="flex justify-between">
              <span>Kredensial Dibutuhkan:</span>
              <span className="font-bold text-purple-400">Manager (manager@lazuardi.sch.id)</span>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Kembali ke Dasbor Utama
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filtered menu items for Tab 1
  const menuEntries = useMemo(() => {
    const list = Object.entries(DEFAULT_MENU_LABELS).map(([key, defaultLabel]) => {
      const currentLabel = config.menuLabels[key as View] || defaultLabel;
      return {
        id: key as View,
        defaultLabel,
        currentLabel
      };
    });

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.id.toLowerCase().includes(q) || 
      item.defaultLabel.toLowerCase().includes(q) || 
      item.currentLabel.toLowerCase().includes(q)
    );
  }, [config.menuLabels, searchQuery]);

  // Current inside menu texts for Tab 2
  const currentInsideTexts = config.inMenuTexts[selectedViewForInsideText] || {};
  const currentInsideTextList = Object.entries(currentInsideTexts);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {saveSuccessNotice && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-bold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Otoritas Eksklusif Manager
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Sinkronisasi Real-Time
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 shadow-md">
                <EditMenuIcon className="w-7 h-7" />
              </span>
              Kustomisasi Menu & Teks Seluruh Sistem
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ubah semua nama menu navigasi sidebar, judul kategori menu, dan seluruh teks tulisan yang ada di dalam setiap halaman aplikasi. Semua perubahan tersimpan permanen dan langsung diperbarui untuk semua pengguna.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleSaveAll()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Perubahan
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset ke Bawaan Sistem"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Bawaan
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-5 border-t border-purple-500/20 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('menuSidebar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'menuSidebar'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Edit Tulisan Menu (Sidebar & Kategori)</span>
          </button>

          <button
            onClick={() => setActiveTab('insideMenu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'insideMenu'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>2. Edit Tulisan di Dalam Menu (Semua Halaman)</span>
          </button>

          <button
            onClick={() => setActiveTab('findReplace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'findReplace'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>3. Cari & Ganti Kata Serentak</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>4. Ekspor / Impor JSON</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDIT TULISAN MENU (SIDEBAR & KATEGORI) */}
      {/* ========================================================================= */}
      {activeTab === 'menuSidebar' && (
        <div className="space-y-6">
          {/* Section: Identitas Aplikasi & Brand Header */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Identitas Brand & Header Sidebar
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah teks judul aplikasi, lencana edisi, dan sub-judul yang terpampang di bagian atas sidebar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Aplikasi Utama
                </label>
                <input
                  type="text"
                  value={config.brand.appTitle}
                  onChange={(e) => handleBrandChange('appTitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                  placeholder="Pelangi360"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Teks Lencana (Badge)
                </label>
                <input
                  type="text"
                  value={config.brand.badgeText}
                  onChange={(e) => handleBrandChange('badgeText', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                  placeholder="Enterprise"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sub-Judul Instansi
                </label>
                <input
                  type="text"
                  value={config.brand.appSubtitle}
                  onChange={(e) => handleBrandChange('appSubtitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                  placeholder="Lazuardi Therapy & Growth Center"
                />
              </div>
            </div>
          </div>

          {/* Section: Judul Grup / Kategori Menu */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Judul Kategori / Grup Menu Sidebar
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah tulisan header pengelompokan menu (OPERASIONAL, ASSESSMENT, SDM, KEUANGAN, LAPORAN, PENGATURAN).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_GROUPS.map((grp) => {
                const currentVal = config.groups[grp.id] || grp.defaultLabel;
                const isModified = currentVal !== grp.defaultLabel;

                return (
                  <div key={grp.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Grup ID: <code className="text-indigo-400">{grp.id}</code>
                      </span>
                      {isModified && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Diubah
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleGroupChange(grp.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase tracking-wider outline-none transition"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Bawaan: {grp.defaultLabel}</span>
                      {isModified && (
                        <button
                          onClick={() => handleGroupChange(grp.id, grp.defaultLabel)}
                          className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Daftar Semua Label Menu Navigasi */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Daftar Tulisan Semua Menu Navigasi ({menuEntries.length} Menu)
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah tulisan label tombol menu yang tampil di sidebar navigasi.
                </p>
              </div>

              {/* Search Menu Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuEntries.map((item) => {
                const isModified = item.currentLabel !== item.defaultLabel;

                return (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isModified 
                        ? 'bg-purple-950/20 border-purple-500/40 shadow-xs' 
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[130px]" title={item.id}>
                        {item.id}
                      </span>
                      {isModified ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Kustom
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400">Standar</span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={item.currentLabel}
                        onChange={(e) => handleMenuLabelChange(item.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none transition"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="truncate max-w-[160px]" title={`Bawaan: ${item.defaultLabel}`}>
                        Bawaan: {item.defaultLabel}
                      </span>
                      {isModified && (
                        <button
                          onClick={() => handleResetSingleMenuLabel(item.id)}
                          className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EDIT TULISAN DI DALAM MENU (SEMUA HALAMAN) */}
      {/* ========================================================================= */}
      {activeTab === 'insideMenu' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Pilih Halaman Menu yang Ingin Diedit Isinya:
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah judul halaman, deskripsi, teks tab, label tombol aksi, dan pengumuman yang ada di dalam menu terpilih.
                </p>
              </div>

              {/* Selector View Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Menu Halaman:</span>
                <select
                  value={selectedViewForInsideText}
                  onChange={(e) => setSelectedViewForInsideText(e.target.value as View)}
                  className="bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                >
                  {Object.entries(DEFAULT_MENU_LABELS).map(([k, label]) => {
                    const customMenuLabel = config.menuLabels[k as View] || label;
                    return (
                      <option key={k} value={k}>
                        {customMenuLabel} ({k})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Banner of active selected view */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/60 border border-indigo-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
                  {selectedViewForInsideText.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {config.menuLabels[selectedViewForInsideText] || DEFAULT_MENU_LABELS[selectedViewForInsideText]}
                  </h4>
                  <p className="text-xs text-indigo-300">
                    ID View: <code className="font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-500/30">{selectedViewForInsideText}</code> • Terdapat {currentInsideTextList.length} tulisan yang dapat dikustomisasi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingNewKey(!isAddingNewKey)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tulisan Kustom
              </button>
            </div>

            {/* Modal/Inline Form to add new text key */}
            {isAddingNewKey && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 animate-fade-in">
                <h5 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kunci & Tulisan Baru untuk Halaman Ini
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Nama ID Kunci (huruf & angka)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. bannerTitle"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Deskripsi / Label Kunci
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Judul Pengumuman Khusus"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Isi Teks Tulisan
                    </label>
                    <input
                      type="text"
                      placeholder="Tuliskan teks yang diinginkan..."
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingNewKey(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddNewKey}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                  >
                    Tambahkan ke Halaman
                  </button>
                </div>
              </div>
            )}

            {/* List of text fields for this view */}
            {currentInsideTextList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl p-6 text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">Belum ada kunci teks spesifik untuk halaman ini.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol <strong>"Tambah Tulisan Kustom"</strong> di atas untuk membuat teks kustom.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentInsideTextList.map(([key, rawItem]) => {
                  const item = rawItem as {
                    label?: string;
                    value: string;
                    defaultValue: string;
                    category?: string;
                  };
                  const isModified = item.value !== item.defaultValue;
                  const isLongText = item.value && item.value.length > 60;

                  return (
                    <div 
                      key={key}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isModified 
                          ? 'bg-purple-950/20 border-purple-500/40 shadow-xs' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {item.label || key}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {key}
                          </span>
                          {item.category && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isModified && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Diubah
                            </span>
                          )}
                          {isModified && (
                            <button
                              onClick={() => handleResetSingleInsideText(selectedViewForInsideText, key)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                              title="Kembalikan ke Teks Bawaan"
                            >
                              Reset Bawaan
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteKey(selectedViewForInsideText, key)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                            title="Hapus Kunci Teks Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Text Input / Textarea */}
                      {isLongText ? (
                        <textarea
                          rows={3}
                          value={item.value}
                          onChange={(e) => handleInsideTextChange(selectedViewForInsideText, key, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none leading-relaxed transition"
                        />
                      ) : (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleInsideTextChange(selectedViewForInsideText, key, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none transition"
                        />
                      )}

                      {/* Default value reference */}
                      {item.defaultValue && item.defaultValue !== item.value && (
                        <div className="text-[10px] text-slate-400 flex items-start gap-1">
                          <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>Teks Bawaan: <em className="text-slate-400">{item.defaultValue}</em></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CARI & GANTI KATA SERENTAK (GLOBAL FIND & REPLACE) */}
      {/* ========================================================================= */}
      {activeTab === 'findReplace' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Cari & Ganti Kata Serentak di Semua Menu & Halaman
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Fitur canggih untuk mengubah istilah tertentu di seluruh antarmuka secara instan. Contoh: ubah kata <em>"Anak"</em> menjadi <em>"Siswa"</em>, atau <em>"Klien"</em> menjadi <em>"Pasien"</em> di seluruh menu sidebar dan tulisan halaman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kata / Istilah yang Ingin Dicari:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Anak"
                  value={findWord}
                  onChange={(e) => setFindWord(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Pencarian tidak peka huruf besar/kecil (case-insensitive).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ganti Menjadi:
              </label>
              <div className="relative">
                <Type className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Siswa"
                  value={replaceWord}
                  onChange={(e) => setReplaceWord(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-white outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Kata pengganti yang akan disematkan ke seluruh teks yang cocok.
              </p>
            </div>
          </div>

          {/* Preview Box */}
          {findWord.trim() && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-base shrink-0">
                  {replaceCountPreview || 0}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Ditemukan {replaceCountPreview || 0} kecocokan kata "{findWord}" di seluruh sistem
                  </h4>
                  <p className="text-[11px] text-indigo-300">
                    Akan diganti menjadi: <strong className="text-emerald-400">"{replaceWord}"</strong>
                  </p>
                </div>
              </div>

              <button
                disabled={!replaceCountPreview || replaceCountPreview === 0}
                onClick={handleExecuteReplace}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                Terapkan Penggantian ({replaceCountPreview} teks)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EKSPOR / IMPOR JSON */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Ekspor */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ekspor Konfigurasi Kustom</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Unduh seluruh data nama menu, kategori, dan teks halaman dalam format file JSON untuk arsip cadangan (backup) atau migrasi ke perangkat lain.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh File Konfigurasi (JSON)
            </button>
          </div>

          {/* Card Impor */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Impor Konfigurasi Kustom</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pulihkan atau terapkan pengaturan nama menu dan teks dari file JSON yang telah diekspor sebelumnya.
              </p>
            </div>
            <label className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Pilih & Unggah File JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMenuPage;
