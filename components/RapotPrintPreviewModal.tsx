import React, { useRef, useState, useMemo, useLayoutEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Check,
  CheckCircle2,
  FileText,
  Layers,
  Sparkles,
  PenTool,
  Upload,
  Trash2,
  Settings2,
  Edit
} from 'lucide-react';
import { exportPagesToPdf, triggerBrowserA4Print } from '../utils/rapotPdfGenerator';
import { Child } from '../types';
import { RapotSignatures } from '../utils/signatureProcessor';
import {
  TherapyReportTemplate,
  TherapyKopHeader,
  TherapyRunningHeader,
  TherapyStudentInfoTable,
  TherapyRunningFooter,
  TherapyTable,
  TherapyNotesBlock,
  TherapySignatureBlock,
  TherapyStudentInfo
} from './TherapyReportTemplate';

export interface RapotSignerItem {
  roleTitle: string;
  departmentTitle: string;
  name: string;
  nip?: string;
  signatureImage?: string;
}

export interface RapotSignatureConfig {
  layout: '2-columns' | '3-columns' | '3-columns-row';
  position?: 'compact' | 'balanced' | 'bottom';
  location: string;
  dateString: string;
  signer1: RapotSignerItem; // Terapis Penanggung Jawab
  signer2: RapotSignerItem; // Manager Pelangi Lazuardi
  signer3: RapotSignerItem; // Kepala Pendidikan Inklusif
}

export const STORAGE_KEY_RAPOT_SIGNATURES = 'pelangi360_rapot_print_signatures_v2';

export const getStoredRapotSignatures = (
  reportData: any,
  identitas: any,
  titles: any,
  therapyName: string,
  signatures?: RapotSignatures
): RapotSignatureConfig => {
  const activeSigs = signatures || reportData?.signatures || reportData?.settings?.signatures || {};
  
  const defaultConfig: RapotSignatureConfig = {
    layout: '3-columns-row',
    position: 'compact',
    location: titles?.signatureDatePrefix || 'Cinere',
    dateString: identitas?.tanggalEvaluasi || identitas?.tglEvaluasi || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    signer1: {
      roleTitle: titles?.signatureTherapistRole || 'Terapis Penanggung Jawab',
      departmentTitle: titles?.signatureTherapistTitle || `Terapis ${therapyName}`,
      name: identitas?.terapis || titles?.signatureTherapistName || 'Eka Talia Kameswari, A.Md.OT',
      nip: '',
      signatureImage: activeSigs.therapist?.imageUrl || undefined,
    },
    signer2: {
      roleTitle: titles?.signatureKnowingTitle || 'Mengetahui,',
      departmentTitle: titles?.signatureManagerTitle || 'Manager Pelangi Lazuardi RC',
      name: titles?.signatureManagerName || 'Asep Suherman, S.E, M.M',
      nip: '',
      signatureImage: activeSigs.manager?.imageUrl || undefined,
    },
    signer3: {
      roleTitle: titles?.signatureKnowingTitle || 'Mengetahui,',
      departmentTitle: titles?.signatureSigner3Title || 'Kepala Pendidikan Inklusif Lazuardi GCS',
      name: titles?.signatureSigner3Name || 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
      nip: '',
      signatureImage: activeSigs.signer3?.imageUrl || undefined,
    }
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY_RAPOT_SIGNATURES);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        layout: parsed.layout || defaultConfig.layout,
        position: parsed.position || defaultConfig.position,
        location: parsed.location || defaultConfig.location,
        dateString: parsed.dateString || defaultConfig.dateString,
        signer1: {
          roleTitle: parsed.signer1?.roleTitle || defaultConfig.signer1.roleTitle,
          departmentTitle: parsed.signer1?.departmentTitle || defaultConfig.signer1.departmentTitle,
          name: parsed.signer1?.name || defaultConfig.signer1.name,
          nip: parsed.signer1?.nip ?? defaultConfig.signer1.nip,
          signatureImage: parsed.signer1?.signatureImage || defaultConfig.signer1.signatureImage,
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
    console.error('Failed to load rapot signatures:', e);
  }
  return defaultConfig;
};

export const saveStoredRapotSignatures = (config: RapotSignatureConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY_RAPOT_SIGNATURES, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save rapot signatures:', e);
  }
};

const processSignatureFileToDataUrl = (file: File): Promise<string> => {
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

interface RapotPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
  therapyType: string;
  reportData: any;
  period: string;
  year: number;
  logoUrl?: string;
  fileName: string;
  signatures?: RapotSignatures;
  onOpenSignatureModal?: (slot?: 'therapist' | 'manager' | 'signer3') => void;
}

interface RenderProps {
  startIndex?: number;
  endIndex?: number;
  isContinuation?: boolean;
  isCategoryContinuation?: boolean;
  showCategoryHeader?: boolean;
  hideCategoryHeader?: boolean;
}

interface FlowBlock {
  id: string;
  categoryId?: string;
  title?: string;
  categoryTitle?: string;
  isSignature?: boolean;
  totalItems?: number;
  estimatedHeight: number;
  estimatedHeightNoCategory?: number;
  render: (props?: RenderProps) => React.ReactNode;
}

interface PageBlockInstance {
  id: string;
  block: FlowBlock;
  showCategoryHeader: boolean;
  isCategoryContinuation: boolean;
  isContinuation?: boolean;
  startIndex?: number;
  endIndex?: number;
}

export const RapotPrintPreviewModal: React.FC<RapotPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  child,
  therapyType,
  reportData,
  period,
  year,
  logoUrl,
  fileName,
  signatures,
  onOpenSignatureModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(0.78);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  
  // Default to continuous flow ('flow'): dense, natural, optimal page filling without artificial gaps
  const [layoutMode, setLayoutMode] = useState<'flow' | 'separate'>('flow');
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});

  if (!isOpen || !child || !reportData) return null;

  const therapyName = 
    therapyType === 'OT' ? 'Okupasi Terapi' :
    therapyType === 'TW' ? 'Terapi Wicara' :
    therapyType === 'REMEDIAL' ? 'Terapi Remedial' :
    therapyType === 'FT' ? 'Fisioterapi' : 
    therapyType === 'HT' ? 'Hidroterapi' : 
    therapyType === 'BERKUDA' ? 'Terapi Berkuda' : (reportData.namaRapot || reportData.title || 'Rapot Terapi');

  const settings = reportData.settings || {};
  const titles = settings.titles || {};
  const identitas = reportData.identitas || {};
  const activeSignatures: RapotSignatures = signatures || reportData.signatures || reportData.settings?.signatures || {};

  // Interactive Signature Customization State
  const [isSignatureSettingsOpen, setIsSignatureSettingsOpen] = useState<boolean>(false);
  const [signatureConfig, setSignatureConfig] = useState<RapotSignatureConfig>(() =>
    getStoredRapotSignatures(reportData, identitas, titles, therapyName, signatures)
  );

  const handleUpdateSignatureConfig = (newConfig: RapotSignatureConfig) => {
    setSignatureConfig(newConfig);
    saveStoredRapotSignatures(newConfig);
  };

  const handleSignerImageUpload = async (slot: 'signer1' | 'signer2' | 'signer3', file: File) => {
    try {
      const dataUrl = await processSignatureFileToDataUrl(file);
      const updated: RapotSignatureConfig = {
        ...signatureConfig,
        [slot]: {
          ...signatureConfig[slot],
          signatureImage: dataUrl,
        }
      };
      handleUpdateSignatureConfig(updated);
    } catch (err) {
      console.error('Error processing signature image:', err);
    }
  };

  const handleRemoveSignerImage = (slot: 'signer1' | 'signer2' | 'signer3') => {
    const updated: RapotSignatureConfig = {
      ...signatureConfig,
      [slot]: {
        ...signatureConfig[slot],
        signatureImage: undefined,
      }
    };
    handleUpdateSignatureConfig(updated);
  };

  // =========================================================================
  // 1. SHARED HEADER, IDENTITY, AND FOOTER ATOMS (DELEGATING TO UNIFIED TEMPLATE)
  // =========================================================================
  const studentInfo: TherapyStudentInfo = useMemo(() => ({
    nama: identitas.nama || child.name || 'Siswa Terapi',
    noRegistrasi: identitas.noRegistrasi || child.id || '-',
    tglLahir: identitas.tglLahir || identitas.tanggalLahir || child.dateOfBirth || '-',
    usia: identitas.usia || (child.dateOfBirth ? `${new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} Thn` : '7 Thn'),
    unit: identitas.unit || child.school || '-',
    tglEvaluasi: identitas.tglEvaluasi || identitas.tanggalEvaluasi || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    terapis: identitas.terapis || signatureConfig.signer1.name || titles.signatureTherapistName || 'Eka Talia Kameswari, A.Md.OT',
    programTerapi: identitas.programTerapi || therapyName,
  }), [identitas, child, signatureConfig, titles, therapyName]);

  const FullKop = () => (
    <TherapyKopHeader
      logoUrl={logoUrl}
      schoolName={titles.schoolName || 'PELANGI LAZUARDI'}
      schoolSubtitle={titles.schoolSubtitle}
      schoolAddress={titles.schoolAddress}
      headerBadge={titles.headerBadge || 'LAPORAN KEMAJUAN TERAPI'}
      period={period}
      year={year}
      docNumber={identitas.noRegistrasi || child.id}
    />
  );

  const RunningHeader = ({ title = 'PROGRESS REPORT' }: { title?: string }) => (
    <TherapyRunningHeader
      title={title}
      childName={child.name}
      therapyName={therapyName}
      period={period}
      year={year}
    />
  );

  const PageFooter = ({ pageNum, totalPages }: { pageNum: number; totalPages: number }) => (
    <TherapyRunningFooter
      currentPage={pageNum}
      totalPages={totalPages}
      docNumber={identitas.noRegistrasi || child.id}
    />
  );

  const IdentityGrid = () => (
    <TherapyStudentInfoTable info={studentInfo} />
  );

  // =========================================================================
  // 2. UNIFIED FORMAL RAPOT TABLE COMPONENT
  // =========================================================================
  const UnifiedRapotTable = ({
    categoryTitle,
    title,
    headerTitle = 'INDIKATOR RESPON',
    items = [],
    scale,
    scaleKey,
    scaleExplanations,
    komentar,
    komentarLabel = 'Catatan / Komentar :',
    startIndex = 0,
    endIndex,
    isContinuation = false,
    isCategoryContinuation = false,
    hideCategoryHeader = false,
  }: {
    categoryTitle?: string;
    title?: string;
    headerTitle?: string;
    items: Array<{ label: string; awal?: any; hasil?: any; [k: string]: any }>;
    scale?: string[];
    scaleKey?: string;
    scaleExplanations?: string;
    komentar?: string;
    komentarLabel?: string;
    startIndex?: number;
    endIndex?: number;
    isContinuation?: boolean;
    isCategoryContinuation?: boolean;
    hideCategoryHeader?: boolean;
  }) => {
    const rawScale = titles[scaleKey || '']
      ? (typeof titles[scaleKey || ''] === 'string'
          ? titles[scaleKey || ''].split('/').map((s: string) => s.trim())
          : titles[scaleKey || ''])
      : (scale || ['teramati', 'tidak']);

    const activeScale: string[] = Array.isArray(rawScale) ? rawScale : ['teramati', 'tidak'];
    const headerAwal = titles.headerAwal || 'AWAL';
    const headerHasil = titles.headerHasil || 'HASIL';

    return (
      <TherapyTable
        categoryTitle={categoryTitle}
        title={title}
        headerTitle={headerTitle}
        items={items}
        scale={activeScale}
        scaleExplanations={scaleExplanations}
        komentar={komentar}
        komentarLabel={komentarLabel}
        startIndex={startIndex}
        endIndex={endIndex}
        isContinuation={isContinuation}
        isCategoryContinuation={isCategoryContinuation}
        hideCategoryHeader={hideCategoryHeader}
        headerAwal={headerAwal}
        headerHasil={headerHasil}
      />
    );
  };

  // =========================================================================
  // 3. STRUCTURED MULTI-COLUMN TABLE (For TW & REMEDIAL)
  // =========================================================================
  const StructuredEvaluationTable = ({
    categoryTitle,
    title,
    items = [],
    komentar,
    komentarLabel = 'Catatan Evaluasi :',
    startIndex = 0,
    endIndex,
    isContinuation = false,
    isCategoryContinuation = false,
    hideCategoryHeader = false,
  }: {
    categoryTitle?: string;
    title?: string;
    items: Array<{ label: string; aktivitas?: string; awal?: any; tujuan?: any; hasil?: any; [k: string]: any }>;
    komentar?: string;
    komentarLabel?: string;
    startIndex?: number;
    endIndex?: number;
    isContinuation?: boolean;
    isCategoryContinuation?: boolean;
    hideCategoryHeader?: boolean;
  }) => {
    const visibleItems = items.slice(startIndex, endIndex !== undefined ? endIndex : items.length);
    const isLastPart = endIndex === undefined || endIndex >= items.length;

    return (
      <div 
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        className="report-section space-y-1 font-sans break-inside-avoid print:break-inside-avoid"
      >
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

        <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-2xs">
          {title && (
            <div className="section-title bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
              {title} {isContinuation ? '(Lanjutan)' : ''}
            </div>
          )}

          {/* Table Header */}
          <table className="report-table w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-800 uppercase">
                <th className="w-8 text-center py-2 px-1 border-r border-slate-300 align-middle">No</th>
                <th className="text-left py-2 px-3 border-r border-slate-300 align-middle">Indikator & Aktivitas Capaian</th>
                <th className="w-32 py-2 px-2 text-left border-r border-slate-300 align-middle">Kondisi Awal</th>
                <th className="w-32 py-2 px-2 text-left border-r border-slate-300 align-middle">Target Capaian</th>
                <th className="w-32 py-2 px-2 text-left text-indigo-950 align-middle">Hasil Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleItems.map((it, idx) => {
                const actualIdx = startIndex + idx + 1;
                return (
                  <tr key={idx} className="odd:bg-white even:bg-slate-50/50">
                    <td className="w-8 text-center font-bold text-slate-500 border-r border-slate-200 p-2 align-middle">
                      {actualIdx}.
                    </td>
                    <td className="p-2 px-3 border-r border-slate-200 align-middle" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      <p className="font-bold text-slate-900 text-[11px]">{it.label}</p>
                      {it.aktivitas && (
                        <p className="text-[10px] text-slate-600 mt-0.5">Aktivitas: {it.aktivitas}</p>
                      )}
                    </td>
                    <td className="w-32 p-2 border-r border-slate-200 text-slate-700 text-[11px] align-middle" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      {it.awal || '-'}
                    </td>
                    <td className="w-32 p-2 border-r border-slate-200 text-slate-700 text-[11px] align-middle" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      {it.tujuan || '-'}
                    </td>
                    <td className="w-32 p-2 font-bold text-indigo-950 text-[11px] align-middle" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      {it.hasil || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {komentar && isLastPart && (
            <div className="catatan-box p-2.5 bg-slate-50/80 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                {komentarLabel}
              </span>
              <p 
                className="text-[11px] text-slate-800 font-sans"
                style={{
                  lineHeight: 1.6,
                  padding: '10px',
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

  // =========================================================================
  // 4. SIGNATURE AREA
  // =========================================================================
  const SignatureArea = ({ isStandalone = false }: { isStandalone?: boolean }) => {
    return (
      <TherapySignatureBlock
        config={signatureConfig}
        onUploadImage={handleSignerImageUpload}
        onRemoveImage={handleRemoveSignerImage}
        isStandalone={isStandalone}
      />
    );
  };
  // =========================================================================
  // 5. ATOMIC FLOW BLOCKS GENERATOR & HEIGHT CALCULATORS
  // Calculates realistic height budgets and treats every section/table as an unbroken unit
  // =========================================================================
  const calcUnifiedTableHeight = (
    itemsCount: number,
    hasTitle: boolean,
    hasScaleExp: boolean,
    commentText?: string
  ) => {
    const commentH = commentText && commentText.trim().length > 0 
      ? (36 + Math.ceil(commentText.length / 55) * 18) 
      : 0;
    const tablePart = (hasTitle ? 26 : 0) + 34 + itemsCount * 28 + (hasScaleExp ? 22 : 0) + commentH;
    return {
      withCat: tablePart + 36,
      withoutCat: tablePart,
    };
  };

  const calcStructuredTableHeight = (
    items: any[],
    hasTitle: boolean,
    commentText?: string
  ) => {
    let rowsHeight = 0;
    for (const it of items) {
      const textLen = Math.max(
        (it.label || '').length,
        (it.awal || '').length,
        (it.tujuan || '').length,
        (it.hasil || '').length
      );
      const approxLines = Math.max(2, Math.ceil(textLen / 28));
      rowsHeight += Math.max(52, approxLines * 16 + 20);
    }
    const commentH = commentText && commentText.trim().length > 0 
      ? (36 + Math.ceil(commentText.length / 55) * 18) 
      : 0;
    const tablePart = (hasTitle ? 26 : 0) + 34 + (rowsHeight || 52) + commentH;
    return {
      withCat: tablePart + 36,
      withoutCat: tablePart,
    };
  };

  const flowBlocks = useMemo((): FlowBlock[] => {
    const blocks: FlowBlock[] = [];

    if (therapyType === 'OT') {
      // 1. Perilaku Umum
      if (reportData.perilakuUmum) {
        const items = reportData.perilakuUmum?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.perilakuUmum?.komentar);
        blocks.push({
          id: 'ot-perilaku',
          categoryId: 'perilaku',
          categoryTitle: titles.perilakuUmum || 'Perilaku Umum',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.perilakuUmum || 'Perilaku Umum'}
              headerTitle={titles.tableHeaderIndikator || 'RESPON'}
              items={items}
              scaleKey="scalePerilaku"
              scale={['teramati', 'tidak']}
              komentar={reportData.perilakuUmum?.komentar}
              komentarLabel={titles.labelCatatanPerilaku || 'Catatan Perilaku :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Sensory Modulasi
      if (reportData.sensory?.modulasi) {
        const items = reportData.sensory?.modulasi || [];
        const h = calcUnifiedTableHeight(items.length, true, true);
        blocks.push({
          id: 'ot-sensory-mod',
          categoryId: 'sensory',
          categoryTitle: titles.sensory || 'A. Sensory Processing',
          title: titles.sensoryModulasi || '1. SENSORI MODULASI',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.sensory || 'A. Sensory Processing'}
              title={titles.sensoryModulasi || '1. SENSORI MODULASI'}
              headerTitle={titles.tableHeaderSensoryMod || 'RESPONS'}
              items={items}
              scaleKey="scaleSensoryMod"
              scale={['B', 'S', 'K', 'BR']}
              scaleExplanations={titles.scaleExplanationsSensoryMod || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 3. Sensory Diskriminasi
      if (reportData.sensory?.diskriminasi) {
        const items = reportData.sensory?.diskriminasi || [];
        const h = calcUnifiedTableHeight(items.length, true, true);
        blocks.push({
          id: 'ot-sensory-dis',
          categoryId: 'sensory',
          categoryTitle: titles.sensory || 'A. Sensory Processing',
          title: titles.sensoryDiskriminasi || '2. SENSORI DISKRIMINASI',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.sensory || 'A. Sensory Processing'}
              title={titles.sensoryDiskriminasi || '2. SENSORI DISKRIMINASI'}
              headerTitle={titles.tableHeaderSensoryDis || 'RESPONS'}
              items={items}
              scaleKey="scaleSensory"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsSensory || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 4. Sensory Praksis
      if (reportData.sensory?.praksis) {
        const items = reportData.sensory?.praksis || [];
        const h = calcUnifiedTableHeight(items.length, true, true, reportData.sensory?.komentar);
        blocks.push({
          id: 'ot-sensory-pra',
          categoryId: 'sensory',
          categoryTitle: titles.sensory || 'A. Sensory Processing',
          title: titles.sensoryPraksis || '3. PRAKSIS',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.sensory || 'A. Sensory Processing'}
              title={titles.sensoryPraksis || '3. PRAKSIS'}
              headerTitle={titles.tableHeaderSensoryPra || 'RESPONS'}
              items={items}
              scaleKey="scaleSensory"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsSensory || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.sensory?.komentar}
              komentarLabel={titles.labelKomentarSensori || 'Catatan Sensori :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 5. Motorik Kasar
      if (reportData.motorik?.kasar) {
        const items = reportData.motorik?.kasar || [];
        const h = calcUnifiedTableHeight(items.length, true, false);
        blocks.push({
          id: 'ot-motorik-kasar',
          categoryId: 'motorik',
          categoryTitle: titles.motorik || 'B. Perkembangan Kemampuan Motorik',
          title: titles.motorikKasar || '1. MOTORIK KASAR',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.motorik || 'B. Perkembangan Kemampuan Motorik'}
              title={titles.motorikKasar || '1. MOTORIK KASAR'}
              headerTitle={titles.tableHeaderMotorikKasar || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleMotorik"
              scale={['MD', 'SD', 'TD']}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 6. Motorik Halus
      if (reportData.motorik?.halus) {
        const items = reportData.motorik?.halus || [];
        const h = calcUnifiedTableHeight(items.length, true, true, reportData.motorik?.komentar);
        blocks.push({
          id: 'ot-motorik-halus',
          categoryId: 'motorik',
          categoryTitle: titles.motorik || 'B. Perkembangan Kemampuan Motorik',
          title: titles.motorikHalus || '2. MOTORIK HALUS',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.motorik || 'B. Perkembangan Kemampuan Motorik'}
              title={titles.motorikHalus || '2. MOTORIK HALUS'}
              headerTitle={titles.tableHeaderMotorikHalus || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleMotorik"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsMotorik || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.motorik?.komentar}
              komentarLabel={titles.labelKomentarMotorik || 'Catatan Motorik :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 7. Regulasi Diri & Emosi
      if (reportData.emosi?.items) {
        const items = reportData.emosi?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.emosi?.komentar);
        blocks.push({
          id: 'ot-emosi',
          categoryId: 'emosi',
          categoryTitle: titles.emosi || 'C. Regulasi Diri & Emosi',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.emosi || 'C. Regulasi Diri & Emosi'}
              headerTitle={titles.tableHeaderEmosi || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleEmosi"
              scale={['T', 'K', 'S', 'H']}
              scaleExplanations={titles.scaleExplanationsEmosi || 'T: Tidak Pernah Muncul | K: Kadang-kadang | S: Sering | H: Kehilangan Kemampuan'}
              komentar={reportData.emosi?.komentar}
              komentarLabel={titles.labelKomentarEmosi || 'Catatan Emosi :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 8. Kognisi (if present in OT)
      if (reportData.kognisi?.items && reportData.kognisi.items.length > 0) {
        const items = reportData.kognisi?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.kognisi?.komentar);
        blocks.push({
          id: 'ot-kognisi',
          categoryId: 'kognisi',
          categoryTitle: titles.kognisi || 'D. Kognisi & Pemecahan Masalah',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.kognisi || 'D. Kognisi & Pemecahan Masalah'}
              headerTitle={titles.tableHeaderKognisi || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleKognisi"
              scale={['TM', 'KP', 'KTK', 'KK']}
              komentar={reportData.kognisi?.komentar}
              komentarLabel={titles.labelKomentarKognisi || 'Catatan Kognisi :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (therapyType === 'TW') {
      // 1. Reseptif
      if (reportData.reseptif?.items) {
        const items = reportData.reseptif?.items || [];
        const h = calcStructuredTableHeight(items, false, reportData.reseptif?.komentar);
        blocks.push({
          id: 'tw-reseptif',
          categoryId: 'reseptif',
          categoryTitle: titles.reseptif || 'A. Kemampuan Bahasa Reseptif (Pemahaman)',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <StructuredEvaluationTable
              categoryTitle={titles.reseptif || 'A. Kemampuan Bahasa Reseptif (Pemahaman)'}
              items={items}
              komentar={reportData.reseptif?.komentar}
              komentarLabel="Catatan Reseptif :"
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Ekspresif
      if (reportData.ekspresif) {
        blocks.push({
          id: 'tw-ekspresif',
          categoryId: 'ekspresif',
          categoryTitle: titles.ekspresif || 'B. Kemampuan Bahasa Ekspresif',
          estimatedHeight: 140,
          estimatedHeightNoCategory: 105,
          render: (p) => {
            const showCat = p?.showCategoryHeader !== false && !p?.hideCategoryHeader;
            return (
              <div className="report-section space-y-1 font-sans break-inside-avoid print:break-inside-avoid">
                {showCat && (
                  <div className="section-title bg-slate-900 text-white px-3 py-1.5 rounded-md text-[12px] font-bold uppercase tracking-wider flex items-center justify-between shadow-2xs">
                    <span>
                      {titles.ekspresif || 'B. Kemampuan Bahasa Ekspresif'} {p?.isCategoryContinuation ? '(Lanjutan)' : ''}
                    </span>
                    {p?.isCategoryContinuation && (
                      <span className="text-[10px] text-slate-300 font-normal lowercase italic">(lanjutan)</span>
                    )}
                  </div>
                )}
                <div className="bg-white border border-slate-300 rounded-md p-2.5 shadow-2xs space-y-2 text-[11px]">
                  {reportData.ekspresif?.contohMenceritakan && (
                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">
                        {titles.labelContohMenceritakan || 'Contoh Menceritakan Kembali :'}
                      </span>
                      <p className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-800 leading-relaxed font-sans text-[11px] text-justify">
                        {reportData.ekspresif.contohMenceritakan}
                      </p>
                    </div>
                  )}
                  {reportData.ekspresif?.komentar && (
                    <div className="catatan-box pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">
                        {titles.labelKomentarEkspresif || 'Catatan Ekspresif :'}
                      </span>
                      <p className="text-slate-800 leading-relaxed font-sans text-[11px] text-justify">
                        {reportData.ekspresif.komentar}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        });
      }

      // 3. Artikulasi
      if (reportData.artikulasi?.items) {
        const items = reportData.artikulasi?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.artikulasi?.komentar);
        blocks.push({
          id: 'tw-artikulasi',
          categoryId: 'artikulasi',
          categoryTitle: titles.artikulasi || 'C. Artikulasi & Kejelasan Bicara',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.artikulasi || 'C. Artikulasi & Kejelasan Bicara'}
              headerTitle={titles.tableHeaderArtikulasi || 'INDIKATOR'}
              items={items}
              scale={['MD', 'SD', 'TD']}
              komentar={reportData.artikulasi?.komentar}
              komentarLabel={titles.labelKomentarArtikulasi || 'Catatan Artikulasi :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 4. Komunikasi Sosial
      if (reportData.komunikasiSosial?.items) {
        const items = reportData.komunikasiSosial?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.komunikasiSosial?.komentar);
        blocks.push({
          id: 'tw-sosial',
          categoryId: 'sosial',
          categoryTitle: titles.sosial || 'D. Komunikasi Sosial / Pragmatik',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.sosial || 'D. Komunikasi Sosial / Pragmatik'}
              headerTitle={titles.tableHeaderSosial || 'INDIKATOR RESPON'}
              items={items}
              scale={['TM', 'KP', 'KTK', 'KK']}
              komentar={reportData.komunikasiSosial?.komentar}
              komentarLabel={titles.labelKomentarSosial || 'Catatan Sosial :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (therapyType === 'REMEDIAL') {
      // 1. Akademik
      if (reportData.academic?.items) {
        const items = reportData.academic?.items || [];
        const h = calcStructuredTableHeight(items, false);
        blocks.push({
          id: 'remedial-academic',
          categoryId: 'academic',
          categoryTitle: titles.academic || 'A. Perkembangan Kemampuan Akademik Dasar',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <StructuredEvaluationTable
              categoryTitle={titles.academic || 'A. Perkembangan Kemampuan Akademik Dasar'}
              items={items}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Writing
      if (reportData.writing?.items) {
        const items = reportData.writing?.items || [];
        const h = calcStructuredTableHeight(items, false);
        blocks.push({
          id: 'remedial-writing',
          categoryId: 'writing',
          categoryTitle: titles.literacy || 'B. Kemampuan Menulis & Motorik Halus',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <StructuredEvaluationTable
              categoryTitle={titles.literacy || 'B. Kemampuan Menulis & Motorik Halus'}
              items={items}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 3. Kognisi
      if (reportData.kognisi?.items) {
        const items = reportData.kognisi?.items || [];
        const h = calcStructuredTableHeight(items, false);
        blocks.push({
          id: 'remedial-kognisi',
          categoryId: 'kognisi',
          categoryTitle: titles.kognisi || 'C. Kognisi & Pemecahan Masalah',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <StructuredEvaluationTable
              categoryTitle={titles.kognisi || 'C. Kognisi & Pemecahan Masalah'}
              items={items}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (therapyType === 'FT') {
      // 1. Perilaku Umum
      if (reportData.perilakuUmum) {
        const items = reportData.perilakuUmum?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.perilakuUmum?.komentar);
        blocks.push({
          id: 'ft-perilaku',
          categoryId: 'perilaku',
          categoryTitle: titles.perilakuUmum || 'Perilaku Umum',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.perilakuUmum || 'Perilaku Umum'}
              headerTitle={titles.tableHeaderIndikator || 'INDIKATOR RESPON'}
              items={items}
              scaleKey="scalePerilaku"
              scale={['teramati', 'tidak']}
              komentar={reportData.perilakuUmum?.komentar}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Sensory Processing
      if (reportData.sensory?.items) {
        const items = reportData.sensory?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.sensory?.komentar);
        blocks.push({
          id: 'ft-sensory',
          categoryId: 'sensory',
          categoryTitle: titles.sensory || 'B. Sensory Processing',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.sensory || 'B. Sensory Processing'}
              headerTitle={titles.tableHeaderRespons || 'RESPONS'}
              items={items}
              scale={['0', '1', '2', '3']}
              scaleExplanations={titles.scaleExplanationsSensoryFT || '0: Tidak Pernah | 1: Jarang | 2: Sering | 3: Selalu'}
              komentar={reportData.sensory?.komentar}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 3. Motorik Kasar
      if (reportData.motorik?.kasar) {
        const items = reportData.motorik?.kasar || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.motorik?.komentar);
        blocks.push({
          id: 'ft-motorik',
          categoryId: 'motorik',
          categoryTitle: titles.motorik || 'C. Perkembangan Kemampuan Motorik',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.motorik || 'C. Perkembangan Kemampuan Motorik'}
              headerTitle={titles.tableHeaderMotorikKasar || 'AKTIVITAS'}
              items={items}
              scale={['MD', 'SD', 'TD']}
              komentar={reportData.motorik?.komentar}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 4. Fisik GMFM
      if (reportData.fisik?.gmfm) {
        const items = reportData.fisik?.gmfm || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.fisik?.komentar);
        blocks.push({
          id: 'ft-fisik',
          categoryId: 'fisik',
          categoryTitle: titles.fisik || 'D. Kemampuan Fisik & Fungsional (GMFM)',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.fisik || 'D. Kemampuan Fisik & Fungsional (GMFM)'}
              headerTitle={titles.tableHeaderAktivitas || 'AKTIVITAS'}
              items={items}
              scale={['0', '1', '2', '3']}
              scaleExplanations={titles.scaleExplanationsFisik || '0: Tidak Memulai | 1: Memulai | 2: Sebagian | 3: Sempurna'}
              komentar={reportData.fisik?.komentar}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (therapyType === 'HT') {
      // 1. Adaptasi Air & Sensori Akuatik
      if (reportData.adaptasiAir) {
        const items = reportData.adaptasiAir?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.adaptasiAir?.komentar);
        blocks.push({
          id: 'ht-adaptasi',
          categoryId: 'adaptasiAir',
          categoryTitle: titles.adaptasiAir || 'A. Adaptasi Air & Sensori Akuatik',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.adaptasiAir || 'A. Adaptasi Air & Sensori Akuatik'}
              headerTitle={titles.tableHeaderIndikator || 'INDIKATOR RESPON'}
              items={items}
              scaleKey="scaleAdaptasi"
              scale={['B', 'S', 'K', 'BR']}
              scaleExplanations={titles.scaleExplanationsAdaptasi || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah'}
              komentar={reportData.adaptasiAir?.komentar}
              komentarLabel={titles.labelCatatanAdaptasi || 'Catatan Adaptasi Air :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Keterampilan & Kontrol Fisik di Air
      if (reportData.keterampilanAir) {
        const items = reportData.keterampilanAir?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.keterampilanAir?.komentar);
        blocks.push({
          id: 'ht-keterampilan',
          categoryId: 'keterampilanAir',
          categoryTitle: titles.keterampilanAir || 'B. Keterampilan & Kontrol Fisik di Air',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.keterampilanAir || 'B. Keterampilan & Kontrol Fisik di Air'}
              headerTitle={titles.tableHeaderAktivitas || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleKeterampilan"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsKeterampilan || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.keterampilanAir?.komentar}
              komentarLabel={titles.labelCatatanKeterampilan || 'Catatan Keterampilan Fisik :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 3. Keseimbangan & Koordinasi Fungsional
      if (reportData.keseimbanganAir) {
        const items = reportData.keseimbanganAir?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.keseimbanganAir?.komentar);
        blocks.push({
          id: 'ht-keseimbangan',
          categoryId: 'keseimbanganAir',
          categoryTitle: titles.keseimbanganAir || 'C. Keseimbangan & Koordinasi Fungsional',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.keseimbanganAir || 'C. Keseimbangan & Koordinasi Fungsional'}
              headerTitle={titles.tableHeaderAktivitas || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleKeseimbangan"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsKeterampilan || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.keseimbanganAir?.komentar}
              komentarLabel={titles.labelCatatanKeseimbangan || 'Catatan Keseimbangan :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (therapyType === 'BERKUDA') {
      // 1. Adaptasi, Perilaku & Regulasi Emosi
      if (reportData.adaptasiPerilaku) {
        const items = reportData.adaptasiPerilaku?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, false, reportData.adaptasiPerilaku?.komentar);
        blocks.push({
          id: 'berkuda-adaptasi',
          categoryId: 'adaptasiPerilaku',
          categoryTitle: titles.adaptasiPerilaku || 'A. Adaptasi, Perilaku & Regulasi Emosi',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.adaptasiPerilaku || 'A. Adaptasi, Perilaku & Regulasi Emosi'}
              headerTitle={titles.tableHeaderIndikator || 'INDIKATOR RESPON'}
              items={items}
              scaleKey="scalePerilaku"
              scale={['teramati', 'tidak']}
              komentar={reportData.adaptasiPerilaku?.komentar}
              komentarLabel={titles.labelCatatanPerilaku || 'Catatan Perilaku & Adaptasi :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 2. Postur, Keseimbangan & Kontrol Inti Tubuh
      if (reportData.posturKeseimbangan) {
        const items = reportData.posturKeseimbangan?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.posturKeseimbangan?.komentar);
        blocks.push({
          id: 'berkuda-postur',
          categoryId: 'posturKeseimbangan',
          categoryTitle: titles.posturKeseimbangan || 'B. Postur, Keseimbangan & Kontrol Inti Tubuh',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.posturKeseimbangan || 'B. Postur, Keseimbangan & Kontrol Inti Tubuh'}
              headerTitle={titles.tableHeaderAktivitas || 'AKTIVITAS'}
              items={items}
              scaleKey="scalePostur"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsPostur || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.posturKeseimbangan?.komentar}
              komentarLabel={titles.labelCatatanPostur || 'Catatan Postur & Keseimbangan :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }

      // 3. Koordinasi Motorik & Keterampilan Fungsional
      if (reportData.koordinasiMotorik) {
        const items = reportData.koordinasiMotorik?.items || [];
        const h = calcUnifiedTableHeight(items.length, false, true, reportData.koordinasiMotorik?.komentar);
        blocks.push({
          id: 'berkuda-koordinasi',
          categoryId: 'koordinasiMotorik',
          categoryTitle: titles.koordinasiMotorik || 'C. Koordinasi Motorik & Keterampilan Fungsional',
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.koordinasiMotorik || 'C. Koordinasi Motorik & Keterampilan Fungsional'}
              headerTitle={titles.tableHeaderAktivitas || 'AKTIVITAS'}
              items={items}
              scaleKey="scaleKoordinasi"
              scale={['MD', 'SD', 'TD']}
              scaleExplanations={titles.scaleExplanationsPostur || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
              komentar={reportData.koordinasiMotorik?.komentar}
              komentarLabel={titles.labelCatatanKoordinasi || 'Catatan Koordinasi & Keterampilan :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    } else if (!['OT', 'TW', 'REMEDIAL', 'FT', 'HT', 'BERKUDA'].includes(therapyType)) {
      // CUSTOM THERAPY DISCIPLINE
      const evalData = reportData.evaluasiKlinis || reportData.indikator || reportData.perilakuUmum;
      const items = evalData?.items || [];
      const activeScaleStr = titles.scaleIndikator || 'B/S/K/BR';
      const activeScale = typeof activeScaleStr === 'string' ? activeScaleStr.split('/').map((s: string) => s.trim()) : ['B', 'S', 'K', 'BR'];

      if (items.length > 0 || evalData?.komentar) {
        const h = calcUnifiedTableHeight(items.length, false, true, evalData?.komentar);
        blocks.push({
          id: `${therapyType.toLowerCase()}-evaluasi`,
          categoryId: 'customEvaluasi',
          categoryTitle: titles.evaluasiKlinis || `A. Evaluasi & Perkembangan Kemampuan ${therapyName}`,
          totalItems: items.length,
          estimatedHeight: h.withCat,
          estimatedHeightNoCategory: h.withoutCat,
          render: (p) => (
            <UnifiedRapotTable
              categoryTitle={titles.evaluasiKlinis || `A. Evaluasi & Perkembangan Kemampuan ${therapyName}`}
              headerTitle={titles.tableHeaderIndikator || 'INDIKATOR RESPON'}
              items={items}
              scaleKey="scaleIndikator"
              scale={activeScale}
              scaleExplanations={titles.scaleExplanations || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah'}
              komentar={evalData?.komentar}
              komentarLabel={titles.labelCatatanEvaluasi || 'Catatan Observasi & Evaluasi :'}
              startIndex={p?.startIndex}
              endIndex={p?.endIndex}
              isContinuation={p?.isContinuation}
              isCategoryContinuation={p?.isCategoryContinuation}
              hideCategoryHeader={p?.hideCategoryHeader ?? (p?.showCategoryHeader === false)}
            />
          )
        });
      }
    }

    // SHARED: Follow Up & Home Program
    if (reportData.followUp && reportData.followUp.length > 0) {
      blocks.push({
        id: 'shared-followup',
        estimatedHeight: 36 + Math.min(reportData.followUp.length, 6) * 22,
        render: () => (
          <div className="report-section bg-white border border-slate-300 rounded-md p-2.5 shadow-2xs space-y-1.5 break-inside-avoid print:break-inside-avoid">
            <div className="section-title bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              {titles.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}
            </div>
            <ul className="space-y-1 pl-1">
              {(reportData.followUp || []).slice(0, 6).map((it: string, i: number) => (
                <li key={i} className="flex gap-2 text-[10.5px] text-slate-800 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                  <span className="leading-snug">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      });
    }

    if (reportData.homeProgram && reportData.homeProgram.length > 0) {
      blocks.push({
        id: 'shared-homeprogram',
        estimatedHeight: 36 + Math.min(reportData.homeProgram.length, 6) * 26,
        render: () => (
          <div className="report-section bg-white border border-slate-300 rounded-md overflow-hidden shadow-2xs break-inside-avoid print:break-inside-avoid">
            <div className="section-title bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {titles.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}
            </div>
            <div className="divide-y divide-slate-200">
              {(reportData.homeProgram || []).slice(0, 6).map((it: any, i: number) => (
                <div key={i} className="px-3 py-1.5 text-[10.5px] flex items-center justify-between odd:bg-white even:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">{i + 1}.</span>
                    <span className="font-bold text-slate-800">{it.aktivitas}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {it.frekuensi || 'Rutin'} {it.durasi ? `• ${it.durasi}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      });
    }

    // SHARED: Signature Block
    const is3ColRow = signatureConfig.layout === '3-columns-row';
    const is3Col = signatureConfig.layout === '3-columns';
    const sigEst = layoutMode === 'separate' 
      ? (is3ColRow ? 180 : is3Col ? 270 : 190) 
      : (is3ColRow ? 140 : is3Col ? 230 : 150);
    blocks.push({
      id: 'shared-signature',
      isSignature: true,
      estimatedHeight: sigEst,
      render: () => <SignatureArea isStandalone={layoutMode === 'separate'} />
    });

    return blocks;
  }, [therapyType, reportData, titles, identitas, activeSignatures, layoutMode, signatureConfig]);

  // =========================================================================
  // 6. DOM MEASUREMENT OF FLOW BLOCKS
  // Reads sub-pixel heights to guarantee accurate content budgeting
  // =========================================================================
  useLayoutEffect(() => {
    if (!measurerRef.current) return;
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
  }, [flowBlocks, zoom, layoutMode]);

  // =========================================================================
  // 7. SMART PAGINATION ENGINE (NO CUT TABLES, PRESERVED SECTIONS)
  // Evaluates section heights against remaining page budget without chopping tables
  // =========================================================================
  // Total usable inner height of 297mm A4 page with 15mm padding = 267mm = ~1009px at 96 DPI
  // Page 1 budget: ~720px (accounting for Kop ~90px, Student Info ~125px, Footer ~35px, spacers/padding ~39px)
  const PAGE_1_MAX_HEIGHT = 720;
  // Page N budget: ~880px (accounting for Running Header ~36px, Footer ~35px, spacers/padding ~58px)
  const PAGE_N_MAX_HEIGHT = 880;
  const BLOCK_GAP = 8;

  const paginatedPages = useMemo(() => {
    const pages: PageBlockInstance[][] = [];
    let currentPage: PageBlockInstance[] = [];
    let currentHeight = 0;
    let pageIndex = 0;
    const categoriesSeenInDoc = new Set<string>();
    let currentCategoryOnThisPage: string | null = null;

    for (let i = 0; i < flowBlocks.length; i++) {
      const block = flowBlocks[i];
      const maxBudget = pageIndex === 0 ? PAGE_1_MAX_HEIGHT : PAGE_N_MAX_HEIGHT;

      // Standalone Signature sheet mode
      if (block.isSignature && layoutMode === 'separate') {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
          currentHeight = 0;
          currentCategoryOnThisPage = null;
        }
        pages.push([{
          id: `${block.id}-standalone`,
          block,
          showCategoryHeader: false,
          isCategoryContinuation: false,
        }]);
        pageIndex++;
        currentHeight = 0;
        currentCategoryOnThisPage = null;
        continue;
      }

      // Signature block in Flow Mode
      if (block.isSignature) {
        const sigHeight = measuredHeights[block.id] || block.estimatedHeight || 240;
        if (currentHeight > 0 && currentHeight + sigHeight > maxBudget) {
          // Signature doesn't fit on this page -> move to next page
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
          currentHeight = 0;
          currentCategoryOnThisPage = null;
        }
        currentPage.push({
          id: block.id,
          block,
          showCategoryHeader: false,
          isCategoryContinuation: false,
        });
        currentHeight += sigHeight + BLOCK_GAP;
        continue;
      }

      // Regular block without Category Title (e.g. Follow Up, Home Program)
      if (!block.categoryTitle) {
        const blockH = measuredHeights[block.id] || block.estimatedHeight;
        const remainingSpace = maxBudget - currentHeight;

        if (currentHeight > 0 && blockH > remainingSpace) {
          // Section height > remaining space -> start new page!
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
          currentHeight = 0;
          currentCategoryOnThisPage = null;
        }

        currentPage.push({
          id: block.id,
          block,
          showCategoryHeader: false,
          isCategoryContinuation: false,
        });
        currentHeight += blockH + BLOCK_GAP;
        currentCategoryOnThisPage = null;
        continue;
      }

      // Block with Category Title (e.g. A. Sensory Processing -> 1. Sensori Modulasi)
      const isSameCategoryOnPage = currentCategoryOnThisPage === block.categoryTitle;

      if (isSameCategoryOnPage) {
        // Category banner already exists on this page
        const neededH = measuredHeights[`${block.id}-nocat`] || block.estimatedHeightNoCategory || (block.estimatedHeight - 34);
        const remainingSpace = maxBudget - currentHeight;

        if (neededH <= remainingSpace) {
          // Fits on this page!
          currentPage.push({
            id: block.id,
            block,
            showCategoryHeader: false,
            isCategoryContinuation: false,
          });
          currentHeight += neededH + BLOCK_GAP;
        } else {
          // DOES NOT FIT in remaining space on this page!
          // Move entire subsection to next page!
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
          currentHeight = 0;
          currentCategoryOnThisPage = null;

          // On new page, show category banner with "(Lanjutan)"
          const isCatCont = categoriesSeenInDoc.has(block.categoryTitle);
          const newPageNeededH = measuredHeights[block.id] || block.estimatedHeight;

          currentPage.push({
            id: block.id,
            block,
            showCategoryHeader: true,
            isCategoryContinuation: isCatCont,
          });
          currentHeight = newPageNeededH + BLOCK_GAP;
          currentCategoryOnThisPage = block.categoryTitle;
          categoriesSeenInDoc.add(block.categoryTitle);
        }
      } else {
        // This category has not yet appeared on this page
        const isCatCont = categoriesSeenInDoc.has(block.categoryTitle);
        const neededH = measuredHeights[block.id] || block.estimatedHeight;
        const remainingSpace = maxBudget - currentHeight;

        if (currentHeight > 0 && neededH > remainingSpace) {
          // Does not fit on current page: move to next page!
          pages.push(currentPage);
          currentPage = [];
          pageIndex++;
          currentHeight = 0;
          currentCategoryOnThisPage = null;
        }

        currentPage.push({
          id: block.id,
          block,
          showCategoryHeader: true,
          isCategoryContinuation: isCatCont,
        });
        currentHeight += neededH + BLOCK_GAP;
        currentCategoryOnThisPage = block.categoryTitle;
        categoriesSeenInDoc.add(block.categoryTitle);
      }
    }

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }, [flowBlocks, measuredHeights, layoutMode]);

  // Lampiran Grafik is always on its own dedicated final page
  const totalPages = paginatedPages.length + 1;

  // =========================================================================
  // 8. RADAR & APPENDIX CHART DATA
  // =========================================================================
  const getThemeColor = () => {
    switch (therapyType) {
      case 'OT': return '#0d9488';
      case 'TW': return '#7c3aed';
      case 'REMEDIAL': return '#db2777';
      case 'FT': return '#d97706';
      case 'HT': return '#0284c7';
      case 'BERKUDA': return '#059669';
      default: return '#3D3A30';
    }
  };
  const themeColor = getThemeColor();

  const mapScore = (val: string): number => {
    const v = (val || '').toUpperCase();
    if (['MD', 'BR', 'KTK', 'BS', '3', 'SANGAT BAIK'].includes(v)) return 90;
    if (['SD', 'KP', 'S', '2', 'BAIK'].includes(v)) return 65;
    if (['TD', 'TM', 'K', 'B', '1', 'CUKUP'].includes(v)) return 40;
    if (['T', '0', 'KURANG'].includes(v)) return 20;
    if (v === 'TERAMATI') return 80;
    if (v === 'TIDAK') return 30;
    return 50;
  };

  const getAvgScore = (items: any[], field: 'awal' | 'hasil' = 'hasil'): number => {
    if (!items || items.length === 0) return 0;
    const scores = items.map(item => {
      const val = item[field] || item.hasil || item.value || '';
      return typeof val === 'number' ? val * 25 : mapScore(val);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const chartData = useMemo(() => {
    switch (therapyType) {
      case 'OT': {
        const sensoryItems = [
          ...(reportData.sensory?.modulasi || []),
          ...(reportData.sensory?.diskriminasi || []),
          ...(reportData.sensory?.praksis || [])
        ];
        const motorikItems = [
          ...(reportData.motorik?.kasar || []),
          ...(reportData.motorik?.halus || [])
        ];
        return [
          { subject: 'Sensory', A: getAvgScore(sensoryItems, 'awal') || 45, B: getAvgScore(sensoryItems, 'hasil') || 80 },
          { subject: 'Motorik', A: getAvgScore(motorikItems, 'awal') || 40, B: getAvgScore(motorikItems, 'hasil') || 75 },
          { subject: 'Kognisi', A: getAvgScore(reportData.kognisi?.items || [], 'awal') || 50, B: getAvgScore(reportData.kognisi?.items || [], 'hasil') || 78 },
          { subject: 'Emosi', A: getAvgScore(reportData.emosi?.items || [], 'awal') || 40, B: getAvgScore(reportData.emosi?.items || [], 'hasil') || 75 },
          { subject: 'Perilaku', A: getAvgScore(reportData.perilakuUmum?.items || [], 'awal') || 55, B: getAvgScore(reportData.perilakuUmum?.items || [], 'hasil') || 85 },
        ];
      }
      case 'TW': {
        const reseptif = reportData.reseptif?.items || [];
        const ekspresif = reportData.ekspresif?.items || [];
        const artikulasi = reportData.artikulasi?.items || [];
        const sosial = reportData.komunikasiSosial?.items || [];
        return [
          { subject: 'Reseptif', A: getAvgScore(reseptif, 'awal') || 40, B: getAvgScore(reseptif, 'hasil') || 75 },
          { subject: 'Ekspresif', A: getAvgScore(ekspresif, 'awal') || 35, B: getAvgScore(ekspresif, 'hasil') || 70 },
          { subject: 'Artikulasi', A: getAvgScore(artikulasi, 'awal') || 30, B: getAvgScore(artikulasi, 'hasil') || 65 },
          { subject: 'Sosial', A: getAvgScore(sosial, 'awal') || 45, B: getAvgScore(sosial, 'hasil') || 75 },
          { subject: 'Pemahaman', A: getAvgScore(reseptif.slice(0, 2), 'awal') || 50, B: getAvgScore(reseptif.slice(0, 2), 'hasil') || 80 },
        ];
      }
      case 'REMEDIAL': {
        const akademik = reportData.academic?.items || [];
        const literasi = reportData.literacy?.items || [];
        const writing = reportData.writing?.items || [];
        const fokus = reportData.perilakuBelajar?.items || [];
        return [
          { subject: 'Akademik', A: getAvgScore(akademik, 'awal') || 40, B: getAvgScore(akademik, 'hasil') || 70 },
          { subject: 'Literasi', A: getAvgScore(literasi, 'awal') || 45, B: getAvgScore(literasi, 'hasil') || 80 },
          { subject: 'Menulis', A: getAvgScore(writing, 'awal') || 35, B: getAvgScore(writing, 'hasil') || 65 },
          { subject: 'Fokus', A: getAvgScore(fokus, 'awal') || 35, B: getAvgScore(fokus, 'hasil') || 60 },
          { subject: 'Kognisi', A: getAvgScore(reportData.kognisi?.items || [], 'awal') || 45, B: getAvgScore(reportData.kognisi?.items || [], 'hasil') || 75 },
        ];
      }
      case 'FT': {
        const motorik = [
          ...(reportData.motorik?.kasar || []),
          ...(reportData.motorik?.halus || [])
        ];
        return [
          { subject: 'Balance', A: 40, B: getAvgScore(motorik) || 75 },
          { subject: 'Fisik GMFM', A: 35, B: getAvgScore(reportData.fisik?.gmfm || []) || 70 },
          { subject: 'Sensory', A: 50, B: getAvgScore(reportData.sensory?.items || []) || 78 },
          { subject: 'Perilaku', A: 45, B: getAvgScore(reportData.perilakuUmum?.items || []) || 80 },
          { subject: 'Koordinasi', A: 35, B: 65 },
        ];
      }
      case 'HT': {
        const adaptasiItems = reportData.adaptasiAir?.items || [];
        const keterampilanItems = reportData.keterampilanAir?.items || [];
        const keseimbanganItems = reportData.keseimbanganAir?.items || [];
        return [
          { subject: 'Adaptasi Air', A: getAvgScore(adaptasiItems, 'awal') || 40, B: getAvgScore(adaptasiItems, 'hasil') || 80 },
          { subject: 'Pernapasan', A: 35, B: 75 },
          { subject: 'Keterampilan Air', A: getAvgScore(keterampilanItems, 'awal') || 35, B: getAvgScore(keterampilanItems, 'hasil') || 75 },
          { subject: 'Keseimbangan Air', A: getAvgScore(keseimbanganItems, 'awal') || 40, B: getAvgScore(keseimbanganItems, 'hasil') || 78 },
          { subject: 'Koordinasi', A: 35, B: 72 },
        ];
      }
      case 'BERKUDA': {
        const adaptasiItems = reportData.adaptasiPerilaku?.items || [];
        const posturItems = reportData.posturKeseimbangan?.items || [];
        const koordinasiItems = reportData.koordinasiMotorik?.items || [];
        return [
          { subject: 'Regulasi Emosi', A: getAvgScore(adaptasiItems, 'awal') || 40, B: getAvgScore(adaptasiItems, 'hasil') || 85 },
          { subject: 'Postur', A: getAvgScore(posturItems, 'awal') || 45, B: getAvgScore(posturItems, 'hasil') || 80 },
          { subject: 'Keseimbangan', A: getAvgScore(posturItems, 'awal') || 40, B: getAvgScore(posturItems, 'hasil') || 78 },
          { subject: 'Kontrol Inti', A: 40, B: 75 },
          { subject: 'Koordinasi Motorik', A: getAvgScore(koordinasiItems, 'awal') || 35, B: getAvgScore(koordinasiItems, 'hasil') || 75 },
        ];
      }
      default:
        return [
          { subject: 'Area 1', A: 40, B: 75 },
          { subject: 'Area 2', A: 50, B: 80 },
          { subject: 'Area 3', A: 35, B: 65 },
          { subject: 'Area 4', A: 45, B: 70 },
        ];
    }
  }, [therapyType, reportData]);

  const avgAchievement = Math.round(chartData.reduce((acc, curr) => acc + curr.B, 0) / chartData.length);

  // =========================================================================
  // 9. PRINT & EXPORT HANDLERS
  // =========================================================================
  const handlePrint = () => {
    triggerBrowserA4Print(fileName);
  };

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      setExportProgress(10);
      const pageEls = containerRef.current.querySelectorAll<HTMLElement>('.a4-sheet');
      if (pageEls.length > 0) {
        await exportPagesToPdf(Array.from(pageEls), fileName, (p) => setExportProgress(p));
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal membuat file PDF. Silakan gunakan tombol Cetak (A4) dan pilih Simpan sebagai PDF.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Strict A4 Portrait Sheet Styling (210mm x 297mm) with 15mm margins
  const sheetClass = "a4-sheet a4-portrait margin-15mm w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[15mm] bg-white text-slate-800 shadow-2xl border border-slate-300 flex flex-col justify-between relative box-border print:shadow-none print:border-none print:rounded-none print:m-0 print:box-border print:break-after-page overflow-hidden font-sans";

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-between print:static print:z-auto print:bg-white print:overflow-visible print:block animate-in fade-in duration-200">
      
      {/* Top Floating Control Bar */}
      <header className="w-full bg-slate-900/95 text-white px-6 py-2.5 flex items-center justify-between border-b border-white/10 shadow-2xl z-50 print:hidden print-toolbar">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-xs">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider">
                Print Preview Rapot
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {totalPages} Halaman A4 Portrait
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <FileText className="h-3 w-3" />
                A4 Portrait (210 × 297 mm)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {child.name} • {therapyName} • Periode {period} {year}
            </p>
          </div>
        </div>

        {/* Center: Layout Mode Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setLayoutMode('flow')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layoutMode === 'flow' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Konten mengalir terpadu tanpa ruang kosong buatan"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Alur Terpadu (Continuous)</span>
          </button>
          <button
            onClick={() => setLayoutMode('separate')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layoutMode === 'separate' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Lembar pengesahan tanda tangan di halaman terpisah"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Lembar TTD Terpisah</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 gap-1 text-slate-300 text-xs mr-2">
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
          </div>

          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? `Menyimpan (${exportProgress}%)` : 'Download PDF'}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Cetak (A4)
          </button>

          {/* Quick Position Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 text-[11px] gap-1">
            <span className="text-slate-400 pl-1.5 text-[10.5px] font-semibold">Posisi TTD:</span>
            <button
              type="button"
              onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'compact' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                (signatureConfig.position || 'compact') === 'compact'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tepat di bawah konten (rapi & profesional untuk 1 lembar)"
            >
              Kompak
            </button>
            <button
              type="button"
              onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'balanced' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                signatureConfig.position === 'balanced'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Seimbang di tengah lembar"
            >
              Seimbang
            </button>
            <button
              type="button"
              onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'bottom' })}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                signatureConfig.position === 'bottom'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Di paling bawah lembar"
            >
              Bawah
            </button>
          </div>

          {/* Edit Kolom TTD Button */}
          <button
            onClick={() => setIsSignatureSettingsOpen(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isSignatureSettingsOpen 
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-500/30' 
                : 'bg-slate-800 text-purple-300 border-purple-500/30 hover:bg-slate-700 hover:text-white'
            }`}
            title="Atur nama penandatangan, jabatan, tempat/tanggal, format kolom, posisi lembar, dan upload tanda tangan digital"
          >
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Kolom TTD:</span>
            <span>{isSignatureSettingsOpen ? 'Tutup' : 'Edit TTD'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          INTERACTIVE SIGNATURE CONFIGURATION PANEL (HIDDEN ON PRINT)
          ===================================================================== */}
      {isSignatureSettingsOpen && (
        <div className="w-full bg-slate-900 border-b border-purple-500/30 px-6 py-4 text-white z-50 shadow-2xl print:hidden animate-in fade-in slide-in-from-top duration-200">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Pengaturan Kolom Tanda Tangan Cetak Rapot Terapi</span>
                    <span className="text-[10px] font-normal text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Bisa Diedit & Upload TTD Digital
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sesuaikan nama penandatangan, format kolom, posisi vertikal di lembar A4, serta tempat/tanggal pengesahan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Layout Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Format:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, layout: '3-columns-row' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        signatureConfig.layout === '3-columns-row'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="3 Kolom Sejajar 1 Baris - Sangat hemat ruang untuk rapot 1 lembar"
                    >
                      3 Kolom Sejajar (Rekomendasi 1 Lembar)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, layout: '3-columns' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        signatureConfig.layout === '3-columns'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="3 Kolom Bertingkat: Terapis di atas, Pimpinan di bawah"
                    >
                      3 Kolom Bertingkat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, layout: '2-columns' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        signatureConfig.layout === '2-columns'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="2 Kolom: Terapis & Pimpinan"
                    >
                      2 Kolom
                    </button>
                  </div>
                </div>

                {/* Posisi Tanda Tangan */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Posisi di Lembar:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'compact' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        (signatureConfig.position || 'compact') === 'compact'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tepat di bawah konten tabel (tidak terlalu kebawah, rapi dan proporsional)"
                    >
                      Kompak (Tepat di Bawah Konten)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'balanced' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        signatureConfig.position === 'balanced'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Seimbang di tengah lembar"
                    >
                      Seimbang (Tengah)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSignatureConfig({ ...signatureConfig, position: 'bottom' })}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        signatureConfig.position === 'bottom'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Di bagian paling bawah lembar"
                    >
                      Bawah Lembar
                    </button>
                  </div>
                </div>
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
                  placeholder="Cinere"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Dokumen / Pengesahan</label>
                <input 
                  type="text"
                  value={signatureConfig.dateString}
                  onChange={(e) => handleUpdateSignatureConfig({ ...signatureConfig, dateString: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="19 Juni 2025"
                />
              </div>
            </div>

            {/* Columns Configuration */}
            <div className={`grid grid-cols-1 ${(signatureConfig.layout === '3-columns' || signatureConfig.layout === '3-columns-row') ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 text-xs`}>
              {/* Kolom 1: Terapis */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 text-[11px] block">Kolom 1 (Terapis Penanggung Jawab)</span>

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
                    placeholder="Terapis Penanggung Jawab"
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
                    placeholder="No. STR / SIP"
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

              {/* Kolom 2: Manager Pelangi Lazuardi */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-teal-400 text-[11px] block">
                  {signatureConfig.layout === '3-columns' ? 'Kolom 2 (Manager Pelangi Lazuardi)' : 'Kolom 2 (Pimpinan / Manager)'}
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
                  <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Bagian</label>
                  <input 
                    type="text"
                    value={signatureConfig.signer2.departmentTitle}
                    onChange={(e) => handleUpdateSignatureConfig({
                      ...signatureConfig,
                      signer2: { ...signatureConfig.signer2, departmentTitle: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                    placeholder="Manager Pelangi Lazuardi RC"
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
                    className="w-full bg-slate-900 border border-teal-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                    placeholder="Asep Suherman, S.E, M.M"
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
                    placeholder="NIP / Identitas"
                  />
                </div>

                {/* Upload Signature Image */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <label className="cursor-pointer text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
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

              {/* Kolom 3 jika 3 kolom: Kepala Inklusi */}
              {(signatureConfig.layout === '3-columns' || signatureConfig.layout === '3-columns-row') && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-blue-400 text-[11px] block">Kolom 3 (Kepala Pendidikan Inklusi)</span>

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
                      placeholder="Mengetahui,"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Jabatan / Bagian</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.departmentTitle}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, departmentTitle: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-semibold outline-none"
                      placeholder="Kepala Pendidikan Inklusif Lazuardi GCS"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Nama Lengkap & Gelar *</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.name}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, name: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-blue-500/40 text-white rounded-lg p-1.5 text-xs font-bold outline-none"
                      placeholder="Abdul Ghofar, AMd.OT., S.Pd., M.H."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">NIP / Identitas (Opsional)</label>
                    <input 
                      type="text"
                      value={signatureConfig.signer3.nip || ''}
                      onChange={(e) => handleUpdateSignatureConfig({
                        ...signatureConfig,
                        signer3: { ...signatureConfig.signer3, nip: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono outline-none"
                      placeholder="NIP. 19780512 200501 1 003"
                    />
                  </div>

                  {/* Upload Signature Image */}
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{signatureConfig.signer3.signatureImage ? 'Ganti TTD Digital' : '+ TTD Digital'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleSignerImageUpload('signer3', e.target.files[0])}
                      />
                    </label>
                    {signatureConfig.signer3.signatureImage && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveSignerImage('signer3')}
                        className="text-rose-400 hover:underline"
                      >
                        Hapus TTD
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
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
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="flex flex-col gap-10 items-center print:gap-0 print:m-0 print:p-0 print:block print:transform-none"
        >

          {/* ========================================================
              CONTINUOUS DYNAMIC CONTENT PAGES (HALAMAN 1, 2, ...)
              Fills each A4 sheet optimally with natural sequential flow
             ======================================================== */}
          {paginatedPages.map((pageInstances, pageIdx) => (
            <TherapyReportTemplate
              key={`page-${pageIdx}`}
              pageIndex={pageIdx}
              totalPages={totalPages}
              childName={child.name}
              therapyName={therapyName}
              period={period}
              year={year}
              logoUrl={logoUrl}
              schoolName={titles.schoolName}
              schoolSubtitle={titles.schoolSubtitle}
              schoolAddress={titles.schoolAddress}
              headerBadge={titles.headerBadge}
              documentTitleText={titles.headerReportTitle}
              docNumber={identitas.noRegistrasi || child.id}
              studentInfo={studentInfo}
            >
              {/* Content Stream Container: Continuous, compact, professional spacing */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                {pageInstances.map(inst => {
                  const isSig = inst.block.isSignature;
                  let sigPlacementClass = '';
                  if (isSig) {
                    if (pageInstances.length === 1) {
                      sigPlacementClass = 'my-auto py-6 w-full';
                    } else if (signatureConfig.position === 'bottom') {
                      sigPlacementClass = 'mt-auto pt-2 w-full';
                    } else if (signatureConfig.position === 'balanced') {
                      sigPlacementClass = 'mt-8 mb-4 pt-2 w-full';
                    } else {
                      // 'compact' (default): sits naturally below content, preventing awkward bottom plunge in 1 sheet
                      sigPlacementClass = 'mt-5 pt-1 w-full';
                    }
                  }

                  return (
                    <div 
                      key={inst.id} 
                      className={`break-inside-avoid report-section ${sigPlacementClass}`}
                    >
                      {inst.block.render({
                        startIndex: inst.startIndex,
                        endIndex: inst.endIndex,
                        isContinuation: inst.isContinuation,
                        isCategoryContinuation: inst.isCategoryContinuation,
                        showCategoryHeader: inst.showCategoryHeader,
                        hideCategoryHeader: inst.hideCategoryHeader,
                      })}
                    </div>
                  );
                })}
              </div>
            </TherapyReportTemplate>
          ))}

          {/* ========================================================
              LAMPIRAN – GRAFIK PENCAPAIAN SISWA
              (Wajib dimulai pada halaman baru di paling akhir dokumen)
             ======================================================== */}
          <TherapyReportTemplate
            key="page-chart"
            pageIndex={paginatedPages.length}
            totalPages={totalPages}
            childName={child.name}
            therapyName={therapyName}
            period={period}
            year={year}
            logoUrl={logoUrl}
            schoolName={titles.schoolName}
            schoolSubtitle={titles.schoolSubtitle}
            schoolAddress={titles.schoolAddress}
            headerBadge={titles.headerBadge}
            documentTitleText={titles.headerReportTitle ? `${titles.headerReportTitle} - LAMPIRAN` : 'PROGRESS REPORT - LAMPIRAN GRAFIK'}
            docNumber={identitas.noRegistrasi || child.id}
          >
            <div className="space-y-2 flex-1 flex flex-col justify-start py-0.5">
              
              {/* Header Lampiran */}
              <div className="bg-slate-900 text-white p-2 rounded-xl shadow-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: themeColor }}>
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[7px] uppercase tracking-widest text-slate-400 block font-bold">
                      DOKUMEN LAMPIRAN RESMI
                    </span>
                    <h3 className="text-[11px] font-black uppercase tracking-wider">
                      Visualisasi Progres Perkembangan Siswa Terapi
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7px] text-slate-400 block uppercase">Metode Analisis</span>
                  <span className="text-[8.5px] font-mono font-black text-white">Baseline vs Evaluasi</span>
                </div>
              </div>

              {/* Chart & Analysis Section */}
              <div className="grid grid-cols-12 gap-2.5 items-stretch">
                {/* Left: Vector Radar SVG */}
                <div className="col-span-7 bg-slate-50 border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-between">
                  <div className="w-full flex justify-between items-center mb-0.5">
                    <span className="text-[8px] font-black text-slate-800 uppercase tracking-wider">
                      Radar Profil Pencapaian Kompetensi
                    </span>
                    <span className="text-[6.5px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded font-bold">
                      Skala 0 - 100%
                    </span>
                  </div>

                  {/* High Fidelity SVG Vector Radar */}
                  <div className="relative flex items-center justify-center w-full py-0.5">
                    <svg viewBox="0 0 320 270" className="w-full max-w-[250px] h-auto overflow-visible select-none drop-shadow-xs">
                      {/* Web Rings */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
                        const r = 92 * level;
                        const pts = chartData.map((_, i) => {
                          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                          const x = 160 + r * Math.cos(angle);
                          const y = 135 + r * Math.sin(angle);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        return (
                          <polygon 
                            key={idx} 
                            points={pts} 
                            fill={idx % 2 === 0 ? '#f8fafc' : '#f1f5f9'} 
                            stroke="#cbd5e1" 
                            strokeWidth="0.8" 
                          />
                        );
                      })}

                      {/* Spokes */}
                      {chartData.map((_, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                        const x = 160 + 92 * Math.cos(angle);
                        const y = 135 + 92 * Math.sin(angle);
                        return (
                          <line 
                            key={i} 
                            x1="160" 
                            y1="135" 
                            x2={x} 
                            y2={y} 
                            stroke="#cbd5e1" 
                            strokeWidth="1" 
                          />
                        );
                      })}

                      {/* Baseline Polygon (A) */}
                      {(() => {
                        const pts = chartData.map((d, i) => {
                          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                          const r = 92 * (d.A / 100);
                          const x = 160 + r * Math.cos(angle);
                          const y = 135 + r * Math.sin(angle);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        return (
                          <polygon 
                            points={pts} 
                            fill="#64748b" 
                            fillOpacity="0.15" 
                            stroke="#64748b" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4" 
                          />
                        );
                      })()}

                      {/* Evaluasi Polygon (B) */}
                      {(() => {
                        const pts = chartData.map((d, i) => {
                          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                          const r = 92 * (d.B / 100);
                          const x = 160 + r * Math.cos(angle);
                          const y = 135 + r * Math.sin(angle);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        return (
                          <polygon 
                            points={pts} 
                            fill={themeColor} 
                            fillOpacity="0.3" 
                            stroke={themeColor} 
                            strokeWidth="2.5" 
                          />
                        );
                      })()}

                      {/* Data Dots (B) */}
                      {chartData.map((d, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                        const r = 92 * (d.B / 100);
                        const x = 160 + r * Math.cos(angle);
                        const y = 135 + r * Math.sin(angle);
                        return (
                          <circle 
                            key={i} 
                            cx={x} 
                            cy={y} 
                            r="3.5" 
                            fill={themeColor} 
                            stroke="#ffffff" 
                            strokeWidth="1.5" 
                          />
                        );
                      })}

                      {/* Spoke Labels */}
                      {chartData.map((d, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / chartData.length;
                        const x = 160 + 112 * Math.cos(angle);
                        const y = 135 + 112 * Math.sin(angle);
                        return (
                          <text 
                            key={i} 
                            x={x} 
                            y={y} 
                            textAnchor="middle" 
                            dominantBaseline="central" 
                            className="text-[7.5px] font-black uppercase fill-slate-700"
                          >
                            {d.subject} ({d.B}%)
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend below chart */}
                  <div className="flex items-center justify-center gap-4 pt-1 border-t border-slate-200 w-full text-[7.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-slate-500 rounded-full border border-dashed border-slate-600" />
                      <span className="font-bold text-slate-600 uppercase">Awal (Baseline)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className="font-bold text-slate-900 uppercase">Capaian Akhir (Evaluasi)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress Breakdown Cards */}
                <div className="col-span-5 flex flex-col justify-between space-y-2">
                  <div className="bg-white border border-slate-300 rounded-xl p-2 shadow-2xs space-y-1">
                    <p className="text-[8px] font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>Rincian Indikator</span>
                      <span className="text-slate-400 font-mono text-[7px]">Awal → Akhir</span>
                    </p>
                    <div className="space-y-1">
                      {chartData.map((d, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-center text-[7.5px]">
                            <span className="font-bold text-slate-700 uppercase">{d.subject}</span>
                            <span className="font-mono text-slate-500 font-bold">
                              {d.A}% <span className="text-slate-300">→</span> <strong style={{ color: themeColor }}>{d.B}%</strong>
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${d.B}%`, backgroundColor: themeColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Pencapaian Box */}
                  <div className="p-2 bg-slate-900 rounded-xl text-white shadow-2xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="h-3 w-3 text-yellow-400" />
                      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Status Pencapaian</p>
                    </div>
                    <p className="text-[11px] font-black tracking-normal uppercase leading-tight mb-1 text-white">
                      TARGET TERCAPAI {avgAchievement}%
                    </p>
                    <p className="text-[7.5px] text-slate-300 font-normal leading-relaxed">
                      Ananda menunjukkan perkembangan yang konsisten dan terarah sesuai dengan indikator target intervensi yang telah ditetapkan selama periode program berjalan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Keterangan Tambahan Mengenai Grafik */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-700 space-y-1 shrink-0">
                <p className="text-[7.5px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3 w-3" style={{ color: themeColor }} />
                  Keterangan Tambahan Mengenai Grafik:
                </p>
                <div className="grid grid-cols-3 gap-2 text-[7px]">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 uppercase block mb-0.5">● Evaluasi Awal (Baseline)</span>
                    <p className="text-slate-600 leading-relaxed">
                      Menggambarkan tingkat kemampuan dasar awal siswa sebelum intervensi semester berjalan.
                    </p>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 uppercase block mb-0.5" style={{ color: themeColor }}>● Evaluasi Akhir (Hasil)</span>
                    <p className="text-slate-600 leading-relaxed">
                      Menggambarkan capaian dan kemajuan perkembangan yang berhasil diraih siswa setelah program terapi berkala.
                    </p>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 uppercase block mb-0.5">● Sinkronisasi Otomatis</span>
                    <p className="text-slate-600 leading-relaxed">
                      Seluruh data grafik disinkronisasikan otomatis dari data indikator capaian lembar rapot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TherapyReportTemplate>

        </div>
      </main>

    </div>
  );
};

export default RapotPrintPreviewModal;
