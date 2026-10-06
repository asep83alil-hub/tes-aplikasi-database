import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { AcademicYear, FinancialRecord, ExpenseDetail } from '../types';
import { formatCurrency } from './BillingPage';
import { exportPagesToPdf, triggerBrowserA4Print } from '../utils/rapotPdfGenerator';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Search, 
  PieChart as PieChartIcon, 
  Layers, 
  Save, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Receipt, 
  Check, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Calculator,
  LineChart as LineChartIcon,
  BarChart3,
  CalendarRange
} from 'lucide-react';

const expenseCategories = [
  "Gaji Terapis", 
  "Biaya Operasional", 
  "Pembelian APE", 
  "Listrik & Air", 
  "Sewa & Pemeliharaan", 
  "Lain-lain"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Gaji Terapis": "#6366f1", // Indigo
  "Biaya Operasional": "#0ea5e9", // Sky
  "Pembelian APE": "#f59e0b", // Amber
  "Listrik & Air": "#10b981", // Emerald
  "Sewa & Pemeliharaan": "#ec4899", // Pink
  "Lain-lain": "#8b5cf6" // Violet
};

// --- Modal Rincian Pengeluaran ---
interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: FinancialRecord) => void;
  record: FinancialRecord | null;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ isOpen, onClose, onSave, record }) => {
  const [details, setDetails] = useState<ExpenseDetail[]>([]);
  const [newDetail, setNewDetail] = useState({ category: expenseCategories[0], description: '', amount: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setDetails(record?.expenseDetails ? JSON.parse(JSON.stringify(record.expenseDetails)) : []);
    setEditingId(null);
    setNewDetail({ category: expenseCategories[0], description: '', amount: '' });
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDetail(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetail.description.trim() || !newDetail.amount) {
      alert('Deskripsi pengeluaran dan jumlah nominal wajib diisi.');
      return;
    }

    const amountValue = parseInt(newDetail.amount.replace(/\D/g, ''), 10) || 0;
    if (amountValue <= 0) {
      alert('Nominal pengeluaran harus lebih besar dari 0.');
      return;
    }

    if (editingId) {
      setDetails(prev => prev.map(d => d.id === editingId ? { ...d, ...newDetail, amount: amountValue } : d));
      setEditingId(null);
    } else {
      const newEntry: ExpenseDetail = {
        id: `exp-${Date.now()}`,
        category: newDetail.category,
        description: newDetail.description.trim(),
        amount: amountValue,
      };
      setDetails(prev => [...prev, newEntry]);
    }
    setNewDetail({ category: newDetail.category, description: '', amount: '' });
  };

  const handleEditDetail = (detail: ExpenseDetail) => {
    setNewDetail({
      category: detail.category,
      description: detail.description,
      amount: new Intl.NumberFormat('id-ID').format(detail.amount)
    });
    setEditingId(detail.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewDetail({ category: expenseCategories[0], description: '', amount: '' });
  };

  const handleDeleteDetail = (id: string) => {
    if (window.confirm('Yakin ingin menghapus item pengeluaran ini?')) {
      setDetails(details.filter(d => d.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleSave = () => {
    const totalExpense = details.reduce((sum, d) => sum + d.amount, 0);
    onSave({ ...record, expense: totalExpense, expenseDetails: details });
  };

  const total = details.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Rincian Pengeluaran</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Bulan {record.month}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Kelola pos biaya dan rincian alokasi anggaran operasional</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Strip */}
        <div className="px-6 py-3.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Akumulasi Beban Bulan Ini</span>
          <span className="text-lg font-black text-rose-400 font-mono">{formatCurrency(total)}</span>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 flex-grow overflow-y-auto space-y-6 custom-scrollbar">
          {/* Form Tambah/Edit */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>{editingId ? 'Edit Pos Pengeluaran' : 'Tambah Pos Pengeluaran Baru'}</span>
            </h4>
            <form onSubmit={handleAddOrUpdateDetail} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Kategori Pengeluaran
                  </label>
                  <input 
                    list="category-options" 
                    name="category" 
                    value={newDetail.category} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Pilih atau ketik kategori"
                  />
                  <datalist id="category-options">
                    {expenseCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Nominal Biaya (IDR)
                  </label>
                  <input 
                    type="text" 
                    name="amount" 
                    value={newDetail.amount} 
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setNewDetail(p => ({
                        ...p, 
                        amount: raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw, 10)) : ''
                      }));
                    }} 
                    placeholder="Contoh: 1.500.000"
                    className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs font-mono rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Deskripsi / Keterangan Transaksi
                </label>
                <input 
                  type="text" 
                  name="description" 
                  value={newDetail.description} 
                  onChange={handleInputChange} 
                  placeholder="Contoh: Honor lembur terapis & konsumsi rapat klinis"
                  className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`px-5 py-2 font-bold text-xs rounded-xl text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                    editingId 
                      ? 'bg-amber-600 hover:bg-amber-500' 
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {editingId ? 'Perbarui Item' : '+ Tambahkan ke Rincian'}
                </button>
              </div>
            </form>
          </div>

          {/* Table of Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Daftar Pos Pengeluaran ({details.length})
              </h4>
              <span className="text-[11px] text-slate-500">Klik icon untuk edit atau hapus item</span>
            </div>

            <div className="space-y-2">
              {details.length > 0 ? (
                details.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      editingId === item.id 
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" 
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8' }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-snug">{item.description}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500 font-mono text-[10px]">Pos #{idx + 1}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        {formatCurrency(item.amount)}
                      </span>
                      <button 
                        onClick={() => handleEditDetail(item)} 
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDetail(item.id)} 
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500">Belum ada rincian pengeluaran untuk bulan ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Rincian Pengeluaran</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Modal Tambah Tahun Ajaran ---
interface AddYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (yearLabel: string) => void;
}

const AddYearModal: React.FC<AddYearModalProps> = ({ isOpen, onClose, onSave }) => {
  const [yearLabel, setYearLabel] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!/^\d{4}\/\d{4}$/.test(yearLabel.trim())) {
      alert('Format tahun ajaran harus YYYY/YYYY (contoh: 2026/2027)');
      return;
    }
    onSave(yearLabel.trim());
    setYearLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tambah Tahun Ajaran</h3>
              <p className="text-xs text-slate-400">Periode pembukuan anggaran baru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Tahun Ajaran Baru</label>
            <input 
              type="text" 
              value={yearLabel} 
              onChange={e => setYearLabel(e.target.value)} 
              placeholder="Contoh: 2027/2028"
              className="bg-slate-950 border border-slate-700 text-white text-sm rounded-xl block w-full p-3 font-mono outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">Gunakan format 4 digit tahun garis miring 4 digit tahun.</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-2.5">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            onClick={handleSave} 
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition active:scale-95 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Simpan Periode
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Modal Pratinjau Dokumen Cetak & PDF Resmi A4 ---
interface FinancialPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FinancialRecord[];
  academicYearLabel: string;
  logoUrl: string;
}

const FinancialPrintModal: React.FC<FinancialPrintModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  academicYearLabel, 
  logoUrl 
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalIncome = data.reduce((sum, record) => sum + record.income, 0);
  const totalExpense = data.reduce((sum, record) => sum + record.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const netMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : '0';

  const fileName = `Laporan-Keuangan-Pelangi-Lazuardi-${academicYearLabel.replace('/', '-')}.pdf`;

  const handlePrint = () => {
    triggerBrowserA4Print(fileName);
  };

  const handleDownloadPdf = async () => {
    if (!printContainerRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const pageSheets = printContainerRef.current.querySelectorAll<HTMLElement>('.a4-sheet');
      if (!pageSheets || pageSheets.length === 0) {
        throw new Error('Tidak ada lembar A4 yang terdeteksi.');
      }
      await exportPagesToPdf(Array.from(pageSheets), fileName);
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Gunakan opsi Cetak (A4) dan pilih "Simpan sebagai PDF" di dialog browser.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden animate-fade-in print:bg-white print:p-0 print:m-0 print:static print:overflow-visible">
      {/* Top Toolbar */}
      <header className="no-print w-full bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg text-white z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs font-serif">
            A4
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Laporan Keuangan Tahunan Resmi</h2>
            <p className="text-[11px] text-slate-400">
              Tahun Ajaran {academicYearLabel} • Format A4 Portrait (210×297 mm)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
            <button 
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))} 
              className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(0.85)} 
              className="text-[10px] text-slate-400 hover:text-white px-1 border-l border-slate-700 cursor-pointer"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Cetak (A4)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Membuat PDF...' : 'Unduh PDF (A4)'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sheet Container */}
      <div className="flex-1 w-full overflow-y-auto p-8 flex flex-col items-center custom-scrollbar print:p-0 print:m-0 print:overflow-visible">
        <div 
          ref={printContainerRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200 flex flex-col gap-10 items-center print:transform-none print:m-0 print:p-0 print:gap-0"
        >
          <div className="a4-sheet therapy-print-sheet a4-print-page w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[10mm_12mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-between select-text overflow-hidden print:shadow-none print:m-0">
            {/* Kop Surat Resmi */}
            <div>
              <div className="border-b-2 border-indigo-900/40 pb-3 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={logoUrl} 
                    alt="Logo Pelangi Lazuardi" 
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div>
                    <h1 className="text-base font-black text-slate-900 uppercase tracking-tight font-serif">
                      Pelangi Lazuardi
                    </h1>
                    <p className="text-indigo-900 text-[10px] font-black tracking-widest uppercase">
                      Lazuardi Therapy & Growth Center • Tata Kelola Finansial
                    </p>
                    <p className="text-slate-500 text-[8.5px] mt-0.5">
                      Jl. Garuda Ujung No.35, Limo, Kota Depok • Telp: (021) 1234567 • www.lazuardi.sch.id
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 text-[9px] font-black rounded uppercase font-mono">
                    FIN-AUDIT/{academicYearLabel.replace('/', '-')}/01
                  </span>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">
                    Tgl Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Title & Period Banner */}
              <div className="mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-serif">
                    Laporan Arus Kas & Laba Rugi Operasional Tahunan
                  </h2>
                  <p className="text-[10px] text-indigo-900 font-bold uppercase tracking-wide mt-0.5">
                    Periode Tahun Ajaran: {academicYearLabel}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <span>Mata Uang: <strong>Indonesian Rupiah (IDR)</strong></span>
                </div>
              </div>

              {/* Executive Summary Cards in Print */}
              <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Total Pemasukan</p>
                  <p className="text-xs font-black text-emerald-700 font-mono mt-0.5">{formatCurrency(totalIncome)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Total Pengeluaran</p>
                  <p className="text-xs font-black text-rose-700 font-mono mt-0.5">{formatCurrency(totalExpense)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Surplus / (Defisit)</p>
                  <p className={`text-xs font-black font-mono mt-0.5 ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(totalProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Operating Margin</p>
                  <p className={`text-xs font-black font-mono mt-0.5 ${Number(netMargin) >= 0 ? 'text-indigo-900' : 'text-rose-700'}`}>
                    {netMargin}%
                  </p>
                </div>
              </div>

              {/* Financial Ledger Table */}
              <table className="w-full border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left w-24">Bulan</th>
                    <th className="border border-slate-300 p-2 text-right">Pemasukan (IDR)</th>
                    <th className="border border-slate-300 p-2 text-right">Pengeluaran (IDR)</th>
                    <th className="border border-slate-300 p-2 text-right">Laba / (Rugi)</th>
                    <th className="border border-slate-300 p-2 text-left text-[9px] w-48">Rincian Pos Pengeluaran</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record, idx) => {
                    const profit = record.income - record.expense;
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="border border-slate-300 p-1.5 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-bold text-slate-900">{record.month}</td>
                        <td className="border border-slate-300 p-1.5 text-right font-mono font-medium text-emerald-700">
                          {formatCurrency(record.income)}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-right font-mono font-medium text-rose-700">
                          {formatCurrency(record.expense)}
                        </td>
                        <td className={`border border-slate-300 p-1.5 text-right font-mono font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrency(profit)}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-[8.5px] text-slate-600 align-top">
                          {record.expenseDetails && record.expenseDetails.length > 0 ? (
                            <div className="space-y-0.5">
                              {record.expenseDetails.slice(0, 3).map((d, dIdx) => (
                                <div key={dIdx} className="flex justify-between gap-1 leading-tight">
                                  <span className="truncate max-w-[120px] font-medium">{d.category}:</span>
                                  <span className="font-mono text-slate-700">{formatCurrency(d.amount)}</span>
                                </div>
                              ))}
                              {record.expenseDetails.length > 3 && (
                                <span className="text-[8px] text-slate-400 italic">+{record.expenseDetails.length - 3} pos lainnya</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                    <td colSpan={2} className="border border-slate-300 p-2 text-center uppercase tracking-wider">
                      Total Akumulasi
                    </td>
                    <td className="border border-slate-300 p-2 text-right text-emerald-800 font-mono">
                      {formatCurrency(totalIncome)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right text-rose-800 font-mono">
                      {formatCurrency(totalExpense)}
                    </td>
                    <td className={`border border-slate-300 p-2 text-right font-mono ${totalProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {formatCurrency(totalProfit)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center text-[9px] text-indigo-900 uppercase">
                      Margin Bersih: {netMargin}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Signatures */}
            <div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-12 text-center text-[10px]">
                  <div>
                    <p className="text-slate-500 uppercase text-[8.5px] font-bold">Mengetahui & Menyetujui,</p>
                    <p className="font-black text-slate-800 mt-0.5 uppercase">Pimpinan Pelangi Lazuardi</p>
                    <div className="h-16"></div>
                    <div className="w-44 h-px bg-slate-400 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900 uppercase">Dra. Hj. Nurul Aini</p>
                    <p className="text-[8.5px] text-slate-500">Direktur Eksekutif</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase text-[8.5px] font-bold">Diverifikasi & Dibuat Oleh,</p>
                    <p className="font-black text-slate-800 mt-0.5 uppercase">Administrasi Keuangan</p>
                    <div className="h-16"></div>
                    <div className="w-44 h-px bg-slate-400 mx-auto mb-1"></div>
                    <p className="font-bold text-slate-900 uppercase">Fajar Nugraha, S.E.</p>
                    <p className="text-[8.5px] text-slate-500">Staff Keuangan & Kasir</p>
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 mt-4">
                <span>Dokumen Resmi Laporan Keuangan • Pelangi Lazuardi</span>
                <span>Standar Format A4 Portrait (210×297 mm) • Halaman 1 dari 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Custom Recharts Tooltip: Bulanan ---
const CustomFinancialTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const net = inc - exp;

    return (
      <div className="p-3.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[190px]">
        <p className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">Arus Kas</span>
        </p>
        <div className="flex justify-between items-center text-emerald-400 font-mono">
          <span className="text-[11px] text-slate-300">Pemasukan:</span>
          <span className="font-bold">{formatCurrency(inc)}</span>
        </div>
        <div className="flex justify-between items-center text-rose-400 font-mono">
          <span className="text-[11px] text-slate-300">Pengeluaran:</span>
          <span className="font-bold">{formatCurrency(exp)}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-slate-800 font-mono">
          <span className="text-[11px] text-slate-300">Net Surplus:</span>
          <span className={`font-bold ${net >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Recharts Tooltip: Multi-Tahun ---
const CustomMultiYearTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl text-xs space-y-2 min-w-[240px]">
        <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span className="font-bold text-white text-sm font-serif">Tahun Ajaran {data.yearLabel}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
            data.status === 'Surplus' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {data.status}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Pemasukan:</span>
            <span className="font-bold text-emerald-400">{formatCurrency(data.income)}</span>
          </div>
          {data.incomeGrowthPct !== null && (
            <div className="flex justify-between items-center text-[10px] text-slate-400 pl-2">
              <span>Pertumbuhan vs Lalu:</span>
              <span className={`font-bold ${data.incomeGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.incomeGrowthPct >= 0 ? `+${data.incomeGrowthPct}% (Naik)` : `${data.incomeGrowthPct}% (Turun)`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-300">Total Pengeluaran:</span>
            <span className="font-bold text-rose-400">{formatCurrency(data.expense)}</span>
          </div>
          {data.expenseGrowthPct !== null && (
            <div className="flex justify-between items-center text-[10px] text-slate-400 pl-2">
              <span>Perubahan Beban:</span>
              <span className={`font-bold ${data.expenseGrowthPct <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.expenseGrowthPct >= 0 ? `+${data.expenseGrowthPct}%` : `${data.expenseGrowthPct}%`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-200 font-bold">Surplus Bersih:</span>
            <span className={`font-black text-sm ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(data.netProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Margin Operasional:</span>
            <span className="font-bold text-indigo-300">{data.margin}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Main FinancialReportPage Component ---
interface FinancialReportPageProps {
  allData: { [key: string]: FinancialRecord[] };
  academicYears: AcademicYear[];
  onUpdateData: (academicYearId: string, updatedData: FinancialRecord[]) => void;
  onAddAcademicYear: (yearLabel: string) => void;
  logoUrl: string;
}

export const FinancialReportPage: React.FC<FinancialReportPageProps> = ({ 
  allData, 
  academicYears, 
  onUpdateData, 
  onAddAcademicYear, 
  logoUrl 
}) => {
  const [selectedYearId, setSelectedYearId] = useState<string>(academicYears[academicYears.length - 1]?.id || academicYears[0]?.id || '');
  const [editableData, setEditableData] = useState<FinancialRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'bukuBesar' | 'komparasiMultiTahun' | 'kategoriBeban' | 'analisisSemester'>('bukuBesar');
  const [searchMonth, setSearchMonth] = useState<string>('');
  
  // Multi-Year Chart Filter Mode: 'all' (Combo bars + line), 'delta' (YoY increase/decrease bars), 'growth' (YoY % line), 'profit' (Net profit trend)
  const [multiYearMetricMode, setMultiYearMetricMode] = useState<'all' | 'delta' | 'profit' | 'growth'>('all');
  
  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(null);
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  // Feedback Notification
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    setEditableData(JSON.parse(JSON.stringify(allData[selectedYearId] || [])));
  }, [selectedYearId, allData]);

  const handleIncomeChange = (index: number, value: string) => {
    const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
    const newData = [...editableData];
    newData[index] = { ...newData[index], income: numericValue };
    setEditableData(newData);
  };

  const triggerNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 3500);
  };

  const handleSaveChanges = () => {
    onUpdateData(selectedYearId, editableData);
    triggerNotification('Perubahan data keuangan berhasil disimpan ke sistem!');
  };

  const handleOpenDetailModal = (index: number) => {
    setSelectedRecordIndex(index);
    setIsDetailModalOpen(true);
  };

  const handleSaveDetails = (updatedRecord: FinancialRecord) => {
    if (selectedRecordIndex !== null) {
      const newData = [...editableData];
      newData[selectedRecordIndex] = updatedRecord;
      setEditableData(newData);
    }
    setIsDetailModalOpen(false);
    setSelectedRecordIndex(null);
    triggerNotification('Rincian pos pengeluaran berhasil diperbarui.');
  };

  const handleAddYear = (yearLabel: string) => {
    onAddAcademicYear(yearLabel);
    const parts = yearLabel.split('/');
    const id = `${parts[0]}-${parts[1]}`;
    setSelectedYearId(id);
    triggerNotification(`Tahun ajaran ${yearLabel} berhasil ditambahkan.`);
  };

  // Export to CSV function
  const handleExportCsv = () => {
    if (!editableData || editableData.length === 0) return;
    const headers = ['No', 'Bulan', 'Pemasukan (IDR)', 'Pengeluaran (IDR)', 'Laba/Rugi (IDR)', 'Status'];
    const rows = editableData.map((rec, i) => {
      const profit = rec.income - rec.expense;
      const status = profit >= 0 ? 'Surplus' : 'Defisit';
      return [
        i + 1,
        `"${rec.month}"`,
        rec.income,
        rec.expense,
        profit,
        `"${status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Keuangan-${selectedYearId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('Laporan keuangan berhasil diekspor ke file CSV!');
  };

  // Financial Statistics for Selected Active Year
  const summary = useMemo(() => {
    const totalIncome = editableData.reduce((sum, record) => sum + record.income, 0);
    const totalExpense = editableData.reduce((sum, record) => sum + record.expense, 0);
    const profitOrLoss = totalIncome - totalExpense;
    const netMargin = totalIncome > 0 ? ((profitOrLoss / totalIncome) * 100).toFixed(1) : '0';
    const avgMonthlyIncome = editableData.length > 0 ? Math.round(totalIncome / editableData.length) : 0;
    const avgMonthlyExpense = editableData.length > 0 ? Math.round(totalExpense / editableData.length) : 0;
    const avgMonthlyNet = editableData.length > 0 ? Math.round(profitOrLoss / editableData.length) : 0;

    return { 
      totalIncome, 
      totalExpense, 
      profitOrLoss, 
      netMargin,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlyNet
    };
  }, [editableData]);

  // Multi-Year Trend Analytics Computation
  const multiYearTrendData = useMemo(() => {
    return academicYears.map((year, index) => {
      const records = year.id === selectedYearId ? editableData : (allData[year.id] || []);
      const income = records.reduce((s, r) => s + r.income, 0);
      const expense = records.reduce((s, r) => s + r.expense, 0);
      const netProfit = income - expense;
      const margin = income > 0 ? Number(((netProfit / income) * 100).toFixed(1)) : 0;

      let incomeGrowthPct: number | null = null;
      let expenseGrowthPct: number | null = null;
      let profitGrowthPct: number | null = null;
      let incomeChangeNominal = 0;
      let expenseChangeNominal = 0;
      let profitChangeNominal = 0;

      if (index > 0) {
        const prevYear = academicYears[index - 1];
        const prevRecords = prevYear.id === selectedYearId ? editableData : (allData[prevYear.id] || []);
        const prevIncome = prevRecords.reduce((s, r) => s + r.income, 0);
        const prevExpense = prevRecords.reduce((s, r) => s + r.expense, 0);
        const prevNetProfit = prevIncome - prevExpense;

        incomeChangeNominal = income - prevIncome;
        expenseChangeNominal = expense - prevExpense;
        profitChangeNominal = netProfit - prevNetProfit;

        if (prevIncome > 0) {
          incomeGrowthPct = Number(((incomeChangeNominal / prevIncome) * 100).toFixed(1));
        }
        if (prevExpense > 0) {
          expenseGrowthPct = Number(((expenseChangeNominal / prevExpense) * 100).toFixed(1));
        }
        if (prevNetProfit !== 0) {
          profitGrowthPct = Number(((profitChangeNominal / Math.abs(prevNetProfit)) * 100).toFixed(1));
        }
      }

      return {
        yearId: year.id,
        yearLabel: year.label,
        income,
        expense,
        netProfit,
        margin,
        incomeChangeNominal,
        incomeGrowthPct,
        expenseChangeNominal,
        expenseGrowthPct,
        profitChangeNominal,
        profitGrowthPct,
        // formatted helpers
        incomeInMillions: Number((income / 1000000).toFixed(1)),
        expenseInMillions: Number((expense / 1000000).toFixed(1)),
        profitInMillions: Number((netProfit / 1000000).toFixed(1)),
        incomeDeltaInMillions: Number((incomeChangeNominal / 1000000).toFixed(1)),
        expenseDeltaInMillions: Number((expenseChangeNominal / 1000000).toFixed(1)),
        profitDeltaInMillions: Number((profitChangeNominal / 1000000).toFixed(1)),
        status: netProfit >= 0 ? ('Surplus' as const) : ('Defisit' as const)
      };
    });
  }, [academicYears, allData, selectedYearId, editableData]);

  // Expense Categories Aggregation
  const categoryBreakdown = useMemo(() => {
    const agg: Record<string, number> = {};
    editableData.forEach(monthRecord => {
      if (monthRecord.expenseDetails && monthRecord.expenseDetails.length > 0) {
        monthRecord.expenseDetails.forEach(d => {
          agg[d.category] = (agg[d.category] || 0) + d.amount;
        });
      } else if (monthRecord.expense > 0) {
        agg['Biaya Operasional'] = (agg['Biaya Operasional'] || 0) + monthRecord.expense;
      }
    });

    const totalExp = Object.values(agg).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(agg)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / totalExp) * 100).toFixed(1),
        color: CATEGORY_COLORS[name] || '#94a3b8'
      }))
      .sort((a, b) => b.value - a.value);
  }, [editableData]);

  // Filtered rows for search
  const filteredData = useMemo(() => {
    if (!searchMonth.trim()) return editableData;
    return editableData.filter(d => d.month.toLowerCase().includes(searchMonth.toLowerCase()));
  }, [editableData, searchMonth]);

  const selectedYearLabel = academicYears.find(y => y.id === selectedYearId)?.label || selectedYearId;

  return (
    <>
      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSave={handleSaveDetails}
        record={selectedRecordIndex !== null ? editableData[selectedRecordIndex] : null}
      />
      
      <AddYearModal 
        isOpen={isAddYearModalOpen}
        onClose={() => setIsAddYearModalOpen(false)}
        onSave={handleAddYear}
      />
      
      <FinancialPrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={editableData}
        academicYearLabel={selectedYearLabel}
        logoUrl={logoUrl}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {saveSuccessNotice && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-bold border border-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Top Header & Year Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Tata Kelola Finansial Lembaga
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">Tahun Ajaran {selectedYearLabel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Wallet className="w-6 h-6" />
              </span>
              Laporan Keuangan & Arus Kas
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Monitoring neraca pemasukan terapi, rincian beban operasional, serta komparasi peningkatan & penurunan keuangan antar-tahun ajaran.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <label htmlFor="year-picker" className="text-xs font-bold text-slate-400 px-2.5">
                Periode:
              </label>
              <select
                id="year-picker"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs rounded-xl px-3 py-2 border border-slate-700/80 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.label}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsAddYearModalOpen(true)}
                className="ml-1.5 p-2 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Tambah Tahun Ajaran Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Ekspor data keuangan ke format file CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            {/* Print Official Report */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              title="Pratinjau dan cetak laporan resmi berukuran A4"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>Cetak Laporan (A4)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NEW FEATURE: GRAFIK PENINGKATAN / PENURUNAN ANTAR-TAHUN  */}
        {/* ======================================================== */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Tren Pertumbuhan Multi-Tahun
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">Analisis Kinerja Antar-Periode ({academicYears.length} Tahun)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                <span>Grafik Komparasi Peningkatan & Penurunan Antar-Tahun</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Visualisasi dinamika pertumbuhan pendapatan, tren beban biaya operasional, dan eskalasi laba bersih dari tahun ke tahun.
              </p>
            </div>

            {/* Metric Mode Filter Buttons */}
            <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs shrink-0 gap-1">
              <button
                onClick={() => setMultiYearMetricMode('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  multiYearMetricMode === 'all' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pemasukan vs Beban
              </button>
              <button
                onClick={() => setMultiYearMetricMode('delta')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  multiYearMetricMode === 'delta' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grafik Kenaikan / Penurunan (YoY)
              </button>
              <button
                onClick={() => setMultiYearMetricMode('profit')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  multiYearMetricMode === 'profit' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tren Laba Bersih
              </button>
              <button
                onClick={() => setMultiYearMetricMode('growth')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  multiYearMetricMode === 'growth' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pertumbuhan YoY (%)
              </button>
            </div>
          </div>

          {/* Multi-Year Chart Canvas */}
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {multiYearMetricMode === 'all' ? (
                <ComposedChart data={multiYearTrendData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="yearLabel" 
                    tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomMultiYearTooltip />} />
                  <Legend 
                    wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} 
                  />
                  <Bar 
                    dataKey="income" 
                    name="Total Pemasukan" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={48} 
                  />
                  <Bar 
                    dataKey="expense" 
                    name="Total Pengeluaran" 
                    fill="#f43f5e" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={48} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    name="Surplus Bersih (Laba)" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    dot={{ fill: '#818cf8', r: 6, strokeWidth: 2, stroke: '#1e1b4b' }}
                    activeDot={{ r: 8 }}
                  />
                </ComposedChart>
              ) : multiYearMetricMode === 'delta' ? (
                <BarChart data={multiYearTrendData.slice(1)} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="yearLabel" 
                    tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val / 1000000).toFixed(0)} jt`} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                  <RechartsTooltip 
                    formatter={(val: any, name: any) => [
                      `${Number(val) >= 0 ? '+' : ''}${formatCurrency(Number(val))}`, 
                      name === 'incomeChangeNominal' ? 'Delta Pemasukan' : name === 'profitChangeNominal' ? 'Delta Laba Bersih' : 'Delta Pengeluaran'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                  <Bar 
                    dataKey="incomeChangeNominal" 
                    name="Peningkatan/Penurunan Pemasukan" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40} 
                  />
                  <Bar 
                    dataKey="expenseChangeNominal" 
                    name="Perubahan Beban Pengeluaran" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40} 
                  />
                  <Bar 
                    dataKey="profitChangeNominal" 
                    name="Kenaikan/Penurunan Laba Bersih" 
                    fill="#6366f1" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40} 
                  />
                </BarChart>
              ) : multiYearMetricMode === 'profit' ? (
                <AreaChart data={multiYearTrendData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="yearLabel" 
                    tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomMultiYearTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="netProfit" 
                    name="Surplus Bersih" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#profitGrad)" 
                    dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={multiYearTrendData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="yearLabel" 
                    tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `${val}%`} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    formatter={(val: any) => [`${val}%`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="incomeGrowthPct" 
                    name="% Pertumbuhan Pemasukan YoY" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenseGrowthPct" 
                    name="% Pertumbuhan Pengeluaran YoY" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    dot={{ fill: '#f43f5e', r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profitGrowthPct" 
                    name="% Pertumbuhan Laba YoY" 
                    stroke="#a855f7" 
                    strokeWidth={3} 
                    dot={{ fill: '#a855f7', r: 5 }} 
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Cards: Rincian Peningkatan / Penurunan per Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {multiYearTrendData.map((yearData, idx) => {
              const isFirstYear = idx === 0;
              const incGrowth = yearData.incomeGrowthPct;
              const isIncUp = incGrowth !== null && incGrowth >= 0;
              const profitGrowth = yearData.profitGrowthPct;
              const isProfitUp = profitGrowth !== null && profitGrowth >= 0;

              return (
                <div 
                  key={yearData.yearId} 
                  className={`bg-slate-950/70 border rounded-2xl p-4 transition-all ${
                    yearData.yearId === selectedYearId 
                      ? 'border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/30' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Tahun Ajaran</span>
                      <h4 className="text-sm font-black text-white font-serif">{yearData.yearLabel}</h4>
                    </div>
                    {yearData.yearId === selectedYearId ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Aktif Terpilih
                      </span>
                    ) : (
                      <button 
                        onClick={() => setSelectedYearId(yearData.yearId)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        Pilih Periode →
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Pemasukan */}
                    <div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Pemasukan:</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatCurrency(yearData.income)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] mt-0.5">
                        <span className="text-slate-500">Perubahan YoY:</span>
                        {isFirstYear ? (
                          <span className="text-slate-400 font-medium">Tahun Basis</span>
                        ) : (
                          <span className={`font-bold flex items-center gap-0.5 ${isIncUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isIncUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isIncUp ? `+${incGrowth}% Naik` : `${incGrowth}% Turun`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pengeluaran */}
                    <div className="pt-1.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Pengeluaran:</span>
                        <span className="font-bold text-rose-400 font-mono">{formatCurrency(yearData.expense)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] mt-0.5">
                        <span className="text-slate-500">Beban YoY:</span>
                        {isFirstYear ? (
                          <span className="text-slate-400 font-medium">Tahun Basis</span>
                        ) : (
                          <span className={`font-bold ${yearData.expenseGrowthPct! <= 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {yearData.expenseGrowthPct! >= 0 ? `+${yearData.expenseGrowthPct}%` : `${yearData.expenseGrowthPct}% (Efisien)`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Surplus Bersih */}
                    <div className="pt-1.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-semibold">Surplus Bersih:</span>
                        <span className="font-black font-mono text-indigo-300">{formatCurrency(yearData.netProfit)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] mt-0.5">
                        <span className="text-slate-500">Pertumbuhan Laba:</span>
                        {isFirstYear ? (
                          <span className="text-slate-400 font-medium">Tahun Basis</span>
                        ) : (
                          <span className={`font-bold ${isProfitUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfitUp ? `+${profitGrowth}% Peningkatan` : `${profitGrowth}% Penurunan`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NEW: Tabel Audit Analisis Peningkatan & Penurunan Antar-Tahun */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>Tabel Rekapitulasi Peningkatan & Penurunan Kinerja Antar-Tahun</span>
              </h4>
              <span className="text-[11px] text-slate-400">Diperbarui otomatis dari buku besar tiap tahun ajaran</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3 text-left">Tahun Ajaran</th>
                    <th className="px-4 py-3 text-right">Pemasukan & Kenaikan YoY</th>
                    <th className="px-4 py-3 text-right">Pengeluaran & Perubahan YoY</th>
                    <th className="px-4 py-3 text-right">Surplus Bersih & Delta</th>
                    <th className="px-4 py-3 text-center">Margin</th>
                    <th className="px-4 py-3 text-center">Dinamika Kinerja Lembaga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono text-[11px]">
                  {multiYearTrendData.map((row, idx) => {
                    const isBase = idx === 0;
                    const incUp = (row.incomeGrowthPct ?? 0) >= 0;
                    const profitUp = (row.profitGrowthPct ?? 0) >= 0;

                    return (
                      <tr key={row.yearId} className={`hover:bg-slate-800/40 transition-colors ${row.yearId === selectedYearId ? 'bg-indigo-950/20' : ''}`}>
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-white font-sans flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.yearId === selectedYearId ? 'bg-indigo-400 ring-2 ring-indigo-400/40' : 'bg-slate-600'}`} />
                          <span>Tahun {row.yearLabel}</span>
                          {row.yearId === selectedYearId && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-sans font-semibold">Aktif</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="font-bold text-emerald-400">{formatCurrency(row.income)}</div>
                          <div className="text-[10px]">
                            {isBase ? (
                              <span className="text-slate-500 font-sans">Tahun Acuan Basis</span>
                            ) : (
                              <span className={`font-semibold ${incUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {incUp ? '▲ +' : '▼ '}{formatCurrency(row.incomeChangeNominal)} ({row.incomeGrowthPct}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="font-bold text-rose-400">{formatCurrency(row.expense)}</div>
                          <div className="text-[10px]">
                            {isBase ? (
                              <span className="text-slate-500 font-sans">Tahun Acuan Basis</span>
                            ) : (
                              <span className={`font-semibold ${row.expenseGrowthPct! <= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {row.expenseGrowthPct! >= 0 ? '▲ +' : '▼ '}{formatCurrency(row.expenseChangeNominal)} ({row.expenseGrowthPct}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className={`font-bold ${row.netProfit >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                            {formatCurrency(row.netProfit)}
                          </div>
                          <div className="text-[10px]">
                            {isBase ? (
                              <span className="text-slate-500 font-sans">Tahun Acuan Basis</span>
                            ) : (
                              <span className={`font-semibold ${profitUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {profitUp ? '▲ +' : '▼ '}{formatCurrency(row.profitChangeNominal)} ({row.profitGrowthPct}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center font-bold text-slate-300">
                          {row.margin}%
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center font-sans">
                          {isBase ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Fondasi Awal
                            </span>
                          ) : profitUp && incUp ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ▲ Ekspansi & Kenaikan Laba Signifikan
                            </span>
                          ) : profitUp ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              ▲ Efisiensi Beban & Surplus Naik
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              ▼ Penurunan Margin Operasional
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 Executive KPI Metric Cards for Currently Selected Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Pemasukan */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pemasukan ({selectedYearLabel})</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white font-mono tracking-tight">
              {formatCurrency(summary.totalIncome)}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rata-rata/Bulan:</span>
              <span className="font-bold text-slate-200 font-mono">{formatCurrency(summary.avgMonthlyIncome)}</span>
            </div>
          </div>

          {/* Card 2: Total Pengeluaran */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran ({selectedYearLabel})</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              {formatCurrency(summary.totalExpense)}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rata-rata/Bulan:</span>
              <span className="font-bold text-slate-200 font-mono">{formatCurrency(summary.avgMonthlyExpense)}</span>
            </div>
          </div>

          {/* Card 3: Surplus / Defisit Bersih */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Surplus / (Defisit)</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                summary.profitOrLoss >= 0 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                {summary.profitOrLoss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <p className={`text-2xl font-black font-mono tracking-tight ${summary.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(summary.profitOrLoss)}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Margin Operasional:</span>
              <span className={`font-bold font-mono ${Number(summary.netMargin) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summary.netMargin}%
              </span>
            </div>
          </div>

          {/* Card 4: Net Cash Flow Bulanan */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Arus Kas Bersih Rata-Rata</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-indigo-400 font-mono tracking-tight">
              {formatCurrency(summary.avgMonthlyNet)}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Likuiditas:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sehat & Terkendali
              </span>
            </div>
          </div>
        </div>

        {/* Visual Analytics Section: Dual Charts for Selected Year */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Tren Arus Kas Bulanan (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-indigo-400" />
                  <span>Grafik Keuangan Bulanan ({selectedYearLabel})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Komparasi Pemasukan vs Pengeluaran per bulan tahun ajaran aktif</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Pengeluaran</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={editableData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)} jt`} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomFinancialTooltip />} />
                  <Bar dataKey="income" fill="#10b981" name="Pemasukan" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" fill="#f43f5e" name="Pengeluaran" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Chart: Proporsi Beban Pengeluaran (1 col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-400" />
                <span>Alokasi Kategori Beban ({selectedYearLabel})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Proporsi pengeluaran berdasarkan pos anggaran</p>
            </div>

            <div className="h-[180px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Beban</span>
                <span className="text-xs font-black text-white font-mono">{formatCurrency(summary.totalExpense)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 max-h-[130px] overflow-y-auto custom-scrollbar">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{item.percentage}%</span>
                    <span className="font-bold text-white text-[11px]">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabbed Financial Ledger & Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Table Header Bar */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('bukuBesar')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'bukuBesar' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Buku Besar Bulanan
                </button>
                <button
                  onClick={() => setActiveTab('komparasiMultiTahun')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'komparasiMultiTahun' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tabel Rekap Multi-Tahun</span>
                </button>
                <button
                  onClick={() => setActiveTab('kategoriBeban')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'kategoriBeban' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rekap Kategori Beban
                </button>
                <button
                  onClick={() => setActiveTab('analisisSemester')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'analisisSemester' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Analisis Semesteran
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Month Input */}
              {activeTab === 'bukuBesar' && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchMonth} 
                    onChange={e => setSearchMonth(e.target.value)} 
                    placeholder="Cari bulan..." 
                    className="w-48 bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors font-medium"
                  />
                </div>
              )}

              {/* Save Changes Button */}
              <button 
                onClick={handleSaveChanges} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Buku Besar Bulanan */}
          {activeTab === 'bukuBesar' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3.5 text-left w-12">No</th>
                    <th className="px-6 py-3.5 text-left">Bulan</th>
                    <th className="px-6 py-3.5 text-right w-64">Pemasukan (IDR)</th>
                    <th className="px-6 py-3.5 text-right">Pengeluaran (IDR)</th>
                    <th className="px-6 py-3.5 text-right">Surplus / (Defisit)</th>
                    <th className="px-6 py-3.5 text-center">Rincian Pos</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                  {filteredData.map((record, index) => {
                    const profit = record.income - record.expense;
                    const isPositive = profit >= 0;
                    const expenseCount = record.expenseDetails?.length || 0;

                    return (
                      <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-bold font-mono">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-white text-sm">
                          {record.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block w-48">
                            <input 
                              type="text"
                              value={new Intl.NumberFormat('id-ID').format(record.income)}
                              onChange={(e) => handleIncomeChange(index, e.target.value)}
                              className="bg-slate-950 border border-slate-700/80 text-white font-mono text-xs font-bold rounded-xl text-right p-2.5 w-full outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-rose-400 font-mono font-bold text-sm">
                          {formatCurrency(record.expense)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleOpenDetailModal(index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Rincian ({expenseCount})</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPositive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {isPositive ? 'Surplus' : 'Defisit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950 border-t-2 border-slate-700 font-black text-xs text-white">
                    <td colSpan={2} className="px-6 py-4 text-center uppercase tracking-wider">
                      Total Akumulasi Tahunan
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-mono text-sm">
                      {formatCurrency(summary.totalIncome)}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-400 font-mono text-sm">
                      {formatCurrency(summary.totalExpense)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono text-sm ${summary.profitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(summary.profitOrLoss)}
                    </td>
                    <td colSpan={2} className="px-6 py-4 text-center text-slate-400">
                      Margin Operasional: <strong className="text-white">{summary.netMargin}%</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Tab 2: Tabel Rekapitulasi Multi-Tahun */}
          {activeTab === 'komparasiMultiTahun' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3.5 text-left w-12">No</th>
                    <th className="px-6 py-3.5 text-left">Tahun Ajaran</th>
                    <th className="px-6 py-3.5 text-right">Total Pemasukan (IDR)</th>
                    <th className="px-6 py-3.5 text-center">Pertumbuhan Pemasukan</th>
                    <th className="px-6 py-3.5 text-right">Total Pengeluaran (IDR)</th>
                    <th className="px-6 py-3.5 text-center">Perubahan Beban</th>
                    <th className="px-6 py-3.5 text-right">Surplus / (Defisit)</th>
                    <th className="px-6 py-3.5 text-center">Margin</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900 font-mono">
                  {multiYearTrendData.map((y, idx) => {
                    const isBase = idx === 0;
                    const isIncGrowthPositive = y.incomeGrowthPct !== null && y.incomeGrowthPct >= 0;

                    return (
                      <tr 
                        key={y.yearId} 
                        className={`transition-colors ${y.yearId === selectedYearId ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="px-6 py-4 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-white font-serif text-sm">
                          <div className="flex items-center gap-2">
                            <span>{y.yearLabel}</span>
                            {y.yearId === selectedYearId && (
                              <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                Aktif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-bold text-sm">
                          {formatCurrency(y.income)}
                        </td>
                        <td className="px-6 py-4 text-center font-sans">
                          {isBase ? (
                            <span className="text-slate-500 text-[11px] italic">Tahun Acuan</span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                              isIncGrowthPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {isIncGrowthPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {isIncGrowthPositive ? `+${y.incomeGrowthPct}%` : `${y.incomeGrowthPct}%`}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-rose-400 font-bold text-sm">
                          {formatCurrency(y.expense)}
                        </td>
                        <td className="px-6 py-4 text-center font-sans">
                          {isBase ? (
                            <span className="text-slate-500 text-[11px] italic">Tahun Acuan</span>
                          ) : (
                            <span className={`font-bold text-xs ${
                              y.expenseGrowthPct! <= 0 ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {y.expenseGrowthPct! >= 0 ? `+${y.expenseGrowthPct}%` : `${y.expenseGrowthPct}%`}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-sm text-indigo-300">
                          {formatCurrency(y.netProfit)}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-sans text-slate-300">
                          {y.margin}%
                        </td>
                        <td className="px-6 py-4 text-center font-sans">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            y.status === 'Surplus' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${y.status === 'Surplus' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {y.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Rekap Kategori Beban */}
          {activeTab === 'kategoriBeban' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <h4 className="font-bold text-white text-xs">{cat.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400">{cat.percentage}%</span>
                    </div>
                    <p className="text-xl font-black text-rose-400 font-mono mt-1">
                      {formatCurrency(cat.value)}
                    </p>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all" 
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Analisis Semesteran */}
          {activeTab === 'analisisSemester' && (
            <div className="p-6 space-y-6">
              {(() => {
                const sem1 = editableData.slice(0, 6);
                const sem2 = editableData.slice(6, 12);

                const sem1Inc = sem1.reduce((s, r) => s + r.income, 0);
                const sem1Exp = sem1.reduce((s, r) => s + r.expense, 0);
                const sem1Net = sem1Inc - sem1Exp;

                const sem2Inc = sem2.reduce((s, r) => s + r.income, 0);
                const sem2Exp = sem2.reduce((s, r) => s + r.expense, 0);
                const sem2Net = sem2Inc - sem2Exp;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semester 1 */}
                    <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h4 className="font-bold text-white text-sm">Semester 1 (Ganjil)</h4>
                          <p className="text-xs text-slate-400">Juli - Desember</p>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          {sem1Net >= 0 ? 'Surplus' : 'Defisit'}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pemasukan Semester 1:</span>
                          <span className="font-bold text-emerald-400 font-mono">{formatCurrency(sem1Inc)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pengeluaran Semester 1:</span>
                          <span className="font-bold text-rose-400 font-mono">{formatCurrency(sem1Exp)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                          <span className="text-white">Net Laba Bersih:</span>
                          <span className="font-mono text-indigo-400">{formatCurrency(sem1Net)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Semester 2 */}
                    <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h4 className="font-bold text-white text-sm">Semester 2 (Genap)</h4>
                          <p className="text-xs text-slate-400">Januari - Juni</p>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          {sem2Net >= 0 ? 'Surplus' : 'Defisit'}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pemasukan Semester 2:</span>
                          <span className="font-bold text-emerald-400 font-mono">{formatCurrency(sem2Inc)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pengeluaran Semester 2:</span>
                          <span className="font-bold text-rose-400 font-mono">{formatCurrency(sem2Exp)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                          <span className="text-white">Net Laba Bersih:</span>
                          <span className="font-mono text-indigo-400">{formatCurrency(sem2Net)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default FinancialReportPage;
