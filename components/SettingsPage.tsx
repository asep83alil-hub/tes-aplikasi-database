import React, { useState, useRef, useEffect, useMemo } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { TherapyDefinition, Theme, GradientSettings, UserRole, View } from '../types';
import { 
  Sparkles, 
  Edit3, 
  Palette, 
  Building2, 
  Clock, 
  Stethoscope, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Moon, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Shield,
  X
} from 'lucide-react';
import { getStoredCustomTexts, AppCustomTexts } from '../utils/textCustomizationStorage';
import { buildCustomTheme, hexToRgbString } from '../utils/themeStorage';

interface SettingsPageProps {
  therapyTypes: TherapyDefinition[];
  onAddTherapyType: (name: string) => void;
  onUpdateTherapyType: (id: string, name: string) => void;
  onDeleteTherapyType: (id: string) => void;
  themes: Theme[];
  activeTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onAddTheme?: (theme: Theme) => void;
  onDeleteTheme?: (themeId: string) => void;
  gradientSettings: GradientSettings;
  onGradientChange: React.Dispatch<React.SetStateAction<GradientSettings>>;
  logoUrl: string;
  onLogoChange: (newLogoUrl: string) => void;
  userRole?: UserRole;
  onNavigate?: (view: View) => void;
  onOpenTextCustomizer?: () => void;
}

const initialDays = {
  'Senin': true, 'Selasa': true, 'Rabu': true, 'Kamis': true, 'Jumat': true, 'Sabtu': true, 'Minggu': false,
};

const initialTimes = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const PRESET_GRADIENTS = [
  { name: 'Midnight Aurora', color1: '#0f172a', color2: '#312e81', color3: '#065f46', useColor3: true },
  { name: 'Deep Cosmic', color1: '#090d16', color2: '#4338ca', color3: '#be185d', useColor3: true },
  { name: 'Emerald Forest', color1: '#064e3b', color2: '#047857', color3: '#0f766e', useColor3: true },
  { name: 'Sunset Glow', color1: '#1e1b4b', color2: '#9a3412', color3: '#b91c1c', useColor3: true },
  { name: 'Oceanic Abyss', color1: '#082f49', color2: '#0369a1', color3: '#0d9488', useColor3: true },
  { name: 'Royal Velvet', color1: '#2e1065', color2: '#581c87', color3: '#831843', useColor3: true },
  { name: 'Dark Titanium', color1: '#111827', color2: '#1f2937', color3: '#374151', useColor3: false },
  { name: 'Soft Sunrise', color1: '#1e1b4b', color2: '#6366f1', color3: '#f472b6', useColor3: true },
];

const QUICK_COLORS = [
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Orange', hex: '#f97316' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  therapyTypes, 
  onAddTherapyType, 
  onUpdateTherapyType, 
  onDeleteTherapyType, 
  themes, 
  activeTheme, 
  onThemeChange, 
  onAddTheme,
  onDeleteTheme,
  gradientSettings, 
  onGradientChange, 
  logoUrl, 
  onLogoChange,
  userRole,
  onNavigate,
  onOpenTextCustomizer
}) => {
  // Navigation Tabs inside Settings
  const [activeTab, setActiveTab] = useState<'themes' | 'branding' | 'operations' | 'therapies'>('themes');

  // Operational Settings
  const [operatingDays, setOperatingDays] = useState(initialDays);
  const [therapyTimes, setTherapyTimes] = useState<string[]>(initialTimes);
  const [newTime, setNewTime] = useState('');
  const [timeError, setTimeError] = useState('');

  // Therapy Types
  const [newTherapyName, setNewTherapyName] = useState('');
  const [editingTherapyId, setEditingTherapyId] = useState<string | null>(null);
  const [editingTherapyName, setEditingTherapyName] = useState('');

  // Custom Color Variation Creator State
  const [isColorCreatorOpen, setIsColorCreatorOpen] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#2dd4bf');
  const [customAccentColor, setCustomAccentColor] = useState('#a78bfa');
  const [customThemeMode, setCustomThemeMode] = useState<'dark' | 'light'>('dark');

  // Custom texts
  const [customTexts, setCustomTexts] = useState<AppCustomTexts>(() => getStoredCustomTexts());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleTextsUpdated = () => {
      setCustomTexts(getStoredCustomTexts());
    };
    window.addEventListener('pelangi_app_texts_updated', handleTextsUpdated);
    return () => {
      window.removeEventListener('pelangi_app_texts_updated', handleTextsUpdated);
    };
  }, []);

  const handleDayToggle = (day: string) => setOperatingDays(prev => ({ ...prev, [day]: !prev[day] }));
  const handleRemoveTime = (timeToRemove: string) => setTherapyTimes(prev => prev.filter(time => time !== timeToRemove));
  
  const handleGradientChange = (updates: Partial<GradientSettings>) => {
    onGradientChange(prev => ({ ...prev, ...updates }));
  };

  const handleApplyPresetGradient = (preset: typeof PRESET_GRADIENTS[0]) => {
    onGradientChange({
      enabled: true,
      color1: preset.color1,
      color2: preset.color2,
      color3: preset.color3,
      useColor3: preset.useColor3,
    });
    showToast(`Gradasi "${preset.name}" diterapkan.`);
  };
  
  const handleAddNewTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    if (!/^\d{2}:\d{2}$/.test(newTime)) { setTimeError('Format waktu harus JJ:MM (contoh: 09:30)'); return; }
    if (therapyTimes.includes(newTime)) { setTimeError('Waktu ini sudah ada dalam daftar.'); return; }
    setTimeError('');
    setTherapyTimes(prev => [...prev, newTime].sort());
    setNewTime('');
    showToast(`Jam sesi ${newTime} ditambahkan.`);
  };

  const handleAddNewTherapy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTherapyName.trim()) {
      onAddTherapyType(newTherapyName.trim());
      setNewTherapyName('');
      showToast(`Layanan terapi baru "${newTherapyName.trim()}" ditambahkan.`);
    }
  };

  const handleStartEditTherapy = (therapy: TherapyDefinition) => {
    setEditingTherapyId(therapy.id);
    setEditingTherapyName(therapy.name);
  };

  const handleSaveEditTherapy = () => {
    if (editingTherapyId && editingTherapyName.trim()) {
      onUpdateTherapyType(editingTherapyId, editingTherapyName.trim());
      setEditingTherapyId(null);
      showToast('Perubahan nama terapi berhasil disimpan.');
    }
  };

  const handleCancelEditTherapy = () => {
    setEditingTherapyId(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result);
          showToast('Logo lembaga berhasil diperbarui.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoInput = () => {
    fileInputRef.current?.click();
  };

  // Create & Apply Custom Color Theme
  const handleCreateCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customThemeName.trim()) {
      showToast('Harap beri nama variasi warna.', 'error');
      return;
    }

    const newTheme = buildCustomTheme(
      customThemeName.trim(),
      customPrimaryColor,
      customAccentColor,
      customThemeMode === 'light'
    );

    if (onAddTheme) {
      onAddTheme(newTheme);
    } else {
      onThemeChange(newTheme);
    }

    showToast(`Variasi warna "${customThemeName.trim()}" berhasil dibuat dan diaktifkan!`);
    setIsColorCreatorOpen(false);
    setCustomThemeName('');
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all transform animate-fade-in-up ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' 
            : toastMessage.type === 'error'
            ? 'bg-slate-900 border-red-500/40 text-red-300'
            : 'bg-slate-900 border-indigo-500/40 text-indigo-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-light pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1 font-medium">
            <span>Sistem</span>
            <span>/</span>
            <span className="text-primary font-semibold">Pengaturan & Personalisasi</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pengaturan Sistem & Personalisasi
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {activeTheme.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Sesuaikan skema variasi warna, identitas lembaga, jadwal operasional, dan parameter terapi.
          </p>
        </div>

        {/* Global Shortcut to Edit Menu / Text Customizer */}
        <div className="flex items-center gap-2.5">
          {onNavigate && userRole === 'manager' && (
            <button
              onClick={() => onNavigate('editMenu')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Menu & Teks Navigasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabbed Navigation Container */}
      <div className="bg-surface border border-surface-light rounded-2xl shadow-xl overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-surface-light px-4 sm:px-6 pt-3 scrollbar-none">
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'themes'
                ? 'border-primary text-white bg-primary/10'
                : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
            }`}
          >
            <Palette className="w-4 h-4 text-primary" />
            <span>Tema & Variasi Warna</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
              {themes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'branding'
                ? 'border-primary text-white bg-primary/10'
                : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Logo & Identitas Lembaga</span>
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'operations'
                ? 'border-primary text-white bg-primary/10'
                : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Hari & Jam Operasional</span>
          </button>

          <button
            onClick={() => setActiveTab('therapies')}
            className={`px-4 py-3 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'therapies'
                ? 'border-primary text-white bg-primary/10'
                : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            <span>Layanan & Jenis Terapi</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
              {therapyTypes.length}
            </span>
          </button>
        </div>

        {/* ---------------- TAB 1: TEMA & VARIASI WARNA ---------------- */}
        {activeTab === 'themes' && (
          <div className="p-6 space-y-8">
            {/* Top Toolbar: Curated Themes & Add Custom Palette Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-light pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Pilihan Variasi Warna Tema</span>
                  <span className="text-xs font-normal text-muted">({themes.length} Variasi Tersedia)</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Klik variasi warna di bawah ini untuk langsung mengubah skema warna aplikasi secara instan.
                </p>
              </div>

              <button
                onClick={() => setIsColorCreatorOpen(!isColorCreatorOpen)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light rounded-xl transition shadow-md shadow-primary/20 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Variasi Warna Baru</span>
              </button>
            </div>

            {/* Custom Color Variation Builder (Dropdown/Collapsible) */}
            {isColorCreatorOpen && (
              <div className="bg-surface-light/30 border border-primary/40 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Buat Variasi Warna Kustom Baru</h3>
                      <p className="text-xs text-muted">Sesuaikan warna utama, warna aksen, dan nuansa latar belakang.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsColorCreatorOpen(false)}
                    className="text-muted hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomTheme} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Theme Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Nama Variasi Warna <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={customThemeName}
                        onChange={(e) => setCustomThemeName(e.target.value)}
                        placeholder="Misal: Tosca Lazuardi, Cyber Gold"
                        className="w-full px-3.5 py-2 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>

                    {/* Primary Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Warna Utama (Primary Brand)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-9 h-9 p-0 border border-surface-light rounded-xl cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-background border border-surface-light rounded-xl text-white font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Warna Aksen (Secondary)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="w-9 h-9 p-0 border border-surface-light rounded-xl cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={customAccentColor}
                          onChange={(e) => setCustomAccentColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-background border border-surface-light rounded-xl text-white font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div>
                    <span className="text-[11px] text-muted block mb-1.5 font-medium">Pilihan Cepat Warna Utama:</span>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_COLORS.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setCustomPrimaryColor(c.hex)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-background border border-surface-light hover:border-slate-500 transition cursor-pointer"
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }}></span>
                          <span className="text-slate-300">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs font-semibold text-slate-300">Gaya Tampilan Dasar:</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="radio"
                        name="themeMode"
                        checked={customThemeMode === 'dark'}
                        onChange={() => setCustomThemeMode('dark')}
                        className="text-primary focus:ring-primary"
                      />
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mode Gelap (Dark Enterprise)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="radio"
                        name="themeMode"
                        checked={customThemeMode === 'light'}
                        onChange={() => setCustomThemeMode('light')}
                        className="text-primary focus:ring-primary"
                      />
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mode Terang (Clean Light)</span>
                    </label>
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-4 rounded-xl border border-surface-light bg-background/60 space-y-2">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                      Pratinjau Hasil Variasi Warna
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        style={{ backgroundColor: customPrimaryColor, color: '#0f172a' }}
                        className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                      >
                        Tombol Utama
                      </button>

                      <button
                        type="button"
                        style={{ borderColor: customPrimaryColor, color: customPrimaryColor }}
                        className="px-4 py-2 rounded-xl text-xs font-bold border bg-transparent"
                      >
                        Tombol Sekunder
                      </button>

                      <span
                        style={{ backgroundColor: `${customPrimaryColor}20`, color: customPrimaryColor, borderColor: `${customPrimaryColor}40` }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: customPrimaryColor }}></span>
                        Status Lencana
                      </span>

                      <span
                        style={{ backgroundColor: `${customAccentColor}20`, color: customAccentColor }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        Aksen Khusus
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsColorCreatorOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-muted hover:text-white bg-surface-light/40 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer"
                    >
                      Simpan & Terapkan Variasi Warna
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Themes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {themes.map(theme => {
                const isActive = activeTheme.id === theme.id;
                const isCustom = theme.id.startsWith('custom-');

                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme);
                      showToast(`Tema "${theme.name}" diaktifkan.`);
                    }}
                    className={`group relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isActive 
                        ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10' 
                        : 'border-surface-light hover:border-slate-500 bg-surface-light/20 hover:bg-surface-light/40'
                    }`}
                    style={{
                      backgroundColor: `rgb(${theme.colors['--color-surface']})`,
                    }}
                  >
                    {/* Delete button for custom themes */}
                    {isCustom && onDeleteTheme && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus variasi warna kustom "${theme.name}"?`)) {
                            onDeleteTheme(theme.id);
                            showToast(`Variasi "${theme.name}" dihapus.`);
                          }
                        }}
                        className="absolute top-2 right-2 p-1 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition z-10"
                        title="Hapus variasi kustom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Active Check Badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-slate-900 shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Color Swatch Previews */}
                    <div className="pt-4 pb-3 flex items-center justify-center gap-1.5">
                      {/* Primary */}
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md"
                        style={{ backgroundColor: `rgb(${theme.colors['--color-primary']})` }}
                        title="Warna Utama"
                      />
                      {/* Secondary/Accent */}
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: `rgb(${theme.colors['--color-accent'] || theme.colors['--color-secondary']})` }}
                        title="Warna Aksen"
                      />
                      {/* Surface */}
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: `rgb(${theme.colors['--color-surface-light']})` }}
                        title="Warna Surface"
                      />
                    </div>

                    {/* Theme Name */}
                    <div className="text-center mt-2">
                      <span className={`text-xs font-bold block truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}>
                        {theme.name}
                      </span>
                      {isCustom && (
                        <span className="text-[10px] text-primary block mt-0.5">Kustom</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Background Gradient Variations Section */}
            <div className="border-t border-surface-light pt-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Variasi Gradasi Latar Belakang</span>
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Aktifkan efek gradasi lembut untuk memberikan kedalaman visual pada dasbor aplikasi.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-surface-light/50 px-4 py-2 rounded-xl border border-surface-light">
                  <span className="text-xs font-semibold text-slate-200">
                    {gradientSettings.enabled ? 'Gradasi Aktif' : 'Gradasi Nonaktif'}
                  </span>
                  <ToggleSwitch
                    checked={gradientSettings.enabled}
                    onChange={() => handleGradientChange({ enabled: !gradientSettings.enabled })}
                  />
                </div>
              </div>

              {gradientSettings.enabled && (
                <div className="bg-surface-light/20 border border-surface-light rounded-2xl p-5 space-y-5 animate-fade-in-up">
                  {/* Preset Gradients */}
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Pilihan Cepat Gradasi Siap Pakai:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRESET_GRADIENTS.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleApplyPresetGradient(preset)}
                          className="p-3 rounded-xl border border-surface-light hover:border-primary/60 transition text-left cursor-pointer group"
                          style={{
                            background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2}${preset.useColor3 ? `, ${preset.color3}` : ''})`
                          }}
                        >
                          <span className="text-xs font-bold text-white block truncate drop-shadow">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Gradient Color Inputs */}
                  <div className="border-t border-surface-light/60 pt-4">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Atur Warna Gradasi Kustom:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-muted block mb-1">Warna Awal (Color 1)</label>
                        <div className="flex items-center gap-2 p-1.5 bg-background rounded-xl border border-surface-light">
                          <input
                            type="color"
                            value={gradientSettings.color1}
                            onChange={e => handleGradientChange({ color1: e.target.value })}
                            className="w-7 h-7 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={gradientSettings.color1}
                            onChange={e => handleGradientChange({ color1: e.target.value })}
                            className="w-full bg-transparent font-mono text-xs text-white uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted block mb-1">Warna Tengah (Color 2)</label>
                        <div className="flex items-center gap-2 p-1.5 bg-background rounded-xl border border-surface-light">
                          <input
                            type="color"
                            value={gradientSettings.color2}
                            onChange={e => handleGradientChange({ color2: e.target.value })}
                            className="w-7 h-7 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={gradientSettings.color2}
                            onChange={e => handleGradientChange({ color2: e.target.value })}
                            className="w-full bg-transparent font-mono text-xs text-white uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] text-muted">Warna Akhir (Color 3)</label>
                          <label className="text-[10px] text-primary flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gradientSettings.useColor3}
                              onChange={e => handleGradientChange({ useColor3: e.target.checked })}
                              className="rounded text-primary focus:ring-primary w-3 h-3"
                            />
                            <span>Gunakan</span>
                          </label>
                        </div>
                        <div className={`flex items-center gap-2 p-1.5 bg-background rounded-xl border border-surface-light ${!gradientSettings.useColor3 ? 'opacity-40 pointer-events-none' : ''}`}>
                          <input
                            type="color"
                            value={gradientSettings.color3}
                            onChange={e => handleGradientChange({ color3: e.target.value })}
                            disabled={!gradientSettings.useColor3}
                            className="w-7 h-7 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={gradientSettings.color3}
                            onChange={e => handleGradientChange({ color3: e.target.value })}
                            disabled={!gradientSettings.useColor3}
                            className="w-full bg-transparent font-mono text-xs text-white uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: LOGO & IDENTITAS ---------------- */}
        {activeTab === 'branding' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-surface-light pb-4">
              <h2 className="text-lg font-bold text-white">Logo & Identitas Lembaga</h2>
              <p className="text-xs text-muted mt-0.5">
                Kelola logo lambang, nama institusi, dan teks branding yang tampil di seluruh antarmuka dasbor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Card */}
              <div className="bg-surface-light/20 border border-surface-light rounded-2xl p-6 text-center space-y-4">
                <span className="text-xs font-semibold text-slate-300 block">Logo Saat Ini</span>
                <div className="w-32 h-32 mx-auto rounded-2xl bg-surface-light border border-surface-light p-3 flex items-center justify-center shadow-inner">
                  <img
                    src={logoUrl}
                    alt="Logo Lembaga"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <button
                    onClick={triggerLogoInput}
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Unggah File Logo Baru</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <span className="text-[11px] text-muted block mt-2">
                    Format disarankan: PNG transparan atau SVG.
                  </span>
                </div>
              </div>

              {/* Branding Overview & Shortcut */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-surface-light/20 border border-surface-light rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Konfigurasi Teks Identitas Lembaga
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-background rounded-xl border border-surface-light">
                      <span className="text-muted block text-[11px]">Nama Lembaga / Pusat Terapi:</span>
                      <strong className="text-white text-sm block mt-0.5">
                        {customTexts.branding.institutionName || 'Terapi Pelangi Lazuardi'}
                      </strong>
                    </div>

                    <div className="p-3 bg-background rounded-xl border border-surface-light">
                      <span className="text-muted block text-[11px]">Nama Aplikasi / Wordmark:</span>
                      <strong className="text-primary text-sm block mt-0.5">
                        {customTexts.branding.appName || 'Pelangi360'}
                      </strong>
                    </div>

                    <div className="p-3 bg-background rounded-xl border border-surface-light sm:col-span-2">
                      <span className="text-muted block text-[11px]">Subjudul / Tagline Operasional:</span>
                      <span className="text-slate-200 block mt-0.5">
                        {customTexts.branding.appSubtitle || 'Lazuardi Therapy & Growth Center'}
                      </span>
                    </div>
                  </div>

                  {userRole === 'manager' && onNavigate && (
                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate('editMenu')}
                        className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Kustomisasi Seluruh Tulisan Menu & Header (Khusus Manager) &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: HARI & JAM OPERASIONAL ---------------- */}
        {activeTab === 'operations' && (
          <div className="p-6 space-y-8">
            <div className="border-b border-surface-light pb-4">
              <h2 className="text-lg font-bold text-white">Hari & Jam Sesi Operasional</h2>
              <p className="text-xs text-muted mt-0.5">
                Atur jadwal hari aktif klinik serta rentang waktu sesi terapi yang tersedia untuk penjadwalan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Operating Days */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Hari Layanan Klinik</h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {Object.values(operatingDays).filter(Boolean).length} Hari Aktif
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(operatingDays).map(([day, isActive]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-light/30 border border-surface-light transition"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">{day}</span>
                      <ToggleSwitch
                        checked={isActive}
                        onChange={() => handleDayToggle(day)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapy Session Times */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Slot Jam Sesi Terapi</h3>
                  <span className="text-xs text-muted font-mono">{therapyTimes.length} Slot Waktu</span>
                </div>

                <div className="p-4 bg-background/50 rounded-2xl border border-surface-light flex-1 min-h-[160px]">
                  {therapyTimes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {therapyTimes.map(time => (
                        <div
                          key={time}
                          className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-surface-light text-xs font-mono font-bold text-white border border-surface-light"
                        >
                          <span>{time}</span>
                          <button
                            onClick={() => handleRemoveTime(time)}
                            className="text-muted hover:text-red-400 transition cursor-pointer p-0.5"
                            title="Hapus jam ini"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted text-center py-8">Belum ada slot waktu sesi.</p>
                  )}
                </div>

                {/* Add Time Form */}
                <form onSubmit={handleAddNewTime} className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      placeholder="Contoh: 18:00"
                      className="flex-1 px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white font-mono text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      + Tambah Jam
                    </button>
                  </div>
                  {timeError && <p className="text-red-400 text-xs">{timeError}</p>}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 4: LAYANAN & JENIS TERAPI ---------------- */}
        {activeTab === 'therapies' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-surface-light pb-4">
              <h2 className="text-lg font-bold text-white">Manajemen Layanan & Jenis Terapi</h2>
              <p className="text-xs text-muted mt-0.5">
                Kelola modalitas intervensi klinis yang disediakan oleh pusat terapi Pelangi Lazuardi.
              </p>
            </div>

            {/* List of Therapies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {therapyTypes.map(therapy => (
                <div
                  key={therapy.id}
                  className="p-3.5 rounded-xl bg-surface-light/20 border border-surface-light flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${therapy.color}15`,
                        borderColor: `${therapy.color}40`,
                        color: therapy.color
                      }}
                    >
                      <therapy.Icon className="w-5 h-5" />
                    </div>

                    {editingTherapyId === therapy.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingTherapyName}
                          onChange={(e) => setEditingTherapyName(e.target.value)}
                          className="w-full px-2 py-1 bg-background border border-primary text-xs rounded text-white"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEditTherapy}
                          className="text-emerald-400 text-xs font-bold px-1.5 py-1"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEditTherapy}
                          className="text-muted text-xs px-1.5 py-1"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="truncate">
                        <span className="text-xs sm:text-sm font-bold text-white block truncate">
                          {therapy.name}
                        </span>
                        <span className="text-[10px] text-muted font-mono block">
                          Kode: {therapy.id}
                        </span>
                      </div>
                    )}
                  </div>

                  {editingTherapyId !== therapy.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditTherapy(therapy)}
                        className="p-1.5 text-muted hover:text-primary transition rounded-lg hover:bg-surface-light cursor-pointer"
                        title="Edit nama terapi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus jenis terapi "${therapy.name}"?`)) {
                            onDeleteTherapyType(therapy.id);
                            showToast(`Jenis terapi "${therapy.name}" dihapus.`);
                          }
                        }}
                        className="p-1.5 text-muted hover:text-red-400 transition rounded-lg hover:bg-red-500/10 cursor-pointer"
                        title="Hapus terapi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Therapy Type Form */}
            <div className="border-t border-surface-light pt-4">
              <form onSubmit={handleAddNewTherapy} className="max-w-md space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Tambah Layanan Terapi Baru
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTherapyName}
                    onChange={e => setNewTherapyName(e.target.value)}
                    placeholder="Contoh: Terapi Musik, Sensori Snoezelen"
                    className="flex-1 px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-primary hover:bg-primary-light text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default SettingsPage;
