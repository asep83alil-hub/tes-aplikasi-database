
import React, { useState, useMemo } from 'react';
import { Child, AttendanceStatus, UserRole } from '../types';
import AttendanceDetailModal from './AttendanceDetailModal';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Check, 
  TrendingUp, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles,
  Info,
  Printer
} from 'lucide-react';
import AttendancePrintPreviewModal from './AttendancePrintPreviewModal';
import { downloadMonthlyAttendanceCSV } from '../utils/attendanceExcelGenerator';

type MasterChild = Omit<Child, 'sessions'>;

interface AttendanceRecapPageProps {
  allChildren: MasterChild[];
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: string } };
  onStatusChange?: (childId: string, sessionId: string, newStatus: AttendanceStatus) => void;
  userRole?: UserRole;
  logoUrl?: string;
}

export interface RecapData {
  childId: string;
  childName: string;
  photoUrl: string;
  className?: string;
  totalSessions: number;
  present: number;
  absent: number;
  permit: number;
  pending: number;
  attendanceRate: number;
}

type SortableKeys = keyof RecapData;

// Days of week mapping used for scheduling
const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Robust local date formatting to prevent timezone shift issues (YYYY-MM-DD)
export const formatLocalDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AttendanceRecapPage: React.FC<AttendanceRecapPageProps> = ({ 
  allChildren, 
  attendanceRecords, 
  attendanceNotes,
  onStatusChange,
  userRole,
  logoUrl
}) => {
  // Current month default in format YYYY-MM
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(currentMonthKey);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'childName', direction: 'ascending' });
  const [selectedChild, setSelectedChild] = useState<RecapData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'high' | 'attention'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedDate.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    setSelectedDate(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedDate.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setSelectedDate(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    setSelectedDate(currentMonthKey);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const [currentYearNum, currentMonthNum] = selectedDate.split('-').map(Number);
  const monthDisplayName = `${monthNames[currentMonthNum - 1]} ${currentYearNum}`;

  // Monthly recap data calculation automatically synced with admin presensi
  const monthlyRecapData = useMemo<RecapData[]>(() => {
    if (!allChildren || allChildren.length === 0) return [];

    const [year, month] = selectedDate.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    return allChildren
      .filter(c => c.status !== 'Non-Aktif')
      .map(child => {
        let totalSessions = 0;
        let present = 0;
        let absent = 0;
        let permit = 0;
        let pending = 0;
        
        if (child.recurringSessions && child.recurringSessions.length > 0) {
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            
            // Map day of week
            const dayIndex = date.getDay(); // 0 is Sunday
            const dayOfWeekName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];
            
            // Generate both local and ISO keys for 100% reliable matching
            const localKey = formatLocalDateKey(date);
            const isoKey = date.toISOString().split('T')[0];
            
            const sessionsOnThisDay = child.recurringSessions.filter(rs => rs.day === dayOfWeekName);
            totalSessions += sessionsOnThisDay.length;

            sessionsOnThisDay.forEach(recSession => {
              const sessionId = `s-recur-${child.id}-${dayOfWeekName.replace(/\s/g, '')}-${recSession.time}`;
              // Retrieve presensi status set by admin (checks localKey first, then isoKey fallback)
              const status = attendanceRecords[localKey]?.[sessionId] 
                || attendanceRecords[isoKey]?.[sessionId] 
                || AttendanceStatus.PENDING;

              switch(status) {
                case AttendanceStatus.PRESENT:
                  present++;
                  break;
                case AttendanceStatus.ABSENT:
                  absent++;
                  break;
                case AttendanceStatus.PERMIT:
                  permit++;
                  break;
                case AttendanceStatus.PENDING:
                default:
                  pending++;
                  break;
              }
            });
          }
        }
        
        // Calculate attendance rate (present vs attended sessions)
        const totalEvaluated = present + absent + permit;
        const attendanceRate = totalEvaluated > 0 ? (present / totalEvaluated) * 100 : 0;

        return {
          childId: child.id,
          childName: child.name,
          photoUrl: child.photoUrl,
          className: child.className || 'Kelas Terapi',
          totalSessions,
          present,
          absent,
          permit,
          pending,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        };
      });
  }, [allChildren, attendanceRecords, selectedDate]);

  // Overall Monthly Metrics for Executive KPI Cards
  const overallMonthlyStats = useMemo(() => {
    let totalSessions = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalPermit = 0;
    let totalPending = 0;

    monthlyRecapData.forEach(r => {
      totalSessions += r.totalSessions;
      totalPresent += r.present;
      totalAbsent += r.absent;
      totalPermit += r.permit;
      totalPending += r.pending;
    });

    const evaluated = totalPresent + totalAbsent + totalPermit;
    const avgAttendanceRate = evaluated > 0 ? ((totalPresent / evaluated) * 100).toFixed(1) : '0';

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalPermit,
      totalPending,
      avgAttendanceRate
    };
  }, [monthlyRecapData]);

  // Filtered & Sorted Recap Data
  const filteredAndSortedRecapData = useMemo(() => {
    let items = monthlyRecapData.filter(item => {
      const matchSearch = searchQuery.trim() === '' || 
        item.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.childId.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterCategory === 'high') {
        return item.attendanceRate >= 85 && (item.present > 0);
      }
      if (filterCategory === 'attention') {
        return item.absent > 0 || (item.attendanceRate < 85 && item.present + item.absent > 0);
      }
      return true;
    });

    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [monthlyRecapData, sortConfig, searchQuery, filterCategory]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleDownloadMonthlyExcel = () => {
    try {
      downloadMonthlyAttendanceCSV({
        monthKey: selectedDate,
        monthDisplayName,
        allChildren,
        monthlyRecapData,
        overallStats: overallMonthlyStats,
        attendanceRecords,
        attendanceNotes
      });
      setDownloadFeedback(`Rekap kehadiran bulan ${monthDisplayName} berhasil diunduh dalam format Excel (.csv)!`);
      setTimeout(() => setDownloadFeedback(null), 4000);
    } catch (err) {
      console.error('Gagal mengunduh Excel:', err);
    }
  };

  return (
    <>
      <AttendanceDetailModal
        isOpen={!!selectedChild}
        onClose={() => setSelectedChild(null)}
        childData={selectedChild}
        allChildren={allChildren}
        attendanceRecords={attendanceRecords}
        attendanceNotes={attendanceNotes}
        selectedMonth={selectedDate}
        onStatusChange={onStatusChange}
        userRole={userRole}
      />

      <AttendancePrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        monthKey={selectedDate}
        monthDisplayName={monthDisplayName}
        allChildren={allChildren}
        monthlyRecapData={monthlyRecapData}
        overallStats={overallMonthlyStats}
        attendanceRecords={attendanceRecords}
        attendanceNotes={attendanceNotes}
        logoUrl={logoUrl}
      />

      <main className="p-4 sm:p-6 lg:p-8 bg-[#0F172A] min-h-screen text-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Toast Notification when Download is Triggered */}
          {downloadFeedback && (
            <div className="bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{downloadFeedback}</span>
              </div>
              <button 
                onClick={() => setDownloadFeedback(null)}
                className="text-emerald-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header Title & Controls Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Presensi Digital Real-Time
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Terisi Otomatis Dari Presensi Admin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Rekap Kehadiran & Ketidakhadiran Bulanan
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Rekapan komprehensif kehadiran, ketidakhadiran (absen & izin), serta persentase keaktifan siswa terapi.
              </p>
            </div>

            {/* Action Group: Download Buttons & Month Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* DOWNLOAD 1-MONTH ATTENDANCE BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMonthlyExcel}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer border border-emerald-500/30 group"
                  title="Unduh Rekap Kehadiran Siswa 1 Bulan Penuh dalam format spreadsheet Excel (.csv)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Unduh Excel (1 Bulan)</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-2 cursor-pointer border border-indigo-500/40 group"
                  title="Cetak & Unduh Dokumen PDF Resmi Rekapitulasi Kehadiran Siswa 1 Bulan Penuh"
                >
                  <Printer className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                  <span>Cetak / PDF (1 Bulan)</span>
                </button>
              </div>

              {/* Month Navigator Controls */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
                <button
                  onClick={handlePrevMonth}
                  title="Bulan Sebelumnya"
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white px-2">
                    {monthDisplayName}
                  </span>
                  <input
                    type="month"
                    id="month-picker"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleNextMonth}
                  title="Bulan Berikutnya"
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {selectedDate !== currentMonthKey && (
                  <button
                    onClick={handleCurrentMonth}
                    title="Kembali ke Bulan Berjalan"
                    className="px-2.5 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-1 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Bulan Ini
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5 EXECUTIVE MONTHLY RECAP KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Total Sesi Bulan Ini */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider">Total Sesi</span>
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white tracking-tight">
                  {overallMonthlyStats.totalSessions}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">Sesi</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Target terjadwal di {monthDisplayName}
              </p>
            </div>

            {/* Card 2: Rekapan Kehadiran (Hadir) */}
            <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8"></div>
              <div className="flex items-center justify-between text-emerald-300 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider">Rekap Hadir</span>
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400 tracking-tight">
                  {overallMonthlyStats.totalPresent}
                </span>
                <span className="text-xs font-bold text-emerald-500 uppercase">Sesi</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold">Tingkat Hadir:</span>
                <span className="text-emerald-400 font-black">{overallMonthlyStats.avgAttendanceRate}%</span>
              </div>
            </div>

            {/* Card 3: Rekapan Tidak Hadir (Absen) */}
            <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8"></div>
              <div className="flex items-center justify-between text-rose-300 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider">Tidak Hadir (Absen)</span>
                <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                  <XCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-rose-400 tracking-tight">
                  {overallMonthlyStats.totalAbsent}
                </span>
                <span className="text-xs font-bold text-rose-500 uppercase">Sesi</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Absen tanpa keterangan / perlu sesi pengganti
              </p>
            </div>

            {/* Card 4: Rekapan Izin & Sakit */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-amber-300 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider">Rekap Izin</span>
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-400 tracking-tight">
                  {overallMonthlyStats.totalPermit}
                </span>
                <span className="text-xs font-bold text-amber-500 uppercase">Sesi</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Izin resmi orang tua / surat dokter
              </p>
            </div>

            {/* Card 5: Belum Dipresensi (Menunggu) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider">Belum Presensi</span>
                <span className="p-1 rounded-lg bg-slate-800 text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-300 tracking-tight">
                  {overallMonthlyStats.totalPending}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">Sesi</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Menunggu input jadwal presensi admin
              </p>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama siswa atau ID rekam medis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Semua Siswa ({monthlyRecapData.length})
              </button>
              <button
                onClick={() => setFilterCategory('high')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterCategory === 'high'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kehadiran Tinggi ≥85%
              </button>
              <button
                onClick={() => setFilterCategory('attention')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterCategory === 'attention'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Ada Tidak Hadir / Absen
              </button>
            </div>
          </div>

          {/* MAIN ATTENDANCE RECAP TABLE */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b-2 border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => requestSort('childName')}>
                      Siswa {getSortIndicator('childName')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('totalSessions')}>
                      Total Sesi {getSortIndicator('totalSessions')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('present')}>
                      <span className="text-emerald-400">Hadir</span> {getSortIndicator('present')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('absent')}>
                      <span className="text-rose-400">Tidak Hadir (Absen)</span> {getSortIndicator('absent')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('permit')}>
                      <span className="text-amber-400">Izin</span> {getSortIndicator('permit')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('pending')}>
                      <span className="text-slate-400">Menunggu</span> {getSortIndicator('pending')}
                    </th>
                    <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white min-w-[180px]" onClick={() => requestSort('attendanceRate')}>
                      Tingkat Kehadiran (%) {getSortIndicator('attendanceRate')}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Status Evaluasi
                    </th>
                    <th scope="col" className="px-6 py-4 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredAndSortedRecapData.length > 0 ? (
                    filteredAndSortedRecapData.map((data) => {
                      const isHighAttendance = data.attendanceRate >= 85;
                      const isMediumAttendance = data.attendanceRate >= 70 && data.attendanceRate < 85;
                      const hasAbsence = data.absent > 0;

                      return (
                        <tr key={data.childId} className="hover:bg-slate-800/40 transition-colors">
                          {/* Student Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => setSelectedChild(data)} 
                              className="flex items-center text-left hover:opacity-90 transition-opacity group cursor-pointer"
                            >
                              <img 
                                className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all" 
                                src={data.photoUrl} 
                                alt={data.childName} 
                              />
                              <div className="ml-3.5">
                                <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                  {data.childName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-indigo-400">{data.childId}</span>
                                  <span>•</span>
                                  <span>{data.className}</span>
                                </div>
                              </div>
                            </button>
                          </td>

                          {/* Total Sesi */}
                          <td className="px-4 py-4 whitespace-nowrap text-center font-bold text-white text-sm font-mono">
                            {data.totalSessions} Sesi
                          </td>

                          {/* Hadir Badge */}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" />
                              {data.present}
                            </span>
                          </td>

                          {/* Tidak Hadir (Absen) Badge */}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                              data.absent > 0 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black' 
                                : 'bg-slate-950/60 text-slate-500 border border-slate-800'
                            }`}>
                              {data.absent > 0 ? `✕ ${data.absent}` : '0'}
                            </span>
                          </td>

                          {/* Izin Badge */}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                              data.permit > 0 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-slate-950/60 text-slate-500 border border-slate-800'
                            }`}>
                              {data.permit}
                            </span>
                          </td>

                          {/* Menunggu Badge */}
                          <td className="px-4 py-4 whitespace-nowrap text-center font-mono text-slate-400 font-semibold">
                            {data.pending}
                          </td>

                          {/* Attendance Rate & Progress Bar */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className={
                                  isHighAttendance ? 'text-emerald-400' : isMediumAttendance ? 'text-amber-400' : 'text-rose-400'
                                }>
                                  {data.attendanceRate}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  {data.present}/{data.present + data.absent + data.permit} Dievaluasi
                                </span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isHighAttendance 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                      : isMediumAttendance 
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                                  }`} 
                                  style={{ width: `${Math.min(data.attendanceRate, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Evaluation Status Tag */}
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            {data.present + data.absent + data.permit === 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                Belum Dimulai
                              </span>
                            ) : isHighAttendance ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Sangat Baik
                              </span>
                            ) : isMediumAttendance ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Cukup
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Perlu Perhatian
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => setSelectedChild(data)}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/40 transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm active:scale-95"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Detail Harian</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">
                            Tidak ada data kehadiran yang sesuai kriteria pencarian.
                          </p>
                          <p className="text-xs text-slate-500">
                            Silakan ubah kata kunci atau ganti filter kategori di atas.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AttendanceRecapPage;

