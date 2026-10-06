import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Phone, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  Baby, 
  ArrowRight,
  FileText,
  UserCheck,
  X
} from 'lucide-react';

interface GuestManagementPageProps {
  guests: any[];
  onPromote?: (guest: any) => void;
  logoUrl?: string;
}

const sensoryOptions = ["Selalu", "Sering", "Kadang-kadang", "Jarang", "Tidak Pernah"];

const sensorySections = [
  { id: 'A', title: 'A. AUDITORY PROCESSING' },
  { id: 'B', title: 'B. VISUAL PROCESSING' },
  { id: 'C', title: 'C. TOUCH PROCESSING' },
  { id: 'D', title: 'D. MOVEMENT PROCESSING' },
  { id: 'E', title: 'E. BODY POSITION PROCESSING' },
  { id: 'F', title: 'F. ORAL SENSORY PROCESSING' },
  { id: 'G', title: 'G. CONDUCT Associated with sensory processing' },
  { id: 'H', title: 'H. SOCIAL EMOTIONAL Responses' },
  { id: 'I', title: 'I. ATTENTIONAL Responses' }
];

const observationQuestions = [
  "Memahami konsep angka 3",
  "Meneruskan pemahaman tentang konsep spasial",
  "Mengenali 1 sampai 3 warna",
  "Memiliki kosakata reseptif 2.800 kata atau lebih",
  "Menghitung sampai 10 dengan menghafal",
  "Menyimak cerita-cerita pendek",
  "Menjawab pertanyaan tentang fungsi",
  "Menggunakan tata Bahasa yang benar pada kalimat",
  "Memiliki kosa kata ekspresi 900 sampai 2.000 lebih kata",
  "Menggunakan kalimat dengan 4 sampai 8 kata",
  "Mengetahui definisi kata",
  "Berbicara pada tingkat sekitar 186 suku kata permenit",
  "Pengulangan kata berkurang",
  "Menikmati sajak, irama dan cerita",
  "Menghasilkan konsonan dengan keakuratan 90%",
  "Masih menghilangkan konsonan medial",
  "Cara bicara sudah dimengerti orang lain",
  "Menceritakan tentang pengalaman disekolah, dirumah teman, dan sebagainya",
  "Menyampaikan cerita panjang",
  "Memperhatikan sebuah cerita dan menjawab pertanyaan-pertanyaan sederhana yang berhubungan dengan cerita tersebut"
];

const GuestManagementPage: React.FC<GuestManagementPageProps> = ({ guests, onPromote, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);

  const handlePrint = (guest: any) => {
    setSelectedGuest(guest);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const filteredGuests = guests.filter(guest => 
    guest.child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.child.nickName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0e14] text-white p-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl">Daftar Tamu Baru</h1>
            <p className="text-gray-400 mt-2 font-medium">Monitoring pendaftaran assesmen dari calon klien baru</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama ananda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#161b22] border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[300px] transition-all"
              />
            </div>
            <button className="p-3 bg-[#161b22] border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-gray-400">
               <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#161b22] p-6 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black">{filteredGuests.length}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Total Pendaftar</span>
                 </div>
              </div>
           </div>
           <div className="bg-[#161b22] p-6 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Clock className="w-6 h-6 text-amber-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black">{filteredGuests.filter(g => g.status === 'Baru').length}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Belum Diproses</span>
                 </div>
              </div>
           </div>
           <div className="bg-[#161b22] p-6 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black">0</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Sudah Jadi Siswa</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Guest List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
          {filteredGuests.length > 0 ? (
            filteredGuests.map((guest, idx) => (
              <motion.div 
                key={guest.registrationId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#161b22] p-6 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#0b0e14] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                       <Baby className="w-8 h-8 text-primary opacity-60" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full">{guest.status}</span>
                        <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-white/10">
                          {guest.category}{guest.subCategory ? ` - ${guest.subCategory}` : ''}
                        </span>
                        <span className="text-gray-500 text-[10px] font-bold">ID: {guest.registrationId}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tighter">{guest.child.fullName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Calendar className="w-3 h-3" /> {new Date(guest.registrationDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Phone className="w-3 h-3" /> {guest.child.phone || guest.family.father.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePrint(guest)}
                      className="p-3 bg-[#0b0e14] rounded-xl border border-white/5 hover:bg-emerald-500 hover:text-white transition-all shadow-lg text-emerald-500"
                      title="Cetak PDF"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedGuest(guest)}
                      className="p-3 bg-[#0b0e14] rounded-xl border border-white/5 hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">Orang Tua</span>
                      <span className="text-xs font-bold text-gray-400">{guest.family.father.name || guest.family.mother.name}</span>
                   </div>
                   <button 
                     onClick={() => {
                        if (onPromote) onPromote(guest);
                     }}
                     className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group/btn"
                   >
                      Proses Assesmen <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-[#161b22] rounded-[3rem] border border-dashed border-white/10">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-700" />
               </div>
               <p className="text-gray-500 font-black uppercase tracking-widest">Belum ada pendaftaran tamu baru</p>
            </div>
          )}
        </div>
      </div>

      {/* Guest Details Modal */}
      <AnimatePresence>
        {selectedGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedGuest(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-[#0b0e14] border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-3xl relative z-10 flex flex-col"
            >
               <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 no-print">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-white/10 p-2 shadow-inner">
                        <img src={logoUrl || "https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png"} alt="Logo" className="w-full h-full object-contain" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Detail Pendaftaran</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">ID Terdaftar: {selectedGuest.registrationId}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handlePrint(selectedGuest)}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20"
                    >
                      <FileText className="w-4 h-4" /> Cetak ke PDF
                    </button>
                    <button onClick={() => setSelectedGuest(null)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors">
                       <X className="w-6 h-6" />
                    </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12 no-print">
                  {/* Identity Block */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#161b22] p-8 rounded-[2rem] border border-white/5">
                     <div className="md:col-span-2 flex flex-col gap-1 mb-4">
                        <span className="text-[10px] uppercase font-black text-primary tracking-widest px-4 border-l-2 border-primary">Kategori Layanan</span>
                        <span className="text-xl font-black text-white uppercase tracking-tighter px-4">
                          {selectedGuest.category} {selectedGuest.subCategory && <span className="text-primary">— {selectedGuest.subCategory}</span>}
                        </span>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-primary tracking-widest pl-4 border-l-2 border-primary">Identitas Anak</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Nama Lengkap</span>
                              <span className="text-xs font-bold">{selectedGuest.child.fullName}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Panggilan</span>
                              <span className="text-xs font-bold">{selectedGuest.child.nickName}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">TTL</span>
                              <span className="text-xs font-bold">{selectedGuest.child.birthPlace}, {selectedGuest.child.birthDate}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Usia / Jns Kelamin</span>
                              <span className="text-xs font-bold">{selectedGuest.child.age} / {selectedGuest.child.gender}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-emerald-500 tracking-widest pl-4 border-l-2 border-emerald-500">Data Sekolah</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Sekolah</span>
                              <span className="text-xs font-bold">{selectedGuest.child.school}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Kelas</span>
                              <span className="text-xs font-bold">{selectedGuest.child.class}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-xs text-gray-500">Alamat</span>
                              <span className="text-xs font-bold text-right max-w-[200px]">{selectedGuest.child.address}</span>
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* Referral Block */}
                  <section className="space-y-6">
                     <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Isi Formulir Rujukan</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { l: 'Gambaran Umum', v: selectedGuest.referral.generalOverview },
                          { l: 'Keluhan Saat Ini', v: selectedGuest.referral.complaints },
                          { l: 'Sejak Kapan', v: selectedGuest.referral.sinceWhen },
                          { l: 'Faktor Mendasari', v: selectedGuest.referral.underlyingFactors },
                          { l: 'Faktor Meredakan', v: selectedGuest.referral.relievingFactors },
                          { l: 'Tindakan Dilakukan', v: selectedGuest.referral.actionsTaken },
                          { l: 'Hasil Dicapai', v: selectedGuest.referral.resultsAchieved },
                          { l: 'Sasaran Ingin Dicapai', v: selectedGuest.referral.goals },
                          { l: 'Sumber Informasi Klien', v: selectedGuest.referralSource || selectedGuest.referral?.source || 'Instagram' }
                        ].map((item, i) => (
                          <div key={i} className="p-6 bg-[#0b0e14] border border-white/10 rounded-3xl">
                             <h5 className="text-[9px] uppercase font-black text-gray-600 tracking-widest mb-3">{item.l}</h5>
                             <p className="text-xs text-gray-400 leading-relaxed italic">"{item.v || 'Tidak ada keterangan'}"</p>
                          </div>
                        ))}
                     </div>
                  </section>

                  {/* Family Block */}
                  <section className="space-y-8">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Data Orang Tua</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {['father', 'mother'].map(p => (
                         <div key={p} className="p-8 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                            <h4 className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">{p === 'father' ? 'Ayah' : 'Ibu'}</h4>
                            <div className="space-y-3">
                               <p className="text-sm font-black">{selectedGuest.family[p].name}</p>
                               <div className="text-xs text-gray-500 space-y-2">
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Umur / Menikah Thn:</span>
                                    <span className="text-white font-bold">{selectedGuest.family[p].age} thn / {selectedGuest.family[p].marriageYear}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Suku / Agama:</span>
                                    <span className="text-white font-bold">{selectedGuest.family[p].ethnicity} / {selectedGuest.family[p].religion}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Urutan:</span>
                                    <span className="text-white font-bold">Anak ke {selectedGuest.family[p].order} dari {selectedGuest.family[p].totalSiblings} bersaudara</span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Pendidikan:</span>
                                    <span className="text-white font-bold">{selectedGuest.family[p].education}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Pekerjaan:</span>
                                    <span className="text-white font-bold">{selectedGuest.family[p].job}</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span>Alamat & No. HP:</span>
                                    <span className="text-white font-bold">{selectedGuest.family[p].address} - {selectedGuest.family[p].phone}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Sibling List in Modal */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-primary tracking-widest pl-4 border-l-2 border-primary">Daftar Saudara</h4>
                      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                              <th className="px-4 py-3 font-bold uppercase tracking-widest text-gray-500">No</th>
                              <th className="px-4 py-3 font-bold uppercase tracking-widest text-gray-500">Nama</th>
                              <th className="px-4 py-3 font-bold uppercase tracking-widest text-gray-500">L/P</th>
                              <th className="px-4 py-3 font-bold uppercase tracking-widest text-gray-500">Usia</th>
                              <th className="px-4 py-3 font-bold uppercase tracking-widest text-gray-500">Pendidikan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedGuest.siblings?.map((s: any, i: number) => (
                              <tr key={i} className="border-b border-white/5 last:border-0">
                                <td className="px-4 py-2 font-bold text-gray-600">{i+1}</td>
                                <td className="px-4 py-2 font-bold text-gray-300">{s.name}</td>
                                <td className="px-4 py-2 text-gray-400">{s.gender}</td>
                                <td className="px-4 py-2 text-gray-400">{s.age}</td>
                                <td className="px-4 py-2 text-gray-400">{s.education}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  {/* Birth History */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Riwayat Kelahiran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-amber-500 tracking-widest">Pra-Nata</h4>
                          <div className="space-y-3 text-xs">
                             <div className="flex flex-col gap-1">
                                <span className="text-gray-500 uppercase font-black tracking-widest text-[8px]">Masalah Kandungan:</span>
                                <span className="font-bold">{selectedGuest.birth.prenatal.problems || 'Tidak ada'}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-gray-500 uppercase font-black tracking-widest text-[8px]">Fisik Bunda:</span>
                                <span className="font-bold">{selectedGuest.birth.prenatal.physicalCondition || '-'}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-gray-500 uppercase font-black tracking-widest text-[8px]">Emosi Bunda:</span>
                                <span className="font-bold">{selectedGuest.birth.prenatal.emotionalCondition || '-'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="p-8 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Kelahiran (Partus)</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                             <div>
                                <p className="text-gray-500 uppercase font-bold text-[8px]">Proses:</p>
                                <p className="text-xs font-bold">{selectedGuest.birth.delivery.process}</p>
                             </div>
                             <div>
                                <p className="text-gray-500 uppercase font-bold text-[8px]">Waktu Lahir:</p>
                                <p className="text-xs font-bold">{selectedGuest.birth.delivery.condition}</p>
                             </div>
                             <div>
                                <p className="text-gray-500 uppercase font-bold text-[8px]">Usia Kandungan:</p>
                                <p className="text-xs font-bold">{selectedGuest.birth.delivery.duration} Minggu</p>
                             </div>
                             <div>
                                <p className="text-gray-500 uppercase font-bold text-[8px]">ASI Sampai:</p>
                                <p className="text-xs font-bold">{selectedGuest.birth.delivery.breastfeedingUntil}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* Development, Health, Social */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Hasil Pengamatan Lanjutan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Development */}
                       <div className="p-6 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-rose-500 tracking-widest">Kemandirian Makan</h4>
                          <div className="space-y-2 text-[10px]">
                             <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500">Disuapi:</span>
                                <span className="font-bold">{selectedGuest.development.feeding.fedBy}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500">Makan Dengan:</span>
                                <span className="font-bold">{selectedGuest.development.feeding.eatsWith}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500">Sinyal Lapar:</span>
                                <span className="font-bold">{selectedGuest.development.feeding.hungerSignal}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500">Sukar Duduk:</span>
                                <span className="font-bold">{selectedGuest.development.feeding.difficultySitting}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-gray-500">Minuman:</span>
                                <span className="font-bold">{selectedGuest.development.preferences.drinks.join(', ')}</span>
                             </div>
                          </div>
                       </div>

                       {/* Health */}
                       <div className="p-6 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Riwayat Penyakit</h4>
                          <div className="flex flex-wrap gap-1.5">
                             {selectedGuest.health.illnesses?.length > 0 ? (
                                selectedGuest.health.illnesses.map((ill: string) => (
                                   <span key={ill} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[9px] font-bold border border-emerald-500/20">{ill}</span>
                                ))
                             ) : (
                                <span className="text-xs text-gray-500 italic">Tidak ada riwayat penyakit dicatat</span>
                             )}
                          </div>
                       </div>

                       {/* Social */}
                       <div className="p-6 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Kemandirian & Sosial</h4>
                          <div className="space-y-2 text-xs">
                             <div className="flex justify-between">
                                <span className="text-gray-500">4.2.1 Sifat:</span>
                                <span className="font-bold">{selectedGuest.social.sociability.shyness}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">4.2.2 Main Kelompok:</span>
                                <span className="font-bold">{selectedGuest.social.sociability.groupPlay}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">4.2.3 Teman Bermain:</span>
                                <span className="font-bold">{selectedGuest.social.sociability.bestFriend}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">4.2.4 Lokasi Bermain:</span>
                                <span className="font-bold">{selectedGuest.social.sociability.playLocation}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-gray-500">4.2.6 Game Favorit:</span>
                                <span className="font-bold">{selectedGuest.social.sociability.favoriteGames}</span>
                             </div>
                             <div className="flex flex-col gap-1 mt-2">
                                <span className="text-gray-500">Kemandirian:</span>
                                <div className="flex flex-wrap gap-1">
                                   {selectedGuest.social.independence.map((ind: string) => (
                                      <span key={ind} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-[8px] font-bold">{ind}</span>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Learning */}
                       <div className="p-6 bg-[#161b22] rounded-[2rem] border border-white/5 space-y-4">
                          <h4 className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">Kebiasaan Belajar</h4>
                          <div className="space-y-2 text-xs">
                             <div className="flex justify-between">
                                <span className="text-gray-500">6.1 Durasi:</span>
                                <span className="font-bold">{selectedGuest.learning.duration}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">6.2 Waktu Belajar:</span>
                                <span className="font-bold">{selectedGuest.learning.time}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">6.4 Jadwal Belajar:</span>
                                <span className="font-bold">{selectedGuest.learning.schedule}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">6.5 Tempat Belajar:</span>
                                <span className="font-bold">{selectedGuest.learning.location}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">6.6 Kemandirian:</span>
                                <span className="font-bold">{selectedGuest.learning.independence}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-gray-500">6.3 Materi:</span>
                                <p className="font-bold">{selectedGuest.learning.matter.join(', ')}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* Emotional Profile */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Profil Emosi & Adaptasi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { l: '10.1 Senang Saat', v: selectedGuest.emotion.emotions.happyWhat },
                         { l: '10.2 Ungkapan Senang', v: selectedGuest.emotion.emotions.happyHow },
                         { l: '10.3 Sedih Saat', v: selectedGuest.emotion.emotions.sadWhat },
                         { l: '10.4 Ungkapan Sedih', v: selectedGuest.emotion.emotions.sadHow },
                         { l: '10.5 Marah Saat', v: selectedGuest.emotion.emotions.angryWhat },
                         { l: '10.6 Ungkapan Marah', v: selectedGuest.emotion.emotions.angryHow },
                         { l: '9.1 Penyesuaian Lingk. Baru', v: selectedGuest.emotion.socialAdjustment.newEnv },
                         { l: '9.2 Penyesuaian Tugas Baru', v: selectedGuest.emotion.socialAdjustment.newTask },
                         { l: '9.3 Penyesuaian Aturan Baru', v: selectedGuest.emotion.socialAdjustment.rules },
                         { l: '10.7 Perbedaan dg Sebaya', v: selectedGuest.emotion.additional.differentFromPeers + (selectedGuest.emotion.additional.differentFromPeersDesc ? `: ${selectedGuest.emotion.additional.differentFromPeersDesc}` : '') },
                         { l: '10.8 Pendiam / Tertekan', v: selectedGuest.emotion.additional.quiet + (selectedGuest.emotion.additional.quietDesc ? `: ${selectedGuest.emotion.additional.quietDesc}` : '') },
                         { l: '10.9 Sulit Konsentrasi', v: selectedGuest.emotion.additional.distractible + (selectedGuest.emotion.additional.distractibleDesc ? `: ${selectedGuest.emotion.additional.distractibleDesc}` : '') },
                         { l: '10.10 Mengganggu Orang Lain', v: selectedGuest.emotion.additional.interferesOthers + (selectedGuest.emotion.additional.interferesOthersDesc ? `: ${selectedGuest.emotion.additional.interferesOthersDesc}` : '') },
                         { l: '10.12 Masalah Sekolah', v: selectedGuest.emotion.additional.schoolIssues + (selectedGuest.emotion.additional.schoolIssuesDesc ? `: ${selectedGuest.emotion.additional.schoolIssuesDesc}` : '') },
                         { l: '10.14 Kendala Fisik', v: selectedGuest.emotion.additional.PhysicalIssues + (selectedGuest.emotion.additional.PhysicalIssuesDesc ? `: ${selectedGuest.emotion.additional.PhysicalIssuesDesc}` : '') },
                       ].map((item, i) => (
                         <div key={i} className="p-6 bg-[#0b0e14] border border-white/10 rounded-3xl">
                            <h5 className="text-[9px] uppercase font-black text-pink-500 tracking-widest mb-3">{item.l}</h5>
                            <p className="text-xs text-gray-400 leading-relaxed italic">"{item.v || 'Tidak ada keterangan'}"</p>
                         </div>
                       ))}
                    </div>
                  </section>

                  {/* Behavior Checklist (already exists, but kept for context) */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Checklist Perilaku</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       {Object.entries(selectedGuest.behavior)
                         .filter(([_, v]) => v === 'Ya')
                         .map(([key, _], idx) => (
                           <div key={idx} className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                              <span className="w-5 h-5 bg-primary text-white rounded flex items-center justify-center text-[9px] font-black">{key.replace('q', '')}</span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Kriteria {key.replace('q', '')} Terdeteksi</span>
                           </div>
                         ))}
                    </div>
                  </section>

                  {/* Sensory Profile Summary */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Profil Sensory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {sensorySections.map(section => {
                          const sectionData = Object.entries(selectedGuest.sensoryProfile || {})
                            .filter(([k]) => k.startsWith(section.id));
                          
                          if (sectionData.length === 0) return null;

                          return (
                            <div key={section.id} className="p-6 bg-[#161b22] border border-white/5 rounded-3xl space-y-4">
                               <h4 className="text-[10px] uppercase font-black text-primary tracking-widest">{section.title}</h4>
                               <div className="space-y-1">
                                  {sectionData.slice(0, 5).map(([key, val]) => (
                                     <div key={key} className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500">Pernyataan {key.replace(section.id, '')}</span>
                                        <span className="px-2 py-0.5 bg-white/5 rounded font-bold">{val as string}</span>
                                     </div>
                                  ))}
                                  {sectionData.length > 5 && (
                                     <p className="text-[9px] text-gray-600 italic">...dan {sectionData.length - 5} lainnya</p>
                                  )}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                  </section>

                  {/* Observation Sheet Summary */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter border-b border-white/10 pb-4">Observasi Bicara, Bahasa & Motorik</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {observationQuestions.map((q, idx) => {
                          const val = selectedGuest.observation?.[`obs${idx+1}`];
                          if (!val) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center p-4 bg-[#161b22] border border-white/5 rounded-2xl">
                               <span className="text-[10px] text-gray-400 font-medium max-w-[70%]">{idx+1}. {q}</span>
                               <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${val === 'Mampu' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                  {val}
                               </span>
                            </div>
                          );
                       })}
                    </div>
                  </section>

                  <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 text-center space-y-4 no-print">
                     <p className="text-xs text-gray-500 font-medium">Data ini diisi oleh keluarga melalui form registrasi tamu dan siap diproses ke tahap assesmen.</p>
                     <button 
                       onClick={() => {
                          if (onPromote) onPromote(selectedGuest);
                       }}
                       className="px-8 py-3 bg-primary rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
                     >Proses Verifikasi & Jadikan Siswa</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Template (Hidden by default, visible only in print) */}
      <div className="print-only hidden print:block bg-white text-black p-12 min-h-screen font-sans">
        {selectedGuest && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Letterhead */}
            <div className="flex items-center justify-between border-b-4 border-[#1e40af] pb-8">
               <div className="flex items-center gap-4">
                  <img src={logoUrl || "https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png"} alt="Logo" className="w-24 h-24" />
                  <div>
                    <h1 className="text-4xl font-black text-[#1e40af] tracking-tighter uppercase leading-none">Pelangi Lazuardi</h1>
                    <p className="text-base font-bold text-[#1e40af] uppercase tracking-[0.2em] mt-1">Pusat Terapi Tumbuh Kembang Anak</p>
                    <div className="h-0.5 w-full bg-gray-100 my-2" />
                    <p className="text-[10px] text-gray-500 italic max-w-sm">Griya Cinere I, Jl. Garuda Ujung No.35, Limo, Kota Depok, Jawa Barat 16515</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="px-6 py-3 bg-[#1e40af] text-white rounded-xl inline-block font-black text-sm uppercase tracking-widest shadow-lg">
                    FORMULIR PENDAFTARAN
                  </div>
                  <div className="mt-4 space-y-0.5">
                    <p className="text-[10px] font-black text-gray-800 uppercase">Registration ID: <span className="text-[#1e40af]">{selectedGuest.registrationId}</span></p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tgl Daftar: {new Date(selectedGuest.registrationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-12 py-10">
               {/* Identity */}
               <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">I. IDENTITAS ANAK</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                     {[
                       { l: 'Nama Lengkap', v: selectedGuest.child.fullName },
                       { l: 'Nama Panggilan', v: selectedGuest.child.nickName },
                       { l: 'Tempat, Tanggal Lahir', v: `${selectedGuest.child.birthPlace}, ${selectedGuest.child.birthDate}` },
                       { l: 'Usia Saat Ini', v: selectedGuest.child.age },
                       { l: 'Jenis Kelamin', v: selectedGuest.child.gender },
                       { l: 'Asal Sekolah', v: selectedGuest.child.school },
                       { l: 'Kelas / Tingkat', v: selectedGuest.child.class },
                       { l: 'Alamat Rumah', v: selectedGuest.child.address },
                       { l: 'Telepon Rumah', v: selectedGuest.child.phone }
                     ].map((f, i) => (
                       <div key={i} className="flex flex-col border-b border-gray-100 pb-2">
                          <span className="text-[9px] font-black text-[#1e40af] uppercase tracking-[0.1em] mb-1">{f.l}</span>
                          <span className="text-sm font-bold text-gray-800">{f.v || '-'}</span>
                       </div>
                     ))}
                  </div>
               </section>

               {/* Parents & Siblings Print */}
               <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">II. DATA ORANG TUA / WALI</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     {['father', 'mother'].map(p => (
                       <div key={p} className="space-y-3">
                          <div className="px-4 py-1.5 bg-gray-100 rounded-lg inline-block">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{p === 'father' ? 'AYAH / WALI' : 'IBU / WALI'}</h4>
                          </div>
                          <div className="space-y-1.5">
                             {[
                               { label: 'Nama', value: selectedGuest.family[p].name },
                               { label: 'Umur', value: selectedGuest.family[p].age },
                               { label: 'Suku / Agama', value: `${selectedGuest.family[p].ethnicity} / ${selectedGuest.family[p].religion}` },
                               { label: 'Urutan Anak', value: `Ke ${selectedGuest.family[p].order} dari ${selectedGuest.family[p].totalSiblings}` },
                               { label: 'Tahun Nikah', value: selectedGuest.family[p].marriageYear },
                               { label: 'Pendidikan', value: selectedGuest.family[p].education },
                               { label: 'Pekerjaan', value: selectedGuest.family[p].job },
                               { label: 'Alamat', value: selectedGuest.family[p].address },
                               { label: 'HP', value: selectedGuest.family[p].phone }
                             ].map((field, idx) => (
                               <div key={idx} className="flex justify-between items-end border-b border-gray-100 pb-0.5">
                                  <span className="text-[8px] text-gray-400 font-bold uppercase">{field.label}</span>
                                  <span className="text-[10px] font-black text-gray-700">{field.value || '-'}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="mt-8 space-y-3">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daftar Urutan Anak</h4>
                     <table className="w-full border-collapse border border-gray-200 text-[10px]">
                        <thead>
                           <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="p-2 border-r border-gray-200">No</th>
                              <th className="p-2 border-r border-gray-200">Nama</th>
                              <th className="p-2 border-r border-gray-200 text-center">L/P</th>
                              <th className="p-2 border-r border-gray-200 text-center">Usia</th>
                              <th className="p-2 border-r border-gray-200">Pend.</th>
                              <th className="p-2">Ket.</th>
                           </tr>
                        </thead>
                        <tbody>
                           {selectedGuest.siblings?.map((s: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                 <td className="p-2 border-r border-gray-200 text-center">{i + 1}</td>
                                 <td className="p-2 border-r border-gray-200 font-bold">{s.name}</td>
                                 <td className="p-2 border-r border-gray-200 text-center">{s.gender}</td>
                                 <td className="p-2 border-r border-gray-200 text-center">{s.age}</td>
                                 <td className="p-2 border-r border-gray-200">{s.education}</td>
                                 <td className="p-2 text-gray-400">{s.remarks || '-'}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>

               {/* Birth History */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">III. RIWAYAT KELAHIRAN</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PRA-NATA</h4>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Masalah saat mengandung:</p>
                              <p className="text-xs font-bold mt-1">{selectedGuest.birth.prenatal.problems || '-'}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Kondisi Fisik Bunda:</p>
                              <p className="text-xs font-bold mt-1">{selectedGuest.birth.prenatal.physicalCondition || '-'}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Kondisi Emosi Bunda:</p>
                              <p className="text-xs font-bold mt-1">{selectedGuest.birth.prenatal.emotionalCondition || '-'}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PARTUS (KELAHIRAN)</h4>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Usia Kandungan:</p>
                              <p className="text-xs font-bold">{selectedGuest.birth.delivery.duration} Minggu</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Proses:</p>
                              <p className="text-xs font-bold">{selectedGuest.birth.delivery.process}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">Kondisi Lahir:</p>
                              <p className="text-xs font-bold">{selectedGuest.birth.delivery.condition}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-[#1e40af] uppercase">ASI Sampai:</p>
                              <p className="text-xs font-bold">{selectedGuest.birth.delivery.breastfeedingUntil}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* IV. Additional Observations */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">IV. PERKEMBANGAN & KESEHATAN</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">KEMANDIRIAN MAKAN & MINUM</h4>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                           {[
                              { l: 'Masih Disuapi', v: selectedGuest.development.feeding.fedBy },
                              { l: 'Makan Dengan', v: selectedGuest.development.feeding.eatsWith },
                              { l: 'Sinyal Lapar', v: selectedGuest.development.feeding.hungerSignal },
                              { l: 'Sukar Duduk', v: selectedGuest.development.feeding.difficultySitting },
                              { l: 'Posisi Menyulitkan', v: selectedGuest.development.feeding.difficultPositions },
                              { l: 'Minuman Disukai', v: (selectedGuest.development.preferences.drinks || []).join(', ') },
                              { l: 'Suka Buah', v: selectedGuest.development.preferences.fruits },
                              { l: 'Rasa Disukai', v: selectedGuest.development.preferences.favoriteTaste }
                           ].map((item, idx) => (
                              <div key={idx} className="flex justify-between border-b border-gray-200 pb-1">
                                 <span className="text-[8px] text-gray-400 font-bold uppercase">{item.l}:</span>
                                 <span className="text-[10px] font-bold text-gray-700">{item.v || '-'}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">RIWAYAT PENYAKIT</h4>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <div className="flex flex-wrap gap-2">
                              {selectedGuest.health.illnesses?.length > 0 ? (
                                 selectedGuest.health.illnesses.map((ill: string) => (
                                    <span key={ill} className="px-2 py-1 bg-white border border-gray-200 text-[10px] font-bold text-gray-700 rounded-md">{ill}</span>
                                 ))
                              ) : (
                                 <p className="text-[10px] text-gray-400 italic">Tidak ada riwayat penyakit dicatat</p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">V. PENGAMATAN FISIK & SOSIAL</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     <div>
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">4.2 KEBIASAAN & SOSIAL</h4>
                       <div className="space-y-4 text-xs">
                          <div className="flex justify-between border-b pb-1">
                             <span className="text-gray-400">4.2.1 Sifat:</span>
                             <span className="font-bold">{selectedGuest.social.sociability.shyness}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                             <span className="text-gray-400">4.2.2 Main Kelompok:</span>
                             <span className="font-bold">{selectedGuest.social.sociability.groupPlay}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                             <span className="text-gray-400">4.2.3 Teman Bermain:</span>
                             <span className="font-bold">{selectedGuest.social.sociability.bestFriend}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                             <span className="text-gray-400">4.2.4 Lokasi Bermain:</span>
                             <span className="font-bold">{selectedGuest.social.sociability.playLocation}</span>
                          </div>
                       </div>
                     </div>
                     <div>
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">4.1 KEMANDIRIAN</h4>
                       <p className="text-[10px] font-bold text-gray-700 leading-relaxed italic border-b border-gray-100 pb-2">
                          {selectedGuest.social.independence.join(', ')}
                       </p>
                       <div className="pt-2">
                          <p className="text-[8px] font-black text-[#1e40af] uppercase">4.2.6 Game Favorit:</p>
                          <p className="text-[10px] font-bold text-gray-700">{selectedGuest.social.sociability.favoriteGames || '-'}</p>
                       </div>
                    </div>
                 </div>
              </section>

              {/* VI. Learning Habits Print */}
              <section className="break-before-page pt-10">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                   <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">VI. KEBIASAAN BELAJAR (BAGIAN 6)</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       {[
                         { l: '6.1 Durasi Belajar', v: selectedGuest.learning.duration },
                         { l: '6.2 Waktu Belajar', v: selectedGuest.learning.time },
                         { l: '6.4 Jadwal Belajar', v: selectedGuest.learning.schedule },
                         { l: '6.5 Tempat Belajar', v: selectedGuest.learning.location },
                         { l: '6.6 Kemandirian Belajar', v: selectedGuest.learning.independence }
                       ].map((f, i) => (
                         <div key={i} className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{f.l}:</span>
                            <span className="text-[10px] font-bold text-gray-800">{f.v || '-'}</span>
                         </div>
                       ))}
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-[#1e40af] uppercase mb-2">6.3 Materi yang Dipelajari:</p>
                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-700 italic">
                             {(selectedGuest.learning.matter || []).join(', ') || '-'}
                          </p>
                       </div>
                    </div>
                 </div>
              </section>

              {/* VII. Emotional Profile & Social Adjustment Print */}
              <section className="break-before-page pt-10">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                   <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">VII. EMOSI & PENYESUAIAN SOSIAL</h3>
                 </div>
                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                       {[
                          { l: '10.1 Senang Saat', v: selectedGuest.emotion.emotions.happyWhat },
                          { l: '10.2 Ungkapan Senang', v: selectedGuest.emotion.emotions.happyHow },
                          { l: '10.3 Sedih Saat', v: selectedGuest.emotion.emotions.sadWhat },
                          { l: '10.4 Ungkapan Sedih', v: selectedGuest.emotion.emotions.sadHow },
                          { l: '10.5 Marah Saat', v: selectedGuest.emotion.emotions.angryWhat },
                          { l: '10.6 Ungkapan Marah', v: selectedGuest.emotion.emotions.angryHow }
                       ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                             <p className="text-[8px] font-black text-[#1e40af] uppercase">{item.l}:</p>
                             <p className="text-[10px] font-medium text-gray-700 leading-tight italic">{item.v || '-'}</p>
                          </div>
                       ))}
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       {[
                          { label: '9.1 Lingkungan Baru', value: selectedGuest.emotion.socialAdjustment.newEnv },
                          { label: '9.2 Tugas Baru', value: selectedGuest.emotion.socialAdjustment.newTask },
                          { label: '9.3 Aturan Baru', value: selectedGuest.emotion.socialAdjustment.rules }
                       ].map((item, idx) => (
                          <div key={idx} className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-[8px] font-black text-[#1e40af] uppercase tracking-widest">{item.label}</p>
                             <p className="text-[10px] font-bold text-gray-700 leading-tight italic">{item.value || '-'}</p>
                          </div>
                       ))}
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PERILAKU KHUSUS</h4>
                       <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                          {[
                             { q: "10.7 Perilaku berbeda dari sebaya", v: selectedGuest.emotion.additional.differentFromPeers, d: selectedGuest.emotion.additional.differentFromPeersDesc },
                             { q: "10.8 Pendiam / Tertekan", v: selectedGuest.emotion.additional.quiet, d: selectedGuest.emotion.additional.quietDesc },
                             { q: "10.9 Sulit konsentrasi / Gelisah", v: selectedGuest.emotion.additional.distractible, d: selectedGuest.emotion.additional.distractibleDesc },
                             { q: "10.10 Mengganggu orang lain", v: selectedGuest.emotion.additional.interferesOthers, d: selectedGuest.emotion.additional.interferesOthersDesc },
                             { q: "10.12 Masalah di sekolah", v: selectedGuest.emotion.additional.schoolIssues, d: selectedGuest.emotion.additional.schoolIssuesDesc },
                             { q: "10.14 Kendala fisik / kesehatan", v: selectedGuest.emotion.additional.PhysicalIssues, d: selectedGuest.emotion.additional.PhysicalIssuesDesc }
                          ].map((item, idx) => (
                             <div key={idx} className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-800">{item.q}?</p>
                                <p className="text-[10px] font-black text-[#1e40af] uppercase">{item.v}</p>
                                {item.d && <p className="text-[9px] font-medium text-gray-500 italic">Ket: {item.d}</p>}
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </section>

               {/* VIII. Referral */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">VIII. FORMULIR RUJUKAN</h3>
                  </div>
                  <div className="space-y-8">
                     {[
                       { q: '1. Gambaran anak secara umum:', a: selectedGuest.referral.generalOverview },
                       { q: '2. Perilaku atau keluhan yang dikeluhkan saat ini:', a: selectedGuest.referral.complaints },
                       { q: '3. Sejak kapan perilaku atau keluhan tersebut muncul:', a: selectedGuest.referral.sinceWhen },
                       { q: '4. Hal-hal yang diperkirakan mendasari kemunculan perilaku tersebut:', a: selectedGuest.referral.underlyingFactors },
                       { q: '5. Hal-hal yang meredakan / menghilangkan perilaku tersebut:', a: selectedGuest.referral.relievingFactors },
                       { q: '6. Tindakan yang sudah dilakukan untuk menangani perilaku tersebut:', a: selectedGuest.referral.actionsTaken },
                       { q: '7. Hasil yang sudah dicapai ananda:', a: selectedGuest.referral.resultsAchieved },
                       { q: 'Sasaran yang ingin dicapai terhadap ananda:', a: selectedGuest.referral.goals },
                       { q: 'Sumber Informasi Klien:', a: selectedGuest.referralSource || selectedGuest.referral?.source || 'Instagram' }
                     ].map((item, i) => (
                       <div key={i} className="space-y-2 border-l-2 border-gray-100 pl-4 py-1">
                          <p className="text-[10px] font-black uppercase text-[#1e40af] tracking-tight">{item.q}</p>
                          <p className="text-sm text-gray-700 leading-relaxed italic">
                            {item.a || '-'}
                          </p>
                       </div>
                     ))}
                  </div>
               </section>

               {/* IX. Checklist Perilaku Full Table */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">IX. CHECKLIST TINGKAH LAKU</h3>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-12">No.</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Pernyataan Perilaku</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right w-24">Jawaban</th>
                           </tr>
                        </thead>
                        <tbody>
                           {[
                             "Sering tidak suka disentuh / Gelisah bila disentuh",
                             "Sering mencari kontak fisik yang berlebihan",
                             "Tampak mudah geli",
                             "Sering menunjukkan keseimbangan yang buruk",
                             "Kesulitan naik / turun tangga",
                             "Sering meletakkan kepala di atas tangan",
                             "Sering takut pada aktifitas fisik yang cepat",
                             "Sering memilih kegiatan fisik yang cepat",
                             "Kesulitan dalam ketrampilan tangan",
                             "Tampak ceroboh / Sering mengalami kecelakaan",
                             "Gerakkan tubuh berlebihan saat tidak diperlukan",
                             "Posisi berdiri yang tidak tegap",
                             "Memegang benda (alat tulis/makan) sangat kuat",
                             "Memegang benda (alat tulis/makan) sangat lemah",
                             "Tampak mudah lelah saat melakukan aktifitas",
                             "Sering takut pada suara keras",
                             "Sulit berkonsentrasi di tempat berisik",
                             "Sering berteriak",
                             "Tidak memahami instruksi verbal",
                             "Perintah sering harus diulangi",
                             "Sulit membedakan bentuk / warna / ukuran",
                             "Sulit mengarahkan pandangan pada satu benda",
                             "Sering mengusap mata berlebihan",
                             "Kebingungan pada angka dan huruf",
                             "Sulit memahami instruksi tertulis",
                             "Kesulitan menyalin tulisan",
                             "Tampak sensitif pada bau tertentu",
                             "Selalu bergerak / Terlalu bersemangat",
                             "Sangat impulsif / Sulit menunda keinginan",
                             "Sulit mengatur aktifitas atau barang-barangnya"
                           ].map((q, idx) => (
                             <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="p-3 text-[10px] font-bold text-gray-400">{idx + 1}</td>
                                <td className="p-3 text-[10px] font-medium text-gray-700">{q}</td>
                                <td className="p-3 text-right">
                                   <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${selectedGuest.behavior[`q${idx+1}`] === 'Ya' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-400'}`}>
                                      {selectedGuest.behavior[`q${idx+1}`] || 'Tidak'}
                                   </span>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>

               {/* X. Sensory Profile Full Table */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">X. PROFIL SENSORY</h3>
                  </div>
                  <div className="space-y-10">
                     {sensorySections.map(section => (
                        <div key={section.id} className="space-y-4">
                           <h4 className="text-xs font-black text-[#1e40af] bg-gray-100 p-2 rounded tracking-widest">{section.title}</h4>
                           <div className="grid grid-cols-1 gap-2">
                              {Object.entries(selectedGuest.sensoryProfile || {})
                                .filter(([k]) => k.startsWith(section.id))
                                .map(([key, val]) => (
                                   <div key={key} className="flex justify-between items-center border-b border-gray-50 pb-1">
                                      <span className="text-[10px] text-gray-600">Pernyataan {key.replace(section.id, '')}</span>
                                      <span className="text-[10px] font-black text-gray-800 uppercase">{val as string}</span>
                                   </div>
                                ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* XI. Observation Sheet Full Table */}
               <section className="break-before-page pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-[#1e40af] rounded-full" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#1e40af]">XI. OBSERVASI BICARA, BAHASA & MOTORIK</h3>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">No.</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Pernyataan / Kemampuan</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Hasil</th>
                           </tr>
                        </thead>
                        <tbody>
                           {observationQuestions.map((q, idx) => (
                              <tr key={idx} className="border-b border-gray-100 last:border-0">
                                 <td className="p-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                                 <td className="p-4 text-xs font-medium text-gray-700">{q}</td>
                                 <td className="p-4 text-right">
                                    <span className={`text-[10px] font-black uppercase ${selectedGuest.observation?.[`obs${idx+1}`] === 'Mampu' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                       {selectedGuest.observation?.[`obs${idx+1}`] || '-'}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </section>
            </div>

            <div className="pt-32 flex justify-between items-end pb-12">
               <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Digital Signature Hash: {selectedGuest.registrationId.split('-')[1]}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Terapi Pelangi Lazuardi • Integrated Management System</p>
                  <p className="text-[8px] text-gray-300">Griya Cinere | Depok | Jawa Barat</p>
               </div>
               <div className="text-center space-y-24 px-12 border-t-2 border-gray-50 pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verifikasi Orang Tua / Wali</p>
                    <p className="text-[8px] text-gray-300 uppercase tracking-widest">Ttd & Nama Terang</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase text-gray-800 underline decoration-2 decoration-[#1e40af] underline-offset-4">
                      {selectedGuest.family.father.name || selectedGuest.family.mother.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic mt-2">Document Validated by System</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestManagementPage;
