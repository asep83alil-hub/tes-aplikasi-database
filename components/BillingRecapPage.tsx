
import React, { useState, useMemo } from 'react';
import { Child, TherapyDefinition, View } from '../types';
import { formatCurrency } from './BillingPage';
import PrintIcon from './icons/PrintIcon';
import FinanceIcon from './icons/FinanceIcon';

type MasterChild = Omit<Child, 'sessions'>;

interface BillingRecapPageProps {
  allChildren: MasterChild[];
  therapyTypes: TherapyDefinition[];
  onNavigate: (view: View) => void;
  therapyCosts: { [key: string]: number };
}

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const BillingRecapPage: React.FC<BillingRecapPageProps> = ({ allChildren, therapyTypes, onNavigate, therapyCosts }) => {
  const [billingPeriod, setBillingPeriod] = useState(`Periode ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`);
  const [daysInMonth, setDaysInMonth] = useState<{ [key: string]: number }>({
    "Senin": 4, "Selasa": 4, "Rabu": 4, "Kamis": 4, "Jumat": 4, "Sabtu": 0, "Minggu": 0
  });

  const handleDayCountChange = (day: string, value: string) => {
    const count = parseInt(value, 10);
    setDaysInMonth(prev => ({
      ...prev,
      [day]: isNaN(count) || count < 0 ? 0 : count,
    }));
  };

  const recapData = useMemo(() => {
    return allChildren
      .map(child => {
        const dailyTherapies: { [day: string]: { type: string; time: string }[] } = {};
        daysOfWeek.forEach(day => dailyTherapies[day] = []);

        let totalSessions = 0;
        let totalBill = 0;

        if (child.recurringSessions) {
            child.recurringSessions.forEach(session => {
                const dayName = session.day;
                if (daysOfWeek.includes(dayName)) {
                    dailyTherapies[dayName].push({ type: session.type, time: session.time });
                }

                const occurrences = daysInMonth[dayName] || 0;
                if (occurrences > 0) {
                    totalSessions += occurrences;
                    totalBill += occurrences * (therapyCosts[session.type] || 0);
                }
            });
        }

        return {
          childId: child.id,
          childName: child.name,
          photoUrl: child.photoUrl,
          dailyTherapies,
          totalSessions: totalSessions,
          totalBill: totalBill,
        };
    }).filter(data => data.totalSessions > 0)
      .sort((a, b) => a.childName.localeCompare(b.childName));
  }, [allChildren, daysInMonth, therapyCosts]);

  const totals = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {};
    daysOfWeek.forEach(day => dailyTotals[day] = 0);

    let grandTotalSessions = 0;
    let grandTotalBill = 0;

    for (const student of recapData) {
        grandTotalSessions += student.totalSessions;
        grandTotalBill += student.totalBill;

        daysOfWeek.forEach(day => {
            const weeklySessionCountOnDay = student.dailyTherapies[day].length;
            const occurrences = daysInMonth[day] || 0;
            dailyTotals[day] += weeklySessionCountOnDay * occurrences;
        });
    }
    
    return { dailyTotals, grandTotalSessions, grandTotalBill };
  }, [recapData, daysInMonth]);

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <main className="p-8">
      <div className="max-w-full mx-auto">
        <div className="no-print flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">Rekapitulasi Tagihan Berdasarkan Jadwal</h1>
                <p className="text-sm text-muted mt-1">Konfigurasi jumlah hari per minggu dalam sebulan untuk menghitung total tagihan berdasarkan jadwal rutin siswa.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="billing-period" className="text-sm font-medium text-muted">Periode:</label>
                    <input
                        type="text"
                        id="billing-period"
                        value={billingPeriod}
                        onChange={(e) => setBillingPeriod(e.target.value)}
                        className="bg-surface-light border border-surface-light/50 text-white placeholder-muted text-sm rounded-lg focus:ring-primary focus:border-primary p-2 transition"
                    />
                </div>
                <button
                  onClick={() => onNavigate('tagihan')}
                  className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <FinanceIcon className="w-4 h-4" />
                  Lihat Tagihan Aktual
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <PrintIcon className="w-4 h-4" />
                  Cetak Laporan
                </button>
            </div>
        </div>

        <div className="no-print bg-surface border border-surface-light rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Konfigurasi Jumlah Hari dalam Sebulan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {daysOfWeek.map(day => (
                    <div key={day}>
                        <label htmlFor={`day-count-${day}`} className="block text-sm font-medium text-muted mb-2">{day}</label>
                        <input
                            type="number"
                            id={`day-count-${day}`}
                            value={daysInMonth[day]}
                            onChange={(e) => handleDayCountChange(day, e.target.value)}
                            min="0"
                            className="w-full bg-surface-light border border-surface-light/50 text-white text-center text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                        />
                    </div>
                ))}
            </div>
        </div>


        <div className="bg-surface border border-surface-light rounded-2xl shadow-lg overflow-hidden printable-area">
          <div className="p-6 border-b border-surface-light print:border-b-2 print:border-gray-300">
              <h2 className="text-xl font-bold text-white print:text-black">Laporan Rinci Tagihan Periodik</h2>
              <p className="text-sm text-muted print:text-gray-600">Periode: {billingPeriod}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-light print:divide-gray-300">
              <thead className="bg-background/50 print:bg-gray-100">
                <tr>
                  <th className="sticky left-0 bg-background/50 print:bg-gray-100 px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Nama Siswa</th>
                  {daysOfWeek.map(day => (
                      <th key={day} className="px-3 py-4 text-center text-xs font-medium text-muted uppercase tracking-wider">{day}</th>
                  ))}
                  <th className="px-6 py-4 text-center text-xs font-medium text-muted uppercase tracking-wider">Total Sesi</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted uppercase tracking-wider">Total Tagihan</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-surface-light print:divide-gray-300">
                {recapData.map(student => (
                  <tr key={student.childId} className="hover:bg-surface-light/50 transition-colors group">
                    <td className="sticky left-0 bg-surface group-hover:bg-surface-light/50 px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full object-cover ring-2 ring-surface-light print:hidden" src={student.photoUrl} alt={student.childName} />
                            <div className="ml-4 print:ml-0">
                                <div className="text-sm font-medium text-white print:text-black">{student.childName}</div>
                                <div className="text-xs text-muted font-mono print:text-gray-500">{student.childId}</div>
                            </div>
                        </div>
                    </td>
                    {daysOfWeek.map(day => (
                        <td key={day} className="px-3 py-4 whitespace-nowrap text-left text-sm text-white print:text-black align-top">
                           {student.dailyTherapies[day].length > 0 ? (
                                <div className="space-y-1">
                                    {student.dailyTherapies[day].map((session, index) => {
                                        const therapyInfo = therapyTypes.find(t => t.id === session.type);
                                        return (
                                            <div key={index} className="text-xs bg-surface-light print:bg-gray-100 p-1 rounded">
                                                <span className="font-semibold" style={{color: therapyInfo?.color}}>{therapyInfo?.name || session.type}</span>
                                                <span className="text-muted print:text-gray-600"> @{session.time}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                           ) : null}
                        </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-white print:text-black">{student.totalSessions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-primary print:text-blue-600">{formatCurrency(student.totalBill)}</td>
                  </tr>
                ))}
              </tbody>
               <tfoot className="bg-background/50 print:bg-gray-100 print:border-t-2 print:border-gray-400">
                  <tr>
                      <th scope="row" className="sticky left-0 bg-background/50 print:bg-gray-100 px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">Total Sesi</th>
                      {daysOfWeek.map(day => (
                          <td key={`${day}-total`} className="px-3 py-4 text-center text-sm font-bold text-white print:text-black">{totals.dailyTotals[day]}</td>
                      ))}
                      <td className="px-6 py-4 text-center text-sm font-bold text-white print:text-black">{totals.grandTotalSessions}</td>
                      <td className="px-6 py-4 text-right text-base font-bold text-primary print:text-blue-700">{formatCurrency(totals.grandTotalBill)}</td>
                  </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BillingRecapPage;
