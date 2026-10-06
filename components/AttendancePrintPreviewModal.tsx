import React, { useRef, useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileSpreadsheet,
  Check,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { exportPagesToPdf, triggerBrowserA4Print, formatAttendanceRecapDownloadFileName } from '../utils/rapotPdfGenerator';
import { downloadMonthlyAttendanceCSV } from '../utils/attendanceExcelGenerator';
import { Child, AttendanceStatus } from '../types';
import { RecapData } from './AttendanceRecapPage';

type MasterChild = Omit<Child, 'sessions'>;

interface AttendancePrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthKey: string;
  monthDisplayName: string;
  allChildren: MasterChild[];
  monthlyRecapData: RecapData[];
  overallStats: {
    totalSessions: number;
    totalPresent: number;
    totalAbsent: number;
    totalPermit: number;
    totalPending: number;
    avgAttendanceRate: string;
  };
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes?: { [dateKey: string]: { [sessionId: string]: string } };
  logoUrl?: string;
}

export const AttendancePrintPreviewModal: React.FC<AttendancePrintPreviewModalProps> = ({
  isOpen,
  onClose,
  monthKey,
  monthDisplayName,
  allChildren,
  monthlyRecapData,
  overallStats,
  attendanceRecords,
  attendanceNotes,
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'attention'>('all');

  const [yearNum, monthNum] = monthKey.split('-').map(Number);
  const fileName = formatAttendanceRecapDownloadFileName(monthDisplayName, yearNum);

  // Filtered dataset for print report
  const reportData = useMemo(() => {
    if (selectedFilter === 'high') {
      return monthlyRecapData.filter(d => d.attendanceRate >= 85 && d.present > 0);
    }
    if (selectedFilter === 'attention') {
      return monthlyRecapData.filter(d => d.absent > 0 || (d.attendanceRate < 85 && (d.present + d.absent > 0)));
    }
    return monthlyRecapData;
  }, [monthlyRecapData, selectedFilter]);

  // Intelligent pagination for A4 sheets:
  // Page 1 has Kop + KPI cards + table header, so it can comfortably hold ~13 rows.
  // Subsequent pages can hold ~20 rows.
  // If the last page has very little space left for signatures, wrap cleanly.
  const chunkedPages = useMemo(() => {
    const pages: RecapData[][] = [];
    if (reportData.length === 0) return [[]];

    const PAGE1_CAPACITY = 13;
    const SUBSEQUENT_CAPACITY = 20;

    let currentIndex = 0;
    
    // Page 1
    const firstPageChunk = reportData.slice(0, PAGE1_CAPACITY);
    pages.push(firstPageChunk);
    currentIndex = PAGE1_CAPACITY;

    // Subsequent pages
    while (currentIndex < reportData.length) {
      const nextChunk = reportData.slice(currentIndex, currentIndex + SUBSEQUENT_CAPACITY);
      pages.push(nextChunk);
      currentIndex += SUBSEQUENT_CAPACITY;
    }

    return pages;
  }, [reportData]);

  if (!isOpen) return null;

  const totalPages = chunkedPages.length;

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
        throw new Error('Tidak ada lembar halaman dokumen yang terdeteksi.');
      }
      await exportPagesToPdf(Array.from(pageSheets), fileName, (pct) => {
        setExportProgress(pct);
      });
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Terjadi kendala saat menghasilkan PDF. Silakan gunakan tombol Cetak (A4) lalu pilih opsi "Simpan sebagai PDF".');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDownloadExcel = () => {
    downloadMonthlyAttendanceCSV({
      monthKey,
      monthDisplayName,
      allChildren,
      monthlyRecapData: reportData,
      overallStats,
      attendanceRecords,
      attendanceNotes
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden animate-fade-in print:bg-white print:p-0 print:m-0 print:static print:overflow-visible">
      {/* TOP CONTROLS TOOLBAR (HIDDEN IN PRINT) */}
      <header className="print:hidden w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xl text-white z-20">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
            PDF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[320px]">
                Rekap Kehadiran - {monthDisplayName}
              </h2>
              <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {reportData.length} Siswa Terdata
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Orientasi: <strong>A4 Portrait (210×297 mm)</strong></span>
              <span>•</span>
              <span>Total <strong>{totalPages}</strong> Halaman Resmi</span>
            </p>
          </div>
        </div>

        {/* Center: Filter Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 mr-1.5 font-semibold">Filter Cetak:</span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({monthlyRecapData.length})
          </button>
          <button
            onClick={() => setSelectedFilter('high')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedFilter === 'high' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hadir ≥85%
          </button>
          <button
            onClick={() => setSelectedFilter('attention')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedFilter === 'attention' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ada Absen
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
            <button 
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors"
              title="Perbesar Tampilan"
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

          {/* Download Excel CSV Button */}
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            title="Download lembar data lengkap sebagai file spreadsheet (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Unduh Excel</span>
          </button>

          {/* Direct Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Cetak langsung menggunakan dialog printer browser"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Cetak (A4)</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Download dokumen lengkap sebagai file .pdf resmi"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? `Membuat PDF (${exportProgress}%)...` : 'Unduh PDF'}</span>
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
          {chunkedPages.map((pageRows, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === totalPages - 1;

            return (
              <div 
                key={pageIndex}
                className="a4-sheet bg-white text-slate-900 shadow-2xl relative flex flex-col justify-between"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  height: '297mm',
                  padding: '10mm 12mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* PAGE CONTENT CONTAINER */}
                <div>
                  {/* KOP SURAT RESMI (PAGE 1) */}
                  {isFirstPage ? (
                    <div className="mb-4">
                      <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900">
                        <img 
                          src={logoUrl} 
                          alt="Logo Pelangi Lazuardi" 
                          className="h-16 w-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png';
                          }}
                        />
                        <div className="flex-1 text-center">
                          <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                            PUSAT LAYANAN TERAPI TUMBUH KEMBANG
                          </h1>
                          <h2 className="text-xl font-extrabold tracking-wide text-indigo-900 uppercase">
                            PELANGI LAZUARDI
                          </h2>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">
                            Jl. Nerada Estate / Merdeka Raya No. 12, Ciputat, Tangerang Selatan • Telp: (021) 745-8899
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Layanan Terapi Terpadu: Okupasi (OT), Wicara (TW), Fisioterapi (FT), Remedial & Sensori Integrasi
                          </p>
                        </div>
                        <div className="h-16 w-16 invisible sm:visible"></div>
                      </div>
                      <div className="border-t border-slate-400 mt-0.5 mb-3"></div>

                      {/* DOCUMENT TITLE & PERIOD */}
                      <div className="text-center my-3">
                        <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                          LAPORAN REKAPITULASI KEHADIRAN SISWA BULANAN
                        </h2>
                        <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Periode: <strong>{monthDisplayName}</strong></span>
                        </div>
                      </div>

                      {/* 5 KPI SUMMARY BOXES */}
                      <div className="grid grid-cols-5 gap-2 my-3 text-center">
                        <div className="p-2 rounded-xl border border-slate-300 bg-slate-50">
                          <div className="text-[10px] font-bold text-slate-600 uppercase">Total Sesi</div>
                          <div className="text-lg font-black text-slate-900 mt-0.5">{overallStats.totalSessions}</div>
                          <div className="text-[9px] text-slate-500">Terjadwal</div>
                        </div>
                        <div className="p-2 rounded-xl border border-emerald-300 bg-emerald-50/60">
                          <div className="text-[10px] font-bold text-emerald-800 uppercase">Hadir</div>
                          <div className="text-lg font-black text-emerald-700 mt-0.5">{overallStats.totalPresent}</div>
                          <div className="text-[9px] font-bold text-emerald-700">{overallStats.avgAttendanceRate}% Sesi</div>
                        </div>
                        <div className="p-2 rounded-xl border border-rose-300 bg-rose-50/60">
                          <div className="text-[10px] font-bold text-rose-800 uppercase">Absen</div>
                          <div className="text-lg font-black text-rose-700 mt-0.5">{overallStats.totalAbsent}</div>
                          <div className="text-[9px] text-rose-600">Perlu Pengganti</div>
                        </div>
                        <div className="p-2 rounded-xl border border-amber-300 bg-amber-50/60">
                          <div className="text-[10px] font-bold text-amber-800 uppercase">Izin / Sakit</div>
                          <div className="text-lg font-black text-amber-700 mt-0.5">{overallStats.totalPermit}</div>
                          <div className="text-[9px] text-amber-600">Izin Resmi</div>
                        </div>
                        <div className="p-2 rounded-xl border border-indigo-300 bg-indigo-50/60">
                          <div className="text-[10px] font-bold text-indigo-800 uppercase">Total Siswa</div>
                          <div className="text-lg font-black text-indigo-900 mt-0.5">{monthlyRecapData.length}</div>
                          <div className="text-[9px] text-indigo-600">Terdaftar Aktif</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* COMPACT KOP FOR SUBSEQUENT PAGES */
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-300 text-xs">
                      <div className="flex items-center gap-2">
                        <img 
                          src={logoUrl} 
                          alt="Pelangi Lazuardi" 
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png';
                          }}
                        />
                        <span className="font-bold text-slate-800">
                          Pusat Terapi Pelangi Lazuardi — Laporan Rekap Kehadiran Siswa
                        </span>
                      </div>
                      <span className="font-medium text-slate-500">
                        Periode: <strong>{monthDisplayName}</strong> (Lanjutan)
                      </span>
                    </div>
                  )}

                  {/* DATA TABLE */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase tracking-wider text-[9.5px]">
                          <th className="py-2 px-2 text-center w-8">No</th>
                          <th className="py-2 px-2.5">ID Siswa</th>
                          <th className="py-2 px-3">Nama Lengkap Siswa</th>
                          <th className="py-2 px-2.5">Kelas</th>
                          <th className="py-2 px-2 text-center">Total</th>
                          <th className="py-2 px-2 text-center text-emerald-800">Hadir</th>
                          <th className="py-2 px-2 text-center text-rose-800">Absen</th>
                          <th className="py-2 px-2 text-center text-amber-800">Izin</th>
                          <th className="py-2 px-2.5 text-center">Kehadiran</th>
                          <th className="py-2 px-3 text-center">Evaluasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pageRows.map((item, rowIndex) => {
                          const globalRowNo = isFirstPage ? rowIndex + 1 : (pageIndex * 20 - (20 - 13)) + rowIndex + 1;
                          const isHigh = item.attendanceRate >= 85;
                          const isMedium = item.attendanceRate >= 70 && item.attendanceRate < 85;

                          return (
                            <tr key={item.childId} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="py-1.5 px-2 text-center font-mono font-medium text-slate-500">
                                {globalRowNo}
                              </td>
                              <td className="py-1.5 px-2.5 font-mono text-[10px] text-slate-600 font-semibold">
                                {item.childId}
                              </td>
                              <td className="py-1.5 px-3 font-bold text-slate-900">
                                {item.childName}
                              </td>
                              <td className="py-1.5 px-2.5 text-slate-600">
                                {item.className || 'Kelas Terapi'}
                              </td>
                              <td className="py-1.5 px-2 text-center font-mono font-semibold">
                                {item.totalSessions}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-emerald-700 bg-emerald-50/30">
                                {item.present}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-rose-700 bg-rose-50/30">
                                {item.absent > 0 ? item.absent : '-'}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-amber-700 bg-amber-50/30">
                                {item.permit > 0 ? item.permit : '-'}
                              </td>
                              <td className="py-1.5 px-2.5 text-center font-bold">
                                <span className={isHigh ? 'text-emerald-700' : isMedium ? 'text-amber-700' : 'text-rose-700'}>
                                  {item.attendanceRate}%
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-center">
                                {item.present + item.absent + item.permit === 0 ? (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                    Belum Mulai
                                  </span>
                                ) : isHigh ? (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                    Sangat Baik
                                  </span>
                                ) : isMedium ? (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                    Cukup
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                                    Perlu Perhatian
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* SIGNATURES & EVALUATION NOTES (ON LAST PAGE) */}
                  {isLastPage && (
                    <div className="mt-4 pt-3 border-t border-slate-300">
                      {/* Note / Disclaimer */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 mb-4 leading-relaxed">
                        <span className="font-bold text-slate-800">Catatan Koordinator Mutu:</span> Rekapitulasi kehadiran dihitung berdasarkan presensi harian pada jadwal sesi reguler. Siswa yang berstatus <strong className="text-rose-700">Absen</strong> dianjurkan untuk mengikuti sesi pengganti (make-up session) agar target program IEP tercapai maksimal.
                      </div>

                      {/* 2-Column Signature Block */}
                      <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-900 mt-4">
                        <div>
                          <p className="font-medium text-slate-700">Mengetahui,</p>
                          <p className="font-bold text-slate-900">Koordinator Layanan Terapi & Jadwal</p>
                          <div className="h-16 flex items-center justify-center">
                            <span className="text-[10px] text-slate-400 italic">( Tanda Tangan & Cap Digital )</span>
                          </div>
                          <p className="font-bold text-slate-900 underline">Rilla Serando, S.Tr.Kes</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIP: PL-KOORD-2026</p>
                        </div>

                        <div>
                          <p className="font-medium text-slate-700">Tangerang Selatan, {currentDateFormatted}</p>
                          <p className="font-bold text-slate-900">Kepala Pusat Terapi Pelangi Lazuardi</p>
                          <div className="h-16 flex items-center justify-center">
                            <span className="text-[10px] text-slate-400 italic">( Tanda Tangan & Cap Resmi )</span>
                          </div>
                          <p className="font-bold text-slate-900 underline">Dr. Anisa Rahmawati, M.Psi</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIP: PL-DIR-2026</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OFFICIAL FOOTER */}
                <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
                  <span>
                    Dokumen Rekapitulasi Presensi Digital Resmi • Dicetak: {currentDateFormatted}
                  </span>
                  <span>
                    Halaman <strong>{pageIndex + 1}</strong> dari <strong>{totalPages}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendancePrintPreviewModal;
