import React, { useState, useEffect } from 'react';
import { TherapySession, TherapyDefinition } from '../types';

interface EditSessionModalProps {
    isOpen: boolean;
    session: TherapySession | null;
    childName: string;
    onClose: () => void;
    onSave: (updates: { type: string, time: string, note?: string }) => void;
    onDelete: () => void;
    therapyTypes: TherapyDefinition[];
    therapyTimes: string[];
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ isOpen, session, childName, onClose, onSave, onDelete, therapyTypes, therapyTimes }) => {
    const [type, setType] = useState('');
    const [time, setTime] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (session) {
            setType(session.type);
            setTime(session.time);
            setNote(session.note || '');
        }
    }, [session]);

    if (!isOpen || !session) return null;

    const handleSave = () => {
        if(type && time) {
            onSave({ type, time, note });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
            onDelete();
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
            <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-surface-light flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Edit Sesi Terapi</h3>
                        <p className="text-sm text-muted">{childName}</p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-muted">Jenis Terapi</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-surface-light border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                            {therapyTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-muted">Jam Terapi</label>
                        <select value={time} onChange={(e) => setTime(e.target.value)} className="bg-surface-light border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                            {therapyTimes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-muted">Keterangan (Contoh: Alasan Absen)</label>
                        <textarea 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            rows={3}
                            placeholder="Tulis keterangan di sini..."
                            className="bg-surface-light border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 resize-none"
                        />
                    </div>
                </div>
                <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-between items-center">
                    <button 
                        onClick={handleDelete} 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus Sesi
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg hover:bg-surface-light/50 transition">Batal</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-dark transition">Simpan Perubahan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSessionModal;