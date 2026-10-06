
import React, { useState, useMemo, useCallback } from 'react';
import { Child, TherapyDefinition, RapotArchiveItem, RapotArchiveFolder } from '../types';
import { 
  ClipboardList, 
  Search, 
  Printer, 
  FileText, 
  User as UserIcon,
  Activity,
  Heart,
  Brain,
  MessageSquare,
  Stethoscope,
  CheckSquare,
  TrendingUp,
  History,
  Check,
  ChevronDown,
  Plus,
  X,
  Save,
  ShieldCheck,
  Folder,
  FolderOpen,
  ChevronRight,
  MoreVertical,
  Trash2,
  FolderPlus,
  Eye,
  Download,
  Waves,
  Calendar,
  Sparkles,
  Palette,
  Music,
  Dumbbell,
  Smile,
  Layers
} from 'lucide-react';
import HydrotherapyIcon from './icons/HydrotherapyIcon';
import EquineTherapyIcon from './icons/EquineTherapyIcon';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import AchievementChartPage from './AchievementChartPage';
import RapotPrintPreviewModal from './RapotPrintPreviewModal';
import RapotArchiveView from './RapotArchiveView';
import { 
  getStoredArchives, 
  saveStoredArchives, 
  getStoredFolders, 
  saveStoredFolders, 
  formatArchiveDate, 
  formatArchiveTime, 
  generateArchiveFileName 
} from '../utils/rapotArchiveStorage';
import { triggerBrowserA4Print, formatRapotDownloadFileName } from '../utils/rapotPdfGenerator';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_OT = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Okupasi Terapis',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName2: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      perilakuUmum: 'Perilaku Umum',
      sensory: 'A. Sensory Processing',
      motorik: 'B. Perkembangan Kemampuan Motorik',
      kognisi: 'C. Perkembangan Kemampuan Konsep, Persepsi, dan Kognisi',
      emosi: 'D. Perkembangan Kemampuan Kapasitas Emosi',
      followUp: 'E. FOLLOW UP',
      homeProgram: 'F. HOME PROGRAM',
      komentarPerilaku: 'Komentar:',
      komentarSensory: 'Komentar:',
      komentarMotorik: 'Komentar:',
      komentarKognisi: 'Komentar:',
      komentarEmosi: 'Komentar:',
      labelKomentarPeninjauan: 'Komentar Peninjauan :',
      labelCatatanPerilaku: 'Catatan Perilaku :',
      labelKomentarSensori: 'Komentar Sensori :',
      labelKomentarMotorik: 'Komentar Motorik :',
      labelKomentarKognisi: 'Komentar Kognisi :',
      labelKomentarEmosi: 'Komentar Emosi :',
      labelNoReg: 'No. Registrasi',
      labelUnit: 'Asal Sekolah',
      labelTanggal: 'Tanggal Evaluasi',
      labelNama: 'Nama Lengkap',
      labelLahir: 'Tanggal Lahir',
      labelUsia: 'Usia',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'OCCUPATIONAL THERAPY PROGRESS REPORT',
      headerInstAddress: 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: '',
      komentarPimpinan: 'MENGETAHUI',
      sensoryModulasi: '1. SENSORI MODULASI',
      sensoryDiskriminasi: '2. SENSORI DISKRIMINASI',
      sensoryPraksis: '3. PRAKSIS',
      motorikKasar: '1. MOTORIK KASAR',
      motorikHalus: '2. MOTORIK HALUS',
      headerAwal: 'AWAL',
      headerHasil: 'HASIL',
      tableHeaderIndikator: 'RESPON',
      tableHeaderAktivitas: 'AKTIVITAS',
      tableHeaderSensori: 'RESPON',
      scaleSensoryMod: 'B/S/K/BR',
      scaleSensory: 'MD/SD/TD',
      scaleMotorik: 'MD/SD/TD',
      scaleKognisi: 'TM/KP/KTK/KK',
      scaleEmosi: 'T/K/S/H',
      scalePerilaku: 'teramati/tidak'
    }
  },
  identitas: { noRegistrasi: 'R. 033-2025', tanggalEvaluasi: '2025-06-19', unit: '-', terapis: 'Eka Talia Kameswari, A.Md.OT', tanggalLahir: '', usia: '' },
  managerComment: '',
  perilakuUmum: {
    items: [
      { id: 'eksplorasi', label: 'Terlibat dalam perilaku eksplorasi', awal: 'teramati', hasil: 'teramati' },
      { id: 'fokus', label: 'Fokus mengerjakan tugas sampai selesai', awal: 'tidak', hasil: 'teramati' },
      { id: 'interaksi', label: 'Membangun interaksi dengan orang di sekitarnya', awal: 'teramati', hasil: 'teramati' },
      { id: 'impulsif', label: 'Perilaku impulsif', awal: 'teramati', hasil: 'tidak' },
    ],
    komentar: 'Pada hari pertama terapi pada Februari 2025, Ananda cenderung asyik dengan dirinya sendiri dan mengeksplorasi. Ananda belum bisa duduk tenang. Kepatuhan Ananda dalam mengikuti intruksi belum terbangun. Kebutuhan gerak Ananda masih cukup tinggi (suka berlari-larian di dalam ruangan) serta impulsif. Respon Ananda terhadap suara masih kesulitan untuk menyeleksi suara yang muncul. Setelah intervensi sampai Mei 2025, Ananda menunjukkan adanya perilaku yang lebih adaptif. Ananda mulai mau mengikuti arahan yang diberikan, kepatuhan lebih konsisten.'
  },
  sensory: {
    modulasi: [
      { label: 'Respon terhadap input taktil', awal: 'S', hasil: 'S' },
      { label: 'Respon terhadap ketinggian', awal: 'BR', hasil: 'S' },
      { label: 'Respon terhadap objek yang bergoyang', awal: 'B', hasil: 'BR' },
    ],
    diskriminasi: [
      { label: 'Membedakan tekstur saat mata tertutup', awal: 'MD', hasil: 'TD' },
      { label: 'Menggunakan sejumlah tenaga yang tepat', awal: 'SD', hasil: 'MD' },
      { label: 'Mampu bergerak secara luwes', awal: 'MD', hasil: 'MD' },
      { label: 'Gerak dua anggota tubuh berpola', awal: 'SD', hasil: 'SD' },
    ],
    praksis: [
      { label: 'Koordinasi bilateral', awal: 'SD', hasil: 'SD' },
      { label: 'Mempersiapkan diri terhadap aksi motorik', awal: 'SD', hasil: 'MD' },
      { label: 'Memperhitungkan tahapan aksi (waktu akurat dan target bergerak)', awal: 'SD', hasil: 'SD' },
      { label: 'Mengulang pola motorik secara efisien', awal: 'SD', hasil: 'MD' },
    ],
    komentar: 'Di bulan Februari 2025 respon ananda masih sering berlebihan jika berada di ketinggian dan objek yang bergoyang, ananda akan lebih aktif berbicara sampai sedikit teriak. Setelah intervensi sampai Juni 2025, ananda lebih tenang saat berada di ketinggian tetapi dalam menaggapi objek yang bergoyang ananda masih terlihat cemas.'
  },
  motorik: {
    kasar: [
      { label: 'Lompat buka dan tutup', awal: 'MD', hasil: 'MD' },
      { label: 'Lompat mundur', awal: 'TD', hasil: 'SD' },
      { label: 'Melambungkan bola sesuai dengan target', awal: 'SD', hasil: 'MD' },
    ],
    halus: [
      { label: 'Menggunting', awal: 'SD', hasil: 'SD' },
      { label: 'Menyendok', awal: 'MD', hasil: 'MD' },
      { label: 'Menjepit', awal: 'SD', hasil: 'TD' },
    ],
    komentar: 'Pada bulan Februari 2025 ananda masih terlihat tidak mampu melakukan beberapa aktivitas motorik kasar seperti gerakan melompat mundur, melempar bola basket ke target. Seletah intervensi sampai dengan Februari 2025, ananda masih terlihat kesulitan tetapi menunjukan kemajuan.'
  },
  kognisi: {
    items: [
      { label: 'Urutan aktivitas', awal: 'KP', hasil: 'KK' },
      { label: 'Mencari kartu kata', awal: 'KP', hasil: 'KTK' },
      { label: 'Membuat kalimat cerita', awal: 'KTK', hasil: 'KTK' },
      { label: 'Berhitung', awal: 'KTK', hasil: 'KTK' },
    ],
    komentar: 'Pada kemampuan pemahaman dan konsep ananda masih banyak perlu latihan, eksplorasi kata ananda masih kurang sehingga saat diajak bertanya jawab walau sudah mampu mengerti apa yang ditanyakan ananda masih kesulitan mengungkapkan dengan kata yang sesuai.'
  },
  emosi: {
    items: [
      { cat: 'Regulasi', label: 'Regulasi emosi ketika ada yang tidak sesuai dengan keinginan', awal: 'S', hasil: 'K' },
      { cat: 'Minat', label: 'Menanggapi tawaran terapis dengan rasa ingin tau dan minat yang seru', awal: 'S', hasil: 'S' },
      { cat: 'Sosial', label: 'Melakukan komunikasi dua arah', awal: 'S', hasil: 'S' },
      { cat: 'Niat', label: 'Menyatakan niat, minat, dan perasaan', awal: 'S', hasil: 'S' },
    ],
    komentar: 'Saat ini ananda sudah lebih panjang dan tertata dalam membuat kalimat dan mengungkapkan keinginannya, ananda juga lebih bijak dalam bersikap walau sesekali impulsivitasnya masih mendominasi.'
  },
  followUp: [
    'Masih melakukan intervensi untuk membantu ananda merespon stimulus dengan tepat',
    'Masih melakukan intervensi pada kegiatan yang memerlukan komponen motoric',
    'Masih melakukan intervensi guna meningkatkan kemampuan perceptual dan pemahaman kosep',
    'Masih melakukan intervensi guna meningkatkan kemampuan kapasitas emosi'
  ],
  homeProgram: [
    { aktivitas: 'Daily Routine Schedule', frekuensi: 'Setiap Hari', durasi: 'Menyesuaikan' },
    { aktivitas: 'Household (Manajemen rumah)', frekuensi: 'Menyesuaikan', durasi: 'Menyesuaikan' },
    { aktivitas: 'Jalan Pagi / Olahraga Bersama', frekuensi: 'Menyesuaikan', durasi: 'Menyesuaikan' },
    { aktivitas: 'Bersepeda', frekuensi: '1 Kali Seminggu', durasi: 'Menyesuaikan' },
    { aktivitas: 'Berenang', frekuensi: '1 kali dalam sebulan', durasi: 'Menyesuaikan' },
    { aktivitas: 'Playground / Outbond', frekuensi: 'Menyesuaikan', durasi: 'Menyesuaikan' },
    { aktivitas: 'Trekking / Hiking', frekuensi: 'Menyesuaikan', durasi: 'Menyesuaikan' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_TW = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Pelangi Lazuardi LTC',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      reseptif: 'A. Kemampuan Bahasa Reseptif (Pemahaman)',
      ekspresif: 'B. Kemampuan Bahasa Ekspresif (Pengungkapan)',
      komentarReseptif: 'Komentar Bahasa Reseptif:',
      komentarEkspresif: 'Komentar Bahasa Ekspresif:',
      contohMenceritakan: 'Contoh ananda saat menceritakan kembali cerita dengan media buku cerita :',
      contohMengungkapkan: 'Contoh ananda saat mengungkapkan keinginan / pendapatnya :',
      followUp: 'TINDAK LANJUT / FOLLOW UP',
      homeProgram: 'PROGRAM DI RUMAH / HOME PROGRAM',
      labelNoReg: 'No. Registrasi:',
      labelUnit: 'Unit:',
      labelTanggal: 'Tanggal Evaluasi:',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'Speech Therapy Service',
      headerInstAddress: 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: 'FILE: LTC/TW/2025/',
      komentarPimpinan: 'TINJAUAN MANAJEMEN',
      labelKomentarPeninjauan: 'Komentar Peninjauan :',
      komentarSekolah: 'Komentar Guru / Sekolah:'
    }
  },
  identitas: { noRegistrasi: 'H.020-2025', tanggalEvaluasi: '2025-12-15', unit: 'Pelangi Lazuardi GCS', terapis: 'Adisty Ayuningtyas, A.Md.TW', tanggalLahir: '', usia: '' },
  managerComment: '',
  reseptif: {
    items: [
      { 
        label: 'Paham Instruksi 2 Tahap',
        tujuanTercapai: '10/12/2025',
        aktivitas: 'Selama sesi terapi kelompok bersama teman-teman, Ananda diminta untuk mengikuti instruksi 2 tahap. Misalnya : “Adilla lihat ke layar ipad lalu ikuti gerakan senamnya bersama-sama”.',
        awal: 'Pada awalnya, Ananda masih memerlukan pengulangan instruksi dari Terapis beberapa kali serta bantuan (verbal) untuk dapat memahami and mengikuti instruksi yang diberikan, terutama ketika instruksi terdiri dari beberapa tahap.',
        tujuan: 'Ananda mampu memahami and mengikuti instruksi lisan 2 tahap yang disampaikan Terapis with 1x penyampaian instruksi, serta melaksanakan kedua tahap instruksi tersebut secara mandiri tanpa bantuan.',
        hasil: 'Ananda mulai berusaha mengikuti instruksi yang diberikan, namun masih belum konsisten dalam memahami and melaksanakan instruksi lisan 2 tahap. Pada beberapa kesempatan, Ananda tetap memerlukan pengulangan instruksi and bantuan dari Terapis untuk dapat menyelesaikan kedua tahap perintah with benar.'
      },
      {
        label: 'Paham Konsep Kata Kerja',
        tujuanTercapai: '10/12/2025',
        media: 'Flashcard',
        aktivitas: 'Selama sesi terapi wicara, Ananda diberikan kartu gambar yang menggambarkan berbagai kata kerja and diminta untuk mengenali kata kerja tersebut.',
        awal: 'Ananda hanya mampu mengenali gambar kata kerja yang sudah sangat familiar baginya.',
        tujuan: 'Ananda mampu mengenali seluruh gambar kata kerja yang disajikan secara mandiri and konsisten.',
        hasil: 'Ananda masih membutuhkan bantuan dari Terapis untuk mengenali lebih banyak gambar kata kerja terutama yang kurang familiar.'
      }
    ],
    komentar: 'Di awal semester 1 pada kemampuan bahasa reseptif Ananda dalam memahami instruksi 2 tahap masih membutuhkan instruksi berulang-ulang dari Terapis. Hal ini disebabkan karena Ananda yang masih mudah terdistrak with lingkungan sekitar. Dalam mengenal konsep kata kerja, Ananda hanya mengenal konsep kata kerja yang familiar saja. Setelah diberikan intervensi selama kurang lebih 6 bulan dari bulan Juli-Desember dalam memahami instruksi 2 tahap Ananda terlihat masih belum konsisten. Ananda masih membutuhkan bantuan serta arahan dari Terapis. Dalam memahami konsep gambar kata kerja Ananda sudah mulai ada peningkatan dalam memahami beberapa macam jenis gambar kata kerja secara mandiri.'
  },
  ekspresif: {
    items: [
      {
        label: 'Latihan Meniru Pengujaran Konsonan Bilabial /p,b,m/ + Vokal /a,i,u,e,o/',
        tujuanTercapai: '10/12/2025',
        aktivitas: 'Latihan meniru konsonan bilabial /p,b,m/ + vokal /a,i,u,e,o/.',
        awal: 'Ananda mulai mau untuk meniru pengujaran konsonan bilabial /p,b,m/ + vokal /a,i,u,e,o/ namun masih kesulitan dalam mengujarkan with tepat.',
        tujuan: 'Mampu meniru pengujaran konsonan bilabial /p,b,m/ + vokal /a,i,u,e,o/ with tepat.',
        hasil: 'Ananda masih belum maksimal and tepat saat mengujarkan konsonan /p,b,m/ + vokal /a,i,u,e,o/.'
      },
      {
        label: 'Latihan Menceritakan Gambar',
        tujuanTercapai: '10/12/2025',
        media: 'Flashcard',
        aktivitas: 'Saat belajar with media kartu bergambar.',
        awal: 'Ananda masih membutuhkan bantuan maksimal dari Terapis agar bisa menceritakan gambar.',
        tujuan: 'Ananda mampu menceritakan gambar berpola S-P-O-K secara mandiri.',
        hasil: 'Ananda sudah mulai bisa untuk menceritakan gambar secara sederhana with mandiri meskipun masih banyak kesalahan artikulasi. Untuk menambahkan keterangan tempat, Ananda terkadang masih sering untuk diingatkan.'
      },
      {
        label: 'Latihan Mengungkapkan Sesuatu',
        tujuanTercapai: '10/12/2025',
        aktivitas: 'Saat melakukan aktivitas terapi.',
        awal: 'Ananda masih membutuhkan bantuan maksimal dari Terapis.',
        tujuan: 'Ananda mampu untuk mengungkapkan sesuatu kepada Terapis with mandiri.',
        hasil: 'Ananda sudah mulai bisa untuk mengungkapkan sesuatu with sedikit bantuan and arahan dari Terapis.'
      }
    ],
    contohMenceritakan: ['“Adek sedang kasih makan ayam”.', '“Ibu sedang setrika baju”.'],
    contohMengungkapkan: [
      { t: 'Posisi ketika Ananda merasa sedih karena habis di tegur oleh Mama nya.' },
      { q: '“Adila kenapa nangis?”', a: '“Sama Mama”.' },
      { q: '“Kenapa Mama? Adila di omelin Mama?”', a: '“ Iya Mama marah”.' },
      { q: '“Mama kenapa marah?”', a: '“Aduk-aduk”.' },
      { q: '“Adilla aduk-aduk makanan?”', a: '“Iya”.' }
    ],
    komentar: 'Di semester 1 ini kemampuan bahasa ekspresif Ananda dalam menirukan konsonan bilabial /p,b,m/ + vokal /a,i,u,e,o/ masih terlihat kesulitan dalam mengujarkannya with tepat. Lalu dalam menceritakan gambar and mengungkapkan sesuatu Ananda masih membutuhkan bantuan maksimal dari Terapis. Setelah diberikan intervensi dari bulan Juli - Desember kemampuan Ananda dalam menirukan pengujaran konsonan bilabial /p,b,m/ + vokal /a,i,u,e,o/ terlihat masih belum maksimal and tepat saat mengujarkan konsonan /p,b,m/ + vokal /a,i,u,e,o/. Dalam menceritakan gambar sederhana Ananda juga sudah mulai ada peningkatan.'
  },
  followUp: [
    'Melanjutkan program dalam memahami instruksi 2 tahap agar lebih konsisten.',
    'Melatih and memperbanyak pemahaman konsep-konsep dasar seperti kata benda and kata kerja.',
    'Melanjutkan program latihan artikulasi di rumah with rutin.',
    'Melanjutkan program kemampuan bahasa ekspresif dalam menamai gambar-gambar kata benda and kata kerja secara tepat tanpa ada kesalahan artikulasi.',
    'Melanjutkan program kemampuan bahasa ekspresif dalam mengungkapkan keinginannya.',
    'Melanjutkan program dalam menceritakan gambar berpola S-P-O-K.',
    'Melatih percakapan and diberikan arahan saat melakukan percakapan untuk komunikasi 2 arah yang tepat.'
  ],
  homeProgram: [
    { aktivitas: 'Bernyanyi bersama sambil mendengarkan berbagai macam lagu anak anak.', frekuensi: 'Setiap hari with durasi 30 menit.', tujuan: 'Untuk menambah kosa kata saat bicara.' },
    { aktivitas: 'Latihan Artikulasi konsonan Bilabial (p,b,m) with semua vokal', frekuensi: 'Setiap hari with durasi 30 menit.', tujuan: 'Untuk melatih penempatan artikulasi with tepat.' },
    { aktivitas: 'Bermain flashcard untuk melatih Ananda dalam menceritakan gambar.', contoh: 'Minta Ananda untuk menceritakan gambar berpola S-P-O-K.', frekuensi: 'Setiap hari with durasi 30 menit.', tujuan: 'Untuk menambah kosakata dalam pengujaran and menambah pemahaman pada konsep dasar.' },
    { aktivitas: 'Latihan pemahaman instruksi 2 tahap.', frekuensi: 'Setiap hari with durasi 30 menit.', tujuan: 'Untuk meningkatkan pemahaman pada area bahasa bicara and mengembangkan inisiatif untuk merespon.' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_REMEDIAL = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Pelangi Lazuardi LTC',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      academic: 'A. Perkembangan Akademik',
      literacy: 'B. Literasi Dasar (Membaca & Mengeja)',
      writing: 'C. Kemampuan Menulis (Grafomotor)',
      focus: 'D. Kemampuan Fokus & Konsentrasi',
      followUp: 'TINDAK LANJUT / FOLLOW UP',
      homeProgram: 'PROGRAM DI RUMAH / HOME PROGRAM',
      labelNoReg: 'No. Registrasi:',
      labelUnit: 'Unit:',
      labelTanggal: 'Tanggal Evaluasi:',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'Remedial Therapy Service',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: 'FILE: LTC/REM/2025/',
      komentarPimpinan: 'TINJAUAN MANAJEMEN'
    }
  },
  identitas: { noRegistrasi: 'R.020-2025', tanggalEvaluasi: '2025-12-15', unit: 'Pelangi Lazuardi GCS', terapis: 'Tim Terapi Remedial', tanggalLahir: '', usia: '' },
  managerComment: '',
  academic: {
    targetDate: '2026-06-30',
    items: [
      { id: '1', label: 'Mengenal angka 1-50', awal: 'Mengenal angka 1-20 secara acak', tujuan: 'Mengenal angka 1-50 secara acak and berurutan', hasil: 'Sudah mengenal angka 1-35 with bantuan minimal' }
    ]
  },
  literacy: {
    targetDate: '2026-06-30',
    items: [
      { id: '1', label: 'Membaca suku kata KV-KV', awal: 'Mampu membaca huruf vokal', tujuan: 'Membaca suku kata sederhana KV-KV tanpa bantuan', hasil: 'Mulai bisa merangkai suku kata "ba-bi-bu-be-bo"' }
    ]
  },
  writing: {
    targetDate: '2026-06-30',
    items: [
      { id: '1', label: 'Menyalin kalimat sederhana', awal: 'Menyalin kata per kata', tujuan: 'Menyalin satu kalimat penuh with rapi and spasi yang tepat', hasil: 'Masih sering terlewati spasinya saat menyalin kalimat panjang' }
    ]
  },
  focus: {
    targetDate: '2026-06-30',
    items: [
      { id: '1', label: 'Duduk tenang selama 15 menit', awal: 'Hanya bertahan 5 menit', tujuan: 'Mampu duduk tenang and fokus pada tugas selama 15-20 menit', hasil: 'Sudah mampu bertahan 10-12 menit tanpa distraksi berlebihan' }
    ]
  },
  followUp: [
    'Lanjutkan latihan membaca di rumah 15 menit/hari.',
    'Gunakan media visual untuk pengenalan angka.'
  ],
  homeProgram: [
    { aktivitas: 'Membaca bersama orang tua', frekuensi: '15 menit/hari', tujuan: 'Meningkatkan kelancaran membaca' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_PHYSIO = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Pelangi Lazuardi LTC',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      perilakuUmum: 'Perilaku Umum',
      sensory: 'Sensory Processing',
      motorik: 'Perkembangan Kemampuan Motorik',
      fisik: 'Perkembangan Kemampuan Fisik & Fungsional',
      followUp: 'Follow Up',
      homeProgram: 'Home Program Fisioterapi',
      labelNoReg: 'No. Registrasi:',
      labelUnit: 'Unit:',
      labelTanggal: 'Tanggal Evaluasi:',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'Physiotherapy Service',
      headerInstAddress: 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: 'FILE: LTC/FT/2025/',
      komentarPimpinan: 'TINJAUAN MANAJEMEN',
      labelKomentarPeninjauan: 'Komentar Peninjauan :',
      motorikKasar: '1. Motorik Kasar',
      motorikHalus: '2. Motorik Halus',
      fisikGmfm: 'GMFM (Gross Motor Function Measure)',
      scalePerilaku: 'teramati/tidak',
      scaleSensoryMod: 'B/S/K/BR',
      scaleMotorik: 'MD/SD/TD',
      labelCatatanPerilaku: 'Catatan Perilaku :',
      labelKomentarSensori: 'Komentar Sensori :',
      labelKomentarMotorik: 'Komentar Motorik :',
      labelKomentar: 'Komentar :',
    }
  },
  identitas: { noRegistrasi: 'F.020-2025', tanggalEvaluasi: '2025-12-15', unit: 'Pelangi Lazuardi GCS', terapis: 'Tim Fisioterapi', tanggalLahir: '', usia: '' },
  managerComment: '',
  perilakuUmum: {
    items: [
      { id: 'interaksi', label: 'Ada upaya terlibat interaksi with terapis', awal: 'teramati', hasil: 'teramati' },
      { id: 'perintah', label: 'Mengikuti perintah', awal: 'tidak', hasil: 'teramati' },
    ],
    komentar: 'Ananda menunjukkan peningkatan dalam kepatuhan mengikuti instruksi selama sesi.'
  },
  sensory: {
    items: [
      { label: 'Therapy brush', awal: 'B', hasil: 'S' },
      { label: 'Bermain ayunan', awal: 'B', hasil: 'S' },
    ],
    komentar: 'Respon terhadap stimulasi taktil mulai teregulasi with baik.'
  },
  motorik: {
    kasar: [
      { label: 'Merangkak', awal: 'TD', hasil: 'SD' },
      { label: 'Melompat', awal: 'TD', hasil: 'SD' },
    ],
    halus: [
      { label: 'Meremas mainan', awal: 'TD', hasil: 'MD' },
    ],
    komentar: 'Peningkatan pada kekuatan otot ekstremitas bawah.'
  },
  fisik: {
    gmfm: [
      { label: 'Berbaring and berguling', awal: 2, hasil: 3 },
      { label: 'Duduk', awal: 1, hasil: 2 },
    ],
    komentar: 'Keseimbangan saat duduk statis menunjukkan kemajuan.'
  },
  followUp: [
    'Fokus pada penguatan core muscle.',
    'Latihan koordinasi keseimbangan dinamis.'
  ],
  homeProgram: [
    { aktivitas: 'Latihan penguatan otot perut', frekuensi: '3x seminggu', durasi: '10 menit' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_HT = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Hidroterapis',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      adaptasiAir: 'A. Adaptasi Air & Sensori Akuatik',
      keterampilanAir: 'B. Keterampilan & Kontrol Fisik di Air',
      keseimbanganAir: 'C. Keseimbangan & Koordinasi Fungsional',
      followUp: 'RENCANA TINDAK LANJUT / FOLLOW UP',
      homeProgram: 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM',
      labelNoReg: 'No. Registrasi:',
      labelUnit: 'Unit:',
      labelTanggal: 'Tanggal Evaluasi:',
      labelNama: 'Nama Lengkap',
      labelLahir: 'Tanggal Lahir',
      labelUsia: 'Usia',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'AQUATIC & HYDROTHERAPY SERVICE',
      headerInstAddress: 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: 'FILE: LTC/HT/2025/',
      komentarPimpinan: 'TINJAUAN MANAJEMEN',
      labelKomentarPeninjauan: 'Komentar Peninjauan :',
      tableHeaderIndikator: 'INDIKATOR RESPON',
      tableHeaderAktivitas: 'AKTIVITAS',
      scalePerilaku: 'teramati/tidak',
      scaleAdaptasi: 'B/S/K/BR',
      scaleKeterampilan: 'MD/SD/TD',
      scaleKeseimbangan: 'MD/SD/TD',
      labelCatatanAdaptasi: 'Catatan Adaptasi Air :',
      labelCatatanKeterampilan: 'Catatan Keterampilan Fisik :',
      labelCatatanKeseimbangan: 'Catatan Keseimbangan :',
      scaleExplanationsAdaptasi: 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah',
      scaleExplanationsKeterampilan: 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'
    }
  },
  identitas: { noRegistrasi: 'HT.020-2025', tanggalEvaluasi: '2025-12-15', unit: 'Pelangi Lazuardi GCS', terapis: 'Tim Hidroterapi', tanggalLahir: '', usia: '' },
  managerComment: '',
  adaptasiAir: {
    items: [
      { label: 'Penerimaan masuk ke kolam air hangat & adaptasi suhu', awal: 'K', hasil: 'S' },
      { label: 'Respon terhadap percikan air di area wajah dan kepala', awal: 'B', hasil: 'S' },
      { label: 'Relaksasi otot dan ketenangan selama berada di air', awal: 'K', hasil: 'S' },
      { label: 'Kepatuhan mengikuti instruksi keselamatan di kolam renang', awal: 'K', hasil: 'S' },
    ],
    komentar: 'Di awal intervensi Ananda masih tampak tegang dan cemas saat pertama kali masuk ke dalam air kolam, terutama bila ada percikan di wajah. Setelah intervensi rutin, Ananda menunjukkan kenyamanan yang jauh lebih baik, tubuh lebih rileks, dan mampu menikmati stimulasi air hangat dengan tenang.'
  },
  keterampilanAir: {
    items: [
      { label: 'Kontrol pernapasan / meniup gelembung di permukaan air', awal: 'SD', hasil: 'MD' },
      { label: 'Mengapung posisi telentang (back float) dengan penyangga minimal', awal: 'TD', hasil: 'SD' },
      { label: 'Gerakan kayuhan/tendangan kaki bergantian (flutter kicks)', awal: 'SD', hasil: 'MD' },
      { label: 'Gerakan mendayung lengan untuk mendorong tubuh', awal: 'TD', hasil: 'SD' },
    ],
    komentar: 'Kemampuan kontrol pernapasan Ananda meningkat pesat, Ananda sudah berani memasukkan sebagian wajah ke air dan meniup gelembung. Gerakan tendangan kaki mulai terarah dan bertenaga.'
  },
  keseimbanganAir: {
    items: [
      { label: 'Berjalan dan menjaga keseimbangan di kedalaman setinggi dada', awal: 'SD', hasil: 'MD' },
      { label: 'Transisi gerak dari posisi mengapung ke posisi berdiri tegak', awal: 'TD', hasil: 'SD' },
      { label: 'Meraih objek apung (mainan/cincin) dengan mempertahankan postur', awal: 'SD', hasil: 'MD' },
      { label: 'Koordinasi gerak bilateral tangan dan kaki di dalam air', awal: 'TD', hasil: 'SD' },
    ],
    komentar: 'Daya apung air (buoyancy) sangat membantu Ananda melatih kekuatan inti tubuh (core muscles) dan keseimbangan berjalan tanpa takut jatuh. Ananda lebih mandiri dalam bergerak di kolam.'
  },
  followUp: [
    'Melanjutkan penguatan teknik mengapung telentang mandiri tanpa alat bantu.',
    'Meningkatkan koordinasi kayuhan lengan dan tendangan kaki secara simultan.',
    'Memperpanjang durasi daya tahan (endurance) fisik selama aktivitas akuatik.'
  ],
  homeProgram: [
    { aktivitas: 'Latihan tiup gelembung di baskom air hangat', frekuensi: '3x Seminggu', durasi: '10 menit' },
    { aktivitas: 'Latihan relaksasi berendam air hangat', frekuensi: 'Setiap akhir pekan', durasi: '20-30 menit' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_BERKUDA = {
  settings: {
    managerName: 'Asep Suherman, S.E, M.M',
    managerTitle: 'Manager Pelangi Lazuardi RC',
    signatureRole1: 'Terapis,',
    signatureRole2: 'Mengetahui,',
    signatureRole3: 'Mengetahui,',
    signatureSub1: 'Terapis Berkuda / Hipoterapis',
    signatureSub2: 'Manager Pelangi Lazuardi RC',
    signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
    signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
    titles: {
      adaptasiPerilaku: 'A. Adaptasi, Perilaku & Regulasi Emosi',
      posturKeseimbangan: 'B. Postur, Keseimbangan & Kontrol Inti Tubuh',
      koordinasiMotorik: 'C. Koordinasi Motorik & Keterampilan Fungsional',
      followUp: 'RENCANA TINDAK LANJUT / FOLLOW UP',
      homeProgram: 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM',
      labelNoReg: 'No. Registrasi:',
      labelUnit: 'Unit:',
      labelTanggal: 'Tanggal Evaluasi:',
      labelNama: 'Nama Lengkap',
      labelLahir: 'Tanggal Lahir',
      labelUsia: 'Usia',
      headerInstName: 'Pelangi Lazuardi',
      headerInstSub: 'EQUINE & HIPPOTHERAPY SERVICE',
      headerInstAddress: 'Jl. Garuda Ujung No. 35, Griya Cinere 1, Limo, Depok • Telp: (021) 753-4841',
      headerReportTitle: 'PROGRESS REPORT',
      headerFilePrefix: 'FILE: LTC/EQ/2025/',
      komentarPimpinan: 'TINJAUAN MANAJEMEN',
      labelKomentarPeninjauan: 'Komentar Peninjauan :',
      tableHeaderIndikator: 'INDIKATOR RESPON',
      tableHeaderAktivitas: 'AKTIVITAS',
      scalePerilaku: 'teramati/tidak',
      scalePostur: 'MD/SD/TD',
      scaleKoordinasi: 'MD/SD/TD',
      labelCatatanPerilaku: 'Catatan Perilaku & Adaptasi :',
      labelCatatanPostur: 'Catatan Postur & Keseimbangan :',
      labelCatatanKoordinasi: 'Catatan Koordinasi & Keterampilan :',
      scaleExplanationsPostur: 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'
    }
  },
  identitas: { noRegistrasi: 'EQ.020-2025', tanggalEvaluasi: '2025-12-15', unit: 'Pelangi Lazuardi GCS', terapis: 'Tim Terapi Berkuda', tanggalLahir: '', usia: '' },
  managerComment: '',
  adaptasiPerilaku: {
    items: [
      { label: 'Penerimaan memakai perlengkapan keselamatan (helm & sabuk)', awal: 'tidak', hasil: 'teramati' },
      { label: 'Ketenangan saat mendekati kuda dan proses menaiki kuda (mounting)', awal: 'tidak', hasil: 'teramati' },
      { label: 'Kepatuhan terhadap instruksi terapis dan kooperatif dengan side-walker', awal: 'tidak', hasil: 'teramati' },
      { label: 'Regulasi emosi dan tingkat kenyamanan saat kuda mulai berjalan', awal: 'tidak', hasil: 'teramati' },
    ],
    komentar: 'Pada sesi-sesi awal, Ananda memerlukan waktu desensitisasi terhadap ukuran hewan kuda dan tekstur perlengkapan berkuda. Saat ini, Ananda sangat antusias, mampu memakai helm dengan mandiri, dan memperlihatkan ekspresi gembira selama sesi terapi.'
  },
  posturKeseimbangan: {
    items: [
      { label: 'Mempertahankan postur duduk tegak simetris di atas pelana', awal: 'SD', hasil: 'MD' },
      { label: 'Kontrol kepala, leher, dan stabilitas batang tubuh (trunk stability)', awal: 'SD', hasil: 'MD' },
      { label: 'Menjaga keseimbangan saat ritme langkah kuda berganti (berjalan & berhenti)', awal: 'TD', hasil: 'SD' },
      { label: 'Penyesuaian pelvis terhadap gerakan 3 dimensi dari langkah kuda', awal: 'SD', hasil: 'MD' },
    ],
    komentar: 'Gerakan tiga dimensi ritmis kuda memberikan input proprioseptif dan vestibular yang luar biasa. Terjadi peningkatan nyata pada tonus otot postural batang tubuh (trunk) sehingga postur duduk Ananda lebih tegak dan stabil.'
  },
  koordinasiMotorik: {
    items: [
      { label: 'Memegang tali kendali (reins) dengan posisi tangan simetris', awal: 'SD', hasil: 'MD' },
      { label: 'Melakukan gerakan motorik tangan di atas kuda (meraih ring/melempar bola)', awal: 'TD', hasil: 'SD' },
      { label: 'Mengubah arah pandang / menoleh tanpa kehilangan keseimbangan', awal: 'SD', hasil: 'MD' },
      { label: 'Perencanaan gerak dan kesiapan saat proses turun dari kuda (dismounting)', awal: 'SD', hasil: 'MD' },
    ],
    komentar: 'Koordinasi bilateral dan perencanaan gerak (praksis) Ananda semakin matang. Ananda mampu melakukan tugas kognitif dan motorik ganda (dual-tasking) di atas kuda dengan pengawasan.'
  },
  followUp: [
    'Melanjutkan latihan postur dengan variasi kecepatan langkah kuda (walk & halt transition).',
    'Meningkatkan kemandirian dalam menggenggam kendali dan mengarahkan kuda.',
    'Mengintegrasikan permainan motorik halus dan tugas fokus konsentrasi di atas kuda.'
  ],
  homeProgram: [
    { aktivitas: 'Latihan duduk seimbang di Gym Ball / Bobath Ball', frekuensi: 'Setiap Hari', durasi: '15 menit' },
    { aktivitas: 'Latihan penguatan otot punggung & perut (bridging/superman pose)', frekuensi: '3x Seminggu', durasi: '10 menit' }
  ],
  sessions: { total: 24, present: 23 }
};

const DEFAULT_CATEGORIES = [
  { id: 'OT', name: 'Okupasi Terapi', iconName: 'Brain', color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { id: 'TW', name: 'Terapi Wicara', iconName: 'MessageSquare', color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  { id: 'REMEDIAL', name: 'Terapi Remedial', iconName: 'FileText', color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  { id: 'FT', name: 'Fisioterapi', iconName: 'Stethoscope', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'HT', name: 'Hidroterapi', iconName: 'Waves', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  { id: 'BERKUDA', name: 'Terapi Berkuda', iconName: 'Equine', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const createDefaultCustomReport = (cat: { id: string; name: string; scale?: string }) => {
  const activeScale = cat.scale || 'B/S/K/BR';
  return {
    settings: {
      managerName: 'Asep Suherman, S.E, M.M',
      managerTitle: 'Manager Pelangi Lazuardi RC',
      signatureRole1: 'Terapis,',
      signatureRole2: 'Mengetahui,',
      signatureRole3: 'Mengetahui,',
      signatureSub1: `${cat.name}`,
      signatureSub2: 'Manager Pelangi Lazuardi RC',
      signatureSub3: 'Kepala Pendidikan Inklusif Lazuardi GCS',
      signerName3: 'Abdul Ghofar, AMd.OT., S.Pd., M.H.',
      titles: {
        evaluasiKlinis: `A. Evaluasi & Perkembangan Kemampuan ${cat.name}`,
        followUp: 'RENCANA TINDAK LANJUT / FOLLOW UP',
        homeProgram: 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM',
        labelNoReg: 'No. Registrasi:',
        labelUnit: 'Unit:',
        labelTanggal: 'Tanggal Evaluasi:',
        labelNama: 'Nama Lengkap',
        labelLahir: 'Tanggal Lahir',
        labelUsia: 'Usia',
        headerInstName: 'Pelangi Lazuardi',
        headerInstSub: `${cat.name.toUpperCase()} PROGRESS REPORT`,
        headerReportTitle: 'PROGRESS REPORT',
        headerFilePrefix: `FILE: LTC/${cat.id}/2025/`,
        komentarPimpinan: 'TINJAUAN MANAJEMEN',
        labelKomentarPeninjauan: 'Komentar Peninjauan :',
        tableHeaderIndikator: 'INDIKATOR RESPON',
        scaleIndikator: activeScale,
        labelCatatanEvaluasi: 'Catatan Observasi & Evaluasi :'
      }
    },
    identitas: {
      noRegistrasi: `${cat.id}.020-2025`,
      tanggalEvaluasi: new Date().toISOString().split('T')[0],
      unit: 'Pelangi Lazuardi RC',
      terapis: `Tim ${cat.name}`,
      tanggalLahir: '',
      usia: ''
    },
    managerComment: '',
    evaluasiKlinis: {
      items: [
        { label: `Respon awal dan kenyamanan adaptasi dalam sesi ${cat.name}`, awal: activeScale === 'teramati/tidak' ? 'tidak' : activeScale === 'MD/SD/TD' ? 'SD' : 'K', hasil: activeScale === 'teramati/tidak' ? 'teramati' : activeScale === 'MD/SD/TD' ? 'MD' : 'S' },
        { label: `Fokus dan ketahanan perhatian selama aktivitas ${cat.name}`, awal: activeScale === 'teramati/tidak' ? 'tidak' : activeScale === 'MD/SD/TD' ? 'SD' : 'K', hasil: activeScale === 'teramati/tidak' ? 'teramati' : activeScale === 'MD/SD/TD' ? 'MD' : 'S' },
        { label: `Kemampuan koordinasi dan eksekusi tugas fungsional`, awal: activeScale === 'teramati/tidak' ? 'tidak' : activeScale === 'MD/SD/TD' ? 'TD' : 'K', hasil: activeScale === 'teramati/tidak' ? 'teramati' : activeScale === 'MD/SD/TD' ? 'SD' : 'S' },
        { label: `Kemandirian dalam menyelesaikan rangkaian instruksi terapi`, awal: activeScale === 'teramati/tidak' ? 'tidak' : activeScale === 'MD/SD/TD' ? 'SD' : 'K', hasil: activeScale === 'teramati/tidak' ? 'teramati' : activeScale === 'MD/SD/TD' ? 'MD' : 'S' },
      ],
      komentar: `Ananda memperlihatkan kemajuan signifikan dalam partisipasi aktif selama sesi intervensi ${cat.name}. Respon adaptif terhadap instruksi terapis menunjukkan konsistensi yang semakin baik.`
    },
    followUp: [
      `Melanjutkan program intervensi terpadu ${cat.name} secara rutin.`,
      `Meningkatkan ketahanan konsentrasi dan kemandirian eksekusi tugas.`,
      `Menjaga kolaborasi stimulus harian antara terapis dan pihak keluarga di rumah.`
    ],
    homeProgram: [
      { aktivitas: `Aktivitas stimulasi mandiri ${cat.name} di rumah`, frekuensi: 'Setiap Hari', durasi: '15-20 Menit', tujuan: 'Memperkuat integrasi capaian terapi' },
      { aktivitas: 'Latihan pengulangan instruksi dan aktivitas terstruktur', frekuensi: '3x Seminggu', durasi: '15 Menit', tujuan: 'Meningkatkan konsistensi respon anak' }
    ]
  };
};

interface RapotPageProps {
  allChildren: Child[];
  therapyTypes: TherapyDefinition[];
  logoUrl?: string;
  userRole?: string | null;
  onAddTherapyType?: (name: string) => void;
}

const RapotPage: React.FC<RapotPageProps> = ({ allChildren, therapyTypes, logoUrl, userRole, onAddTherapyType }) => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeTherapyTab, setActiveTherapyTab] = useState<string>('OT'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'Jan-Jun' | 'Jul-Des'>('Jan-Jun');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rapotSubmenu, setRapotSubmenu] = useState<'form' | 'archive' | 'chart'>('form');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeArchiveForPreview, setActiveArchiveForPreview] = useState<RapotArchiveItem | null>(null);
  const [viewingArchiveSnapshot, setViewingArchiveSnapshot] = useState<RapotArchiveItem | null>(null);
  const [archivedReports, setArchivedReports] = useState<RapotArchiveItem[]>(() => getStoredArchives());
  const [showArchive, setShowArchive] = useState(false);
  const [showManagerComment, setShowManagerComment] = useState(false);
  const [childManagerComments, setChildManagerComments] = useState<Record<string, string>>({});
  const [childReports, setChildReports] = useState<Record<string, any>>({});
  const [archiveFolders, setArchiveFolders] = useState<RapotArchiveFolder[]>(() => getStoredFolders());
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Therapy Services State
  const [customTherapies, setCustomTherapies] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('pelangi360_rapot_custom_therapies_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isAddTherapyModalOpen, setIsAddTherapyModalOpen] = useState(false);
  const [newTherapyForm, setNewTherapyForm] = useState({
    name: '',
    code: '',
    iconName: 'Sparkles',
    scale: 'B/S/K/BR',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  });
  const [customReportsData, setCustomReportsData] = useState<Record<string, any>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredChildren = useMemo(() => {
    return allChildren.filter(child => child.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10);
  }, [allChildren, searchTerm]);

  const selectedChild = useMemo(() => allChildren.find(c => c.id === selectedChildId), [allChildren, selectedChildId]);

  // Staging states for current view
  const [otReportData, setOtReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_OT)));
  const [twReportData, setTwReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_TW)));
  const [remReportData, setRemReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_REMEDIAL)));
  const [physioReportData, setPhysioReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_PHYSIO)));
  const [htReportData, setHtReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_HT)));
  const [berkudaReportData, setBerkudaReportData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_BERKUDA)));

  const calculateAge = (birthday: string) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months < 0) {
      months += 12;
      if (years > 0) years--;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} Tahun`);
    if (months > 0) parts.push(`${months} Bulan`);
    
    if (parts.length === 0) return '0 Bulan';
    return parts.join(' ');
  };

  // Load child-specific data from master state when selection or tab changes
  React.useEffect(() => {
    if (!selectedChildId || !selectedChild) return;
    
    const populateIdentitas = (data: any) => {
      // Create a deep copy to avoid mutations if needed, though childReports items might be shared
      const newData = JSON.parse(JSON.stringify(data));
      if (!newData.identitas.tanggalLahir && selectedChild.birthday) {
        newData.identitas.tanggalLahir = selectedChild.birthday;
      }
      if (!newData.identitas.usia) {
        if (newData.identitas.tanggalLahir) {
          newData.identitas.usia = calculateAge(newData.identitas.tanggalLahir);
        } else if (selectedChild.age) {
          newData.identitas.usia = `${selectedChild.age} Tahun`;
        }
      }
      return newData;
    };

    setOtReportData(populateIdentitas(childReports[`${selectedChildId}-OT`] || DEFAULT_OT));
    setTwReportData(populateIdentitas(childReports[`${selectedChildId}-TW`] || DEFAULT_TW));
    setRemReportData(populateIdentitas(childReports[`${selectedChildId}-REMEDIAL`] || DEFAULT_REMEDIAL));
    setPhysioReportData(populateIdentitas(childReports[`${selectedChildId}-FT`] || DEFAULT_PHYSIO));
    setHtReportData(populateIdentitas(childReports[`${selectedChildId}-HT`] || DEFAULT_HT));
    setBerkudaReportData(populateIdentitas(childReports[`${selectedChildId}-BERKUDA`] || DEFAULT_BERKUDA));
  }, [selectedChildId, activeTherapyTab, selectedChild]);

  // Helper to sync staging data back to master
  const syncToMaster = (type: string, data: any) => {
    if (!selectedChildId) return;
    setChildReports(prev => ({
      ...prev,
      [`${selectedChildId}-${type}`]: data
    }));
  };

  const ICON_MAP: Record<string, any> = useMemo(() => ({
    Brain,
    MessageSquare,
    FileText,
    Stethoscope,
    Waves,
    Heart,
    Activity,
    Sparkles,
    ClipboardList,
    Palette,
    Music,
    Dumbbell,
    Smile,
    Layers,
    Equine: EquineTherapyIcon
  }), []);

  const therapyCategories = useMemo(() => {
    const defaultIds = new Set(DEFAULT_CATEGORIES.map(c => c.id));
    const mergedCustom = [...customTherapies];
    if (therapyTypes && Array.isArray(therapyTypes)) {
      therapyTypes.forEach(t => {
        if (!defaultIds.has(t.id) && !mergedCustom.some(c => c.id === t.id)) {
          mergedCustom.push({
            id: t.id,
            name: t.name,
            iconName: 'Sparkles',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            scale: 'B/S/K/BR',
            isCustom: true
          });
        }
      });
    }

    const customMapped = mergedCustom.map(c => ({
      ...c,
      Icon: ICON_MAP[c.iconName || 'Sparkles'] || Sparkles
    }));

    const defaultMapped = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      Icon: ICON_MAP[c.iconName] || Brain
    }));

    return [...defaultMapped, ...customMapped];
  }, [customTherapies, therapyTypes, ICON_MAP]);

  const getCustomReportData = useCallback((catId: string) => {
    const key = `${selectedChildId}-${catId}`;
    if (childReports[key]) return childReports[key];
    if (customReportsData[catId]) return customReportsData[catId];
    const cat = therapyCategories.find(c => c.id === catId);
    const template = createDefaultCustomReport(cat || { id: catId, name: catId, scale: 'B/S/K/BR' });
    if (selectedChild) {
      if (selectedChild.birthday) template.identitas.tanggalLahir = selectedChild.birthday;
      if (selectedChild.age) template.identitas.usia = `${selectedChild.age} Tahun`;
    }
    return template;
  }, [selectedChildId, childReports, customReportsData, therapyCategories, selectedChild]);

  const updateCustomReportField = (path: string, value: any, index: number | null = null, sub: string | null = null) => {
    const currentData = JSON.parse(JSON.stringify(getCustomReportData(activeTherapyTab)));
    if (index !== null) {
      if (path === 'followUp') currentData.followUp[index] = value;
      else if (path === 'homeProgram') currentData.homeProgram[index][sub || 'aktivitas'] = value;
      else if (currentData[path]?.items) currentData[path].items[index][sub || 'label'] = value;
      else if (sub && currentData[path]?.[sub]) currentData[path][sub][index] = value;
    } else {
      const parts = path.split('.');
      let current = currentData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    setCustomReportsData(prev => ({ ...prev, [activeTherapyTab]: currentData }));
    syncToMaster(activeTherapyTab, currentData);
  };

  const handleSaveNewTherapy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newTherapyForm.name.trim();
    if (!name) {
      showToast('⚠️ Nama layanan terapi tidak boleh kosong.');
      return;
    }

    const generatedCode = (newTherapyForm.code.trim() || name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)).toUpperCase();
    const existingIds = new Set(therapyCategories.map(c => c.id));
    let uniqueId = generatedCode || 'TERAPI';
    let counter = 1;
    while (existingIds.has(uniqueId)) {
      uniqueId = `${generatedCode || 'TERAPI'}_${counter++}`;
    }

    const newTherapy = {
      id: uniqueId,
      name,
      iconName: newTherapyForm.iconName || 'Sparkles',
      scale: newTherapyForm.scale || 'B/S/K/BR',
      color: newTherapyForm.color || 'text-indigo-600',
      bgColor: newTherapyForm.bgColor || 'bg-indigo-50',
      borderColor: newTherapyForm.borderColor || 'border-indigo-200',
      isCustom: true
    };

    const updatedCustom = [...customTherapies, newTherapy];
    setCustomTherapies(updatedCustom);
    try {
      localStorage.setItem('pelangi360_rapot_custom_therapies_v1', JSON.stringify(updatedCustom));
    } catch (err) {
      console.error(err);
    }

    // Call onAddTherapyType prop to notify App.tsx
    if (onAddTherapyType) {
      try {
        onAddTherapyType(name);
      } catch (err) {
        console.warn('onAddTherapyType err:', err);
      }
    }

    // Initialize custom report data template
    const template = createDefaultCustomReport(newTherapy);
    if (selectedChild) {
      if (selectedChild.birthday) template.identitas.tanggalLahir = selectedChild.birthday;
      if (selectedChild.age) template.identitas.usia = `${selectedChild.age} Tahun`;
    }
    setCustomReportsData(prev => ({
      ...prev,
      [uniqueId]: template
    }));
    syncToMaster(uniqueId, template);

    // Switch active tab
    setActiveTherapyTab(uniqueId);
    setIsAddTherapyModalOpen(false);
    setNewTherapyForm({
      name: '',
      code: '',
      iconName: 'Sparkles',
      scale: 'B/S/K/BR',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    });

    showToast(`✅ Layanan Terapi "${name}" berhasil ditambahkan ke format rapor!`);
  };

  const handleDeleteCustomTherapy = (catId: string, catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus layanan terapi "${catName}" dari daftar disiplin rapor?`)) {
      const filtered = customTherapies.filter(c => c.id !== catId);
      setCustomTherapies(filtered);
      try {
        localStorage.setItem('pelangi360_rapot_custom_therapies_v1', JSON.stringify(filtered));
      } catch (err) {
        console.error(err);
      }
      if (activeTherapyTab === catId) {
        setActiveTherapyTab('OT');
      }
      showToast(`🗑️ Layanan Terapi "${catName}" telah dihapus.`);
    }
  };

  const updateOTScore = (section: string, sub: string | null, index: number, field: 'awal' | 'hasil', value: string) => {
    const newData = JSON.parse(JSON.stringify(otReportData));
    if (sub) newData[section][sub][index][field] = value;
    else if (section === 'kognisi') newData.kognisi.items[index][field] = value;
    else if (section === 'emosi') newData.emosi.items[index][field] = value;
    else newData[section].items[index][field] = value;
    setOtReportData(newData);
    syncToMaster('OT', newData);
  };

  const updateOTField = (path: string, value: string) => {
    const newData = JSON.parse(JSON.stringify(otReportData));
    const parts = path.split('.');
    
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;

    setOtReportData(newData);
    syncToMaster('OT', newData);
  };

  const updateRemField = (section: string, field: string, value: any, index: number | null = null) => {
    const newData = JSON.parse(JSON.stringify(remReportData));
    if (index !== null) {
      if (section === 'followUp') newData.followUp[index] = value;
      else if (section === 'homeProgram') newData.homeProgram[index][field] = value;
      else newData[section].items[index][field] = value;
    } else {
      const parts = field.split('.');
      let current = newData[section];
      if (!current) {
         newData[section] = {};
         current = newData[section];
      }
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    setRemReportData(newData);
    syncToMaster('REMEDIAL', newData);
  };

  const updatePhysioField = (section: string, field: string, value: any, index: number | null = null, sub: string | null = null) => {
    const newData = JSON.parse(JSON.stringify(physioReportData));
    if (index !== null) {
      if (sub) newData[section][sub][index][field] = value;
      else if (section === 'followUp') newData.followUp[index] = value;
      else if (section === 'homeProgram') newData.homeProgram[index][field] = value;
      else newData[section].items[index][field] = value;
    } else {
      const parts = field.split('.');
      let current = newData[section];
      if (!current) {
         newData[section] = {};
         current = newData[section];
      }
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    setPhysioReportData(newData);
    syncToMaster('FT', newData);
  };

  const updateTWField = (section: string, field: string, value: any, index?: number) => {
    const newData = JSON.parse(JSON.stringify(twReportData));
    if (index !== undefined) {
       // Handle arrays
       if (section === 'followUp') {
          newData.followUp[index] = value;
       } else if (field === 'contohMenceritakan') {
          newData.ekspresif.contohMenceritakan[index] = value;
       } else if (['t', 'q', 'a'].includes(field)) {
          newData.ekspresif.contohMengungkapkan[index][field] = value;
       } else if (section === 'homeProgram') {
          newData.homeProgram[index][field] = value;
       } else if (newData[section]?.items) {
          newData[section].items[index][field] = value;
       }
    } else {
       // Handle direct fields or nested objects
       const parts = field.split('.');
       let current = newData[section];
       if (!current) {
          newData[section] = {};
          current = newData[section];
       }
       
       for (let i = 0; i < parts.length - 1; i++) {
         if (!current[parts[i]]) current[parts[i]] = {};
         current = current[parts[i]];
       }
       current[parts[parts.length - 1]] = value;
    }
    setTwReportData(newData);
    syncToMaster('TW', newData);
  };

  const updateHtField = (section: string, field: string, value: any, index: number | null = null) => {
    const newData = JSON.parse(JSON.stringify(htReportData));
    if (index !== null) {
      if (section === 'followUp') newData.followUp[index] = value;
      else if (section === 'homeProgram') newData.homeProgram[index][field] = value;
      else newData[section].items[index][field] = value;
    } else {
      const parts = field.split('.');
      let current = newData[section];
      if (!current) {
        newData[section] = {};
        current = newData[section];
      }
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    setHtReportData(newData);
    syncToMaster('HT', newData);
  };

  const updateBerkudaField = (section: string, field: string, value: any, index: number | null = null) => {
    const newData = JSON.parse(JSON.stringify(berkudaReportData));
    if (index !== null) {
      if (section === 'followUp') newData.followUp[index] = value;
      else if (section === 'homeProgram') newData.homeProgram[index][field] = value;
      else newData[section].items[index][field] = value;
    } else {
      const parts = field.split('.');
      let current = newData[section];
      if (!current) {
        newData[section] = {};
        current = newData[section];
      }
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    setBerkudaReportData(newData);
    syncToMaster('BERKUDA', newData);
  };

  const updateSessions = (type: string, total: number, present: number) => {
    let data;
    let setter;
    if (type === 'OT') { data = otReportData; setter = setOtReportData; }
    else if (type === 'TW') { data = twReportData; setter = setTwReportData; }
    else if (type === 'REMEDIAL') { data = remReportData; setter = setRemReportData; }
    else if (type === 'FT') { data = physioReportData; setter = setPhysioReportData; }
    else if (type === 'HT') { data = htReportData; setter = setHtReportData; }
    else if (type === 'BERKUDA') { data = berkudaReportData; setter = setBerkudaReportData; }

    if (data.sessions?.total === total && data.sessions?.present === present) return;

    const newData = JSON.parse(JSON.stringify(data));
    newData.sessions = { total, present };
    setter(newData);
    syncToMaster(type, newData);
  };

  const updateManagerComment = (value: string) => {
    if (!selectedChildId) return;
    const key = `${selectedChildId}-${activeTherapyTab}`;
    setChildManagerComments(prev => ({ ...prev, [key]: value }));
  };

  const addItem = (section: string, sub: string | null) => {
    if (activeTherapyTab === 'OT') {
      const newData = JSON.parse(JSON.stringify(otReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: 'Setiap Hari', durasi: 'Menyesuaikan' });
      } else if (sub) {
        newData[section][sub].push({ label: 'Baris Baru', awal: '', hasil: '' });
      } else if (section === 'kognisi') {
        newData.kognisi.items.push({ label: 'Aktivitas Baru', awal: '', hasil: '' });
      } else if (section === 'emosi') {
        newData.emosi.items.push({ cat: 'Kategori', label: 'Indikator Baru', awal: '', hasil: '' });
      } else {
        newData[section].items.push({ id: Math.random().toString(), label: 'Indikator Baru', awal: '', hasil: '' });
      }
      setOtReportData(newData);
      syncToMaster('OT', newData);
    } else if (activeTherapyTab === 'TW') {
      const newData = JSON.parse(JSON.stringify(twReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: '-', tujuan: '-' });
      } else if (section === 'ekspresif' && sub === 'contohMenceritakan') {
        newData.ekspresif.contohMenceritakan.push('Contoh baru...');
      } else if (section === 'ekspresif' && sub === 'contohMengungkapkan') {
        newData.ekspresif.contohMengungkapkan.push({ q: 'Pertanyaan...', a: 'Jawaban...' });
      } else if (newData[section]?.items) {
        newData[section].items.push({
          label: 'Area Baru',
          tujuanTercapai: '',
          aktivitas: 'Deskripsi aktivitas...',
          awal: 'Kondisi awal...',
          tujuan: 'Target capaian...',
          hasil: 'Progres terbaru...'
        });
      }
      setTwReportData(newData);
      syncToMaster('TW', newData);
    } else if (activeTherapyTab === 'REMEDIAL') {
      const newData = JSON.parse(JSON.stringify(remReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: '-', tujuan: '-' });
      } else if (newData[section]?.items) {
        newData[section].items.push({ id: Date.now().toString(), label: 'Item Baru', awal: '', tujuan: '', hasil: '' });
      }
      setRemReportData(newData);
      syncToMaster('REMEDIAL', newData);
    } else if (activeTherapyTab === 'FT') {
      const newData = JSON.parse(JSON.stringify(physioReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: '-', durasi: '-' });
      } else if (sub && newData[section][sub]) {
        newData[section][sub].push({ label: 'Item Baru', awal: '', hasil: '' });
      } else if (newData[section]?.items) {
        newData[section].items.push({ label: 'Item Baru', awal: '', hasil: '' });
      }
      setPhysioReportData(newData);
      syncToMaster('FT', newData);
    } else if (activeTherapyTab === 'HT') {
      const newData = JSON.parse(JSON.stringify(htReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: '-', durasi: '-' });
      } else if (newData[section]?.items) {
        newData[section].items.push({ label: 'Indikator Baru', awal: '', hasil: '' });
      }
      setHtReportData(newData);
      syncToMaster('HT', newData);
    } else if (activeTherapyTab === 'BERKUDA') {
      const newData = JSON.parse(JSON.stringify(berkudaReportData));
      if (section === 'followUp') {
        newData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        newData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: '-', durasi: '-' });
      } else if (newData[section]?.items) {
        newData[section].items.push({ label: 'Indikator Baru', awal: '', hasil: '' });
      }
      setBerkudaReportData(newData);
      syncToMaster('BERKUDA', newData);
    } else {
      const currentData = JSON.parse(JSON.stringify(getCustomReportData(activeTherapyTab)));
      if (section === 'followUp') {
        if (!currentData.followUp) currentData.followUp = [];
        currentData.followUp.push('Rencana tindak lanjut baru...');
      } else if (section === 'homeProgram') {
        if (!currentData.homeProgram) currentData.homeProgram = [];
        currentData.homeProgram.push({ aktivitas: 'Aktivitas baru', frekuensi: 'Setiap Hari', durasi: '15 Menit', tujuan: 'Memperkuat capaian sesi' });
      } else {
        if (!currentData.evaluasiKlinis) currentData.evaluasiKlinis = { items: [], komentar: '' };
        if (!currentData.evaluasiKlinis.items) currentData.evaluasiKlinis.items = [];
        const catObj = therapyCategories.find(c => c.id === activeTherapyTab);
        const scale = catObj?.scale || 'B/S/K/BR';
        const defaultAwal = scale === 'teramati/tidak' ? 'tidak' : scale === 'MD/SD/TD' ? 'SD' : 'K';
        const defaultHasil = scale === 'teramati/tidak' ? 'teramati' : scale === 'MD/SD/TD' ? 'MD' : 'S';
        currentData.evaluasiKlinis.items.push({ label: 'Indikator Evaluasi Baru', awal: defaultAwal, hasil: defaultHasil });
      }
      setCustomReportsData(prev => ({ ...prev, [activeTherapyTab]: currentData }));
      syncToMaster(activeTherapyTab, currentData);
    }
  };

  const deleteItem = (section: string, sub: string | null, index: number) => {
    if (activeTherapyTab === 'OT') {
      const newData = JSON.parse(JSON.stringify(otReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (sub) newData[section][sub].splice(index, 1);
      else if (section === 'kognisi') newData.kognisi.items.splice(index, 1);
      else if (section === 'emosi') newData.emosi.items.splice(index, 1);
      else newData[section].items.splice(index, 1);
      setOtReportData(newData);
      syncToMaster('OT', newData);
    } else if (activeTherapyTab === 'TW') {
      const newData = JSON.parse(JSON.stringify(twReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (section === 'ekspresif' && sub === 'contohMenceritakan') newData.ekspresif.contohMenceritakan.splice(index, 1);
      else if (section === 'ekspresif' && sub === 'contohMengungkapkan') newData.ekspresif.contohMengungkapkan.splice(index, 1);
      else if (newData[section]?.items) newData[section].items.splice(index, 1);
      setTwReportData(newData);
      syncToMaster('TW', newData);
    } else if (activeTherapyTab === 'REMEDIAL') {
      const newData = JSON.parse(JSON.stringify(remReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (newData[section]?.items) newData[section].items.splice(index, 1);
      setRemReportData(newData);
      syncToMaster('REMEDIAL', newData);
    } else if (activeTherapyTab === 'FT') {
      const newData = JSON.parse(JSON.stringify(physioReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (sub && newData[section][sub]) newData[section][sub].splice(index, 1);
      else if (newData[section]?.items) newData[section].items.splice(index, 1);
      setPhysioReportData(newData);
      syncToMaster('FT', newData);
    } else if (activeTherapyTab === 'HT') {
      const newData = JSON.parse(JSON.stringify(htReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (newData[section]?.items) newData[section].items.splice(index, 1);
      setHtReportData(newData);
      syncToMaster('HT', newData);
    } else if (activeTherapyTab === 'BERKUDA') {
      const newData = JSON.parse(JSON.stringify(berkudaReportData));
      if (section === 'followUp') newData.followUp.splice(index, 1);
      else if (section === 'homeProgram') newData.homeProgram.splice(index, 1);
      else if (newData[section]?.items) newData[section].items.splice(index, 1);
      setBerkudaReportData(newData);
      syncToMaster('BERKUDA', newData);
    } else {
      const currentData = JSON.parse(JSON.stringify(getCustomReportData(activeTherapyTab)));
      if (section === 'followUp' && currentData.followUp) {
        currentData.followUp.splice(index, 1);
      } else if (section === 'homeProgram' && currentData.homeProgram) {
        currentData.homeProgram.splice(index, 1);
      } else if (currentData.evaluasiKlinis?.items) {
        currentData.evaluasiKlinis.items.splice(index, 1);
      }
      setCustomReportsData(prev => ({ ...prev, [activeTherapyTab]: currentData }));
      syncToMaster(activeTherapyTab, currentData);
    }
  };

  const createFolder = (name?: string) => {
    const targetName = (typeof name === 'string' ? name : newFolderName).trim();
    if (!targetName) return;
    const folder: RapotArchiveFolder = {
      id: `fld_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: targetName,
      timestamp: Date.now()
    };
    const updated = [...archiveFolders, folder];
    setArchiveFolders(updated);
    saveStoredFolders(updated);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    const updated = archiveFolders.map(f => f.id === folderId ? { ...f, name: newName } : f);
    setArchiveFolders(updated);
    saveStoredFolders(updated);
  };

  const deleteFolder = (folderId: string) => {
    const updatedFolders = archiveFolders.filter(f => f.id !== folderId);
    setArchiveFolders(updatedFolders);
    saveStoredFolders(updatedFolders);

    const updatedArchives = archivedReports.map(r => 
      r.folderId === folderId ? { ...r, folderId: null } : r
    );
    setArchivedReports(updatedArchives);
    saveStoredArchives(updatedArchives);

    if (currentFolderId === folderId) setCurrentFolderId(null);
  };

  const handleDeleteArchive = (archiveId: string) => {
    const updated = archivedReports.filter(a => a.id !== archiveId);
    setArchivedReports(updated);
    saveStoredArchives(updated);
    if (viewingArchiveSnapshot?.id === archiveId) {
      setViewingArchiveSnapshot(null);
    }
  };

  const handleMoveArchive = (archiveId: string, targetFolderId: string | null) => {
    const updated = archivedReports.map(a => a.id === archiveId ? { ...a, folderId: targetFolderId } : a);
    setArchivedReports(updated);
    saveStoredArchives(updated);
  };

  const saveToArchive = (folderId: string | null = currentFolderId) => {
    if (!selectedChild) {
      alert('Silakan pilih salah satu siswa terlebih dahulu untuk menyimpan rapot.');
      return;
    }

    let rawData;
    if (activeTherapyTab === 'OT') rawData = otReportData;
    else if (activeTherapyTab === 'TW') rawData = twReportData;
    else if (activeTherapyTab === 'REMEDIAL') rawData = remReportData;
    else if (activeTherapyTab === 'FT') rawData = physioReportData;
    else if (activeTherapyTab === 'HT') rawData = htReportData;
    else if (activeTherapyTab === 'BERKUDA') rawData = berkudaReportData;
    else rawData = getCustomReportData(activeTherapyTab);

    const now = new Date();
    const dateStr = formatArchiveDate(now);
    const timeStr = formatArchiveTime(now);

    const existingNames = archivedReports.map(a => a.fileName);
    const fileName = generateArchiveFileName(selectedChild.name, dateStr, timeStr, existingNames);

    const report: RapotArchiveItem = {
      id: `arc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fileName,
      date: `${dateStr} pukul ${timeStr}`,
      saveDate: dateStr,
      saveTime: timeStr,
      timestamp: Date.now(),
      type: activeTherapyTab,
      childId: selectedChildId || '',
      childName: selectedChild.name,
      period: selectedPeriod,
      year: selectedYear,
      folderId,
      data: {
        ...JSON.parse(JSON.stringify(rawData)),
        managerComment: childManagerComments[`${selectedChildId}-${activeTherapyTab}`] || ""
      }
    };

    const updated = [report, ...archivedReports];
    setArchivedReports(updated);
    saveStoredArchives(updated);

    const folderName = folderId ? archiveFolders.find(f => f.id === folderId)?.name || 'Folder' : 'Root Arsip';
    showToast(`✅ Rapor ${selectedChild.name} (${activeTherapyTab}) berhasil disimpan ke ${folderName}!`);
  };

  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);

  const loadFromArchive = (archive: any) => {
    if (archive.childId) setSelectedChildId(archive.childId);
    if (archive.period) setSelectedPeriod(archive.period);
    if (archive.year) setSelectedYear(archive.year);
    
    const targetData = JSON.parse(JSON.stringify(archive.data));
    
    // Sync to master state so it doesn't get overwritten by useEffect
    if (archive.childId) {
      setChildReports(prev => ({
        ...prev,
        [`${archive.childId}-${archive.type}`]: targetData
      }));
    }

    if (archive.type === 'OT') {
      setOtReportData(targetData);
      setActiveTherapyTab('OT');
    } else if (archive.type === 'TW') {
      setTwReportData(targetData);
      setActiveTherapyTab('TW');
    } else if (archive.type === 'REMEDIAL') {
      setRemReportData(targetData);
      setActiveTherapyTab('REMEDIAL');
    } else if (archive.type === 'FT') {
      setPhysioReportData(targetData);
      setActiveTherapyTab('FT');
    } else if (archive.type === 'HT') {
      setHtReportData(targetData);
      setActiveTherapyTab('HT');
    } else if (archive.type === 'BERKUDA') {
      setBerkudaReportData(targetData);
      setActiveTherapyTab('BERKUDA');
    } else {
      setCustomReportsData(prev => ({ ...prev, [archive.type]: targetData }));
      setActiveTherapyTab(archive.type);
    }
    
    if (archive.childId && archive.data?.managerComment) {
      setChildManagerComments(prev => ({
        ...prev,
        [`${archive.childId}-${archive.type}`]: archive.data.managerComment
      }));
    }
    
    setViewingArchiveSnapshot(archive);
    setViewingArchiveId(archive.id);
    setShowArchive(false);
    setRapotSubmenu('form');
  };

  const currentReportData = useMemo(() => {
    if (activeTherapyTab === 'OT') return otReportData;
    if (activeTherapyTab === 'TW') return twReportData;
    if (activeTherapyTab === 'REMEDIAL') return remReportData;
    if (activeTherapyTab === 'FT') return physioReportData;
    if (activeTherapyTab === 'HT') return htReportData;
    if (activeTherapyTab === 'BERKUDA') return berkudaReportData;
    return getCustomReportData(activeTherapyTab);
  }, [activeTherapyTab, otReportData, twReportData, remReportData, physioReportData, htReportData, berkudaReportData, getCustomReportData]);

  const currentFileName = useMemo(() => {
    if (viewingArchiveSnapshot) return viewingArchiveSnapshot.fileName;
    if (!selectedChild) return 'Rapot - Siswa.pdf';
    const now = new Date();
    const dateStr = formatArchiveDate(now);
    return formatRapotDownloadFileName(selectedChild.name, dateStr);
  }, [viewingArchiveSnapshot, selectedChild]);

  const updateCurrentSetting = (key: string, val: string) => {
    if (activeTherapyTab === 'OT') updateOTField(`settings.${key}`, val);
    else if (activeTherapyTab === 'TW') updateTWField('settings', key, val);
    else if (activeTherapyTab === 'REMEDIAL') updateRemField('settings', key, val);
    else if (activeTherapyTab === 'FT') updatePhysioField('settings', key, val);
    else if (activeTherapyTab === 'HT') updateHtField('settings', key, val);
    else if (activeTherapyTab === 'BERKUDA') updateBerkudaField('settings', key, val);
    else updateCustomReportField(`settings.${key}`, val);
  };

  const updateCurrentIdentitas = (key: string, val: string) => {
    if (activeTherapyTab === 'OT') updateOTField(`identitas.${key}`, val);
    else if (activeTherapyTab === 'TW') updateTWField('identitas', key, val);
    else if (activeTherapyTab === 'REMEDIAL') updateRemField('identitas', key, val);
    else if (activeTherapyTab === 'FT') updatePhysioField('identitas', key, val);
    else if (activeTherapyTab === 'HT') updateHtField('identitas', key, val);
    else if (activeTherapyTab === 'BERKUDA') updateBerkudaField('identitas', key, val);
    else updateCustomReportField(`identitas.${key}`, val);
  };

  const TableHeader = ({ title, scale, scaleKey, onTitleChange, isEditing, therapyType }: any) => {
    const currentTherapy = therapyType || activeTherapyTab;
    const reportData = 
      currentTherapy === 'OT' ? otReportData : 
      currentTherapy === 'TW' ? twReportData : 
      currentTherapy === 'REMEDIAL' ? remReportData : 
      currentTherapy === 'FT' ? physioReportData :
      currentTherapy === 'HT' ? htReportData : 
      currentTherapy === 'BERKUDA' ? berkudaReportData : getCustomReportData(currentTherapy);
    
    const updateTitle = (field: string, val: string) => {
      if (currentTherapy === 'OT') updateOTField(field, val);
      else if (currentTherapy === 'TW') updateTWField('settings', field, val);
      else if (currentTherapy === 'REMEDIAL') updateRemField('settings', field, val);
      else if (currentTherapy === 'FT') updatePhysioField('settings', field, val);
      else if (currentTherapy === 'HT') updateHtField('settings', field, val);
      else if (currentTherapy === 'BERKUDA') updateBerkudaField('settings', field, val);
      else updateCustomReportField(`settings.${field}`, val);
    };

    const headerAwal = reportData.settings.titles.headerAwal || 'AWAL';
    const headerHasil = reportData.settings.titles.headerHasil || 'HASIL';
    
    const activeScale = scaleKey && reportData.settings.titles[scaleKey] ? (typeof reportData.settings.titles[scaleKey] === 'string' ? reportData.settings.titles[scaleKey].split('/').map((s: string) => s.trim()) : reportData.settings.titles[scaleKey]) : scale;
    const scaleString = activeScale.join('/');

    return (
      <div className="grid grid-cols-12 bg-slate-900/5 py-4 px-6 border-b border-slate-200">
        <div className="col-span-6 text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center pr-4">
          {isEditing && onTitleChange ? (
            <input 
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase p-0"
            />
          ) : title}
        </div>
        <div className="col-span-3 flex justify-around text-[10px] font-black text-slate-400">
          {isEditing ? (
            <div className="flex flex-col items-center gap-1">
              <input 
                value={headerAwal} 
                onChange={(e) => updateTitle('titles.headerAwal', e.target.value)}
                className="w-16 bg-transparent border-b border-slate-200 outline-none focus:border-slate-800 text-[10px] font-black text-center"
              />
              <div className="flex items-center gap-1">
                <span className="opacity-50">(</span>
                {scaleKey ? (
                  <input 
                    value={scaleString}
                    onChange={(e) => updateTitle(`titles.${scaleKey}`, e.target.value)}
                    className="w-16 bg-transparent border-b border-slate-200 outline-none focus:border-slate-800 text-[9px] font-black text-center text-slate-400 p-0"
                  />
                ) : (
                  <span className="opacity-50">{scaleString}</span>
                )}
                <span className="opacity-50">)</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span>{headerAwal}</span>
              <span className="block opacity-50">({scaleString})</span>
            </div>
          )}
        </div>
        <div className="col-span-3 flex justify-around text-[10px] font-black text-slate-400">
           {isEditing ? (
            <div className="flex flex-col items-center gap-1">
              <input 
                value={headerHasil} 
                onChange={(e) => updateTitle('titles.headerHasil', e.target.value)}
                className="w-16 bg-transparent border-b border-slate-200 outline-none focus:border-slate-800 text-[10px] font-black text-center"
              />
              <div className="flex items-center gap-1">
                <span className="opacity-50">(</span>
                {scaleKey ? (
                  <input 
                    value={scaleString}
                    onChange={(e) => updateTitle(`titles.${scaleKey}`, e.target.value)}
                    className="w-16 bg-transparent border-b border-slate-200 outline-none focus:border-slate-800 text-[9px] font-black text-center text-slate-400 p-0"
                  />
                ) : (
                  <span className="opacity-50">{scaleString}</span>
                )}
                <span className="opacity-50">)</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span>{headerHasil}</span>
              <span className="block opacity-50">({scaleString})</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OTReportRow = ({ label, awal, hasil, scale, onUpdate, onDelete, isEditing }: any) => (
    <div className="grid grid-cols-12 border-b border-slate-100 py-3 px-6 hover:bg-slate-50/80 transition-colors group relative items-center">
      <div className="col-span-6 text-sm font-semibold text-slate-700 leading-snug flex items-center pr-4">
        {isEditing ? (
          <textarea 
            value={label} 
            onChange={(e) => onUpdate('label', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 resize-none overflow-hidden focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 outline-none transition-all"
            rows={1}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        ) : <span className="text-xs sm:text-sm font-medium text-slate-800">{label}</span>}
      </div>
      <div className="col-span-3 flex justify-around items-center">
        {scale.map((s: string) => {
          const isSelected = awal === s;
          return (
            <button 
              key={s} 
              type="button"
              disabled={!isEditing}
              onClick={() => isEditing && onUpdate('awal', s)} 
              className={cn(
                "w-6 h-6 rounded-md text-[10px] font-mono font-bold border transition-all flex items-center justify-center",
                isSelected 
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs" 
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                !isEditing && !isSelected && "opacity-35",
                isEditing && "cursor-pointer"
              )}
              title={`Skala: ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div className="col-span-3 flex justify-around items-center">
        {scale.map((s: string) => {
          const isSelected = hasil === s;
          return (
            <button 
              key={s} 
              type="button"
              disabled={!isEditing}
              onClick={() => isEditing && onUpdate('hasil', s)} 
              className={cn(
                "w-6 h-6 rounded-md text-[10px] font-mono font-bold border transition-all flex items-center justify-center",
                isSelected 
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs" 
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                !isEditing && !isSelected && "opacity-35",
                isEditing && "cursor-pointer"
              )}
              title={`Skala: ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>
      {isEditing && (
        <button 
          type="button"
          onClick={onDelete}
          className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-md transition-all print:hidden cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  const TWSectionItem = ({ it, onUpdate, onDelete, isEditing, therapyType }: any) => {
    const currentTherapy = therapyType || activeTherapyTab;
    const reportData = currentTherapy === 'OT' ? otReportData : currentTherapy === 'TW' ? twReportData : currentTherapy === 'REMEDIAL' ? remReportData : physioReportData;
    
    const updateTitle = (field: string, val: string) => {
      if (currentTherapy === 'TW') updateTWField('settings', field, val);
      else if (currentTherapy === 'REMEDIAL') updateRemField('settings', field, val);
      else updatePhysioField('settings', field, val);
    };

    const labelTgl = reportData.settings.titles.labelTgl || 'Tujuan Tercapai:';
    const labelMedia = reportData.settings.titles.labelMedia || 'Media :';
    const labelAktivitas = reportData.settings.titles.labelAktivitas || 'Aktivitas';
    const labelAwal = reportData.settings.titles.labelAwal || (currentTherapy === 'REMEDIAL' ? 'Kondisi Awal' : 'Awal');
    const labelTujuan = reportData.settings.titles.labelTujuan || (currentTherapy === 'REMEDIAL' ? 'Tujuan Capaian' : 'Tujuan');
    const labelHasil = reportData.settings.titles.labelHasil || (currentTherapy === 'REMEDIAL' ? 'Hasil Evaluasi' : 'Hasil');

    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm group">
        <div className="bg-slate-900 text-white px-8 py-3 font-black text-xs uppercase tracking-widest flex justify-between items-center">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <input 
                value={it.label} 
                onChange={(e) => onUpdate('label', e.target.value)}
                className="w-full bg-slate-800 text-white border-none outline-none focus:ring-0 p-0 text-xs font-black uppercase tracking-widest"
              />
            ) : <span>{it.label}</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input 
                  value={labelTgl} 
                  onChange={(e) => updateTitle('titles.labelTgl', e.target.value)}
                  className="bg-slate-800 text-white border-none outline-none focus:ring-0 p-0 text-[9px] font-black w-24 opacity-60 uppercase"
                />
              ) : <span className="opacity-60 text-[9px] whitespace-nowrap">{labelTgl}</span>}
              {isEditing ? (
                <input 
                  value={it.tujuanTercapai || ''} 
                  onChange={(e) => onUpdate('tujuanTercapai', e.target.value)}
                  className="bg-slate-800 text-white border-none outline-none focus:ring-0 p-0 text-[9px] font-black w-20"
                  placeholder="Tgl..."
                />
              ) : <span className="text-[9px]">{it.tujuanTercapai}</span>}
            </div>
            {isEditing && (
              <button onClick={onDelete} className="text-red-400 hover:text-red-300 transition-colors shrink-0 print:hidden">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <input 
                value={labelMedia} 
                onChange={(e) => updateTitle('titles.labelMedia', e.target.value)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent border-none outline-none focus:ring-0"
              />
            ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{labelMedia}</span>}
            {isEditing ? (
              <input 
                value={it.media || ''} 
                onChange={(e) => onUpdate('media', e.target.value)}
                placeholder="Media..."
                className="text-xs font-bold text-[#3D3A30] bg-[#3D3A30]/5 px-3 py-1 rounded-full outline-none"
              />
            ) : <span className="text-xs font-bold text-[#3D3A30] bg-[#3D3A30]/5 px-3 py-1 rounded-full">{it.media}</span>}
          </div>
          {[
            { label: labelAktivitas, labelKey: 'titles.labelAktivitas', value: it.aktivitas, field: 'aktivitas', bullet: '●' },
            { label: labelAwal, labelKey: 'titles.labelAwal', value: it.awal, field: 'awal', bullet: '●' },
            { label: labelTujuan, labelKey: 'titles.labelTujuan', value: it.tujuan, field: 'tujuan', bullet: '●' },
            { label: labelHasil, labelKey: 'titles.labelHasil', value: it.hasil, field: 'hasil', bullet: '●' },
          ].map((field, i) => (
            <div key={i} className="flex gap-4">
              <span className="mt-1 font-bold text-slate-400">{field.bullet}</span>
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    value={field.label} 
                    onChange={(e) => updateTitle(field.labelKey, e.target.value)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 bg-transparent border-none outline-none focus:ring-0 w-full"
                  />
                ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{field.label} :</span>}
                {isEditing ? (
                  <textarea 
                    value={field.value} 
                    onChange={(e) => onUpdate(field.field, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/5 min-h-[60px]"
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed font-serif italic whitespace-pre-wrap">{field.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[300] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Executive Clinical Header & Control Command */}
        <header className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 lg:p-7 relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-50/50 via-indigo-50/30 to-transparent pointer-events-none rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ClipboardList className="h-3.5 w-3.5 text-teal-400" />
                <span>Dokumentasi Klinis & Evaluasi Intervensi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                Rapor Perkembangan Terapi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
                Pusat evaluasi berkala capaian fungsional siswa, observasi respon sensori-motorik, dan rekomendasi home program berkelanjutan.
              </p>

              {/* Active Clinical Context Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 font-semibold">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  {selectedChild ? selectedChild.name : 'Pilih Pasien/Siswa'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Disiplin: {therapyCategories.find(c => c.id === activeTherapyTab)?.name || activeTherapyTab}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {selectedPeriod === 'Jan-Jun' ? 'Semester 1 (Jan-Jun)' : 'Semester 2 (Jul-Des)'} {selectedYear}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border",
                  isEditing 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>
                  <CheckSquare className="w-3.5 h-3.5" />
                  {isEditing ? 'Mode Edit Aktif' : 'Mode Pratinjau Resmi'}
                </span>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Period & Year Selector Group */}
              <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200 text-xs">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200/60 outline-none shadow-xs cursor-pointer text-xs"
                >
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
                <div className="h-4 w-px bg-slate-300 mx-1.5" />
                <button 
                  type="button"
                  onClick={() => setSelectedPeriod('Jan-Jun')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer",
                    selectedPeriod === 'Jan-Jun' 
                      ? "bg-slate-900 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Jan - Jun
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedPeriod('Jul-Des')}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer",
                    selectedPeriod === 'Jul-Des' 
                      ? "bg-slate-900 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Jul - Des
                </button>
              </div>

              {/* Mode Toggle Button */}
              <button 
                type="button"
                onClick={() => setIsEditing(!isEditing)} 
                className={cn(
                  "px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border shadow-xs",
                  isEditing 
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-200" 
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                )}
                title="Alihkan mode pengisian data vs mode pratinjau"
              >
                {isEditing ? <CheckSquare className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span>{isEditing ? 'Selesai Edit' : 'Edit Formulir'}</span>
              </button>

              {/* Review Manager Toggle */}
              {selectedChild && (
                <button 
                  type="button"
                  onClick={() => setShowManagerComment(!showManagerComment)} 
                  className={cn(
                    "px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border shadow-xs",
                    showManagerComment 
                      ? "bg-indigo-900 text-white border-indigo-900 shadow-indigo-200" 
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  )}
                  title="Panel Komentar & Peninjauan Manajemen"
                >
                  <ShieldCheck className={cn("h-4 w-4", showManagerComment ? "text-teal-300" : "text-indigo-600")} />
                  <span>{showManagerComment ? 'Tutup Review' : 'Tinjau Rapot'}</span>
                </button>
              )}

              {/* Save with Folder Dropdown */}
              <div className="relative inline-flex">
                <button 
                  type="button"
                  onClick={() => {
                    saveToArchive();
                    setShowSaveDropdown(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Simpan status rapot saat ini ke arsip"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Arsip</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-2 rounded-r-2xl border-l border-blue-500 flex items-center transition-colors cursor-pointer"
                  title="Pilih folder tujuan arsip"
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showSaveDropdown && "rotate-180")} />
                </button>

                {showSaveDropdown && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setShowSaveDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                        <span>Pilih Folder Arsip</span>
                        <FolderOpen className="h-3 w-3 text-slate-400" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          saveToArchive(null);
                          setShowSaveDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                      >
                        <FolderOpen className="h-4 w-4 text-slate-400" /> Root Arsip (Utama)
                      </button>
                      {archiveFolders.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border-t border-slate-100">
                          {archiveFolders.map(f => (
                            <button 
                              key={f.id}
                              type="button"
                              onClick={() => {
                                saveToArchive(f.id);
                                setShowSaveDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                            >
                              <Folder className="h-4 w-4 text-blue-500" /> {f.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Print Preview & Cetak Rapot */}
              {selectedChild && (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveArchiveForPreview(null);
                      setIsPreviewModalOpen(true);
                    }} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Pratinjau Cetak Format A4 Resmi dengan Tanda Tangan"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Print Preview</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveArchiveForPreview(null);
                      setIsPreviewModalOpen(true);
                    }} 
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Cetak format A4 resmi"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak Rapot</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Clinical View Tabs (Segmented Control) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 print:hidden">
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setRapotSubmenu('form')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                rapotSubmenu === 'form'
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              <ClipboardList className="h-4 w-4 text-teal-400" /> Formulir Evaluasi Klinis
            </button>
            <button
              type="button"
              onClick={() => setRapotSubmenu('chart')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                rapotSubmenu === 'chart'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              <Activity className="h-4 w-4 text-indigo-300" /> Analisis & Radar Capaian
            </button>
            <button
              type="button"
              onClick={() => setRapotSubmenu('archive')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                rapotSubmenu === 'archive'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              <History className="h-4 w-4 text-blue-300" /> Bank Arsip Rapor
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                rapotSubmenu === 'archive' ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
              )}>
                {archivedReports.length}
              </span>
            </button>
          </div>

          {/* Quick Search Student in Form Mode */}
          {rapotSubmenu === 'form' && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari pasien / nama siswa..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none shadow-xs" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Submenu View: Grafik & Radar Capaian */}
        {rapotSubmenu === 'chart' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Grafik Capaian & Analisis Radar Perkembangan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi radar per domain terapi, grafik tren per bulan, ringkasan capaian, dan target intervensi berikutnya.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Siswa Terpilih:</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                  {selectedChild ? selectedChild.name : 'Pilih Siswa'}
                </span>
              </div>
            </div>

            <AchievementChartPage 
              therapyType={activeTherapyTab}
              childName={selectedChild?.name || 'Siswa Terapi'}
              childId={selectedChildId || 'C101'}
              isEditing={isEditing}
              reportData={
                activeTherapyTab === 'OT' ? otReportData :
                activeTherapyTab === 'TW' ? twReportData :
                activeTherapyTab === 'REMEDIAL' ? remReportData :
                activeTherapyTab === 'FT' ? physioReportData :
                activeTherapyTab === 'HT' ? htReportData : 
                activeTherapyTab === 'BERKUDA' ? berkudaReportData : getCustomReportData(activeTherapyTab)
              }
              period={selectedPeriod}
              onSessionsChange={(total, present) => updateSessions(activeTherapyTab, total, present)}
            />
          </div>
        )}

        {/* Snapshot Banner when viewing an archived report */}
        {viewingArchiveSnapshot && rapotSubmenu === 'form' && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden border border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
                <FileText className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Melihat Arsip Rapot
                  </span>
                  <span className="text-xs text-blue-200">
                    Disimpan {viewingArchiveSnapshot.saveDate} pukul {viewingArchiveSnapshot.saveTime} WIB
                  </span>
                </div>
                <p className="text-sm font-black text-white font-mono mt-0.5">
                  {viewingArchiveSnapshot.fileName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveArchiveForPreview(viewingArchiveSnapshot);
                  setIsPreviewModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Eye className="h-4 w-4" /> Print Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveArchiveForPreview(viewingArchiveSnapshot);
                  setIsPreviewModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Rapot
              </button>
              <button
                type="button"
                onClick={() => setViewingArchiveSnapshot(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" /> Keluar dari Mode Arsip
              </button>
            </div>
          </div>
        )}

        {/* Submenu View: Arsip Rapot */}
        {rapotSubmenu === 'archive' && (
          <RapotArchiveView
            archives={archivedReports}
            folders={archiveFolders}
            allChildren={allChildren}
            logoUrl={logoUrl}
            onOpenArchive={(archive) => {
              loadFromArchive(archive);
            }}
            onDeleteArchive={handleDeleteArchive}
            onMoveArchive={handleMoveArchive}
            onCreateFolder={createFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={deleteFolder}
            onDirectPrintPreview={(archive) => {
              setActiveArchiveForPreview(archive);
              setIsPreviewModalOpen(true);
            }}
            onDirectDownloadPdf={(archive) => {
              setActiveArchiveForPreview(archive);
              setIsPreviewModalOpen(true);
            }}
            onSwitchToForm={() => setRapotSubmenu('form')}
          />
        )}

        {/* Submenu View: Formulir Rapot (Existing Layout) */}
        {rapotSubmenu === 'form' && (
        <div className={cn("grid grid-cols-1 gap-8", showManagerComment ? "lg:grid-cols-12" : "lg:grid-cols-4")}>
          
          {/* Patient Command Rail (Daftar Pasien Terapi) */}
          <aside className={cn("space-y-4 print:hidden", showManagerComment ? "lg:col-span-3" : "lg:col-span-1")}>
             <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 sticky top-6">
                <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Pasien Terapi</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {allChildren.length} Terdaftar
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {filteredChildren.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-medium">Tidak ada siswa ditemukan</p>
                    </div>
                  ) : (
                    filteredChildren.map(child => {
                      const isSelected = selectedChildId === child.id;
                      return (
                        <div key={child.id} className="relative group">
                          <button 
                            type="button"
                            onClick={() => setSelectedChildId(child.id)} 
                            className={cn(
                              "w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all relative text-left cursor-pointer border",
                              isSelected 
                                ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10" 
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/70"
                            )}
                          >
                            <img 
                              src={child.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`} 
                              alt={child.name} 
                              className="h-9 w-9 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/50" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-bold leading-tight truncate", isSelected ? "text-white" : "text-slate-900")}>
                                {child.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn("text-[10px] font-mono", isSelected ? "text-teal-300" : "text-slate-400 font-medium")}>
                                  {child.id.split('-')[0].toUpperCase()}
                                </span>
                                {child.age && (
                                  <span className={cn("text-[9px] px-1.5 py-0.2 rounded font-medium", isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                                    {child.age} thn
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveArchiveForPreview(null);
                                  setIsPreviewModalOpen(true);
                                }}
                                className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Pratinjau Cetak Cepat A4"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
          </aside>

          {/* Main Clinical Document Workspace */}
          <main className={showManagerComment ? "lg:col-span-6 xl:col-span-6" : "lg:col-span-3"}>
            {selectedChild ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Clinical Patient Dossier Summary Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs print:hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedChild.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChild.id}`}
                        alt={selectedChild.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-100 bg-slate-50 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            {selectedChild.name}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            Status Aktif
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          ID: <span className="font-mono text-slate-700">{selectedChild.id}</span> • Unit: {currentReportData.identitas?.unit || selectedChild.schoolOrigin || 'Pelangi Lazuardi RC'}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {currentReportData.identitas?.usia && (
                        <div className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Usia</span>
                          <span className="text-xs font-bold text-slate-800">{currentReportData.identitas.usia}</span>
                        </div>
                      )}
                      {currentReportData.identitas?.tanggalEvaluasi && (
                        <div className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tgl Evaluasi</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{currentReportData.identitas.tanggalEvaluasi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Disciplinary Therapy Rail */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Pilih Disiplin Layanan Terapi
                      </p>
                      <button 
                        type="button"
                        onClick={() => setIsAddTherapyModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-400" />
                        <span>Tambah Layanan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-2">
                      {therapyCategories.map(cat => {
                        const isActive = activeTherapyTab === cat.id;
                        return (
                          <div key={cat.id} className="relative group">
                            <button 
                              type="button"
                              onClick={() => setActiveTherapyTab(cat.id)} 
                              className={cn(
                                "w-full px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer relative overflow-hidden",
                                isActive 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-200" 
                                  : "bg-slate-50/70 hover:bg-white text-slate-600 border-slate-200/80 hover:border-slate-300"
                              )}
                            >
                              <cat.Icon className={cn("h-4 w-4", isActive ? "text-teal-400" : cat.color)} />
                              <span className="leading-tight text-[11px] truncate w-full">{cat.name}</span>
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              )}
                            </button>
                            {cat.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomTherapy(cat.id, cat.name, e)}
                                title={`Hapus layanan ${cat.name}`}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {/* Plus button inside the grid */}
                      <button 
                        type="button"
                        onClick={() => setIsAddTherapyModalOpen(true)}
                        className="px-3 py-2.5 rounded-2xl text-xs font-bold border border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/40 text-slate-500 hover:text-teal-700 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-700" />
                        </div>
                        <span className="leading-tight text-[11px] truncate w-full font-semibold">+ Layanan</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 lg:p-20 print:p-0 print:border-none print:shadow-none overflow-hidden relative printable-area">
                   {viewingArchiveId && (
                     <div className="absolute top-0 left-0 right-0 py-3 bg-blue-600 flex items-center justify-center gap-4 text-white font-black text-xs uppercase tracking-widest z-10 animate-in fade-in slide-in-from-top-1 px-8 print:hidden">
                       <span className="flex items-center gap-2">
                         <History className="h-4 w-4" /> SEDANG MELIHAT ARSIP (PREVIEW)
                       </span>
                       <button 
                         onClick={() => setViewingArchiveId(null)}
                         className="px-4 py-1.5 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-lg transition-all text-[9px]"
                       >
                         KELUAR DARI ARSIP
                       </button>
                     </div>
                   )}
                   {/* Print Only Header */}
                   <div className="hidden print:flex flex-col mb-10 pb-6 border-b-2 border-slate-900">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                          <img src={logoUrl || "https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png"} className="h-24 w-auto object-contain" />
                             <div>
                               {isEditing ? (
                                 <input 
                                   value={currentReportData.settings?.titles?.headerInstName || 'Pelangi Lazuardi'}
                                   onChange={e => updateCurrentSetting('titles.headerInstName', e.target.value)}
                                   className="text-2xl font-black text-slate-900 leading-none bg-transparent border-b border-slate-200 outline-none w-full mb-1"
                                 />
                               ) : (
                                 <h2 className="text-2xl font-black text-slate-900 leading-none">
                                   {currentReportData.settings?.titles?.headerInstName || 'Pelangi Lazuardi'}
                                 </h2>
                               )}
                               {isEditing ? (
                                 <input 
                                   value={currentReportData.settings?.titles?.headerInstSub || ''}
                                   onChange={e => updateCurrentSetting('titles.headerInstSub', e.target.value)}
                                   className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 bg-transparent border-b border-slate-100 outline-none w-full"
                                 />
                               ) : (
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                   {currentReportData.settings?.titles?.headerInstSub || ''}
                                 </p>
                               )}
                               {isEditing ? (
                                 <textarea 
                                   value={currentReportData.settings?.titles?.headerInstAddress || ''}
                                   onChange={e => updateCurrentSetting('titles.headerInstAddress', e.target.value)}
                                   className="text-[9px] text-slate-400 mt-2 font-medium bg-transparent border-b border-slate-100 outline-none w-full"
                                 />
                               ) : (
                                 <p className="text-[9px] text-slate-400 mt-2 font-medium">
                                   {currentReportData.settings?.titles?.headerInstAddress || ''}
                                 </p>
                               )}
                             </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded mb-2">RAPOT PERKEMBANGAN</div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            NOMOR: {currentReportData.identitas?.noRegistrasi || '-'}
                          </p>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">
                            PERIODE: {selectedPeriod === 'Jan-Jun' ? 'Januari - Juni' : 'Juli - Desember'} {selectedYear}
                          </p>
                        </div>
                      </div>
                   </div>

                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none print:hidden"><ClipboardList className="h-64 w-64" /></div>
                   
                   <div className="max-w-4xl mx-auto space-y-16">
                      
                      {/* Section: Professional Header */}
                      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-slate-900 pb-12 gap-8 print:hidden">
                         <div className="flex items-center gap-6">
                            <img src={logoUrl || "https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png"} className="h-24 w-auto object-contain" />
                            <div>
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input 
                                    value={currentReportData.settings?.titles?.headerInstName || 'Pelangi Lazuardi'}
                                    onChange={(e) => updateCurrentSetting('titles.headerInstName', e.target.value)}
                                    className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-1 w-full bg-slate-50 border border-slate-100 rounded px-2"
                                  />
                                  <input 
                                    value={currentReportData.settings?.titles?.headerInstSub || ''}
                                    onChange={(e) => updateCurrentSetting('titles.headerInstSub', e.target.value)}
                                    className="text-[#3D3A30] font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 w-full bg-slate-50 border border-slate-100 rounded px-2"
                                  />
                                </div>
                              ) : (
                                <>
                                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-1">
                                    {currentReportData.settings?.titles?.headerInstName || 'Pelangi Lazuardi'}
                                  </h1>
                                  <p className="text-[#3D3A30] font-bold tracking-[0.4em] uppercase text-[10px] opacity-60">
                                    {currentReportData.settings?.titles?.headerInstSub || ''}
                                  </p>
                                </>
                              )}
                            </div>
                         </div>
                         <div className="text-right">
                            {isEditing ? (
                              <div className="flex flex-col items-end gap-1">
                                <input 
                                  value={currentReportData.settings?.titles?.headerReportTitle || 'PROGRESS REPORT'}
                                  onChange={(e) => updateCurrentSetting('titles.headerReportTitle', e.target.value)}
                                  className="text-2xl font-black text-slate-800 uppercase tracking-tight text-right bg-slate-50 border border-slate-100 rounded px-2"
                                />
                                <div className="flex items-center gap-1">
                                  <input 
                                    value={currentReportData.settings?.titles?.headerFilePrefix || 'FILE: '}
                                    onChange={(e) => updateCurrentSetting('titles.headerFilePrefix', e.target.value)}
                                    className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1 w-32 font-mono"
                                  />
                                  <span className="text-xs font-bold text-slate-400 font-mono italic">{selectedChild.id.split('-')[0].toUpperCase()}</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                                  {currentReportData.settings?.titles?.headerReportTitle || 'PROGRESS REPORT'}
                                </h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                                  PERIODE: {selectedPeriod === 'Jan-Jun' ? 'Januari - Juni' : 'Juli - Desember'} {selectedYear}
                                </p>
                                <p className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-lg mt-2 font-mono">
                                  {currentReportData.settings?.titles?.headerFilePrefix || 'FILE: '}
                                  {selectedChild.id.split('-')[0].toUpperCase()}
                                </p>
                              </>
                            )}
                         </div>
                      </div>

                      {/* Section: Child Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                         {[
                           { l: currentReportData.settings?.titles?.labelNama || 'Nama Lengkap', labelKey: 'labelNama', v: selectedChild.name, key: 'name', type: 'text', readOnly: true },
                           { l: currentReportData.settings?.titles?.labelNoReg || 'No. Registrasi', labelKey: 'labelNoReg', v: currentReportData.identitas?.noRegistrasi || '', key: 'identitas.noRegistrasi' },
                           { l: currentReportData.settings?.titles?.labelLahir || 'Tanggal Lahir', labelKey: 'labelLahir', v: currentReportData.identitas?.tanggalLahir || '', key: 'identitas.tanggalLahir' },
                           { l: currentReportData.settings?.titles?.labelUnit || 'Unit', labelKey: 'labelUnit', v: currentReportData.identitas?.unit || '', key: 'identitas.unit' },
                           { l: currentReportData.settings?.titles?.labelUsia || 'Usia', labelKey: 'labelUsia', v: currentReportData.identitas?.usia || '', key: 'identitas.usia' },
                           { l: currentReportData.settings?.titles?.labelTanggal || 'Tgl Evaluasi', labelKey: 'labelTanggal', v: currentReportData.identitas?.tanggalEvaluasi || '', key: 'identitas.tanggalEvaluasi' }
                         ].map((it, i) => (
                           <div key={i} className="flex justify-between border-b border-slate-100 pb-2 items-center">
                             <div className="shrink-0 flex items-center gap-2">
                               {isEditing ? (
                                 <input 
                                   value={it.l}
                                   onChange={(e) => updateCurrentSetting(`titles.${it.labelKey}`, e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded px-1 w-28"
                                 />
                               ) : (
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{it.l}</span>
                               )}
                             </div>
                             {isEditing && !it.readOnly ? (
                               <input 
                                 type={it.key === 'identitas.tanggalLahir' ? 'date' : 'text'} 
                                 value={it.v} 
                                 onChange={(e) => {
                                   const pathParts = it.key!.split('.');
                                   const value = e.target.value;
                                   
                                   if (it.key === 'identitas.tanggalLahir') {
                                     const ageString = calculateAge(value);
                                     
                                     if (activeTherapyTab === 'OT') {
                                       const newData = JSON.parse(JSON.stringify(otReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setOtReportData(newData);
                                       syncToMaster('OT', newData);
                                     } else if (activeTherapyTab === 'TW') {
                                       const newData = JSON.parse(JSON.stringify(twReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setTwReportData(newData);
                                       syncToMaster('TW', newData);
                                     } else if (activeTherapyTab === 'REMEDIAL') {
                                       const newData = JSON.parse(JSON.stringify(remReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setRemReportData(newData);
                                       syncToMaster('REMEDIAL', newData);
                                     } else if (activeTherapyTab === 'FT') {
                                       const newData = JSON.parse(JSON.stringify(physioReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setPhysioReportData(newData);
                                       syncToMaster('FT', newData);
                                     } else if (activeTherapyTab === 'HT') {
                                       const newData = JSON.parse(JSON.stringify(htReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setHtReportData(newData);
                                       syncToMaster('HT', newData);
                                     } else if (activeTherapyTab === 'BERKUDA') {
                                       const newData = JSON.parse(JSON.stringify(berkudaReportData));
                                       newData.identitas.tanggalLahir = value;
                                       newData.identitas.usia = ageString;
                                       setBerkudaReportData(newData);
                                       syncToMaster('BERKUDA', newData);
                                     }
                                   } else {
                                     updateCurrentIdentitas(pathParts[1], value);
                                   }
                                 }}
                                 className="text-sm font-bold text-slate-800 uppercase text-right bg-slate-50 border border-slate-100 rounded px-2 py-0.5 w-full ml-4"
                               />
                             ) : (
                               <span className={cn(
                                 "text-sm font-bold text-slate-800 uppercase",
                                 it.key === 'name' && "underline decoration-slate-200 underline-offset-4"
                               )}>{it.v}</span>
                             )}
                           </div>
                         ))}
                      </div>

                      {activeTherapyTab === 'OT' ? (
                        <>
                          {/* Section: Perilaku Umum */}
                          <div className="space-y-6">
                            <div className="bg-[#3D3A30] text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1">
                                  {isEditing ? (
                                    <input 
                                      value={otReportData.settings.titles.perilakuUmum}
                                      onChange={(e) => updateOTField('settings.titles.perilakuUmum', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : otReportData.settings.titles.perilakuUmum}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('perilakuUmum', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                              <TableHeader 
                                title={otReportData.settings.titles.tableHeaderIndikator || "Respons"} 
                                scale={['T', 'F']} 
                                scaleKey="scalePerilaku"
                                isEditing={isEditing}
                                therapyType="OT"
                                onTitleChange={(v: string) => updateOTField('settings.titles.tableHeaderIndikator', v)}
                              />
                              {otReportData.perilakuUmum.items.map((it: any, i: number) => (
                                <OTReportRow 
                                  key={i} 
                                  label={it.label} 
                                  awal={it.awal} 
                                  hasil={it.hasil} 
                                  isEditing={isEditing}
                                  scale={otReportData.settings.titles.scalePerilaku ? (typeof otReportData.settings.titles.scalePerilaku === 'string' ? otReportData.settings.titles.scalePerilaku.split('/').map((s: string) => s.trim()) : otReportData.settings.titles.scalePerilaku) : ['teramati', 'tidak']} 
                                  onUpdate={(f: any, v: any) => {
                                    const newData = JSON.parse(JSON.stringify(otReportData));
                                    newData.perilakuUmum.items[i][f] = v;
                                    setOtReportData(newData);
                                  }} 
                                  onDelete={() => deleteItem('perilakuUmum', null, i)}
                                />
                              ))}
                              <div className="p-8 bg-slate-50/50">
                                {isEditing ? (
                                  <input 
                                    value={otReportData.settings.titles.komentarPerilaku}
                                    onChange={(e) => updateOTField('settings.titles.komentarPerilaku', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{otReportData.settings.titles.komentarPerilaku}</p>
                                )}
                              {isEditing ? (
                                  <textarea 
                                    value={otReportData.perilakuUmum.komentar}
                                    onChange={(e) => updateOTField('perilakuUmum.komentar', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                  />
                                ) : (
                                  <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{otReportData.perilakuUmum.komentar}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section A: Sensory */}
                          <div className="space-y-8">
                            <div className="bg-red-600 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100">
                              {isEditing ? (
                                <input 
                                  value={otReportData.settings.titles.sensory}
                                  onChange={(e) => updateOTField('settings.titles.sensory', e.target.value)}
                                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                />
                              ) : otReportData.settings.titles.sensory}
                            </div>
                            {[
                              { id: 'modulasi', title: otReportData.settings.titles.sensoryModulasi || '1. Sensori Modulasi', scale: ['B', 'S', 'K', 'BR'] },
                              { id: 'diskriminasi', title: otReportData.settings.titles.sensoryDiskriminasi || '2. Sensori Diskriminasi', scale: ['MD', 'SD', 'TD'] },
                              { id: 'praksis', title: otReportData.settings.titles.sensoryPraksis || '3. Praksis', scale: ['MD', 'SD', 'TD'] }
                            ].map((s: any) => (
                              <div key={s.id} className="space-y-3">
                                <div className="bg-slate-900 text-white px-4 py-1 flex justify-between items-center rounded-lg pr-1">
                                  {isEditing ? (
                                    <input 
                                      value={s.title}
                                      onChange={(e) => {
                                        const key = s.id === 'modulasi' ? 'sensoryModulasi' : s.id === 'diskriminasi' ? 'sensoryDiskriminasi' : 'sensoryPraksis';
                                        updateOTField(`settings.titles.${key}`, e.target.value);
                                      }}
                                      className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest pl-2 w-full"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-black uppercase tracking-widest pl-2">{s.title}</span>
                                  )}
                                  {isEditing && (
                                    <button onClick={() => addItem('sensory', s.id)} className="bg-white/20 hover:bg-white/40 p-1 rounded transition-colors print:hidden">
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                                  <TableHeader 
                                    title={otReportData.settings.titles.tableHeaderSensori || "Respons"} 
                                    scale={s.scale} 
                                    scaleKey={s.id === 'modulasi' ? 'scaleSensoryMod' : 'scaleSensory'}
                                    isEditing={isEditing} 
                                    therapyType="OT" 
                                    onTitleChange={(v: string) => updateOTField('settings.titles.tableHeaderSensori', v)}
                                  />
                                  {otReportData.sensory[s.id].map((it: any, i: number) => {
                                    const activeScale = otReportData.settings.titles[s.id === 'modulasi' ? 'scaleSensoryMod' : 'scaleSensory'] ? (typeof otReportData.settings.titles[s.id === 'modulasi' ? 'scaleSensoryMod' : 'scaleSensory'] === 'string' ? otReportData.settings.titles[s.id === 'modulasi' ? 'scaleSensoryMod' : 'scaleSensory'].split('/').map((sc: string) => sc.trim()) : otReportData.settings.titles[s.id === 'modulasi' ? 'scaleSensoryMod' : 'scaleSensory']) : s.scale;
                                    return (
                                      <OTReportRow 
                                        key={i} 
                                        label={it.label} 
                                        awal={it.awal} 
                                        hasil={it.hasil} 
                                        isEditing={isEditing}
                                        scale={activeScale} 
                                        onUpdate={(f: any, v: any) => {
                                          const newData = JSON.parse(JSON.stringify(otReportData));
                                          newData.sensory[s.id][i][f] = v;
                                          setOtReportData(newData);
                                        }}
                                        onDelete={() => deleteItem('sensory', s.id, i)}
                                      />
                                    );
                                  })}
                                  <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                    {isEditing ? (
                                      <input 
                                        value={otReportData.settings.titles[s.id === 'modulasi' ? 'scaleExplanationsSensoryMod' : 'scaleExplanationsSensory'] || (s.id === 'modulasi' ? 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah' : 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan')}
                                        onChange={e => updateOTField(`settings.titles.${s.id === 'modulasi' ? 'scaleExplanationsSensoryMod' : 'scaleExplanationsSensory'}`, e.target.value)}
                                        className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                      />
                                    ) : (
                                      (otReportData.settings.titles[s.id === 'modulasi' ? 'scaleExplanationsSensoryMod' : 'scaleExplanationsSensory'] || (s.id === 'modulasi' ? 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah' : 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan')).split('|').map((sc: string, idx: number) => <span key={idx}>{sc.trim()}</span>)
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                              {isEditing ? (
                                <input 
                                  value={otReportData.settings.titles.komentarSensory}
                                  onChange={(e) => updateOTField('settings.titles.komentarSensory', e.target.value)}
                                  className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                />
                              ) : (
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{otReportData.settings.titles.komentarSensory}</p>
                              )}
                              {isEditing ? (
                                <textarea 
                                  value={otReportData.sensory.komentar}
                                  onChange={(e) => updateOTField('sensory.komentar', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                />
                              ) : (
                                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{otReportData.sensory.komentar}</p>
                              )}
                            </div>
                          </div>

                          {/* Section B: Motorik */}
                          <div className="space-y-8">
                            <div className="bg-yellow-400 text-[#3D3A30] px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-50">
                              {isEditing ? (
                                <input 
                                  value={otReportData.settings.titles.motorik}
                                  onChange={(e) => updateOTField('settings.titles.motorik', e.target.value)}
                                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                />
                              ) : otReportData.settings.titles.motorik}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {['kasar', 'halus'].map(m => (
                                 <div key={m} className="space-y-3">
                                   <div className="bg-slate-900 text-white px-4 py-1 flex justify-between items-center rounded-lg pr-1">
                                     <span className="text-[9px] font-black uppercase tracking-widest pl-2">{m === 'kasar' ? '1. Motorik Kasar' : '2. Motorik Halus'}</span>
                                     {isEditing && (
                                       <button onClick={() => addItem('motorik', m)} className="bg-white/20 hover:bg-white/40 p-1 rounded transition-colors print:hidden">
                                         <Plus className="h-3 w-3" />
                                       </button>
                                     )}
                                   </div>
                                   <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                     <TableHeader title={otReportData.settings.titles.tableHeaderAktivitas || "Aktivitas"} scale={['MD', 'SD', 'TD']} scaleKey="scaleMotorik" isEditing={isEditing} therapyType="OT" onTitleChange={(v: string) => updateOTField('settings.titles.tableHeaderAktivitas', v)} />
                                     {otReportData.motorik[m].map((it: any, i: number) => {
                                       const activeScale = otReportData.settings.titles.scaleMotorik ? (typeof otReportData.settings.titles.scaleMotorik === 'string' ? otReportData.settings.titles.scaleMotorik.split('/').map((sc: string) => sc.trim()) : otReportData.settings.titles.scaleMotorik) : ['MD', 'SD', 'TD'];
                                       return (
                                         <OTReportRow 
                                           key={i} 
                                           label={it.label} 
                                           awal={it.awal} 
                                           hasil={it.hasil} 
                                           isEditing={isEditing}
                                           scale={activeScale} 
                                           onUpdate={(f: any, v: any) => {
                                              const newData = JSON.parse(JSON.stringify(otReportData));
                                              newData.motorik[m][i][f] = v;
                                              setOtReportData(newData);
                                           }}
                                           onDelete={() => deleteItem('motorik', m, i)}
                                         />
                                       );
                                     })}
                                     <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                       {isEditing ? (
                                         <input 
                                           value={otReportData.settings.titles.scaleExplanationsMotorik || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
                                           onChange={e => updateOTField('settings.titles.scaleExplanationsMotorik', e.target.value)}
                                           className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                         />
                                       ) : (
                                         (otReportData.settings.titles.scaleExplanationsMotorik || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan').split('|').map((sc: string, idx: number) => <span key={idx}>{sc.trim()}</span>)
                                       )}
                                     </div>
                                   </div>
                                 </div>
                               ))}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                              {isEditing ? (
                                 <input 
                                   value={otReportData.settings.titles.komentarMotorik}
                                   onChange={(e) => updateOTField('settings.titles.komentarMotorik', e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                 />
                               ) : (
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{otReportData.settings.titles.komentarMotorik}</p>
                               )}
                              {isEditing ? (
                                <textarea 
                                  value={otReportData.motorik.komentar}
                                  onChange={(e) => updateOTField('motorik.komentar', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                />
                              ) : (
                                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{otReportData.motorik.komentar}</p>
                              )}
                            </div>
                          </div>

                          {/* Section C: Kognisi */}
                          <div className="space-y-6">
                            <div className="bg-green-600 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={otReportData.settings.titles.kognisi}
                                      onChange={(e) => updateOTField('settings.titles.kognisi', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : otReportData.settings.titles.kognisi}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('kognisi', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                              <TableHeader title={otReportData.settings.titles.tableHeaderKognisi || "Aktivitas"} scale={['TM', 'KP', 'KTK', 'KK']} scaleKey="scaleKognisi" isEditing={isEditing} therapyType="OT" onTitleChange={(v: string) => updateOTField('settings.titles.tableHeaderKognisi', v)} />
                              {otReportData.kognisi.items.map((it: any, i: number) => {
                                const activeScale = otReportData.settings.titles.scaleKognisi ? (typeof otReportData.settings.titles.scaleKognisi === 'string' ? otReportData.settings.titles.scaleKognisi.split('/').map((sc: string) => sc.trim()) : otReportData.settings.titles.scaleKognisi) : ['TM', 'KP', 'KTK', 'KK'];
                                return (
                                  <OTReportRow 
                                    key={i} 
                                    label={it.label} 
                                    awal={it.awal} 
                                    hasil={it.hasil} 
                                    isEditing={isEditing}
                                    scale={activeScale} 
                                    onUpdate={(f: any, v: any) => {
                                      const newData = JSON.parse(JSON.stringify(otReportData));
                                      newData.kognisi.items[i][f] = v;
                                      setOtReportData(newData);
                                    }}
                                    onDelete={() => deleteItem('kognisi', null, i)}
                                  />
                                );
                              })}
                              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                {isEditing ? (
                                  <input 
                                    value={otReportData.settings.titles.scaleExplanationsKognisi || 'TM: Tidak Memperlihatkan | KP: Kadang Perlu | KTK: Konsisten Tanpa Kendala | KK: Konsisten Kelola'}
                                    onChange={e => updateOTField('settings.titles.scaleExplanationsKognisi', e.target.value)}
                                    className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                  />
                                ) : (
                                  (otReportData.settings.titles.scaleExplanationsKognisi || 'TM: Tidak Memperlihatkan | KP: Kadang Perlu | KTK: Konsisten Tanpa Kendala | KK: Konsisten Kelola').split('|').map((sc: string, idx: number) => <span key={idx}>{sc.trim()}</span>)
                                )}
                              </div>
                              <div className="p-8 bg-slate-50/50">
                                {isEditing ? (
                                 <input 
                                   value={otReportData.settings.titles.komentarKognisi}
                                   onChange={(e) => updateOTField('settings.titles.komentarKognisi', e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                 />
                               ) : (
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{otReportData.settings.titles.komentarKognisi}</p>
                               )}
                                {isEditing ? (
                                  <textarea 
                                    value={otReportData.kognisi.komentar}
                                    onChange={(e) => updateOTField('kognisi.komentar', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                  />
                                ) : (
                                  <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{otReportData.kognisi.komentar}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section D: Emosi */}
                          <div className="space-y-6">
                            <div className="bg-orange-600 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={otReportData.settings.titles.emosi}
                                      onChange={(e) => updateOTField('settings.titles.emosi', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : otReportData.settings.titles.emosi}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('emosi', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                              <TableHeader title={otReportData.settings.titles.tableHeaderEmosi || "Respons"} scale={['T', 'K', 'S', 'H']} scaleKey="scaleEmosi" isEditing={isEditing} therapyType="OT" onTitleChange={(v: string) => updateOTField('settings.titles.tableHeaderEmosi', v)} />
                              {otReportData.emosi.items.map((it: any, i: number) => (
                                <OTReportRow 
                                  key={i} 
                                  label={`${it.cat}: ${it.label}`} 
                                  awal={it.awal} 
                                  hasil={it.hasil} 
                                  isEditing={isEditing}
                                  scale={otReportData.settings.titles.scaleEmosi ? (typeof otReportData.settings.titles.scaleEmosi === 'string' ? otReportData.settings.titles.scaleEmosi.split('/').map((sc: string) => sc.trim()) : otReportData.settings.titles.scaleEmosi) : ['T', 'K', 'S', 'H']} 
                                  onUpdate={(f: any, v: any) => {
                                    const newData = JSON.parse(JSON.stringify(otReportData));
                                    if (f === 'label') {
                                      const parts = v.split(':');
                                      if (parts.length > 1) {
                                        newData.emosi.items[i].cat = parts[0].trim();
                                        newData.emosi.items[i].label = parts.slice(1).join(':').trim();
                                      } else {
                                        newData.emosi.items[i].label = v;
                                      }
                                    } else {
                                      newData.emosi.items[i][f] = v;
                                    }
                                    setOtReportData(newData);
                                  }}
                                  onDelete={() => deleteItem('emosi', null, i)}
                                />
                              ))}
                              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                {isEditing ? (
                                  <input 
                                    value={otReportData.settings.titles.scaleExplanationsEmosi || 'T: Tidak Pernah Muncul | K: Kadang-kadang Muncul | S: Sering Muncul | H: Kehilangan Kemampuan'}
                                    onChange={e => updateOTField('settings.titles.scaleExplanationsEmosi', e.target.value)}
                                    className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                  />
                                ) : (
                                  (otReportData.settings.titles.scaleExplanationsEmosi || 'T: Tidak Pernah Muncul | K: Kadang-kadang Muncul | S: Sering Muncul | H: Kehilangan Kemampuan').split('|').map((sc: string, idx: number) => <span key={idx}>{sc.trim()}</span>)
                                )}
                              </div>
                              <div className="p-8 bg-slate-50/50">
                                {isEditing ? (
                                 <input 
                                   value={otReportData.settings.titles.komentarEmosi}
                                   onChange={(e) => updateOTField('settings.titles.komentarEmosi', e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                 />
                               ) : (
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{otReportData.settings.titles.komentarEmosi}</p>
                               )}
                                {isEditing ? (
                                  <textarea 
                                    value={otReportData.emosi.komentar}
                                    onChange={(e) => updateOTField('emosi.komentar', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                  />
                                ) : (
                                  <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{otReportData.emosi.komentar}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section E: Follow Up */}
                          <div className="space-y-6">
                            <div className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={otReportData.settings.titles.followUp}
                                      onChange={(e) => updateOTField('settings.titles.followUp', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : otReportData.settings.titles.followUp}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                               <ul className="space-y-3">
                                 {otReportData.followUp && otReportData.followUp.map((it: string, i: number) => (
                                   <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-900 shrink-0" />
                                     {isEditing ? (
                                      <div className="flex-1 flex gap-2 items-center">
                                        <input 
                                          value={it} 
                                          onChange={(e) => {
                                            const newData = JSON.parse(JSON.stringify(otReportData));
                                            newData.followUp[i] = e.target.value;
                                            setOtReportData(newData);
                                            syncToMaster('OT', newData);
                                          }}
                                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                        <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                     ) : <span>{it}</span>}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                          </div>

                          {/* Section F: Home Program */}
                          <div className="space-y-6">
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={otReportData.settings.titles.homeProgram}
                                      onChange={(e) => updateOTField('settings.titles.homeProgram', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : otReportData.settings.titles.homeProgram}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="space-y-4">
                               {otReportData.homeProgram && otReportData.homeProgram.map((it: any, i: number) => (
                                 <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
                                    {isEditing && (
                                      <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                    <div className="flex gap-4">
                                       <span className="font-black text-slate-800">{i + 1}.</span>
                                       <div className="flex-1 space-y-3">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                              {isEditing ? (
                                                <input value={it.aktivitas} onChange={e => {
                                                  const newData = JSON.parse(JSON.stringify(otReportData));
                                                  newData.homeProgram[i].aktivitas = e.target.value;
                                                  setOtReportData(newData);
                                                  syncToMaster('OT', newData);
                                                }} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frekuensi</p>
                                              {isEditing ? (
                                                <input value={it.frekuensi} onChange={e => {
                                                  const newData = JSON.parse(JSON.stringify(otReportData));
                                                  newData.homeProgram[i].frekuensi = e.target.value;
                                                  setOtReportData(newData);
                                                  syncToMaster('OT', newData);
                                                }} className="w-full text-xs font-medium text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-600">{it.frekuensi}</p>}
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Durasi</p>
                                              {isEditing ? (
                                                <input value={it.durasi} onChange={e => {
                                                  const newData = JSON.parse(JSON.stringify(otReportData));
                                                  newData.homeProgram[i].durasi = e.target.value;
                                                  setOtReportData(newData);
                                                  syncToMaster('OT', newData);
                                                }} className="w-full text-xs font-medium text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-600">{it.durasi}</p>}
                                            </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        </>
                      ) : activeTherapyTab === 'TW' ? (
                        <>
                          {/* TW: Kemampuan Bahasa Reseptif */}
                          <div className="space-y-8">
                            <div className="bg-[#3D3A30] text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1">
                                  {isEditing ? (
                                    <input 
                                      value={twReportData.settings.titles.reseptif}
                                      onChange={(e) => updateTWField('settings', 'titles.reseptif', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : twReportData.settings.titles.reseptif}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('reseptif', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            {twReportData.reseptif.items.map((it: any, i: number) => (
                              <TWSectionItem key={i} it={it} isEditing={isEditing} onUpdate={(f: any, v: any) => updateTWField('reseptif', f, v, i)} onDelete={() => deleteItem('reseptif', null, i)} />
                            ))}
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                               {isEditing ? (
                                 <input 
                                   value={twReportData.settings.titles.komentarReseptif}
                                   onChange={(e) => updateTWField('settings', 'titles.komentarReseptif', e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                 />
                               ) : (
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{twReportData.settings.titles.komentarReseptif}</p>
                               )}
                               {isEditing ? (
                                <textarea 
                                  value={twReportData.reseptif.komentar}
                                  onChange={(e) => updateTWField('reseptif', 'komentar', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                />
                               ) : (
                                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{twReportData.reseptif.komentar}</p>
                               )}
                            </div>
                          </div>

                          {/* TW: Kemampuan Bahasa Ekspresif */}
                          <div className="space-y-8">
                            <div className="bg-[#3D3A30] text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1">
                                  {isEditing ? (
                                    <input 
                                      value={twReportData.settings.titles.ekspresif}
                                      onChange={(e) => updateTWField('settings', 'titles.ekspresif', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : twReportData.settings.titles.ekspresif}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('ekspresif', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            {twReportData.ekspresif.items.map((it: any, i: number) => (
                              <TWSectionItem key={i} it={it} isEditing={isEditing} onUpdate={(f: any, v: any) => updateTWField('ekspresif', f, v, i)} onDelete={() => deleteItem('ekspresif', null, i)} />
                            ))}
                            
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center">
                                   {isEditing ? (
                                     <input 
                                       value={twReportData.settings.titles.contohMenceritakan}
                                       onChange={(e) => updateTWField('settings', 'titles.contohMenceritakan', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded px-1"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{twReportData.settings.titles.contohMenceritakan}</p>
                                   )}
                                   {isEditing && (
                                      <button onClick={() => addItem('ekspresif', 'contohMenceritakan')} className="text-slate-400 hover:text-slate-600 p-1 transition-colors print:hidden">
                                        <Plus className="h-4 w-4" />
                                      </button>
                                   )}
                                 </div>
                                 <ul className="list-decimal list-inside space-y-2">
                                   {twReportData.ekspresif.contohMenceritakan.map((it: string, i: number) => (
                                     <li key={i} className="text-sm text-slate-700 font-serif italic relative group pr-8">
                                       {isEditing ? (
                                         <div className="inline-flex w-full items-center gap-2">
                                            <input 
                                              value={it} 
                                              onChange={(e) => updateTWField('ekspresif', 'contohMenceritakan', e.target.value, i)}
                                              className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-full"
                                            />
                                            <button onClick={() => deleteItem('ekspresif', 'contohMenceritakan', i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <X className="h-3 w-3" />
                                            </button>
                                         </div>
                                       ) : it}
                                     </li>
                                   ))}
                                 </ul>
                               </div>

                               <div className="space-y-4">
                                 <div className="flex justify-between items-center">
                                   {isEditing ? (
                                     <input 
                                       value={twReportData.settings.titles.contohMengungkapkan}
                                       onChange={(e) => updateTWField('settings', 'titles.contohMengungkapkan', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded px-1"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{twReportData.settings.titles.contohMengungkapkan}</p>
                                   )}
                                   {isEditing && (
                                      <button onClick={() => addItem('ekspresif', 'contohMengungkapkan')} className="text-slate-400 hover:text-slate-600 p-1 transition-colors print:hidden">
                                        <Plus className="h-4 w-4" />
                                      </button>
                                   )}
                                 </div>
                                 <div className="space-y-4">
                                   {twReportData.ekspresif.contohMengungkapkan.map((it: any, i: number) => (
                                     <div key={i} className="text-sm relative group pr-8">
                                       {it.t ? (
                                         isEditing ? (
                                           <div className="flex gap-2">
                                              <textarea 
                                                value={it.t} 
                                                onChange={(e) => updateTWField('ekspresif', 't', e.target.value, i)}
                                                className="w-full text-slate-500 font-bold mb-2 bg-slate-50 p-2 border border-slate-100 rounded"
                                              />
                                              <button onClick={() => deleteItem('ekspresif', 'contohMengungkapkan', i)} className="text-red-500 h-fit mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                              </button>
                                           </div>
                                         ) : <p className="text-slate-500 font-bold mb-2">● {it.t}</p>
                                       ) : (
                                         <div className="pl-4 border-l-2 border-slate-100 ml-2 relative">
                                           {isEditing ? (
                                             <div className="space-y-2">
                                                <input value={it.q} onChange={e => updateTWField('ekspresif', 'q', e.target.value, i)} className="w-full text-slate-600 font-medium bg-slate-50 px-2 py-1 border border-slate-100" />
                                                <input value={it.a} onChange={e => updateTWField('ekspresif', 'a', e.target.value, i)} className="w-full text-slate-800 font-black bg-slate-50 px-2 py-1 border border-slate-100" />
                                                <button onClick={() => deleteItem('ekspresif', 'contohMengungkapkan', i)} className="absolute -right-10 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <X className="h-3 w-3" />
                                                </button>
                                             </div>
                                           ) : (
                                             <>
                                               <p className="text-slate-600 font-medium">Terapis: {it.q}</p>
                                               <p className="text-slate-800 font-black">Adilla: {it.a}</p>
                                             </>
                                           )}
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>

                               {isEditing ? (
                                 <input 
                                   value={twReportData.settings.titles.komentarEkspresif}
                                   onChange={(e) => updateTWField('settings', 'titles.komentarEkspresif', e.target.value)}
                                   className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded px-1 mb-2"
                                 />
                               ) : (
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3">{twReportData.settings.titles.komentarEkspresif}</p>
                               )}
                               {isEditing ? (
                                <textarea 
                                  value={twReportData.ekspresif.komentar}
                                  onChange={(e) => updateTWField('ekspresif', 'komentar', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-serif italic text-slate-700 min-h-[100px]"
                                />
                               ) : (
                                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{twReportData.ekspresif.komentar}</p>
                               )}
                            </div>
                          </div>

                          {/* TW: Follow Up */}
                          <div className="space-y-6">
                            <div className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={twReportData.settings.titles.followUp}
                                      onChange={(e) => updateTWField('settings', 'titles.followUp', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : twReportData.settings.titles.followUp}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                               <ul className="space-y-3">
                                 {twReportData.followUp.map((it: string, i: number) => (
                                   <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3D3A30] shrink-0" />
                                     {isEditing ? (
                                      <div className="flex-1 flex gap-2 items-center">
                                        <input 
                                          value={it} 
                                          onChange={(e) => updateTWField('followUp', '', e.target.value, i)}
                                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                        <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                     ) : <span>{it}</span>}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                          </div>

                          {/* TW: Home Program */}
                          <div className="space-y-6">
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={twReportData.settings.titles.homeProgram}
                                      onChange={(e) => updateTWField('settings', 'titles.homeProgram', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : twReportData.settings.titles.homeProgram}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="space-y-4">
                               {twReportData.homeProgram.map((it: any, i: number) => (
                                 <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
                                    {isEditing && (
                                      <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                    <div className="flex gap-4">
                                       <span className="font-black text-slate-800">{i + 1}.</span>
                                       <div className="flex-1 space-y-3">
                                          <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                            {isEditing ? (
                                              <textarea value={it.aktivitas} onChange={e => updateTWField('homeProgram', 'aktivitas', e.target.value, i)} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" />
                                            ) : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                          </div>
                                          
                                          {it.contoh !== undefined && (
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contoh</p>
                                              {isEditing ? (
                                                <input value={it.contoh} onChange={e => updateTWField('homeProgram', 'contoh', e.target.value, i)} className="w-full text-xs font-medium text-slate-500 italic bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-500 italic">{it.contoh}</p>}
                                            </div>
                                          )}

                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frekuensi</p>
                                              {isEditing ? (
                                                <input value={it.frekuensi} onChange={e => updateTWField('homeProgram', 'frekuensi', e.target.value, i)} className="w-full text-xs font-medium text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-600">{it.frekuensi}</p>}
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tujuan</p>
                                              {isEditing ? (
                                                <input value={it.tujuan} onChange={e => updateTWField('homeProgram', 'tujuan', e.target.value, i)} className="w-full text-xs font-medium text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-600">{it.tujuan}</p>}
                                            </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        </>
                      ) : activeTherapyTab === 'REMEDIAL' ? (
                        <>
                          {[
                            { key: 'academic', title: remReportData.settings.titles.academic },
                            { key: 'literacy', title: remReportData.settings.titles.literacy },
                            { key: 'writing', title: remReportData.settings.titles.writing },
                            { key: 'focus', title: remReportData.settings.titles.focus }
                          ].map((sec) => (
                            <div key={sec.key} className="space-y-6">
                               <div className="bg-pink-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                  <div className="flex-1 text-center">
                                    {isEditing ? (
                                      <input 
                                        value={remReportData.settings.titles[sec.key]}
                                        onChange={(e) => updateRemField('settings', `titles.${sec.key}`, e.target.value)}
                                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                      />
                                    ) : sec.title}
                                  </div>
                                  {isEditing && (
                                    <button onClick={() => addItem(sec.key, null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  )}
                               </div>
                               <div className="space-y-4">
                                  {remReportData[sec.key].items.map((it: any, i: number) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm group">
                                      <div className="bg-slate-900 text-white px-8 py-3 font-black text-xs uppercase tracking-widest flex justify-between items-center">
                                        <div className="flex-1 mr-4">
                                          {isEditing ? (
                                            <input 
                                              value={it.label} 
                                              onChange={(e) => updateRemField(sec.key, 'label', e.target.value, i)}
                                              className="w-full bg-slate-800 text-white border-none outline-none focus:ring-0 p-0 text-xs font-black uppercase tracking-widest"
                                            />
                                          ) : <span>{it.label}</span>}
                                        </div>
                                        {isEditing && (
                                          <button onClick={() => deleteItem(sec.key, null, i)} className="text-red-400 hover:text-red-300 transition-colors shrink-0 print:hidden">
                                            <X className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                      <div className="p-8 space-y-6">
                                        {[
                                          { label: remReportData.settings.titles.labelAwal || 'Kondisi Awal', labelKey: 'titles.labelAwal', value: it.awal, field: 'awal' },
                                          { label: remReportData.settings.titles.labelTujuan || 'Tujuan Capaian', labelKey: 'titles.labelTujuan', value: it.tujuan, field: 'tujuan' },
                                          { label: remReportData.settings.titles.labelHasil || 'Hasil Evaluasi', labelKey: 'titles.labelHasil', value: it.hasil, field: 'hasil' },
                                        ].map((field, idx) => (
                                          <div key={idx} className="flex gap-4">
                                            <span className="mt-1 font-bold text-slate-400">●</span>
                                            <div className="flex-1">
                                              {isEditing ? (
                                                <input 
                                                  value={field.label} 
                                                  onChange={(e) => updateRemField('settings', field.labelKey, e.target.value)}
                                                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 bg-transparent border-none outline-none focus:ring-0"
                                                />
                                              ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{field.label} :</span>}
                                              {isEditing ? (
                                                <textarea 
                                                  value={field.value} 
                                                  onChange={(e) => updateRemField(sec.key, field.field, e.target.value, i)}
                                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none focus:ring-2 focus:ring-pink-500/10 min-h-[60px]"
                                                />
                                              ) : (
                                                <p className="text-sm text-slate-700 leading-relaxed font-serif italic whitespace-pre-wrap">{field.value}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          ))}

                          {/* REMEDIAL: Follow Up */}
                          <div className="space-y-6">
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={remReportData.settings.titles.followUp || 'FOLLOW UP'}
                                      onChange={(e) => updateRemField('settings', 'titles.followUp', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : remReportData.settings.titles.followUp}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                               <ul className="space-y-3">
                                 {remReportData.followUp.map((it: string, i: number) => (
                                   <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                                     {isEditing ? (
                                      <div className="flex-1 flex gap-2 items-center">
                                        <input 
                                          value={it} 
                                          onChange={(e) => updateRemField('followUp', '', e.target.value, i)}
                                          className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                        <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                     ) : <span>{it}</span>}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                          </div>

                          {/* REMEDIAL: Home Program */}
                          <div className="space-y-6">
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={remReportData.settings.titles.homeProgram || 'HOME PROGRAM'}
                                      onChange={(e) => updateRemField('settings', 'titles.homeProgram', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : remReportData.settings.titles.homeProgram}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                            </div>
                            <div className="space-y-4">
                               {remReportData.homeProgram && remReportData.homeProgram.map((it: any, i: number) => (
                                 <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
                                    {isEditing && (
                                      <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                    <div className="flex gap-4">
                                       <span className="font-black text-slate-800">{i + 1}.</span>
                                       <div className="flex-1 space-y-3">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                              {isEditing ? (
                                                <input value={it.aktivitas} onChange={e => updateRemField('homeProgram', 'aktivitas', e.target.value, i)} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tujuan</p>
                                              {isEditing ? (
                                                <input value={it.tujuan} onChange={e => updateRemField('homeProgram', 'tujuan', e.target.value, i)} className="w-full text-xs font-medium text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" />
                                              ) : <p className="text-xs font-medium text-slate-600">{it.tujuan}</p>}
                                            </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        </>
                      ) : activeTherapyTab === 'FT' ? (
                        <>
                          {/* Physio: Perilaku Umum */}
                          <div className="space-y-6">
                             <div className="bg-amber-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={physioReportData.settings.titles.perilakuUmum}
                                      onChange={(e) => updatePhysioField('settings', 'titles.perilakuUmum', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : physioReportData.settings.titles.perilakuUmum}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('perilakuUmum', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                             </div>
                             <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <TableHeader 
                                   title={physioReportData.settings.titles.tableHeaderIndikator || "INDIKATOR RESPON"} 
                                   scale={['TERAMATI', 'TIDAK']} 
                                   scaleKey="scalePerilaku"
                                   isEditing={isEditing}
                                   onTitleChange={(v: string) => updatePhysioField('settings', 'titles.tableHeaderIndikator', v)}
                                 />
                                {physioReportData.perilakuUmum.items.map((it: any, i: number) => {
                                  const activeScale = physioReportData.settings.titles.scalePerilaku ? (typeof physioReportData.settings.titles.scalePerilaku === 'string' ? physioReportData.settings.titles.scalePerilaku.split('/').map((s: string) => s.trim()) : physioReportData.settings.titles.scalePerilaku) : ['teramati', 'tidak'];
                                  return (
                                    <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                      onUpdate={(f: any, v: any) => updatePhysioField('perilakuUmum', f, v, i)} onDelete={() => deleteItem('perilakuUmum', null, i)} />
                                  );
                                })}
                                <div className="p-8 bg-slate-50">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.titles.labelCatatanPerilaku || 'Catatan Perilaku :'}
                                       onChange={e => updatePhysioField('settings', 'titles.labelCatatanPerilaku', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{physioReportData.settings.titles.labelCatatanPerilaku || 'Catatan Perilaku :'}</p>
                                   )}
                                   {isEditing ? (
                                    <textarea value={physioReportData.perilakuUmum.komentar} onChange={e => updatePhysioField('perilakuUmum', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                   ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{physioReportData.perilakuUmum.komentar}</p>}
                                </div>
                             </div>
                          </div>

                          {/* Physio: Sensory Processing */}
                          <div className="space-y-6">
                             <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={physioReportData.settings.titles.sensory}
                                      onChange={(e) => updatePhysioField('settings', 'titles.sensory', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : physioReportData.settings.titles.sensory}
                                </div>
                                {isEditing && (
                                  <button onClick={() => addItem('sensory', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                             </div>
                             <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <TableHeader 
                                   title={physioReportData.settings.titles.tableHeaderSensori || "SENSORI MODULASI"} 
                                   scale={['B', 'S', 'K', 'BR']} 
                                   scaleKey="scaleSensoryMod"
                                   isEditing={isEditing}
                                   onTitleChange={(v: string) => updatePhysioField('settings', 'titles.tableHeaderSensori', v)}
                                 />
                                {physioReportData.sensory.items.map((it: any, i: number) => {
                                  const activeScale = physioReportData.settings.titles.scaleSensoryMod ? (typeof physioReportData.settings.titles.scaleSensoryMod === 'string' ? physioReportData.settings.titles.scaleSensoryMod.split('/').map((s: string) => s.trim()) : physioReportData.settings.titles.scaleSensoryMod) : ['B', 'S', 'K', 'BR'];
                                  return (
                                    <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                      onUpdate={(f: any, v: any) => updatePhysioField('sensory', f, v, i)} onDelete={() => deleteItem('sensory', null, i)} />
                                  );
                                })}
                                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.scaleExplanations || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah'}
                                       onChange={e => updatePhysioField('settings', 'scaleExplanations', e.target.value)}
                                       className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                     />
                                   ) : (
                                     (physioReportData.settings.scaleExplanations || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                   )}
                                </div>
                                <div className="p-8 bg-slate-50">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.titles.labelKomentarSensori || 'Komentar Sensori :'}
                                       onChange={e => updatePhysioField('settings', 'titles.labelKomentarSensori', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{physioReportData.settings.titles.labelKomentarSensori || 'Komentar Sensori :'}</p>
                                   )}
                                   {isEditing ? (
                                    <textarea value={physioReportData.sensory.komentar} onChange={e => updatePhysioField('sensory', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                   ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{physioReportData.sensory.komentar}</p>}
                                </div>
                             </div>
                          </div>

                          {/* Physio: Motorik */}
                          <div className="space-y-6">
                             <div className="bg-amber-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={physioReportData.settings.titles.motorik}
                                      onChange={(e) => updatePhysioField('settings', 'titles.motorik', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : physioReportData.settings.titles.motorik}
                                </div>
                             </div>
                             <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="bg-slate-900 text-white px-8 py-2 font-black text-[10px] uppercase tracking-widest flex justify-between items-center">
                                                                       {isEditing ? (
                                      <input 
                                        value={physioReportData.settings.titles.motorikKasar || '1. Motorik Kasar'}
                                        onChange={(e) => updatePhysioField('settings', 'titles.motorikKasar', e.target.value)}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full"
                                      />
                                    ) : (
                                      <span>{physioReportData.settings.titles.motorikKasar || '1. Motorik Kasar'}</span>
                                    )}
                                   {isEditing && (
                                      <button onClick={() => addItem('motorik', 'kasar')} className="hover:bg-white/20 p-1 rounded-md transition-colors"><Plus className="h-3 w-3" /></button>
                                   )}
                                </div>
                                <TableHeader 
                                   title={physioReportData.settings.titles.tableHeaderAktivitas || "AKTIVITAS"} 
                                   scale={['MD', 'SD', 'TD']} 
                                   scaleKey="scaleMotorik"
                                   isEditing={isEditing}
                                   onTitleChange={(v: string) => updatePhysioField('settings', 'titles.tableHeaderAktivitas', v)}
                                 />
                                {physioReportData.motorik.kasar.map((it: any, i: number) => {
                                  const activeScale = physioReportData.settings.titles.scaleMotorik ? (typeof physioReportData.settings.titles.scaleMotorik === 'string' ? physioReportData.settings.titles.scaleMotorik.split('/').map((s: string) => s.trim()) : physioReportData.settings.titles.scaleMotorik) : ['MD', 'SD', 'TD'];
                                  return (
                                    <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                      onUpdate={(f: any, v: any) => updatePhysioField('motorik', f, v, i, 'kasar')} onDelete={() => deleteItem('motorik', 'kasar', i)} />
                                  );
                                })}
                                
                                <div className="bg-slate-900 text-white px-8 py-2 font-black text-[10px] uppercase tracking-widest mt-4 flex justify-between items-center">
                                   {isEditing ? (
                                      <input 
                                        value={physioReportData.settings.titles.motorikHalus || '2. Motorik Halus'}
                                        onChange={(e) => updatePhysioField('settings', 'titles.motorikHalus', e.target.value)}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full"
                                      />
                                    ) : (
                                      <span>{physioReportData.settings.titles.motorikHalus || '2. Motorik Halus'}</span>
                                    )}
                                   {isEditing && (
                                      <button onClick={() => addItem('motorik', 'halus')} className="hover:bg-white/20 p-1 rounded-md transition-colors"><Plus className="h-3 w-3" /></button>
                                   )}
                                </div>
                                <TableHeader 
                                   title={physioReportData.settings.titles.tableHeaderAktivitas || "AKTIVITAS"} 
                                   scale={['MD', 'SD', 'TD']} 
                                   scaleKey="scaleMotorik"
                                   isEditing={isEditing}
                                   onTitleChange={(v: string) => updatePhysioField('settings', 'titles.tableHeaderAktivitas', v)}
                                 />
                                {physioReportData.motorik.halus.map((it: any, i: number) => {
                                  const activeScale = physioReportData.settings.titles.scaleMotorik ? (typeof physioReportData.settings.titles.scaleMotorik === 'string' ? physioReportData.settings.titles.scaleMotorik.split('/').map((s: string) => s.trim()) : physioReportData.settings.titles.scaleMotorik) : ['MD', 'SD', 'TD'];
                                  return (
                                    <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                      onUpdate={(f: any, v: any) => updatePhysioField('motorik', f, v, i, 'halus')} onDelete={() => deleteItem('motorik', 'halus', i)} />
                                  );
                                })}

                                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.scaleExplanationsMotorik || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
                                       onChange={e => updatePhysioField('settings', 'scaleExplanationsMotorik', e.target.value)}
                                       className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                     />
                                   ) : (
                                     (physioReportData.settings.scaleExplanationsMotorik || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                   )}
                                </div>
                                <div className="p-8 bg-slate-50">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.titles.labelKomentarMotorik || 'Komentar Motorik :'}
                                       onChange={e => updatePhysioField('settings', 'titles.labelKomentarMotorik', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{physioReportData.settings.titles.labelKomentarMotorik || 'Komentar Motorik :'}</p>
                                   )}
                                   {isEditing ? (
                                    <textarea value={physioReportData.motorik.komentar} onChange={e => updatePhysioField('motorik', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                   ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{physioReportData.motorik.komentar}</p>}
                                </div>
                             </div>
                          </div>

                          {/* Physio: Fisik & Fungsional */}
                          <div className="space-y-6">
                             <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={physioReportData.settings.titles.fisik || 'D. Kemampuan Fisik & Fungsional'}
                                      onChange={(e) => updatePhysioField('settings', 'titles.fisik', e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                    />
                                  ) : physioReportData.settings.titles.fisik}
                                </div>
                             </div>
                             <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="bg-amber-900 text-white px-8 py-2 font-black text-[10px] uppercase tracking-widest flex justify-between items-center">
                                   {isEditing ? (
                                      <input 
                                        value={physioReportData.settings.titles.fisikGmfm || 'GMFM (Gross Motor Function Measure)'}
                                        onChange={(e) => updatePhysioField('settings', 'titles.fisikGmfm', e.target.value)}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full"
                                      />
                                    ) : (
                                      <span>{physioReportData.settings.titles.fisikGmfm || 'GMFM (Gross Motor Function Measure)'}</span>
                                    )}
                                   {isEditing && (
                                      <button onClick={() => addItem('fisik', 'gmfm')} className="hover:bg-white/20 p-1 rounded-md transition-colors"><Plus className="h-3 w-3" /></button>
                                   )}
                                </div>
                                <TableHeader 
                                   title={physioReportData.settings.titles.tableHeaderAktivitas || "AKTIVITAS"} 
                                   scale={['0', '1', '2', '3']} 
                                   isEditing={isEditing}
                                   onTitleChange={(v: string) => updatePhysioField('settings', 'titles.tableHeaderAktivitas', v)}
                                 />
                                {physioReportData.fisik.gmfm.map((it: any, i: number) => (
                                  <OTReportRow key={i} label={it.label} awal={it.awal?.toString()} hasil={it.hasil?.toString()} scale={['0', '1', '2', '3']} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updatePhysioField('fisik', f, f === 'label' ? v : parseInt(v), i, 'gmfm')} onDelete={() => deleteItem('fisik', 'gmfm', i)} />
                                ))}
                                
                                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.scaleExplanationsFisik || '0: Tidak Memulai | 1: Memulai | 2: Sebagian | 3: Sempurna'}
                                       onChange={e => updatePhysioField('settings', 'scaleExplanationsFisik', e.target.value)}
                                       className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                     />
                                   ) : (
                                     (physioReportData.settings.scaleExplanationsFisik || '0: Tidak Memulai | 1: Memulai | 2: Sebagian | 3: Sempurna').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                   )}
                                </div>
                                <div className="p-8 bg-slate-50">
                                   {isEditing ? (
                                     <input 
                                       value={physioReportData.settings.titles.labelKomentar || 'Komentar :'}
                                       onChange={e => updatePhysioField('settings', 'titles.labelKomentar', e.target.value)}
                                       className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                     />
                                   ) : (
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{physioReportData.settings.titles.labelKomentar || 'Komentar :'}</p>
                                   )}
                                   {isEditing ? (
                                    <textarea value={physioReportData.fisik.komentar} onChange={e => updatePhysioField('fisik', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                   ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{physioReportData.fisik.komentar}</p>}
                                </div>
                             </div>
                          </div>

                          {/* Physio: Follow Up & Home Program */}
                          <div className="space-y-8">
                             <div className="space-y-6">
                                <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                   <div className="flex-1 text-center">
                                     {isEditing ? (
                                      <input 
                                        value={physioReportData.settings.titles.followUp || 'FOLLOW UP'}
                                        onChange={(e) => updatePhysioField('settings', 'titles.followUp', e.target.value)}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                      />
                                    ) : (
                                      <span>{physioReportData.settings.titles.followUp || 'FOLLOW UP'}</span>
                                    )}
                                   </div>
                                    {isEditing && <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                                </div>
                                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                   <ul className="space-y-3">
                                     {physioReportData.followUp.map((it: string, i: number) => (
                                       <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                         <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                                         {isEditing ? (
                                          <div className="flex-1 flex gap-2 items-center">
                                            <input value={it} onChange={(e) => updatePhysioField('followUp', '', e.target.value, i)} className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1" />
                                            <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                                          </div>
                                         ) : <span>{it}</span>}
                                       </li>
                                     ))}
                                   </ul>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                   <div className="flex-1 text-center">
                                     {isEditing ? (
                                      <input 
                                        value={physioReportData.settings.titles.homeProgram || 'HOME PROGRAM'}
                                        onChange={(e) => updatePhysioField('settings', 'titles.homeProgram', e.target.value)}
                                        className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                      />
                                    ) : (
                                      <span>{physioReportData.settings.titles.homeProgram || 'HOME PROGRAM'}</span>
                                    )}
                                   </div>
                                    {isEditing && <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                                </div>
                                <div className="space-y-4">
                                   {physioReportData.homeProgram.map((it: any, i: number) => (
                                     <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative group">
                                        {isEditing && <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><X className="h-3 w-3" /></button>}
                                        <div className="flex gap-4">
                                           <span className="font-black text-slate-800">{i + 1}.</span>
                                           <div className="flex-1 space-y-3">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                                  {isEditing ? <input value={it.aktivitas} onChange={e => updatePhysioField('homeProgram', 'aktivitas', e.target.value, i)} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                                </div>
                                                <div className="space-y-1">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi / Frekuensi</p>
                                                  {isEditing ? <input value={it.durasi} onChange={e => updatePhysioField('homeProgram', 'durasi', e.target.value, i)} className="w-full text-xs font-bold text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-xs font-bold text-slate-600">{it.durasi}</p>}
                                                </div>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                        </>
                      ) : activeTherapyTab === 'HT' ? (
                        <>
                          {/* HT: Adaptasi Air & Sensori Akuatik */}
                          <div className="space-y-6">
                            <div className="bg-cyan-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.adaptasiAir || 'A. Adaptasi Air & Sensori Akuatik'}
                                    onChange={(e) => updateHtField('settings', 'titles.adaptasiAir', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (htReportData.settings.titles.adaptasiAir || 'A. Adaptasi Air & Sensori Akuatik')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('adaptasiAir', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={htReportData.settings.titles.tableHeaderAdaptasi || "INDIKATOR RESPON"} 
                                scale={['B', 'S', 'K', 'BR']} 
                                scaleKey="scaleAdaptasi"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateHtField('settings', 'titles.tableHeaderAdaptasi', v)}
                              />
                              {htReportData.adaptasiAir.items.map((it: any, i: number) => {
                                const activeScale = htReportData.settings.titles.scaleAdaptasi ? (typeof htReportData.settings.titles.scaleAdaptasi === 'string' ? htReportData.settings.titles.scaleAdaptasi.split('/').map((s: string) => s.trim()) : htReportData.settings.titles.scaleAdaptasi) : ['B', 'S', 'K', 'BR'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateHtField('adaptasiAir', f, v, i)} onDelete={() => deleteItem('adaptasiAir', null, i)} />
                                );
                              })}
                              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.scaleExplanationsAdaptasi || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah'}
                                    onChange={e => updateHtField('settings', 'titles.scaleExplanationsAdaptasi', e.target.value)}
                                    className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                  />
                                ) : (
                                  (htReportData.settings.titles.scaleExplanationsAdaptasi || 'B: Berlebihan | S: Sesuai | K: Kurang | BR: Berubah-ubah').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                )}
                              </div>
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.labelCatatanAdaptasi || 'Catatan Adaptasi Air :'}
                                    onChange={e => updateHtField('settings', 'titles.labelCatatanAdaptasi', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{htReportData.settings.titles.labelCatatanAdaptasi || 'Catatan Adaptasi Air :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={htReportData.adaptasiAir.komentar} onChange={e => updateHtField('adaptasiAir', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{htReportData.adaptasiAir.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* HT: Keterampilan & Kontrol Fisik di Air */}
                          <div className="space-y-6">
                            <div className="bg-sky-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.keterampilanAir || 'B. Keterampilan & Kontrol Fisik di Air'}
                                    onChange={(e) => updateHtField('settings', 'titles.keterampilanAir', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (htReportData.settings.titles.keterampilanAir || 'B. Keterampilan & Kontrol Fisik di Air')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('keterampilanAir', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={htReportData.settings.titles.tableHeaderKeterampilan || "AKTIVITAS"} 
                                scale={['MD', 'SD', 'TD']} 
                                scaleKey="scaleKeterampilan"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateHtField('settings', 'titles.tableHeaderKeterampilan', v)}
                              />
                              {htReportData.keterampilanAir.items.map((it: any, i: number) => {
                                const activeScale = htReportData.settings.titles.scaleKeterampilan ? (typeof htReportData.settings.titles.scaleKeterampilan === 'string' ? htReportData.settings.titles.scaleKeterampilan.split('/').map((s: string) => s.trim()) : htReportData.settings.titles.scaleKeterampilan) : ['MD', 'SD', 'TD'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateHtField('keterampilanAir', f, v, i)} onDelete={() => deleteItem('keterampilanAir', null, i)} />
                                );
                              })}
                              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.scaleExplanationsKeterampilan || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
                                    onChange={e => updateHtField('settings', 'titles.scaleExplanationsKeterampilan', e.target.value)}
                                    className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                  />
                                ) : (
                                  (htReportData.settings.titles.scaleExplanationsKeterampilan || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                )}
                              </div>
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.labelCatatanKeterampilan || 'Catatan Keterampilan Fisik :'}
                                    onChange={e => updateHtField('settings', 'titles.labelCatatanKeterampilan', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{htReportData.settings.titles.labelCatatanKeterampilan || 'Catatan Keterampilan Fisik :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={htReportData.keterampilanAir.komentar} onChange={e => updateHtField('keterampilanAir', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{htReportData.keterampilanAir.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* HT: Keseimbangan & Koordinasi Fungsional */}
                          <div className="space-y-6">
                            <div className="bg-sky-950 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.keseimbanganAir || 'C. Keseimbangan & Koordinasi Fungsional'}
                                    onChange={(e) => updateHtField('settings', 'titles.keseimbanganAir', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (htReportData.settings.titles.keseimbanganAir || 'C. Keseimbangan & Koordinasi Fungsional')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('keseimbanganAir', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={htReportData.settings.titles.tableHeaderKeseimbangan || "AKTIVITAS"} 
                                scale={['MD', 'SD', 'TD']} 
                                scaleKey="scaleKeseimbangan"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateHtField('settings', 'titles.tableHeaderKeseimbangan', v)}
                              />
                              {htReportData.keseimbanganAir.items.map((it: any, i: number) => {
                                const activeScale = htReportData.settings.titles.scaleKeseimbangan ? (typeof htReportData.settings.titles.scaleKeseimbangan === 'string' ? htReportData.settings.titles.scaleKeseimbangan.split('/').map((s: string) => s.trim()) : htReportData.settings.titles.scaleKeseimbangan) : ['MD', 'SD', 'TD'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateHtField('keseimbanganAir', f, v, i)} onDelete={() => deleteItem('keseimbanganAir', null, i)} />
                                );
                              })}
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={htReportData.settings.titles.labelCatatanKeseimbangan || 'Catatan Keseimbangan :'}
                                    onChange={e => updateHtField('settings', 'titles.labelCatatanKeseimbangan', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{htReportData.settings.titles.labelCatatanKeseimbangan || 'Catatan Keseimbangan :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={htReportData.keseimbanganAir.komentar} onChange={e => updateHtField('keseimbanganAir', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{htReportData.keseimbanganAir.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* HT: Follow Up & Home Program */}
                          <div className="space-y-8">
                            <div className="space-y-6">
                              <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={htReportData.settings.titles.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}
                                      onChange={(e) => updateHtField('settings', 'titles.followUp', e.target.value)}
                                      className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                    />
                                  ) : (
                                    <span>{htReportData.settings.titles.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}</span>
                                  )}
                                </div>
                                {isEditing && <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                              </div>
                              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <ul className="space-y-3">
                                  {htReportData.followUp.map((it: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                                      {isEditing ? (
                                        <div className="flex-1 flex gap-2 items-center">
                                          <input value={it} onChange={(e) => updateHtField('followUp', '', e.target.value, i)} className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1" />
                                          <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                                        </div>
                                      ) : <span>{it}</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={htReportData.settings.titles.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}
                                      onChange={(e) => updateHtField('settings', 'titles.homeProgram', e.target.value)}
                                      className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                    />
                                  ) : (
                                    <span>{htReportData.settings.titles.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}</span>
                                  )}
                                </div>
                                {isEditing && <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                              </div>
                              <div className="space-y-4">
                                {htReportData.homeProgram.map((it: any, i: number) => (
                                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative group">
                                    {isEditing && <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><X className="h-3 w-3" /></button>}
                                    <div className="flex gap-4">
                                      <span className="font-black text-slate-800">{i + 1}.</span>
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                            {isEditing ? <input value={it.aktivitas} onChange={e => updateHtField('homeProgram', 'aktivitas', e.target.value, i)} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi / Frekuensi</p>
                                            {isEditing ? <input value={it.durasi || it.frekuensi} onChange={e => updateHtField('homeProgram', 'durasi', e.target.value, i)} className="w-full text-xs font-bold text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-xs font-bold text-slate-600">{it.durasi || it.frekuensi}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : activeTherapyTab === 'BERKUDA' ? (
                        <>
                          {/* Berkuda: Adaptasi, Perilaku & Regulasi Emosi */}
                          <div className="space-y-6">
                            <div className="bg-emerald-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.adaptasiPerilaku || 'A. Adaptasi, Perilaku & Regulasi Emosi'}
                                    onChange={(e) => updateBerkudaField('settings', 'titles.adaptasiPerilaku', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (berkudaReportData.settings.titles.adaptasiPerilaku || 'A. Adaptasi, Perilaku & Regulasi Emosi')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('adaptasiPerilaku', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={berkudaReportData.settings.titles.tableHeaderAdaptasi || "INDIKATOR RESPON"} 
                                scale={['teramati', 'tidak']} 
                                scaleKey="scalePerilaku"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateBerkudaField('settings', 'titles.tableHeaderAdaptasi', v)}
                              />
                              {berkudaReportData.adaptasiPerilaku.items.map((it: any, i: number) => {
                                const activeScale = berkudaReportData.settings.titles.scalePerilaku ? (typeof berkudaReportData.settings.titles.scalePerilaku === 'string' ? berkudaReportData.settings.titles.scalePerilaku.split('/').map((s: string) => s.trim()) : berkudaReportData.settings.titles.scalePerilaku) : ['teramati', 'tidak'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateBerkudaField('adaptasiPerilaku', f, v, i)} onDelete={() => deleteItem('adaptasiPerilaku', null, i)} />
                                );
                              })}
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.labelCatatanPerilaku || 'Catatan Perilaku & Adaptasi :'}
                                    onChange={e => updateBerkudaField('settings', 'titles.labelCatatanPerilaku', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{berkudaReportData.settings.titles.labelCatatanPerilaku || 'Catatan Perilaku & Adaptasi :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={berkudaReportData.adaptasiPerilaku.komentar} onChange={e => updateBerkudaField('adaptasiPerilaku', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{berkudaReportData.adaptasiPerilaku.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Berkuda: Postur, Keseimbangan & Kontrol Inti Tubuh */}
                          <div className="space-y-6">
                            <div className="bg-emerald-950 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.posturKeseimbangan || 'B. Postur, Keseimbangan & Kontrol Inti Tubuh'}
                                    onChange={(e) => updateBerkudaField('settings', 'titles.posturKeseimbangan', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (berkudaReportData.settings.titles.posturKeseimbangan || 'B. Postur, Keseimbangan & Kontrol Inti Tubuh')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('posturKeseimbangan', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={berkudaReportData.settings.titles.tableHeaderPostur || "AKTIVITAS"} 
                                scale={['MD', 'SD', 'TD']} 
                                scaleKey="scalePostur"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateBerkudaField('settings', 'titles.tableHeaderPostur', v)}
                              />
                              {berkudaReportData.posturKeseimbangan.items.map((it: any, i: number) => {
                                const activeScale = berkudaReportData.settings.titles.scalePostur ? (typeof berkudaReportData.settings.titles.scalePostur === 'string' ? berkudaReportData.settings.titles.scalePostur.split('/').map((s: string) => s.trim()) : berkudaReportData.settings.titles.scalePostur) : ['MD', 'SD', 'TD'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateBerkudaField('posturKeseimbangan', f, v, i)} onDelete={() => deleteItem('posturKeseimbangan', null, i)} />
                                );
                              })}
                              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-[9px] font-bold text-slate-400 uppercase italic">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.scaleExplanationsPostur || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan'}
                                    onChange={e => updateBerkudaField('settings', 'titles.scaleExplanationsPostur', e.target.value)}
                                    className="bg-white border border-slate-200 outline-none w-full px-2 py-1 rounded"
                                  />
                                ) : (
                                  (berkudaReportData.settings.titles.scaleExplanationsPostur || 'MD: Mudah Dilakukan | SD: Sulit Dilakukan | TD: Tidak Dapat Dilakukan').split('|').map((s: string, idx: number) => <span key={idx}>{s.trim()}</span>)
                                )}
                              </div>
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.labelCatatanPostur || 'Catatan Postur & Keseimbangan :'}
                                    onChange={e => updateBerkudaField('settings', 'titles.labelCatatanPostur', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{berkudaReportData.settings.titles.labelCatatanPostur || 'Catatan Postur & Keseimbangan :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={berkudaReportData.posturKeseimbangan.komentar} onChange={e => updateBerkudaField('posturKeseimbangan', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{berkudaReportData.posturKeseimbangan.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Berkuda: Koordinasi Motorik & Keterampilan Fungsional */}
                          <div className="space-y-6">
                            <div className="bg-teal-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                              <div className="flex-1 text-center">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.koordinasiMotorik || 'C. Koordinasi Motorik & Keterampilan Fungsional'}
                                    onChange={(e) => updateBerkudaField('settings', 'titles.koordinasiMotorik', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-center text-xs font-black uppercase p-0"
                                  />
                                ) : (berkudaReportData.settings.titles.koordinasiMotorik || 'C. Koordinasi Motorik & Keterampilan Fungsional')}
                              </div>
                              {isEditing && (
                                <button onClick={() => addItem('koordinasiMotorik', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden">
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                              <TableHeader 
                                title={berkudaReportData.settings.titles.tableHeaderKoordinasi || "AKTIVITAS"} 
                                scale={['MD', 'SD', 'TD']} 
                                scaleKey="scaleKoordinasi"
                                isEditing={isEditing}
                                onTitleChange={(v: string) => updateBerkudaField('settings', 'titles.tableHeaderKoordinasi', v)}
                              />
                              {berkudaReportData.koordinasiMotorik.items.map((it: any, i: number) => {
                                const activeScale = berkudaReportData.settings.titles.scaleKoordinasi ? (typeof berkudaReportData.settings.titles.scaleKoordinasi === 'string' ? berkudaReportData.settings.titles.scaleKoordinasi.split('/').map((s: string) => s.trim()) : berkudaReportData.settings.titles.scaleKoordinasi) : ['MD', 'SD', 'TD'];
                                return (
                                  <OTReportRow key={i} label={it.label} awal={it.awal} hasil={it.hasil} scale={activeScale} isEditing={isEditing} 
                                    onUpdate={(f: any, v: any) => updateBerkudaField('koordinasiMotorik', f, v, i)} onDelete={() => deleteItem('koordinasiMotorik', null, i)} />
                                );
                              })}
                              <div className="p-8 bg-slate-50">
                                {isEditing ? (
                                  <input 
                                    value={berkudaReportData.settings.titles.labelCatatanKoordinasi || 'Catatan Koordinasi & Keterampilan :'}
                                    onChange={e => updateBerkudaField('settings', 'titles.labelCatatanKoordinasi', e.target.value)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 bg-transparent border-b border-slate-200 outline-none w-full"
                                  />
                                ) : (
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{berkudaReportData.settings.titles.labelCatatanKoordinasi || 'Catatan Koordinasi & Keterampilan :'}</p>
                                )}
                                {isEditing ? (
                                  <textarea value={berkudaReportData.koordinasiMotorik.komentar} onChange={e => updateBerkudaField('koordinasiMotorik', 'komentar', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-serif italic text-slate-700 outline-none" />
                                ) : <p className="text-sm text-slate-700 leading-relaxed font-serif italic">{berkudaReportData.koordinasiMotorik.komentar}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Berkuda: Follow Up & Home Program */}
                          <div className="space-y-8">
                            <div className="space-y-6">
                              <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={berkudaReportData.settings.titles.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}
                                      onChange={(e) => updateBerkudaField('settings', 'titles.followUp', e.target.value)}
                                      className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                    />
                                  ) : (
                                    <span>{berkudaReportData.settings.titles.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}</span>
                                  )}
                                </div>
                                {isEditing && <button onClick={() => addItem('followUp', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                              </div>
                              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <ul className="space-y-3">
                                  {berkudaReportData.followUp.map((it: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700 items-start group">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                      {isEditing ? (
                                        <div className="flex-1 flex gap-2 items-center">
                                          <input value={it} onChange={(e) => updateBerkudaField('followUp', '', e.target.value, i)} className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1" />
                                          <button onClick={() => deleteItem('followUp', null, i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                                        </div>
                                      ) : <span>{it}</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest flex justify-between items-center group">
                                <div className="flex-1 text-center">
                                  {isEditing ? (
                                    <input 
                                      value={berkudaReportData.settings.titles.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}
                                      onChange={(e) => updateBerkudaField('settings', 'titles.homeProgram', e.target.value)}
                                      className="bg-transparent border-none outline-none focus:ring-0 text-xs font-black uppercase tracking-widest w-full text-center p-0"
                                    />
                                  ) : (
                                    <span>{berkudaReportData.settings.titles.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}</span>
                                  )}
                                </div>
                                {isEditing && <button onClick={() => addItem('homeProgram', null)} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors print:hidden"><Plus className="h-4 w-4" /></button>}
                              </div>
                              <div className="space-y-4">
                                {berkudaReportData.homeProgram.map((it: any, i: number) => (
                                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative group">
                                    {isEditing && <button onClick={() => deleteItem('homeProgram', null, i)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><X className="h-3 w-3" /></button>}
                                    <div className="flex gap-4">
                                      <span className="font-black text-slate-800">{i + 1}.</span>
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                            {isEditing ? <input value={it.aktivitas} onChange={e => updateBerkudaField('homeProgram', 'aktivitas', e.target.value, i)} className="w-full text-sm font-bold text-slate-800 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-sm font-bold text-slate-800">{it.aktivitas}</p>}
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi / Frekuensi</p>
                                            {isEditing ? <input value={it.durasi || it.frekuensi} onChange={e => updateBerkudaField('homeProgram', 'durasi', e.target.value, i)} className="w-full text-xs font-bold text-slate-600 bg-slate-50 p-2 border border-slate-100 rounded" /> : <p className="text-xs font-bold text-slate-600">{it.durasi || it.frekuensi}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Custom Therapy Discipline Clinical Evaluation Report */
                        <div className="space-y-12">
                          {/* Domain Header Banner */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2.5 rounded-2xl border", 
                                therapyCategories.find(c => c.id === activeTherapyTab)?.bgColor || 'bg-indigo-50', 
                                therapyCategories.find(c => c.id === activeTherapyTab)?.borderColor || 'border-indigo-200'
                              )}>
                                {React.createElement(therapyCategories.find(c => c.id === activeTherapyTab)?.Icon || Sparkles, {
                                  className: cn("w-5 h-5", therapyCategories.find(c => c.id === activeTherapyTab)?.color || 'text-indigo-600')
                                })}
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Disiplin Layanan Terapi</span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                  {therapyCategories.find(c => c.id === activeTherapyTab)?.name || activeTherapyTab}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                Skala Penilaian: <strong className="text-slate-800 font-mono">{currentReportData.settings?.titles?.scaleIndikator || 'B/S/K/BR'}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Evaluasi Klinis Table */}
                          <div className="space-y-6">
                            <TableHeader 
                              title={currentReportData.settings?.titles?.evaluasiKlinis || `A. Evaluasi & Perkembangan Kemampuan ${therapyCategories.find(c => c.id === activeTherapyTab)?.name || activeTherapyTab}`} 
                              scaleKey="scaleIndikator" 
                              scale={
                                typeof currentReportData.settings?.titles?.scaleIndikator === 'string' 
                                  ? currentReportData.settings.titles.scaleIndikator.split('/').map((s: string) => s.trim()) 
                                  : ['B', 'S', 'K', 'BR']
                              }
                              onTitleChange={(v: string) => updateCurrentSetting('titles.evaluasiKlinis', v)} 
                              isEditing={isEditing} 
                            />

                            <div className="border-x border-b border-slate-200 rounded-b-3xl overflow-hidden shadow-xs divide-y divide-slate-100 bg-white">
                              {((currentReportData.evaluasiKlinis?.items) || []).map((it: any, i: number) => {
                                const activeScaleList = typeof currentReportData.settings?.titles?.scaleIndikator === 'string'
                                  ? currentReportData.settings.titles.scaleIndikator.split('/').map((s: string) => s.trim())
                                  : ['B', 'S', 'K', 'BR'];

                                return (
                                  <div key={i} className="grid grid-cols-12 py-3 px-6 hover:bg-slate-50/80 transition-colors group relative items-center">
                                    <div className="col-span-6 flex items-center gap-3 pr-4">
                                      <span className="font-bold text-xs text-slate-400 font-mono shrink-0 w-6">
                                        {i + 1}.
                                      </span>
                                      {isEditing ? (
                                        <input 
                                          value={it.label}
                                          onChange={(e) => updateCustomReportField('evaluasiKlinis', e.target.value, i, 'label')}
                                          className="flex-1 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                                          placeholder="Nama indikator evaluasi..."
                                        />
                                      ) : (
                                        <span className="text-sm font-semibold text-slate-800 leading-snug">
                                          {it.label}
                                        </span>
                                      )}
                                    </div>

                                    {/* AWAL Scale Selector */}
                                    <div className="col-span-3 flex justify-around items-center">
                                      {activeScaleList.map((scaleOpt: string) => (
                                        <button 
                                          key={scaleOpt}
                                          type="button"
                                          disabled={!isEditing}
                                          onClick={() => isEditing && updateCustomReportField('evaluasiKlinis', scaleOpt, i, 'awal')}
                                          className={cn(
                                            "min-w-7 h-7 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center border",
                                            it.awal === scaleOpt 
                                              ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900" 
                                              : isEditing 
                                                ? "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700 cursor-pointer" 
                                                : "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                                          )}
                                        >
                                          {scaleOpt}
                                        </button>
                                      ))}
                                    </div>

                                    {/* HASIL Scale Selector */}
                                    <div className="col-span-3 flex justify-around items-center">
                                      {activeScaleList.map((scaleOpt: string) => (
                                        <button 
                                          key={scaleOpt}
                                          type="button"
                                          disabled={!isEditing}
                                          onClick={() => isEditing && updateCustomReportField('evaluasiKlinis', scaleOpt, i, 'hasil')}
                                          className={cn(
                                            "min-w-7 h-7 px-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center border",
                                            it.hasil === scaleOpt 
                                              ? "bg-teal-600 text-white border-teal-600 shadow-xs ring-1 ring-teal-600" 
                                              : isEditing 
                                                ? "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700 cursor-pointer" 
                                                : "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                                          )}
                                        >
                                          {scaleOpt}
                                        </button>
                                      ))}

                                      {isEditing && (
                                        <button 
                                          type="button"
                                          onClick={() => deleteItem('evaluasiKlinis', null, i)}
                                          className="text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
                                          title="Hapus baris"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {isEditing && (
                                <div className="p-3 bg-slate-50/50 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => addItem('evaluasiKlinis', null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Tambah Indikator Penilaian</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Clinical Observation Notes */}
                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {currentReportData.settings?.titles?.labelCatatanEvaluasi || 'Catatan Observasi & Evaluasi :'}
                              </p>
                              {isEditing ? (
                                <textarea 
                                  value={currentReportData.evaluasiKlinis?.komentar || ''}
                                  onChange={(e) => updateCustomReportField('evaluasiKlinis.komentar', e.target.value)}
                                  className="w-full h-24 p-3 bg-white border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                                  placeholder="Tuliskan catatan observasi klinis dan perkembangan ananda..."
                                />
                              ) : (
                                <p className="text-xs leading-relaxed text-slate-700 italic border-l-2 border-slate-300 pl-4 py-1">
                                  {currentReportData.evaluasiKlinis?.komentar || 'Belum ada catatan observasi klinis.'}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Follow Up & Home Program */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                            {/* Rencana Tindak Lanjut */}
                            <div className="space-y-4">
                              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                <span>{currentReportData.settings?.titles?.followUp || 'RENCANA TINDAK LANJUT / FOLLOW UP'}</span>
                                {isEditing && (
                                  <button 
                                    type="button"
                                    onClick={() => addItem('followUp', null)}
                                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                                {(!currentReportData.followUp || currentReportData.followUp.length === 0) ? (
                                  <p className="text-xs text-slate-400 italic">Belum ada tindak lanjut.</p>
                                ) : (
                                  <ul className="space-y-2.5">
                                    {currentReportData.followUp.map((fu: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                                        {isEditing ? (
                                          <div className="flex-1 flex items-center gap-2">
                                            <input 
                                              value={fu}
                                              onChange={(e) => updateCustomReportField('followUp', e.target.value, i)}
                                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                                            />
                                            <button 
                                              type="button"
                                              onClick={() => deleteItem('followUp', null, i)}
                                              className="text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="flex-1">{fu}</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>

                            {/* Program Latihan di Rumah */}
                            <div className="space-y-4">
                              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                <span>{currentReportData.settings?.titles?.homeProgram || 'PROGRAM LATIHAN DI RUMAH / HOME PROGRAM'}</span>
                                {isEditing && (
                                  <button 
                                    type="button"
                                    onClick={() => addItem('homeProgram', null)}
                                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-3">
                                {(!currentReportData.homeProgram || currentReportData.homeProgram.length === 0) ? (
                                  <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs text-slate-400 italic">
                                    Belum ada program latihan di rumah.
                                  </div>
                                ) : (
                                  currentReportData.homeProgram.map((hp: any, i: number) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative group space-y-2">
                                      {isEditing && (
                                        <button 
                                          type="button"
                                          onClick={() => deleteItem('homeProgram', null, i)}
                                          className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <span className="font-bold text-xs text-slate-400 font-mono mt-0.5">{i + 1}.</span>
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Aktivitas</p>
                                            {isEditing ? (
                                              <input 
                                                value={hp.aktivitas || ''}
                                                onChange={(e) => updateCustomReportField('homeProgram', e.target.value, i, 'aktivitas')}
                                                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 mt-0.5"
                                              />
                                            ) : (
                                              <p className="text-xs font-bold text-slate-800">{hp.aktivitas}</p>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Frekuensi</p>
                                              {isEditing ? (
                                                <input 
                                                  value={hp.frekuensi || ''}
                                                  onChange={(e) => updateCustomReportField('homeProgram', e.target.value, i, 'frekuensi')}
                                                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 mt-0.5"
                                                />
                                              ) : (
                                                <p className="text-xs text-slate-600">{hp.frekuensi || '-'}</p>
                                              )}
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durasi</p>
                                              {isEditing ? (
                                                <input 
                                                  value={hp.durasi || ''}
                                                  onChange={(e) => updateCustomReportField('homeProgram', e.target.value, i, 'durasi')}
                                                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 mt-0.5"
                                                />
                                              ) : (
                                                <p className="text-xs text-slate-600">{hp.durasi || '-'}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Signature Area */}
                      <div 
                        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                        className="signature-section therapy-signature-block pt-6 space-y-6 pb-4 break-inside-avoid print:break-inside-avoid select-none text-center"
                      >
                        {/* Top: Terapis Penanggung Jawab */}
                        <div className="flex flex-col items-center justify-center text-center px-10 break-inside-avoid print:break-inside-avoid w-full">
                           <div className="signature-block text-center flex flex-col items-center justify-center break-inside-avoid print:break-inside-avoid w-full max-w-[280px] mx-auto">
                              <p className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-1 min-h-[18px] text-center w-full">
                                {currentReportData.settings?.signatureRole1 || 'TERAPIS PENANGGUNG JAWAB'}
                              </p>
                              
                              <div className="signature-box h-[58px] min-h-[58px] w-full flex items-center justify-center my-0.5 text-center">
                                <div className="flex flex-col items-center justify-center text-center px-2 py-1 select-none w-full">
                                  <span className="text-[10px] text-slate-400 font-normal leading-tight text-center w-full">
                                    Dokumen diterbitkan secara digital
                                  </span>
                                  <span className="text-[9px] text-slate-400/80 font-normal leading-tight mt-0.5 text-center w-full">
                                    Tanda tangan belum diunggah
                                  </span>
                                </div>
                              </div>

                              <div className="signature-line w-[200px] max-w-[200px] h-[1.5px] bg-slate-900 my-1 mx-auto" />

                              <p className="signature-name text-[14px] font-bold text-slate-900 uppercase tracking-normal text-center w-full">
                                {isEditing ? (
                                   <input 
                                     value={currentReportData.identitas?.terapis || 'Tim Terapis'}
                                     onChange={(e) => updateCurrentIdentitas('terapis', e.target.value)}
                                     className="text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1 py-0.5 w-full font-bold uppercase text-[14px]"
                                   />
                                 ) : (
                                   currentReportData.identitas?.terapis || 'Tim Terapis'
                                 )}
                              </p>

                              <p className="signature-position signature-role text-[12px] font-medium text-slate-600 mt-0.5 text-center w-full" style={{ color: '#555555' }}>
                                {isEditing ? (
                                  <input 
                                    value={currentReportData.settings?.signatureSub1 || 'Terapis Okupasi Terapi'}
                                    onChange={(e) => updateCurrentSetting('signatureSub1', e.target.value)}
                                    className="text-[12px] font-medium text-slate-600 text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1"
                                  />
                                ) : (
                                  currentReportData.settings?.signatureSub1 || 'Terapis Okupasi Terapi'
                                )}
                              </p>
                           </div>
                        </div>

                        {/* Bottom Section: Mengetahui */}
                        <div className="pt-3 border-t border-slate-200 w-full space-y-3 text-center">
                          <div className="text-center w-full">
                            <p className="text-[12px] font-bold text-slate-800 uppercase tracking-widest text-center w-full">
                              MENGETAHUI
                            </p>
                          </div>

                          <div 
                            style={{ 
                              breakInside: 'avoid', 
                              pageBreakInside: 'avoid',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '44px',
                              textAlign: 'center',
                              alignItems: 'start',
                              justifyItems: 'center',
                            }}
                            className="w-full max-w-[640px] mx-auto px-4 break-inside-avoid print:break-inside-avoid"
                          >
                             {/* Manager Block */}
                             <div 
                               style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                               className="signature-block text-center flex flex-col items-center justify-center break-inside-avoid print:break-inside-avoid w-full max-w-[280px] mx-auto"
                             >
                                <div className="signature-box h-[58px] min-h-[58px] w-full flex items-center justify-center my-0.5 text-center">
                                  <div className="flex flex-col items-center justify-center text-center px-2 py-1 select-none w-full">
                                    <span className="text-[10px] text-slate-400 font-normal leading-tight text-center w-full">
                                      Dokumen diterbitkan secara digital
                                    </span>
                                    <span className="text-[9px] text-slate-400/80 font-normal leading-tight mt-0.5 text-center w-full">
                                      Tanda tangan belum diunggah
                                    </span>
                                  </div>
                                </div>

                                <div className="signature-line w-[200px] max-w-[200px] h-[1.5px] bg-slate-900 my-1 mx-auto" />

                                <p className="signature-name text-[14px] font-bold text-slate-900 uppercase tracking-normal text-center w-full">
                                  {isEditing ? (
                                    <input 
                                      value={currentReportData.settings?.managerName || 'Asep Suherman, S.E, M.M'}
                                      onChange={(e) => updateCurrentSetting('managerName', e.target.value)}
                                      className="text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1 py-0.5 w-full font-bold uppercase text-[14px]"
                                    />
                                  ) : (currentReportData.settings?.managerName || 'Asep Suherman, S.E, M.M')}
                                </p>

                                <p className="signature-position signature-role text-[12px] font-medium text-slate-600 mt-0.5 text-center w-full" style={{ color: '#555555' }}>
                                  {isEditing ? (
                                    <input 
                                      value={currentReportData.settings?.signatureSub2 || 'Manager Pelangi Lazuardi RC'}
                                      onChange={(e) => updateCurrentSetting('signatureSub2', e.target.value)}
                                      className="text-[12px] font-medium text-slate-600 text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1"
                                    />
                                  ) : (
                                    currentReportData.settings?.signatureSub2 || 'Manager Pelangi Lazuardi RC'
                                  )}
                                </p>
                             </div>

                             {/* Kepala Inklusi Block */}
                             <div 
                               style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                               className="signature-block text-center flex flex-col items-center justify-center break-inside-avoid print:break-inside-avoid w-full max-w-[280px] mx-auto"
                             >
                                <div className="signature-box h-[58px] min-h-[58px] w-full flex items-center justify-center my-0.5 text-center">
                                  <div className="flex flex-col items-center justify-center text-center px-2 py-1 select-none w-full">
                                    <span className="text-[10px] text-slate-400 font-normal leading-tight text-center w-full">
                                      Dokumen diterbitkan secara digital
                                    </span>
                                    <span className="text-[9px] text-slate-400/80 font-normal leading-tight mt-0.5 text-center w-full">
                                      Tanda tangan belum diunggah
                                    </span>
                                  </div>
                                </div>

                                <div className="signature-line w-[200px] max-w-[200px] h-[1.5px] bg-slate-900 my-1 mx-auto" />

                                <p className="signature-name text-[14px] font-bold text-slate-900 uppercase tracking-normal text-center w-full">
                                  {isEditing ? (
                                    <input 
                                      value={currentReportData.settings?.signerName3 || 'Abdul Ghofar, AMd.OT., S.Pd., M.H.'}
                                      onChange={(e) => updateCurrentSetting('signerName3', e.target.value)}
                                      className="text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1 py-0.5 w-full font-bold uppercase text-[14px]"
                                    />
                                  ) : (currentReportData.settings?.signerName3 || 'Abdul Ghofar, AMd.OT., S.Pd., M.H.')}
                                </p>

                                <p className="signature-position signature-role text-[12px] font-medium text-slate-600 mt-0.5 text-center w-full" style={{ color: '#555555' }}>
                                  {isEditing ? (
                                    <input 
                                      value={currentReportData.settings?.signatureSub3 || 'Kepala Pendidikan Inklusif Lazuardi GCS'}
                                      onChange={(e) => updateCurrentSetting('signatureSub3', e.target.value)}
                                      className="text-[12px] font-medium text-slate-600 text-center bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-none px-1"
                                    />
                                  ) : (
                                    currentReportData.settings?.signatureSub3 || 'Kepala Pendidikan Inklusif Lazuardi GCS'
                                  )}
                                </p>
                             </div>
                          </div>
                        </div>
                      </div>


                       {/* Achievement Chart Page */}
                       <AchievementChartPage 
                         therapyType={activeTherapyTab} 
                         childName={selectedChild.name} 
                         childId={selectedChild.id}
                         isEditing={isEditing}
                         period={selectedPeriod}
                         reportData={
                           activeTherapyTab === 'OT' ? otReportData :
                           activeTherapyTab === 'TW' ? twReportData :
                           activeTherapyTab === 'REMEDIAL' ? remReportData :
                           activeTherapyTab === 'FT' ? physioReportData :
                           activeTherapyTab === 'HT' ? htReportData : berkudaReportData
                         }
                         onSessionsChange={(total, present) => updateSessions(activeTherapyTab, total, present)}
                       />

                   </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[520px] border-2 border-dashed border-slate-200/90 rounded-3xl flex flex-col items-center justify-center p-8 sm:p-14 text-center bg-white shadow-xs">
                 <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-xs text-slate-400">
                   <UserIcon className="h-10 w-10 text-slate-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-600 mb-2">
                   Dokumentasi Klinis Rapor
                 </span>
                 <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">
                   Pilih Pasien Terapi Untuk Membuka Rapor
                 </h2>
                 <p className="text-slate-500 max-w-md text-xs sm:text-sm font-normal leading-relaxed mb-6">
                   Silakan pilih salah satu siswa dari daftar pasien terapi di sebelah kiri untuk melihat evaluasi respon, capaian target klinis, dan mencetak dokumen resmi A4.
                 </p>
                 {filteredChildren.length > 0 && (
                   <button 
                     type="button"
                     onClick={() => setSelectedChildId(filteredChildren[0].id)}
                     className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                   >
                     <UserIcon className="h-4 w-4 text-teal-400" />
                     <span>Buka Data {filteredChildren[0].name}</span>
                   </button>
                 )}
              </div>
            )}
          </main>

          {/* Sidebar Section: Komentar & Supervisi Klinis Manajemen */}
          {showManagerComment && (
            <aside className="lg:col-span-3 xl:col-span-3 space-y-6 print:hidden">
            <div className="sticky top-6 space-y-6">
              {selectedChild && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-900 text-teal-300 rounded-xl">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Supervisi Manajemen
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">Quality Assurance Klinis</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Auto-Save
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          Catatan & Evaluasi Supervisi
                        </label>
                      </div>
                      <textarea 
                        value={childManagerComments[`${selectedChildId}-${activeTherapyTab}`] || ""}
                        onChange={(e) => updateManagerComment(e.target.value)}
                        placeholder="Tuliskan catatan supervisi klinis, rekomendasi perbaikan intervensi, atau catatan validasi di sini..."
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all outline-none min-h-[260px] leading-relaxed"
                      />
                    </div>

                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                      <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                        Catatan supervisi ini bersifat internal untuk penjaminan mutu dan tidak akan dicetak pada lembar resmi A4.
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        showToast('Catatan supervisi telah tersimpan secara otomatis.');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Konfirmasi Catatan Peninjauan
                    </button>
                  </div>
                </div>
              )}
              
              {!selectedChild && (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-6 text-center text-slate-400">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Supervisi Manajemen</p>
                  <p className="text-[10px] text-slate-400 mt-1">Pilih salah satu siswa untuk mengisi lembar supervisi.</p>
                </div>
              )}
            </div>
          </aside>
        )}
        </div>
        )}
      </div>

      {/* Archive Modal */}
      {showArchive && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" /> ARSIP RAPOT
                  </h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Daftar rapot yang telah disimpan</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isCreatingFolder ? (
                    <button 
                      onClick={() => setIsCreatingFolder(true)}
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase"
                    >
                      <FolderPlus className="h-4 w-4 text-blue-500" /> Folder Baru
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                      <input 
                        autoFocus
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                        placeholder="Nama folder..."
                        className="text-[10px] font-bold px-2 py-1 outline-none w-32"
                      />
                      <button onClick={createFolder} className="p-1 hover:bg-green-50 text-green-600 rounded-md">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setIsCreatingFolder(false)} className="p-1 hover:bg-red-50 text-red-600 rounded-md">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2">
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-hidden">
                <button 
                  onClick={() => setCurrentFolderId(null)}
                  className={cn("hover:text-slate-900 transition-colors truncate", !currentFolderId ? "text-blue-600" : "")}
                >
                  Root
                </button>
                {currentFolderId && (
                  <>
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    <span className="text-slate-900 truncate">
                      {archiveFolders.find(f => f.id === currentFolderId)?.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-8 space-y-4 flex-1 bg-white">
              {/* Folders List (only at root or if nested folders supported) */}
              {!currentFolderId && archiveFolders.length > 0 && archiveFolders.map(folder => (
                <div key={folder.id} className="group flex items-center justify-between p-4 bg-blue-50/30 border border-blue-100 rounded-3xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                  onClick={() => setCurrentFolderId(folder.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{folder.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {archivedReports.filter(r => r.folderId === folder.id).length} Item diarsip
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Hapus folder ini? Item di dalamnya akan dipindahkan ke Root.')) deleteFolder(folder.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}

              {/* Items List */}
              {(() => {
                const visibleItems = archivedReports.filter(r => r.folderId === currentFolderId);
                if (visibleItems.length === 0 && (!currentFolderId || archiveFolders.length === 0)) {
                  return (
                    <div className="text-center py-20 text-slate-400">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">Belum ada rapot diarsip</p>
                    </div>
                  );
                }
                
                return visibleItems.map((archive) => (
                  <div key={archive.id} className="group flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                    onClick={() => loadFromArchive(archive)}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs",
                        archive.type === 'OT' ? "bg-teal-100 text-teal-600" : 
                        archive.type === 'TW' ? "bg-violet-100 text-violet-600" :
                        archive.type === 'REMEDIAL' ? "bg-pink-100 text-pink-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {archive.type}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900">{archive.childName}</p>
                          <span className="px-2 py-0.5 bg-slate-200 rounded text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                            {archive.year} {archive.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">{archive.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Buka Rapot</span>
                        <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        </div>
      )}

      {/* Professional A4 Print Preview & PDF Export Modal */}
      {isPreviewModalOpen && (
        <RapotPrintPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setActiveArchiveForPreview(null);
          }}
          child={
            activeArchiveForPreview
              ? (allChildren.find(c => c.id === activeArchiveForPreview.childId) || {
                  id: activeArchiveForPreview.childId,
                  name: activeArchiveForPreview.childName,
                  photoUrl: '',
                  sessions: [],
                  assessmentStatus: undefined as any
                })
              : (selectedChild || allChildren[0])
          }
          therapyType={activeArchiveForPreview ? activeArchiveForPreview.type : activeTherapyTab}
          reportData={activeArchiveForPreview ? activeArchiveForPreview.data : currentReportData}
          period={activeArchiveForPreview ? activeArchiveForPreview.period : selectedPeriod}
          year={activeArchiveForPreview ? activeArchiveForPreview.year : selectedYear}
          logoUrl={logoUrl}
          fileName={activeArchiveForPreview ? activeArchiveForPreview.fileName : currentFileName}
        />
      )}

      {/* Modal: Tambah Disiplin Layanan Terapi */}
      {isAddTherapyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Tambah Disiplin Layanan Terapi
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tambahkan layanan baru ke dalam format rapor & lembar evaluasi
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddTherapyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewTherapy} className="p-8 space-y-6">
              {/* Nama Layanan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  Nama Layanan Terapi <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  autoFocus
                  value={newTherapyForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoCode = name
                      .split(' ')
                      .map(w => w[0])
                      .join('')
                      .replace(/[^a-zA-Z0-9]/g, '')
                      .slice(0, 6)
                      .toUpperCase();
                    setNewTherapyForm(prev => ({
                      ...prev,
                      name,
                      code: prev.code ? prev.code : autoCode
                    }));
                  }}
                  placeholder="Contoh: Sensori Integrasi, Art Therapy, Snoezelen..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                />
              </div>

              {/* Kode & Skala Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    Kode / ID Singkatan
                  </label>
                  <input 
                    type="text"
                    value={newTherapyForm.code}
                    onChange={(e) => setNewTherapyForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))}
                    placeholder="Contoh: SI, AT, ABA"
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400">Kode unik untuk format arsip</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    Skala Penilaian
                  </label>
                  <select
                    value={newTherapyForm.scale}
                    onChange={(e) => setNewTherapyForm(prev => ({ ...prev, scale: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all cursor-pointer"
                  >
                    <option value="B/S/K/BR">B / S / K / BR (Berlebihan / Sesuai / Kurang / Berubah-ubah)</option>
                    <option value="MD/SD/TD">MD / SD / TD (Mudah / Sulit / Tidak Dapat)</option>
                    <option value="teramati/tidak">teramati / tidak (Teramati / Tidak Teramati)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Opsi penilaian kolom AWAL & HASIL</span>
                </div>
              </div>

              {/* Pilihan Ikon */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  Pilih Ikon Layanan
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                  {[
                    { name: 'Sparkles', Icon: Sparkles },
                    { name: 'Brain', Icon: Brain },
                    { name: 'Stethoscope', Icon: Stethoscope },
                    { name: 'Heart', Icon: Heart },
                    { name: 'Activity', Icon: Activity },
                    { name: 'Waves', Icon: Waves },
                    { name: 'Palette', Icon: Palette },
                    { name: 'Music', Icon: Music },
                    { name: 'Dumbbell', Icon: Dumbbell },
                    { name: 'Smile', Icon: Smile },
                    { name: 'Layers', Icon: Layers },
                    { name: 'ClipboardList', Icon: ClipboardList },
                  ].map(({ name, Icon }) => {
                    const isSelected = newTherapyForm.iconName === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewTherapyForm(prev => ({ ...prev, iconName: name }))}
                        className={cn(
                          "h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
                          isSelected 
                            ? "bg-slate-900 text-teal-400 border-slate-900 shadow-xs ring-2 ring-slate-900/10" 
                            : "bg-slate-50 hover:bg-white text-slate-600 border-slate-200"
                        )}
                        title={name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Warna Tema */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                  Pilih Warna Aksen
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', hex: '#4f46e5', label: 'Indigo' },
                    { color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', hex: '#0d9488', label: 'Teal' },
                    { color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', hex: '#7c3aed', label: 'Violet' },
                    { color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', hex: '#db2777', label: 'Pink' },
                    { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', hex: '#d97706', label: 'Amber' },
                    { color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', hex: '#0891b2', label: 'Cyan' },
                    { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', hex: '#059669', label: 'Emerald' },
                    { color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', hex: '#e11d48', label: 'Rose' },
                  ].map((theme) => {
                    const isSelected = newTherapyForm.color === theme.color;
                    return (
                      <button
                        key={theme.label}
                        type="button"
                        onClick={() => setNewTherapyForm(prev => ({
                          ...prev,
                          color: theme.color,
                          bgColor: theme.bgColor,
                          borderColor: theme.borderColor
                        }))}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/10" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                        )}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                        <span>{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Chip */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border", newTherapyForm.bgColor, newTherapyForm.borderColor)}>
                    {React.createElement(ICON_MAP[newTherapyForm.iconName] || Sparkles, {
                      className: cn("w-4 h-4", newTherapyForm.color)
                    })}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Pratinjau Tombol Rail</span>
                    <p className="text-xs font-bold text-slate-800 leading-none">
                      {newTherapyForm.name || 'Nama Layanan Baru'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {newTherapyForm.scale}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTherapyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-400" />
                  <span>Simpan & Buka Rapor</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style>{`
        @media print {
          @page {
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
          }
          .print\\:hidden, header, aside, .flex-wrap, .sticky, button, .lucide-plus, .lucide-x, .lucide-save, .lucide-history {
            display: none !important;
          }
          main {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .a4-sheet {
            margin: 0 auto !important;
            padding: 11mm 13mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
          }
          .a4-sheet.a4-portrait {
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
          }
          .a4-sheet.a4-landscape {
            width: 297mm !important;
            min-height: 210mm !important;
            height: 210mm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RapotPage;
