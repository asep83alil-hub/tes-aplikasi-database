import React from 'react';
import { Child, Therapist } from '../types';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  list: (Child | Therapist)[];
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, title, list }) => {
  if (!isOpen) return null;

  const isTherapist = (item: Child | Therapist): item is Therapist => 'specialties' in item;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-surface-light flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">{title} ({list.length})</h3>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {list.length > 0 ? (
            <ul className="space-y-4">
              {list.map((item) => (
                <li key={item.id} className="flex items-center bg-surface-light/50 p-3 rounded-lg">
                  <img className="h-10 w-10 rounded-full object-cover ring-2 ring-surface-light" src={item.photoUrl} alt={item.name} />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-muted font-mono">{item.id}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted">Tidak ada data untuk ditampilkan.</p>
          )}
        </div>
        <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary/20 rounded-lg hover:bg-primary/30 transition">Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;