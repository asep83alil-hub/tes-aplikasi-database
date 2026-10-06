
import React, { useMemo, useState, useEffect } from 'react';
import { Child, AttendanceStatus, UserRole } from '../types';
import { RecapData, formatLocalDateKey } from './AttendanceRecapPage';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Calendar,
  Check,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { downloadSingleStudentMonthlyAttendanceCSV } from '../utils/attendanceExcelGenerator';

type MasterChild = Omit<Child, 'sessions'>;

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  childData: RecapData | null;
  allChildren: MasterChild[];
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: string } };
  selectedMonth: string; // YYYY-MM
  onStatusChange?: (childId: string, sessionId: string, newStatus: AttendanceStatus) => void;
  userRole?: UserRole;
}

const statusStyles: { [key in AttendanceStatus]: { bg: string; text: string; badge: string; label: string } } = {
  [AttendanceStatus.PRESENT]: { bg: 'bg-emerald-600', text: 'text-white', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'Hadir' },
  [AttendanceStatus.ABSENT]: { bg: 'bg-rose-600', text: 'text-white', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'Tidak Hadir' },
  [AttendanceStatus.PERMIT]: { bg: 'bg-amber-600', text: 'text-white', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'Izin' },
  [AttendanceStatus.PENDING]: { bg: 'bg-slate-700', text: 'text-slate-200', badge: 'bg-slate-800 text-slate-400 border-slate-700', label: 'Menunggu' },
};

const LegendItem: React.FC<{ colorClass: string; label: string }> = ({ colorClass, label }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <div className={`w-3.5 h-3.5 rounded-md ${colorClass} shadow-xs`}></div>
    <span className="text-slate-300 font-medium">{label}</span>
  </div>
);

// Must match App.tsx
const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  childData, 
  allChildren, 
  attendanceRecords, 
  attendanceNotes, 
  selectedMonth,
  onStatusChange,
  userRole
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(selectedMonth);
      setSelectedDayNumber(null);
    }
  }, [isOpen, selectedMonth]);

  const childMasterData = useMemo(() => {
    if (!childData) return null;
    return allChildren.find(c => c.id === childData.childId);
  }, [childData, allChildren]);

  // Recalculate stats for the current selected month
  const recalculatedStats = useMemo(() => {
    if (!childData || !childMasterData?.recurringSessions) {
      return { totalSessions: 0, present: 0, absent: 0, permit: 0, pending: 0, rate: 0 };
    }

    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    let totalSessions = 0;
    let present = 0;
    let absent = 0;
    let permit = 0;
    let pending = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      
      const dayIndex = date.getDay(); 
      const dayOfWeekName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

      const localKey = formatLocalDateKey(date);
      const isoKey = date.toISOString().split('T')[0];
      
      const sessionsOnThisDay = childMasterData.recurringSessions.filter(rs => rs.day === dayOfWeekName);
      totalSessions += sessionsOnThisDay.length;

      sessionsOnThisDay.forEach(recSession => {
        const sessionId = `s-recur-${childData.childId}-${dayOfWeekName.replace(/\s/g, '')}-${recSession.time}`;
        const status = attendanceRecords[localKey]?.[sessionId] 
          || attendanceRecords[isoKey]?.[sessionId] 
          || AttendanceStatus.PENDING;

        switch(status) {
          case AttendanceStatus.PRESENT: present++; break;
          case AttendanceStatus.ABSENT: absent++; break;
          case AttendanceStatus.PERMIT: permit++; break;
          case AttendanceStatus.PENDING:
          default: pending++; break;
        }
      });
    }

    const evaluated = present + absent + permit;
    const rate = evaluated > 0 ? (present / evaluated) * 100 : 0;

    return { totalSessions, present, absent, permit, pending, rate: parseFloat(rate.toFixed(1)) };
  }, [currentMonth, childData, childMasterData, attendanceRecords]);

  const calendarData = useMemo(() => {
    if (!childData) return { blanks: [], days: [] };
    
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    
    const firstDayOfMonth = date.getDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const daysInMonth = new Date(year, month, 0).getDate();
    
    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { blanks, days };
  }, [currentMonth, childData]);

  if (!isOpen || !childData) return null;

  // Retrieve session info for a specific day
  const getSessionsForDay = (day: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const dayIndex = date.getDay(); 
    const dayOfWeekName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

    const localKey = formatLocalDateKey(date);
    const isoKey = date.toISOString().split('T')[0];

    if (!childMasterData?.recurringSessions) return [];

    const sessionsOnThisDay = childMasterData.recurringSessions.filter(rs => rs.day === dayOfWeekName);
    return sessionsOnThisDay.map(recSession => {
      const sessionId = `s-recur-${childData.childId}-${dayOfWeekName.replace(/\s/g, '')}-${recSession.time}`;
      const status = attendanceRecords[localKey]?.[sessionId] 
        || attendanceRecords[isoKey]?.[sessionId] 
        || AttendanceStatus.PENDING;
      
      const rawNote = attendanceNotes[localKey]?.[sessionId] || attendanceNotes[isoKey]?.[sessionId];
      const note = typeof rawNote === 'string' ? rawNote : (rawNote as any)?.note || '';

      return {
        sessionId,
        time: recSession.time,
        type: recSession.type,
        status,
        note,
        dateKey: localKey,
        dayOfWeekName
      };
    });
  };

  const getPrimaryStatusForDay = (day: number): AttendanceStatus | null => {
    const sessions = getSessionsForDay(day);
    if (sessions.length === 0) return null;
    return sessions[0].status;
  };

  const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const [modalYear, modalMonth] = currentMonth.split('-').map(Number);
  const modalMonthDisplayName = `${monthNames[modalMonth - 1]} ${modalYear}`;

  const handleDownloadStudentCsv = () => {
    if (!childMasterData) return;
    downloadSingleStudentMonthlyAttendanceCSV(
      childMasterData,
      currentMonth,
      modalMonthDisplayName,
      recalculatedStats,
      attendanceRecords,
      attendanceNotes
    );
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4 bg-slate-950/70">
          <div className="flex items-center gap-3.5">
            <img 
              src={childData.photoUrl} 
              alt={childData.childName} 
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Sinkron Presensi Admin
                </span>
                <span className="text-xs text-slate-400 font-mono">{childData.childId}</span>
              </div>
              <h3 className="text-lg font-black text-white">{childData.childName}</h3>
              <p className="text-xs text-slate-400">{childData.className || 'Kelas Terapi'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="month"
              id="month-picker-modal"
              value={currentMonth}
              onChange={(e) => {
                setCurrentMonth(e.target.value);
                setSelectedDayNumber(null);
              }}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              onClick={handleDownloadStudentCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              title={`Unduh Log Kehadiran ${childData.childName} Bulan ${modalMonthDisplayName} (Excel/CSV)`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Rekap</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* 5 Stats Cards for Selected Child */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Total Sesi</p>
              <p className="text-xl font-black text-white mt-0.5">{recalculatedStats.totalSessions}</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl">
              <p className="text-[11px] text-emerald-300 font-bold uppercase">Hadir</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{recalculatedStats.present}</p>
            </div>
            <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-2xl">
              <p className="text-[11px] text-rose-300 font-bold uppercase">Tidak Hadir</p>
              <p className="text-xl font-black text-rose-400 mt-0.5">{recalculatedStats.absent}</p>
            </div>
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl">
              <p className="text-[11px] text-amber-300 font-bold uppercase">Izin</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">{recalculatedStats.permit}</p>
            </div>
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-2xl col-span-2 sm:col-span-1">
              <p className="text-[11px] text-indigo-300 font-bold uppercase">Tingkat Hadir</p>
              <p className="text-xl font-black text-indigo-400 mt-0.5">{recalculatedStats.rate}%</p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Kalender Presensi Harian:
              </span>
              <span className="text-[11px] text-slate-500">
                Klik pada tanggal berwarna untuk melihat atau mengubah presensi
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">
              {weekdays.map(day => <div key={day} className="py-1">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarData.blanks.map((_, index) => (
                <div key={`blank-${index}`} className="w-full aspect-square rounded-xl bg-slate-900/30 opacity-20"></div>
              ))}
              {calendarData.days.map(day => {
                const status = getPrimaryStatusForDay(day);
                const hasSessions = getSessionsForDay(day).length > 0;
                const isSelected = selectedDayNumber === day;
                
                let dayBg = 'bg-slate-900/50 text-slate-600 border border-slate-850 cursor-default';
                if (hasSessions) {
                  if (status === AttendanceStatus.PRESENT) dayBg = 'bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-sm cursor-pointer border border-emerald-400/50';
                  else if (status === AttendanceStatus.ABSENT) dayBg = 'bg-rose-600 hover:bg-rose-500 text-white font-black shadow-sm cursor-pointer border border-rose-400/50';
                  else if (status === AttendanceStatus.PERMIT) dayBg = 'bg-amber-600 hover:bg-amber-500 text-white font-black shadow-sm cursor-pointer border border-amber-400/50';
                  else dayBg = 'bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 cursor-pointer';
                }

                return (
                  <button
                    key={day}
                    disabled={!hasSessions}
                    onClick={() => setSelectedDayNumber(selectedDayNumber === day ? null : day)}
                    className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all relative ${dayBg} ${
                      isSelected ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{day}</span>
                    {hasSessions && (
                      <span className="text-[8px] opacity-80 leading-none mt-0.5">
                        {status === AttendanceStatus.PRESENT ? '✓' : status === AttendanceStatus.ABSENT ? '✕' : status === AttendanceStatus.PERMIT ? 'i' : '•'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center items-center gap-4 mt-4 pt-3 border-t border-slate-800 flex-wrap">
              <LegendItem colorClass="bg-emerald-600" label="Hadir" />
              <LegendItem colorClass="bg-rose-600" label="Tidak Hadir (Absen)" />
              <LegendItem colorClass="bg-amber-600" label="Izin" />
              <LegendItem colorClass="bg-slate-800 border border-slate-700" label="Menunggu" />
              <LegendItem colorClass="bg-slate-900/40 border border-slate-850" label="Tidak Ada Sesi" />
            </div>
          </div>

          {/* Interactive Day Details Panel */}
          {selectedDayNumber && (
            <div className="p-4 bg-indigo-950/40 border-2 border-indigo-500/40 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                <span className="text-xs font-black text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Sesi Tanggal {selectedDayNumber} ({getSessionsForDay(selectedDayNumber)[0]?.dayOfWeekName}):
                </span>
                <span className="text-[11px] text-indigo-300">
                  {onStatusChange ? 'Klik status untuk mengubah presensi langsung' : 'Data riwayat presensi'}
                </span>
              </div>

              <div className="space-y-2">
                {getSessionsForDay(selectedDayNumber).map((sess, idx) => {
                  const style = statusStyles[sess.status];
                  return (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">{sess.time}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                            Terapi {sess.type}
                          </span>
                        </div>
                        {sess.note && (
                          <p className="text-[11px] text-slate-400 italic mt-1">"{sess.note}"</p>
                        )}
                      </div>

                      {/* Status Badges with Click-to-Change if permitted */}
                      <div className="flex items-center gap-1.5">
                        {onStatusChange ? (
                          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                            <button
                              onClick={() => onStatusChange(childData.childId, sess.sessionId, AttendanceStatus.PRESENT)}
                              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                                sess.status === AttendanceStatus.PRESENT 
                                  ? 'bg-emerald-600 text-white shadow-sm' 
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => onStatusChange(childData.childId, sess.sessionId, AttendanceStatus.ABSENT)}
                              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                                sess.status === AttendanceStatus.ABSENT 
                                  ? 'bg-rose-600 text-white shadow-sm' 
                                  : 'text-slate-400 hover:text-rose-400'
                              }`}
                            >
                              Absen
                            </button>
                            <button
                              onClick={() => onStatusChange(childData.childId, sess.sessionId, AttendanceStatus.PERMIT)}
                              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                                sess.status === AttendanceStatus.PERMIT 
                                  ? 'bg-amber-600 text-white shadow-sm' 
                                  : 'text-slate-400 hover:text-amber-400'
                              }`}
                            >
                              Izin
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${style.badge}`}>
                            {style.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes and feedback summary list */}
          {useMemo(() => {
            const [year, month] = currentMonth.split('-').map(Number);
            const notesList: { day: number; note: string }[] = [];
            for (let day = 1; day <= calendarData.days.length; day++) {
              const sessions = getSessionsForDay(day);
              sessions.forEach(s => {
                if (s.note) {
                  notesList.push({ day, note: s.note });
                }
              });
            }
            if (notesList.length === 0) return null;
            return (
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Catatan Harian Terapis di Bulan {currentMonth}:
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {notesList.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-indigo-400 shrink-0 font-mono">Tgl {item.day}:</span>
                      <span className="text-slate-300 italic">"{item.note}"</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }, [currentMonth, calendarData.days, childMasterData, attendanceNotes, childData.childId])}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailModal;

