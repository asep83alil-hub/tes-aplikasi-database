import React, { useState } from 'react';
import { 
  Plus, 
  CalendarPlus, 
  UserPlus, 
  UserCheck, 
  ClipboardPen, 
  CreditCard, 
  FileBarChart2, 
  X,
  Sparkles
} from 'lucide-react';
import { View } from '../types';

interface QuickActionButtonProps {
  onNavigate: (view: View) => void;
  onOpenAddChild?: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  onNavigate,
  onOpenAddChild 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'jadwal',
      label: 'Tambah Jadwal',
      icon: CalendarPlus,
      color: 'from-emerald-500 to-teal-600',
      action: () => {
        onNavigate('papanJadwal');
        setIsOpen(false);
      }
    },
    {
      id: 'anak',
      label: 'Tambah Anak',
      icon: UserPlus,
      color: 'from-blue-500 to-indigo-600',
      action: () => {
        if (onOpenAddChild) {
          onOpenAddChild();
        } else {
          onNavigate('manajemenAnak');
        }
        setIsOpen(false);
      }
    },
    {
      id: 'terapis',
      label: 'Tambah Terapis',
      icon: UserCheck,
      color: 'from-purple-500 to-violet-600',
      action: () => {
        onNavigate('manajemenTerapis');
        setIsOpen(false);
      }
    },
    {
      id: 'assessment',
      label: 'Assessment Baru',
      icon: ClipboardPen,
      color: 'from-rose-500 to-pink-600',
      action: () => {
        onNavigate('assesmentAnak');
        setIsOpen(false);
      }
    },
    {
      id: 'laporan',
      label: 'Generate Laporan',
      icon: FileBarChart2,
      color: 'from-cyan-500 to-blue-600',
      action: () => {
        onNavigate('pusatLaporan');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-4 flex flex-col items-end gap-2.5 animate-fade-in-up">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl w-60">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Aksi Cepat
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {actions.map((act) => {
                const IconComponent = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${act.color} flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 text-slate-200 rotate-45 border border-slate-700'
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 hover:scale-105 active:scale-95'
        }`}
        title="Quick Action"
      >
        <Plus className="w-7 h-7 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default QuickActionButton;
