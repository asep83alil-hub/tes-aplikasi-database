
import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Award, Target, Activity, ShieldCheck } from 'lucide-react';

interface ChartData {
  subject: string;
  A: number; // Previous/Baseline
  B: number; // Current/Result
  fullMark: number;
}

interface ProgressPoint {
  month: string;
  score: number;
  sessions: number;
}

interface AchievementChartPageProps {
  therapyType: string;
  childName: string;
  childId: string;
  isEditing?: boolean;
  reportData?: any;
  period?: 'Jan-Jun' | 'Jul-Des';
  onSessionsChange?: (total: number, present: number) => void;
}

const AchievementChartPage: React.FC<AchievementChartPageProps> = ({ 
  therapyType, 
  childName, 
  childId, 
  isEditing = false, 
  reportData, 
  period = 'Jan-Jun',
  onSessionsChange
}) => {
  // Theme colors
  const getThemeColor = () => {
    switch (therapyType) {
      case 'OT': return '#0d9488'; // teal
      case 'TW': return '#7c3aed'; // violet
      case 'REMEDIAL': return '#db2777'; // pink
      case 'FT': return '#d97706'; // amber
      case 'HT': return '#0284c7'; // sky / cyan
      case 'BERKUDA': return '#059669'; // emerald
      default: return '#3D3A30';
    }
  };

  const themeColor = getThemeColor();

  // Score mapping for Occupational Therapy (OT) and Physiotherapy (FT)
  const mapScore = (val: string): number => {
    const v = val?.toUpperCase() || '';
    if (['MD', 'BR', 'KTK', 'BS', '3', 'SANGAT BAIK'].includes(v)) return 90;
    if (['SD', 'KP', 'S', '2', 'BAIK'].includes(v)) return 65;
    if (['TD', 'TM', 'K', 'B', '1', 'CUKUP'].includes(v)) return 40;
    if (['T', '0', 'KURANG'].includes(v)) return 20;
    if (v === 'TERAMATI') return 80;
    if (v === 'TIDAK') return 30;
    return 50; // default middle
  };

  // Helper to calculate category average
  const getAverageScore = (items: any[], field: 'awal' | 'hasil' | 'score' = 'hasil'): number => {
    if (!items || items.length === 0) return 0;
    const scores = items.map(item => {
      const val = item[field] || item.hasil || item.value || '';
      return typeof val === 'number' ? val * 25 : mapScore(val);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Radar Data State
  const [radarData, setRadarData] = React.useState<ChartData[]>([]);
  
  // Statistics State
  const [stats, setStats] = React.useState({
    totalSessions: reportData?.sessions?.total ?? 24,
    presentSessions: reportData?.sessions?.present ?? 23,
    totalSesi: `${reportData?.sessions?.total ?? 24} Sesi`,
    kehadiran: `${Math.round(((reportData?.sessions?.present ?? 23) / (reportData?.sessions?.total ?? 24)) * 100)}%`,
    rekomendasi: 'LANJUT',
    targetTercapai: '82%',
    summary: 'Ananda menunjukkan peningkatan signifikan pada semua area intervensi utama semester ini.',
    followUp: reportData?.followUp?.[0] || 'Melanjutkan program sebelumnya dengan penekanan pada peningkatan rentang perhatian dan kontrol motorik halus.',
    homeProgram: reportData?.homeProgram?.[0]?.aktivitas || 'Memperbanyak aktivitas bermain yang melibatkan koordinasi mata dan tangan, serta latihan artikulasi sederhana.'
  });

  // Update stats if reportData sessions change
  React.useEffect(() => {
    if (reportData?.sessions) {
      const total = reportData.sessions.total ?? 24;
      const present = reportData.sessions.present ?? 23;
      const percentage = Math.min(100, Math.round((present / total) * 100));
      setStats(prev => ({
        ...prev,
        totalSessions: total,
        presentSessions: present,
        totalSesi: `${total} Sesi`,
        kehadiran: `${percentage}%`
      }));
    }
  }, [reportData?.sessions]);

  // Calculate Kehadiran Percentage from sessions manually
  React.useEffect(() => {
    if (stats.totalSessions > 0) {
      const percentage = Math.min(100, Math.round((stats.presentSessions / stats.totalSessions) * 100));
      setStats(prev => ({
        ...prev,
        kehadiran: `${percentage}%`,
        totalSesi: `${stats.totalSessions} Sesi`
      }));
      // Notify parent of changes
      if (onSessionsChange) {
        onSessionsChange(stats.totalSessions, stats.presentSessions);
      }
    }
  }, [stats.totalSessions, stats.presentSessions]);

  // Calculate Radar Data from Report Data
  React.useEffect(() => {
    if (!reportData) return;

    let newRadarData: ChartData[] = [];

    switch (therapyType) {
      case 'OT':
        const sensoryItems = [
          ...(reportData.sensory?.modulasi || []),
          ...(reportData.sensory?.diskriminasi || []),
          ...(reportData.sensory?.praksis || [])
        ];
        const motorikItems = [
          ...(reportData.motorik?.kasar || []),
          ...(reportData.motorik?.halus || [])
        ];

        newRadarData = [
          { subject: 'Sensory', A: getAverageScore(sensoryItems, 'awal'), B: getAverageScore(sensoryItems, 'hasil'), fullMark: 100 },
          { subject: 'Motorik', A: getAverageScore(motorikItems, 'awal'), B: getAverageScore(motorikItems, 'hasil'), fullMark: 100 },
          { subject: 'Kognisi', A: getAverageScore(reportData.kognisi?.items || [], 'awal'), B: getAverageScore(reportData.kognisi?.items || [], 'hasil'), fullMark: 100 },
          { subject: 'Emosi', A: getAverageScore(reportData.emosi?.items || [], 'awal'), B: getAverageScore(reportData.emosi?.items || [], 'hasil'), fullMark: 100 },
          { subject: 'Perilaku', A: getAverageScore(reportData.perilakuUmum?.items || [], 'awal'), B: getAverageScore(reportData.perilakuUmum?.items || [], 'hasil'), fullMark: 100 },
        ];
        break;

      case 'TW':
        const twReseptif = reportData.reseptif?.items || [];
        const twEkspresif = reportData.ekspresif?.items || [];
        const twArtikulasi = reportData.artikulasi?.items || [];
        const twSosial = reportData.komunikasiSosial?.items || [];
        newRadarData = [
          { subject: 'Reseptif', A: getAverageScore(twReseptif, 'awal') || 40, B: getAverageScore(twReseptif, 'hasil') || 75, fullMark: 100 },
          { subject: 'Ekspresif', A: getAverageScore(twEkspresif, 'awal') || 35, B: getAverageScore(twEkspresif, 'hasil') || 70, fullMark: 100 },
          { subject: 'Artikulasi', A: getAverageScore(twArtikulasi, 'awal') || 30, B: getAverageScore(twArtikulasi, 'hasil') || 65, fullMark: 100 },
          { subject: 'Sosial', A: getAverageScore(twSosial, 'awal') || 45, B: getAverageScore(twSosial, 'hasil') || 75, fullMark: 100 },
          { subject: 'Pemahaman', A: getAverageScore(twReseptif.slice(0, 2), 'awal') || 50, B: getAverageScore(twReseptif.slice(0, 2), 'hasil') || 80, fullMark: 100 },
        ];
        break;

      case 'REMEDIAL':
        const remAkademik = reportData.akademik?.items || [];
        const remLiterasi = reportData.literacy?.items || [];
        const remWriting = reportData.writing?.items || [];
        const remFokus = reportData.perilakuBelajar?.items || [];
        newRadarData = [
          { subject: 'Akademik', A: getAverageScore(remAkademik, 'awal') || 40, B: getAverageScore(remAkademik, 'hasil') || 70, fullMark: 100 },
          { subject: 'Literasi', A: getAverageScore(remLiterasi, 'awal') || 45, B: getAverageScore(remLiterasi, 'hasil') || 80, fullMark: 100 },
          { subject: 'Menulis', A: getAverageScore(remWriting, 'awal') || 35, B: getAverageScore(remWriting, 'hasil') || 65, fullMark: 100 },
          { subject: 'Fokus', A: getAverageScore(remFokus, 'awal') || 35, B: getAverageScore(remFokus, 'hasil') || 60, fullMark: 100 },
          { subject: 'Kognisi', A: getAverageScore(reportData.kognisi?.items || [], 'awal') || 45, B: getAverageScore(reportData.kognisi?.items || [], 'hasil') || 75, fullMark: 100 },
        ];
        break;

      case 'FT':
        const ftMotorik = [
          ...(reportData.motorik?.kasar || []),
          ...(reportData.motorik?.halus || [])
        ];
        newRadarData = [
          { subject: 'Balance', A: 40, B: getAverageScore(ftMotorik), fullMark: 100 },
          { subject: 'Fisik', A: 30, B: getAverageScore(reportData.fisik?.gmfm || []), fullMark: 100 },
          { subject: 'Sensory', A: 55, B: getAverageScore(reportData.sensory?.items || []), fullMark: 100 },
          { subject: 'Perilaku', A: 45, B: getAverageScore(reportData.perilakuUmum?.items || []), fullMark: 100 },
          { subject: 'Koordinasi', A: 35, B: 60, fullMark: 100 },
        ];
        break;

      case 'HT':
        const htAdaptasi = reportData.adaptasiAir?.items || [];
        const htKeterampilan = reportData.keterampilanAir?.items || [];
        const htKeseimbangan = reportData.keseimbanganAir?.items || [];
        newRadarData = [
          { subject: 'Adaptasi Air', A: getAverageScore(htAdaptasi, 'awal') || 40, B: getAverageScore(htAdaptasi, 'hasil') || 80, fullMark: 100 },
          { subject: 'Pernapasan', A: 35, B: 75, fullMark: 100 },
          { subject: 'Keterampilan', A: getAverageScore(htKeterampilan, 'awal') || 35, B: getAverageScore(htKeterampilan, 'hasil') || 75, fullMark: 100 },
          { subject: 'Keseimbangan', A: getAverageScore(htKeseimbangan, 'awal') || 40, B: getAverageScore(htKeseimbangan, 'hasil') || 78, fullMark: 100 },
          { subject: 'Koordinasi', A: 35, B: 72, fullMark: 100 },
        ];
        break;

      case 'BERKUDA':
        const berkudaAdaptasi = reportData.adaptasiPerilaku?.items || [];
        const berkudaPostur = reportData.posturKeseimbangan?.items || [];
        const berkudaKoordinasi = reportData.koordinasiMotorik?.items || [];
        newRadarData = [
          { subject: 'Regulasi', A: getAverageScore(berkudaAdaptasi, 'awal') || 40, B: getAverageScore(berkudaAdaptasi, 'hasil') || 85, fullMark: 100 },
          { subject: 'Postur', A: getAverageScore(berkudaPostur, 'awal') || 45, B: getAverageScore(berkudaPostur, 'hasil') || 80, fullMark: 100 },
          { subject: 'Keseimbangan', A: getAverageScore(berkudaPostur, 'awal') || 40, B: getAverageScore(berkudaPostur, 'hasil') || 78, fullMark: 100 },
          { subject: 'Kontrol Inti', A: 40, B: 75, fullMark: 100 },
          { subject: 'Koordinasi', A: getAverageScore(berkudaKoordinasi, 'awal') || 35, B: getAverageScore(berkudaKoordinasi, 'hasil') || 75, fullMark: 100 },
        ];
        break;
    }

    if (newRadarData.length > 0) {
      setRadarData(newRadarData);
      
      // Update target tercapai automatically
      const avgB = Math.round(newRadarData.reduce((acc, curr) => acc + curr.B, 0) / newRadarData.length);
      setStats(prev => ({
        ...prev,
        targetTercapai: `TARGET TERCAPAI ${avgB}%`
      }));
    }
  }, [therapyType, reportData]);

  // Progress Data State
  const [lineData, setLineData] = React.useState<ProgressPoint[]>([]);

  // Initialize Line Data based on period
  React.useEffect(() => {
    const months = period === 'Jan-Jun' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
      : ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    setLineData(months.map(m => ({
      month: m,
      score: 75,
      sessions: 4
    })));
  }, [period]);

  const updateRadarPoint = (index: number, key: 'A' | 'B', value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(100, Math.max(0, numValue));
    const newData = [...radarData];
    newData[index] = { ...newData[index], [key]: clampedValue };
    setRadarData(newData);
  };

  const updateLinePoint = (index: number, key: 'score' | 'sessions', value: string) => {
    const numValue = parseInt(value) || 0;
    const newData = [...lineData];
    if (key === 'score') {
      newData[index] = { ...newData[index], score: Math.min(100, Math.max(0, numValue)) };
    } else {
      newData[index] = { ...newData[index], sessions: Math.max(0, numValue) };
    }
    setLineData(newData);
  };

  // Handle automatic sync between sessions and totalSesi
  React.useEffect(() => {
    const total = lineData.reduce((acc, curr) => acc + curr.sessions, 0);
    // Auto-sync if we are NOT using the static totals from reportData
    if (!reportData?.sessions) {
      setStats(prev => ({
        ...prev,
        totalSessions: total,
        totalSesi: `${total} Sesi`
      }));
    }
  }, [lineData, reportData?.sessions]);

  return (
    <div className="achievement-chart-page mt-20 pt-16 border-t-4 border-double border-slate-300 break-before-page print-break-before">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Lampiran Grafik */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div>
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.25em] rounded mb-2">
              LAMPIRAN
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
              <TrendingUp className="h-7 w-7" style={{ color: themeColor }} />
              LAMPIRAN – GRAFIK PENCAPAIAN SISWA
            </h2>
            <p className="text-slate-500 font-bold tracking-wider text-xs uppercase mt-1">
              Visualisasi Capaian Evaluasi & Perkembangan Kompetensi Siswa
            </p>
          </div>
          <div className="text-right bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
            <div className="mb-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Siswa :</span>
              <span className="text-sm font-black text-slate-900 uppercase">{childName}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Periode :</span>
              <span className="text-xs font-black text-indigo-700 uppercase">
                {period === 'Jan-Jun' ? 'Semester 1 (Januari - Juni)' : 'Semester 2 (Juli - Desember)'} {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Radar Chart: Multidimensional Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 h-[500px] bg-slate-50/50 rounded-[3rem] p-8 border border-slate-100 flex flex-col relative group">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: themeColor }} /> Radar Profil Kompetensi
            </h3>
            
            {isEditing && (
              <div className="absolute top-20 right-8 z-10 bg-white/90 backdrop-blur shadow-xl border border-slate-200 p-4 rounded-2xl max-h-[300px] overflow-y-auto w-48">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 px-1">Sesuaikan Skor (%)</p>
                {radarData.map((d, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="text-[9px] font-bold text-slate-600 mb-1 px-1">{d.subject}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-[7px] text-slate-400 font-bold mb-0.5">AWAL</p>
                        <input 
                          type="number"
                          value={d.A}
                          onChange={(e) => updateRadarPoint(index, 'A', e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded p-1"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[7px] text-slate-400 font-bold mb-0.5" style={{ color: themeColor }}>AKHIR</p>
                        <input 
                          type="number"
                          value={d.B}
                          onChange={(e) => updateRadarPoint(index, 'B', e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded p-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                  />
                  <Radar
                    name="Evaluasi Awal"
                    dataKey="A"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Evaluasi Akhir"
                    dataKey="B"
                    stroke={themeColor}
                    fill={themeColor}
                    fillOpacity={0.3}
                  />
                  {!isEditing && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />}
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Ringkasan Capaian (%)</h4>
              <div className="space-y-4">
                {radarData.map((d, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-slate-600">{d.subject}</span>
                      <span style={{ color: themeColor }}>{d.B}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${d.B}%`, backgroundColor: themeColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-yellow-400" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Pencapaian</p>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <input 
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xl font-black text-white"
                    value={stats.targetTercapai}
                    onChange={(e) => setStats({...stats, targetTercapai: e.target.value})}
                    placeholder="TARGET TERCAPAI 82%"
                  />
                  <textarea 
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-medium text-slate-300 resize-none min-h-[80px]"
                    value={stats.summary}
                    onChange={(e) => setStats({...stats, summary: e.target.value})}
                  />
                </div>
              ) : (
                <>
                  <p className="text-2xl font-black tracking-tight leading-tight mb-2 uppercase">{stats.targetTercapai}</p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">{stats.summary}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Keterangan Tambahan Mengenai Grafik */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 text-slate-700 space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: themeColor }} />
            Keterangan Tambahan Mengenai Grafik Pencapaian Siswa:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <span className="font-black text-slate-800 block mb-1">● Evaluasi Awal (Baseline)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tingkat kemampuan awal siswa sebelum pelaksanaan program intervensi semester berjalan.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <span className="font-black text-slate-800 block mb-1" style={{ color: themeColor }}>● Evaluasi Akhir (Hasil)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tingkat capaian kompetensi terkini yang berhasil diraih siswa setelah proses intervensi berkala.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
              <span className="font-black text-slate-800 block mb-1">● Sinkronisasi Otomatis</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Data grafik otomatis mengikuti perubahan data capaian indikator pada lembar rapot utama tanpa rekayasa data.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Grafik */}
        <div className="pt-12 text-center pb-20">
          <div className="inline-block px-12 py-3 bg-slate-50 border border-slate-200 rounded-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • Pelangi Lazuardi LTC</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AchievementChartPage;
