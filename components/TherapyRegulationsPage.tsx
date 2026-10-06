import React from 'react';
import { motion } from 'motion/react';
import { 
  ScrollText, 
  Target, 
  UserCheck, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

const TherapyRegulationsPage: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-[#0b0e14] text-white p-6 custom-scrollbar">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-600/20 rounded-2xl mb-4 border border-indigo-500/30">
                        <ScrollText className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">Peraturan Terapi</h1>
                    <p className="text-gray-400 mt-2">Pusat Terapi Tumbuh Kembang Anak Pelangi Lazuardi</p>
                    <div className="w-24 h-1 bg-indigo-500 mx-auto mt-6 rounded-full opacity-50" />
                </div>

                <div className="space-y-8">
                    {/* Ketentuan Umum */}
                    <section className="bg-[#161b22] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                            <Target className="w-6 h-6 text-indigo-500" />
                            Ketentuan Umum
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-indigo-400 mb-2">1. Tujuan</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Memberikan layanan terapi yang optimal untuk mendukung tumbuh kembang anak secara menyeluruh dan berkesinambungan.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-400 mb-2">2. Hak dan Kewajiban Orang Tua/Wali</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span>Orang tua/wali <strong>berhak</strong> memperoleh informasi perkembangan anak secara berkala sesuai ketentuan yang berlaku di Pelangi Lazuardi.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <span>Orang tua/wali <strong>wajib</strong> memberikan data yang akurat dan lengkap mengenai kondisi anak demi kelancaran proses terapi.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Ketentuan Pelaksanaan Terapi */}
                    <section className="bg-[#161b22] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16" />
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                            <Calendar className="w-6 h-6 text-emerald-500" />
                            Ketentuan Pelaksanaan Terapi
                        </h2>
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" /> 1. Jadwal dan Kehadiran
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "Terapi dilaksanakan sesuai jadwal yang telah disepakati antara orang tua/wali dan pusat terapi.",
                                        "Kehadiran tepat waktu sangat penting untuk memastikan efektivitas sesi terapi.",
                                        "Orang tua/wali wajib melakukan konfirmasi pembatalan minimal 1 hari sebelum sesi terapi.",
                                        "Pembatalan mendadak (kurang dari 24 jam) akan tetap dihitung sebagai sesi terapi yang berjalan dan biaya akan tetap berlaku.",
                                        "Klien yang tidak hadir tanpa keterangan tetap dikenakan biaya penuh untuk bulan berjalan.",
                                        "Ketidakhadiran karena sakit tidak mengurangi frekuensi terapi. Pembayaran terapi dapat dikoreksi pada bulan berikutnya. (Berlaku ketentuan Point 4).",
                                        "Khusus hari Sabtu, Ketidakhadiran klien tidak mengurangi biaya terapi. Sesi dapat dijadwalkan ulang pada hari Sabtu berikutnya di bulan berjalan, sesuai kesepakatan waktu. (Berlaku ketentuan Point 4).",
                                        "Klien yang tidak hadir 3 kali berturut-turut tanpa alasan yang jelas akan kehilangan jadwal terapi, dan slot terapi akan diberikan kepada klien lain."
                                    ].map((text, i) => (
                                        <div key={i} className="p-4 bg-[#0b0e14] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium"><span className="text-emerald-500 font-bold mr-1">{i+1}.</span> {text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-[#0b0e14] rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> 2. Pembatalan & Re-schedule
                                    </h3>
                                    <ul className="space-y-3 text-xs text-gray-400">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            <span>Pembatalan sesi terapi yang sudah dijadwalkan tidak akan mengurangi biaya yang telah dibayarkan.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            <span>Ketidakhadiran terapis karena izin sakit, menikah, atau kondisi mendesak lainnya pembayaran terapi dapat dikoreksi pada bulan berikutnya.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-[#0b0e14] rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> 3. Durasi & Waktu
                                    </h3>
                                    <ul className="space-y-3 text-xs text-gray-400">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            <span>Waktu terapi efektif adalah 45 menit per sesi. Tambahan 15 menit untuk dokumentasi & laporan (total 60 menit).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            <span>Penjemputan harus sesuai jadwal. Keterlambatan berada di luar tanggung jawab pusat terapi. Caregiver harus standby 10 menit sebelum selesai.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pembayaran */}
                    <section className="bg-[#161b22] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16" />
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                            <CreditCard className="w-6 h-6 text-amber-500" />
                            Sistem Pembayaran
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-[#0b0e14] rounded-2xl border border-white/5">
                                <h4 className="text-xs font-black text-amber-500 mb-2 uppercase tracking-widest">Waktu & Metode</h4>
                                <p className="text-xs text-gray-400">Melalui transfer ke rekening resmi Yayasan Lazuardi Hayati di awal bulan. Bukti wajib diserahkan ke admin.</p>
                            </div>
                            <div className="p-5 bg-[#0b0e14] rounded-2xl border border-white/5">
                                <h4 className="text-xs font-black text-rose-500 mb-2 uppercase tracking-widest">Jatuh Tempo</h4>
                                <p className="text-xs text-gray-400">Sesi dapat ditangguhkan jika pembayaran belum diselesaikan dalam waktu 10 hari setelah jatuh tempo.</p>
                            </div>
                            <div className="p-5 bg-[#0b0e14] rounded-2xl border border-white/5">
                                <h4 className="text-xs font-black text-blue-500 mb-2 uppercase tracking-widest">Kondisi Darurat</h4>
                                <p className="text-xs text-gray-400">Jadwal & kebijakan dapat disesuaikan dalam keadaan darurat (bencana/pandemi) via pemberitahuan resmi.</p>
                            </div>
                        </div>
                    </section>

                    {/* Penutup & Tanda Tangan */}
                    <div className="bg-[#161b22] rounded-3xl p-8 border border-white/5 text-center">
                        <p className="text-gray-400 italic text-sm mb-12">
                            "Dengan mematuhi peraturan ini, diharapkan kerjasama yang baik antara orang tua/wali dan pihak pusat terapi sehingga layanan tumbuh kembang anak dapat berjalan secara optimal."
                        </p>
                        
                        <div className="flex flex-col items-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-12">Mengetahui,</p>
                            <div className="relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-10">
                                    <ShieldCheck className="w-20 h-20 text-indigo-500" />
                                </div>
                                <p className="text-lg font-black uppercase tracking-tighter relative z-10">Lubna Assagaf</p>
                                <div className="w-48 h-0.5 bg-indigo-500/50 my-2 mx-auto" />
                                <p className="text-xs text-gray-500 font-bold uppercase">Kepala Bidang Pendidikan</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em] pb-12">
                    Pelangi Lazuardi &copy; {new Date().getFullYear()} • Professional Therapy Center
                </div>
            </motion.div>
        </div>
    );
};

export default TherapyRegulationsPage;
