import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Move, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  User,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { 
  SignatureConfig, 
  RapotSignatures, 
  processSignatureFile, 
  toggleBackgroundOnDataUrl,
  getSavedDefaultSignatures,
  saveDefaultSignatures
} from '../utils/signatureProcessor';

interface SignatureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSignatures: RapotSignatures;
  onSaveSignatures: (signatures: RapotSignatures) => void;
  therapistName: string;
  therapistTitle: string;
  therapistRole: string;
  managerName: string;
  managerTitle: string;
  signer3Name: string;
  signer3Title: string;
  activeSlot?: 'therapist' | 'manager' | 'signer3';
}

export const SignatureUploadModal: React.FC<SignatureUploadModalProps> = ({
  isOpen,
  onClose,
  currentSignatures,
  onSaveSignatures,
  therapistName,
  therapistTitle,
  therapistRole,
  managerName,
  managerTitle,
  signer3Name,
  signer3Title,
  activeSlot = 'therapist',
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'therapist' | 'manager' | 'signer3'>(activeSlot);
  const [workingSignatures, setWorkingSignatures] = useState<RapotSignatures>(currentSignatures);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(activeSlot);
      // Merge with default signatures from storage if current ones are empty
      const defaults = getSavedDefaultSignatures();
      const initial = { ...currentSignatures };
      if (!initial.therapist && defaults.therapist) initial.therapist = defaults.therapist;
      if (!initial.manager && defaults.manager) initial.manager = defaults.manager;
      if (!initial.signer3 && defaults.signer3) initial.signer3 = defaults.signer3;
      setWorkingSignatures(initial);
    }
  }, [isOpen, activeSlot, currentSignatures]);

  if (!isOpen) return null;

  const currentConfig: SignatureConfig | undefined = workingSignatures[selectedSlot];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Harap gunakan format PNG, JPG, JPEG, atau WebP.');
      return;
    }

    try {
      setIsProcessing(true);
      const isPng = file.type === 'image/png';
      // For PNGs that may already be transparent, default to keep transparency without harsh cutoff,
      // for JPGs remove white paper background automatically.
      const removeBg = !isPng || true; 
      const dataUrl = await processSignatureFile(file, removeBg);
      
      const newConfig: SignatureConfig = {
        imageUrl: dataUrl,
        scale: 100,
        offsetX: 0,
        offsetY: 0,
        removeBackground: removeBg,
        isConfirmed: false, // Per request: user must confirm before it appears on print
        updatedAt: new Date().toISOString(),
      };

      setWorkingSignatures(prev => ({
        ...prev,
        [selectedSlot]: newConfig,
      }));
    } catch (err: any) {
      console.error(err);
      alert('Gagal memproses gambar tanda tangan: ' + (err.message || 'File tidak dapat dibaca'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBackground = async (removeBg: boolean) => {
    if (!currentConfig) return;
    try {
      setIsProcessing(true);
      const updatedUrl = await toggleBackgroundOnDataUrl(currentConfig.imageUrl, removeBg);
      setWorkingSignatures(prev => ({
        ...prev,
        [selectedSlot]: {
          ...currentConfig,
          imageUrl: updatedUrl,
          removeBackground: removeBg,
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateScale = (delta: number) => {
    if (!currentConfig) return;
    const newScale = Math.min(150, Math.max(50, currentConfig.scale + delta));
    setWorkingSignatures(prev => ({
      ...prev,
      [selectedSlot]: {
        ...currentConfig,
        scale: newScale,
      }
    }));
  };

  const handleScaleSlider = (val: number) => {
    if (!currentConfig) return;
    setWorkingSignatures(prev => ({
      ...prev,
      [selectedSlot]: {
        ...currentConfig,
        scale: val,
      }
    }));
  };

  const handleOffsetChange = (axis: 'offsetX' | 'offsetY', val: number) => {
    if (!currentConfig) return;
    setWorkingSignatures(prev => ({
      ...prev,
      [selectedSlot]: {
        ...currentConfig,
        [axis]: val,
      }
    }));
  };

  const handleResetAdjustments = () => {
    if (!currentConfig) return;
    setWorkingSignatures(prev => ({
      ...prev,
      [selectedSlot]: {
        ...currentConfig,
        scale: 100,
        offsetX: 0,
        offsetY: 0,
      }
    }));
  };

  const handleDeleteSignature = () => {
    if (confirm('Hapus tanda tangan untuk bagian ini?')) {
      const updated = { ...workingSignatures };
      delete updated[selectedSlot];
      setWorkingSignatures(updated);
    }
  };

  const handleConfirmAndApply = () => {
    if (!currentConfig) {
      alert('Silakan upload tanda tangan terlebih dahulu.');
      return;
    }

    // Mark current slot as confirmed
    const confirmedSignatures: RapotSignatures = {
      ...workingSignatures,
      [selectedSlot]: {
        ...currentConfig,
        isConfirmed: true,
      }
    };

    if (saveAsDefault) {
      saveDefaultSignatures(confirmedSignatures);
    }

    onSaveSignatures(confirmedSignatures);
    onClose();
  };

  // Helper metadata based on active slot
  const slotInfo = {
    therapist: {
      label: 'Terapis Penanggung Jawab',
      role: therapistRole || 'Terapis Penanggung Jawab,',
      name: therapistName || 'Tim Terapi Okupasi',
      sub: therapistTitle || 'Okupasi Terapis',
      icon: User,
      badge: 'Utama'
    },
    manager: {
      label: 'Manager Pelangi Lazuardi',
      role: 'Mengetahui,',
      name: managerName || 'Asep Suherman, S.E, M.M',
      sub: managerTitle || 'Manager Pelangi Lazuardi RC',
      icon: CheckSquare,
      badge: 'Mengetahui'
    },
    signer3: {
      label: 'Kepala Pendidikan Inklusif',
      role: 'Mengetahui,',
      name: signer3Name || 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
      sub: signer3Title || 'Kepala Pendidikan Inklusif Lazuardi GCS',
      icon: ShieldCheck,
      badge: 'Mengetahui'
    }
  }[selectedSlot];

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-xs">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">
                Upload & Pengaturan Tanda Tangan Rapot
              </h2>
              <p className="text-xs text-slate-400">
                Posisikan tanda tangan resmi agar tampil proporsional pada lembar Rapot & PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slot Selector Tabs */}
        <div className="bg-slate-100/80 p-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
          {(['therapist', 'manager', 'signer3'] as const).map(slotKey => {
            const hasSig = workingSignatures[slotKey]?.imageUrl && workingSignatures[slotKey]?.isConfirmed;
            const isSelected = selectedSlot === slotKey;
            const titleMap = {
              therapist: 'Terapis Penanggung Jawab',
              manager: 'Manager',
              signer3: 'Kepala Pendidikan Inklusif'
            };

            return (
              <button
                key={slotKey}
                onClick={() => setSelectedSlot(slotKey)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{titleMap[slotKey]}</span>
                {hasSig && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tanda tangan siap" />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Slot Target Information */}
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                <slotInfo.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{slotInfo.label}</p>
                <p className="text-xs font-black text-blue-950">{slotInfo.name}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
              {slotInfo.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Upload or Preview Area (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
                  Pratinjau Posisi Tanda Tangan
                </p>
                {currentConfig && (
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    currentConfig.isConfirmed 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {currentConfig.isConfirmed ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {currentConfig.isConfirmed ? 'Tanda Tangan Aktif' : 'Draft (Perlu Dikonfirmasi)'}
                  </span>
                )}
              </div>

              {/* Realistic Document Slot Simulation */}
              <div 
                className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-inner flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]"
                style={{
                  backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Simulated Sheet Slot Content */}
                <div className="w-full text-center flex flex-col items-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal mb-2">
                    {slotInfo.role}
                  </p>

                  {/* Signature Image Box or Empty Placeholder */}
                  <div className="h-24 w-56 flex items-center justify-center relative">
                    {currentConfig?.imageUrl ? (
                      <div 
                        className="relative transition-transform duration-75 select-none"
                        style={{
                          transform: `translate(${currentConfig.offsetX}px, ${currentConfig.offsetY}px) scale(${currentConfig.scale / 100})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img 
                          src={currentConfig.imageUrl} 
                          alt="Tanda Tangan"
                          className="max-h-20 max-w-[200px] object-contain pointer-events-none drop-shadow-xs"
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                        }}
                        className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                          dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30'
                        }`}
                      >
                        <Upload className="h-6 w-6 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700">Pilih / Seret Tanda Tangan ke Sini</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WebP (Rekomendasi PNG transparan)</p>
                      </div>
                    )}
                  </div>

                  {/* Underline */}
                  <div className="w-52 h-0.5 bg-slate-800 mb-1.5 mt-1" />

                  {/* Signer Name and Title */}
                  <p className="text-xs font-black uppercase tracking-normal text-slate-900 leading-tight">
                    {slotInfo.name}
                  </p>
                  <p className="text-[9.5px] font-medium text-slate-500 uppercase tracking-normal mt-0.5">
                    {slotInfo.sub}
                  </p>
                </div>
              </div>

              {/* Upload Action Row */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {currentConfig ? 'Ganti File Tanda Tangan' : '+ Upload File Tanda Tangan'}
                </button>

                {currentConfig && (
                  <button
                    onClick={handleDeleteSignature}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer border border-red-200"
                    title="Hapus Tanda Tangan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Customization Controls (5 Cols) */}
            <div className="md:col-span-5 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Pengaturan Tanda Tangan
              </p>

              {currentConfig ? (
                <div className="space-y-4">
                  {/* Background Removal Toggle */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-800">Hapus Background Putih</span>
                      <input 
                        type="checkbox"
                        checked={currentConfig.removeBackground}
                        onChange={(e) => handleToggleBackground(e.target.checked)}
                        disabled={isProcessing}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Mengubah kertas putih menjadi transparan agar tinta terlihat seperti asli di atas dokumen.
                    </p>
                  </div>

                  {/* Size Adjustment (Scale) */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Ukuran Tanda Tangan</span>
                      <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {currentConfig.scale}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateScale(-5)}
                        disabled={currentConfig.scale <= 50}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer text-sm"
                        title="Perkecil"
                      >
                        −
                      </button>

                      <input 
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={currentConfig.scale}
                        onChange={(e) => handleScaleSlider(Number(e.target.value))}
                        className="flex-1 accent-blue-600 cursor-pointer"
                      />

                      <button
                        onClick={() => handleUpdateScale(5)}
                        disabled={currentConfig.scale >= 150}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer text-sm"
                        title="Perbesar"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Position Offset Controls */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Move className="h-3 w-3 text-slate-400" />
                        Atur Posisi (Presisi)
                      </span>
                      <button 
                        onClick={handleResetAdjustments}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        Reset Posisi
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                          <span>Geser Horizontal (X)</span>
                          <span className="font-mono">{currentConfig.offsetX}px</span>
                        </div>
                        <input 
                          type="range"
                          min="-30"
                          max="30"
                          value={currentConfig.offsetX}
                          onChange={(e) => handleOffsetChange('offsetX', Number(e.target.value))}
                          className="w-full accent-slate-800 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                          <span>Geser Vertikal (Y)</span>
                          <span className="font-mono">{currentConfig.offsetY}px</span>
                        </div>
                        <input 
                          type="range"
                          min="-20"
                          max="20"
                          value={currentConfig.offsetY}
                          onChange={(e) => handleOffsetChange('offsetY', Number(e.target.value))}
                          className="w-full accent-slate-800 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save As Default Option */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-700 leading-snug">
                        Simpan sebagai Tanda Tangan Default (Otomatis digunakan untuk rapot berikutnya)
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Upload className="h-8 w-8 mx-auto opacity-30" />
                  <p className="text-xs font-bold">Belum ada file tanda tangan.</p>
                  <p className="text-[10px]">Silakan unggah file gambar tanda tangan di sebelah kiri untuk mengatur ukuran dan posisi.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            * Tanda tangan akan otomatis muncul pada Lembar Rapot, Print Preview, dan Download PDF.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleConfirmAndApply}
              disabled={!currentConfig?.imageUrl || isProcessing}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Gunakan Tanda Tangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureUploadModal;
