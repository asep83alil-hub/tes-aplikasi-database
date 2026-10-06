import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Calendar, 
  User, 
  CheckCircle2, 
  FileText,
  Activity,
  Layers,
  Image as ImageIcon,
  Clock,
  Target,
  HeartHandshake,
  Check
} from 'lucide-react';
import { exportPagesToPdf, triggerBrowserA4Print, formatTherapyNotebookDownloadFileName } from '../utils/rapotPdfGenerator';
import { Child, Therapist, TherapySession, TherapyDefinition, DetailedProgress } from '../types';
import { getTherapyColorInfo } from './ScheduleBoardPage';

interface TherapyPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | any;
  notes: (TherapySession & { 
    date: string;
    sessionGoal?: string;
    activitiesDone?: string;
    sessionActivities?: string;
    therapyResult?: string;
    sessionOutcome?: string;
    childProgress?: string;
    obstaclesFound?: string;
    sessionObstacles?: string;
    nextTarget?: string;
    homeActivityAdvice?: string;
    homeSuggestions?: string;
  })[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  logoUrl?: string;
  reportTitle?: string;
  autoPrint?: boolean;
  autoDownloadPdf?: boolean;
}

export const TherapyPrintPreviewModal: React.FC<TherapyPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  child,
  notes,
  therapists,
  therapyTypes,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png',
  reportTitle = 'Rekam Catatan Klinis & Perkembangan Terapi Siswa',
  autoPrint = false,
  autoDownloadPdf = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [hasAutoTriggered, setHasAutoTriggered] = useState<boolean>(false);

  const fileName = child ? formatTherapyNotebookDownloadFileName(child.name, new Date().toISOString().split('T')[0]) : 'Rekam-Catatan-Terapi.pdf';

  const handlePrint = () => {
    triggerBrowserA4Print(fileName);
  };

  const handleDownloadPdf = async () => {
    if (!containerRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportProgress(10);
      const pageSheets = containerRef.current.querySelectorAll<HTMLElement>('.a4-sheet');
      if (!pageSheets || pageSheets.length === 0) {
        throw new Error('Tidak ada lembar A4 yang terdeteksi untuk diekspor.');
      }
      await exportPagesToPdf(Array.from(pageSheets), fileName, (pct) => {
        setExportProgress(pct);
      });
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Terjadi kendala saat menghasilkan PDF. Silakan gunakan tombol Cetak (A4) dan pilih opsi "Simpan sebagai PDF" di dialog browser.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Auto-trigger effect if requested
  useEffect(() => {
    if (isOpen && child && !hasAutoTriggered) {
      if (autoPrint) {
        setHasAutoTriggered(true);
        const timer = setTimeout(() => {
          handlePrint();
        }, 400);
        return () => clearTimeout(timer);
      } else if (autoDownloadPdf) {
        setHasAutoTriggered(true);
        const timer = setTimeout(() => {
          handleDownloadPdf();
        }, 400);
        return () => clearTimeout(timer);
      }
    }
    if (!isOpen) {
      setHasAutoTriggered(false);
    }
  }, [isOpen, autoPrint, autoDownloadPdf, child, hasAutoTriggered]);

  if (!isOpen || !child) return null;

  // Strict page-fit chunking so content stays within A4 297mm height
  const chunkedPages: (typeof notes)[] = [];
  let currentChunk: typeof notes = [];
  let currentChunkWeight = 0;

  notes.forEach((note) => {
    let weight = 0.9;
    if (note.detailedProgress) weight += 1.1;
    if (note.photoUrls && note.photoUrls.length > 0) weight += 0.5;
    if ((note.note || '').length > 200) weight += 0.4;
    if (note.sessionGoal || note.activitiesDone || note.therapyResult || note.childProgress || note.nextTarget) {
      weight += 0.7;
    }

    const maxWeight = chunkedPages.length === 0 ? 1.6 : 2.0;

    if (currentChunkWeight + weight > maxWeight && currentChunk.length > 0) {
      chunkedPages.push(currentChunk);
      currentChunk = [note];
      currentChunkWeight = weight;
    } else {
      currentChunk.push(note);
      currentChunkWeight += weight;
    }
  });

  if (currentChunk.length > 0 || chunkedPages.length === 0) {
    chunkedPages.push(currentChunk);
  }

  const totalPages = chunkedPages.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden animate-fade-in print:bg-white print:p-0 print:m-0 print:static print:overflow-visible">
      {/* TOP CONTROLS TOOLBAR (HIDDEN ON PRINT) */}
      <header className="no-print w-full bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg text-white z-20">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm font-serif">
            A4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[280px]">
                {child.name}
              </h2>
              <span className="bg-amber-900/80 text-amber-200 border border-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notes.length} Sesi Catatan
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Format: <strong className="text-slate-200">A4 Portrait (210×297 mm)</strong></span>
              <span>•</span>
              <span>Total <strong className="text-amber-400">{totalPages}</strong> Halaman Dokumen</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
            <button 
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} 
              className="p-1 hover:text-amber-400 transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))} 
              className="p-1 hover:text-amber-400 transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(0.8)} 
              className="text-[10px] text-slate-400 hover:text-white px-1 border-l border-slate-700"
            >
              Reset
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Cetak langsung ke dialog printer browser (Ukuran Kertas A4)"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak (A4)</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Download dokumen lengkap sebagai file .pdf resmi berukuran A4"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? `Membuat PDF (${exportProgress}%)...` : 'Unduh PDF (A4)'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors ml-1 cursor-pointer"
            title="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-6 lg:p-10 flex flex-col items-center custom-scrollbar print:p-0 print:m-0 print:overflow-visible print:w-auto">
        <div 
          ref={containerRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200 flex flex-col gap-10 items-center print:transform-none print:m-0 print:p-0 print:gap-0"
        >
          {chunkedPages.map((pageNotes, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === totalPages - 1;

            return (
              <div 
                key={pageIndex}
                className="a4-sheet therapy-print-sheet a4-print-page w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[10mm_12mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-between relative select-text overflow-hidden print:shadow-none print:border-none print:m-0 print:box-border"
              >
                {/* TOP HEADER / KOP SURAT (Render on every page) */}
                <div className="border-b-2 border-amber-900/30 pb-3 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight uppercase leading-tight font-serif">
                          Pelangi Lazuardi
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
                        LTC/{child.id}/{new Date().getFullYear()}
                      </span>
                      <p className="text-[9px] text-slate-500 font-semibold mt-1">
                        Tgl Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Document Title Banner */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-serif">
                      {reportTitle}
                    </h2>
                    <span className="text-[9px] font-bold text-slate-400">
                      Halaman {pageIndex + 1} dari {totalPages}
                    </span>
                  </div>
                </div>

                {/* STUDENT PROFILE STRIP (Only on Page 1) */}
                {isFirstPage && (
                  <div className="mb-3 p-3 bg-amber-50/50 rounded-xl border border-amber-900/15 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={child.photoUrl || `https://i.pravatar.cc/100?u=${child.id}`} 
                        alt={child.name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-900/20 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {child.name}
                          </h3>
                          <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-amber-900/10 text-amber-950 font-mono">
                            ID: {child.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mt-1">
                          <span>Kelas: <strong>{child.className || 'Kelas Terapi'}</strong></span>
                          <span>•</span>
                          <span>Orang Tua: <strong>{child.parentName || child.motherName || 'Bapak/Ibu'}</strong></span>
                          <span>•</span>
                          <span>Diagnosis: <strong className="text-indigo-900">{child.diagnosis || 'Terapi Tumbuh Kembang'}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right border-l border-amber-900/15 pl-4 shrink-0">
                      <p className="text-[9px] font-black uppercase text-amber-900/70 tracking-wider">Arsip Terpilih</p>
                      <p className="text-xl font-black text-amber-950">{notes.length} Sesi</p>
                    </div>
                  </div>
                )}

                {/* CONTENT AREA: SESSIONS ON THIS PAGE */}
                <div className="flex-1 space-y-3 overflow-hidden">
                  {pageNotes.map((note, nIdx) => {
                    const therapist = therapists.find(t => t.id === note.therapistId);
                    const colorInfo = getTherapyColorInfo(note.type);
                    const activities = note.activitiesDone || note.sessionActivities;
                    const result = note.therapyResult || note.sessionOutcome;
                    const obstacles = note.obstaclesFound || note.sessionObstacles;
                    const homeAdvice = note.homeActivityAdvice || note.homeSuggestions;

                    return (
                      <div 
                        key={note.id || nIdx} 
                        className="border border-slate-200 rounded-xl p-3 bg-white relative overflow-hidden break-inside-avoid text-xs"
                      >
                        {/* Session Left Color Stripe */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${colorInfo.badge}`} />

                        {/* Session Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5 font-serif">
                              <Calendar className="w-3.5 h-3.5 text-amber-700" />
                              <span>{note.time}</span>
                            </span>
                            {therapist && (
                              <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>Terapis: {therapist.name}</span>
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 font-black text-[9px] rounded uppercase tracking-wider ${colorInfo.badge}`}>
                            {colorInfo.name || note.type}
                          </span>
                        </div>

                        {/* Catatan Sesi Utama */}
                        {note.note && (
                          <div className="mb-2">
                            <p className="text-[11px] leading-relaxed text-slate-800 font-serif italic whitespace-pre-wrap">
                              &quot;{note.note}&quot;
                            </p>
                          </div>
                        )}

                        {/* Structured Clinical Fields Strip */}
                        {(note.sessionGoal || activities || result || note.childProgress || obstacles || note.nextTarget || homeAdvice) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px]">
                            {note.sessionGoal && (
                              <div className="space-y-0.5">
                                <span className="font-black text-indigo-900 uppercase text-[8px] flex items-center gap-1">
                                  <Target className="w-3 h-3 text-indigo-600" />
                                  Tujuan Sesi:
                                </span>
                                <p className="text-slate-700 font-medium">{note.sessionGoal}</p>
                              </div>
                            )}

                            {activities && (
                              <div className="space-y-0.5">
                                <span className="font-black text-slate-700 uppercase text-[8px]">Aktivitas yang Dilakukan:</span>
                                <p className="text-slate-700 font-medium">{activities}</p>
                              </div>
                            )}

                            {result && (
                              <div className="space-y-0.5">
                                <span className="font-black text-emerald-800 uppercase text-[8px]">Hasil & Evaluasi:</span>
                                <p className="text-slate-700 font-medium">{result}</p>
                              </div>
                            )}

                            {note.childProgress && (
                              <div className="space-y-0.5">
                                <span className="font-black text-purple-800 uppercase text-[8px]">Kemajuan Anak:</span>
                                <p className="text-slate-700 font-medium">{note.childProgress}</p>
                              </div>
                            )}

                            {obstacles && (
                              <div className="space-y-0.5">
                                <span className="font-black text-amber-800 uppercase text-[8px]">Kendala Ditemukan:</span>
                                <p className="text-slate-700 font-medium">{obstacles}</p>
                              </div>
                            )}

                            {note.nextTarget && (
                              <div className="space-y-0.5">
                                <span className="font-black text-blue-800 uppercase text-[8px]">Target Sesi Berikutnya:</span>
                                <p className="text-slate-700 font-medium">{note.nextTarget}</p>
                              </div>
                            )}

                            {homeAdvice && (
                              <div className="sm:col-span-2 space-y-0.5 pt-1 border-t border-slate-200/60">
                                <span className="font-black text-rose-800 uppercase text-[8px] flex items-center gap-1">
                                  <HeartHandshake className="w-3 h-3 text-rose-600" />
                                  Saran Aktivitas di Rumah untuk Orang Tua:
                                </span>
                                <p className="text-slate-800 font-medium italic">{homeAdvice}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Voice Note Indicator in Print View */}
                        {note.audioUrl && (
                          <div className="mb-2 px-2.5 py-1 bg-amber-50/80 border border-amber-200/80 rounded-md text-[9px] font-bold text-amber-900 flex items-center gap-2">
                            <span>🎙️</span>
                            <span>Voice Note / Pesan Suara Sesi Terlampir {note.audioDuration ? `(${Math.round(note.audioDuration)} detik)` : ''}</span>
                          </div>
                        )}

                        {/* Detailed Progress Checklist Table if Present */}
                        {note.detailedProgress && (
                          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 text-[9px]">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Program Intervensi */}
                              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/60">
                                <p className="font-black text-slate-700 uppercase tracking-wider mb-1 text-[8px]">
                                  Program Intervensi
                                </p>
                                <div className="space-y-0.5">
                                  {note.detailedProgress.interventionPrograms.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-slate-600">
                                      <span className="truncate pr-1">{p.label}</span>
                                      <span className={p.checked ? 'text-emerald-600 font-black' : 'text-slate-300'}>
                                        {p.checked ? '✓' : '—'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Kemajuan Latihan */}
                              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/60">
                                <p className="font-black text-slate-700 uppercase tracking-wider mb-1 text-[8px]">
                                  Kemajuan Latihan
                                </p>
                                <div className="space-y-0.5">
                                  {note.detailedProgress.exerciseProgress.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-slate-600">
                                      <span className="truncate pr-1">{p.label}</span>
                                      <span className={p.checked ? 'text-indigo-600 font-black' : 'text-slate-300'}>
                                        {p.checked ? '✓' : '—'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Aktivitas Fungsional Table */}
                            {note.detailedProgress.functionalActivities && note.detailedProgress.functionalActivities.length > 0 && note.detailedProgress.functionalActivities[0].activity && (
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 px-2 py-1 flex justify-between font-black text-[8px] text-slate-700 uppercase">
                                  <span>Aktivitas Fungsional</span>
                                  <div className="flex gap-4">
                                    <span>Kemandirian</span>
                                    <span>Akurasi</span>
                                  </div>
                                </div>
                                <div className="divide-y divide-slate-100 p-1.5 space-y-1">
                                  {note.detailedProgress.functionalActivities.map((fa, i) => (
                                    <div key={i} className="flex justify-between items-center text-slate-700">
                                      <span className="font-bold truncate max-w-[280px]">{fa.activity}</span>
                                      <div className="flex gap-4 text-right">
                                        <span className="text-slate-600">{fa.independence || '-'}</span>
                                        <span className="font-mono font-bold text-slate-900">{fa.accuracy || '-'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Photos attached */}
                        {note.photoUrls && note.photoUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                            {note.photoUrls.map((url, pIdx) => (
                              <div key={pIdx} className="relative rounded-lg overflow-hidden border border-slate-200 w-14 h-14 shadow-2xs">
                                <img src={url} alt={`Lampiran ${pIdx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[7px] px-1 font-bold">
                                  #{pIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SIGNATURES AREA (Only on the Last Page) */}
                {isLastPage && (
                  <div className="mt-3 pt-3 border-t border-slate-200 break-inside-avoid">
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
                        <p className="font-black text-slate-800 uppercase">{child.parentName || child.motherName || child.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE FOOTER */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 mt-2">
                  <span>Dokumen Resmi Rekam Catatan Klinis • Pelangi Lazuardi</span>
                  <span>Standar Format A4 Portrait (210×297 mm) • Hal {pageIndex + 1} dari {totalPages}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TherapyPrintPreviewModal;
