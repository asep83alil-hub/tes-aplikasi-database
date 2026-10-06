
import React, { useState, useMemo } from 'react';
import { Child, TherapyDefinition, AttendanceStatus, View, UserRole } from '../types';
import InvoiceModal from './InvoiceModal';
import PrintSummaryModal from './PrintSummaryModal';
import PrintIcon from './icons/PrintIcon';
import { 
  TrendingDown, 
  Plus, 
  Minus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Receipt, 
  Calculator, 
  Sparkles,
  HelpCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const calculateCalendarDays = (year: number, monthIndex: number) => {
  const counts: { [key: string]: number } = {
    'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0, 'Minggu': 0
  };
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, monthIndex, day);
    const dayOfWeek = d.getDay();
    const name = dayNames[dayOfWeek];
    if (name) {
      counts[name] = (counts[name] || 0) + 1;
    }
  }
  return { counts, totalDays };
};

type MasterChild = Omit<Child, 'sessions'>;

interface BillingPageProps {
  allChildren: MasterChild[];
  therapyTypes: TherapyDefinition[];
  logoUrl: string;
  onNavigate: (view: View) => void;
  userRole: UserRole;
  onUpdatePaymentStatus: (childId: string, period: string, status: 'Lunas' | 'Belum Lunas') => void;
  therapyCosts: { [key: string]: number };
  onUpdateCost: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

export interface ChildBillingCorrection {
  sessionCorrections: { [key: string]: number };
  manualAmount: number;
  totalCorrectionAmount: number;
  notes?: string;
}

export interface BillingInfo {
  childId: string;
  childName: string;
  photoUrl: string;
  sessionDetails: { [key: string]: { count: number; name: string; } };
  totalSessions: number;
  originalBill: number;
  correction: ChildBillingCorrection;
  totalBill: number;
  paymentStatus: 'Lunas' | 'Belum Lunas';
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const RateSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    costs: { [key: string]: number };
    onSave: (newCosts: { [key: string]: number }) => void;
    therapyTypes: TherapyDefinition[];
}> = ({ isOpen, onClose, costs, onSave, therapyTypes }) => {
    const [editableCosts, setEditableCosts] = useState(costs);

    // Sync with props when modal opens
    useMemo(() => {
        if (isOpen) setEditableCosts(costs);
    }, [isOpen, costs]);

    if (!isOpen) return null;

    const handleChange = (id: string, value: string) => {
        const numValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
        setEditableCosts(prev => ({ ...prev, [id]: numValue }));
    };

    const handleSave = () => {
        onSave(editableCosts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
            <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-surface-light flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Atur Tarif Terapi</h3>
                    <button onClick={onClose} className="text-muted hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {therapyTypes.map(type => (
                        <div key={type.id}>
                            <label className="block text-xs font-medium text-muted mb-1">{type.name}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted text-sm">Rp</span>
                                <input
                                    type="text"
                                    value={new Intl.NumberFormat('id-ID').format(editableCosts[type.id] || 0)}
                                    onChange={(e) => handleChange(type.id, e.target.value)}
                                    className="bg-surface-light border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                                />
                            </div>
                        </div>
                    ))}
                     <div className="p-3 bg-surface-light/30 rounded-lg text-xs text-muted">
                        Catatan: Anda dapat menambahkan jenis biaya baru dengan menambahkan "Jenis Terapi" baru di menu Pengaturan.
                    </div>
                </div>
                <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg hover:bg-surface-light/50 transition">Batal</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-dark transition">Simpan Tarif</button>
                </div>
            </div>
        </div>
    );
};

// Modal for setting manual correction per student
const StudentCorrectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: BillingInfo | null;
  therapyTypes: TherapyDefinition[];
  therapyCosts: { [key: string]: number };
  onSave: (childId: string, correction: ChildBillingCorrection) => void;
  onDelete: (childId: string) => void;
}> = ({ isOpen, onClose, student, therapyTypes, therapyCosts, onSave, onDelete }) => {
  const [sessionCorrections, setSessionCorrections] = useState<{ [key: string]: number }>({});
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useMemo(() => {
    if (student && isOpen) {
      setSessionCorrections(student.correction?.sessionCorrections || {});
      setManualAmount(student.correction?.manualAmount || 0);
      setNotes(student.correction?.notes || '');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSessionChange = (typeId: string, count: number) => {
    setSessionCorrections(prev => {
      const next = { ...prev };
      if (count <= 0) {
        delete next[typeId];
      } else {
        next[typeId] = count;
      }
      return next;
    });
  };

  // Calculate live reduction
  const sessionDeduction = Object.entries(sessionCorrections).reduce((sum: number, [typeId, count]: [string, number]) => {
    return sum + ((Number(count) || 0) * (therapyCosts[typeId] || 0));
  }, 0);

  const totalReduction = sessionDeduction + (Number(manualAmount) || 0);
  const finalBill = Math.max(0, student.originalBill - totalReduction);

  const handleSave = () => {
    const finalCorrection: ChildBillingCorrection = {
      sessionCorrections,
      manualAmount: Number(manualAmount) || 0,
      totalCorrectionAmount: totalReduction,
      notes: notes.trim()
    };
    onSave(student.childId, finalCorrection);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm(`Hapus seluruh koreksi tagihan untuk ${student.childName}?`)) {
      onDelete(student.childId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-surface border border-surface-light rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-surface-light flex items-center justify-between bg-surface-light/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Koreksi Tagihan Siswa</h3>
              <p className="text-xs text-muted">Pengurangan tagihan otomatis sesuai tarif biaya terapi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Student Snapshot Card */}
          <div className="flex items-center justify-between p-4 bg-background/60 border border-surface-light rounded-xl">
            <div className="flex items-center gap-3">
              <img 
                src={student.photoUrl} 
                alt={student.childName} 
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40" 
              />
              <div>
                <p className="text-sm font-bold text-white uppercase">{student.childName}</p>
                <p className="text-xs text-muted font-mono">{student.childId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Tagihan Awal</p>
              <p className="text-base font-bold text-white">{formatCurrency(student.originalBill)}</p>
              <p className="text-[10px] text-muted">{student.totalSessions} sesi terjadwal</p>
            </div>
          </div>

          {/* Section 1: Session-Based Correction (Matching therapy cost) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-primary" />
                Koreksi Sesi Terapi (Sesuai Biaya Terapi)
              </label>
              <span className="text-[10px] text-muted italic">Mengurangi tarif per sesi</span>
            </div>

            <div className="space-y-2">
              {therapyTypes.map(type => {
                const cost = therapyCosts[type.id] || 0;
                const scheduledDetail = student.sessionDetails[type.id];
                const scheduledCount = scheduledDetail?.count || 0;
                const currentCorrectionCount = sessionCorrections[type.id] || 0;
                const deductionForType = currentCorrectionCount * cost;

                return (
                  <div 
                    key={type.id} 
                    className={`p-3 rounded-xl border transition-all ${
                      currentCorrectionCount > 0 
                        ? 'bg-rose-500/10 border-rose-500/30' 
                        : scheduledCount > 0 
                        ? 'bg-surface-light/40 border-surface-light' 
                        : 'bg-surface-light/20 border-surface-light/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{type.name}</span>
                          {scheduledCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-light text-muted font-mono">
                              Jadwal: {scheduledCount}x
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Tarif: <span className="font-semibold text-slate-300">{formatCurrency(cost)}</span> / sesi
                        </p>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background border border-surface-light rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleSessionChange(type.id, Math.max(0, currentCorrectionCount - 1))}
                            className="p-1.5 hover:bg-surface-light text-muted hover:text-white transition-colors"
                            title="Kurangi 1 sesi koreksi"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentCorrectionCount || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              handleSessionChange(type.id, isNaN(val) || val < 0 ? 0 : val);
                            }}
                            className="w-12 text-center text-xs font-bold bg-transparent text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSessionChange(type.id, currentCorrectionCount + 1)}
                            className="p-1.5 hover:bg-surface-light text-muted hover:text-white transition-colors"
                            title="Tambah 1 sesi koreksi"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {currentCorrectionCount > 0 && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20 flex justify-between items-center text-xs">
                        <span className="text-rose-400 font-medium">
                          Potongan {currentCorrectionCount} sesi × {formatCurrency(cost)}:
                        </span>
                        <span className="font-bold text-rose-400 font-mono">
                          -{formatCurrency(deductionForType)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Additional Manual Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Koreksi Manual Tambahan (Nominal Rp)</span>
              <span className="text-[10px] text-muted font-normal">Diskon / Pembulatan / Kompensasi Lain</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted text-sm font-semibold">Rp</span>
              <input
                type="text"
                value={manualAmount ? new Intl.NumberFormat('id-ID').format(manualAmount) : ''}
                onChange={(e) => {
                  const numValue = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                  setManualAmount(numValue);
                }}
                placeholder="0"
                className="w-full bg-surface-light border border-surface-light/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/40 focus:border-primary font-bold"
              />
            </div>
          </div>

          {/* Section 3: Notes / Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              Alasan / Keterangan Koreksi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kompensasi terapis izin 1 sesi Okupasi tgl 12, diskon persaudaraan, dll."
              className="w-full bg-surface-light border border-surface-light/60 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder-muted"
            />
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-4 bg-background/80 border border-surface-light rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Subtotal Tagihan Awal:</span>
              <span className="font-semibold text-slate-300">{formatCurrency(student.originalBill)}</span>
            </div>
            {sessionDeduction > 0 && (
              <div className="flex justify-between text-xs text-rose-400">
                <span>Pengurangan Sesi Terapi:</span>
                <span className="font-bold font-mono">-{formatCurrency(sessionDeduction)}</span>
              </div>
            )}
            {manualAmount > 0 && (
              <div className="flex justify-between text-xs text-rose-400">
                <span>Pengurangan Manual Tambahan:</span>
                <span className="font-bold font-mono">-{formatCurrency(manualAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-surface-light flex justify-between items-center text-sm">
              <span className="font-bold text-white">Total Tagihan Bersih:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatCurrency(finalBill)}
              </span>
            </div>
            {totalReduction > 0 && (
              <p className="text-[11px] text-center text-rose-400 font-medium pt-1">
                Tagihan berkurang sebesar <span className="font-bold">{formatCurrency(totalReduction)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-background/50 border-t border-surface-light flex items-center justify-between gap-3">
          {student.correction?.totalCorrectionAmount > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Koreksi
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted bg-surface-light rounded-xl hover:bg-surface-light/70 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-background bg-primary hover:bg-primary-dark rounded-xl transition shadow-lg shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              Simpan Koreksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingPage: React.FC<BillingPageProps> = ({ 
  allChildren, 
  therapyTypes, 
  logoUrl, 
  onNavigate, 
  userRole, 
  onUpdatePaymentStatus, 
  therapyCosts, 
  onUpdateCost 
}) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [isCustomPeriodName, setIsCustomPeriodName] = useState<boolean>(false);
  const [billingPeriod, setBillingPeriod] = useState<string>(
    `Periode ${INDONESIAN_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  );
  
  // Initialize with exact calendar day occurrences for the initial month/year
  const [daysInMonth, setDaysInMonth] = useState<{ [key: string]: number }>(() => {
    return calculateCalendarDays(now.getFullYear(), now.getMonth()).counts;
  });

  const calendarStats = useMemo(() => {
    return calculateCalendarDays(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const totalConfiguredDays = useMemo(() => {
    return Object.values(daysInMonth).reduce((sum: number, count: number) => sum + (Number(count) || 0), 0);
  }, [daysInMonth]);

  // Synchronize or change month and year
  const handleSelectMonth = (monthIdx: number, yearNum: number = selectedYear) => {
    setSelectedMonth(monthIdx);
    setSelectedYear(yearNum);
    const periodName = `Periode ${INDONESIAN_MONTHS[monthIdx]} ${yearNum}`;
    setBillingPeriod(periodName);
    setIsCustomPeriodName(false);

    // Calculate exact calendar days for this month and year automatically
    const { counts } = calculateCalendarDays(yearNum, monthIdx);
    setDaysInMonth(counts);
  };

  const handleSelectYear = (yearNum: number) => {
    setSelectedYear(yearNum);
    const periodName = `Periode ${INDONESIAN_MONTHS[selectedMonth]} ${yearNum}`;
    setBillingPeriod(periodName);
    const { counts } = calculateCalendarDays(yearNum, selectedMonth);
    setDaysInMonth(counts);
  };

  const handlePreviousMonth = () => {
    let nextMonth = selectedMonth - 1;
    let nextYear = selectedYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    handleSelectMonth(nextMonth, nextYear);
  };

  const handleNextMonth = () => {
    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    handleSelectMonth(nextMonth, nextYear);
  };

  const handleResetToCurrentMonth = () => {
    const curDate = new Date();
    handleSelectMonth(curDate.getMonth(), curDate.getFullYear());
  };

  // Quick day count presets
  const handleApplyCalendarDays = () => {
    const { counts } = calculateCalendarDays(selectedYear, selectedMonth);
    setDaysInMonth(counts);
  };

  const handleApplyWeekdaysOnly = () => {
    const { counts } = calculateCalendarDays(selectedYear, selectedMonth);
    setDaysInMonth({
      ...counts,
      'Sabtu': 0,
      'Minggu': 0
    });
  };

  const handleApplyMonToSat = () => {
    const { counts } = calculateCalendarDays(selectedYear, selectedMonth);
    setDaysInMonth({
      ...counts,
      'Minggu': 0
    });
  };

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<BillingInfo | null>(null);
  const [studentForCorrection, setStudentForCorrection] = useState<BillingInfo | null>(null);

  // Persistent corrections per billingPeriod and childId
  const [corrections, setCorrections] = useState<{ [period: string]: { [childId: string]: ChildBillingCorrection } }>(() => {
    try {
      const saved = localStorage.getItem('billingCorrections');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleSaveCorrection = (childId: string, newCorrection: ChildBillingCorrection) => {
    setCorrections(prev => {
      const updated = {
        ...prev,
        [billingPeriod]: {
          ...(prev[billingPeriod] || {}),
          [childId]: newCorrection
        }
      };
      try {
        localStorage.setItem('billingCorrections', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save billing corrections', e);
      }
      return updated;
    });
  };

  const handleDeleteCorrection = (childId: string) => {
    setCorrections(prev => {
      const periodCorrections = { ...(prev[billingPeriod] || {}) };
      delete periodCorrections[childId];
      const updated = {
        ...prev,
        [billingPeriod]: periodCorrections
      };
      try {
        localStorage.setItem('billingCorrections', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete billing correction', e);
      }
      return updated;
    });
  };

  const handleDayCountChange = (day: string, value: string) => {
    const count = parseInt(value, 10);
    setDaysInMonth(prev => ({
      ...prev,
      [day]: isNaN(count) || count < 0 ? 0 : count,
    }));
  };
  
  const billingData = useMemo<BillingInfo[]>(() => {
    if (!allChildren || therapyTypes.length === 0) return [];
    
    const periodCorrections = corrections[billingPeriod] || {};

    return allChildren.map(child => {
      const sessionDetails: { [key: string]: { count: number; name: string; } } = {};
      let totalSessions = 0;
      let originalBill = 0;

      if (child.recurringSessions) {
          child.recurringSessions.forEach(session => {
              const dayName = session.day;
              const occurrences = daysInMonth[dayName] || 0;
              if (occurrences > 0) {
                  const therapyName = therapyTypes.find(t => t.id === session.type)?.name || session.type;
                  
                  if (!sessionDetails[session.type]) {
                      sessionDetails[session.type] = { count: 0, name: therapyName };
                  }
                  sessionDetails[session.type].count += occurrences;

                  totalSessions += occurrences;
                  originalBill += occurrences * (therapyCosts[session.type] || 0);
              }
          });
      }
      
      const paymentStatus = child.paymentHistory?.[billingPeriod] || 'Belum Lunas';

      // Load correction for this student in this period
      const savedCorrection = periodCorrections[child.id];
      let correction: ChildBillingCorrection = {
        sessionCorrections: {},
        manualAmount: 0,
        totalCorrectionAmount: 0,
        notes: ''
      };

      if (savedCorrection) {
        // Re-calculate session deduction using current therapyCosts to guarantee accuracy to therapy fees
        const sessionDeduction = Object.entries(savedCorrection.sessionCorrections || {}).reduce((sum: number, [typeId, count]: [string, number]) => {
          return sum + ((Number(count) || 0) * (therapyCosts[typeId] || 0));
        }, 0);
        const manualAmount = Number(savedCorrection.manualAmount) || 0;
        const totalCorrectionAmount = sessionDeduction + manualAmount;
        correction = {
          sessionCorrections: savedCorrection.sessionCorrections || {},
          manualAmount,
          totalCorrectionAmount,
          notes: savedCorrection.notes || ''
        };
      }

      const totalBill = Math.max(0, originalBill - correction.totalCorrectionAmount);

      const billingInfo: BillingInfo = {
        childId: child.id,
        childName: child.name,
        photoUrl: child.photoUrl,
        sessionDetails,
        totalSessions,
        originalBill,
        correction,
        totalBill,
        paymentStatus,
      };
      return billingInfo;
    }).filter(data => data.totalSessions > 0)
     .sort((a, b) => a.childName.localeCompare(b.childName));
    
  }, [allChildren, therapyTypes, daysInMonth, billingPeriod, therapyCosts, corrections]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    let totalGrossBill = 0;
    let totalCorrection = 0;
    let totalNetBill = 0;
    let totalStudentsWithCorrection = 0;
    let totalSessions = 0;

    billingData.forEach(student => {
      totalGrossBill += student.originalBill;
      totalCorrection += student.correction.totalCorrectionAmount;
      totalNetBill += student.totalBill;
      totalSessions += student.totalSessions;
      if (student.correction.totalCorrectionAmount > 0) {
        totalStudentsWithCorrection += 1;
      }
    });

    return {
      totalGrossBill,
      totalCorrection,
      totalNetBill,
      totalStudentsWithCorrection,
      totalSessions,
      totalStudents: billingData.length
    };
  }, [billingData]);

  const handlePrintInvoice = (studentData: BillingInfo) => {
    setSelectedStudent(studentData);
    setInvoiceModalOpen(true);
  };

  const handleOpenCorrection = (studentData: BillingInfo) => {
    if (userRole === 'siswa') return;
    setStudentForCorrection(studentData);
    setCorrectionModalOpen(true);
  };
  
  return (
    <>
      <InvoiceModal 
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        studentData={selectedStudent}
        billingPeriod={billingPeriod}
        logoUrl={logoUrl}
        therapyCosts={therapyCosts}
      />
      <PrintSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        allBillingData={billingData}
        billingPeriod={billingPeriod}
        therapyTypes={therapyTypes}
        logoUrl={logoUrl}
        therapyCosts={therapyCosts}
      />
      <RateSettingsModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        costs={therapyCosts}
        onSave={onUpdateCost}
        therapyTypes={therapyTypes}
      />
      <StudentCorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        student={studentForCorrection}
        therapyTypes={therapyTypes}
        therapyCosts={therapyCosts}
        onSave={handleSaveCorrection}
        onDelete={handleDeleteCorrection}
      />
      <main className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-primary" />
                    Tagihan & Proyeksi
                  </h1>
                  <p className="text-sm text-muted mt-1">
                    Hitung dan kelola tagihan siswa dengan sistem koreksi manual otomatis sesuai tarif biaya terapi.
                  </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Month & Year Quick Selector Bar */}
                  <div className="flex items-center bg-surface border border-surface-light rounded-xl p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={handlePreviousMonth}
                        className="p-1.5 hover:bg-surface-light text-muted hover:text-white rounded-lg transition"
                        title="Bulan Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 px-1">
                        <Calendar className="w-4 h-4 text-primary ml-1 mr-0.5" />
                        <select
                          value={selectedMonth}
                          onChange={(e) => handleSelectMonth(Number(e.target.value), selectedYear)}
                          className="bg-transparent text-white font-bold text-xs py-1 px-1.5 focus:outline-none cursor-pointer"
                        >
                          {INDONESIAN_MONTHS.map((mName, idx) => (
                            <option key={mName} value={idx} className="bg-surface text-white">
                              {mName}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedYear}
                          onChange={(e) => handleSelectYear(Number(e.target.value))}
                          className="bg-transparent text-slate-300 font-bold text-xs py-1 px-1.5 focus:outline-none cursor-pointer"
                        >
                          {[2024, 2025, 2026, 2027, 2028].map(y => (
                            <option key={y} value={y} className="bg-surface text-white">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-surface-light text-muted hover:text-white rounded-lg transition"
                        title="Bulan Berikutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToCurrentMonth}
                        className="text-[10px] font-bold px-2 py-1 bg-surface-light hover:bg-surface-light/80 text-muted hover:text-white rounded-lg transition ml-1"
                        title="Kembali ke bulan saat ini"
                      >
                        Bulan Ini
                      </button>
                  </div>

                  {/* Text Periode display / custom rename */}
                  <div className="flex items-center gap-1.5 bg-surface border border-surface-light rounded-xl px-3 py-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase">Periode:</span>
                      {userRole === 'siswa' ? (
                        <span className="text-xs font-bold text-white px-2 py-0.5">{billingPeriod}</span>
                      ) : (
                        <input
                            type="text"
                            value={billingPeriod}
                            onChange={(e) => {
                              setBillingPeriod(e.target.value);
                              setIsCustomPeriodName(true);
                            }}
                            className="bg-surface-light border border-surface-light/50 text-white placeholder-muted text-xs rounded-lg focus:ring-primary focus:border-primary px-2.5 py-1 font-bold w-48 transition"
                            title="Ubah teks nama periode jika diperlukan"
                        />
                      )}
                  </div>

                  {userRole === 'admin' && (
                    <button
                        onClick={() => setRateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Atur Tarif
                    </button>
                  )}
                  {userRole !== 'siswa' && (
                    <button
                      onClick={() => setSummaryModalOpen(true)}
                      className="flex items-center gap-2 bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 transition-colors px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                      disabled={billingData.length === 0}
                    >
                      <PrintIcon className="w-4 h-4" />
                      Cetak Laporan Rekap
                    </button>
                  )}
              </div>
          </div>

          {/* Quick Summary Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-surface-light rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Tagihan Awal</p>
              <p className="text-xl font-extrabold text-white mt-1">{formatCurrency(summaryStats.totalGrossBill)}</p>
              <p className="text-[11px] text-muted mt-0.5">{summaryStats.totalSessions} sesi dari {summaryStats.totalStudents} siswa</p>
            </div>

            <div className="bg-surface border border-rose-500/20 rounded-2xl p-4 bg-rose-500/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Total Pengurangan Koreksi</p>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xl font-extrabold text-rose-400 mt-1">
                {summaryStats.totalCorrection > 0 ? `-${formatCurrency(summaryStats.totalCorrection)}` : 'Rp 0'}
              </p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                {summaryStats.totalStudentsWithCorrection} siswa disesuaikan
              </p>
            </div>

            <div className="bg-surface border border-emerald-500/20 rounded-2xl p-4 bg-emerald-500/5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Tagihan Bersih (Netto)</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(summaryStats.totalNetBill)}</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">Setelah dikurangi seluruh koreksi</p>
            </div>

            <div className="bg-surface border border-surface-light rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Rata-rata Tagihan / Siswa</p>
              <p className="text-xl font-extrabold text-primary mt-1">
                {formatCurrency(summaryStats.totalStudents > 0 ? summaryStats.totalNetBill / summaryStats.totalStudents : 0)}
              </p>
              <p className="text-[11px] text-muted mt-0.5">{billingPeriod}</p>
            </div>
          </div>
          
          {userRole === 'admin' && (
            <div className="bg-surface border border-surface-light rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-light/60">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Konfigurasi Jumlah Hari dalam Periode Tagihan
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                            Otomatis disinkronkan dengan kalender bulan <span className="text-white font-semibold">{INDONESIAN_MONTHS[selectedMonth]} {selectedYear}</span> ({calendarStats.totalDays} hari kalender).
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleApplyCalendarDays}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition"
                            title="Reset hitungan ke seluruh hari kalender bulan ini"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Hitung Kalender Penuh
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyWeekdaysOnly}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-light hover:bg-surface-light/80 text-slate-300 border border-surface-light/60 rounded-xl text-xs font-medium transition"
                            title="Senin sampai Jumat sesuai kalender, Sabtu & Minggu = 0"
                        >
                            Senin - Jumat Saja
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyMonToSat}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-light hover:bg-surface-light/80 text-slate-300 border border-surface-light/60 rounded-xl text-xs font-medium transition"
                            title="Senin sampai Sabtu sesuai kalender, Minggu = 0"
                        >
                            Senin - Sabtu
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {daysOfWeek.map(day => {
                        const currentCount = daysInMonth[day] || 0;
                        const calendarCount = calendarStats.counts[day] || 0;
                        const isDifferent = currentCount !== calendarCount;

                        return (
                            <div 
                                key={day} 
                                className={`rounded-xl p-3 border transition-all ${
                                    isDifferent 
                                        ? 'bg-amber-500/10 border-amber-500/30' 
                                        : currentCount > 0 
                                        ? 'bg-background/50 border-surface-light' 
                                        : 'bg-background/20 border-surface-light/40 opacity-70'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-white uppercase">{day}</span>
                                    <span className="text-[10px] text-muted font-mono" title={`Muncul ${calendarCount} kali pada kalender ${INDONESIAN_MONTHS[selectedMonth]} ${selectedYear}`}>
                                        Kal: {calendarCount}x
                                    </span>
                                </div>

                                <div className="flex items-center bg-surface-light border border-surface-light/60 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => handleDayCountChange(day, String(Math.max(0, currentCount - 1)))}
                                        className="p-1 hover:bg-surface text-muted hover:text-white transition"
                                        title="Kurangi 1 hari"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        type="number"
                                        id={`day-count-${day}`}
                                        value={currentCount}
                                        onChange={(e) => handleDayCountChange(day, e.target.value)}
                                        min="0"
                                        className="w-full bg-transparent text-white text-center text-sm font-black focus:outline-none p-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDayCountChange(day, String(currentCount + 1))}
                                        className="p-1 hover:bg-surface text-muted hover:text-white transition"
                                        title="Tambah 1 hari"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="mt-1.5 text-center">
                                    {isDifferent ? (
                                        <span className="text-[10px] font-semibold text-amber-400">
                                            {currentCount === 0 ? 'Diliburkan (0x)' : `Manual (${currentCount}x)`}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-emerald-400 font-medium">
                                            Sesuai Kalender
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-surface-light/40">
                    <span>
                        Total hari operasional yang dikonfigurasi: <strong className="text-white font-mono">{totalConfiguredDays} hari</strong>
                    </span>
                    <span className="italic">
                        * Angka hari dapat diubah secara manual jika terdapat tanggal merah atau cuti bersama di bulan ini.
                    </span>
                </div>
            </div>
          )}

          {/* Therapy Rates Indicator */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {therapyTypes.map(type => (
                  <div key={type.id} className="bg-surface border border-surface-light rounded-xl p-3 text-center">
                      <p className="text-xs font-bold text-muted truncate">{type.name}</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(therapyCosts[type.id] || 0)}</p>
                  </div>
              ))}
          </div>

          {/* Main Billing Table */}
          <div className="bg-surface border border-surface-light rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-light">
                <thead className="bg-background/60">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-muted uppercase tracking-wider">Nama Siswa</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-muted uppercase tracking-wider">Rincian Sesi (Terjadwal)</th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-black text-muted uppercase tracking-wider">Total Sesi</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-muted uppercase tracking-wider">Tagihan Awal</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-black text-rose-400 uppercase tracking-wider">Koreksi</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-emerald-400 uppercase tracking-wider">Total Tagihan (Netto)</th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-black text-muted uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-black text-muted uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-surface-light">
                  {billingData.length > 0 ? billingData.map(data => {
                    const hasCorrection = data.correction && data.correction.totalCorrectionAmount > 0;
                    return (
                      <tr key={data.childId} className="hover:bg-surface-light/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="h-10 w-10 rounded-full object-cover ring-2 ring-surface-light shrink-0" src={data.photoUrl} alt={data.childName} />
                                <div className="ml-3 overflow-hidden">
                                    <div className="text-sm font-bold text-white uppercase truncate">{data.childName}</div>
                                    <div className="text-xs text-muted font-mono">{data.childId}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            <div className="flex flex-col gap-1">
                                {Object.entries(data.sessionDetails).map(([typeId, detail]) => {
                                    const d = detail as { count: number; name: string; };
                                    return (
                                        <div key={typeId} className="text-xs flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-200">{d.name}:</span>
                                            <span className="text-muted font-mono">{d.count} sesi</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-white font-mono">
                          {data.totalSessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-slate-300 font-mono">
                          {formatCurrency(data.originalBill)}
                        </td>
                        
                        {/* Koreksi Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {userRole === 'siswa' ? (
                            hasCorrection ? (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-xs shadow-sm">
                                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                  <span>-{formatCurrency(data.correction.totalCorrectionAmount)}</span>
                                </span>
                                {data.correction.notes && (
                                  <span className="text-[10px] text-muted truncate max-w-[150px] mt-1 italic">
                                    {data.correction.notes}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted font-medium">-</span>
                            )
                          ) : hasCorrection ? (
                            <div className="flex flex-col items-center">
                              <button
                                onClick={() => handleOpenCorrection(data)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all font-bold text-xs shadow-sm"
                                title="Klik untuk mengubah rincian koreksi"
                              >
                                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                <span>-{formatCurrency(data.correction.totalCorrectionAmount)}</span>
                                <Edit3 className="w-3 h-3 ml-0.5 opacity-70" />
                              </button>
                              {data.correction.notes && (
                                <span className="text-[10px] text-muted truncate max-w-[150px] mt-1 italic" title={data.correction.notes}>
                                  {data.correction.notes}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenCorrection(data)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-surface-light/40 hover:bg-surface-light text-muted hover:text-white transition-all text-xs border border-surface-light/60"
                              title="Tambah koreksi sesi atau potongan manual"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Koreksi</span>
                            </button>
                          )}
                        </td>

                        {/* Total Tagihan (Netto) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            {formatCurrency(data.totalBill)}
                          </div>
                          {hasCorrection && (
                            <span className="text-[10px] font-bold text-rose-400/80 block mt-0.5">
                              Berkurang {formatCurrency(data.correction.totalCorrectionAmount)}
                            </span>
                          )}
                        </td>

                        {/* Status Pembayaran */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {userRole === 'admin' ? (
                            <button
                              onClick={() => onUpdatePaymentStatus(data.childId, billingPeriod, data.paymentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas')}
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer transition-transform hover:scale-105 ${data.paymentStatus === 'Lunas' ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}
                            >
                              {data.paymentStatus}
                            </button>
                          ) : (
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${data.paymentStatus === 'Lunas' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                              {data.paymentStatus}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handlePrintInvoice(data)}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                              title="Cetak Faktur / Kwitansi Siswa"
                            >
                              <PrintIcon className="w-3.5 h-3.5"/>
                              Faktur
                            </button>
                            {userRole !== 'siswa' && (
                              <button
                                onClick={() => handleOpenCorrection(data)}
                                className="p-1.5 bg-surface-light/50 hover:bg-surface-light text-muted hover:text-white rounded-lg transition-colors"
                                title="Atur Koreksi Biaya"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                      <tr>
                          <td colSpan={8} className="text-center py-12 text-muted">
                              <AlertCircle className="w-8 h-8 text-muted/40 mx-auto mb-2" />
                              <p className="text-sm font-semibold">Tidak ada data tagihan untuk konfigurasi yang dipilih.</p>
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

export default BillingPage;
