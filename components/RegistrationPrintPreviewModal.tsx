import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Baby,
  Activity,
  Heart,
  Smile,
  BookOpen,
  ShieldCheck,
  Building2,
  Brain,
  AlertCircle
} from 'lucide-react';
import { 
  exportPagesToPdf, 
  exportContainerToPdf, 
  triggerBrowserA4Print, 
  formatRegistrationDownloadFileName 
} from '../utils/rapotPdfGenerator';
import { RegistrationRecord, Therapist } from '../types';

interface RegistrationPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistrationRecord;
  therapists?: Therapist[];
  logoUrl?: string;
}

export const RegistrationPrintPreviewModal: React.FC<RegistrationPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
  therapists = [],
  logoUrl = 'https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [adminOfficer, setAdminOfficer] = useState<string>(
    record.followUpOfficer && record.followUpOfficer !== 'Admin Operasional' && record.followUpOfficer !== 'Admin Pendaftaran'
      ? record.followUpOfficer
      : ''
  );

  if (!isOpen || !record) return null;

  const fileName = formatRegistrationDownloadFileName(record.childName, record.registrationNumber);
  
  // Data extraction faithfully from rawGuestData and registration record
  const raw = record.rawGuestData || {};
  const childRaw = raw.child || {};
  const familyRaw = raw.family || {};
  const fatherRaw = familyRaw.father || (record as any).fatherDetails || {};
  const motherRaw = familyRaw.mother || (record as any).motherDetails || {};
  const referralRaw = raw.referral || record.referralDetails || {};
  const birthRaw = raw.birth || record.birthHistory || {};
  const prenatalRaw = birthRaw.prenatal || {};
  const deliveryRaw = birthRaw.delivery || {};
  const devRaw = raw.development || record.developmentHistory || {};
  const feedingRaw = devRaw.feeding || {};
  const prefRaw = devRaw.preferences || {};
  const healthRaw = raw.health || record.healthHistory || {};
  const socialRaw = raw.social || record.socialHistory || {};
  const behaviorRaw = raw.behavior || record.behaviorAnswers || {};
  const learningRaw = raw.learning || record.learningAnswers || {};
  const emotionRaw = raw.emotion || record.emotionAnswers || {};
  const sensoryRaw = raw.sensoryProfile || record.sensoryScores || {};
  const obsRaw = raw.observation || record.observationAnswers || {};
  const siblingsRaw = raw.siblings || record.siblingsList || [];

  // Age calculation helper
  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return '-';
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return '-';
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return `${years} thn ${months} bln`;
  };

  const formattedRegDate = record.registrationDate ? new Date(record.registrationDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';

  const formattedBirthDate = record.birthDate ? new Date(record.birthDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : (childRaw.birthDate ? new Date(childRaw.birthDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-');

  const therapistObj = therapists.find(t => t.id === record.assessmentTherapistId);
  const therapistName = record.assessmentTherapistName || therapistObj?.name || 'Tim Assessor Pelangi Lazuardi';

  // Analysis of behavior answers (30 questions)
  const behaviorKeys = Object.keys(behaviorRaw || {});
  const behaviorYesCount = behaviorKeys.filter(k => behaviorRaw[k] === 'Ya').length;
  const behaviorTotalAnswered = behaviorKeys.filter(k => behaviorRaw[k] === 'Ya' || behaviorRaw[k] === 'Tidak').length;

  // Analysis of sensory profile
  const sensoryKeys = Object.keys(sensoryRaw || {});
  const sensoryTotalAnswered = sensoryKeys.length;

  // Analysis of speech observation
  const obsKeys = Object.keys(obsRaw || {});
  const obsMampuCount = obsKeys.filter(k => obsRaw[k] === 'Mampu').length;
  const obsTidakMampuCount = obsKeys.filter(k => obsRaw[k] === 'Tidak Mampu').length;

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    setExportProgress(10);
    try {
      const pageElements = Array.from(
        containerRef.current.querySelectorAll('[data-print-page="true"]')
      ) as HTMLElement[];
      if (pageElements.length > 0) {
        await exportPagesToPdf(pageElements, fileName, (progress) => {
          setExportProgress(progress);
        });
      } else {
        await exportContainerToPdf(containerRef.current, fileName, (progress) => {
          setExportProgress(progress);
        });
      }
    } catch (err) {
      console.error('PDF export error:', err);
      triggerBrowserA4Print(fileName);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handlePrint = () => {
    triggerBrowserA4Print(fileName);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Hasil Cetak Formulir Registrasi</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 font-semibold">
                {record.registrationNumber}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {record.childName} • Status: <span className="text-indigo-400 font-semibold">{record.status}</span> • 3 Lembar Dokumen Resmi Sesuai Isian Registrasi Tamu
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Input Manual Nama Petugas Administrasi */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 rounded-xl px-2.5 py-1.5 border border-slate-700/60">
            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Petugas Admin:</span>
            <input 
              type="text"
              value={adminOfficer}
              onChange={(e) => setAdminOfficer(e.target.value)}
              placeholder="Isi nama manual..."
              className="bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white placeholder-slate-500 w-36 md:w-44 outline-none focus:border-indigo-500 transition-colors"
              title="Isi nama petugas administrasi secara manual atau biarkan kosong untuk titik-titik tanda tangan"
            />
          </div>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.4))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="px-2 py-1 text-[11px] font-semibold hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Cetak Button */}
          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            title="Cetak langsung atau simpan via browser"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Cetak (A4)</span>
          </button>

          {/* Unduh PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            title="Download file PDF 3 halaman resolusi tinggi"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Membuat PDF ({exportProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN PREVIEW SCROLL AREA */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-950/90 print:bg-white print:p-0 print:overflow-visible">
        <div 
          ref={containerRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out print:transform-none space-y-8 print:space-y-0"
        >
          {/* ============================================================== */}
          {/* LEMBAR 1: KOP SURAT, IDENTITAS ANANDA, ORANG TUA & SAUDARA     */}
          {/* ============================================================== */}
          <div 
            data-print-page="true"
            className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[13mm] shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-[12mm] relative flex flex-col justify-between box-border text-[11px] leading-relaxed print:break-after-page"
          >
            <div>
              {/* Kop Surat Resmi */}
              <div className="flex items-center gap-4 pb-2.5 border-b-2 border-slate-900">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 border border-slate-200 rounded-xl">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center pr-12">
                  <h1 className="text-[14.5px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                    PUSAT LAYANAN TERAPI TUMBUH KEMBANG PELANGI LAZUARDI
                  </h1>
                  <p className="text-[9.5px] text-slate-600 font-medium mt-0.5">
                    Lazuardi Al-Falah GIS • Jl. R.E. Martadinata No. 20A, Cipayung, Ciputat, Tangerang Selatan
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Telp/WA: 0812-8877-6655 | Email: klinik@pelangilazuardi.sch.id | Website: pelangilazuardi.sch.id
                  </p>
                </div>
              </div>

              {/* Judul Formulir & Metadata Header */}
              <div className="my-2.5 text-center">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-1 inline-block">
                  FORMULIR PENDAFTARAN & REKAM DATA REGISTRASI CALON KLIEN
                </h2>
                <div className="mt-1 flex items-center justify-center gap-4 text-[9.5px] text-slate-600">
                  <span>No. Registrasi: <strong className="font-mono text-indigo-900 text-[10.5px]">{record.registrationNumber}</strong></span>
                  <span>•</span>
                  <span>Tgl Daftar: <strong>{formattedRegDate}</strong></span>
                  <span>•</span>
                  <span>Layanan: <strong className="text-indigo-800">{record.selectedService || '-'}</strong></span>
                </div>
              </div>

              {/* BAGIAN I: DATA IDENTITAS ANANDA */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    I
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    DATA IDENTITAS ANANDA
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Nama Lengkap</span>
                    <span className="font-bold text-slate-900">: {record.childName || childRaw.fullName || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Nama Panggilan</span>
                    <span className="text-slate-900">: {record.childNickname || childRaw.nickName || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Tempat, Tgl Lahir</span>
                    <span className="text-slate-900">: {childRaw.birthPlace ? `${childRaw.birthPlace}, ` : ''}{formattedBirthDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Usia Saat Mendaftar</span>
                    <span className="font-bold text-indigo-700">: {childRaw.age || (record.birthDate ? calculateAge(record.birthDate) : '-')}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Jenis Kelamin</span>
                    <span className="text-slate-900">: {record.gender || childRaw.gender || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Sekolah / Kelas</span>
                    <span className="text-slate-900">: {record.school || childRaw.school || '-'} {childRaw.class ? `(Kelas: ${childRaw.class})` : ''}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Urutan Anak</span>
                    <span className="text-slate-900">: {familyRaw.childOrder ? `Anak ke-${familyRaw.childOrder} dari ${familyRaw.totalSiblings || '-'} bersaudara` : '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium shrink-0">No. Telp Anak/Rumah</span>
                    <span className="font-mono text-slate-900">: {childRaw.phone || record.whatsapp || '-'}</span>
                  </div>
                  <div className="col-span-2 flex pt-0.5 border-t border-slate-200/60 mt-0.5">
                    <span className="w-32 text-slate-500 font-medium shrink-0">Alamat Lengkap</span>
                    <span className="text-slate-900 font-medium">: {record.address || childRaw.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* BAGIAN II: DATA ORANG TUA / WALI */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    II
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    DATA ORANG TUA / WALI
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Kolom Ayah */}
                  <div className="p-2 bg-slate-50/70 border border-slate-200 rounded-lg space-y-0.5 text-[9.5px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
                      <span className="font-extrabold uppercase tracking-wider text-slate-800">Data Ayah</span>
                      <span className="text-[8.5px] font-bold text-slate-500">Status: {fatherRaw.status || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Ayah:</span>
                      <span className="font-bold text-slate-900">{record.fatherName || fatherRaw.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usia:</span>
                      <span className="text-slate-800">{fatherRaw.age ? `${fatherRaw.age} tahun` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suku Bangsa / Agama:</span>
                      <span className="text-slate-800">{fatherRaw.ethnicity || '-'} / {fatherRaw.religion || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Urutan Lahir / Saudara:</span>
                      <span className="text-slate-800">{fatherRaw.order ? `Ke-${fatherRaw.order} dari ${fatherRaw.totalSiblings || '-'} bersdr` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pernikahan ke / Thn:</span>
                      <span className="text-slate-800">{fatherRaw.marriageOrder ? `Ke-${fatherRaw.marriageOrder} (${fatherRaw.marriageYear || '-'})` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pendidikan Terakhir:</span>
                      <span className="text-slate-800">{fatherRaw.education || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pekerjaan:</span>
                      <span className="text-slate-800">{fatherRaw.job || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. WhatsApp / HP:</span>
                      <span className="font-mono text-slate-900 font-bold">{fatherRaw.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telp. Kantor:</span>
                      <span className="font-mono text-slate-800">{fatherRaw.officePhone || '-'}</span>
                    </div>
                    <div className="flex justify-between pt-0.5 border-t border-slate-200/50">
                      <span className="text-slate-500">Alamat Rumah:</span>
                      <span className="text-slate-800 text-right truncate max-w-[170px]">{fatherRaw.address || '-'}</span>
                    </div>
                  </div>

                  {/* Kolom Ibu */}
                  <div className="p-2 bg-slate-50/70 border border-slate-200 rounded-lg space-y-0.5 text-[9.5px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
                      <span className="font-extrabold uppercase tracking-wider text-slate-800">Data Ibu</span>
                      <span className="text-[8.5px] font-bold text-slate-500">Status: {motherRaw.status || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Ibu:</span>
                      <span className="font-bold text-slate-900">{record.motherName || motherRaw.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usia:</span>
                      <span className="text-slate-800">{motherRaw.age ? `${motherRaw.age} tahun` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suku Bangsa / Agama:</span>
                      <span className="text-slate-800">{motherRaw.ethnicity || '-'} / {motherRaw.religion || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Urutan Lahir / Saudara:</span>
                      <span className="text-slate-800">{motherRaw.order ? `Ke-${motherRaw.order} dari ${motherRaw.totalSiblings || '-'} bersdr` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pernikahan ke / Thn:</span>
                      <span className="text-slate-800">{motherRaw.marriageOrder ? `Ke-${motherRaw.marriageOrder} (${motherRaw.marriageYear || '-'})` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pendidikan Terakhir:</span>
                      <span className="text-slate-800">{motherRaw.education || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pekerjaan:</span>
                      <span className="text-slate-800">{motherRaw.job || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. WhatsApp / HP:</span>
                      <span className="font-mono text-slate-900 font-bold">{motherRaw.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telp. Kantor:</span>
                      <span className="font-mono text-slate-800">{motherRaw.officePhone || '-'}</span>
                    </div>
                    <div className="flex justify-between pt-0.5 border-t border-slate-200/50">
                      <span className="text-slate-500">Alamat Rumah:</span>
                      <span className="text-slate-800 text-right truncate max-w-[170px]">{motherRaw.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Email & Kontak Tambahan */}
                <div className="mt-1.5 p-1.5 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between text-[9.5px]">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Email Korespondensi: <strong className="text-slate-900">{record.email || fatherRaw.email || motherRaw.email || '-'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No. WhatsApp Utama: <strong className="text-slate-900 font-mono">{record.whatsapp || '-'}</strong></span>
                  </div>
                </div>
              </div>

              {/* BAGIAN III: SUSUNAN SAUDARA KANDUNG */}
              <div>
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    III
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    DAFTAR URUTAN ANAK & SAUDARA KANDUNG (TERMASUK DIRI ANAK)
                  </h3>
                </div>

                {siblingsRaw && siblingsRaw.length > 0 && siblingsRaw.some((s: any) => s.name?.trim()) ? (
                  <table className="w-full text-left border-collapse border border-slate-200 text-[9.5px]">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-700">
                        <th className="border border-slate-200 p-1 text-center w-8">No</th>
                        <th className="border border-slate-200 p-1">Nama Lengkap</th>
                        <th className="border border-slate-200 p-1 text-center w-12">L/P</th>
                        <th className="border border-slate-200 p-1 text-center w-14">Usia</th>
                        <th className="border border-slate-200 p-1">Pendidikan</th>
                        <th className="border border-slate-200 p-1">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siblingsRaw.filter((s: any) => s.name?.trim()).map((sib: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="border border-slate-200 p-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-200 p-1 font-semibold">{sib.name}</td>
                          <td className="border border-slate-200 p-1 text-center">{sib.gender || '-'}</td>
                          <td className="border border-slate-200 p-1 text-center">{sib.age ? `${sib.age} thn` : '-'}</td>
                          <td className="border border-slate-200 p-1">{sib.education || '-'}</td>
                          <td className="border border-slate-200 p-1">{sib.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[9.5px] italic">
                    Tidak ada data saudara kandung yang dicantumkan / Ananda merupakan anak tunggal.
                  </div>
                )}
              </div>
            </div>

            {/* Footer Halaman 1 */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[8.5px] text-slate-400">
              <span>Formulir Pendaftaran Calon Klien • Pusat Terapi Pelangi Lazuardi</span>
              <span className="font-mono font-bold text-slate-600">Halaman 1 dari 3</span>
              <span>Dokumen Rekam Penerimaan Resmi</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LEMBAR 2: RIWAYAT KELAHIRAN, PERKEMBANGAN, KESEHATAN & SOSIAL  */}
          {/* ============================================================== */}
          <div 
            data-print-page="true"
            className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[13mm] shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-[12mm] relative flex flex-col justify-between box-border text-[11px] leading-relaxed print:break-after-page"
          >
            <div>
              {/* Header Mini Halaman 2 */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-400 mb-2.5 text-[9.5px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Pelangi Lazuardi • Lembar 2 (Riwayat Klinis & Perkembangan)</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">No. Registrasi: <strong className="font-mono text-slate-800">{record.registrationNumber}</strong></span>
                </div>
                <div className="text-slate-600 font-medium">
                  Ananda: <strong className="text-slate-900">{record.childName}</strong>
                </div>
              </div>

              {/* BAGIAN IV: RIWAYAT KELAHIRAN & PERSALINAN */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    IV
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    RIWAYAT PRENATAL & PERSALINAN (KELAHIRAN)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[9.5px]">
                  {/* Masa Kehamilan (Prenatal) */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Masa Kehamilan (Pra-Natal)
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Keluhan Saat Hamil:</span>
                      <span className="font-medium text-slate-800 text-right">{prenatalRaw.problems || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kondisi Fisik Bunda:</span>
                      <span className="font-medium text-slate-800 text-right">{prenatalRaw.physicalCondition || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kondisi Emosi Bunda:</span>
                      <span className="font-medium text-slate-800 text-right">{prenatalRaw.emotionalCondition || '-'}</span>
                    </div>
                  </div>

                  {/* Proses Persalinan */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Proses Persalinan (Partus / Natal)
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usia Kandungan:</span>
                      <span className="font-medium text-slate-800">{deliveryRaw.duration ? `${deliveryRaw.duration} minggu` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proses Kelahiran:</span>
                      <span className="font-medium text-slate-800">{deliveryRaw.process || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kondisi Lahir (Tangis):</span>
                      <span className="font-medium text-slate-800">{deliveryRaw.condition || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Berat / Panjang Lahir:</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {deliveryRaw.weight ? `${deliveryRaw.weight} kg` : '-'} / {deliveryRaw.length ? `${deliveryRaw.length} cm` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pemberian ASI:</span>
                      <span className="font-medium text-slate-800">
                        {deliveryRaw.breastfeedingUntil ? `Hingga usia ${deliveryRaw.breastfeedingUntil}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN V: PERKEMBANGAN & POLA MAKAN */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    V
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    RIWAYAT PERKEMBANGAN & KEMANDIRIAN MAKAN-MINUM
                  </h3>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[9.5px]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Masih Disuapi:</span>
                      <span className="font-medium text-slate-800">{feedingRaw.fedBy || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Makan Menggunakan:</span>
                      <span className="font-medium text-slate-800">{feedingRaw.eatsWith || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sinyal / Tanda Lapar:</span>
                      <span className="font-medium text-slate-800">{feedingRaw.hungerSignal || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sukar Duduk Makan:</span>
                      <span className="font-medium text-slate-800">{feedingRaw.difficultySitting || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Posisi Menyulitkan:</span>
                      <span className="font-medium text-slate-800">{feedingRaw.difficultPositions || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suka Buah-buahan:</span>
                      <span className="font-medium text-slate-800">{prefRaw.fruits || '-'}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200/60 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <div>
                      <span className="text-slate-500 block text-[9px]">Minuman yang Disukai:</span>
                      <span className="font-medium text-slate-800">
                        {Array.isArray(prefRaw.drinks) && prefRaw.drinks.length > 0 
                          ? prefRaw.drinks.join(', ') 
                          : (prefRaw.drinks || '-')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Rasa & Makanan Favorit:</span>
                      <span className="font-medium text-slate-800">
                        {prefRaw.favoriteTaste ? `Rasa: ${prefRaw.favoriteTaste}` : ''} {prefRaw.foods ? `• ${prefRaw.foods}` : (prefRaw.favoriteTaste ? '' : '-')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN VI: RIWAYAT KESEHATAN & MEDIS */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    VI
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    RIWAYAT KESEHATAN & MEDIS
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[9.5px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5">
                      Diagnosa & Riwayat Terapi
                    </span>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Diagnosa Dokter / Klinisi:</span>
                      <span className="font-bold text-slate-800">
                        {record.diagnosis || healthRaw.diagnosis || '-'}
                      </span>
                    </div>
                    <div className="pt-0.5">
                      <span className="text-slate-500 block text-[9px]">Riwayat Terapi / Intervensi:</span>
                      <span className="font-medium text-slate-800">
                        {record.therapyHistory || healthRaw.therapyHistory || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5">
                      Riwayat Penyakit yang Pernah Dialami
                    </span>
                    <div>
                      {Array.isArray(healthRaw.illnesses) && healthRaw.illnesses.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {healthRaw.illnesses.map((ill: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[8.5px]">
                              {ill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[9px]">
                          Tidak ada riwayat penyakit berat / kejang yang dicentang.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN VII: KEMANDIRIAN & SOSIALISASI ANAK */}
              <div>
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    VII
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    KEMANDIRIAN & SOSIALISASI ANAK
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[9.5px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Kemandirian Harian (Dapat Sendiri)
                    </span>
                    <div className="text-slate-800">
                      {Array.isArray(socialRaw.independence) && socialRaw.independence.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {socialRaw.independence.map((item: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8.5px] font-medium text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic text-[9px]">
                          Belum ada kemandirian yang dicentang / Masih dibantu penuh.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Sosialisasi & Bermain
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sikap Sosial (Pemalu):</span>
                        <span className="font-medium text-slate-800">{socialRaw.sociability?.shyness || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Permainan Kelompok:</span>
                        <span className="font-medium text-slate-800">{socialRaw.sociability?.groupPlay || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Teman Bermain:</span>
                        <span className="font-medium text-slate-800">{socialRaw.sociability?.bestFriend || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lokasi Bermain:</span>
                        <span className="font-medium text-slate-800">{socialRaw.sociability?.playLocation || '-'}</span>
                      </div>
                      <div className="flex justify-between pt-0.5 border-t border-slate-200/50">
                        <span className="text-slate-500">Permainan Favorit:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{socialRaw.sociability?.favoriteGames || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Halaman 2 */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[8.5px] text-slate-400">
              <span>Formulir Pendaftaran Calon Klien • Pusat Terapi Pelangi Lazuardi</span>
              <span className="font-mono font-bold text-slate-600">Halaman 2 dari 3</span>
              <span>Dokumen Rekam Penerimaan Resmi</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LEMBAR 3: INFORMASI RUJUKAN, BELAJAR, EMOSI, OBSERVASI & TTD   */}
          {/* ============================================================== */}
          <div 
            data-print-page="true"
            className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[13mm] shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-[12mm] relative flex flex-col justify-between box-border text-[11px] leading-relaxed"
          >
            <div>
              {/* Header Mini Halaman 3 */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-400 mb-2 text-[9.5px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Pelangi Lazuardi • Lembar 3 (Rujukan, Evaluasi Klinis & Pengesahan)</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">No. Registrasi: <strong className="font-mono text-slate-800">{record.registrationNumber}</strong></span>
                </div>
                <div className="text-slate-600 font-medium">
                  Ananda: <strong className="text-slate-900">{record.childName}</strong>
                </div>
              </div>

              {/* BAGIAN VIII: FORMULIR RUJUKAN & KELUHAN AWAL */}
              <div className="mb-2.5">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    VIII
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    FORMULIR RUJUKAN & INFORMASI AWAL DARI ORANG TUA
                  </h3>
                </div>

                <div className="space-y-1 text-[9.5px]">
                  {/* Keluhan Utama */}
                  <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-800 block mb-0.5">
                      1. Keluhan / Perilaku yang Dikeluhkan Saat Ini:
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {referralRaw.complaints || record.mainComplaint || '-'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        2. Gambaran Anak Secara Umum:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.generalOverview || '-'}</p>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        3. Sejak Kapan Muncul:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.sinceWhen || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        4. Faktor yang Mendasari:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.underlyingFactors || '-'}</p>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        5. Faktor yang Meredakan:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.relievingFactors || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        6. Tindakan yang Sudah Dilakukan:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.actionsTaken || '-'}</p>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        7. Sasaran & Harapan Orang Tua:
                      </span>
                      <p className="font-medium text-slate-800">{referralRaw.goals || '-'}</p>
                    </div>
                  </div>

                  <div className="p-1 bg-slate-100/80 rounded-md flex items-center justify-between text-[9px] px-2">
                    <span className="text-slate-600">Sumber Informasi Mengenal Pelangi Lazuardi:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {record.referralSource || referralRaw.source || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BAGIAN IX: KEBIASAAN BELAJAR & EMOSI */}
              <div className="mb-2.5">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    IX
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    KEBIASAAN BELAJAR & RESPON EMOSI
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Kebiasaan Belajar
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lama Belajar:</span>
                      <span className="font-medium text-slate-800">{learningRaw.duration || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Waktu Belajar:</span>
                      <span className="font-medium text-slate-800">{learningRaw.time || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Materi Belajar:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {Array.isArray(learningRaw.matter) && learningRaw.matter.length > 0 ? learningRaw.matter.join(', ') : (learningRaw.matter || '-')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jadwal Belajar:</span>
                      <span className="font-medium text-slate-800">{learningRaw.schedule || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kemandirian Belajar:</span>
                      <span className="font-medium text-slate-800">{learningRaw.independence || '-'}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                      Respon Emosional & Penyesuaian
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pemicu Senang:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{emotionRaw.emotions?.happyWhat || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pemicu Marah:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{emotionRaw.emotions?.angryWhat || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lingkungan Baru:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{emotionRaw.socialAdjustment?.newEnv || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Aturan Baru:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{emotionRaw.socialAdjustment?.rules || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tugas Baru:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{emotionRaw.socialAdjustment?.newTask || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN X: PENGAMATAN TINGKAH LAKU, SENSORIK & OBSERVASI */}
              <div className="mb-2.5">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    X
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    REKAP ISIAN TINGKAH LAKU, PROFIL SENSORI & OBSERVASI WICARA
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  {/* Tingkah Laku */}
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-0.5 border-b border-slate-200 pb-0.5">
                      Pengamatan Perilaku
                    </span>
                    <p className="text-slate-600">
                      Total Diisi: <strong className="text-slate-900">{behaviorTotalAnswered}</strong> / 30 Poin
                    </p>
                    <p className="mt-0.5">
                      Indikator 'Ya': <strong className={behaviorYesCount > 0 ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>{behaviorYesCount} poin</strong>
                    </p>
                    <p className="text-[8.5px] text-slate-500 mt-0.5">
                      {behaviorYesCount === 0 
                        ? 'Seluruh poin dijawab Tidak / Tidak ada catatan.' 
                        : `${behaviorYesCount} indikator teramati pada perilaku ananda.`}
                    </p>
                  </div>

                  {/* Profil Sensori */}
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-0.5 border-b border-slate-200 pb-0.5">
                      Sensory Profile (86 Poin)
                    </span>
                    <p className="text-slate-600">
                      Total Diisi: <strong className="text-slate-900">{sensoryTotalAnswered}</strong> / 86 Poin
                    </p>
                    <p className="text-[8.5px] text-slate-500 mt-1">
                      {sensoryTotalAnswered > 0 
                        ? 'Telah terekam lengkap pada sistem assesmen klinik.' 
                        : 'Belum ada isian sensory profile / Formulir opsional.'}
                    </p>
                  </div>

                  {/* Observasi Bicara */}
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-0.5 border-b border-slate-200 pb-0.5">
                      Observasi Bicara (20 Poin)
                    </span>
                    <p className="text-slate-600">
                      Mampu: <strong className="text-emerald-700 font-bold">{obsMampuCount}</strong> • Belum: <strong className="text-rose-700 font-bold">{obsTidakMampuCount}</strong>
                    </p>
                    <p className="text-[8.5px] text-slate-500 mt-1">
                      {obsKeys.length > 0 ? 'Data observasi awal orang tua tersimpan.' : 'Formulir observasi belum diisi.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* BAGIAN XI: STATUS PENJADWALAN ASSESSMENT KLINIS */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 pb-0.5 border-b border-slate-300">
                  <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
                    XI
                  </span>
                  <h3 className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]">
                    STATUS PENJADWALAN ASSESSMENT KLINIS
                  </h3>
                </div>

                <div className="p-2 bg-blue-50/60 border border-blue-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px]">
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-blue-700 font-bold block">Status Pendaftaran:</span>
                    <span className="font-bold text-slate-900">{record.status}</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-blue-700 font-bold block">Tanggal Assessment:</span>
                    <span className="font-bold text-slate-900">
                      {record.assessmentDate ? new Date(record.assessmentDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Menunggu Koordinasi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-blue-700 font-bold block">Waktu Sesi:</span>
                    <span className="font-bold text-slate-900">{record.assessmentTime || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] uppercase tracking-wider text-blue-700 font-bold block">Assessor / Ruangan:</span>
                    <span className="font-bold text-slate-900">
                      {record.assessmentDate ? `${therapistName} (${record.assessmentRoom || 'Ruang Assessment'})` : '-'}
                    </span>
                  </div>
                  {record.assessmentNotes && (
                    <div className="col-span-2 sm:col-span-4 pt-1 border-t border-blue-200/60 text-slate-700 text-[9px]">
                      <span className="font-bold text-slate-800">Catatan Petugas: </span>
                      {record.assessmentNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* PERNYATAAN & LEMBAR PENGESAHAN TANDA TANGAN */}
              <div className="pt-3 border-t-2 border-slate-300">
                <p className="text-[9px] text-slate-600 italic text-center mb-4 leading-normal">
                  "Seluruh informasi di atas telah diisi dengan sebenarnya sesuai formulir registrasi calon klien untuk keperluan observasi klinis dan program intervensi tumbuh kembang ananda di Pusat Terapi Pelangi Lazuardi."
                </p>

                <div className="grid grid-cols-2 gap-8 text-center text-[10px] px-8">
                  {/* Pihak Orang Tua */}
                  <div className="flex flex-col items-center">
                    <p className="text-slate-600 font-bold mb-1">Orang Tua / Wali Murid,</p>
                    <div className="h-14 flex items-end justify-center">
                      <div className="w-44 border-b border-slate-800"></div>
                    </div>
                    <p className="font-bold text-slate-900 mt-1.5">
                      ( {record.parentName || record.fatherName || record.motherName || 'Nama Orang Tua / Wali'} )
                    </p>
                  </div>

                  {/* Petugas Administrasi (Bisa Diisi Manual atau Dikosongkan) */}
                  <div className="flex flex-col items-center">
                    <p className="text-slate-600 font-bold mb-1">Petugas Administrasi / Pendaftaran,</p>
                    <div className="h-14 flex items-end justify-center">
                      <div className="w-44 border-b border-slate-800"></div>
                    </div>
                    <div className="mt-1.5 font-bold text-slate-900">
                      {adminOfficer && adminOfficer.trim() ? (
                        <span>( {adminOfficer.trim()} )</span>
                      ) : (
                        <span className="text-slate-700 tracking-wider font-mono text-[9px]">
                          ( .................................................... )
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Halaman 3 */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[8.5px] text-slate-400">
              <span>Formulir Pendaftaran Calon Klien • Pusat Terapi Pelangi Lazuardi</span>
              <span className="font-mono font-bold text-slate-600">Halaman 3 dari 3 (Selesai)</span>
              <span>Dokumen Sah & Rahasia Medis Sesuai Isian Tamu</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPrintPreviewModal;
