import React, { useRef, useState, useMemo, useLayoutEffect, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sparkles,
  Edit,
  Check,
  FileText,
  AlertCircle,
  RefreshCw,
  Shield,
  PenTool,
  Upload,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { exportPagesToPdf, triggerBrowserA4Print, formatAssessmentDownloadFileName } from '../utils/rapotPdfGenerator';
import { 
  AssessmentReportTemplate, 
  AssessmentKopHeader, 
  AssessmentIdentityTable,
  AssessmentRunningHeader,
  AssessmentRunningFooter
} from './AssessmentReportTemplate';
import { 
  AssessmentReport, 
  Child, 
  Therapist, 
  TherapyDefinition, 
  OccupationalTherapyReport, 
  SpeechTherapyReport, 
  RemedialTherapyReport, 
  PhysiotherapyReport, 
  PSBData,
  PhysioGeneralBehavior,
  PhysioAwalHasil,
  PhysioResponsePair,
  PhysioModulationItem,
  PhysioModulationLevel,
  PhysioMotorItem,
  PhysioMotorLevel,
  PhysioGMFMItem,
  PhysioGMFMLevel,
  UserRole,
  OTGeneralObservation,
  OTSensoryModulation,
  OTCombinedSensory,
  OTFedc,
  OTInterventionChecklist,
  STAbilities
} from '../types';

type MasterChild = Omit<Child, 'sessions'>;

export interface AssessmentSignerItem {
  roleTitle: string;
  departmentTitle: string;
  name: string;
  nip?: string;
  signatureImage?: string;
}

export interface AssessmentSignatureConfig {
  layout: '2-columns' | '3-columns';
  location: string;
  dateString: string;
  signer1: AssessmentSignerItem; // Terapis Okupasi
  signerTW: AssessmentSignerItem; // Terapis Wicara (sejajar dengan terapis okupasi)
  signer2: AssessmentSignerItem; // Kepala Inklusi (di bawah dan posisinya di tengah)
  signer3: AssessmentSignerItem; // Orang Tua / Wali (opsional)
  showParentSignature?: boolean;
}

export const STORAGE_KEY_ASSESSMENT_SIGNATURES = 'pelangi360_assessment_print_signatures_v3';

export const getStoredAssessmentSignatures = (
  report: AssessmentReport | null,
  defaultDate: string,
  child?: Partial<MasterChild> & { referredBy?: string },
  therapists?: Therapist[]
): AssessmentSignatureConfig => {
  const defaultOTExaminer = 
    report?.occupationalTherapy?.examinerName ||
    (therapists?.find(t => t.specialties?.some(s => s?.toLowerCase().includes('ot') || s?.toLowerCase().includes('okupasi')) || t.name?.toLowerCase().includes('kameswari'))?.name) ||
    'Eka Talia Kameswari, A.Md.OT';

  const defaultTWExaminer = 
    report?.speechTherapy?.examinerName ||
    (therapists?.find(t => t.specialties?.some(s => s?.toLowerCase().includes('tw') || s?.toLowerCase().includes('speech') || s?.toLowerCase().includes('wicara')) || t.name?.toLowerCase().includes('wicara'))?.name) ||
    'Nurul Hidayati, S.Tr.Kes';

  const defaultConfig: AssessmentSignatureConfig = {
    layout: '2-columns',
    location: 'Depok',
    dateString: defaultDate,
    showParentSignature: false,
    signer1: {
      roleTitle: 'Terapis Okupasi,',
      departmentTitle: 'Pemeriksa Terapi Okupasi',
      name: defaultOTExaminer,
      nip: '',
    },
    signerTW: {
      roleTitle: 'Terapis Wicara,',
      departmentTitle: 'Pemeriksa Terapi Wicara',
      name: defaultTWExaminer,
      nip: '',
    },
    signer2: {
      roleTitle: 'Mengetahui,',
      departmentTitle: 'Kepala Pendidikan Inklusif Lazuardi GCS',
      name: 'Abdul Ghofar, A.Md.OT., S.Pd., M.H',
      nip: '',
    },
    signer3: {
      roleTitle: 'Menyetujui (Orang Tua / Wali),',
      departmentTitle: 'Orang Tua / Wali Siswa',
      name: child?.parentName || child?.motherName || 'Orang Tua / Wali',
      nip: '',
    }
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY_ASSESSMENT_SIGNATURES) || localStorage.getItem('pelangi360_assessment_print_signatures_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        layout: parsed.layout || defaultConfig.layout,
        location: parsed.location || defaultConfig.location,
        dateString: parsed.dateString || defaultConfig.dateString,
        showParentSignature: parsed.showParentSignature ?? defaultConfig.showParentSignature,
        signer1: {
          roleTitle: parsed.signer1?.roleTitle || defaultConfig.signer1.roleTitle,
          departmentTitle: parsed.signer1?.departmentTitle || defaultConfig.signer1.departmentTitle,
          name: parsed.signer1?.name || defaultConfig.signer1.name,
          nip: parsed.signer1?.nip ?? defaultConfig.signer1.nip,
          signatureImage: parsed.signer1?.signatureImage || defaultConfig.signer1.signatureImage,
        },
        signerTW: {
          roleTitle: parsed.signerTW?.roleTitle || defaultConfig.signerTW.roleTitle,
          departmentTitle: parsed.signerTW?.departmentTitle || defaultConfig.signerTW.departmentTitle,
          name: parsed.signerTW?.name || defaultConfig.signerTW.name,
          nip: parsed.signerTW?.nip ?? defaultConfig.signerTW.nip,
          signatureImage: parsed.signerTW?.signatureImage || defaultConfig.signerTW.signatureImage,
        },
        signer2: {
          roleTitle: parsed.signer2?.roleTitle || defaultConfig.signer2.roleTitle,
          departmentTitle: parsed.signer2?.departmentTitle || defaultConfig.signer2.departmentTitle,
          name: parsed.signer2?.name || defaultConfig.signer2.name,
          nip: parsed.signer2?.nip ?? defaultConfig.signer2.nip,
          signatureImage: parsed.signer2?.signatureImage || defaultConfig.signer2.signatureImage,
        },
        signer3: {
          roleTitle: parsed.signer3?.roleTitle || defaultConfig.signer3.roleTitle,
          departmentTitle: parsed.signer3?.departmentTitle || defaultConfig.signer3.departmentTitle,
          name: parsed.signer3?.name || defaultConfig.signer3.name,
          nip: parsed.signer3?.nip ?? defaultConfig.signer3.nip,
          signatureImage: parsed.signer3?.signatureImage || defaultConfig.signer3.signatureImage,
        }
      };
    }
  } catch (e) {
    console.error('Failed to load assessment signatures:', e);
  }
  return defaultConfig;
};

export const saveStoredAssessmentSignatures = (config: AssessmentSignatureConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY_ASSESSMENT_SIGNATURES, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save assessment signatures:', e);
  }
};

export const processSignatureFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0);
        // Remove light/white background
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          if (brightness >= 215) {
            data[i + 3] = 0;
          } else if (brightness >= 180) {
            const factor = (215 - brightness) / 35;
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface AssessmentPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AssessmentReport | null;
  child: (Partial<MasterChild> & { referredBy?: string }) | undefined;
  therapists: Therapist[];
  logoUrl?: string;
  therapyTypes: TherapyDefinition[];
  userRole: UserRole;
  onEdit: (report: AssessmentReport) => void;
  autoPrint?: boolean;
}

interface RenderProps {
  startIndex?: number;
  endIndex?: number;
  isContinuation?: boolean;
  hideCategoryHeader?: boolean;
}

interface FlowBlock {
  id: string;
  title?: string;
  categoryTitle?: string;
  isSignature?: boolean;
  canSplit?: boolean;
  totalItems?: number;
  headerHeight?: number;
  rowHeight?: number;
  footerHeight?: number;
  estimatedHeight: number;
  render: (props?: RenderProps) => React.ReactNode;
}

interface PageBlockInstance {
  id: string;
  block: FlowBlock;
  startIndex?: number;
  endIndex?: number;
  isContinuation?: boolean;
  hideCategoryHeader?: boolean;
}

// Helper to get age from birth date
const getAge = (birthDate: string | undefined): string => {
  if (!birthDate) return 'N/A';
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 'N/A';
  let age_y = today.getFullYear() - birth.getFullYear();
  let age_m = today.getMonth() - birth.getMonth();
  if (age_m < 0 || (age_m === 0 && today.getDate() < birth.getDate())) {
    age_y--;
    age_m += 12;
  }
  return `${age_y} Tahun ${age_m} Bulan`;
};

// Checkmark atom
const RenderCheck: React.FC<{ checked?: boolean | null }> = ({ checked }) => (
  <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs mx-auto ${
    checked ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'
  }`}>
    {checked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
  </div>
);

export const AssessmentPrintPreviewModal: React.FC<AssessmentPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  report,
  child,
  therapists = [],
  logoUrl,
  userRole,
  onEdit,
  autoPrint = false,
}) => {
  // =========================================================================
  // HOOKS: MUST ALL BE CALLED UNCONDITIONALLY AT THE TOP
  // =========================================================================
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(0.78);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  // Continuous Flow is the primary default: fills pages naturally and prevents large white gaps
  const [layoutMode, setLayoutMode] = useState<'flow' | 'separate'>('flow');
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const [selectedTherapyView, setSelectedTherapyView] = useState<'ALL' | 'OT' | 'ST' | 'REMEDIAL' | 'PHYSIO'>('ALL');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  const childName = child?.name || report?.studentName || 'Siswa';
  
  // Determine active therapy types in this report
  const hasOTRaw = Boolean(report?.occupationalTherapy);
  const hasSTRaw = Boolean(report?.speechTherapy);
  const hasRemedialRaw = Boolean(report?.remedialTherapy);
  const hasPhysioRaw = Boolean(report?.physiotherapy);

  // Active view filters
  const showOT = hasOTRaw && (selectedTherapyView === 'ALL' || selectedTherapyView === 'OT');
  const showST = hasSTRaw && (selectedTherapyView === 'ALL' || selectedTherapyView === 'ST');
  const showRemedial = hasRemedialRaw && (selectedTherapyView === 'ALL' || selectedTherapyView === 'REMEDIAL');
  const showPhysio = hasPhysioRaw && (selectedTherapyView === 'ALL' || selectedTherapyView === 'PHYSIO');

  const availableTherapies = useMemo(() => {
    const list: { id: 'ALL' | 'OT' | 'ST' | 'REMEDIAL' | 'PHYSIO'; label: string; badge: string }[] = [];
    const count = [hasOTRaw, hasSTRaw, hasRemedialRaw, hasPhysioRaw].filter(Boolean).length;
    if (count > 1) {
      list.push({ id: 'ALL', label: 'Semua Hasil', badge: `${count} Terapi` });
    }
    if (hasOTRaw) list.push({ id: 'OT', label: 'Okupasi Terapi', badge: 'OT' });
    if (hasSTRaw) list.push({ id: 'ST', label: 'Terapi Wicara', badge: 'TW' });
    if (hasRemedialRaw) list.push({ id: 'REMEDIAL', label: 'Remedial', badge: 'Rem' });
    if (hasPhysioRaw) list.push({ id: 'PHYSIO', label: 'Fisioterapi', badge: 'FT' });
    return list;
  }, [hasOTRaw, hasSTRaw, hasRemedialRaw, hasPhysioRaw]);

  const activeTherapyLabel = 
    showOT && showST ? 'Okupasi Terapi & Terapi Wicara' :
    showOT && !showST && !showRemedial && !showPhysio ? 'Okupasi Terapi' :
    showST && !showOT && !showRemedial && !showPhysio ? 'Terapi Wicara' :
    showRemedial && !showOT && !showST && !showPhysio ? 'Terapi Remedial' :
    showPhysio && !showOT && !showST && !showRemedial ? 'Fisioterapi' : 'Pemeriksaan Assesmen';

  const documentTitleText = 
    showOT && showST ? 'HASIL PEMERIKSAAN OKUPASI TERAPI & TERAPI WICARA' :
    showOT ? 'HASIL PEMERIKSAAN OKUPASI TERAPI' :
    showST ? 'HASIL PEMERIKSAAN TERAPI WICARA' :
    showRemedial ? 'LAPORAN PERKEMBANGAN TERAPI REMEDIAL' :
    showPhysio ? 'PHYSIOTHERAPY PROGRESS REPORT' : 'HASIL PEMERIKSAAN ASSESMEN ANAK';

  const defaultAssessmentDate = report?.assessmentDate 
    ? new Date(report.assessmentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Standardized file name
  const pdfFileName = formatAssessmentDownloadFileName(childName, activeTherapyLabel, report?.assessmentDate);

  // Signature customization state
  const [isSignatureSettingsOpen, setIsSignatureSettingsOpen] = useState<boolean>(false);
  const [signatureConfig, setSignatureConfig] = useState<AssessmentSignatureConfig>(() =>
    getStoredAssessmentSignatures(report, defaultAssessmentDate, child, therapists)
  );

  useEffect(() => {
    setSignatureConfig(getStoredAssessmentSignatures(report, defaultAssessmentDate, child, therapists));
  }, [report?.id, child?.name, report?.occupationalTherapy?.examinerName, report?.speechTherapy?.examinerName]);

  const handleUpdateSignatureConfig = (newConfig: AssessmentSignatureConfig) => {
    setSignatureConfig(newConfig);
    saveStoredAssessmentSignatures(newConfig);
  };

  const handleSignerImageUpload = async (slot: 'signer1' | 'signerTW' | 'signer2' | 'signer3', file: File) => {
    try {
      const dataUrl = await processSignatureFileToDataUrl(file);
      const targetSigner = signatureConfig[slot] || {
        roleTitle: '',
        departmentTitle: '',
        name: '',
      };
      const updated: AssessmentSignatureConfig = {
        ...signatureConfig,
        [slot]: {
          ...targetSigner,
          signatureImage: dataUrl,
        }
      };
      handleUpdateSignatureConfig(updated);
    } catch (err) {
      console.error('Error processing signature image:', err);
    }
  };

  const handleRemoveSignerImage = (slot: 'signer1' | 'signerTW' | 'signer2' | 'signer3') => {
    const targetSigner = signatureConfig[slot] || {
      roleTitle: '',
      departmentTitle: '',
      name: '',
    };
    const updated: AssessmentSignatureConfig = {
      ...signatureConfig,
      [slot]: {
        ...targetSigner,
        signatureImage: undefined,
      }
    };
    handleUpdateSignatureConfig(updated);
  };

  // =========================================================================
  // 1. SHARED HEADER & FOOTER ATOMS (DELEGATING TO UNIFIED TEMPLATE)
  // =========================================================================
  const FullKop = () => (
    <AssessmentKopHeader 
      logoUrl={logoUrl} 
      report={report} 
      defaultAssessmentDate={defaultAssessmentDate} 
      documentTitleText={documentTitleText}
    />
  );

  const IdentityAndExaminerTable = () => (
    <AssessmentIdentityTable 
      report={report}
      child={child}
      childName={childName}
      therapists={therapists}
      defaultAssessmentDate={defaultAssessmentDate}
    />
  );

  const RunningHeader = ({ title }: { title: string }) => (
    <AssessmentRunningHeader 
      title={title} 
      childName={childName} 
      activeTherapyLabel={activeTherapyLabel} 
    />
  );

  const RunningFooter = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
    <AssessmentRunningFooter 
      currentPage={currentPage} 
      totalPages={totalPages} 
    />
  );

  // =========================================================================
  // 3. FLOW BLOCKS GENERATION (OT, ST, Remedial, Physio, PSB, Signature)
  // Continuous units without forced page breaks or artificial blank spaces
  // =========================================================================
  const flowBlocks = useMemo<FlowBlock[]>(() => {
    if (!report) return [];
    const blocks: FlowBlock[] = [];

    // -----------------------------------------------------------------------
    // A. OCCUPATIONAL THERAPY (OT)
    // -----------------------------------------------------------------------
    if (showOT && report.occupationalTherapy) {
      const ot = report.occupationalTherapy;
      const genObs: Partial<OTGeneralObservation> = ot.generalObservation || {};
      const sensMod: Partial<OTSensoryModulation> = ot.sensoryModulation || {};
      const combSens: Partial<OTCombinedSensory> = ot.combinedSensory || {};
      const fedc: Partial<OTFedc> = ot.fedc || {};
      const occArea: OTInterventionChecklist = ot.occupationalArea || {};
      const perfSkills: OTInterventionChecklist = ot.performanceSkills || {};
      const intMethods = ot.interventionMethods || { preparationAndTask: false, educationAndTraining: false, advocacy: false, groupIntervention: false };
      const outcome: OTInterventionChecklist = ot.outcome || {};

      // OT Section Header Banner
      blocks.push({
        id: 'ot-section-header',
        title: 'HASIL PEMERIKSAAN OKUPASI TERAPI',
        estimatedHeight: 45,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="bg-slate-900 text-white px-3.5 py-2 rounded-lg flex items-center justify-between shadow-2xs border border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-[13px] font-bold uppercase tracking-wider font-sans">
                HASIL PEMERIKSAAN OKUPASI TERAPI
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-slate-300 font-medium">Pemeriksa: <strong className="text-white">{ot.examinerName || 'Terapis Okupasi'}</strong></span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-600 px-2 py-0.5 rounded text-white shadow-2xs">
                RAHASIA
              </span>
            </div>
          </div>
        )
      });

      // 1. Pengamatan Umum
      blocks.push({
        id: 'ot-pengamatan-umum',
        categoryTitle: 'B. Pengamatan Sensori Integrasi',
        title: '1. Pengamatan Umum',
        estimatedHeight: 180,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide flex justify-between items-center"
            >
              <span>B. Pengamatan Sensori Integrasi — 1. Pengamatan Umum</span>
              <span className="text-[10px] font-normal opacity-80">Observasi Perilaku</span>
            </div>
            <table className="w-full border-collapse text-[11px]">
              <tbody className="divide-y divide-slate-200">
                <tr className="align-top">
                  <td className="w-1/3 p-2 px-3 bg-slate-50 border-r border-slate-200 font-semibold text-slate-700">Reaksi Terhadap Pemeriksa</td>
                  <td 
                    className="w-2/3 p-2 px-3 text-slate-900"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {genObs.reactionToExaminer || '-'}
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="w-1/3 p-2 px-3 bg-slate-50 border-r border-slate-200 font-semibold text-slate-700">Reaksi Terhadap Pemeriksaan</td>
                  <td 
                    className="w-2/3 p-2 px-3 text-slate-900"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {genObs.reactionToExamination || '-'}
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="w-1/3 p-2 px-3 bg-slate-50 border-r border-slate-200 font-semibold text-slate-700">Perilaku yang Mencolok</td>
                  <td 
                    className="w-2/3 p-2 px-3 text-slate-900"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {genObs.conspicuousBehavior || '-'}
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="w-1/3 p-2 px-3 bg-slate-50 border-r border-slate-200 font-semibold text-slate-700">Keadaan Hasrat / Semangat</td>
                  <td 
                    className="w-2/3 p-2 px-3 text-slate-900"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {genObs.desireSpirit || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      });

      // 2. Pengamatan Sensori Modulasi
      blocks.push({
        id: 'ot-sensori-modulasi',
        categoryTitle: 'B. Pengamatan Sensori Integrasi',
        title: '2. Pengamatan Sensori Modulasi',
        estimatedHeight: 250,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide flex justify-between items-center"
            >
              <span>2. Pengamatan Sensori Modulasi</span>
              <span className="text-[10px] font-normal opacity-80">(Respon Input Sensori)</span>
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300 text-slate-800">
                <tr>
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[35%]">Input Sensori & Aktivitas</th>
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[50%]">Komentar & Catatan Klinis</th>
                  <th className="p-2 px-3 text-center w-[15%]">Respon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'tactile', label: 'a. Respon terhadap input Taktil', desc: 'Sentuhan ringan, mengenakan pakaian, sentuhan tiba-tiba, getaran' },
                  { key: 'proprioceptive', label: 'b. Respon terhadap input Proprioseptif', desc: 'Jatuh / menabrak, mendorong dan menarik, bergetaran' },
                  { key: 'vestibular', label: 'c. Respon terhadap Input Vestibular', desc: 'Gerakan linear/angular, ayunan, ketinggian, bola terapi' },
                  { key: 'auditory', label: 'd. Respon terhadap Input Auditori', desc: 'Terganggu bising, suara bel/mesin, menutup telinga' },
                  { key: 'visual', label: 'e. Respon Terhadap Input Visual', desc: 'Reaksi thd lampu/objek bergerak, kontak tatap mata' },
                ].map(item => {
                  const mod = sensMod[item.key as keyof OTSensoryModulation] || { response: '', comment: '' };
                  return (
                    <tr key={item.key} className="align-top odd:bg-white even:bg-slate-50/50">
                      <td className="p-2 px-3 border-r border-slate-200">
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        <div className="text-[10px] text-slate-500 italic mt-0.5">{item.desc}</div>
                      </td>
                      <td 
                        className="p-2 px-3 border-r border-slate-200 text-slate-900"
                        style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                      >
                        {mod.comment || '-'}
                      </td>
                      <td className="p-2 px-3 text-center align-middle">
                        <span className="inline-block bg-blue-50 text-blue-800 font-bold border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                          {mod.response || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      });

      // 3. Proses Sensori Kombinasi
      blocks.push({
        id: 'ot-sensori-kombinasi',
        title: '3. Proses Sensori Kombinasi',
        estimatedHeight: 110,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide flex justify-between items-center"
            >
              <span>3. Pengamatan Sensori Modulasi / Proses Sensori Kombinasi</span>
              <span className="text-[10px] font-normal opacity-80">Integrasi Multisensori</span>
            </div>
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2 px-3 font-semibold w-[45%] border-r border-slate-200 text-slate-700">
                    Input: Visual + Vestibular + Proprioseptif
                  </td>
                  <td className="p-2 px-3 font-semibold w-[55%]">
                    Performa: <span className="text-blue-700 uppercase font-bold ml-1">{combSens.performance || '-'}</span>
                  </td>
                </tr>
                <tr>
                  <td 
                    colSpan={2} 
                    className="p-2 px-3 text-slate-900"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    <strong className="text-slate-700 block mb-0.5">Komentar Klinis:</strong>
                    {combSens.comment || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      });

      // 4. FEDC
      blocks.push({
        id: 'ot-fedc',
        categoryTitle: 'C. FEDC',
        title: 'C. Hasil Pengamatan FEDC',
        estimatedHeight: 250,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide flex justify-between items-center"
            >
              <span>C. Hasil Pengamatan Functional Emotional Developmental Capacities (FEDC)</span>
              <span className="text-[10px] font-normal opacity-80">Tahapan Perkembangan</span>
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300 text-slate-800">
                <tr>
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[35%]">Kapasitas FEDC</th>
                  <th className="p-2 px-3 text-left w-[65%]">Penjelasan & Pengamatan Klinis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'regulationAndAttention', label: '1. Regulation and Attention' },
                  { key: 'engagementAndRelating', label: '2. Engagement and Relating' },
                  { key: 'purposefulCommunication', label: '3. Purposeful Communication' },
                  { key: 'complexCommunication', label: '4. Complex Communication' },
                  { key: 'creativeAndMeaningful', label: '5. Creative and Meaningful of ideas' },
                  { key: 'buildingLogicalBridges', label: '6. Building Logical Bridges' },
                ].map(item => (
                  <tr key={item.key} className="align-top odd:bg-white even:bg-slate-50/50">
                    <td className="p-2 px-3 font-semibold text-slate-800 border-r border-slate-200">{item.label}</td>
                    <td 
                      className="p-2 px-3 text-slate-900"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                      {fedc[item.key as keyof OTFedc] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      });

      // 5. OT Intervention (Occupational Area, Performance Skills, Body Function, Approaches)
      blocks.push({
        id: 'ot-intervention',
        categoryTitle: 'II. INTERVENSI TERAPI OKUPASI',
        title: 'A. Occupational Therapy Intervention',
        estimatedHeight: 280,
        render: () => {
          const occAreaOptions = [
            { key: 'adlsSelfCare', label: 'ADLs-Self care', approach: 'Theleterapy' },
            { key: 'adlsControlSphincter', label: 'ADLs-Control Sphincter', approach: 'Shift Therapy' },
            { key: 'adlsFunctionalMobility', label: 'ADLs-Functional Mobility', approach: 'Create, health Promotion' },
            { key: 'adlsLocomotion', label: 'ADLs-Locomotion', approach: 'Remediasi, restorasi' },
            { key: 'iadls', label: 'IADLs', approach: 'Pemeliharaan' },
            { key: 'restAndSleep', label: 'Rest and Sleep', approach: 'Modifikasi (adaptasi,kompensasi)' },
            { key: 'educationalParticipation', label: 'Educational Participation', approach: 'Prevensi' },
            { key: 'play', label: 'Play', approach: '' },
            { key: 'leisure', label: 'Leisure', approach: '' },
          ];
          const perfSkillsOptions = [
            { key: 'sensoryPerceptualSkills', label: 'Sensory Perceptual Skills', approach: 'Theleterapy' },
            { key: 'motorAndPraxisSkills', label: 'Motor and Praxis Skills', approach: 'Shift Therapy' },
            { key: 'emotionalRegulationSkills', label: 'Emotional Regulation Skills', approach: 'Create, health Promotion' },
            { key: 'cognitiveSkills', label: 'Cognitive Skills', approach: 'Remediasi, restorasi' },
            { key: 'communicationAndSocialSkills', label: 'Communication and Social Skills', approach: 'Pemeliharaan' },
          ];

          return (
            <div 
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              className="space-y-2 text-[11px]"
            >
              <div 
                style={{ fontSize: '13px', fontWeight: 600 }}
                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-wide"
              >
                II. OCCUPATIONAL THERAPY INTERVENTION & OUTCOME
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Column 1: Area Okupasional & Metode */}
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <div 
                    style={{ fontSize: '12px', fontWeight: 600 }}
                    className="bg-blue-950 text-white px-3 py-1.5 uppercase flex justify-between items-center"
                  >
                    <span>Area Okupasional</span>
                    <span className="text-[10px] opacity-80">Pendekatan</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {occAreaOptions.map(opt => (
                      <div key={opt.key} className="flex items-center justify-between p-1.5 px-3 odd:bg-white even:bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <RenderCheck checked={Boolean(occArea[opt.key])} />
                          <span className="font-semibold text-slate-800 text-[11px]">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 italic">{opt.approach}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-2.5 px-3 border-t border-slate-300">
                    <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wide">Metode Intervensi:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <RenderCheck checked={Boolean(intMethods.preparationAndTask)} />
                        <span>Persiapan & Tugas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RenderCheck checked={Boolean(intMethods.educationAndTraining)} />
                        <span>Edukasi & Training</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RenderCheck checked={Boolean(intMethods.advocacy)} />
                        <span>Advokasi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RenderCheck checked={Boolean(intMethods.groupIntervention)} />
                        <span>Intervensi Kelompok</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Performance Skills & Body Function */}
                <div className="space-y-2 flex flex-col">
                  <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <div 
                      style={{ fontSize: '12px', fontWeight: 600 }}
                      className="bg-emerald-950 text-white px-3 py-1.5 uppercase flex justify-between items-center"
                    >
                      <span>Performance Skills</span>
                      <span className="text-[10px] opacity-80">Pendekatan</span>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {perfSkillsOptions.map(opt => (
                        <div key={opt.key} className="flex items-center justify-between p-1.5 px-3 odd:bg-white even:bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <RenderCheck checked={Boolean(perfSkills[opt.key])} />
                            <span className="font-semibold text-slate-800 text-[11px]">{opt.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 italic">{opt.approach}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 text-[11px] space-y-1.5 flex-1 shadow-2xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-semibold text-slate-700">Frekuensi Intervensi:</span>
                      <span className="font-bold text-slate-900">{ot.interventionFrequency || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Lamanya Program:</span>
                      <span className="font-bold text-slate-900">{ot.programDuration || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      });

      // 6. Outcome
      blocks.push({
        id: 'ot-outcome',
        title: 'B. Occupational Therapy Outcome',
        estimatedHeight: 110,
        render: () => {
          const outcomeOptions = [
            'Improvement', 'Enhancement', 'Prevention', 'Healthy and wellbeing', 
            'Quality of life', 'Participation', 'Role of Competencies', 'Welfare'
          ];

          return (
            <div 
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
            >
              <div 
                style={{ fontSize: '13px', fontWeight: 600 }}
                className="bg-slate-800 text-white px-3 py-1.5 uppercase flex justify-between items-center"
              >
                <span>B. Occupational Therapy Outcome (Pencapaian yang Diharapkan)</span>
                <span className="text-[10px] font-normal opacity-80">Target Capaian</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-y divide-slate-200 text-[11px]">
                {outcomeOptions.map(opt => {
                  const key = opt.toLowerCase().replace(/\s/g, '');
                  return (
                    <div key={opt} className="p-2 px-2.5 flex items-center gap-2 bg-white">
                      <RenderCheck checked={Boolean(outcome[key])} />
                      <span className="font-semibold text-slate-800 truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      });

      // 7. Rekomendasi
      blocks.push({
        id: 'ot-rekomendasi',
        title: 'III. Rekomendasi Terapi Okupasi',
        estimatedHeight: 110,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
            >
              III. REKOMENDASI TERAPI OKUPASI
            </div>
            <div 
              style={{ lineHeight: 1.6, textAlign: 'justify', padding: '8px 10px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
              className="text-slate-900 bg-slate-50/50"
            >
              {ot.recommendation || "Berdasarkan hasil pemeriksaan di atas, maka direkomendasikan untuk melanjutkan program Terapi Okupasi dengan fokus pada area perkembangan yang masih memerlukan dukungan intensif."}
            </div>
          </div>
        )
      });

      // 8. PSB (if available)
      if (ot.psb) {
        blocks.push({
          id: 'ot-psb-section',
          title: 'PSB: Saran Setting Inklusi',
          estimatedHeight: 230,
          render: () => <PSBPrintTableSection psbData={ot.psb!} />
        });
      }
    }

    // -----------------------------------------------------------------------
    // B. SPEECH THERAPY (ST)
    // -----------------------------------------------------------------------
    if (showST && report.speechTherapy) {
      const st = report.speechTherapy;
      const abilities: Partial<STAbilities> = st.abilities || {};

      // ST Section Header Banner
      blocks.push({
        id: 'st-section-header',
        title: 'HASIL PEMERIKSAAN TERAPI WICARA',
        estimatedHeight: 45,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="bg-cyan-950 text-white px-3.5 py-2 rounded-lg flex items-center justify-between shadow-2xs border border-cyan-800"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-[13px] font-bold uppercase tracking-wider font-sans text-cyan-100">
                HASIL PEMERIKSAAN TERAPI WICARA
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-cyan-200 font-medium">Pemeriksa: <strong className="text-white">{st.examinerName || 'Terapis Wicara'}</strong></span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-600 px-2 py-0.5 rounded text-white shadow-2xs">
                RAHASIA
              </span>
            </div>
          </div>
        )
      });

      // 1. Tujuan Pemeriksaan
      blocks.push({
        id: 'st-tujuan',
        title: 'II. Tujuan Pemeriksaan',
        estimatedHeight: 85,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
            >
              II. TUJUAN PEMERIKSAAN
            </div>
            <div 
              style={{ lineHeight: 1.6, textAlign: 'justify', padding: '8px 10px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
              className="text-slate-900 bg-slate-50/50"
            >
              {st.examinationPurpose || '-'}
            </div>
          </div>
        )
      });

      // 2. Gambaran Umum Siswa
      blocks.push({
        id: 'st-gambaran',
        title: 'III. Gambaran Umum Siswa',
        estimatedHeight: 95,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
            >
              III. GAMBARAN UMUM SISWA
            </div>
            <div 
              style={{ lineHeight: 1.6, textAlign: 'justify', padding: '8px 10px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
              className="text-slate-900 bg-slate-50/50"
            >
              {st.generalOverview || '-'}
            </div>
          </div>
        )
      });

      // 3. Keterampilan & Kemampuan Saat Ini (Table)
      blocks.push({
        id: 'st-kemampuan-table',
        title: 'IV. Keterampilan / Kemampuan Saat Ini',
        estimatedHeight: 340,
        render: () => {
          const swallowingRows = [
            { m: 'Organ mulut', tl: 'Hisap' },
            { m: 'Sikat', tl: 'Tiup' },
            { m: 'Gerakan bibir', tl: 'Kembung pipi' },
            { m: 'Gerakan lidah', tl: 'Batuk' },
            { m: 'Gerakan kunyah', tl: 'Reflek muntah' }
          ];

          return (
            <div 
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
            >
              <div 
                style={{ fontSize: '13px', fontWeight: 600 }}
                className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
              >
                IV. Keterampilan / Kemampuan Saat Ini
              </div>
              <table className="w-full border-collapse text-center text-[11px]">
                <thead className="bg-orange-100/80 text-orange-950 font-semibold border-b border-slate-300 text-[11px] uppercase">
                  <tr>
                    <th className="w-1/4 p-1.5 text-left px-3">AREA</th>
                    <th className="w-1/4 p-1.5" colSpan={2}>NILAI</th>
                    <th className="w-1/4 p-1.5 text-left px-3 border-l border-slate-300">AREA</th>
                    <th className="w-1/4 p-1.5" colSpan={2}>NILAI</th>
                  </tr>
                  <tr className="border-t border-orange-200 text-[10px]">
                    <th className="bg-white"></th>
                    <th className="p-1 border-l border-slate-200">Mampu</th>
                    <th className="p-1 border-l border-slate-200">Tidak</th>
                    <th className="bg-white border-l border-slate-300"></th>
                    <th className="p-1 border-l border-slate-200">Mampu</th>
                    <th className="p-1 border-l border-slate-200">Tidak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {/* Motorik & Sensorik Header */}
                  <tr className="bg-orange-50 font-bold text-orange-950 border-y border-slate-300">
                    <td className="p-1.5 px-3 text-left">I. MOTORIK</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                    <td className="p-1.5 px-3 text-left border-l border-slate-300">II. SENSORIK</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Motorik Kasar</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.motorikKasar === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.motorikKasar === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Penglihatan</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.penglihatan === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.penglihatan === false} /></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Motorik Halus</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.motorikHalus === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.motorikHalus === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Pendengaran</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.pendengaran === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.pendengaran === false} /></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Visual Motor Koordinasi</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.visualMotorCoordination === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.visualMotorCoordination === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Taktil Kinestetik</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.taktilKinestetik === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.taktilKinestetik === false} /></td>
                  </tr>

                  {/* Bahasa & Wicara */}
                  <tr className="bg-orange-50 font-bold text-orange-950 border-y border-slate-300">
                    <td className="p-1.5 px-3 text-left">III. BAHASA</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                    <td className="p-1.5 px-3 text-left border-l border-slate-300">IV. WICARA</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Reseptif</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.reseptif === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.reseptif === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Bunyi</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.bunyi === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.bunyi === false} /></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Ekspresif</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.ekspresif === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.ekspresif === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Fonem</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.fonem === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.fonem === false} /></td>
                  </tr>

                  {/* Suara & Irama */}
                  <tr className="bg-orange-50 font-bold text-orange-950 border-y border-slate-300">
                    <td className="p-1.5 px-3 text-left">SUARA</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                    <td className="p-1.5 px-3 text-left border-l border-slate-300">IRAMA & KELANCARAN</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Pernafasan</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.pernafasan === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.pernafasan === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Nada</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.iramaNada === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.iramaNada === false} /></td>
                  </tr>
                  <tr>
                    <td className="p-1 px-3 text-left font-medium">Penyaringan</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.penyaringan === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.penyaringan === false} /></td>
                    <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">Kecepatan Bicara</td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.kecepatanBicara === true} /></td>
                    <td className="border-l border-slate-200 p-1"><RenderCheck checked={abilities.kecepatanBicara === false} /></td>
                  </tr>

                  {/* Menelan & Tingkah Laku */}
                  <tr className="bg-orange-50 font-bold text-orange-950 border-y border-slate-300">
                    <td className="p-1.5 px-3 text-left">V. MENELAN</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                    <td className="p-1.5 px-3 text-left border-l border-slate-300">TINGKAH LAKU</td>
                    <td className="border-l border-slate-200"></td><td className="border-l border-slate-200"></td>
                  </tr>
                  {swallowingRows.map((row, idx) => {
                    const abilityKeys = Object.keys(abilities || {});
                    const abilityKeyM = abilityKeys.find(k => k.toLowerCase() === row.m.toLowerCase().replace(/\s/g, '').replace('bibir', 'Bibir').replace('lidah', 'Lidah').replace('kunyah', 'Kunyah'));
                    const valM = abilityKeyM ? (abilities as any)[abilityKeyM] : null;

                    const abilityKeyTL = abilityKeys.find(k => k.toLowerCase() === row.tl.toLowerCase().replace(/\s/g, '').replace('pipi','Pipi').replace('muntah','Muntah'));
                    const valTL = abilityKeyTL ? (abilities as any)[abilityKeyTL] : null;

                    return (
                      <tr key={idx}>
                        <td className="p-1 px-3 text-left font-medium">{row.m}</td>
                        <td className="border-l border-slate-200 p-1"><RenderCheck checked={valM === true} /></td>
                        <td className="border-l border-slate-200 p-1"><RenderCheck checked={valM === false} /></td>
                        <td className="p-1 px-3 text-left border-l border-slate-300 font-medium">{row.tl}</td>
                        <td className="border-l border-slate-200 p-1"><RenderCheck checked={valTL === true} /></td>
                        <td className="border-l border-slate-200 p-1"><RenderCheck checked={valTL === false} /></td>
                      </tr>
                    );
                  })}

                  {/* Catatan Pemeriksa */}
                  <tr className="bg-slate-50 text-left border-t border-slate-300">
                    <td 
                      colSpan={6} 
                      className="p-2.5 px-3 text-slate-800"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
                    >
                      <strong className="text-slate-900 block mb-0.5">Catatan Pemeriksa:</strong> {[abilities.motorikComment, abilities.sensorikComment, abilities.bahasaComment, abilities.suaraComment, abilities.iramaComment, abilities.menelanComment].filter(Boolean).join(' ') || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      });

      // 4. Rekomendasi Terapi Wicara
      blocks.push({
        id: 'st-rekomendasi',
        title: 'V. Rekomendasi Terapi Wicara',
        estimatedHeight: 110,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
            >
              V. REKOMENDASI TERAPI WICARA
            </div>
            <div 
              style={{ lineHeight: 1.6, textAlign: 'justify', padding: '8px 10px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
              className="text-slate-900 bg-slate-50/50"
            >
              {st.recommendation || "Berdasarkan hasil pemeriksaan di atas, maka direkomendasikan untuk melanjutkan program Terapi Wicara."}
            </div>
          </div>
        )
      });

      // 5. PSB (if available)
      if (st.psb) {
        blocks.push({
          id: 'st-psb-section',
          title: 'PSB: Saran Setting Inklusi',
          estimatedHeight: 230,
          render: () => <PSBPrintTableSection psbData={st.psb!} />
        });
      }
    }

    // -----------------------------------------------------------------------
    // C. REMEDIAL THERAPY
    // -----------------------------------------------------------------------
    if (showRemedial && report.remedialTherapy) {
      const rem = report.remedialTherapy;

      // Remedial Section Header Banner
      blocks.push({
        id: 'remedial-section-header',
        title: 'LAPORAN PERKEMBANGAN TERAPI REMEDIAL',
        estimatedHeight: 45,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="bg-amber-950 text-white px-3.5 py-2 rounded-lg flex items-center justify-between shadow-2xs border border-amber-800"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-[13px] font-bold uppercase tracking-wider font-sans text-amber-100">
                LAPORAN PERKEMBANGAN TERAPI REMEDIAL
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-amber-200 font-medium">Pemeriksa: <strong className="text-white">{rem.examinerName || 'Terapis Remedial'}</strong></span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-600 px-2 py-0.5 rounded text-white shadow-2xs">
                RAHASIA
              </span>
            </div>
          </div>
        )
      });

      const renderRemSection = (title: string, data?: typeof rem.academicSkills) => {
        if (!data || (!data.items?.length && !data.comment)) return null;
        return (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs mb-2"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-slate-900 text-white px-3 py-1.5 font-semibold flex justify-between items-center uppercase tracking-wide"
            >
              <span>{title}</span>
              {data.targetDate && (
                <span className="text-[10px] font-normal normal-case italic opacity-85">
                  [Target: {new Date(data.targetDate).toLocaleDateString('id-ID')}]
                </span>
              )}
            </div>
            <div className="p-2.5 px-3 space-y-2 divide-y divide-slate-100">
              {(data.items || []).map((item, idx) => (
                <div key={item.id || idx} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex gap-2 text-[11px]">
                    <span className="font-bold min-w-[60px] text-slate-700">● Awal</span>
                    <span className="shrink-0">:</span>
                    <span 
                      className="flex-grow text-slate-900"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                      {item.awal || '-'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <span className="font-bold min-w-[60px] text-blue-700">● Tujuan</span>
                    <span className="shrink-0">:</span>
                    <span 
                      className="flex-grow text-slate-900"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                      {item.tujuan || '-'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <span className="font-bold min-w-[60px] text-emerald-700">● Hasil</span>
                    <span className="shrink-0">:</span>
                    <span 
                      className="flex-grow text-slate-900"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                      {item.hasil || '-'}
                    </span>
                  </div>
                </div>
              ))}
              {data.comment && (
                <div 
                  className="pt-2 text-slate-700 italic bg-slate-50 p-2 rounded"
                  style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
                >
                  <strong className="text-slate-900 not-italic block mb-0.5">Komentar / Analisis:</strong> {data.comment}
                </div>
              )}
            </div>
          </div>
        );
      };

      // Remedial Skill Sections (Split individually for continuous content flow)
      if (rem.academicSkills && (rem.academicSkills.items?.length > 0 || rem.academicSkills.comment)) {
        blocks.push({
          id: 'rem-akademik',
          title: 'Kemampuan Akademik',
          estimatedHeight: 140,
          render: () => renderRemSection('Kemampuan Akademik', rem.academicSkills)
        });
      }

      if (rem.languageLiteracySkills && (rem.languageLiteracySkills.items?.length > 0 || rem.languageLiteracySkills.comment)) {
        blocks.push({
          id: 'rem-bahasa',
          title: 'Kemampuan Bahasa dan Literasi',
          estimatedHeight: 140,
          render: () => renderRemSection('Kemampuan Bahasa dan Literasi', rem.languageLiteracySkills)
        });
      }

      if (rem.writingSkills && (rem.writingSkills.items?.length > 0 || rem.writingSkills.comment)) {
        blocks.push({
          id: 'rem-menulis',
          title: 'Kemampuan Menulis',
          estimatedHeight: 140,
          render: () => renderRemSection('Kemampuan Menulis', rem.writingSkills)
        });
      }

      if (rem.focusConcentrationSkills && (rem.focusConcentrationSkills.items?.length > 0 || rem.focusConcentrationSkills.comment)) {
        blocks.push({
          id: 'rem-fokus',
          title: 'Kemampuan Fokus dan Konsentrasi',
          estimatedHeight: 140,
          render: () => renderRemSection('Kemampuan Fokus dan Konsentrasi', rem.focusConcentrationSkills)
        });
      }

      // Follow up
      if (rem.followUp && rem.followUp.length > 0) {
        blocks.push({
          id: 'rem-followup',
          title: 'Follow up',
          estimatedHeight: 90,
          render: () => (
            <div 
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
            >
              <div 
                style={{ fontSize: '13px', fontWeight: 600 }}
                className="bg-slate-800 text-white px-3 py-1.5 uppercase tracking-wide"
              >
                Rencana Tindak Lanjut / Follow Up
              </div>
              <ul className="p-2.5 px-3 space-y-1 text-[11px] divide-y divide-slate-100">
                {(rem.followUp || []).map((item, idx) => (
                  <li 
                    key={idx} 
                    className="flex gap-2 items-start text-slate-800 pt-1 first:pt-0"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    <span className="font-bold text-slate-900">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        });
      }
    }

    // -----------------------------------------------------------------------
    // D. PHYSIOTHERAPY
    // -----------------------------------------------------------------------
    if (showPhysio && report.physiotherapy) {
      const phys = report.physiotherapy;
      const genBehavior: Partial<PhysioGeneralBehavior> = phys.generalBehavior || {};

      // Physio Section Header Banner
      blocks.push({
        id: 'physio-section-header',
        title: 'PHYSIOTHERAPY PROGRESS REPORT',
        estimatedHeight: 45,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="bg-purple-950 text-white px-3.5 py-2 rounded-lg flex items-center justify-between shadow-2xs border border-purple-800"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-[13px] font-bold uppercase tracking-wider font-sans text-purple-100">
                HASIL PEMERIKSAAN FISIOTERAPI (PROGRESS REPORT)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-purple-200 font-medium">Pemeriksa: <strong className="text-white">{phys.examinerName || 'Fisioterapis'}</strong></span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-rose-600 px-2 py-0.5 rounded text-white shadow-2xs">
                RAHASIA
              </span>
            </div>
          </div>
        )
      });

      // 1. Perilaku Umum
      blocks.push({
        id: 'phys-perilaku',
        title: 'A. Perilaku Umum',
        estimatedHeight: 160,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-[#4472C4] text-white py-1.5 px-3 uppercase text-center font-semibold tracking-wide"
            >
              A. Perilaku Umum
            </div>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[50%]" rowSpan={2}>RESPON PERILAKU</th>
                  <th className="p-1 text-center border-r border-slate-300" colSpan={2}>AWAL</th>
                  <th className="p-1 text-center" colSpan={2}>HASIL</th>
                </tr>
                <tr className="text-[10px] uppercase border-b border-slate-300 font-semibold bg-slate-50">
                  <th className="p-1 border-r border-slate-200">Teramati</th>
                  <th className="p-1 border-r border-slate-300">Tidak</th>
                  <th className="p-1 border-r border-slate-200">Teramati</th>
                  <th className="p-1">Tidak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { key: 'interaction', label: 'Ada upaya terlibat interaksi dengan terapis' },
                  { key: 'followCommand', label: 'Mengikuti perintah' },
                  { key: 'exploration', label: 'Terlibat dalam perilaku eksplorasi' },
                  { key: 'emotionalIdea', label: 'Mengelola ide emosional' },
                  { key: 'organizeBehavior', label: 'Mengorganisir perilaku untuk menyelesaikan tugas dengan sukses' },
                ].map(item => {
                  const pair = genBehavior[item.key as keyof PhysioGeneralBehavior] as PhysioAwalHasil<PhysioResponsePair> | undefined;
                  return (
                    <tr key={item.key} className="odd:bg-white even:bg-slate-50/50">
                      <td className="p-1.5 px-3 border-r border-slate-200 font-medium text-slate-800">{item.label}</td>
                      <td className="p-1 border-r border-slate-200 text-center"><RenderCheck checked={Boolean(pair?.awal?.teramati)} /></td>
                      <td className="p-1 border-r border-slate-300 text-center"><RenderCheck checked={Boolean(pair?.awal?.tidak)} /></td>
                      <td className="p-1 border-r border-slate-200 text-center"><RenderCheck checked={Boolean(pair?.hasil?.teramati)} /></td>
                      <td className="p-1 text-center"><RenderCheck checked={Boolean(pair?.hasil?.tidak)} /></td>
                    </tr>
                  );
                })}
                {genBehavior.comment && (
                  <tr className="bg-slate-50">
                    <td 
                      colSpan={5} 
                      className="p-2.5 px-3 text-slate-700 italic border-t border-slate-300"
                      style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: '11px' }}
                    >
                      <strong className="text-slate-900 not-italic">Komentar:</strong> {genBehavior.comment}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      });

      // 2. Sensori Modulasi
      blocks.push({
        id: 'phys-sensori',
        title: 'B. Sensory Processing — 1. SENSORI MODULASI',
        estimatedHeight: 180,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-red-700 text-white py-1.5 px-3 uppercase text-center font-semibold tracking-wide"
            >
              B. Sensory Processing — 1. SENSORI MODULASI
            </div>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[45%]" rowSpan={2}>RESPON</th>
                  <th className="p-1 text-center border-r border-slate-300" colSpan={4}>AWAL</th>
                  <th className="p-1 text-center" colSpan={4}>HASIL</th>
                </tr>
                <tr className="text-[10px] uppercase border-b border-slate-300 font-semibold bg-slate-50">
                  <th className="border-r border-slate-200 p-1">B</th><th className="border-r border-slate-200 p-1">S</th><th className="border-r border-slate-200 p-1">K</th><th className="border-r border-slate-300 p-1">BR</th>
                  <th className="border-r border-slate-200 p-1">B</th><th className="border-r border-slate-200 p-1">S</th><th className="border-r border-slate-200 p-1">K</th><th className="p-1">BR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(phys.sensoryModulation?.items || []).map((item, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-slate-50/50">
                    <td className="p-1.5 px-3 border-r border-slate-200 font-medium text-slate-800">{item.type}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'B' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'S' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'K' ? '✓' : ''}</td>
                    <td className="border-r border-slate-300 text-center font-bold text-[10px]">{item.awal === 'BR' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'B' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'S' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'K' ? '✓' : ''}</td>
                    <td className="text-center font-bold text-[10px]">{item.hasil === 'BR' ? '✓' : ''}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 border-t border-slate-300">
                  <td 
                    colSpan={9} 
                    className="p-2 px-3 text-[10px] italic text-slate-600"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    B: Respon Berlebihan | S: Respon Sesuai | K: Respon Kurang | BR: Respon Berubah-ubah
                    {phys.sensoryModulation?.comment && ` • Komentar: ${phys.sensoryModulation.comment}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      });

      // 3. Perkembangan Motorik
      blocks.push({
        id: 'phys-motorik',
        title: 'C. Perkembangan Kemampuan Motorik',
        estimatedHeight: 200,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white text-[11px] shadow-2xs"
          >
            <div 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="bg-amber-600 text-white py-1.5 px-3 uppercase text-center font-semibold tracking-wide"
            >
              C. Perkembangan Kemampuan Motorik
            </div>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold uppercase text-[10px] text-slate-800">
                  <th className="p-2 px-3 text-left border-r border-slate-300 w-[45%]" rowSpan={2}>AKTIVITAS MOTORIK KASAR & HALUS</th>
                  <th className="p-1 text-center border-r border-slate-300" colSpan={3}>AWAL</th>
                  <th className="p-1 text-center" colSpan={3}>HASIL</th>
                </tr>
                <tr className="text-[10px] border-b border-slate-300 font-bold bg-slate-50">
                  <th className="border-r border-slate-200 p-1">MD</th><th className="border-r border-slate-200 p-1">SD</th><th className="border-r border-slate-300 p-1">TD</th>
                  <th className="border-r border-slate-200 p-1">MD</th><th className="border-r border-slate-200 p-1">SD</th><th className="p-1">TD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(phys.motorSkills?.grossMotor || []).slice(0, 5).map((item, idx) => (
                  <tr key={`gm-${idx}`} className="odd:bg-white even:bg-slate-50/50">
                    <td className="p-1.5 px-3 border-r border-slate-200 font-medium text-slate-800">{item.activity}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'MD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'SD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-300 text-center font-bold text-[10px]">{item.awal === 'TD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'MD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'SD' ? '✓' : ''}</td>
                    <td className="text-center font-bold text-[10px]">{item.hasil === 'TD' ? '✓' : ''}</td>
                  </tr>
                ))}
                {(phys.motorSkills?.fineMotor || []).slice(0, 3).map((item, idx) => (
                  <tr key={`fm-${idx}`} className="odd:bg-white even:bg-slate-50/50">
                    <td className="p-1.5 px-3 border-r border-slate-200 font-medium text-slate-800">{item.activity}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'MD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.awal === 'SD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-300 text-center font-bold text-[10px]">{item.awal === 'TD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'MD' ? '✓' : ''}</td>
                    <td className="border-r border-slate-200 text-center font-bold text-[10px]">{item.hasil === 'SD' ? '✓' : ''}</td>
                    <td className="text-center font-bold text-[10px]">{item.hasil === 'TD' ? '✓' : ''}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 border-t border-slate-300">
                  <td 
                    colSpan={7} 
                    className="p-2 px-3 text-[10px] italic text-slate-600"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan
                    {phys.motorSkills?.comment && ` • Komentar: ${phys.motorSkills.comment}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      });

      // 4. Follow Up & Home Program
      blocks.push({
        id: 'phys-followup-home',
        title: 'E. Follow Up & F. Home Program',
        estimatedHeight: 140,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="grid grid-cols-2 gap-2 text-[11px]"
          >
            <div className="border border-slate-300 rounded-lg p-3 bg-white shadow-2xs">
              <span 
                style={{ fontSize: '12px', fontWeight: 600 }}
                className="text-slate-800 block mb-1.5 uppercase"
              >
                E. Follow Up:
              </span>
              <ul className="space-y-1 pl-1 text-[11px]">
                {(phys.followUp || []).slice(0, 4).map((f, i) => (
                  <li 
                    key={i} 
                    className="flex gap-1.5 items-start text-slate-700"
                    style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    <span className="font-bold">•</span><span>{f}</span>
                  </li>
                ))}
                {(!phys.followUp || phys.followUp.length === 0) && <li className="italic text-slate-400">Tidak ada follow up.</li>}
              </ul>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-white shadow-2xs">
              <span 
                style={{ fontSize: '12px', fontWeight: 600 }}
                className="text-slate-800 block mb-1.5 uppercase"
              >
                F. Home Program:
              </span>
              <div className="space-y-1.5 text-[11px]">
                {(phys.homeProgram || []).slice(0, 3).map((hp, i) => (
                  <div key={i} className="border-b border-slate-100 pb-1 last:border-b-0">
                    <span className="font-semibold text-slate-800 block">{hp.activity}</span>
                    <span className="text-[10px] text-slate-500">{hp.frequency} • {hp.duration}</span>
                  </div>
                ))}
                {(!phys.homeProgram || phys.homeProgram.length === 0) && <span className="italic text-slate-400">Tidak ada home program.</span>}
              </div>
            </div>
          </div>
        )
      });
    }

    // Default notice block if report has no active therapy section data yet
    if (!showOT && !showST && !showRemedial && !showPhysio) {
      blocks.push({
        id: 'empty-notice-block',
        title: 'Informasi Laporan Asesmen',
        estimatedHeight: 120,
        render: () => (
          <div 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            className="border border-slate-300 rounded-lg p-5 bg-slate-50 text-center text-[11px] shadow-2xs"
          >
            <p 
              style={{ fontSize: '13px', fontWeight: 600 }}
              className="text-slate-900 mb-2 uppercase"
            >
              Dokumen Asesmen Klinis Siswa
            </p>
            <p 
              className="text-slate-600 max-w-lg mx-auto"
              style={{ lineHeight: 1.6, textAlign: 'justify', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              Belum ada rincian pemeriksaan spesifik (Okupasi, Wicara, Remedial, atau Fisioterapi) yang aktif pada tampilan laporan ini. Klik tombol <strong>Edit</strong> untuk menambahkan hasil observasi atau pilih menu filter terapi di atas.
            </p>
          </div>
        )
      });
    }

    // -----------------------------------------------------------------------
    // E. SHARED SIGNATURE BLOCK
    // Flows naturally at the end of the report content
    // -----------------------------------------------------------------------
    blocks.push({
      id: 'shared-signature-block',
      isSignature: true,
      estimatedHeight: layoutMode === 'separate' ? 280 : 185,
      render: () => (
        <SignatureSection 
          config={signatureConfig}
          onUpdateConfig={handleUpdateSignatureConfig}
          onUploadImage={handleSignerImageUpload}
          onRemoveImage={handleRemoveSignerImage}
          isStandalone={layoutMode === 'separate'}
        />
      )
    });

    return blocks;
  }, [report, defaultAssessmentDate, layoutMode, showOT, showST, showRemedial, showPhysio, signatureConfig]);

  // =========================================================================
  // 4. MEASUREMENT OF FLOW BLOCKS
  // =========================================================================
  useLayoutEffect(() => {
    if (!measurerRef.current || !report || !isOpen) return;
    const elements = measurerRef.current.querySelectorAll<HTMLElement>('[data-block-id]');
    const heights: Record<string, number> = {};
    let isDifferent = false;

    elements.forEach(el => {
      const id = el.getAttribute('data-block-id');
      if (id) {
        const rect = el.getBoundingClientRect();
        const h = Math.ceil(rect.height);
        heights[id] = h;
        if (measuredHeights[id] !== h) {
          isDifferent = true;
        }
      }
    });

    if (isDifferent) {
      setMeasuredHeights(heights);
    }
  }, [flowBlocks, zoom, layoutMode, report, isOpen]);

  // =========================================================================
  // 5. CONTINUOUS CONTENT FLOW PAGINATION ENGINE
  // Dynamically packs blocks without artificial page cuts or huge blank spaces
  // =========================================================================
  const BLOCK_GAP = 6;

  const paginatedPages = useMemo<PageBlockInstance[][]>(() => {
    if (!report || flowBlocks.length === 0) return [];
    const pages: PageBlockInstance[][] = [];
    let currentPage: PageBlockInstance[] = [];
    let currentHeight = 0;
    let pageIndex = 0;

    // Total usable inner height of 297mm A4 page with 15mm top/bottom padding is 267mm = ~1009px at 96 DPI
    // Page 1 budget subtracts the exact measured height of Kop + Identity Table (~280px) and Running Footer (~35px)
    const measuredHeader1H = measuredHeights['page-1-header'] || 280;
    const page1Budget = Math.max(350, 970 - measuredHeader1H);
    
    // Page N budget subtracts the Running Header (~45px) and Running Footer (~35px)
    const pageNBudget = 930;

    for (let i = 0; i < flowBlocks.length; i++) {
      const block = flowBlocks[i];
      const maxBudget = pageIndex === 0 ? page1Budget : pageNBudget;
      const measuredH = measuredHeights[block.id];
      const blockHeight = measuredH || block.estimatedHeight || 100;

      // Standalone Signature sheet mode
      if (block.isSignature && layoutMode === 'separate') {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
        }
        pages.push([{ id: `${block.id}-standalone`, block }]);
        continue;
      }

      // Signature block in Flow Mode
      if (block.isSignature) {
        if (currentHeight + blockHeight <= maxBudget) {
          currentPage.push({ id: block.id, block });
          currentHeight += blockHeight + BLOCK_GAP;
        } else {
          // If current page is nearly full, push to new page naturally
          pages.push(currentPage);
          currentPage = [{ id: `${block.id}-flow-end`, block }];
          pageIndex++;
          currentHeight = blockHeight + BLOCK_GAP;
        }
        continue;
      }

      // Regular Content Block Fitting
      if (currentHeight + blockHeight <= maxBudget) {
        // Fits on current page
        currentPage.push({ id: block.id, block });
        currentHeight += blockHeight + BLOCK_GAP;
      } else {
        // Does not fit: advance to next page
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
        }
        currentPage.push({ id: block.id, block });
        currentHeight = blockHeight + BLOCK_GAP;
      }
    }

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Safety fallback: ensure at least 1 page exists if flowBlocks are present
    if (pages.length === 0 && flowBlocks.length > 0) {
      pages.push(flowBlocks.map(block => ({ id: block.id, block })));
    }

    return pages;
  }, [flowBlocks, measuredHeights, layoutMode, report]);

  const totalPages = paginatedPages.length;

  // =========================================================================
  // 6. ACTION HANDLERS
  // =========================================================================
  const handlePrint = () => {
    setIsPrinting(true);
    triggerBrowserA4Print(pdfFileName);
    setTimeout(() => {
      setIsPrinting(false);
    }, 1500);
  };

  // Auto-print effect when triggered from "Print A4" table action
  useEffect(() => {
    if (isOpen && autoPrint && totalPages > 0) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, totalPages]);

  const handleDownloadPdf = async () => {
    if (!containerRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportProgress(10);
      const pageSheets = containerRef.current.querySelectorAll<HTMLElement>('.a4-sheet');
      if (!pageSheets || pageSheets.length === 0) {
        throw new Error('Tidak ada lembar halaman dokumen yang terdeteksi untuk diekspor.');
      }
      await exportPagesToPdf(Array.from(pageSheets), pdfFileName, (pct) => {
        setExportProgress(pct);
      });
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Terjadi kendala saat menghasilkan PDF. Silakan gunakan tombol Cetak (A4) dan pilih "Simpan sebagai PDF".');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // =========================================================================
  // EARLY RETURN: ONLY AFTER ALL HOOKS HAVE BEEN EXECUTED!
  // =========================================================================
  if (!isOpen || !report || !child) return null;

  const sheetClass = "a4-sheet a4-print-page margin-15mm w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[15mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-start relative select-text overflow-hidden font-sans";

  return (
    <div className="print-preview-modal-root fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden animate-fade-in print:bg-white print:p-0 print:m-0 print:static print:overflow-visible">
      {/* =====================================================================
          TOP CONTROLS TOOLBAR (HIDDEN ON PRINT)
          ===================================================================== */}
      <header className="no-print w-full bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-lg text-white z-20">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs">
            A4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white truncate max-w-[280px]">
                {childName}
              </h2>
              <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                {activeTherapyLabel}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                <FileText className="w-2.5 h-2.5" />
                <span>Dokumen PDF</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Format: <strong>A4 Portrait (210×297 mm)</strong></span>
              <span>•</span>
              <span>Total <strong>{totalPages}</strong> Halaman</span>
            </p>
          </div>
        </div>

        {/* Center: Layout Mode Selector & Therapy Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableTherapies.length > 1 && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/90 border border-slate-700 p-1 rounded-xl">
              <span className="text-[10px] font-black uppercase text-slate-400 px-1.5 tracking-wider">Tampilan:</span>
              {availableTherapies.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTherapyView(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedTherapyView === t.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Tampilkan dokumen hasil ${t.label}`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setLayoutMode('flow')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'flow' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Konten mengalir terpadu tanpa ruang kosong buatan"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Alur Terpadu</span>
            </button>
            <button
              onClick={() => setLayoutMode('separate')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'separate' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Lembar pengesahan tanda tangan di halaman tersendiri"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Lembar TTD Terpisah</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Watermark Toggle */}
          <button
            onClick={() => setShowWatermark(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showWatermark 
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Tampilkan / Sembunyikan Cap Watermark RAHASIA pada dokumen"
          >
            <Shield className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden xl:inline">Watermark:</span>
            <span className="font-extrabold">{showWatermark ? 'RAHASIA' : 'Off'}</span>
          </button>
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 gap-1 text-slate-300 text-xs mr-1">
            <button 
              onClick={() => setZoom(prev => Math.max(0.4, Number((prev - 0.05).toFixed(2))))}
              className="p-1 hover:text-white hover:bg-slate-700 rounded cursor-pointer transition-colors"
              title="Perkecil Preview"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-mono font-bold text-[11px] select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.3, Number((prev + 0.05).toFixed(2))))}
              className="p-1 hover:text-white hover:bg-slate-700 rounded cursor-pointer transition-colors"
              title="Perbesar Preview"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setZoom(0.78)}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold ml-1 cursor-pointer transition-colors"
              title="Pas Sesuai Layar"
            >
              Fit
            </button>
            <button 
              onClick={() => setZoom(1.0)}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold cursor-pointer transition-colors"
              title="Ukuran Nyata 100%"
            >
              100%
            </button>
          </div>

          {/* Edit Button */}
          {(userRole === 'admin' || userRole === 'terapis' || userRole === 'assessor') && (
            <button
              onClick={() => {
                onEdit(report);
                onClose();
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}

          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Unduh file dokumen PDF resmi"
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? `Menyimpan (${exportProgress}%)` : 'Download PDF'}
          </button>

          {/* Print A4 Button */}
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-95 cursor-pointer"
            title="Cetak format lembar A4 ke printer fisik atau simpan sebagai PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Print A4</span>
          </button>

          {/* Edit Kolom TTD Button */}
          <button
            onClick={() => setIsSignatureSettingsOpen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isSignatureSettingsOpen 
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-500/30' 
                : 'bg-slate-800 text-purple-300 border-purple-500/30 hover:bg-slate-700 hover:text-white'
            }`}
            title="Atur nama penandatangan, jabatan, tanggal, dan tanda tangan digital untuk cetak"
          >
            <PenTool className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kolom TTD:</span>
            <span>{isSignatureSettingsOpen ? 'Tutup Panel' : 'Edit TTD Cetak'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            title="Tutup Pratinjau PDF"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          INTERACTIVE SIGNATURE CONFIGURATION PANEL (HIDDEN ON PRINT)
          ===================================================================== */}
      {isSignatureSettingsOpen && (
        <div className="no-print w-full bg-slate-900 border-b border-purple-500/30 px-4 md:px-8 py-4 text-white z-20 shadow-2xl animate-fade-in-up">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Pengaturan Kolom Tanda Tangan Cetak Asesmen</span>
                    <span className="text-[10px] font-normal text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Terapis Okupasi & Wicara Sejajar • Kepala Inklusi Tengah
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Posisi tanda tangan: Baris atas untuk Terapis Okupasi & Terapis Wicara sejajar, baris bawah untuk Kepala Inklusi di tengah.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Reset & Toggle Parent */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const fresh = getStoredAssessmentSignatures(report, defaultAssessmentDate, child, therapists);
                    handleUpdateSignatureConfig(fresh);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sinkronkan nama dari data laporan"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync dari Laporan</span>
                </button>
                <label className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={!!signatureConfig.showParentSignature}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      showParentSignature: e.target.checked
                    })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium text-[11px]">+ TTD Orang Tua / Wali</span>
                </label>
              </div>
            </div>

            {/* Tempat & Tanggal Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Tempat / Kota Pengesahan</label>
                <input 
                  type="text"
                  value={signatureConfig.location}
                  onChange={(e) => handleUpdateSignatureConfig({ ...signatureConfig, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="Depok"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Dokumen / Pengesahan</label>
                <input 
                  type="text"
                  value={signatureConfig.dateString}
                  onChange={(e) => handleUpdateSignatureConfig({ ...signatureConfig, dateString: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="30 September 2026"
                />
              </div>
            </div>

            {/* Signer Columns Grid (Row 1: Terapis Okupasi & Terapis Wicara | Row 2: Kepala Inklusi) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Kolom 1: Terapis Okupasi */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 text-[11px]">Kolom 1 (Terapis Okupasi)</span>
                  {therapists && therapists.length > 0 && (
                    <select
                      onChange={(e) => {
                        const sel = therapists.find(t => t.name === e.target.value);
                        if (sel) {
                          handleUpdateSignatureConfig({
                            ...signatureConfig,
                            signer1: {
                              ...signatureConfig.signer1,
                              name: sel.name,
                              departmentTitle: 'Terapis Okupasi',
                            }
                          });
                        }
                      }}
                      className="bg-slate-900 border border-slate-700 text-slate-300 text-[9px] rounded-lg px-2 py-0.5"
                    >
                      <option value="">Pilih Terapis...</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Label Peran</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer1.roleTitle}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer1: { ...signatureConfig.signer1, roleTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs outline-none"
                    placeholder="Terapis Okupasi,"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Spesialisasi</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer1.departmentTitle}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer1: { ...signatureConfig.signer1, departmentTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                    placeholder="Terapis Okupasi"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer1.name}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer1: { ...signatureConfig.signer1, name: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-purple-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                    placeholder="Eka Talia Kameswari, A.Md.OT"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">SIP / STR / NIP (Opsional)</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer1.nip || ''}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer1: { ...signatureConfig.signer1, nip: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono outline-none"
                    placeholder="SIP. 19940315 201802 2 001"
                  />
                </div>

                {/* Upload Signature Image */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{signatureConfig.signer1.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer1', e.target.files[0])}
                    />
                  </label>
                  {signatureConfig.signer1.signatureImage && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveSignerImage('signer1')}
                      className="text-rose-400 hover:underline"
                    >
                      Hapus TTD
                    </button>
                  )}
                </div>
              </div>

              {/* Kolom 2: Terapis Wicara (Sejajar dengan Terapis Okupasi) */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-[11px]">Kolom 2 (Terapis Wicara)</span>
                  {therapists && therapists.length > 0 && (
                    <select
                      onChange={(e) => {
                        const sel = therapists.find(t => t.name === e.target.value);
                        if (sel) {
                          handleUpdateSignatureConfig({
                            ...signatureConfig,
                            signerTW: {
                              ...signatureConfig.signerTW,
                              name: sel.name,
                              departmentTitle: 'Terapis Wicara',
                            }
                          });
                        }
                      }}
                      className="bg-slate-900 border border-slate-700 text-slate-300 text-[9px] rounded-lg px-2 py-0.5"
                    >
                      <option value="">Pilih Terapis...</option>
                      {therapists.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Label Peran</label>
                  <input 
                    type="text"
                    value={signatureConfig.signerTW?.roleTitle || 'Terapis Wicara,'}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signerTW: { ...signatureConfig.signerTW, roleTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs outline-none"
                    placeholder="Terapis Wicara,"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Spesialisasi</label>
                  <input 
                    type="text"
                    value={signatureConfig.signerTW?.departmentTitle || 'Terapis Wicara'}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signerTW: { ...signatureConfig.signerTW, departmentTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                    placeholder="Terapis Wicara"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text"
                    value={signatureConfig.signerTW?.name || ''}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signerTW: { ...signatureConfig.signerTW, name: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-cyan-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                    placeholder="Nurul Hidayati, S.Tr.Kes"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">SIP / STR / NIP (Opsional)</label>
                  <input 
                    type="text"
                    value={signatureConfig.signerTW?.nip || ''}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signerTW: { ...signatureConfig.signerTW, nip: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono outline-none"
                    placeholder="SIP. 19960714 202001 2 002"
                  />
                </div>

                {/* Upload Signature Image */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{signatureConfig.signerTW?.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signerTW', e.target.files[0])}
                    />
                  </label>
                  {signatureConfig.signerTW?.signatureImage && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveSignerImage('signerTW')}
                      className="text-rose-400 hover:underline"
                    >
                      Hapus TTD
                    </button>
                  )}
                </div>
              </div>

              {/* Kolom 3: Kepala Inklusi (Posisi di Bawah & di Tengah) */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-blue-400 text-[11px] block">
                  Kolom Bawah (Kepala Inklusi / Pimpinan - Tengah)
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Label Peran</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer2.roleTitle}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer2: { ...signatureConfig.signer2, roleTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs outline-none"
                    placeholder="Mengetahui,"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Instansi</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer2.departmentTitle}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer2: { ...signatureConfig.signer2, departmentTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                    placeholder="Kepala Pendidikan Inklusif Lazuardi GCS"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer2.name}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer2: { ...signatureConfig.signer2, name: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-blue-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                    placeholder="Abdul Ghofar, A.Md.OT., S.Pd., M.H"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">NIP / Identitas (Opsional)</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer2.nip || ''}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer2: { ...signatureConfig.signer2, nip: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono outline-none"
                    placeholder="NIP. 19780512 200501 1 003"
                  />
                </div>

                {/* Upload Signature Image */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{signatureConfig.signer2.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer2', e.target.files[0])}
                    />
                  </label>
                  {signatureConfig.signer2.signatureImage && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveSignerImage('signer2')}
                      className="text-rose-400 hover:underline"
                    >
                      Hapus TTD
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Kolom Tambahan jika Orang Tua / Wali Siswa diaktifkan */}
            {signatureConfig.showParentSignature && signatureConfig.signer3 && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-teal-500/30 space-y-2 mt-2">
                <span className="font-bold text-teal-400 text-[11px] block">Kolom Tambahan (Orang Tua / Wali Siswa)</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Label Peran</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.roleTitle}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, roleTitle: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs outline-none"
                      placeholder="Menyetujui (Orang Tua / Wali),"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Keterangan / Hubungan</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.departmentTitle}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, departmentTitle: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                      placeholder="Orang Tua / Wali Siswa"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Nama Orang Tua / Wali *</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.name}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, name: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-teal-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                      placeholder="Nama Orang Tua / Wali"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">No. Kontak (Opsional)</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.nip || ''}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, nip: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono outline-none"
                      placeholder="0812-xxxx-xxxx"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Offscreen Measurer Element: Accurate sub-pixel sizing for dynamic flow calculation */}
      <div 
        ref={measurerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -99999,
          left: -99999,
          width: '180mm', // Exact inner content width (210mm - 2*15mm margin)
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div data-block-id="page-1-header" className="mb-2">
          <FullKop />
          <IdentityAndExaminerTable />
        </div>
        {flowBlocks.map(b => (
          <div key={b.id} data-block-id={b.id} className="mb-2">
            {b.render()}
          </div>
        ))}
      </div>

      {/* Main Preview Canvas Area */}
      <main 
        className="flex-1 w-full overflow-y-auto overflow-x-auto p-4 md:p-8 flex justify-center bg-slate-950/60 print:overflow-visible print:p-0 print:bg-white"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          ref={containerRef}
          style={{
            transform: isPrinting ? 'none' : `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: isPrinting ? 'none' : 'transform 0.15s ease-out'
          }}
          className="flex flex-col gap-10 items-center print:gap-0 print:m-0 print:p-0 print:block print:transform-none"
        >
          {/* ========================================================
              CONTINUOUS DYNAMIC CONTENT PAGES (HALAMAN 1, 2, ...)
              Fills each A4 sheet optimally with natural sequential flow
             ======================================================== */}
          {paginatedPages.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 text-center my-12 max-w-md">
              <p className="font-bold text-sm mb-1">Menyiapkan Lembar Laporan...</p>
              <p className="text-xs text-slate-400">Sedang menyusun layout cetak A4 format resmi.</p>
            </div>
          ) : (
            paginatedPages.map((pageInstances, pageIdx) => {
              const pageNum = pageIdx + 1;
              const isFirstPage = pageIdx === 0;

              return (
                <div 
                  key={`page-${pageIdx}`}
                  className={sheetClass}
                  data-orientation="portrait"
                >
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

                  {/* Relative Z-10 Content Container */}
                  <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
                    <div>
                      {/* Page Header: Full Kop on Page 1, Running Header on subsequent pages */}
                      {isFirstPage ? (
                        <>
                          <FullKop />
                          <IdentityAndExaminerTable />
                        </>
                      ) : (
                        <RunningHeader title={documentTitleText} />
                      )}

                      {/* Content Stream Container: Continuous, compact, professional spacing */}
                      <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                        {pageInstances.map(inst => (
                          <div key={inst.id} className="break-inside-avoid">
                            {inst.block.render({
                              startIndex: inst.startIndex,
                              endIndex: inst.endIndex,
                              isContinuation: inst.isContinuation,
                              hideCategoryHeader: inst.hideCategoryHeader
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Page Running Footer */}
                    <RunningFooter currentPage={pageNum} totalPages={totalPages} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

// ===========================================================================
// SUB-COMPONENTS: PSB & SIGNATURE
// ===========================================================================

const PSBPrintTableSection: React.FC<{ psbData: PSBData }> = ({ psbData }) => {
  const tier1 = psbData?.tier1 || {};
  const tier2 = psbData?.tier2 || {};
  const tier3 = psbData?.tier3 || {};
  const tier4 = psbData?.tier4 || {};

  const renderCheck = (val?: boolean) => (
    <span className={`inline-block w-3 h-3 border text-center text-[7px] leading-none font-bold mr-1 align-middle ${
      val ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'
    }`}>
      {val ? '✓' : ''}
    </span>
  );

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white text-[7.5px]">
      <div className="bg-slate-900 text-white px-2 py-0.5 font-bold uppercase tracking-wide flex justify-between items-center text-[7.5px]">
        <span>SARAN DAN DUKUNGAN PENDIDIKAN DENGAN SETTING INKLUSI (PSB)</span>
        <span className="text-[6.5px] font-normal opacity-80">Tier 1 - Tier 4</span>
      </div>

      <table className="w-full border-collapse leading-tight">
        <thead>
          <tr className="bg-slate-100 font-black border-b border-slate-300 text-center text-slate-800 text-[7px]">
            <th className="p-1 border-r border-slate-300 w-1/4">TIER 1</th>
            <th className="p-1 border-r border-slate-300 w-1/4">TIER 2</th>
            <th className="p-1 border-r border-slate-300 w-1/4">TIER 3</th>
            <th className="p-1 w-1/4">TIER 4</th>
          </tr>
        </thead>
        <tbody className="align-top divide-y divide-slate-200">
          <tr>
            {/* TIER 1 */}
            <td className="p-1.5 border-r border-slate-200 space-y-1">
              <div>
                {renderCheck(tier1.multiModalTeaching)}
                <span className="font-semibold text-slate-800">Multi modal teaching:</span>
                {tier1.multiModalTeachingNotes && (
                  <div className="ml-3 text-slate-600 italic text-[7px]">{tier1.multiModalTeachingNotes}</div>
                )}
              </div>
              <div>{renderCheck(tier1.zoneOfRegulation)} <span>Zone of Regulation</span></div>
              <div>{renderCheck(tier1.flexibleSeating)} <span>Flexible seating</span></div>
              <div>{renderCheck(tier1.descriptiveLanguage)} <span>Descriptive language</span></div>
              <div>{renderCheck(tier1.visualAids)} <span>Visual aids</span></div>
              <div>{renderCheck(tier1.manipulatives)} <span>Manipulatives</span></div>
              <div>{renderCheck(tier1.simulations)} <span>Simulations</span></div>
              <div>{renderCheck(tier1.wholeClassMovement)} <span>Whole Class Movement</span></div>
            </td>

            {/* TIER 2 */}
            <td className="p-1.5 border-r border-slate-200 space-y-1">
              <div>
                {renderCheck(tier2.teachersImplementClassroomStrategies)}
                <span className="font-semibold text-slate-800">Classroom strategies:</span>
                {tier2.teachersImplementClassroomStrategiesNotes && (
                  <div className="ml-3 text-slate-600 italic text-[7px]">{tier2.teachersImplementClassroomStrategiesNotes}</div>
                )}
              </div>
              <div>{renderCheck(tier2.behaviorStrategies)} <span>Behavior strategies</span></div>
              <div>{renderCheck(tier2.pemantauanPerilaku)} <span>Pemantauan perilaku teratur</span></div>
              <div>{renderCheck(tier2.intervensiKelompokKecil)} <span>Kelompok kecil konselor</span></div>
              <div>{renderCheck(tier2.penugasanMentorDewasa)} <span>Mentor dewasa</span></div>
              <div>{renderCheck(tier2.bimbinganAkademikTambahan)} <span>Bimbingan akademik tambahan</span></div>
            </td>

            {/* TIER 3 */}
            <td className="p-1.5 border-r border-slate-200 space-y-1">
              <div>
                {renderCheck(tier3.otAssessmentIndividualStrategies)}
                <span className="font-semibold text-slate-800">OT Assessment/Strategy:</span>
                {tier3.otAssessmentIndividualStrategiesNotes && (
                  <div className="ml-3 text-slate-600 italic text-[7px]">{tier3.otAssessmentIndividualStrategiesNotes}</div>
                )}
              </div>
              <div>{renderCheck(tier3.oneOneInteraction)} <span>One-one interaction</span></div>
              <div>{renderCheck(tier3.consultationWithTeamMembers)} <span>Konsultasi tim</span></div>
              <div>{renderCheck(tier3.penilaianPerilakuFungsional)} <span>Penilaian fungsional</span></div>
              <div>{renderCheck(tier3.konselingIndividu)} <span>Konseling individu</span></div>
            </td>

            {/* TIER 4 */}
            <td className="p-1.5 space-y-1">
              <div>
                {renderCheck(tier4.multipleNeeds)}
                <span className="font-semibold text-slate-800">Multiple needs:</span>
                {tier4.multipleNeedsNotes && (
                  <div className="ml-3 text-slate-600 italic text-[7px]">{tier4.multipleNeedsNotes}</div>
                )}
              </div>
              <div>{renderCheck(tier4.changePlaces)} <span>Change places</span></div>
              <div>{renderCheck(tier4.dukunganAkademikIndividualIntensif)} <span>Dukungan intensif</span></div>
              <div>{renderCheck(tier4.pengajaranKeterampilanSosialIndividuIntensif)} <span>Keterampilan sosial</span></div>
              <div>{renderCheck(tier4.rencanaManajemenPerilakuIndividu)} <span>Manajemen perilaku</span></div>
              <div>{renderCheck(tier4.pelatihanDanKerjasamaOrangTua)} <span>Kerjasama ortu</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SignatureSection: React.FC<{
  config: AssessmentSignatureConfig;
  onUpdateConfig: (newConfig: AssessmentSignatureConfig) => void;
  onUploadImage: (slot: 'signer1' | 'signerTW' | 'signer2' | 'signer3', file: File) => void;
  onRemoveImage: (slot: 'signer1' | 'signerTW' | 'signer2' | 'signer3') => void;
  isStandalone?: boolean;
}> = ({ config, onUpdateConfig, onUploadImage, onRemoveImage, isStandalone }) => {
  return (
    <div 
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      className={`w-full bg-white border border-slate-300 rounded-lg p-4 font-sans break-inside-avoid print:break-inside-avoid ${
        isStandalone ? 'my-auto py-8' : 'mt-2'
      }`}
    >
      {/* 1. Tempat & Tanggal Dokumen (Pojok Kanan Atas Dokumen) */}
      <div className="flex justify-end pr-3 font-semibold text-slate-700 text-[11px] mb-3">
        <span>{config.location || 'Depok'}, {config.dateString}</span>
      </div>

      {/* 2. BARIS ATAS: Terapis Okupasi & Terapis Wicara (Posisi Sejajar) */}
      <div className="grid grid-cols-2 gap-8 items-start mb-4">
        {/* Kolom Kiri: Terapis Okupasi */}
        <div className="text-center flex flex-col items-center">
          <p className="font-bold text-slate-800 text-[11px]">{config.signer1?.roleTitle || 'Terapis Okupasi,'}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {config.signer1?.departmentTitle || 'Terapis Okupasi'}
          </p>
          
          <div className="h-16 flex items-center justify-center relative my-1.5 group/ttd">
            {config.signer1?.signatureImage ? (
              <div className="relative inline-block">
                <img 
                  src={config.signer1.signatureImage} 
                  alt="Tanda Tangan Terapis Okupasi" 
                  className="max-h-14 max-w-[150px] object-contain select-none"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage('signer1')}
                  className="print:hidden absolute -top-1 -right-4 p-0.5 rounded-full bg-rose-600 text-white text-[8px] opacity-0 group-hover/ttd:opacity-100 transition-opacity"
                  title="Hapus TTD Digital"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="print:hidden h-12 w-40 border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-colors p-1" title="Upload tanda tangan terapis okupasi">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[9px] font-bold">+ Upload TTD</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && onUploadImage('signer1', e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="w-48 h-0.5 bg-slate-900 mx-auto mb-1.5" />
          <input 
            type="text"
            value={config.signer1?.name || ''}
            onChange={(e) => onUpdateConfig({
              ...config,
              signer1: { ...config.signer1, name: e.target.value }
            })}
            className="w-full text-center font-bold text-slate-900 uppercase text-[11px] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none tracking-normal"
            title="Klik untuk mengubah nama terapis okupasi"
            placeholder="NAMA TERAPIS OKUPASI"
          />
        </div>

        {/* Kolom Kanan: Terapis Wicara (Posisi Sejajar dengan Terapis Okupasi) */}
        <div className="text-center flex flex-col items-center">
          <p className="font-bold text-slate-800 text-[11px]">{config.signerTW?.roleTitle || 'Terapis Wicara,'}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {config.signerTW?.departmentTitle || 'Terapis Wicara'}
          </p>
          
          <div className="h-16 flex items-center justify-center relative my-1.5 group/ttd">
            {config.signerTW?.signatureImage ? (
              <div className="relative inline-block">
                <img 
                  src={config.signerTW.signatureImage} 
                  alt="Tanda Tangan Terapis Wicara" 
                  className="max-h-14 max-w-[150px] object-contain select-none"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage('signerTW')}
                  className="print:hidden absolute -top-1 -right-4 p-0.5 rounded-full bg-rose-600 text-white text-[8px] opacity-0 group-hover/ttd:opacity-100 transition-opacity"
                  title="Hapus TTD Digital"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="print:hidden h-12 w-40 border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-colors p-1" title="Upload tanda tangan terapis wicara">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[9px] font-bold">+ Upload TTD</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && onUploadImage('signerTW', e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="w-48 h-0.5 bg-slate-900 mx-auto mb-1.5" />
          <input 
            type="text"
            value={config.signerTW?.name || ''}
            onChange={(e) => onUpdateConfig({
              ...config,
              signerTW: { ...config.signerTW, name: e.target.value }
            })}
            className="w-full text-center font-bold text-slate-900 uppercase text-[11px] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none tracking-normal"
            title="Klik untuk mengubah nama terapis wicara"
            placeholder="NAMA TERAPIS WICARA"
          />
        </div>
      </div>

      {/* 3. BARIS BAWAH: Kepala Inklusi (Posisi di Bawah dan di Tengah) */}
      <div className="flex justify-center w-full">
        <div className="text-center flex flex-col items-center max-w-[320px]">
          <p className="font-bold text-slate-800 text-[11px]">{config.signer2?.roleTitle || 'Mengetahui,'}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-tight font-semibold leading-tight">
            {config.signer2?.departmentTitle || 'Kepala Pendidikan Inklusif Lazuardi GCS'}
          </p>

          <div className="h-16 flex items-center justify-center relative my-1.5 group/ttd">
            {config.signer2?.signatureImage ? (
              <div className="relative inline-block">
                <img 
                  src={config.signer2.signatureImage} 
                  alt="Tanda Tangan Kepala Inklusi" 
                  className="max-h-14 max-w-[150px] object-contain select-none"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage('signer2')}
                  className="print:hidden absolute -top-1 -right-4 p-0.5 rounded-full bg-rose-600 text-white text-[8px] opacity-0 group-hover/ttd:opacity-100 transition-opacity"
                  title="Hapus TTD Digital"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="print:hidden h-12 w-40 border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-colors p-1" title="Upload tanda tangan kepala inklusi">
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[9px] font-bold">+ Upload TTD</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && onUploadImage('signer2', e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="w-52 h-0.5 bg-slate-900 mx-auto mb-1.5" />
          <input 
            type="text"
            value={config.signer2?.name || ''}
            onChange={(e) => onUpdateConfig({
              ...config,
              signer2: { ...config.signer2, name: e.target.value }
            })}
            className="w-full text-center font-bold text-slate-900 uppercase text-[11px] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none tracking-normal"
            title="Klik untuk mengubah nama kepala inklusi"
            placeholder="NAMA KEPALA INKLUSI"
          />
        </div>
      </div>

      {/* 4. OPTIONAL: Orang Tua / Wali Siswa */}
      {config.showParentSignature && config.signer3 && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-center w-full">
          <div className="text-center flex flex-col items-center max-w-[320px]">
            <p className="font-bold text-slate-800 text-[11px]">{config.signer3.roleTitle || 'Menyetujui (Orang Tua / Wali),'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {config.signer3.departmentTitle || 'Orang Tua / Wali Siswa'}
            </p>

            <div className="h-16 flex items-center justify-center relative my-1.5 group/ttd">
              {config.signer3.signatureImage ? (
                <div className="relative inline-block">
                  <img 
                    src={config.signer3.signatureImage} 
                    alt="Tanda Tangan Orang Tua" 
                    className="max-h-14 max-w-[150px] object-contain select-none"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage('signer3')}
                    className="print:hidden absolute -top-1 -right-4 p-0.5 rounded-full bg-rose-600 text-white text-[8px] opacity-0 group-hover/ttd:opacity-100 transition-opacity"
                    title="Hapus TTD Digital"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="print:hidden h-12 w-40 border border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-colors p-1" title="Upload tanda tangan orang tua">
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[9px] font-bold">+ Upload TTD</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && onUploadImage('signer3', e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div className="w-52 h-0.5 bg-slate-900 mx-auto mb-1.5" />
            <input 
              type="text"
              value={config.signer3.name}
              onChange={(e) => onUpdateConfig({
                ...config,
                signer3: { ...config.signer3, name: e.target.value }
              })}
              className="w-full text-center font-bold text-slate-900 uppercase text-[11px] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none tracking-normal"
              title="Klik untuk mengubah nama orang tua / wali"
              placeholder="NAMA ORANG TUA / WALI"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPrintPreviewModal;
