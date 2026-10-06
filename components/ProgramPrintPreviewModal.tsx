import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  Target, 
  Activity, 
  Layers, 
  Clock,
  Sparkles,
  Filter
} from 'lucide-react';
import { exportPagesToPdf, triggerBrowserA4Print, formatProgramDownloadFileName } from '../utils/rapotPdfGenerator';
import { Child, TherapyProgramItem, TherapyProgramCategory } from '../types';
import { getProgressConfig } from './TherapyProgramPage';
import { getTherapyColorInfo } from './ScheduleBoardPage';

interface ProgramPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | any;
  items: TherapyProgramItem[];
  categories: {
    id: TherapyProgramCategory;
    label: string;
    shortLabel: string;
    color: string;
    textColor: string;
    lightBg: string;
    borderColor: string;
    description: string;
    Icon?: any;
  }[];
  activeCategory?: TherapyProgramCategory;
  logoUrl?: string;
  autoPrint?: boolean;
  autoDownloadPdf?: boolean;
}

export const ProgramPrintPreviewModal: React.FC<ProgramPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  child,
  items,
  categories,
  activeCategory = 'ALL',
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png',
  autoPrint = false,
  autoDownloadPdf = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [hasAutoTriggered, setHasAutoTriggered] = useState<boolean>(false);
  
  // Filter mode: 'current' (category active) or 'all'
  const [filterScope, setFilterScope] = useState<'current' | 'all'>('all');

  const selectedCategoryObj = categories.find(c => c.id === activeCategory);
  const categoryLabel = filterScope === 'current' && selectedCategoryObj ? selectedCategoryObj.label : 'Semua Program';

  const filteredItems = useMemo(() => {
    if (filterScope === 'current' && activeCategory !== 'ALL') {
      return items.filter(it => {
        if (activeCategory === 'REM') {
          return it.therapyType === 'REM' || it.therapyType === 'REMEDIAL';
        }
        return it.therapyType === activeCategory;
      });
    }
    return items;
  }, [items, filterScope, activeCategory]);

  const fileName = child ? formatProgramDownloadFileName(child.name, categoryLabel) : 'Program-Terapi.pdf';

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
      console.error('Gagal mengekspor PDF Program Terapi:', err);
      alert('Terjadi kendala saat menghasilkan PDF. Silakan gunakan tombol Cetak (A4) dan pilih opsi "Simpan sebagai PDF" di dialog browser.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Auto-trigger effect
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
  const chunkedPages: (typeof filteredItems)[] = [];
  let currentChunk: typeof filteredItems = [];
  let currentChunkWeight = 0;

  filteredItems.forEach((item) => {
    // Weight points based on item length
    let weight = 0.55;
    if ((item.targetTerapi || '').length > 60) weight += 0.2;
    if ((item.aktifitasTerapi || '').length > 70) weight += 0.25;
    if (item.keterangan) weight += 0.15;

    // Page 1 has kop surat + student snapshot + title (~1.4 max items weight)
    // Subsequent pages hold ~2.1 max items weight
    const maxWeight = chunkedPages.length === 0 ? 1.4 : 2.1;

    if (currentChunkWeight + weight > maxWeight && currentChunk.length > 0) {
      chunkedPages.push(currentChunk);
      currentChunk = [item];
      currentChunkWeight = weight;
    } else {
      currentChunk.push(item);
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
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm font-serif">
            A4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[280px]">
                {child.name}
              </h2>
              <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {filteredItems.length} Target Program
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Format: <strong className="text-slate-200">A4 Portrait (210×297 mm)</strong></span>
              <span>•</span>
              <span>Total <strong className="text-indigo-400">{totalPages}</strong> Halaman Dokumen</span>
            </p>
          </div>
        </div>

        {/* Center: Scope Toggle (Current Category vs All) */}
        {activeCategory && activeCategory !== 'ALL' && selectedCategoryObj && (
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterScope === 'all' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Program ({items.length})
            </button>
            <button
              onClick={() => setFilterScope('current')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterScope === 'current' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Khusus {selectedCategoryObj.shortLabel} ({items.filter(it => it.therapyType === activeCategory || (activeCategory === 'REM' && it.therapyType === 'REMEDIAL')).length})
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
            <button 
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors"
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
            title="Cetak langsung ke dialog printer browser (Kertas A4)"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Cetak (A4)</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Download dokumen lengkap sebagai file PDF resmi berukuran A4"
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
          {chunkedPages.map((pageItems, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === totalPages - 1;

            return (
              <div 
                key={pageIndex}
                className="a4-sheet therapy-print-sheet a4-print-page w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[10mm_12mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-between relative select-text overflow-hidden print:shadow-none print:border-none print:m-0 print:box-border"
              >
                {/* TOP HEADER / KOP SURAT (Render on every page) */}
                <div className="border-b-2 border-indigo-900/30 pb-3 mb-3">
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
                        <p className="text-indigo-900 text-[10px] font-black tracking-widest uppercase">
                          Lazuardi Therapy Center • Program Rencana Intervensi Terapi
                        </p>
                        <p className="text-slate-400 text-[8px] font-medium mt-0.5">
                          Jl. Lazuardi No. 1, Jakarta Selatan • Telp: (021) 1234567 • www.lazuardi.sch.id
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 text-[9px] font-black rounded uppercase font-mono">
                        PROG/{child.id}/{new Date().getFullYear()}
                      </span>
                      <p className="text-[9px] text-slate-500 font-semibold mt-1">
                        Tgl Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Document Title Banner */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-serif">
                        Program Rencana Intervensi Terapi Siswa (Individualized Therapy Plan)
                      </h2>
                      <p className="text-[9px] text-indigo-800 font-bold uppercase tracking-wider mt-0.5">
                        Kategori: {categoryLabel}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      Halaman {pageIndex + 1} dari {totalPages}
                    </span>
                  </div>
                </div>

                {/* STUDENT PROFILE STRIP (Only on Page 1) */}
                {isFirstPage && (
                  <div className="mb-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-900/15 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={child.photoUrl || `https://i.pravatar.cc/100?u=${child.id}`} 
                        alt={child.name}
                        className="w-12 h-12 rounded-xl object-cover border border-indigo-900/20 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {child.name}
                          </h3>
                          <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-indigo-900/10 text-indigo-950 font-mono">
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
                    <div className="text-right border-l border-indigo-900/15 pl-4 shrink-0">
                      <p className="text-[9px] font-black uppercase text-indigo-900/70 tracking-wider">Total Target</p>
                      <p className="text-xl font-black text-indigo-950">{filteredItems.length} Item</p>
                    </div>
                  </div>
                )}

                {/* CONTENT AREA: PROGRAM ITEMS TABLE */}
                <div className="flex-1 overflow-hidden">
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-700 text-[10px] font-black uppercase tracking-wider border-b border-slate-300">
                        <th className="p-2 border-r border-slate-200 w-10 text-center">No</th>
                        <th className="p-2 border-r border-slate-200 w-24">Kategori & Waktu</th>
                        <th className="p-2 border-r border-slate-200 w-1/3">Target Terapi (Goal)</th>
                        <th className="p-2 border-r border-slate-200">Rencana Aktivitas & Strategi</th>
                        <th className="p-2 border-r border-slate-200 w-24 text-center">Status Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pageItems.map((item, idx) => {
                        const globalIndex = chunkedPages.slice(0, pageIndex).reduce((sum, p) => sum + p.length, 0) + idx + 1;
                        const categoryInfo = categories.find(c => 
                          item.therapyType === 'REM' || item.therapyType === 'REMEDIAL'
                            ? c.id === 'REM'
                            : c.id === item.therapyType
                        );
                        const progressCfg = getProgressConfig(item.progres);
                        const colorInfo = getTherapyColorInfo(item.therapyType);

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50">
                            {/* No */}
                            <td className="p-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top text-[10px]">
                              {globalIndex}
                            </td>

                            {/* Kategori & Waktu */}
                            <td className="p-2 border-r border-slate-200 align-top space-y-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${colorInfo.badge}`}>
                                {categoryInfo?.shortLabel || item.therapyType}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{item.targetWaktu || '3 Bulan'}</span>
                              </div>
                            </td>

                            {/* Target Terapi */}
                            <td className="p-2 border-r border-slate-200 align-top">
                              <p className="font-bold text-slate-900 text-[11px] leading-snug">
                                {item.targetTerapi}
                              </p>
                              {item.keterangan && (
                                <p className="text-[10px] text-slate-500 italic mt-1 font-serif">
                                  Catatan: {item.keterangan}
                                </p>
                              )}
                            </td>

                            {/* Aktivitas Terapi */}
                            <td className="p-2 border-r border-slate-200 align-top text-[11px] text-slate-700 leading-relaxed font-serif">
                              {item.aktifitasTerapi}
                            </td>

                            {/* Status Progres */}
                            <td className="p-2 border-r border-slate-200 align-top text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${progressCfg.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${progressCfg.dotColor}`}></span>
                                <span>{progressCfg.label}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl mt-4 p-6">
                      <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Belum ada item program terapi yang terdaftar.</p>
                    </div>
                  )}
                </div>

                {/* SIGNATURES AREA (Only on the Last Page) */}
                {isLastPage && (
                  <div className="mt-4 pt-3 border-t border-slate-200 break-inside-avoid">
                    <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
                      <div>
                        <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Terapis Penanggung Jawab,</p>
                        <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                        <p className="font-black text-slate-800 uppercase">Terapis LTC</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Koordinator Layanan Terapi,</p>
                        <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                        <p className="font-black text-slate-800 uppercase">Koord. Klinis LTC</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-500 uppercase text-[8px] mb-10">Orang Tua / Wali Murid,</p>
                        <div className="w-32 h-px bg-slate-300 mx-auto mb-1" />
                        <p className="font-black text-slate-800 uppercase">{child.parentName || child.motherName || child.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE FOOTER */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 mt-2">
                  <span>Dokumen Resmi Program Terapi • Pelangi Lazuardi</span>
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

export default ProgramPrintPreviewModal;
