
import React, { useMemo } from 'react';
import { Child, AttendanceStatus, Therapist } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, trend, onClick }) => (
  <button onClick={onClick} className={`relative text-left overflow-hidden rounded-2xl p-4 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl ${gradient}`}>
    <div className="flex items-center gap-4">
      <div className="bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/80 font-medium">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
    <p className="text-xs text-white/70 mt-2">{trend}</p>
  </button>
);


interface DashboardStatsProps {
  data: Child[]; // Data for the selected day
  totalRegisteredChildren: number;
  projectedMonthlySessions: number;
  scheduledToday: number;
  onCardClick: (type: 'present' | 'absent' | 'total' | 'attendanceRate' | 'therapists') => void;
  selectedDate: Date;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, totalRegisteredChildren, projectedMonthlySessions, scheduledToday, onCardClick, selectedDate }) => {
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;

    data.forEach(child => {
      child.sessions.forEach(session => {
        if (session.status === AttendanceStatus.PRESENT) {
          present++;
        } else if (session.status === AttendanceStatus.ABSENT) {
          absent++;
        }
      });
    });
    
    // Calculate completion rate for today
    const completionRate = scheduledToday > 0 ? Math.round(((present + absent) / scheduledToday) * 100) : 0;

    return { present, absent, completionRate };
  }, [data, scheduledToday]);

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const dateLabel = isToday ? "Hari Ini" : selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const monthLabel = selectedDate.toLocaleDateString('id-ID', { month: 'long' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
       <StatCard 
        onClick={() => onCardClick('attendanceRate')} // Reusing existing handler type
        title={`Jadwal ${dateLabel}`} 
        value={scheduledToday} 
        gradient="from-blue-500 to-indigo-600 bg-gradient-to-br"
        trend="Sesi Terapi"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      />
      <StatCard 
        onClick={() => onCardClick('present')}
        title={`Hadir ${dateLabel}`} 
        value={stats.present} 
        gradient="from-emerald-500 to-green-600 bg-gradient-to-br"
        trend={`${stats.completionRate}% dari jadwal`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <StatCard 
        onClick={() => onCardClick('absent')}
        title={`Absen ${dateLabel}`} 
        value={stats.absent} 
        gradient="from-rose-500 to-red-600 bg-gradient-to-br"
        trend="Izin / Sakit"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
       <StatCard 
        onClick={() => onCardClick('therapists')} // Placeholder click
        title={`Proyeksi Sesi ${monthLabel}`} 
        value={projectedMonthlySessions} 
        gradient="from-violet-500 to-purple-600 bg-gradient-to-br"
        trend="Total Estimasi"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
      />
      <StatCard 
        onClick={() => onCardClick('total')}
        title="Total Pasien Aktif" 
        value={totalRegisteredChildren} 
        gradient="from-orange-400 to-pink-500 bg-gradient-to-br"
        trend="Terdaftar"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />
    </div>
  );
};

export default DashboardStats;
