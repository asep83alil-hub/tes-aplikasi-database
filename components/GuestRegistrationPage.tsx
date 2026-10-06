import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Users, 
  Baby, 
  Heart, 
  Activity, 
  Brain, 
  BookOpen, 
  Smile, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  MapPin,
  School,
  FileText,
  Stethoscope,
  ClipboardList,
  Globe,
  Search,
  Share2,
  Sparkles
} from 'lucide-react';
import { RegistrationPrintPreviewModal } from './RegistrationPrintPreviewModal';
import { convertGuestDataToRegistration } from '../utils/registrationStorage';
import { RegistrationRecord } from '../types';

interface GuestRegistrationPageProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  logoUrl?: string;
  onLogoChange?: (url: string) => void;
}

const steps = [
  { id: 'identitas', title: 'Identitas Anak', icon: User, group: '1' },
  { id: 'keluarga', title: 'Data Keluarga', icon: Users, group: '1' },
  { id: 'kelahiran', title: 'Riwayat Kelahiran', icon: Baby, group: '1' },
  { id: 'perkembangan', title: 'Perkembangan', icon: Activity, group: '1' },
  { id: 'kesehatan', title: 'Riwayat Kesehatan', icon: Heart, group: '1' },
  { id: 'sosial', title: 'Sosial & Mandiri', icon: Users, group: '1' },
  { id: 'tingkahLaku', title: 'Tingkah Laku', icon: Brain, group: '1' },
  { id: 'kebiasaanBelajar', title: 'Belajar', icon: BookOpen, group: '1' },
  { id: 'emosi', title: 'Emosi', icon: Smile, group: '1' },
  { id: 'rujukan', title: 'Formulir Rujukan', icon: Info, group: '2' },
  { id: 'sensory', title: 'Sensory Profile', icon: ClipboardList, group: '3' },
  { id: 'observasi', title: 'Observasi Bicara', icon: Activity, group: '4' },
];

const menuTypes = [
  { id: 'PSB', title: 'Assesment PSB', description: '', icon: FileText, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', shadowColor: 'shadow-blue-500/20' },
  { id: 'TERAPI', title: 'Assesment Terapi', description: '', icon: Activity, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600', shadowColor: 'shadow-emerald-500/20' },
  { id: 'TERAPI_PSIKOLOG', title: 'Assesment Terapi + Psikolog', description: '', icon: Brain, color: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-600', shadowColor: 'shadow-indigo-500/20' },
  { id: 'PSIKOLOG', title: 'Psikolog', description: 'Pilih jenis layanan psikologi', icon: Heart, color: 'bg-rose-500', hoverColor: 'hover:bg-rose-600', shadowColor: 'shadow-rose-500/20' },
];

const psychologistMenus = [
  { id: 'KONSULTASI', title: 'Konsultasi Psikolog', description: '', color: 'bg-cyan-500', hoverColor: 'hover:bg-cyan-600' },
  { id: 'IQ', title: 'Tes IQ', description: '', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
  { id: 'MINAT_BAKAT', title: 'Tes Minat Bakat', description: '', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
  { id: 'KEMATANGAN', title: 'Tes Kematangan / Kesiapan Sekolah', description: '', color: 'bg-violet-500', hoverColor: 'hover:bg-violet-600' },
];

const sensoryOptions = ["Selalu", "Sering", "Kadang-kadang", "Jarang", "Tidak Pernah"];

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

const sensorySections = [
  { 
    id: 'A', title: 'A. AUDITORY PROCESSING', 
    questions: [
      "Berespon negatif terhadap suara yang keras atau tidak disukai (misalnya menangis atau bersembunyi saat mendengar suara penyedot debu, gonggongan anjing atau pengering rambut)",
      "Menutup daun telinga dengan tangan agar tidak mendengar suara yang tidak disukai",
      "Berjuang keras/kesulitan untuk menyelesaikan tugas saat TV atau musik menyala",
      "Terganggu saat disekitarnya banyak suara gaduh/berisik",
      "Tidak dapat bekerja jika ada suara latar (seperti kipas angin, kulkas)",
      "Tidak berespon saat namanya dipanggil tetapi kita tahu anak tidak punya masalah pendengaran",
      "Terlihat tidak mendengar apa yang kita katakan, seperti mengabaikan",
      "Menikmati suara berisik yang asing atau mencari suara yang asing untuk dengan sengaja didengarkan"
    ]
  },
  {
    id: 'B', title: 'B. VISUAL PROCESSING',
    questions: [
      "Lebih menyukai atau senang berada di tempat yang gelap",
      "Lebih menyukai warna cerah atau berpola untuk berpakaian",
      "Menikmati melihat objek visual secara detil",
      "Membutuhkan bantuan untuk menemukan objek yang (terlihat) jelas bagi orang lain (misalnya benda-benda yang berserakan di lantai atau di laci)",
      "Lebih terganggu oleh cahaya terang dibandingkan teman-temannya (usia yang sama)",
      "Mengawasi orang saat mereka bergerak di ruangan sekitarnya",
      "Terganggu oleh lampu terang (misalnya, bersembunyi dari sinar matahari melalui jendela mobil)"
    ]
  },
  {
    id: 'C', title: 'C. TOUCH PROCESSING',
    questions: [
      "Menunjukkan kesulitan menahan diri (perasaan tertekan) selama perawatan diri (misalnya melawan atau menangis saat memotong rambut, mencuci muka, memotong kuku)",
      "Menjadi jengkel bila memakai sepatu atau kaus kaki",
      "Menunjukkan respons emosional atau agresif ketika tersentuh/disentuh",
      "Menjadi cemas ketika berdiri dekat dengan orang lain (misalnya, dalam satu barisan)",
      "Menggosok atau menggaruk bagian tubuh yang telah disentuh",
      "Menyentuh orang atau benda sampai mengganggu orang lain",
      "Menunjukkan kebutuhan perlu menyentuh mainan, permukaan, atau tekstur (Misalnya, sekedar mendapatkan sensasi terpenuhi keinginannya menyentuh)",
      "Nampak tidak menyadari akan rasa sakit (misalnya saat jatuh, terbentur)",
      "Tampaknya tidak menyadari perubahan suhu (misalnya tidak merasakan hangat-panas, netral-dingin)",
      "Menyentuh berlebihan pada orang dan benda dibandingkan anak seusianya",
      "Tampaknya tidak menyadari tangan atau wajah yang berantakan (kotor atau menempel sisa-sisa makanan)"
    ]
  },
  {
    id: 'D', title: 'D. MOVEMENT PROCESSING',
    questions: [
      "Selalu bergerak dan hal tersebut mengganggu rutinitas hariannya (misalnya, tidak bisa duduk diam, gelisah)",
      "Mengguncang badan tanpa disadarinya di kursi, di lantai, atau sambil berdiri atau saat menonton TV",
      "Ragu-ragu naik atau turun trotoar atau tangga (misalnya, adalah hati-hati, berhenti sebelum bergerak)",
      "Menjadi bersemangat atau tergugah dalam aktivitas yang perlu banyak gerakan",
      "Mengambil risiko yang berlebihan atau memanjat yang tidak aman (memanjat pohon tinggi, melompat dari furnitur yang tinggi)",
      "Mencari peluang untuk jatuhan bebas tanpa memperhatikan keselamatan dirinya (Misalnya, jatuh dengan sengaja)",
      "Kehilangan keseimbangan tiba-tiba saat berjalan di jalan yang permukaannya tidak rata",
      "Menabrak sesuatu/benda-benda, tidak mampu memperhatikan adanya benda dihadapannya atau orang yang sedang berjalan"
    ]
  },
  {
    id: 'E', title: 'E. BODY POSITION PROCESSING',
    questions: [
      "Bergerak dengan kaku",
      "Mudah lelah, terutama saat berdiri atau mempertahankan tubuh dalam satu posisi tertentu",
      "Memiliki otot yang lemah (misalnya tidak dapat mengangkat benda-benda yang berat)",
      "Menopang/menyangga badannya sendiri (misalnya, memegang kepala di tangan, bersandar pada dinding)",
      "Memegang erat benda, menempelkan tangan dengan kuat pada dinding, atau pegangan tangga berlebihan dibanding anak seusianya",
      "Perlu usaha besar untuk berjalan bagaikan aktivitas olahraga yang berat baginya",
      "Memerlukan perlindungan dalam hidupnya yang lebih banyak bantuan pada orang lain dibanding anak seusianya (tak berdaya secara fisik dan emosi)",
      "Membutuhkan selimut tebal untuk tidur"
    ]
  },
  {
    id: 'F', title: 'F. ORAL SENSORY PROCESSING',
    questions: [
      "Mudah berganti-ganti makanan dari tekstur makanan atau peralatan makanan tertentu yang dimasukkan masuk ke mulut",
      "Menolak rasa atau aroma makanan tertentu yang terdapat pada makanan hidangannya",
      "Hanya makan dengan selera tertentu (misalnya, manis, asin)",
      "Membatasi diri pada tekstur makanan tertentu (hanya yang teksturnya lembut)",
      "Pemilih makanan, terutama tentang tekstur makanan",
      "Membaui selain makanan (mencium/membaui benda bukan makanan)",
      "Menunjukkan preferensi kuat untuk selera tertentu",
      "Sangat membutuhkan makanan, rasa, atau aroma tertentu",
      "Memasukkan benda ke mulut (misalnya, pensil, tangan)",
      "Menggigit lidah atau bibir lebih banyak dari anak-anak usia yang sama"
    ]
  },
  {
    id: 'G', title: 'G. CONDUCT Associated with sensory processing',
    questions: [
      "Terlihat tidak menghiraukan bahaya (cenderung mudah celaka)",
      "Tergesa-gesa dalam mewarnai menulis, atau menggambar",
      "Mengambil risiko berlebihan selama bermain (misalnya, naik tinggi ke pohon, melompat dari furnitur tinggi)",
      "Lebih aktif dari anak usia yang sama",
      "Melakukan berbagai hal dengan cara yang lebih sulit daripada yang dibutuhkan (misalnya, buang waktu, bergerak lambat)",
      "Menjadi keras kepala dan tidak bisa kooperatif (tidak bisa diajak kerjasama)",
      "Mengamuk (temper tantrums)",
      "Menikmati saat terjatuh (senang menjatuhkan diri/mengulanginya lagi)",
      "Menolak kontak mata dari saya (ibu/ayah) atau orang lain"
    ]
  },
  {
    id: 'H', title: 'H. SOCIAL EMOTIONAL Responses',
    questions: [
      "Kelihatannya memiliki harga diri yang rendah (misalnya, kesulitan menghargai diri sendiri/menyukai dirinya)",
      "Membutuhkan dukungan positif untuk kembali ke perencanaan yang menantang (misalnya bereaksi kekanak-kanakan/tidak dewasa pada situasi dibanding anak seusianya)",
      "Memiliki ketakutan yang pasti dan dapat diprediksi",
      "Memperlihatkan kecemasan atau gelisah saat gagal",
      "Sensitif terhadap kritikan",
      "Terlalu serius (nampak serius yang berlebihan)",
      "Memperlihatkan ledakan emosi yang kuat saat tidak dapat menyelesaikan tugas",
      "Kesulitan untuk merasakan bahasa tubuh atau ekspresi wajah (misalnya kesulitan menginterpretasikan ekspresi)",
      "Mudah frustrasi (misalnya mudah menyerah saat menyelesaikan tugas yang sedikit diatas kemampuannya)",
      "Memiliki ketakutan yang mengganggu terhadap rutinitas hariannya",
      "Tertekan oleh perubahan dalam rencana, rutinitas, atau harapan",
      "Membutuhkan lebih banyak perlindungan dari kehidupan anak-anak dengan usia yang sama (Misalnya, tidak berdaya secara fisik atau emosional)",
      "Berinteraksi dengan anak dalam kelompok usia yang dibawah usianya",
      "Memiliki masalah dengan pertemanan, hanya berteman dengan teman tertentu saja"
    ]
  },
  {
    id: 'I', title: 'I. ATTENTIONAL Responses',
    questions: [
      "Melewatkan/menghindari kontak mata dengan saya selama interaksi sehari-hari",
      "Berupaya keras / kesulitan untuk memperhatikan",
      "Mengalihkan pandangan dari tugas ingin memperhatikan semua tindakan/aktivitas di dalam ruangan",
      "Tidak menyadari dirinya dalam lingkungan yang aktif (misalnya, tidak mengetahui adanya aktivitas)",
      "Melihat benda secara intensif",
      "Menatap orang secara intensif",
      "Melihat setiap orang ketika mereka bergerak di ruangan",
      "Melewati satu hal ke hal yang lain (melompat dari satu topik ke topik yang lain)",
      "Mudah hilang",
      "Memiliki kesulitan menemukan objek di lingkungan dengan latar belakang yang beragam (Misalnya, sepatu di ruangan yang berantakan, pensil di \"sampah\"/ laci \")",
      "Tidak mengetahui ketika ada orang lain masuk kedalam ruangan"
    ]
  }
];

const GuestRegistrationPage: React.FC<GuestRegistrationPageProps> = ({ onBack, onSubmit, logoUrl, onLogoChange }) => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [psychologistSubMenu, setPsychologistSubMenu] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<RegistrationRecord | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onLogoChange) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoInput = () => {
    fileInputRef.current?.click();
  };
  
  // Filter steps based on selected menu
  const getVisibleSteps = () => {
    if (selectedMenu === 'PSIKOLOG' || selectedMenu === 'REGISTER_PSIKOLOG') {
      return steps.slice(0, 9); // Only Langkah 1
    }
    return steps; // Langkah 1-4
  };

  const currentSteps = getVisibleSteps();
  const [formData, setFormData] = useState<any>({
    category: '',
    subCategory: '',
    referralSource: 'Instagram',
    referralSourceOther: '',
    // Step 1: Identitas
    child: {
      fullName: '',
      nickName: '',
      gender: '',
      birthPlace: '',
      birthDate: '',
      age: '',
      address: '',
      phone: '',
      school: '',
      class: '',
    },
    // Step 2: Keluarga
    family: {
      childOrder: '',
      totalSiblings: '',
      siblings: [],
      father: {
        name: '', age: '', status: 'Hidup', ethnicity: '', religion: '', order: '', totalSiblings: '', marriageOrder: '', marriageYear: '', education: '', job: '', address: '', phone: '', officePhone: '', deceasedInfo: ''
      },
      mother: {
        name: '', age: '', status: 'Hidup', ethnicity: '', religion: '', order: '', totalSiblings: '', marriageOrder: '', marriageYear: '', education: '', job: '', address: '', phone: '', officePhone: '', deceasedInfo: ''
      }
    },
    // Sibling table (from PDF page 1)
    siblings: [
      { id: '1', name: '', gender: '', age: '', education: '', remarks: '' }
    ],
    // Step 3: Rujukan
    referral: {
      generalOverview: '',
      complaints: '',
      sinceWhen: '',
      underlyingFactors: '',
      relievingFactors: '',
      actionsTaken: '',
      resultsAchieved: '',
      goals: '',
      source: 'Instagram'
    },
    // Step 4: Kelahiran
    birth: {
      prenatal: { problems: '', physicalCondition: '', emotionalCondition: '' },
      delivery: { duration: '', process: '', condition: '', length: '', weight: '', breastfeedingUntil: '' }
    },
    // Step 5: Perkembangan
    development: {
      feeding: { fedBy: '', eatsWith: '', hungerSignal: '', difficultySitting: '', difficultPositions: '' },
      preferences: { drinks: [], fruits: '', foods: '', favoriteTaste: '' }
    },
    // Step 6: Kesehatan
    health: {
      illnesses: [],
    },
    // Step 7: Sosial & Mandiri
    social: {
      independence: [],
      sociability: { shyness: '', groupPlay: '', bestFriend: '', playLocation: '', gameType: '', favoriteGames: '' }
    },
    // Step 8: Tingkah Laku (30 questions)
    behavior: {},
    // Step 9: Belajar
    learning: {
      duration: '', time: '', matter: [], schedule: '', location: '', independence: '', difficultyRelieving: '', readingInterests: []
    },
    // Step 10: Emosi
    emotion: {
      motivation: { preparation: '', feeling: '', spareTime: '' },
      socialAdjustment: { newEnv: '', newTask: '', rules: '', discomfort: '' },
      emotions: { happyWhat: '', happyHow: '', sadWhat: '', sadHow: '', angryWhat: '', angryHow: '' },
      additional: { differentFromPeers: '', quiet: '', distractible: '', interferesOthers: '', easySocial: '', schoolIssues: '', PhysicalIssues: '' }
    },
    // Step 11: Sensory Profile (86 questions)
    sensoryProfile: {},
    // Step 12: Observation (20 questions)
    observation: {}
  });

  const nextStep = () => {
    if (activeStep < currentSteps.length - 1) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleInputChange = (section: string, field: string, value: any, subSection?: string) => {
    setFormData((prev: any) => {
      if (subSection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [field]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleCheckboxChange = (section: string, field: string, value: string, subSection?: string) => {
    setFormData((prev: any) => {
      let currentList = subSection ? prev[section][subSection][field] : prev[section][field];
      if (!Array.isArray(currentList)) currentList = [];
      
      const newList = currentList.includes(value)
        ? currentList.filter((i: string) => i !== value)
        : [...currentList, value];

      if (subSection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [field]: newList
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newList
        }
      };
    });
  };

  const addSibling = () => {
    setFormData((prev: any) => ({
      ...prev,
      siblings: [
        ...prev.siblings,
        { id: Date.now().toString(), name: '', gender: '', age: '', education: '', remarks: '' }
      ]
    }));
  };

  const updateSibling = (id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      siblings: prev.siblings.map((s: any) => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSibling = (id: string) => {
    if (formData.siblings.length <= 1) return;
    setFormData((prev: any) => ({
      ...prev,
      siblings: prev.siblings.filter((s: any) => s.id !== id)
    }));
  };

  const renderIdentitas = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap Ananda</label>
          <input 
            type="text" 
            value={formData.child.fullName} 
            onChange={(e) => handleInputChange('child', 'fullName', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Masukkan nama lengkap..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nama Panggilan (Mungkin)</label>
          <input 
            type="text" 
            value={formData.child.nickName} 
            onChange={(e) => handleInputChange('child', 'nickName', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Panggilan akrab..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
          <select 
            value={formData.child.gender} 
            onChange={(e) => handleInputChange('child', 'gender', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="">Pilih...</option>
            <option value="Laki-Laki">Laki-Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tempat Lahir</label>
          <input 
            type="text" 
            value={formData.child.birthPlace} 
            onChange={(e) => handleInputChange('child', 'birthPlace', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Kota kelahiran..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tanggal Lahir</label>
          <input 
            type="date" 
            value={formData.child.birthDate} 
            onChange={(e) => handleInputChange('child', 'birthDate', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Usia</label>
          <input 
            type="text" 
            value={formData.child.age} 
            onChange={(e) => handleInputChange('child', 'age', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Contoh: 5 tahun 2 bulan"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap Rumah</label>
          <textarea 
            value={formData.child.address} 
            onChange={(e) => handleInputChange('child', 'address', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-24"
            placeholder="Alamat lengkap rumah..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nomor Telepon Rumah</label>
          <input 
            type="text" 
            value={formData.child.phone} 
            onChange={(e) => handleInputChange('child', 'phone', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Nomor telepon rumah..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Asal Sekolah</label>
          <input 
            type="text" 
            value={formData.child.school} 
            onChange={(e) => handleInputChange('child', 'school', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kelas</label>
          <input 
            type="text" 
            value={formData.child.class} 
            onChange={(e) => handleInputChange('child', 'class', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderDataKeluarga = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/20">
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary uppercase tracking-widest">Anak Ke</label>
          <input 
            type="number" 
            value={formData.family.childOrder} 
            onChange={(e) => handleInputChange('family', 'childOrder', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary uppercase tracking-widest">Dari ... Bersaudara</label>
          <input 
            type="number" 
            value={formData.family.totalSiblings} 
            onChange={(e) => handleInputChange('family', 'totalSiblings', e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
          />
        </div>
      </div>

      {['father', 'mother'].map((parent) => (
        <div key={parent} className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-primary pl-4">
            Data {parent === 'father' ? 'Ayah' : 'Ibu'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nama {parent === 'father' ? 'Ayah' : 'Ibu'}</label>
              <input 
                type="text" 
                value={formData.family[parent].name} 
                onChange={(e) => handleInputChange('family', 'name', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Umur</label>
              <input 
                type="text" 
                value={formData.family[parent].age} 
                onChange={(e) => handleInputChange('family', 'age', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suku Bangsa</label>
              <input 
                type="text" 
                value={formData.family[parent].ethnicity} 
                onChange={(e) => handleInputChange('family', 'ethnicity', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Agama</label>
              <input 
                type="text" 
                value={formData.family[parent].religion} 
                onChange={(e) => handleInputChange('family', 'religion', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Anak Ke</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="X"
                  value={formData.family[parent].order} 
                  onChange={(e) => handleInputChange('family', 'order', e.target.value, parent)}
                  className="w-20 bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
                />
                <span className="text-[10px] text-gray-600">DARI</span>
                <input 
                  type="text" 
                  placeholder="Y"
                  value={formData.family[parent].totalSiblings} 
                  onChange={(e) => handleInputChange('family', 'totalSiblings', e.target.value, parent)}
                  className="w-20 bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
                />
                <span className="text-[10px] text-gray-600">BERSAUDARA</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pernikahan Ke-X thn Y</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Ke"
                  value={formData.family[parent].marriageOrder} 
                  onChange={(e) => handleInputChange('family', 'marriageOrder', e.target.value, parent)}
                  className="w-20 bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
                />
                <input 
                  type="text" 
                  placeholder="Thn"
                  value={formData.family[parent].marriageYear} 
                  onChange={(e) => handleInputChange('family', 'marriageYear', e.target.value, parent)}
                  className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pendidikan Terakhir</label>
              <input 
                type="text" 
                value={formData.family[parent].education} 
                onChange={(e) => handleInputChange('family', 'education', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pekerjaan</label>
              <input 
                type="text" 
                value={formData.family[parent].job} 
                onChange={(e) => handleInputChange('family', 'job', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alamat & Telpon Rumah</label>
              <input 
                type="text" 
                value={formData.family[parent].address} 
                onChange={(e) => handleInputChange('family', 'address', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telp Kantor / HP</label>
              <input 
                type="text" 
                value={formData.family[parent].phone} 
                onChange={(e) => handleInputChange('family', 'phone', e.target.value, parent)}
                className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Sibling Table (PDF Page 1) */}
      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-primary pl-4">
          Daftar Urutan Anak (Termasuk Diri Anak)
        </h3>
        <div className="bg-[#1c222d] rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">No</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nama</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">L/P</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usia</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pend.</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ket.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {formData.siblings.map((sibling: any, index: number) => (
                <tr key={sibling.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2 text-xs font-bold text-gray-500">{index + 1}</td>
                  <td className="px-2 py-2">
                    <input 
                      type="text" 
                      value={sibling.name}
                      onChange={(e) => updateSibling(sibling.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                      placeholder="Nama anak..."
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select 
                      value={sibling.gender}
                      onChange={(e) => updateSibling(sibling.id, 'gender', e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-xs p-0 pr-8"
                    >
                      <option value="">-</option>
                      <option value="L">L</option>
                      <option value="P">P</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="text" 
                      value={sibling.age}
                      onChange={(e) => updateSibling(sibling.id, 'age', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                      placeholder="Usia..."
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="text" 
                      value={sibling.education}
                      onChange={(e) => updateSibling(sibling.id, 'education', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                      placeholder="Pendidikan..."
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="text" 
                      value={sibling.remarks}
                      onChange={(e) => updateSibling(sibling.id, 'remarks', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs p-0"
                      placeholder="..."
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => removeSibling(sibling.id)} className="text-rose-500 hover:text-rose-400 p-2">
                      <AlertCircle className="w-4 h-4 rotate-45" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={addSibling}
            className="w-full py-3 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border-t border-white/5"
          >
            + Tambah Saudara
          </button>
        </div>
      </div>
    </div>
  );

  const renderRujukan = () => (
    <div className="space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
          Bagian ini membantu kami memahami profil awal ananda. Isilah dengan sejujur-jujurnya berdasarkan pengamatan sehari-hari.
        </p>
      </div>
      {[
        { id: 'generalOverview', label: '1. Gambaran anak secara umum' },
        { id: 'complaints', label: '2. Perilaku atau Keluhan yang dikeluhkan saat ini' },
        { id: 'sinceWhen', label: '3. Sejak kapan perilaku atau keluhan tersebut muncul' },
        { id: 'underlyingFactors', label: '4. Hal-hal yang diperkirakan mendasari kemunculan perilaku tersebut' },
        { id: 'relievingFactors', label: '5. Hal-hal yang meredakan / menghilangkan perilaku tersebut' },
        { id: 'actionsTaken', label: '6. Tindakan yang sudah dilakukan untuk menangani perilaku tersebut' },
        { id: 'resultsAchieved', label: '7. Hasil yang sudah dicapai ananda' },
        { id: 'goals', label: 'Sasaran yang ingin dicapai terhadap ananda' },
      ].map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">{field.label}</label>
          <textarea 
            value={formData.referral[field.id]} 
            onChange={(e) => handleInputChange('referral', field.id, e.target.value)}
            className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary h-32"
          />
        </div>
      ))}

      {/* 9. Sumber Informasi Klien */}
      <div className="space-y-3 pt-6 border-t border-white/10">
        <label className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <span>9. Mendapatkan informasi Pelangi / Sumber Informasi Klien dari:</span>
          <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'Instagram', label: 'Instagram', icon: '📸' },
            { id: 'Website', label: 'Website', icon: '🌐' },
            { id: 'Google', label: 'Google', icon: '🔍' },
            { id: 'Referensi', label: 'Referensi', icon: '👥' },
            { id: 'dll', label: 'dll', icon: '✍️' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFormData((prev: any) => ({
                  ...prev,
                  referralSource: item.id,
                  referral: {
                    ...prev.referral,
                    source: item.id === 'dll' ? (prev.referralSourceOther || 'Lainnya') : item.id
                  }
                }));
              }}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                formData.referralSource === item.id
                  ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'bg-[#1c222d] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>

        {formData.referralSource === 'dll' && (
          <div className="pt-2 animate-fade-in-up">
            <input
              type="text"
              value={formData.referralSourceOther || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev: any) => ({
                  ...prev,
                  referralSourceOther: val,
                  referral: {
                    ...prev.referral,
                    source: val || 'Lainnya'
                  }
                }));
              }}
              placeholder="Sebutkan sumber informasi lainnya (contoh: Rekomendasi Dokter, Teman Sekolah, Brosur, Event, dll)..."
              className="w-full bg-[#1c222d] border border-white/20 focus:border-primary rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderKelahiran = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-indigo-500 pl-4">Riwayat Pra-Nata</h3>
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Masalah bunda sewaktu mengandung?</label>
          <div className="flex gap-4">
             <button 
               onClick={() => handleInputChange('birth', 'problems', 'Tidak Bermasalah', 'prenatal')}
               className={`px-6 py-2 rounded-full border transition-all ${formData.birth.prenatal.problems === 'Tidak Bermasalah' ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-gray-400'}`}
             >Tidak Bermasalah</button>
             <button 
               onClick={() => handleInputChange('birth', 'problems', 'Bermasalah', 'prenatal')}
               className={`px-6 py-2 rounded-full border transition-all ${formData.birth.prenatal.problems === 'Bermasalah' ? 'bg-rose-500 border-rose-500 text-white' : 'border-white/10 text-gray-400'}`}
             >Ada Masalah</button>
          </div>
          {formData.birth.prenatal.problems === 'Bermasalah' && (
            <textarea 
              placeholder="Jelaskan masalahnya..."
              className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 h-24"
              onChange={(e) => handleInputChange('birth', 'problems', e.target.value, 'prenatal')}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Keadaan fisik bunda saat hamil</label>
             <input value={formData.birth.prenatal.physicalCondition} onChange={(e) => handleInputChange('birth', 'physicalCondition', e.target.value, 'prenatal')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Keadaan emosi bunda saat hamil</label>
             <input value={formData.birth.prenatal.emotionalCondition} onChange={(e) => handleInputChange('birth', 'emotionalCondition', e.target.value, 'prenatal')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-emerald-500 pl-4">Riwayat Partus (Kelahiran)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Usia kandungan (Minggu)</label>
             <input type="number" value={formData.birth.delivery.duration} onChange={(e) => handleInputChange('birth', 'duration', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Proses kelahiran</label>
             <select value={formData.birth.delivery.process} onChange={(e) => handleInputChange('birth', 'process', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3">
               <option value="">Pilih...</option>
               <option value="Normal">Normal</option>
               <option value="Operasi">Operasi</option>
               <option value="Alat Bantu">Alat Bantu</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Waktu lahir (Tangis?)</label>
             <select value={formData.birth.delivery.condition} onChange={(e) => handleInputChange('birth', 'condition', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3">
               <option value="">Pilih...</option>
               <option value="Langsung Menangis">Langsung Menangis</option>
               <option value="Tidak Langsung Menangis">Tidak Langsung Menangis</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Panjang lahir (CM)</label>
             <input type="number" value={formData.birth.delivery.length} onChange={(e) => handleInputChange('birth', 'length', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Berat lahir (KG)</label>
             <input type="number" step="0.1" value={formData.birth.delivery.weight} onChange={(e) => handleInputChange('birth', 'weight', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
           <div className="space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Minum ASI sampai usia</label>
             <input type="text" value={formData.birth.delivery.breastfeedingUntil} onChange={(e) => handleInputChange('birth', 'breastfeedingUntil', e.target.value, 'delivery')} className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3"/>
           </div>
        </div>
      </div>
    </div>
  );

  const renderTingkahLaku = () => (
    <div className="space-y-6">
      <div className="p-4 bg-[#1c222d] border border-white/10 rounded-2xl">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Pengamatan Tingkah Laku</h3>
        <p className="text-xs text-gray-400 mb-6 italic">Berikan jawaban 'Ya' atau 'Tidak' pada pernyataan berikut sesuai pengamatan sehari-hari.</p>
        
        <div className="space-y-2">
          {[
            "1. Ananda tidak suka disentuh, terutama bila gerakannya tiba-tiba menjadi gelisah dan terganggu bila dalam situasi ramai dan mengurung diri/mengucilkan diri dari lingkungan.",
            "2. Ananda mencari kontak fisik secara berlebihan (misalnya sangat senang dipeluk erat-erat, menabrakkan diri ke dinding atau orang lain).",
            "3. Ananda sangat mudah geli (bila disentuh menggunakan jenis bahan pakaian tertentu).",
            "4. Keseimbangan tubuh ananda tergolong buruk (mudah sekali jatuh atau tersandung).",
            "5. Ananda mengalami kesulitan untuk menaiki atau menuruni tangga.",
            "6. Ananda seringkali meletakkan kepala di tangan (berpangku tangan) ketika membaca atau menulis.",
            "7. Ananda ketakutan atau menolak untuk mengikuti aktivitas yang bergerak cepat di taman bermain (misalnya ayunan, jungkat-jungkit, trampolin).",
            "8. Ananda memilih kegiatan fisik yang bergerak cepat tanpa merasa pusing atau terlihat lebih kuat dibandingkan anak sebayanya.",
            "9. Ananda mengalami kesulitan untuk menggunakan ketrampilan tangan (misalnya menggunakan gunting, memegang krayon, atau pensil, mengancingkan baju) dan/atau ada masalah dengan tulisan tangannya.",
            "10. Ananda terlihat ceroboh dan mudah sekali celaka, seringkali jatuh atau terbentur sesuatu.",
            "11. Ananda menggerakkan bagian tubuh yang tidak perlu (misalnya menjulurkan lidah, memainkan jari, menyembunyikan rahang) ketika melakukan aktivitas fisik.",
            "12. Posisi berdiri dan duduk ananda terlihat tidak tegap.",
            "13. Ananda memegang benda dengan sangat kuat.",
            "14. Cara ananda memegang benda terlihat lemah atau tidak kuat.",
            "15. Ananda mudah sekali merasa lelah.",
            "16. Ananda merasa takut atau terganggu bila mendengar suara keras.",
            "17. Ananda sulit memusatkan perhatiannya bila ada suara berisik.",
            "18. Ananda seringkali berteriak atau berbicara dengan suara yang keras.",
            "19. Ananda tidak paham bila diberikan instruksi secara verbal.",
            "20. Bila harus mengerjakan sesuatu, maka perintah yang diberikan seringkali harus diulang.",
            "21. Ananda mengalami kesulitan membedakan bentuk atau warna.",
            "22. Ananda mengalami kesulitan untuk mengarahkan pandangan pada suatu benda bergerak.",
            "23. Ananda seringkali mengusap mata, merasa pusing atau matanya berair setelah membaca.",
            "24. Ananda mengalami kebingungan atau terbalik-balik dalam mengenali angka, huruf, atau kata.",
            "25. Ananda merasa kesulitan bila mengikuti instruksi tertulis.",
            "26. Ananda mengalami kesulitan untuk menyalin tulisan dari papan tulis atau buku.",
            "27. Ananda sangat sensitif terhadap bau-bauan tertentu.",
            "28. Ananda selalu bergerak atau terlihat selalu bersemangat.",
            "29. Ananda seringkali implusif atau memberikan respon sebelum selesai pertanyaan atau perintah.",
            "30. Ananda mengalami kesulitan untuk mengatur atau merencanakan aktivitasnya."
          ].map((q, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/20 rounded-xl gap-4 border border-transparent hover:border-primary/20 transition-all">
              <span className="text-xs text-gray-300 font-medium leading-relaxed md:max-w-2xl">{q}</span>
              <div className="flex gap-2">
                 {['Ya', 'Tidak'].map((choice) => (
                   <button 
                     key={choice}
                     onClick={() => handleInputChange('behavior', `q${idx+1}`, choice)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.behavior[`q${idx+1}`] === choice ? (choice === 'Ya' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-600 text-white') : 'bg-[#2a313d] text-gray-500 hover:bg-[#343b49]'}`}
                   >{choice}</button>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerkembangan = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-amber-500 pl-4">Kemandirian Makan-Minum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">a. Masih disuapi?</label>
             <div className="flex gap-2">
               {['Ya', 'Tidak'].map(v => (
                 <button key={v} onClick={() => handleInputChange('development', 'fedBy', v, 'feeding')} className={`px-4 py-2 rounded-xl border text-xs font-bold ${formData.development.feeding.fedBy === v ? 'bg-amber-500 border-amber-500 text-white' : 'border-white/10 text-gray-500'}`}>{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">b. Anak makan dengan?</label>
             <select 
               value={formData.development.feeding.eatsWith}
               onChange={(e) => handleInputChange('development', 'eatsWith', e.target.value, 'feeding')} 
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold"
             >
               <option value="">Pilih...</option>
               <option value="Dibantu">Dibantu</option>
               <option value="Sendiri dan Rapi">Sendiri dan Rapi</option>
               <option value="Berantakan">Sendiri dan Berantakan</option>
             </select>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">c. Jika lapar, makanan?</label>
             <select 
               value={formData.development.feeding.hungerSignal}
               onChange={(e) => handleInputChange('development', 'hungerSignal', e.target.value, 'feeding')} 
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold"
             >
               <option value="">Pilih...</option>
               <option value="Disodorkan">Disodorkan</option>
               <option value="Minta kemudian dibantu">Minta kemudian dibantu</option>
               <option value="Minta dan Bantu Sendiri">Minta dan Bantu Sendiri</option>
               <option value="Ambil Sendiri">Ambil Sendiri</option>
             </select>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">d. Sukar untuk duduk sendiri saat makan?</label>
             <div className="flex gap-2">
               {['Ya', 'Kadang-kadang', 'Tidak'].map(v => (
                 <button key={v} onClick={() => handleInputChange('development', 'difficultySitting', v, 'feeding')} className={`px-4 py-2 rounded-xl border text-[10px] font-bold ${formData.development.feeding.difficultySitting === v ? 'bg-amber-500 border-amber-500 text-white' : 'border-white/10 text-gray-500'}`}>{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">e. Posisi makan menyulitkan masukkan makanan?</label>
             <div className="flex gap-2">
               {['Ya', 'Tidak'].map(v => (
                 <button key={v} onClick={() => handleInputChange('development', 'difficultPositions', v, 'feeding')} className={`px-4 py-2 rounded-xl border text-[10px] font-bold ${formData.development.feeding.difficultPositions === v ? 'bg-amber-500 border-amber-500 text-white' : 'border-white/10 text-gray-500'}`}>{v}</button>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-rose-500 pl-4">Kesukaan & Kebiasaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Minuman yang disukai</label>
             <div className="flex flex-wrap gap-2 pt-2">
               {['Susu', 'Teh/Sirup', 'Air Putih'].map(v => (
                 <label key={v} className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={formData.development.preferences.drinks.includes(v)}
                     onChange={() => handleCheckboxChange('development', 'drinks', v, 'preferences')}
                     className="rounded bg-white/5 border-white/10 text-primary" 
                   /> {v}
                 </label>
               ))}
             </div>
           </div>
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Suka Buah-buahan?</label>
             <select 
               value={formData.development.preferences.fruits}
               onChange={(e) => handleInputChange('development', 'fruits', e.target.value, 'preferences')} 
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 text-sm"
             >
               <option value="">Pilih...</option>
               <option value="Suka">Suka</option>
               <option value="Kadang-kadang">Kadang-kadang</option>
               <option value="Tidak Suka">Tidak Suka</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rasa yang disukai</label>
             <div className="flex gap-2 pt-2">
               {['Manis', 'Asin'].map(v => (
                 <button key={v} onClick={() => handleInputChange('development', 'favoriteTaste', v, 'preferences')} className={`px-4 py-2 rounded-xl border text-xs font-bold ${formData.development.preferences.favoriteTaste === v ? 'bg-rose-500 border-rose-500' : 'border-white/10 text-gray-500'}`}>{v}</button>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderKesehatan = () => (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
          <p className="text-xs text-emerald-200/80 font-medium">Centang penyakit/kondisi yang pernah dialami ananda.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          "Campak", "Campak Jerman", "Pendengaran", "Cacar air", "Cedera kepala", "Patah tulang",
          "Operasi", "Infeksi telinga", "Batuk kering", "Difteri", "Meningitis", "Diare",
          "Demam berdarah", "Asthma", "TBC", "Hepatitis", "Tetanus", "Kejang", "Epilepsi", "Anemia"
        ].map(item => (
          <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${formData.health.illnesses.includes(item) ? 'bg-emerald-500/20 border-emerald-500' : 'bg-black/20 border-white/5 hover:border-emerald-500/30'}`}>
            <input 
              type="checkbox" 
              checked={formData.health.illnesses.includes(item)}
              onChange={() => handleCheckboxChange('health', 'illnesses', item)}
              className="w-4 h-4 rounded bg-[#1c222d] border-white/10 text-emerald-500" 
            />
            <span className={`text-xs transition-colors ${formData.health.illnesses.includes(item) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-12">
      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-blue-500 pl-4">Kemandirian Harian (Dapat dilakukan sendiri)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            "Mandi", "BAK", "BAB", "Keramas", "Gosok Gigi", "Mencuci Tangan", "Mencuci Kaki",
            "Memakai Baju", "Mengancingkan Baju", "Memasang Restluiting", "Memakai Kaos Kaki",
            "Menalikan Sepatu", "Mengambil Minum", "Mengambil Makan"
          ].map(item => (
            <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.social.independence.includes(item) ? 'bg-blue-500/20 border-blue-500' : 'bg-black/20 border-white/5 hover:border-blue-500/30'}`}>
              <input 
                type="checkbox" 
                checked={formData.social.independence.includes(item)}
                onChange={() => handleCheckboxChange('social', 'independence', item)}
                className="rounded bg-[#1c222d] border-white/10 text-blue-500" 
              />
              <span className={`text-[10px] uppercase font-bold transition-colors ${formData.social.independence.includes(item) ? 'text-white' : 'text-gray-400'}`}>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-indigo-500 pl-4">Sosialisasi & Bermain</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.2.1. Apakah ananda pemalu?</label>
             <div className="flex flex-wrap gap-2">
               {['Tidak Pemalu', 'Pemalu', 'Sangat Pemalu'].map(v => (
                 <button 
                   key={v} 
                   onClick={() => handleInputChange('social', 'shyness', v, 'sociability')}
                   className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.social.sociability.shyness === v ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.2.2. Senang permainan kelompok?</label>
             <div className="flex flex-wrap gap-2">
               {['Ya', 'Kadang-kadang', 'Seringkali'].map(v => (
                 <button 
                  key={v} 
                  onClick={() => handleInputChange('social', 'groupPlay', v, 'sociability')}
                  className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.social.sociability.groupPlay === v ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.2.3. Siapa teman bermainnya?</label>
             <div className="grid grid-cols-1 gap-2">
               {['Anak sebayanya', 'Lebih muda dari usianya', 'Lebih tua dari usianya', 'Dengan orang dewasa'].map(v => (
                 <button 
                  key={v} 
                  onClick={() => handleInputChange('social', 'bestFriend', v, 'sociability')}
                  className={`px-4 py-2 rounded-xl border text-left text-[10px] font-bold uppercase tracking-widest transition-all ${formData.social.sociability.bestFriend === v ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.2.4. Dimana senang bermain?</label>
             <div className="grid grid-cols-1 gap-2">
               {['Dalam rumah / kamar', 'Luar rumah / halaman', 'Seimbang'].map(v => (
                 <button 
                  key={v} 
                  onClick={() => handleInputChange('social', 'playLocation', v, 'sociability')}
                  className={`px-4 py-2 rounded-xl border text-left text-[10px] font-bold uppercase tracking-widest transition-all ${formData.social.sociability.playLocation === v ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >{v}</button>
               ))}
             </div>
           </div>
           <div className="space-y-3 md:col-span-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.2.6. Sebutkan permainan favorit ananda</label>
             <textarea 
               value={formData.social.sociability.favoriteGames}
               onChange={(e) => handleInputChange('social', 'favoriteGames', e.target.value, 'sociability')}
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24"
               placeholder="Contoh: Main boneka, Mobil-mobilan..."
             />
           </div>
        </div>
      </section>
    </div>
  );

  const renderKebiasaanBelajar = () => (
    <div className="space-y-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">6.1. Lama Belajar</label>
             <div className="grid grid-cols-1 gap-2">
                {[
                  'Kurang dari 15 menit', 
                  '5 - 10 menit', 
                  '11 - 20 menit', 
                  '20 - 30 menit', 
                  'Tidak tentu, tergantung tugas sekolah',
                  'Tidak tentu, tergantung keinginan ananda'
                ].map(v => (
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.learning.duration === v ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}>
                    <input 
                      type="radio" 
                      name="learningDuration"
                      checked={formData.learning.duration === v}
                      onChange={() => handleInputChange('learning', 'duration', v)}
                      className="w-4 h-4 rounded-full bg-[#1c222d] border-white/10 text-primary" 
                    />
                    <span className={`text-xs transition-colors ${formData.learning.duration === v ? 'text-white' : 'text-gray-400'}`}>{v}</span>
                  </label>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">6.3. Materi Belajar</label>
             <div className="grid grid-cols-1 gap-2">
                {['PR besok', 'Ulangan besok', 'Materi lain', 'PR baru ditugaskan', 'Tergantung keinginan ananda'].map(v => (
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.learning.matter.includes(v) ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.learning.matter.includes(v)}
                      onChange={() => handleCheckboxChange('learning', 'matter', v)}
                      className="rounded bg-[#1c222d] border-white/10 text-primary" 
                    />
                    <span className={`text-xs transition-colors ${formData.learning.matter.includes(v) ? 'text-white' : 'text-gray-400'}`}>{v}</span>
                  </label>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">6.4. Jadwal Belajar</label>
             <div className="grid grid-cols-1 gap-2">
                {[
                  'Memiliki jadwal tetap', 
                  'Tergantung kebutuhan', 
                  'Tergantung keinginan ananda', 
                  'Belum memiliki jadwal tetap'
                ].map(v => (
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.learning.schedule === v ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}>
                    <input 
                      type="radio" 
                      name="learningSchedule"
                      checked={formData.learning.schedule === v}
                      onChange={() => handleInputChange('learning', 'schedule', v)}
                      className="w-4 h-4 rounded-full bg-[#1c222d] border-white/10 text-primary" 
                    />
                    <span className={`text-xs transition-colors ${formData.learning.schedule === v ? 'text-white' : 'text-gray-400'}`}>{v}</span>
                  </label>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">6.6. Kemandirian Belajar</label>
             <div className="grid grid-cols-1 gap-2">
                {[
                  'Berinisiatif sendiri', 
                  'Harus diingatkan orang lain', 
                  'Harus ditemani orang lain', 
                  'Harus dijanjikan sesuatu',
                  'Harus dipaksa'
                ].map(v => (
                  <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.learning.independence === v ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}>
                    <input 
                      type="radio" 
                      name="learningInd"
                      checked={formData.learning.independence === v}
                      onChange={() => handleInputChange('learning', 'independence', v)}
                      className="w-4 h-4 rounded-full bg-[#1c222d] border-white/10 text-primary" 
                    />
                    <span className={`text-xs transition-colors ${formData.learning.independence === v ? 'text-white' : 'text-gray-400'}`}>{v}</span>
                  </label>
                ))}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">6.2. Waktu belajar pukul?</label>
            <input 
               type="text" 
               value={formData.learning.time}
               onChange={(e) => handleInputChange('learning', 'time', e.target.value)}
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3" 
               placeholder="Contoh: 19:00 WIB"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">6.5. Tempat belajar umumya?</label>
            <input 
               type="text" 
               value={formData.learning.location}
               onChange={(e) => handleInputChange('learning', 'location', e.target.value)}
               className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3" 
               placeholder="Contoh: Meja belajar di kamar"
            />
          </div>
       </div>
    </div>
  );

  const renderEmosi = () => (
    <div className="space-y-12 pb-12">
      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-pink-500 pl-4">10. Perkembangan Emosi</h3>
        <div className="space-y-4">
           {[
             { id: 'happyWhat', label: '10.1. Hal-hal apa yang biasanya membuat ananda merasa senang?' },
             { id: 'happyHow', label: '10.2. Bagaimana ananda mengungkapkan perasaan senang tersebut?' },
             { id: 'sadWhat', label: '10.3. Hal-hal apa yang biasanya membuat ananda merasa sedih?' },
             { id: 'sadHow', label: '10.4. Bagaimana ananda mengungkapkan perasaan sedih tersebut?' },
             { id: 'angryWhat', label: '10.5. Hal-hal apa yang membuat ananda marah?' },
             { id: 'angryHow', label: '10.6. Bagaimana ananda mengungkapkan perasaan marah tersebut?' },
           ].map(f => (
             <div key={f.id} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{f.label}</label>
                <textarea 
                   value={formData.emotion.emotions[f.id] || ''}
                   onChange={(e) => handleInputChange('emotion', f.id, e.target.value, 'emotions')}
                   className="w-full bg-[#1c222d] border border-white/10 rounded-xl px-4 py-3 h-20 text-sm focus:ring-2 focus:ring-pink-500 outline-none" 
                />
             </div>
           ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-indigo-500 pl-4">Penyesuaian Sosial (Bagian 9)</h3>
        <div className="space-y-6">
           {[
             { field: 'newEnv', q: "9.1. Penyesuaian diri ananda saat masuk lingkungan baru?", options: ['Berinisiatif interaksi nyaman', 'Berinisiatif interaksi', 'Melihat dulu baru berinisiatif', 'Baru interaksi saat diminta', 'Tidak tertarik / senang sendiri'] },
             { field: 'newTask', q: "9.2. Penyesuaian ananda dengan tugas baru?", options: ['Langsung berusaha', 'Banyak bertanya di awal', 'Harus melihat contoh dahulu', 'Harus melihat teman lain', 'Harus ada pendamping', 'Menolak / tidak tertarik'] },
             { field: 'rules', q: "9.3. Penyesuaian diri ananda dengan aturan baru?", options: ['Langsung mentaati', 'Mentaati jika dijelaskan dampak', 'Mentaati jika dijanjikan sesuatu', 'Mentaati jika menerima dampak negatif'] }
           ].map((item, idx) => (
             <div key={idx} className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                <p className="text-sm font-bold text-gray-300">{item.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {item.options.map(c => (
                     <button 
                       key={c} 
                       onClick={() => handleInputChange('emotion', item.field, c, 'socialAdjustment')}
                       className={`px-4 py-2 text-left rounded-xl text-[10px] font-bold border transition-all ${formData.emotion.socialAdjustment[item.field] === c ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                     >{c}</button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-amber-500 pl-4">Perilaku Khusus (Bagian 10.7 - 10.14)</h3>
        <div className="space-y-4">
           {[
             { field: 'differentFromPeers', q: "10.7. Perilaku yang tidak diharapkan / berbeda dengan anak sebayanya?" },
             { field: 'quiet', q: "10.8. Sangat pendiam, tidak bersemangat, tertekan, atau sering berubah semangat?" },
             { field: 'distractible', q: "10.9. Sulit memusatkan perhatian atau bersikap gelisah?" },
             { field: 'interferesOthers', q: "10.10. Perilaku mengganggu saudara atau teman sebaya?" },
             { field: 'schoolIssues', q: "10.12. Masalah perilaku / emosional / akademik di sekolah?" },
             { field: 'PhysicalIssues', q: "10.14. Memiliki kendala fisik dan/atau kesehatan?" }
           ].map((item, idx) => (
             <div key={idx} className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                <p className="text-sm font-medium text-gray-300">{item.q}</p>
                <div className="flex gap-3">
                   {['Tidak', 'Kadang-kadang', 'Ya (Jelaskan)'].map(c => (
                     <button 
                       key={c} 
                       onClick={() => handleInputChange('emotion', item.field, c, 'additional')}
                       className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${formData.emotion.additional[item.field] === c ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                     >{c}</button>
                   ))}
                </div>
                {(formData.emotion.additional[item.field] === 'Ya (Jelaskan)' || formData.emotion.additional[item.field] === 'Kadang-kadang') && (
                  <textarea 
                    value={formData.emotion.additional[`${item.field}Desc`] || ''}
                    onChange={(e) => handleInputChange('emotion', `${item.field}Desc`, e.target.value, 'additional')}
                    placeholder="Jelaskan lebih lanjut..." 
                    className="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 h-20 text-sm" 
                  />
                )}
             </div>
           ))}
        </div>
      </section>
    </div>
  );

  const renderSensoryProfile = () => (
    <div className="space-y-12 pb-12">
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 leading-relaxed font-medium">
          Profil Sensory membantu kami memahami bagaimana ananda memproses informasi dari lingkungan. Isilah setiap pernyataan dengan frekuensi yang paling sesuai.
        </p>
      </div>

      {sensorySections.map((section) => (
        <section key={section.id} className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-primary pl-4">
            {section.title}
          </h3>
          <div className="space-y-2">
            {section.questions.map((q, qIdx) => {
              const questionId = `${section.id}${qIdx + 1}`;
              return (
                <div key={questionId} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/20 rounded-xl gap-4 border border-transparent hover:border-primary/20 transition-all">
                  <span className="text-xs text-gray-300 font-medium leading-relaxed md:max-w-xl">
                    {qIdx + 1}. {q}
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {sensoryOptions.map((choice) => (
                      <button 
                        key={choice}
                        onClick={() => handleInputChange('sensoryProfile', questionId, choice)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all ${formData.sensoryProfile[questionId] === choice ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[#2a313d] text-gray-500 hover:bg-[#343b49]'}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );

  const renderObservation = () => (
    <div className="space-y-12 pb-12">
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 leading-relaxed font-medium">
          Lembar observasi ini berkaitan dengan kemampuan Bicara, Bahasa, dan Motorik ananda. Pilih 'Mampu' jika ananda sudah dapat melakukannya, atau 'Tidak Mampu' jika belum.
        </p>
      </div>

      <section className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tighter text-white border-l-4 border-primary pl-4">
          LEMBAR OBSERVASI BICARA, BAHASA DAN MOTORIK
        </h3>
        <div className="space-y-2">
          {observationQuestions.map((q, idx) => {
            const questionId = `obs${idx + 1}`;
            return (
              <div key={questionId} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/20 rounded-xl gap-4 border border-transparent hover:border-primary/20 transition-all">
                <span className="text-xs text-gray-300 font-medium leading-relaxed md:max-w-xl">
                  {idx + 1}. {q}
                </span>
                <div className="flex gap-2">
                  {['Mampu', 'Tidak Mampu'].map((choice) => (
                    <button 
                      key={choice}
                      onClick={() => handleInputChange('observation', questionId, choice)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.observation[questionId] === choice ? (choice === 'Mampu' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20') : 'bg-[#2a313d] text-gray-500 hover:bg-[#343b49]'}`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderSuccess = () => (
    <div className="py-12 text-center space-y-6">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>
      
      <div className="space-y-3 max-w-lg mx-auto">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Pendaftaran Terkirim!</h2>
        <p className="text-gray-300 font-medium leading-relaxed text-xs">
          Terima kasih atas pengisian data pendaftaran. Data Ananda telah berhasil kami rekam secara lengkap dan terhubung langsung ke sistem Pusat Terapi Pelangi Lazuardi.
        </p>
      </div>

      {submittedRecord && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Nomor Registrasi:</span>
            <span className="font-mono font-black text-primary text-sm">{submittedRecord.registrationNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-semibold">Nama Ananda:</span>
            <span className="font-black text-white">{submittedRecord.childName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-semibold">Layanan Diminati:</span>
            <span className="font-bold text-emerald-400">{submittedRecord.selectedService}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-semibold">Status Pendaftaran:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Registrasi Baru (Menunggu Follow Up)
            </span>
          </div>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
         <button 
           onClick={() => setIsPdfModalOpen(true)}
           className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
         >
           <FileText className="w-4 h-4" />
           <span>Unduh / Cetak Hasil PDF Registrasi</span>
         </button>
         <button 
           onClick={onBack}
           className="w-full sm:w-auto px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer"
         >
           Kembali ke Beranda
         </button>
      </div>

      {isPdfModalOpen && submittedRecord && (
        <RegistrationPrintPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          record={submittedRecord}
          logoUrl={logoUrl}
        />
      )}
    </div>
  );

  const renderConfirm = () => (
    <div className="py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">Konfirmasi Data</h2>
        <p className="text-gray-400 font-medium">Apakah Anda yakin data yang diisi sudah sesuai?</p>
      </div>

      <div className="bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-6 bg-white/5 border-b border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary">Ringkasan Pendaftaran</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nama Lengkap</span>
                <span className="text-sm font-bold text-white">{formData.child.fullName || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asal Sekolah</span>
                <span className="text-sm font-bold text-white">{formData.child.school || '-'}</span>
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Orang Tua / Wali</span>
                <span className="text-sm font-bold text-white">{formData.family.father.name || formData.family.mother.name || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No. Telepon</span>
                <span className="text-sm font-bold text-white">{formData.child.phone || formData.family.father.phone || formData.family.mother.phone || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alamat Rumah</span>
                <span className="text-sm font-bold text-white truncate">{formData.child.address || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sumber Informasi Klien</span>
                <span className="text-sm font-bold text-primary">
                  {formData.referralSource === 'dll' 
                    ? (formData.referralSourceOther ? `Lainnya (${formData.referralSourceOther})` : 'Lainnya (dll)') 
                    : (formData.referralSource || 'Instagram')}
                </span>
              </div>
           </div>
        </div>
      </div>

      {/* Pilihan Sumber Informasi Klien Sebelum Kirim */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-[#161b24] to-slate-900 border-2 border-primary/40 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>Mendapatkan Informasi Pelangi / Sumber Informasi Klien Dari</span>
              <span className="text-rose-400 text-sm">*</span>
            </h3>
            <p className="text-xs text-gray-300">
              Mohon pilih dari mana Anda mengetahui informasi mengenai Pelangi Lazuardi sebelum mengirim pendaftaran.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { id: 'Instagram', label: 'Instagram', icon: '📸', desc: 'Media Sosial' },
            { id: 'Website', label: 'Website', icon: '🌐', desc: 'Situs Resmi' },
            { id: 'Google', label: 'Google', icon: '🔍', desc: 'Pencarian Web' },
            { id: 'Referensi', label: 'Referensi', icon: '👥', desc: 'Teman / Kerabat' },
            { id: 'dll', label: 'dll', icon: '✍️', desc: 'Lainnya' },
          ].map((item) => {
            const isSelected = formData.referralSource === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    referralSource: item.id,
                    referral: {
                      ...prev.referral,
                      source: item.id === 'dll' ? (prev.referralSourceOther || 'Lainnya') : item.id
                    }
                  }));
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group active:scale-95 ${
                  isSelected
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30 font-bold scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-primary/50 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                <span className="text-[10px] opacity-70 hidden sm:block">{item.desc}</span>
              </button>
            );
          })}
        </div>

        {formData.referralSource === 'dll' && (
          <div className="pt-2 animate-fade-in-up">
            <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1.5">
              Sebutkan Sumber Informasi Lainnya (dll):
            </label>
            <input
              type="text"
              value={formData.referralSourceOther || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev: any) => ({
                  ...prev,
                  referralSourceOther: val,
                  referral: {
                    ...prev.referral,
                    source: val || 'Lainnya'
                  }
                }));
              }}
              placeholder="Contoh: Rekomendasi Dokter Spesialis Anak, Brosur, Event Sekolah, dll..."
              className="w-full bg-[#11141b] border border-primary/50 focus:border-primary rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <button 
          onClick={() => setShowConfirm(false)}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
        >
          Periksa Kembali
        </button>
        <button 
          onClick={() => {
            const finalSource = formData.referralSource === 'dll'
              ? (formData.referralSourceOther?.trim() || 'Lainnya')
              : (formData.referralSource || 'Instagram');

            const payload = {
              ...formData,
              referralSource: finalSource,
              referral: {
                ...formData.referral,
                source: finalSource
              }
            };

            const savedRec = onSubmit(payload);
            const rec = savedRec || convertGuestDataToRegistration(payload, 0);
            setSubmittedRecord(rec);
            setIsSubmitted(true);
            setShowConfirm(false);
          }}
          className="px-12 py-4 bg-primary rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-white"
        >
          Ya, Kirim Sekarang
        </button>
      </div>
    </div>
  );

  const renderActiveStep = () => {
    if (isSubmitted) return renderSuccess();
    if (showConfirm) return renderConfirm();
    
    // Only render the steps that are visible for the current selection
    const stepsToRender = [
      renderIdentitas,
      renderDataKeluarga,
      renderKelahiran,
      renderPerkembangan,
      renderKesehatan,
      renderSocial,
      renderTingkahLaku,
      renderKebiasaanBelajar,
      renderEmosi,
      renderRujukan,
      renderSensoryProfile,
      renderObservation
    ];

    return stepsToRender[activeStep]();
  };

  const renderMenuSelection = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <div 
            onClick={triggerLogoInput}
            className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl p-4 border border-white/10 cursor-pointer group hover:bg-white/90 transition-colors relative"
          >
            <img src={logoUrl || "https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png"} alt="Logo" className="w-full h-full object-contain group-hover:opacity-50 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Registrasi Ananda</h1>
          <p className="text-black font-bold uppercase tracking-widest text-xs">Silahkan pilih jenis layanan yang Anda butuhkan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuTypes.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                setSelectedMenu(menu.id);
                setFormData(prev => ({ ...prev, category: menu.title, subCategory: '' }));
              }}
              className={`group relative p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] text-left transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-2xl ${menu.hoverColor} ${menu.shadowColor} active:scale-95`}
            >
              <div className="relative z-10 space-y-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${menu.color} bg-opacity-20 group-hover:bg-white/20`}>
                  <menu.icon className={`w-7 h-7 text-white transition-colors`} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-white">{menu.title}</h3>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-white/80 mt-2">{menu.description}</p>
                </div>
              </div>
              
              {/* Abstract decorative element */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <menu.icon className="w-32 h-32 text-white" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Kembali ke Beranda</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderPsychologistSelection = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Layanan Psikologi</h2>
          <p className="text-black font-bold uppercase tracking-widest text-xs">Pilih sub-menu layanan psikologi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {psychologistMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                setPsychologistSubMenu(menu.id);
                setSelectedMenu('REGISTER_PSIKOLOG'); // Change to a distinct state to start form
                setFormData(prev => ({ ...prev, category: 'Psikolog', subCategory: menu.title }));
              }}
              className={`p-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl text-left transition-all group active:scale-95 shadow-xl ${menu.hoverColor} hover:border-transparent`}
            >
              <h3 className="text-sm font-black uppercase tracking-tighter text-white group-hover:text-white transition-colors">{menu.title}</h3>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1 group-hover:text-white/80">{menu.description}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => setSelectedMenu(null)}
            className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Ganti Jenis Layanan</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (!selectedMenu) {
    return (
      <div className="min-h-screen login-gradient relative overflow-hidden flex flex-col">
        <div className="blob w-96 h-96 bg-primary top-10 left-10" style={{animationDelay: '2s'}}></div>
        <div className="blob w-72 h-72 bg-secondary bottom-10 right-10"></div>
        {renderMenuSelection()}
      </div>
    );
  }

  if (selectedMenu === 'PSIKOLOG') {
    return (
      <div className="min-h-screen login-gradient relative overflow-hidden flex flex-col">
        <div className="blob w-96 h-96 bg-primary top-10 left-10" style={{animationDelay: '2s'}}></div>
        <div className="blob w-72 h-72 bg-secondary bottom-10 right-10"></div>
        {renderPsychologistSelection()}
      </div>
    );
  }

  // Map internal "REGISTER_PSIKOLOG" back to "PSIKOLOG" for visible step logic
  const actualMenuType = selectedMenu === 'REGISTER_PSIKOLOG' ? 'PSIKOLOG' : selectedMenu;
  const menuTitle = menuTypes.find(m => m.id === selectedMenu)?.title || 
                    (selectedMenu === 'REGISTER_PSIKOLOG' ? psychologistMenus.find(p => p.id === psychologistSubMenu)?.title : '');

  return (
    <div className="min-h-screen login-gradient relative overflow-hidden text-white selection:bg-primary selection:text-white">
      <div className="blob w-96 h-96 bg-primary top-10 left-10" style={{animationDelay: '2s'}}></div>
      <div className="blob w-72 h-72 bg-secondary bottom-10 right-10"></div>
      {/* Sidebar Stepper */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-80 bg-[#11141b]/90 backdrop-blur-md border-r border-white/5 flex-col p-8 z-30">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors mb-12 group"
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Batal</span>
        </button>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2">
          {!isSubmitted && !showConfirm && (
            <>
              {/* Group 1: Identitas Anak */}
              <div className="space-y-1">
                <div className="px-4 py-2 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-primary rounded-full" />
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-white">1. Identitas Anak (Langkah 1)</h3>
                </div>
                {currentSteps.slice(0, 9).map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${activeStep === idx ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white/5'}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeStep === idx ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Langkah 1</p>
                      <p className={`text-[10px] font-black uppercase tracking-tighter ${activeStep === idx ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Remaining Steps (Only for Assessment types) */}
              {selectedMenu !== 'REGISTER_PSIKOLOG' && (
                <div className="space-y-1 pt-4 border-t border-white/5">
                  {currentSteps.slice(9).map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx + 9)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeStep === (idx + 9) ? 'bg-primary text-white shadow-2xl shadow-primary/20' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeStep === (idx + 9) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Langkah {idx + 2}</p>
                        <p className={`text-xs font-black uppercase tracking-tighter ${activeStep === (idx + 9) ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 p-4 bg-primary/10 rounded-2xl border border-primary/20">
           <div className="flex gap-3 items-center mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Status Pengisian</p>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(activeStep + 1) / currentSteps.length * 100}%` }}
                 className="h-full bg-primary"
               />
           </div>
           <p className="text-[10px] text-gray-500 mt-2 font-medium">Lengkap {Math.round((activeStep + 1) / currentSteps.length * 100)}%</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen flex flex-col relative z-10">
        {/* Header (Sticky) */}
        <header className="sticky top-0 z-20 bg-black/20 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="lg:hidden">
                    <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                       <FileText className="w-6 h-6 text-primary" />
                       {menuTitle} {activeStep < currentSteps.length ? `• ${currentSteps[activeStep].title}` : ''}
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Isilah data ananda dengan lengkap dan akurat</p>
                </div>
            </div>
            
            <div className="hidden sm:flex gap-3">
               {!isSubmitted && !showConfirm && (
                 <>
                   <button 
                     onClick={prevStep}
                     disabled={activeStep === 0}
                     className="px-6 py-2.5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 disabled:opacity-20 transition-all flex items-center gap-2"
                   >
                     <ChevronLeft className="w-4 h-4" /> Kembali
                   </button>
                   <button 
                     onClick={() => {
                       if (activeStep === currentSteps.length - 1) {
                         setShowConfirm(true);
                       } else {
                         nextStep();
                       }
                     }}
                     className="px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                   >
                     {activeStep === currentSteps.length - 1 ? 'Selesai & Kirim' : 'Lanjut'} <ChevronRight className="w-4 h-4" />
                   </button>
                 </>
               )}
            </div>
        </header>

        {/* Form Container */}
        <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
               className="max-w-4xl mx-auto"
             >
                <div className="bg-[#11141b]/80 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-3xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
                   {renderActiveStep()}
                </div>
             </motion.div>
           </AnimatePresence>
        </main>

        {/* Footer (Mobile Only) */}
        <footer className="lg:hidden sticky bottom-0 bg-[#0b0e14] border-t border-white/5 p-4 flex gap-4 z-20">
            {!isSubmitted && !showConfirm && (
              <>
                <button 
                    onClick={prevStep}
                    disabled={activeStep === 0}
                    className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 disabled:opacity-20 font-black uppercase tracking-widest text-[10px]"
                >Kembali</button>
                <button 
                    onClick={() => {
                      if (activeStep === currentSteps.length - 1) {
                        setShowConfirm(true);
                      } else {
                        nextStep();
                      }
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px]"
                >{activeStep === currentSteps.length - 1 ? 'Selesai & Kirim' : 'Lanjut'}</button>
              </>
            )}
        </footer>
      </div>
    </div>
  );
};

export default GuestRegistrationPage;
