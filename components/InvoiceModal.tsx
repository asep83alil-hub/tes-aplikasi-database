
import React from 'react';
import { BillingInfo, formatCurrency } from './BillingPage';
import PrintIcon from './icons/PrintIcon';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: BillingInfo | null;
  billingPeriod: string; // e.g., "Periode Juli 2024"
  logoUrl: string;
  therapyCosts: { [key: string]: number };
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, studentData, billingPeriod, logoUrl, therapyCosts }) => {
  if (!isOpen || !studentData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedPeriod = billingPeriod;
  let totalCorrectedSessions = 0;
  if (studentData.correction?.sessionCorrections) {
    for (const val of Object.values(studentData.correction.sessionCorrections)) {
      totalCorrectedSessions += (Number(val) || 0);
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
        <div className="printable-area p-8">
            {/* Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                    <img src={logoUrl} alt="Logo Pelangi Lazuardi" className="h-12 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pelangi Lazuardi</h1>
                        <p className="text-xs text-gray-500">Jl.Garuda ujung no 35, Griya Cinere 1 - Limo-Depok</p>
                        <p className="text-xs text-gray-500">Tlp. 7534841</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase text-gray-400">Faktur</h2>
                    <p className="text-sm text-gray-500">#INV-{studentData.childId}-{billingPeriod.replace(/\s/g, '-')}</p>
                </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-2 gap-4 py-6">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Ditagihkan Kepada:</p>
                    <p className="font-bold">{studentData.childName}</p>
                    <p className="text-sm text-gray-600">ID: {studentData.childId}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Tanggal Faktur:</p>
                    <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Periode Tagihan:</p>
                    <p>{formattedPeriod}</p>
                </div>
            </div>
            
            {/* Items Table */}
            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left font-semibold p-3">Deskripsi Layanan</th>
                            <th className="text-center font-semibold p-3">Harga Satuan</th>
                            <th className="text-center font-semibold p-3">Jumlah (Sesi)</th>
                            <th className="text-right font-semibold p-3">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(studentData.sessionDetails).map(([typeId, detail]) => {
                             const d = detail as { count: number; name: string; };
                             return (
                                 <tr key={typeId} className="border-b border-gray-200">
                                    <td className="p-3">{d.name}</td>
                                    <td className="text-center p-3">{formatCurrency(therapyCosts[typeId] || 0)}</td>
                                    <td className="text-center p-3">{d.count}</td>
                                    <td className="text-right p-3">{formatCurrency((therapyCosts[typeId] || 0) * d.count)}</td>
                                </tr>
                             );
                        })}
                        {studentData.correction && studentData.correction.totalCorrectionAmount > 0 && (
                            <tr className="border-b border-rose-200 bg-rose-50/50 text-rose-800">
                                <td className="p-3">
                                    <span className="font-semibold text-rose-700">Koreksi Biaya Terapi (Pengurangan)</span>
                                    {studentData.correction.notes && (
                                        <span className="block text-xs text-rose-600 mt-0.5 italic">Ket: {studentData.correction.notes}</span>
                                    )}
                                    {Object.entries(studentData.correction.sessionCorrections || {}).filter(([_, count]) => (Number(count) || 0) > 0).length > 0 && (
                                        <span className="block text-[11px] text-rose-600 mt-0.5">
                                            Rincian: {Object.entries(studentData.correction.sessionCorrections || {})
                                                .filter(([_, count]) => (Number(count) || 0) > 0)
                                                .map(([tId, count]) => `${count} sesi ${studentData.sessionDetails[tId]?.name || tId}`)
                                                .join(', ')}
                                        </span>
                                    )}
                                </td>
                                <td className="text-center p-3 text-rose-600 italic">Penyesuaian</td>
                                <td className="text-center p-3 text-rose-700 font-medium">
                                    {totalCorrectedSessions > 0 ? `-${totalCorrectedSessions} sesi` : '-'}
                                </td>
                                <td className="text-right p-3 font-bold text-rose-700">-{formatCurrency(studentData.correction.totalCorrectionAmount)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="flex justify-end pt-6">
                <div className="w-full max-w-sm border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-3 text-sm border-b border-gray-100 bg-gray-50/60">
                        <span className="text-gray-600">Subtotal Tagihan Awal:</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(studentData.originalBill || studentData.totalBill)}</span>
                    </div>
                    {studentData.correction && studentData.correction.totalCorrectionAmount > 0 && (
                        <div className="flex justify-between items-center p-3 text-sm border-b border-gray-100 text-rose-700 bg-rose-50/40">
                            <div>
                                <span className="font-medium">Total Koreksi:</span>
                            </div>
                            <span className="font-bold">-{formatCurrency(studentData.correction.totalCorrectionAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center bg-gray-100 p-3">
                        <span className="font-bold text-gray-900">Total Tagihan (Netto):</span>
                        <span className="font-extrabold text-lg text-primary">{formatCurrency(studentData.totalBill)}</span>
                    </div>
                    <div className="text-xs text-gray-500 p-3 bg-gray-50 border-t border-gray-200">
                        Pembayaran dapat dilakukan melalui transfer ke rekening Bank BCA 267-300-5551 a.n. Yayasan Lazuardi Hayati.
                    </div>
                </div>
            </div>
            
            {/* Signature */}
            <div className="flex justify-end mt-20 text-sm">
                <div className="text-center">
                    <p>Hormat kami,</p>
                    <div className="h-20"></div> {/* Signature space */}
                    <p className="font-semibold border-t border-gray-400 pt-1">Admin Pelangi Lazuardi</p>
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

export default InvoiceModal;
