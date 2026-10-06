import React from 'react';
import { 
  AssessmentReport, 
  Child, 
  Therapist, 
  PSBData, 
  OTGeneralObservation, 
  OTSensoryModulation, 
  OTCombinedSensory, 
  OTFedc, 
  OTInterventionChecklist, 
  STAbilities, 
  PhysioGeneralBehavior, 
  PhysioSensoryModulation, 
  PhysioMotorSkills, 
  PhysioPhysicalFunctional 
} from '../types';
import { AssessmentSignatureConfig } from './AssessmentPrintPreviewModal';

type MasterChild = Omit<Child, 'sessions'>;

export interface AssessmentReportTemplateProps {
  report: AssessmentReport;
  child?: Partial<MasterChild> & { referredBy?: string };
  therapists?: Therapist[];
  logoUrl?: string;
  signatureConfig: AssessmentSignatureConfig;
  showWatermark?: boolean;
  selectedTherapyView?: string;
  layoutMode?: 'flow' | 'separate';
  pageInstances: Array<{
    id: string;
    renderContent: () => React.ReactNode;
  }>;
  pageIndex: number;
  totalPages: number;
  documentTitleText: string;
  activeTherapyLabel: string;
  defaultAssessmentDate: string;
}

/**
 * Single unified template component for Assessment Reports:
 * Strict A4 Portrait (210mm x 297mm) with 15mm margins on all 4 sides.
 * Used identically across:
 * - Preview PDF
 * - Download PDF (html2canvas -> jsPDF)
 * - Print A4 (browser print)
 */
export const AssessmentReportTemplate: React.FC<AssessmentReportTemplateProps> = ({
  report,
  child,
  therapists,
  logoUrl,
  signatureConfig,
  showWatermark = false,
  pageInstances,
  pageIndex,
  totalPages,
  documentTitleText,
  activeTherapyLabel,
  defaultAssessmentDate,
}) => {
  const isFirstPage = pageIndex === 0;
  const pageNum = pageIndex + 1;
  const childName = report.studentName || child?.name || 'Siswa Terapi';

  return (
    <div 
      className="a4-sheet a4-print-page margin-15mm w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[15mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-between relative select-text overflow-hidden font-sans"
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
        .a4-sheet td, .a4-sheet th {
          vertical-align: top !important;
          padding: 8px 10px !important;
          font-size: 11px !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
        }
        .a4-sheet p, .a4-sheet .assessment-paragraph, .a4-sheet .content-text {
          font-size: 11px !important;
          line-height: 1.6 !important;
          text-align: justify !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          white-space: normal !important;
        }
        .a4-sheet .text-caption, .a4-sheet .small-caption, .a4-sheet .keterangan-kecil {
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

      {/* Main Page Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {isFirstPage ? (
            <AssessmentKopHeader 
              logoUrl={logoUrl} 
              report={report} 
              defaultAssessmentDate={defaultAssessmentDate} 
              documentTitleText={documentTitleText}
            />
          ) : (
            <AssessmentRunningHeader 
              title={documentTitleText}
              childName={childName}
              activeTherapyLabel={activeTherapyLabel}
            />
          )}

          {/* First page includes Identity Table before flow blocks */}
          {isFirstPage && (
            <AssessmentIdentityTable 
              report={report}
              child={child}
              childName={childName}
              therapists={therapists}
              defaultAssessmentDate={defaultAssessmentDate}
            />
          )}

          {/* Page Flow Content Blocks */}
          <div className="space-y-3 flex-1 flex flex-col justify-start mt-2">
            {pageInstances.map(inst => (
              <div 
                key={inst.id} 
                className="break-inside-avoid print:break-inside-avoid"
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                {inst.renderContent()}
              </div>
            ))}
          </div>
        </div>

        {/* Footer on Every Page */}
        <AssessmentRunningFooter 
          currentPage={pageNum} 
          totalPages={totalPages} 
        />
      </div>
    </div>
  );
};

// ===========================================================================
// SUB-COMPONENTS: HEADER, IDENTITY, FOOTER
// ===========================================================================

export const AssessmentKopHeader: React.FC<{
  logoUrl?: string;
  report: AssessmentReport;
  defaultAssessmentDate: string;
  documentTitleText: string;
}> = ({ logoUrl, report, defaultAssessmentDate, documentTitleText }) => (
  <div className="border-b-2 border-slate-900 pb-3 mb-2.5 shrink-0">
    <div className="flex justify-between items-start gap-4">
      {/* Left: Logo & Institutional Identity */}
      <div className="flex items-center gap-3.5">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Logo Pelangi Lazuardi" 
            className="h-14 w-14 object-contain shrink-0" 
          />
        ) : (
          <div className="h-14 w-14 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl tracking-tighter shrink-0 shadow-xs">
            PL
          </div>
        )}
        <div className="space-y-0.5">
          <h1 
            style={{ fontSize: '18px', fontWeight: 700 }}
            className="text-slate-900 tracking-tight uppercase leading-tight font-bold"
          >
            PELANGI LAZUARDI GCS
          </h1>
          <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
            Pusat Layanan Tumbuh Kembang & Pendidikan Inklusif Anak
          </p>
          <p className="text-[10px] text-slate-500 font-normal leading-tight">
            Griya Cinere I, Jl. Garuda Ujung No. 35, Limo, Kota Depok • Telp: (021) 7534 841
          </p>
        </div>
      </div>

      {/* Right: Document Badges */}
      <div className="text-right shrink-0 space-y-1">
        <div className="flex items-center gap-1.5 justify-end">
          <span className="inline-block border border-rose-600 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider shadow-2xs">
            DOKUMEN RAHASIA / CONFIDENTIAL
          </span>
        </div>
        <p className="text-[10px] font-mono font-semibold text-slate-600 uppercase">
          No. Dokumen: AR/{report.id}
        </p>
        <p className="text-[10px] font-mono font-semibold text-slate-600 uppercase">
          Tgl. Laporan: {defaultAssessmentDate}
        </p>
      </div>
    </div>

    {/* Big Centered Document Title */}
    <div className="text-center pt-3 mt-2 border-t border-slate-200">
      <h2 
        style={{ fontSize: '18px', fontWeight: 700 }}
        className="text-slate-900 tracking-wide uppercase font-bold font-sans"
      >
        {documentTitleText || 'LAPORAN HASIL ASSESSMENT'}
      </h2>
    </div>
  </div>
);

export const AssessmentRunningHeader: React.FC<{
  title: string;
  childName: string;
  activeTherapyLabel: string;
}> = ({ title, childName, activeTherapyLabel }) => (
  <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3 text-[10px] text-slate-600 shrink-0">
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-900 uppercase">PELANGI LAZUARDI</span>
      <span className="text-slate-300">|</span>
      <span className="font-semibold uppercase text-slate-700 truncate max-w-[240px]">{title}</span>
      <span className="text-slate-300">|</span>
      <span className="font-bold text-indigo-700 uppercase">{activeTherapyLabel}</span>
      <span className="text-slate-300">|</span>
      <span className="font-bold text-rose-700 tracking-wider text-[9px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded uppercase">
        RAHASIA
      </span>
    </div>
    <div className="font-bold text-slate-900 truncate max-w-[200px]">
      {childName}
    </div>
  </div>
);

export const AssessmentRunningFooter: React.FC<{
  currentPage: number;
  totalPages: number;
}> = ({ currentPage, totalPages }) => (
  <div className="mt-auto pt-2.5 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 shrink-0 font-sans">
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-800">Pelangi Lazuardi GCS</span>
      <span>•</span>
      <span className="font-bold text-rose-600 uppercase tracking-wider text-[9px] bg-rose-50 border border-rose-200 px-1 rounded">
        DOKUMEN RAHASIA
      </span>
      <span>•</span>
      <span>Telp: (021) 7534 841</span>
      <span>•</span>
      <span className="text-indigo-600">pelangi@lazuardi.sch.id</span>
    </div>
    <div className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-[10px]">
      Halaman {currentPage} dari {totalPages}
    </div>
  </div>
);

export const AssessmentIdentityTable: React.FC<{
  report: AssessmentReport;
  child?: Partial<MasterChild> & { referredBy?: string };
  childName: string;
  therapists?: Therapist[];
  defaultAssessmentDate: string;
}> = ({ report, child, childName, therapists, defaultAssessmentDate }) => {
  const childObj = child || {};

  const allExaminers: { role: string; name: string }[] = [];
  if (report.occupationalTherapy?.examinerName) {
    allExaminers.push({ role: 'Terapis Okupasi', name: report.occupationalTherapy.examinerName });
  }
  if (report.speechTherapy?.examinerName) {
    allExaminers.push({ role: 'Terapis Wicara', name: report.speechTherapy.examinerName });
  }
  if (report.remedialTherapy?.examinerName) {
    allExaminers.push({ role: 'Terapis Remedial', name: report.remedialTherapy.examinerName });
  }
  if (report.physiotherapy?.examinerName) {
    allExaminers.push({ role: 'Fisioterapis', name: report.physiotherapy.examinerName });
  }

  const examDate = 
    report.occupationalTherapy?.examinationDate1 || 
    report.speechTherapy?.examinationDate || 
    report.remedialTherapy?.examinationDate || 
    report.physiotherapy?.examinationDate || 
    report.assessmentDate;

  const calculateAge = (bDate?: string) => {
    if (!bDate) return '-';
    try {
      const birth = new Date(bDate);
      if (isNaN(birth.getTime())) return '-';
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
      }
      return `${years} Thn ${months} Bln`;
    } catch {
      return '-';
    }
  };

  return (
    <div 
      className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs mb-3"
      style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
    >
      <div 
        style={{ fontSize: '13px', fontWeight: 600 }}
        className="bg-slate-900 text-white px-3 py-1.5 uppercase tracking-wide flex justify-between items-center"
      >
        <span>I. IDENTITAS SISWA & INFORMASI PEMERIKSAAN</span>
        <span className="text-[10px] font-normal opacity-85">Pelangi Lazuardi GCS</span>
      </div>

      <table className="w-full border-collapse text-[11px]">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="p-2 px-3 bg-slate-50 font-semibold w-[18%] text-slate-700 border-r border-slate-200 align-top">
              Nama Lengkap
            </td>
            <td 
              className="p-2 px-3 font-bold w-[32%] text-slate-900 border-r border-slate-200 align-top"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              {childName}
            </td>
            <td className="p-2 px-3 bg-slate-50 font-semibold w-[18%] text-slate-700 border-r border-slate-200 align-top">
              Tgl. Lahir / Usia
            </td>
            <td className="p-2 px-3 w-[32%] text-slate-800 align-top">
              {childObj.birthDate ? new Date(childObj.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              <span className="text-slate-500 font-medium ml-1.5">({calculateAge(childObj.birthDate)})</span>
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Jns Kelamin / Agama
            </td>
            <td className="p-2 px-3 border-r border-slate-200 text-slate-800 align-top">
              {childObj.gender || '-'} {childObj.religion ? `• ${childObj.religion}` : ''}
            </td>
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Kelas / Unit
            </td>
            <td className="p-2 px-3 text-slate-800 align-top">
              {childObj.className || '-'}
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Nama Orang Tua
            </td>
            <td 
              className="p-2 px-3 border-r border-slate-200 text-slate-800 align-top"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              {childObj.parentName ? `Ayah: ${childObj.parentName}` : ''}
              {childObj.parentName && childObj.motherName ? ' • ' : ''}
              {childObj.motherName ? `Ibu: ${childObj.motherName}` : ''}
              {!childObj.parentName && !childObj.motherName ? '-' : ''}
            </td>
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              No. Kontak / HP
            </td>
            <td className="p-2 px-3 text-slate-800 font-mono align-top">
              {childObj.phone || '-'}
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Asal Sekolah
            </td>
            <td className="p-2 px-3 border-r border-slate-200 text-slate-800 align-top">
              {childObj.originSchool || '-'}
            </td>
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Dirujuk Oleh
            </td>
            <td className="p-2 px-3 text-slate-800 align-top">
              {childObj.referredBy || '-'}
            </td>
          </tr>

          <tr className="border-b border-slate-200">
            <td className="p-2 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200 align-top">
              Alamat Tinggal
            </td>
            <td 
              className="p-2 px-3 text-slate-800 align-top" 
              colSpan={3}
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.5 }}
            >
              {childObj.address || '-'}
            </td>
          </tr>

          {/* Tim Pemeriksa & Tanggal */}
          <tr className="bg-slate-50/70 border-slate-200">
            <td className="p-2 px-3 font-semibold text-slate-900 border-r border-slate-200 align-top">
              Tim Pemeriksa
            </td>
            <td 
              className="p-2 px-3 border-r border-slate-200 text-slate-900 align-top"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              {allExaminers.length > 0 ? (
                <div className="space-y-1">
                  {allExaminers.map((ex, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="font-semibold text-indigo-900">• {ex.role}:</span>
                      <span className="font-bold text-slate-900">{ex.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="font-semibold text-slate-800">Tim Terapi Pelangi Lazuardi</span>
              )}
            </td>
            <td className="p-2 px-3 font-semibold text-slate-900 border-r border-slate-200 align-top">
              Tgl. Pemeriksaan
            </td>
            <td className="p-2 px-3 text-slate-900 font-semibold align-top">
              {examDate ? new Date(examDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : defaultAssessmentDate}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
