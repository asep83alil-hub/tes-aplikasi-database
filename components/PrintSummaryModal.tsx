
import React, { useMemo } from 'react';
import { BillingInfo, formatCurrency } from './BillingPage';
import { TherapyDefinition } from '../types';
import PrintIcon from './icons/PrintIcon';

interface PrintSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBillingData: BillingInfo[];
  billingPeriod: string; // e.g., "Periode Juli 2024"
  therapyTypes: TherapyDefinition[];
  logoUrl: string;
  therapyCosts: { [key: string]: number };
}

const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({ isOpen, onClose, allBillingData, billingPeriod, therapyTypes, logoUrl, therapyCosts }) => {
  const totals = useMemo(() => {
    const therapyTotals: { [key: string]: number } = {};
    therapyTypes.forEach(t => therapyTotals[t.id] = 0);

    let grandTotalSessions = 0;
    let grandTotalOriginalBill = 0;
    let grandTotalCorrection = 0;
    let grandTotalBill = 0;

    for (const student of allBillingData) {
        grandTotalSessions += student.totalSessions;
        grandTotalOriginalBill += (student.originalBill || student.totalBill);
        grandTotalCorrection += (student.correction?.totalCorrectionAmount || 0);
        grandTotalBill += student.totalBill;
        for (const typeId in student.sessionDetails) {
            if (therapyTotals.hasOwnProperty(typeId)) {
                therapyTotals[typeId] += student.sessionDetails[typeId].count;
            }
        }
    }
    
    return { 
      therapyTotals, 
      grandTotalSessions, 
      grandTotalOriginalBill,
      grandTotalCorrection,
      grandTotalBill 
    };
  }, [allBillingData, therapyTypes]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedPeriod = billingPeriod;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-5xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="printable-area p-8 flex-grow overflow-y-auto">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Laporan Rinci Tagihan Siswa</h1>
                    <p className="text-sm text-gray-500">Periode: {formattedPeriod}</p>
                </div>
                 <img src={logoUrl} alt="Logo Pelangi Lazuardi" className="h-12 w-auto" />
            </div>

            <div className="w-full overflow-x-auto mt-6">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left font-semibold p-2 sticky left-0 bg-gray-100">Nama Siswa</th>
                            {therapyTypes.map(type => (
                                <th key={type.id} className="text-center font-semibold p-2 w-16">{type.name}</th>
                            ))}
                            <th className="text-center font-semibold p-2 w-16">Total Sesi</th>
                            <th className="text-right font-semibold p-2">Tagihan Awal</th>
                            <th className="text-right font-semibold p-2 text-rose-700">Koreksi</th>
                            <th className="text-right font-semibold p-2">Total Bersih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {allBillingData.map((student) => {
                             const hasCorrection = student.correction && student.correction.totalCorrectionAmount > 0;
                             return (
                               <tr key={student.childId}>
                                  <td className="p-2 sticky left-0 bg-white">
                                    <div className="font-semibold text-gray-900">{student.childName}</div>
                                    <div className="text-xs text-gray-500 font-mono">{student.childId}</div>
                                    {hasCorrection && student.correction.notes && (
                                      <div className="text-[10px] text-rose-600 italic">Ket: {student.correction.notes}</div>
                                    )}
                                  </td>
                                  {therapyTypes.map(type => (
                                      <td key={type.id} className="text-center p-2 font-medium">
                                          {student.sessionDetails[type.id]?.count || 0}
                                      </td>
                                  ))}
                                  <td className="text-center p-2 font-bold">{student.totalSessions}</td>
                                  <td className="text-right p-2 font-mono text-gray-700">{formatCurrency(student.originalBill || student.totalBill)}</td>
                                  <td className="text-right p-2 font-mono font-medium text-rose-600">
                                      {hasCorrection ? `-${formatCurrency(student.correction.totalCorrectionAmount)}` : '-'}
                                  </td>
                                  <td className="text-right p-2 font-mono font-bold text-gray-900">{formatCurrency(student.totalBill)}</td>
                              </tr>
                             );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                        <tr>
                            <td className="text-right font-bold p-2 sticky left-0 bg-gray-100">TOTAL:</td>
                            {therapyTypes.map(type => (
                                <td key={type.id} className="text-center p-2 font-bold">{totals.therapyTotals[type.id]}</td>
                            ))}
                            <td className="text-center p-2 font-bold">{totals.grandTotalSessions}</td>
                            <td className="text-right p-2 font-bold font-mono text-gray-700">{formatCurrency(totals.grandTotalOriginalBill)}</td>
                            <td className="text-right p-2 font-bold font-mono text-rose-700">
                              {totals.grandTotalCorrection > 0 ? `-${formatCurrency(totals.grandTotalCorrection)}` : '-'}
                            </td>
                            <td className="text-right p-2 font-bold font-mono text-base text-primary">{formatCurrency(totals.grandTotalBill)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <p className="text-xs text-gray-400 mt-8 text-center">
                Laporan ini dibuat pada {new Date().toLocaleString('id-ID')}
            </p>

            {/* Signature Section */}
            <div className="flex justify-around mt-20 text-sm text-center">
                <div>
                    <p>Admin</p>
                    <div className="h-20"></div> {/* Signature space */}
                    <p className="font-semibold border-t border-gray-400 pt-1 px-4">( Nama Jelas )</p>
                </div>
                <div>
                    <p>Manajer</p>
                    <div className="h-20"></div> {/* Signature space */}
                    <p className="font-semibold border-t border-gray-400 pt-1 px-4">( Nama Jelas )</p>
                </div>
            </div>
        </div>
        <div className="no-print px-6 py-4 bg-background/50 rounded-b-lg flex justify-end items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg hover:bg-surface-light/50 transition">Tutup</button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-dark transition duration-200 active:scale-95">
                <PrintIcon className="w-4 h-4" />
                Cetak / Simpan PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrintSummaryModal;
