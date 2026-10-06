import React from 'react';
import { Child, AttendanceStatus, TherapyDefinition, Therapist, UserRole } from '../types';
import StatusSelector from './StatusSelector';
import DefaultTherapyIcon from './icons/DefaultTherapyIcon';

interface AttendanceTableProps {
  data: Child[];
  onStatusChange: (childId: string, sessionId: string, newStatus: AttendanceStatus) => void;
  onEditSession: (childId: string, sessionId: string) => void;
  therapyTypes: TherapyDefinition[];
  therapists: Therapist[];
  userRole: UserRole;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, onStatusChange, onEditSession, therapyTypes, therapists, userRole }) => {
  
  const getTherapyInfo = (typeId: string): TherapyDefinition => {
    const therapy = therapyTypes.find(t => t.id === typeId);
    if (therapy) return therapy;
    // Fallback for an orphaned therapy type
    return { id: typeId, name: typeId, Icon: DefaultTherapyIcon, color: '#8A94AD' };
  };

  return (
    <div className="bg-surface border border-surface-light rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-light">
          <thead className="bg-background/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider w-1/3">Nama Anak</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Jadwal Sesi</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-surface-light">
            {data.length > 0 ? data.map((child) => (
              <tr key={child.id} className="hover:bg-surface-light/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap align-top">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover ring-2 ring-surface-light" src={child.photoUrl} alt={child.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{child.name}</div>
                      <div className="text-xs text-muted font-mono">{child.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {child.sessions && child.sessions.length > 0 ? (
                    <div className="flex flex-wrap gap-4 items-start">
                      {child.sessions
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(session => {
                          const therapyInfo = getTherapyInfo(session.type);
                          const therapistInfo = therapists.find(t => t.id === session.therapistId);
                          const Icon = therapyInfo.Icon;
                          return (
                            <div key={session.id} className="p-3 rounded-xl bg-surface-light border border-surface-light/50 w-60 space-y-3">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <div style={{color: therapyInfo.color}}>
                                        <Icon className="w-6 h-6" />
                                      </div>
                                      <span className="font-semibold text-white">{therapyInfo.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted font-mono bg-background/50 px-2 py-0.5 rounded">{session.time}</span>
                                     <button onClick={() => onEditSession(child.id, session.id)} className="p-1 rounded-md text-muted hover:bg-background/50 hover:text-primary transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                    </button>
                                  </div>
                              </div>
                               <div className="text-xs text-muted flex items-center gap-2 border-t border-surface-light/50 pt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span>{therapistInfo?.name || 'Terapis tidak ditugaskan'}</span>
                              </div>
                              <StatusSelector 
                                currentStatus={session.status} 
                                onChange={(newStatus) => onStatusChange(child.id, session.id, newStatus)}
                              />
                            </div>
                          )
                        })
                      }
                    </div>
                  ) : (
                    <span className="text-muted/50">Tidak ada sesi terjadwal hari ini.</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={2} className="text-center py-10 text-muted">
                  Tidak ada data anak yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;