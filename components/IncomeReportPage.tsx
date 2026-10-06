
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AcademicYear, TherapyDefinition, IncomeRecord, IncomeDetail } from '../types';
import { formatCurrency } from './BillingPage';

const incomeSources = ["SPP", "Uang Pangkal", "Uang Kegiatan", "Donasi", "Lain-lain"];

interface IncomeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedRecord: IncomeRecord) => void;
    record: IncomeRecord | null;
}

const IncomeDetailModal: React.FC<IncomeDetailModalProps> = ({ isOpen, onClose, onSave, record }) => {
    const [details, setDetails] = useState<IncomeDetail[]>([]);
    const [newDetail, setNewDetail] = useState({ source: incomeSources[0], description: '', amount: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        setDetails(record?.incomeDetails ? JSON.parse(JSON.stringify(record.incomeDetails)) : []);
        setEditingId(null);
        setNewDetail({ source: incomeSources[0], description: '', amount: '' });
    }, [record, isOpen]);

    if (!isOpen || !record) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewDetail(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdateDetail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDetail.description || !newDetail.amount) {
            alert('Deskripsi dan Jumlah harus diisi.');
            return;
        }

        const amountValue = parseInt(newDetail.amount.replace(/\D/g, ''), 10);

        if (editingId) {
            setDetails(prev => prev.map(d => d.id === editingId ? { ...d, ...newDetail, amount: amountValue } : d));
            setEditingId(null);
        } else {
            const newEntry: IncomeDetail = {
                id: `inc-${Date.now()}`,
                source: newDetail.source,
                description: newDetail.description,
                amount: amountValue,
            };
            setDetails([...details, newEntry]);
        }
        setNewDetail({ source: incomeSources[0], description: '', amount: '' });
    };

    const handleEditDetail = (detail: IncomeDetail) => {
        setNewDetail({
            source: detail.source,
            description: detail.description,
            amount: formatCurrency(detail.amount).replace('Rp', '').trim()
        });
        setEditingId(detail.id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewDetail({ source: incomeSources[0], description: '', amount: '' });
    };

    const handleDeleteDetail = (id: string) => {
        if (window.confirm('Yakin ingin menghapus item pemasukan ini?')) {
            setDetails(details.filter(d => d.id !== id));
            if (editingId === id) {
                handleCancelEdit();
            }
        }
    };

    const handleSave = () => {
        const totalIncome = details.reduce((sum, d) => sum + d.amount, 0);
        onSave({ ...record, income: totalIncome, incomeDetails: details });
    };

    const total = details.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
            <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-surface-light flex justify-between items-center flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Rincian Pemasukan - {record.month}</h3>
                        <p className="text-sm text-muted">Total: <span className="font-bold text-success">{formatCurrency(total)}</span></p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="bg-surface-light/50 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-white mb-3">{editingId ? 'Edit Item Pemasukan' : 'Tambah Item Pemasukan'}</h4>
                        <form onSubmit={handleAddOrUpdateDetail} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted mb-1">Sumber</label>
                                    <input 
                                        list="source-options" 
                                        name="source" 
                                        value={newDetail.source} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-background border border-surface-light/50 text-white text-sm rounded-lg p-2.5"
                                        placeholder="Pilih atau ketik sumber manual"
                                    />
                                    <datalist id="source-options">
                                        {incomeSources.map(src => <option key={src} value={src} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted mb-1">Jumlah (IDR)</label>
                                    <input type="text" name="amount" value={newDetail.amount} onChange={e => setNewDetail(p => ({...p, amount: formatCurrency(parseInt(e.target.value.replace(/\D/g,'') || '0', 10)).replace('Rp', '').trim()}))} className="w-full bg-background border border-surface-light/50 text-white text-sm rounded-lg p-2.5"/>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-muted mb-1">Deskripsi</label>
                                <input type="text" name="description" value={newDetail.description} onChange={handleInputChange} className="w-full bg-background border border-surface-light/50 text-white text-sm rounded-lg p-2.5"/>
                            </div>
                            <div className="flex gap-2">
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} className="flex-1 bg-surface-light text-muted hover:text-white font-bold py-2.5 px-4 rounded-lg text-xs">Batal</button>
                                )}
                                <button type="submit" className={`flex-1 ${editingId ? 'bg-primary' : 'bg-secondary'} text-white font-bold py-2.5 px-4 rounded-lg`}>
                                    {editingId ? 'Update' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Daftar Pemasukan</h4>
                        <div className="space-y-2">
                        {details.length > 0 ? details.map(item => (
                            <div key={item.id} className={`flex justify-between items-center bg-surface-light/30 p-3 rounded-lg border ${editingId === item.id ? 'border-primary' : 'border-transparent'}`}>
                                <div>
                                    <p className="font-medium text-white">{item.description}</p>
                                    <p className="text-xs text-muted">{item.source}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-success">{formatCurrency(item.amount)}</p>
                                    <button onClick={() => handleEditDetail(item)} className="text-primary/70 hover:text-primary p-1 rounded hover:bg-primary/10 transition" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteDetail(item.id)} className="text-danger/70 hover:text-danger p-1 rounded hover:bg-danger/10 transition" title="Hapus">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        )) : <p className="text-center text-muted text-sm py-4">Belum ada rincian pemasukan.</p>}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg">Batal</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg">Simpan Rincian</button>
                </div>
            </div>
        </div>
    );
};

interface IncomeReportPageProps {
  allIncomeData: { [key: string]: IncomeRecord[] };
  onUpdateData: (academicYearId: string, updatedData: IncomeRecord[]) => void;
  academicYears: AcademicYear[];
  therapyTypes: TherapyDefinition[];
  therapyCosts: { [key: string]: number };
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-surface border border-surface-light rounded-2xl p-6 text-center">
        <p className="text-sm text-muted">{title}</p>
        <p className={`text-2xl font-bold text-white`}>{value}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-background/80 backdrop-blur-sm border border-surface-light rounded-lg shadow-xl">
        <p className="text-base font-bold text-white">{label}</p>
        <p className="text-success">Pemasukan: {formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const ComparisonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-background/80 backdrop-blur-sm border border-surface-light rounded-lg shadow-xl">
        <p className="text-base font-bold text-white">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

const IncomeReportPage: React.FC<IncomeReportPageProps> = ({ allIncomeData, onUpdateData, academicYears, therapyTypes, therapyCosts }) => {
    const [selectedYearId, setSelectedYearId] = useState<string>(academicYears[0]?.id || '');
    const [editableData, setEditableData] = useState<IncomeRecord[]>([]);
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(null);

    useEffect(() => {
        // Deep copy to prevent modifying the prop directly
        setEditableData(JSON.parse(JSON.stringify(allIncomeData[selectedYearId] || [])));
    }, [selectedYearId, allIncomeData]);
    
    useEffect(() => {
        const initialVisibility = academicYears.reduce((acc, year) => {
            acc[year.label] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setVisibility(initialVisibility);
    }, [academicYears]);

    const handleDataChange = (index: number, value: string) => {
        const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
        const newData = [...editableData];
        newData[index] = { ...newData[index], income: numericValue };
        setEditableData(newData);
    };
    
    const handleLegendClick = (data: any) => {
        const { dataKey } = data;
        setVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };

    const handleSaveChanges = () => {
        onUpdateData(selectedYearId, editableData);
        alert('Data pemasukan telah disimpan!');
    };

    const handleOpenDetailModal = (index: number) => {
        setSelectedRecordIndex(index);
        setIsDetailModalOpen(true);
    };

    const handleSaveDetails = (updatedRecord: IncomeRecord) => {
        if (selectedRecordIndex !== null) {
            const newData = [...editableData];
            newData[selectedRecordIndex] = updatedRecord;
            setEditableData(newData);
        }
        setIsDetailModalOpen(false);
        setSelectedRecordIndex(null);
    };
    
    const summary = useMemo(() => {
        const totalAnnualIncome = editableData.reduce((sum, record) => sum + (record.income || 0), 0);
        const averageMonthlyIncome = totalAnnualIncome > 0 ? totalAnnualIncome / 12 : 0;
        return { totalAnnualIncome, averageMonthlyIncome };
    }, [editableData]);

    const comparisonChartData = useMemo(() => {
        if (!allIncomeData || academicYears.length === 0 || Object.keys(allIncomeData).length === 0) return [];
        
        const firstYearId = academicYears[0].id;
        const firstYearData = allIncomeData[firstYearId] || [];
        if (firstYearData.length === 0) return [];

        const chartData = firstYearData.map(record => ({ name: record.month }));

        academicYears.forEach(year => {
            const yearData = allIncomeData[year.id] || [];
            chartData.forEach((monthData, index) => {
                monthData[year.label] = yearData[index]?.income || 0;
            });
        });

        return chartData;
    }, [allIncomeData, academicYears]);
    
    const lineColors = ['rgb(var(--color-primary))', 'rgb(var(--color-secondary))', 'rgb(var(--color-accent))', 'rgb(var(--color-warning))'];
    const gradientColors = [
        { id: 'colorPrimary', color: 'rgb(var(--color-primary))' },
        { id: 'colorSecondary', color: 'rgb(var(--color-secondary))' },
        { id: 'colorAccent', color: 'rgb(var(--color-accent))' },
        { id: 'colorWarning', color: 'rgb(var(--color-warning))' },
    ];


    return (
        <>
            <IncomeDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onSave={handleSaveDetails}
                record={selectedRecordIndex !== null ? editableData[selectedRecordIndex] : null}
            />
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Laporan Pemasukan Terapi</h1>
                            <p className="text-sm text-muted mt-1">Analisis dan kelola pemasukan dari sesi terapi per tahun ajaran.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="year-picker" className="text-sm font-medium text-muted">Tahun Ajaran:</label>
                            <select
                                id="year-picker"
                                value={selectedYearId}
                                onChange={(e) => setSelectedYearId(e.target.value)}
                                className="bg-surface-light border border-surface-light/50 text-white placeholder-muted text-sm rounded-lg focus:ring-primary focus:border-primary p-2 transition"
                            >
                                {academicYears.map(year => (
                                    <option key={year.id} value={year.id}>{year.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <StatCard title="Total Pemasukan Tahunan" value={formatCurrency(summary.totalAnnualIncome)} />
                        <StatCard title="Rata-rata Pemasukan/Bulan" value={formatCurrency(summary.averageMonthlyIncome)} />
                    </div>
                    
                    <div className="bg-surface border border-surface-light rounded-2xl p-6 mb-8">
                         <h3 className="text-xl font-bold text-white mb-6">Grafik Pemasukan Bulanan ({academicYears.find(y => y.id === selectedYearId)?.label})</h3>
                         <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={editableData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-light)" />
                                    <XAxis dataKey="month" tick={{ fill: 'rgb(var(--color-text-muted))' }} />
                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} tick={{ fill: 'rgb(var(--color-text-muted))' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(158, 119, 243, 0.1)' }}/>
                                    <Bar dataKey="income" fill="rgb(var(--color-success))" name="Pemasukan" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-surface border border-surface-light rounded-2xl shadow-lg overflow-hidden mb-8">
                        <div className="p-6 border-b border-surface-light flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Edit Pemasukan Bulanan</h3>
                            <button onClick={handleSaveChanges} className="bg-primary hover:bg-primary-dark text-background font-bold py-2 px-4 rounded-lg transition">Simpan Perubahan</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-surface-light">
                                <thead className="bg-background/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Bulan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total Pemasukan (IDR)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">Rincian</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-surface-light">
                                    {editableData.map((record, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.month}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="text"
                                                    value={new Intl.NumberFormat('id-ID').format(record.income)}
                                                    onChange={(e) => handleDataChange(index, e.target.value)}
                                                    className="bg-surface-light border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button 
                                                    onClick={() => handleOpenDetailModal(index)}
                                                    className="bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors px-3 py-1.5 rounded-md text-sm font-medium"
                                                >
                                                    Kelola Rincian
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-surface border border-surface-light rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-6">Grafik Perbandingan Pemasukan Antar Tahun Ajaran</h3>
                         <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={comparisonChartData} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                                    <defs>
                                        {gradientColors.map((grad) => (
                                            <linearGradient key={grad.id} id={grad.id} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={grad.color} stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor={grad.color} stopOpacity={0}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-light)" />
                                    <XAxis dataKey="name" tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} tick={{ fill: 'rgb(var(--color-text-muted))' }} />
                                    <Tooltip content={<ComparisonTooltip />} cursor={{ stroke: 'rgb(var(--color-primary))', strokeWidth: 1 }}/>
                                    <Legend 
                                        wrapperStyle={{ color: 'rgb(var(--color-text-muted))', cursor: 'pointer', bottom: 0 }}
                                        onClick={handleLegendClick}
                                        formatter={(value, entry) => {
                                            const isHidden = !visibility[value];
                                            return <span style={{ color: isHidden ? 'rgb(var(--color-text-muted))' : 'rgb(var(--color-text-base))', textDecoration: isHidden ? 'line-through' : 'none' }}>{value}</span>;
                                        }}
                                    />
                                    {academicYears.map((year, index) => (
                                        <Area 
                                            key={year.id} 
                                            type="monotone" 
                                            dataKey={year.label} 
                                            hide={!visibility[year.label]}
                                            stroke={lineColors[index % lineColors.length]} 
                                            fillOpacity={1}
                                            fill={`url(#${gradientColors[index % gradientColors.length].id})`}
                                            strokeWidth={2.5} 
                                            dot={false} 
                                            activeDot={{ r: 6 }} 
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
};

export default IncomeReportPage;
