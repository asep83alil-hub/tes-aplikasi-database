import React from 'react';
import { Check, TrendingUp, Upload, X } from 'lucide-react';
import { Child } from '../types';
import { RapotSignatureConfig } from './RapotPrintPreviewModal';

export interface TherapyStudentInfo {
  nama: string;
  noRegistrasi: string;
  tglLahir: string;
  usia: string;
  unit: string; // Asal Sekolah
  tglEvaluasi: string;
  terapis: string;
  programTerapi: string;
}

export interface TherapyReportTemplateProps {
  pageIndex: number;
  totalPages: number;
  childName: string;
  therapyName: string;
  period: string;
  year: number;
  logoUrl?: string;
  schoolName?: string;
  schoolSubtitle?: string;
  schoolAddress?: string;
  headerBadge?: string;
  documentTitleText?: string;
  docNumber?: string;
  studentInfo?: TherapyStudentInfo;
  showWatermark?: boolean;
  children?: React.ReactNode;
}

/**
 * TherapyReportTemplate
 * Unified single-sheet A4 Portrait template for Rapot Terapi (210mm x 297mm with 15mm margins).
 * Consistently used for:
 * 1. Preview PDF
 * 2. Download PDF (html2canvas / jsPDF)
 * 3. Print A4 (browser print dialog)
 */
export const TherapyReportTemplate: React.FC<TherapyReportTemplateProps> = ({
  pageIndex,
  totalPages,
  childName,
  therapyName,
  period,
  year,
  logoUrl,
  schoolName,
  schoolSubtitle,
  schoolAddress,
  headerBadge,
  documentTitleText,
  docNumber,
  studentInfo,
  showWatermark = false,
  children,
}) => {
  const isFirstPage = pageIndex === 0;
  const pageNum = pageIndex + 1;

  return (
    <div
      className="a4-sheet a4-portrait margin-15mm w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[15mm] bg-white text-slate-800 shadow-2xl border border-slate-300 flex flex-col justify-between relative box-border print:shadow-none print:border-none print:rounded-none print:m-0 print:box-border print:break-after-page overflow-hidden font-sans"
      data-margin="15mm"
      data-orientation="portrait"
      style={{
        boxSizing: 'border-box',
        fontFamily: "'Inter', Arial, Helvetica, sans-serif",
      }}
    >
      {/* Strict Print & PDF Typography Styles */}
      <style>{`
        .a4-sheet {
          font-family: 'Inter', Arial, Helvetica, sans-serif !important;
          color: #0f172a !important;
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .report-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .section-title {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .report-table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .catatan-box {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          line-height: 1.6 !important;
          padding: 10px !important;
          text-align: justify !important;
        }
        .signature-section, .therapy-signature-block {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .a4-sheet .signature-block,
        .a4-sheet .therapy-signature-block,
        .signature-block {
          text-align: center !important;
          align-items: center !important;
          justify-content: center !important;
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          margin: 0 auto !important;
        }
        .a4-sheet .signature-box,
        .signature-box,
        .signature-area {
          min-height: 56px !important;
          max-height: 75px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          width: 100% !important;
          margin: 0 auto !important;
        }
        .a4-sheet .signature-line,
        .signature-line {
          width: 220px !important;
          max-width: 220px !important;
          height: 2px !important;
          background-color: #1f2937 !important;
          border: none !important;
          margin: 4px auto 6px auto !important;
          display: block !important;
        }
        .a4-sheet p.signature-name,
        .a4-sheet .signature-block .signature-name,
        .signature-name {
          font-size: 14px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          color: #0f172a !important;
          text-align: center !important;
          text-align-last: center !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          line-height: 1.3 !important;
          margin: 0 auto !important;
          width: 100% !important;
          display: block !important;
        }
        .a4-sheet p.signature-position,
        .a4-sheet p.signature-role,
        .a4-sheet .signature-block .signature-position,
        .a4-sheet .signature-block .signature-role,
        .signature-position,
        .signature-role {
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #555555 !important;
          text-align: center !important;
          text-align-last: center !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          line-height: 1.3 !important;
          margin: 2px auto 0 auto !important;
          width: 100% !important;
          display: block !important;
        }
        .a4-sheet .signature-section *,
        .a4-sheet .therapy-signature-block * {
          text-align: center !important;
          text-align-last: center !important;
        }
        .a4-sheet p.signature-title,
        .a4-sheet p.signature-header,
        .a4-sheet p.signature-knowing,
        .a4-sheet p.signature-date,
        .signature-title,
        .signature-header,
        .signature-knowing,
        .signature-date {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          color: #1e293b !important;
          text-align: center !important;
          text-align-last: center !important;
          margin: 0 auto 4px auto !important;
          width: 100% !important;
          display: block !important;
        }
        .upload-signature,
        .signature-upload-box,
        .upload-button {
          display: none !important;
        }
        .therapy-chart-block {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .a4-sheet h1, .a4-sheet .doc-title-main {
          font-size: 18px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
        }
        .a4-sheet h2, .a4-sheet h3, .a4-sheet .sub-judul, .a4-sheet .section-header-title {
          font-size: 13px !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
        }
        .a4-sheet table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        .a4-sheet thead {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .a4-sheet tbody tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .a4-sheet td, .a4-sheet th {
          vertical-align: middle !important;
          padding: 8px !important;
          font-size: 11px !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
        }
        .a4-sheet p:not([class*="signature-"]),
        .a4-sheet .content-text,
        .a4-sheet .catatan-text {
          font-size: 11px !important;
          line-height: 1.6 !important;
          text-align: justify !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          white-space: normal !important;
        }
        .a4-sheet .checkbox-box {
          width: 14px !important;
          height: 14px !important;
          min-width: 14px !important;
          min-height: 14px !important;
        }
        .a4-sheet .keterangan-kecil {
          font-size: 10px !important;
        }
        .a4-sheet .break-inside-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      `}</style>

      {/* Official Confidential Watermark */}
      {showWatermark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 print:flex"
        >
          <div className="border-[5px] border-slate-900/[0.04] text-slate-900/[0.04] font-black text-[95px] tracking-[0.25em] uppercase -rotate-45 px-10 py-3 rounded-2xl select-none font-sans">
            RAHASIA
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between h-full w-full">
        <div className="flex-1 flex flex-col justify-start">
          {/* Page Header: Full Kop on Page 1, Running Header on Subsequent Pages */}
          {isFirstPage ? (
            <>
              <TherapyKopHeader
                logoUrl={logoUrl}
                schoolName={schoolName}
                schoolSubtitle={schoolSubtitle}
                schoolAddress={schoolAddress}
                headerBadge={headerBadge}
                period={period}
                year={year}
                docNumber={docNumber}
              />
              {studentInfo && <TherapyStudentInfoTable info={studentInfo} />}
            </>
          ) : (
            <TherapyRunningHeader
              title={documentTitleText || 'PROGRESS REPORT'}
              childName={childName}
              therapyName={therapyName}
              period={period}
              year={year}
            />
          )}

          {/* Page Content Stream */}
          <div className="space-y-1.5 flex-1 flex flex-col justify-start">
            {children}
          </div>
        </div>

        {/* Running Footer */}
        <TherapyRunningFooter
          currentPage={pageNum}
          totalPages={totalPages}
          docNumber={docNumber}
        />
      </div>
    </div>
  );
};

// ===========================================================================
// 1. KOP HEADER RESMI (HALAMAN 1)
// ===========================================================================
export const TherapyKopHeader: React.FC<{
  logoUrl?: string;
  schoolName?: string;
  schoolSubtitle?: string;
  schoolAddress?: string;
  headerBadge?: string;
  period: string;
  year: number;
  docNumber?: string;
}> = ({
  logoUrl,
  schoolName,
  schoolSubtitle,
  schoolAddress,
  headerBadge,
  period,
  year,
  docNumber,
}) => (
  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2.5 mb-2.5 gap-4 shrink-0 font-sans">
    {/* Left: Logo & Identity */}
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Logo Pelangi Lazuardi"
          className="h-12 w-12 object-contain shrink-0"
        />
      ) : (
        <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter shrink-0 shadow-xs">
          PL
        </div>
      )}
      <div className="space-y-0.5">
        <h1 className="text-[16px] font-black text-slate-900 tracking-tight uppercase leading-tight font-sans">
          {schoolName || 'PELANGI LAZUARDI'}
        </h1>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
          {schoolSubtitle &&
          schoolSubtitle !== 'Pusat Layanan Tumbuh Kembang & Terapi Terpadu Anak'
            ? schoolSubtitle
            : 'PUSAT LAYANAN TUMBUH KEMBANG ANAK'}
        </p>
        <p className="text-[9px] text-slate-500 font-normal leading-tight max-w-[360px]">
          {schoolAddress &&
          !schoolAddress.includes('Lazuardi Garden') &&
          !schoolAddress.includes('753-1234')
            ? schoolAddress
            : 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841'}
        </p>
      </div>
    </div>

    {/* Right: Badge, Title, Period & Confidentiality */}
    <div className="text-right shrink-0 flex flex-col items-end">
      <div className="flex items-center gap-1.5 justify-end mb-1">
        <span className="inline-block border border-rose-300 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider shadow-2xs">
          RAHASIA / CONFIDENTIAL
        </span>
      </div>
      <span className="inline-block bg-slate-900 text-white text-[9.5px] font-bold uppercase px-2.5 py-1 rounded tracking-wider shadow-2xs">
        {headerBadge || 'LAPORAN KEMAJUAN TERAPI'}
      </span>
      <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-slate-600 font-bold">
        <span>PERIODE {period} {year}</span>
        {docNumber && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">No: {docNumber}</span>
          </>
        )}
      </div>
    </div>
  </div>
);

// ===========================================================================
// 2. RUNNING HEADER (HALAMAN 2+)
// ===========================================================================
export const TherapyRunningHeader: React.FC<{
  title: string;
  childName: string;
  therapyName: string;
  period: string;
  year: number;
}> = ({ title, childName, therapyName, period, year }) => (
  <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-2.5 text-[10px] text-slate-600 shrink-0 font-sans">
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-900 uppercase">PELANGI LAZUARDI</span>
      <span className="text-slate-300">|</span>
      <span className="font-semibold uppercase text-slate-700 truncate max-w-[200px]">{title}</span>
      <span className="text-slate-300">|</span>
      <span className="font-bold text-indigo-700 uppercase">{therapyName}</span>
      <span className="text-slate-300">|</span>
      <span className="font-bold text-rose-600 tracking-wider text-[9px] bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded uppercase">
        RAHASIA
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span>Siswa: <strong className="text-slate-900 uppercase">{childName}</strong></span>
      <span className="text-slate-300">•</span>
      <span>Periode: <strong className="text-slate-800 uppercase">{period} {year}</strong></span>
    </div>
  </div>
);

// ===========================================================================
// 3. TABEL INFORMASI SISWA
// Memuat 8 data wajib dengan word-wrap anti-terpotong
// ===========================================================================
export const TherapyStudentInfoTable: React.FC<{
  info: TherapyStudentInfo;
}> = ({ info }) => (
  <div
    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    className="report-section bg-slate-50/80 border border-slate-300 rounded-lg p-3 mb-2.5 shrink-0 font-sans shadow-2xs break-inside-avoid print:break-inside-avoid"
  >
    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
      <span>INFORMASI SISWA & EVALUASI</span>
      <span className="text-[9px] font-normal text-slate-400 capitalize">Data Resmi Siswa Terapi</span>
    </div>
    <table className="report-table w-full text-[11px] border-collapse" style={{ tableLayout: 'fixed' }}>
      <tbody>
        <tr>
          {/* Nama Lengkap */}
          <td
            className="w-1/4 p-1.5 align-top"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Nama Lengkap</span>
            <span className="font-bold text-slate-900 uppercase text-[11px] block">
              {info.nama || '-'}
            </span>
          </td>

          {/* Nomor Registrasi */}
          <td
            className="w-1/4 p-1.5 align-top"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">No. Registrasi</span>
            <span className="font-semibold text-slate-800 font-mono text-[11px] block">
              {info.noRegistrasi || '-'}
            </span>
          </td>

          {/* Asal Sekolah */}
          <td
            className="w-1/4 p-1.5 align-top"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Asal Sekolah</span>
            <span className="font-semibold text-slate-800 text-[11px] block">
              {info.unit || '-'}
            </span>
          </td>

          {/* Tanggal Evaluasi */}
          <td
            className="w-1/4 p-1.5 align-top"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Tanggal Evaluasi</span>
            <span className="font-semibold text-slate-800 text-[11px] block">
              {info.tglEvaluasi || '-'}
            </span>
          </td>
        </tr>

        <tr>
          {/* Tanggal Lahir */}
          <td
            className="w-1/4 p-1.5 align-top border-t border-slate-200/60"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Tanggal Lahir</span>
            <span className="font-semibold text-slate-800 text-[11px] block">
              {info.tglLahir || '-'}
            </span>
          </td>

          {/* Usia */}
          <td
            className="w-1/4 p-1.5 align-top border-t border-slate-200/60"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Usia</span>
            <span className="font-semibold text-slate-800 text-[11px] block">
              {info.usia || '-'}
            </span>
          </td>

          {/* Terapis */}
          <td
            className="w-1/4 p-1.5 align-top border-t border-slate-200/60"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Terapis</span>
            <span className="font-semibold text-slate-800 text-[11px] block">
              {info.terapis || '-'}
            </span>
          </td>

          {/* Program Terapi */}
          <td
            className="w-1/4 p-1.5 align-top border-t border-slate-200/60"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
          >
            <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-0.5">Program Terapi</span>
            <span className="font-bold text-indigo-900 uppercase text-[11px] block">
              {info.programTerapi || '-'}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// ===========================================================================
// 4. RUNNING FOOTER RESMI (SETIAP HALAMAN)
// Kiri: Pelangi Lazuardi | Tengah: Nomor Dokumen | Kanan: Halaman X dari Y
// ===========================================================================
export const TherapyRunningFooter: React.FC<{
  currentPage: number;
  totalPages: number;
  docNumber?: string;
}> = ({ currentPage, totalPages, docNumber }) => (
  <div className="mt-auto border-t border-slate-300 pt-2 pb-0.5 flex justify-between items-center text-[10px] text-slate-600 shrink-0 font-sans">
    {/* Kiri: Pelangi Lazuardi */}
    <div className="flex items-center gap-1.5 font-bold text-slate-800">
      <span>Pelangi Lazuardi</span>
      <span className="text-slate-300">•</span>
      <span className="text-rose-600 uppercase tracking-wider text-[9px] bg-rose-50 border border-rose-200 px-1 py-0.2 rounded font-bold">
        DOKUMEN RAHASIA
      </span>
    </div>

    {/* Tengah: Nomor Dokumen */}
    <div className="text-slate-500 font-mono text-[9.5px] truncate max-w-[220px]">
      {docNumber ? `No. Dok: ${docNumber}` : 'Pusat Layanan Tumbuh Kembang Anak'}
    </div>

    {/* Kanan: Halaman X dari Y */}
    <div className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded text-[10px]">
      Halaman {currentPage} dari {totalPages}
    </div>
  </div>
);

// ===========================================================================
// 5. UNIFIED THERAPY TABLE WITH 14px CHECKBOX & VERTICAL-ALIGN MIDDLE
// ===========================================================================
export interface TherapyTableProps {
  categoryTitle?: string;
  title?: string;
  headerTitle?: string;
  items: Array<{ label: string; awal?: any; hasil?: any; [k: string]: any }>;
  scale: string[];
  scaleExplanations?: string;
  komentar?: string;
  komentarLabel?: string;
  startIndex?: number;
  endIndex?: number;
  isContinuation?: boolean;
  isCategoryContinuation?: boolean;
  hideCategoryHeader?: boolean;
  headerAwal?: string;
  headerHasil?: string;
}

export const TherapyTable: React.FC<TherapyTableProps> = ({
  categoryTitle,
  title,
  headerTitle = 'INDIKATOR RESPON',
  items = [],
  scale = ['teramati', 'tidak'],
  scaleExplanations,
  komentar,
  komentarLabel = 'Catatan / Komentar :',
  startIndex = 0,
  endIndex,
  isContinuation = false,
  isCategoryContinuation = false,
  hideCategoryHeader = false,
  headerAwal = 'AWAL',
  headerHasil = 'HASIL',
}) => {
  const isMatch = (val: any, target: string) => {
    if (val === undefined || val === null) return false;
    return String(val).trim().toLowerCase() === String(target).trim().toLowerCase();
  };

  const colWidthClass =
    scale.length >= 4
      ? 'w-[48px] min-w-[44px] max-w-[54px]'
      : scale.length === 3
      ? 'w-[54px] min-w-[48px] max-w-[60px]'
      : 'w-[64px] min-w-[56px] max-w-[70px]';

  const visibleItems = items.slice(startIndex, endIndex !== undefined ? endIndex : items.length);
  const isLastPart = endIndex === undefined || endIndex >= items.length;

  return (
    <div
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      className="report-section space-y-1 font-sans break-inside-avoid print:break-inside-avoid"
    >
      {/* Category Heading Banner (e.g. A. SENSORY PROCESSING) */}
      {categoryTitle && !hideCategoryHeader && (
        <div className="section-title bg-slate-900 text-white px-3 py-1.5 rounded-md text-[12px] font-bold uppercase tracking-wider flex items-center justify-between shadow-2xs">
          <span>
            {categoryTitle} {isCategoryContinuation ? '(Lanjutan)' : ''}
          </span>
          {isCategoryContinuation && (
            <span className="text-[10px] text-slate-300 font-normal lowercase italic">(lanjutan)</span>
          )}
        </div>
      )}

      {/* Structured Table Container */}
      <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-2xs">
        {/* Subheading (e.g. 1. SENSORY MODULATION) */}
        {title && (
          <div className="section-title bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide flex justify-between items-center">
            <span>
              {title} {isContinuation ? '(Lanjutan)' : ''}
            </span>
          </div>
        )}

        {/* Table Header Row */}
        <table className="report-table w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-800 uppercase">
              <th className="py-2 px-3 text-left border-r border-slate-300 align-middle">
                {headerTitle}
              </th>

              {/* AWAL Column Group */}
              <th className="p-0 border-r border-slate-300 bg-slate-50 text-center align-middle" colSpan={scale.length}>
                <div className="py-1 border-b border-slate-300 text-[9.5px] font-bold text-slate-700 tracking-wider">
                  {headerAwal}
                </div>
                <div className="flex">
                  {scale.map((s) => (
                    <div
                      key={`th-awal-${s}`}
                      className={`${colWidthClass} text-center py-1 px-0.5 font-mono text-[9px] text-slate-700 font-bold break-words`}
                      title={s}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </th>

              {/* HASIL Column Group */}
              <th className="p-0 bg-slate-50 text-center align-middle" colSpan={scale.length}>
                <div className="py-1 border-b border-slate-300 text-[9.5px] font-bold text-indigo-950 tracking-wider">
                  {headerHasil}
                </div>
                <div className="flex">
                  {scale.map((s) => (
                    <div
                      key={`th-hasil-${s}`}
                      className={`${colWidthClass} text-center py-1 px-0.5 font-mono text-[9px] text-indigo-950 font-bold break-words`}
                      title={s}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleItems.map((it, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-slate-50/50">
                <td
                  className="py-1.5 px-3 border-r border-slate-200 text-slate-800 font-medium text-[11px] align-middle"
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  {it.label}
                </td>

                {/* AWAL Checkboxes */}
                {scale.map((s) => {
                  const checked = isMatch(it.awal, s);
                  return (
                    <td
                      key={`row-awal-${s}`}
                      className={`${colWidthClass} p-1 text-center border-r border-slate-200 align-middle`}
                    >
                      <div className="flex items-center justify-center">
                        <div
                          className={`checkbox checkbox-box w-[14px] h-[14px] min-w-[14px] min-h-[14px] border flex items-center justify-center rounded-xs transition-colors ${
                            checked
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                        </div>
                      </div>
                    </td>
                  );
                })}

                {/* HASIL Checkboxes */}
                {scale.map((s) => {
                  const checked = isMatch(it.hasil, s);
                  return (
                    <td
                      key={`row-hasil-${s}`}
                      className={`${colWidthClass} p-1 text-center border-r last:border-r-0 border-slate-200 align-middle`}
                    >
                      <div className="flex items-center justify-center">
                        <div
                          className={`checkbox checkbox-box w-[14px] h-[14px] min-w-[14px] min-h-[14px] border flex items-center justify-center rounded-xs transition-colors ${
                            checked
                              ? 'border-indigo-950 bg-indigo-950 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Scale Legend (only on last part) */}
        {scaleExplanations && isLastPart && (
          <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 text-[9.5px] text-slate-600 font-medium flex flex-wrap gap-x-3 gap-y-0.5">
            {scaleExplanations.split('|').map((part, pIdx) => (
              <span key={pIdx} className="inline-block">
                ● {part.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Integrated Comment Box (only on last part) */}
        {komentar && isLastPart && (
          <div className="p-2.5 bg-slate-50/80 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
              {komentarLabel}
            </span>
            <p
              className="text-[11px] text-slate-800 font-sans"
              style={{
                lineHeight: 1.6,
                textAlign: 'justify',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {komentar}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================================================================
// 6. CATATAN TERAPI / KESIMPULAN / REKOMENDASI BOX
// Memenuhi: line-height: 1.6; padding: 10px; text-align: justify;
// ===========================================================================
export const TherapyNotesBlock: React.FC<{
  title: string;
  content: string;
  badge?: string;
}> = ({ title, content, badge }) => (
  <div
    style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    className="report-section bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs font-sans break-inside-avoid print:break-inside-avoid"
  >
    <div className="section-title bg-slate-900 text-white px-3 py-1.5 flex justify-between items-center">
      <span className="text-[11px] font-bold uppercase tracking-wide">{title}</span>
      {badge && <span className="text-[9px] text-slate-300 font-mono">{badge}</span>}
    </div>
    <div
      className="catatan-box p-2.5 text-[11px] text-slate-800 bg-slate-50/50"
      style={{
        lineHeight: 1.6,
        padding: '10px',
        textAlign: 'justify',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
      }}
    >
      {content || '-'}
    </div>
  </div>
);

// ===========================================================================
// 7. AREA TANDA TANGAN RESMI (STANDAR DOKUMEN SEKOLAH / KLINIK)
// - Tidak ada duplikasi jabatan (jabatan hanya 1x di bawah nama)
// - Area TTD kompak & proporsional (min-height: 80px)
// - Grid simetris sejajar (gap: 80px)
// - Tipografi resmi: Nama 14px bold uppercase, Jabatan 12px 500 #555
// ===========================================================================
export const TherapySignatureBlock: React.FC<{
  config: RapotSignatureConfig;
  onUpdateConfig?: (cfg: RapotSignatureConfig) => void;
  onUploadImage?: (slot: 'signer1' | 'signer2' | 'signer3', file: File) => void;
  onRemoveImage?: (slot: 'signer1' | 'signer2' | 'signer3') => void;
  isStandalone?: boolean;
}> = ({
  config,
  isStandalone = false,
}) => {
  const isRow3Col = config.layout === '3-columns-row';
  const isStacked3Col = config.layout === '3-columns';
  const pos = config.position || 'compact';

  // Helper renderer untuk tanda tangan dengan format standar dokumen resmi
  const renderSignatureItem = (
    signer: { name: string; departmentTitle?: string; nip?: string; signatureImage?: string },
    defaultJabatan: string,
    roleTitleAbove?: string
  ) => {
    return (
      <div 
        className="signature-block flex flex-col items-center justify-center text-center w-full max-w-[260px] mx-auto"
        style={{
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Judul Peran: TERAPIS PENANGGUNG JAWAB / MENGETAHUI (posisi di tengah-tengah) */}
        {roleTitleAbove && (
          <p 
            className="signature-title signature-header text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5 min-h-[16px] text-center w-full"
            style={{ 
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textAlign: 'center', 
              textAlignLast: 'center', 
              width: '100%', 
              margin: '0 auto 2px auto',
              display: 'block' 
            }}
          >
            {roleTitleAbove}
          </p>
        )}

        {/* Signature Box (min-height: 56px, max-height gambar: 52px) */}
        <div 
          className="signature-box h-[58px] min-h-[58px] w-full flex items-center justify-center text-center my-0.5 select-none"
          style={{
            minHeight: '58px',
            height: '58px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {signer.signatureImage ? (
            <img
              src={signer.signatureImage}
              alt={`Tanda tangan ${signer.name}`}
              className="max-h-[52px] max-w-[190px] w-auto h-auto object-contain select-none mx-auto drop-shadow-2xs"
              style={{
                maxHeight: '52px',
                maxWidth: '190px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
              }}
            />
          ) : (
            <div 
              className="flex flex-col items-center justify-center text-center px-1 py-0.5 select-none w-full"
              style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}
            >
              <span 
                className="text-[9.5px] text-slate-400 font-normal leading-tight text-center w-full"
                style={{ textAlign: 'center', width: '100%', display: 'block' }}
              >
                Dokumen diterbitkan secara digital
              </span>
              <span 
                className="text-[8.5px] text-slate-400/80 font-normal leading-tight mt-0.5 text-center w-full"
                style={{ textAlign: 'center', width: '100%', display: 'block' }}
              >
                Tanda tangan resmi tersimpan
              </span>
            </div>
          )}
        </div>

        {/* Garis Nama: width 190px - 210px, persis di tengah */}
        <div 
          className="signature-line mx-auto"
          style={{
            width: '200px',
            maxWidth: '200px',
            height: '1.5px',
            backgroundColor: '#1f2937',
            margin: '3px auto 5px auto',
            display: 'block',
          }}
        />

        {/* Nama Penandatangan: font-size 13px, font-weight 700, uppercase, tepat di tengah garis */}
        <p
          className="signature-name text-[13px] font-bold uppercase text-slate-900 leading-snug w-full text-center"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            textAlign: 'center',
            textAlignLast: 'center',
            color: '#0f172a',
            margin: '0 auto',
            width: '100%',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            display: 'block',
          }}
        >
          {signer.name || '-'}
        </p>

        {/* SIP / STR / NIP jika ada */}
        {signer.nip && signer.nip.trim() !== '' && (
          <p
            className="text-[9.5px] font-mono text-slate-500 mt-0.5 w-full leading-tight text-center"
            style={{
              textAlign: 'center',
              textAlignLast: 'center',
              margin: '0 auto',
              width: '100%',
              display: 'block',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {signer.nip}
          </p>
        )}

        {/* Jabatan (HANYA SATU KALI DI BAWAH NAMA): tepat di tengah garis */}
        <p
          className="signature-position signature-role text-[11px] font-medium mt-0.5 w-full leading-snug text-center"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#555555',
            textAlign: 'center',
            textAlignLast: 'center',
            margin: '1px auto 0 auto',
            width: '100%',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            display: 'block',
          }}
        >
          {signer.departmentTitle || defaultJabatan}
        </p>
      </div>
    );
  };

  const dynamicMarginTop = isStandalone 
    ? 'auto' 
    : pos === 'bottom' 
      ? 'auto' 
      : pos === 'balanced' 
        ? '24px' 
        : '14px';

  return (
    <div
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        marginTop: dynamicMarginTop,
        marginBottom: '4px',
        textAlign: 'center',
      }}
      className={`report-section signature-section therapy-signature-block w-full bg-white/95 border border-slate-200/90 rounded-xl font-sans break-inside-avoid print:break-inside-avoid text-slate-800 ${
        isStandalone ? 'my-auto py-6 px-4 space-y-4' : 'py-2.5 px-3 space-y-2'
      }`}
    >
      {isRow3Col ? (
        // ===================================================================
        // 3-COLUMNS ROW LAYOUT (SANGAT HEMAT TEMPAT & RAPI UNTUK 1 LEMBAR)
        // Tempat, Tanggal di kanan atas, 3 kolom sejajar dalam 1 baris
        // ===================================================================
        <div className="space-y-2 w-full text-center" style={{ textAlign: 'center' }}>
          <div className="flex justify-end pr-4 text-[11.5px] font-semibold text-slate-700 text-right w-full">
            <span>{config.location || 'Cinere'}, {config.dateString || '19 Juni 2025'}</span>
          </div>

          <div 
            className="w-full max-w-[700px] mx-auto grid grid-cols-3 gap-3 items-start text-center"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              textAlign: 'center',
              alignItems: 'start',
              justifyItems: 'center',
            }}
          >
            {/* Kolom 1: Terapis Penanggung Jawab */}
            {renderSignatureItem(
              config.signer1,
              'Terapis Okupasi Terapi',
              config.signer1.roleTitle || 'TERAPIS PENANGGUNG JAWAB'
            )}

            {/* Kolom 2: Manager Pelangi Lazuardi RC */}
            {renderSignatureItem(
              config.signer2,
              'Manager Pelangi Lazuardi RC',
              config.signer2.roleTitle || 'MENGETAHUI'
            )}

            {/* Kolom 3: Kepala Pendidikan Inklusif Lazuardi GCS */}
            {renderSignatureItem(
              config.signer3,
              'Kepala Pendidikan Inklusif Lazuardi GCS',
              config.signer3.roleTitle || 'MENGETAHUI'
            )}
          </div>
        </div>
      ) : isStacked3Col ? (
        // ===================================================================
        // 3-TIER OFFICIAL LAYOUT (BERTINGKAT)
        // 1. Tempat & Tanggal + TERAPIS PENANGGUNG JAWAB di bagian atas
        // 2. MENGETAHUI dengan Grid 2 Kolom Simetris
        // ===================================================================
        <div className="space-y-2.5 w-full text-center" style={{ textAlign: 'center' }}>
          {/* Bagian Atas: Tempat, Tanggal & Terapis Penanggung Jawab */}
          <div className="flex flex-col items-center justify-center text-center w-full" style={{ textAlign: 'center' }}>
            <p 
              className="signature-date text-[11.5px] font-semibold text-slate-700 mb-0.5 text-center w-full" 
              style={{ textAlign: 'center', textAlignLast: 'center', width: '100%', margin: '0 auto 2px auto', display: 'block' }}
            >
              <span>{config.location || 'Cinere'}, {config.dateString || '19 Juni 2025'}</span>
            </p>

            {renderSignatureItem(
              config.signer1,
              'Terapis Okupasi Terapi',
              config.signer1.roleTitle || 'TERAPIS PENANGGUNG JAWAB'
            )}
          </div>

          {/* Bagian Bawah: MENGETAHUI (Grid 2 Kolom Simetris) */}
          <div className="pt-2 border-t border-slate-200 w-full space-y-2 text-center" style={{ textAlign: 'center' }}>
            <div className="text-center w-full" style={{ textAlign: 'center', width: '100%' }}>
              <p 
                className="signature-knowing signature-header signature-title text-[11px] font-bold text-slate-800 uppercase tracking-widest text-center w-full" 
                style={{ 
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textAlign: 'center', 
                  textAlignLast: 'center', 
                  width: '100%', 
                  margin: '0 auto', 
                  display: 'block' 
                }}
              >
                MENGETAHUI
              </p>
            </div>

            <div 
              className="w-full max-w-[640px] mx-auto px-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '44px',
                textAlign: 'center',
                alignItems: 'start',
                justifyItems: 'center',
              }}
            >
              {/* Kolom Manager Pelangi Lazuardi RC */}
              {renderSignatureItem(
                config.signer2,
                'Manager Pelangi Lazuardi RC'
              )}

              {/* Kolom Kepala Pendidikan Inklusif Lazuardi GCS */}
              {renderSignatureItem(
                config.signer3,
                'Kepala Pendidikan Inklusif Lazuardi GCS'
              )}
            </div>
          </div>
        </div>
      ) : (
        // ===================================================================
        // 2-COLUMN SYMMETRICAL LAYOUT
        // Tempat, Tanggal di kanan atas, 2 kolom simetris berdampingan
        // ===================================================================
        <div className="space-y-2 w-full text-center" style={{ textAlign: 'center' }}>
          <div className="flex justify-end pr-4 text-[11.5px] font-semibold text-slate-700 mb-0.5 text-right">
            <span>{config.location || 'Cinere'}, {config.dateString || '19 Juni 2025'}</span>
          </div>

          <div 
            className="w-full max-w-[640px] mx-auto px-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '48px',
              textAlign: 'center',
              alignItems: 'start',
              justifyItems: 'center',
            }}
          >
            {/* Kolom 1: Terapis Penanggung Jawab */}
            {renderSignatureItem(
              config.signer1,
              'Terapis Okupasi Terapi',
              config.signer1.roleTitle || 'TERAPIS PENANGGUNG JAWAB'
            )}

            {/* Kolom 2: Mengetahui / Manager */}
            {renderSignatureItem(
              config.signer2,
              config.signer2.departmentTitle || 'Manager Pelangi Lazuardi RC',
              config.signer2.roleTitle || 'MENGETAHUI'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
