
import React, { useState, useMemo, useEffect } from 'react';
import { AssessmentPrintPreviewModal } from './AssessmentPrintPreviewModal';
// FIX: Import OTSensoryModulationItem to resolve type error.
import { AssessmentReport, Child, Therapist, TherapyDefinition, OccupationalTherapyReport, SpeechTherapyReport, OTResponse, OTGeneralObservation, OTSensoryModulation, OTCombinedSensory, OTFedc, OTInterventionChecklist, STAbilities, OTSensoryModulationItem, UserRole, RemedialTherapyReport, RemedialGoalItem, RemedialSection, PhysiotherapyReport, PhysioGeneralBehavior, PhysioAwalHasil, PhysioResponsePair, PhysioModulationItem, PhysioModulationLevel, PhysioMotorItem, PhysioMotorLevel, PhysioGMFMItem, PhysioGMFMLevel, PSBData } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileCheck, 
  FileText, 
  ShieldCheck, 
  UserPlus, 
  FolderDown, 
  RefreshCw, 
  Sparkles, 
  Activity, 
  Clock, 
  Eye, 
  Phone 
} from 'lucide-react';
import PrintIcon from './icons/PrintIcon';
import OccupationalTherapyIcon from './icons/OccupationalTherapyIcon';
import SpeechTherapyIcon from './icons/SpeechTherapyIcon';
import RemedialTherapyIcon from './icons/RemedialIcon';
import PhysiotherapyIcon from './icons/PhysiotherapyIcon';

type MasterChild = Omit<Child, 'sessions'>;

// Helper to get age from birth date
const getAge = (birthDate: string | undefined): string => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age_y = today.getFullYear() - birth.getFullYear();
    let age_m = today.getMonth() - birth.getMonth();
    if (age_m < 0 || (age_m === 0 && today.getDate() < birth.getDate())) {
        age_y--;
        age_m += 12;
    }
    return `${age_y} Tahun ${age_m} Bulan`;
};

// #region Form Modal Component & Sub-components

const FormSection: React.FC<{ title: string; children: React.ReactNode, columns?: number }> = ({ title, children, columns = 2 }) => (
    <fieldset className="mb-6 bg-surface-light/50 p-4 rounded-lg">
        <legend className="text-md font-semibold text-white mb-4 px-2">{title}</legend>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>{children}</div>
    </fieldset>
);

const TextArea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number, span?: number }> = ({ label, name, value, onChange, rows = 3, span=2 }) => (
    <div className={`md:col-span-${span}`}>
        <label htmlFor={name} className="block mb-2 text-xs font-medium text-muted">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"></textarea>
    </div>
);

const FormInput: React.FC<{ label: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string;}> = ({label, name, value, onChange, type='text'}) => (
    <div>
        <label htmlFor={name} className="block mb-2 text-xs font-medium text-muted">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"/>
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({label, name, value, onChange, children}) => (
     <div>
        <label htmlFor={name} className="block mb-2 text-xs font-medium text-muted">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
            {children}
        </select>
    </div>
);

const SensoryModulationInput: React.FC<{
    label: string;
    id: keyof OTSensoryModulation;
    data: OTSensoryModulationItem;
    onChange: (id: keyof OTSensoryModulation, field: 'response' | 'comment', value: string) => void;
}> = ({ label, id, data, onChange }) => (
    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-surface-light pb-4">
        <label className="font-semibold text-sm text-white self-center">{label}</label>
        <div className="md:col-span-2">
            <select
                value={data.response}
                onChange={e => onChange(id, 'response', e.target.value)}
                className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 mb-2"
            >
                <option value="">Pilih Respon</option>
                <option value="Kurang">Kurang</option>
                <option value="Sesuai">Sesuai</option>
                <option value="Lebih">Lebih</option>
            </select>
            <textarea
                placeholder="Komentar..."
                value={data.comment}
                onChange={e => onChange(id, 'comment', e.target.value)}
                rows={2}
                className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            />
        </div>
    </div>
);

const ChecklistGroup: React.FC<{ title: string; options: {key: string, label: string}[]; values: OTInterventionChecklist; onChange: (key: string, checked: boolean) => void }> = ({ title, options, values, onChange }) => (
    <div>
        <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
        <div className="space-y-2 p-3 bg-background/50 rounded-lg max-h-48 overflow-y-auto">
            {options.map(opt => (
                <label key={opt.key} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-surface-light/50 transition cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!values[opt.key]}
                        onChange={e => onChange(opt.key, e.target.checked)}
                        className="w-4 h-4 text-primary bg-surface border-surface-light rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-white">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const AbilityCheckbox: React.FC<{ checked: boolean, onClick: () => void }> = ({ checked, onClick }) => (
    <td className="text-center px-1">
        <button
            type="button"
            onClick={onClick}
            className={`w-5 h-5 mx-auto rounded border-2 transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                checked 
                    ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(var(--color-primary),0.3)]' 
                    : 'bg-surface border-surface-light hover:border-primary/50'
            }`}
        >
            {checked && <Check size={14} strokeWidth={4} />}
        </button>
    </td>
);

const AbilitiesTable: React.FC<{
    title1: string;
    fields1: { key: keyof STAbilities; label: string }[];
    title2: string;
    fields2: { key: keyof STAbilities; label: string }[];
    commentKey: keyof STAbilities;
    commentValue: string;
    commentLabel?: string;
    abilities: STAbilities;
    onChange: (field: keyof STAbilities, value: any) => void;
}> = ({ title1, fields1, title2, fields2, commentKey, commentValue, commentLabel, abilities, onChange }) => {
    const maxRows = Math.max(fields1.length, fields2.length);
    const rows = Array.from({ length: maxRows });

    const handleToggle = (key: keyof STAbilities, val: boolean) => {
        if (abilities[key] === val) {
            onChange(key, null);
        } else {
            onChange(key, val);
        }
    };

    return (
        <div className="bg-surface-light/30 p-3 rounded-lg overflow-hidden border border-surface-light/50 shadow-inner">
            <table className="w-full text-sm">
                <thead className="text-xs text-muted uppercase">
                    <tr>
                        <th className="w-1/4 pb-2 text-left text-primary font-bold">{title1}</th>
                        <th className="w-1/4 pb-2 text-center" colSpan={2}>Nilai</th>
                        <th className="w-1/4 pb-2 text-left text-primary font-bold">{title2}</th>
                        <th className="w-1/4 pb-2 text-center" colSpan={2}>Nilai</th>
                    </tr>
                     <tr className="border-b border-surface-light">
                        <th/>
                        <th className="font-semibold text-[10px] pb-1 text-center text-muted uppercase">Mampu</th>
                        <th className="font-semibold text-[10px] pb-1 text-center text-muted uppercase">Tdk Mampu</th>
                        <th/>
                        <th className="font-semibold text-[10px] pb-1 text-center text-muted uppercase">Mampu</th>
                        <th className="font-semibold text-[10px] pb-1 text-center text-muted uppercase">Tdk Mampu</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-light/10">
                    {rows.map((_, i) => (
                        <tr key={i} className="hover:bg-primary/5 transition-colors group">
                            <td className="py-2 text-[13px] font-medium">{fields1[i]?.label}</td>
                            {fields1[i] ? (
                                <>
                                    <AbilityCheckbox checked={abilities[fields1[i].key] === true} onClick={() => handleToggle(fields1[i].key, true)} />
                                    <AbilityCheckbox checked={abilities[fields1[i].key] === false} onClick={() => handleToggle(fields1[i].key, false)} />
                                </>
                            ) : (
                                <><td/><td/></>
                            )}
                            <td className="py-2 text-[13px] font-medium px-2">{fields2[i]?.label}</td>
                            {fields2[i] ? (
                                <>
                                    <AbilityCheckbox checked={abilities[fields2[i].key] === true} onClick={() => handleToggle(fields2[i].key, true)} />
                                    <AbilityCheckbox checked={abilities[fields2[i].key] === false} onClick={() => handleToggle(fields2[i].key, false)} />
                                </>
                            ) : (
                                <><td/><td/></>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 pt-2 border-t border-surface-light">
                <label className="block mb-1 text-xs font-medium text-muted">{commentLabel || 'Komentar'}</label>
                <textarea
                    value={commentValue}
                    onChange={e => onChange(commentKey, e.target.value)}
                    rows={3}
                    className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                />
            </div>
        </div>
    );
};

const RemedialSectionForm: React.FC<{
    title: string;
    sectionKey: keyof RemedialTherapyReport;
    data: RemedialSection;
    onChange: (sectionKey: keyof RemedialTherapyReport, updates: Partial<RemedialSection>) => void;
}> = ({ title, sectionKey, data, onChange }) => {
    const handleItemChange = (itemId: string, field: keyof RemedialGoalItem, value: string) => {
        const newItems = data.items.map(item => item.id === itemId ? { ...item, [field]: value } : item);
        onChange(sectionKey, { items: newItems });
    };

    const addItem = () => {
        const newItem: RemedialGoalItem = { id: Date.now().toString(), awal: '', tujuan: '', hasil: '' };
        onChange(sectionKey, { items: [...data.items, newItem] });
    };

    const removeItem = (itemId: string) => {
        if (data.items.length <= 1) return;
        onChange(sectionKey, { items: data.items.filter(item => item.id !== itemId) });
    };

    return (
        <div className="bg-surface-light/20 p-4 rounded-xl border border-surface-light/30 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-surface-light/50 pb-2">
                <h4 className="text-white font-bold uppercase tracking-wider text-sm">{title}</h4>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-muted uppercase font-bold">Target Capai:</label>
                        <input 
                            type="date" 
                            value={data.targetDate || ''} 
                            onChange={e => onChange(sectionKey, { targetDate: e.target.value })}
                            className="bg-background border border-surface-light/50 text-white text-xs rounded p-1 focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {data.items.map((item, idx) => (
                    <div key={item.id} className="relative bg-background/40 p-3 rounded-lg border border-surface-light/20 group animate-in fade-in slide-in-from-top-1 duration-200">
                        {data.items.length > 1 && (
                            <button 
                                onClick={() => removeItem(item.id)}
                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:rotate-90 duration-200"
                                title="Hapus Item"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-muted uppercase mb-1 block">Awal</label>
                                <textarea 
                                    value={item.awal} 
                                    onChange={e => handleItemChange(item.id, 'awal', e.target.value)}
                                    className="w-full bg-background/60 border border-surface-light/30 rounded p-2 text-sm text-white focus:border-primary outline-none min-h-[60px]"
                                    placeholder="Kondisi awal..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted uppercase mb-1 block">Tujuan</label>
                                <textarea 
                                    value={item.tujuan} 
                                    onChange={e => handleItemChange(item.id, 'tujuan', e.target.value)}
                                    className="w-full bg-background/60 border border-surface-light/30 rounded p-2 text-sm text-white focus:border-primary outline-none min-h-[60px]"
                                    placeholder="Tujuan yang diharapkan..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted uppercase mb-1 block">Hasil</label>
                                <textarea 
                                    value={item.hasil} 
                                    onChange={e => handleItemChange(item.id, 'hasil', e.target.value)}
                                    className="w-full bg-background/60 border border-surface-light/30 rounded p-2 text-sm text-white focus:border-primary outline-none min-h-[60px]"
                                    placeholder="Hasil capaian..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
                
                <button 
                    type="button"
                    onClick={addItem}
                    className="w-full py-2 border-2 border-dashed border-surface-light/50 rounded-lg text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                    <Plus size={14} /> Tambah Item
                </button>

                <div className="mt-4 pt-4 border-t border-surface-light/30">
                    <label className="text-[10px] font-bold text-muted uppercase mb-1 block">Komentar Khusus Section</label>
                    <textarea 
                        value={data.comment} 
                        onChange={e => onChange(sectionKey, { comment: e.target.value })}
                        className="w-full bg-background/60 border border-surface-light/30 rounded p-2 text-sm text-white focus:border-primary outline-none min-h-[80px]"
                        placeholder="Tambahkan komentar untuk section ini..."
                    />
                </div>
            </div>
        </div>
    );
};


const PhysioBehaviorRow: React.FC<{
    label: string;
    value: PhysioAwalHasil<PhysioResponsePair>;
    onChange: (val: PhysioAwalHasil<PhysioResponsePair>) => void;
}> = ({ label, value, onChange }) => (
    <tr className="border-b border-surface-light/10 hover:bg-surface-light/5">
        <td className="p-3 font-medium text-xs">{label}</td>
        <td className="p-1 border-l border-surface-light/20">
            <select 
                value={value.awal.teramati ? 'teramati' : (value.awal.tidak ? 'tidak' : '')} 
                onChange={e => onChange({ ...value, awal: { teramati: e.target.value === 'teramati', tidak: e.target.value === 'tidak' } })}
                className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-[11px]"
            >
                <option value="">- Pilih -</option>
                <option value="teramati">Teramati</option>
                <option value="tidak">Tidak Teramati</option>
            </select>
        </td>
        <td className="p-1 border-l border-surface-light/20">
            <select 
                value={value.hasil.teramati ? 'teramati' : (value.hasil.tidak ? 'tidak' : '')} 
                onChange={e => onChange({ ...value, hasil: { teramati: e.target.value === 'teramati', tidak: e.target.value === 'tidak' } })}
                className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-[11px]"
            >
                <option value="">- Pilih -</option>
                <option value="teramati">Teramati</option>
                <option value="tidak">Tidak Teramati</option>
            </select>
        </td>
    </tr>
);

const PhysioSensoryTable: React.FC<{
    items: PhysioModulationItem[];
    onChange: (idx: number, field: 'awal' | 'hasil', val: PhysioModulationLevel) => void;
}> = ({ items, onChange }) => (
    <div className="border border-surface-light/30 rounded-lg overflow-hidden bg-background/40">
        <div className="bg-red-600/20 p-2.5 font-bold text-xs border-b border-surface-light/30 uppercase tracking-wider flex justify-between items-center">
            <span>1. SENSORI MODULASI</span>
            <span className="text-[10px] font-normal normal-case text-muted italic">B: Berlebih, S: Sesuai, K: Kurang, BR: Berubah-ubah</span>
        </div>
        <table className="w-full text-xs border-collapse">
            <thead>
                <tr className="border-b border-surface-light/20 text-muted bg-surface-light/5">
                    <th className="p-2 text-left">RESPON</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-32">AWAL</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-32">HASIL</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-surface-light/10 hover:bg-surface-light/5 transition-colors">
                        <td className="p-2.5 font-medium">{item.type}</td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select value={item.awal} onChange={e => onChange(idx, 'awal', e.target.value as PhysioModulationLevel)} className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center">
                                <option value="">-</option>
                                <option value="B">B</option><option value="S">S</option><option value="K">K</option><option value="BR">BR</option>
                            </select>
                        </td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select value={item.hasil} onChange={e => onChange(idx, 'hasil', e.target.value as PhysioModulationLevel)} className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center">
                                <option value="">-</option>
                                <option value="B">B</option><option value="S">S</option><option value="K">K</option><option value="BR">BR</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PhysioMotorTable: React.FC<{
    title: string;
    subSection: string;
    items: PhysioMotorItem[];
    onChange: (idx: number, field: 'awal' | 'hasil', val: PhysioMotorLevel) => void;
}> = ({ title, items, onChange }) => (
    <div className="border border-surface-light/30 rounded-lg overflow-hidden bg-background/40">
        <div className="bg-blue-600/20 p-2.5 font-bold text-xs border-b border-surface-light/30 uppercase tracking-wider flex justify-between items-center">
            <span>{title}</span>
            <span className="text-[10px] font-normal normal-case text-muted italic">MD: Mudah, SD: Sulit, TD: Tidak Dapat</span>
        </div>
        <table className="w-full text-xs border-collapse">
            <thead>
                <tr className="border-b border-surface-light/20 text-muted bg-surface-light/5">
                    <th className="p-2 text-left">AKTIVITAS</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-24">AWAL</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-24">HASIL</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-surface-light/10 hover:bg-surface-light/5 transition-colors">
                        <td className="p-2.5 font-medium">{item.activity}</td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select value={item.awal} onChange={e => onChange(idx, 'awal', e.target.value as PhysioMotorLevel)} className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center">
                                <option value="">-</option>
                                <option value="MD">MD</option><option value="SD">SD</option><option value="TD">TD</option>
                            </select>
                        </td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select value={item.hasil} onChange={e => onChange(idx, 'hasil', e.target.value as PhysioMotorLevel)} className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center">
                                <option value="">-</option>
                                <option value="MD">MD</option><option value="SD">SD</option><option value="TD">TD</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PhysioGMFMTable: React.FC<{
    title: string;
    subSection: string;
    items: PhysioGMFMItem[];
    onChange: (idx: number, field: 'awal' | 'hasil', val: PhysioGMFMLevel) => void;
    legend?: string;
}> = ({ title, items, onChange, legend }) => (
    <div className="border border-surface-light/30 rounded-lg overflow-hidden bg-background/40">
        <div className="bg-indigo-600/20 p-2.5 font-bold text-xs border-b border-surface-light/30 uppercase tracking-wider flex justify-between items-center">
            <span>{title}</span>
            {legend && <span className="text-[10px] font-normal normal-case text-muted italic">{legend}</span>}
        </div>
        <table className="w-full text-xs border-collapse">
            <thead>
                <tr className="border-b border-surface-light/20 text-muted bg-surface-light/5">
                    <th className="p-2 text-left">AKTIVITAS</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-24">AWAL (0-3)</th>
                    <th className="p-2 text-center border-l border-surface-light/20 w-24">HASIL (0-3)</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-surface-light/10 hover:bg-surface-light/5 transition-colors">
                        <td className="p-2.5 font-medium">{item.activity}</td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select 
                                value={item.awal === null ? '' : item.awal} 
                                onChange={e => onChange(idx, 'awal', e.target.value === '' ? null : parseInt(e.target.value) as PhysioGMFMLevel)} 
                                className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center"
                            >
                                <option value="">-</option>
                                <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                            </select>
                        </td>
                        <td className="p-1 border-l border-surface-light/20">
                            <select 
                                value={item.hasil === null ? '' : item.hasil} 
                                onChange={e => onChange(idx, 'hasil', e.target.value === '' ? null : parseInt(e.target.value) as PhysioGMFMLevel)} 
                                className="w-full bg-background/60 border border-surface-light/20 rounded p-1.5 focus:border-primary outline-none text-center"
                            >
                                <option value="">-</option>
                                <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const initialPSBData: PSBData = {
    tier1: {
        multiModalTeaching: false,
        multiModalTeachingNotes: '',
        zoneOfRegulation: false,
        flexibleSeating: false,
        descriptiveLanguage: false,
        visualAids: false,
        manipulatives: false,
        simulations: false,
        rolePlaying: false,
        wholeClassMovement: false,
    },
    tier2: {
        teachersImplementClassroomStrategies: false,
        teachersImplementClassroomStrategiesNotes: '',
        behaviorStrategies: false,
        pemantauanPerilaku: false,
        intervensiKelompokKecil: false,
        penugasanMentorDewasa: false,
        bimbinganAkademikTambahan: false,
        upayaKhususMenangkapSiswaBerperilakuBaik: false,
    },
    tier3: {
        otAssessmentIndividualStrategies: false,
        otAssessmentIndividualStrategiesNotes: '',
        oneOneInteraction: false,
        consultationWithTeamMembers: false,
        penilaianPerilakuFungsional: false,
        konselingIndividu: false,
        penempatanPerawatanKelasKhusus: false,
        terapiKesehatanMental: false,
    },
    tier4: {
        multipleNeeds: false,
        multipleNeedsNotes: '',
        changePlaces: false,
        dukunganAkademikIndividualIntensif: false,
        pengajaranKeterampilanSosialIndividuIntensif: false,
        rencanaManajemenPerilakuIndividu: false,
        pelatihanDanKerjasamaOrangTua: false,
        kolaborasiMultiLembaga: false,
        alternatifLainPositiveDiscipline: false,
        pembelajaranKomunitasDanLayanan: false,
    }
};

const PSBFormComponent: React.FC<{
    psbData?: PSBData;
    onChange: (tier: 'tier1' | 'tier2' | 'tier3' | 'tier4', field: string, value: any) => void;
}> = ({ psbData = initialPSBData, onChange }) => {
    const tier1 = psbData.tier1 || {};
    const tier2 = psbData.tier2 || {};
    const tier3 = psbData.tier3 || {};
    const tier4 = psbData.tier4 || {};

    return (
        <div className="space-y-6 bg-surface-light/20 p-5 rounded-2xl border border-surface-light/40">
            <div className="border-b border-surface-light pb-3">
                <h3 className="text-base font-black text-amber-400 tracking-tight uppercase flex items-center gap-2">
                    <span>PSB - III. Saran dan Dukungan Pendidikan Dengan Setting Inklusi</span>
                </h3>
                <p className="text-xs text-muted mt-1">
                    Pilih indikator dukungan pendidikan inklusi yang berlaku untuk siswa ini (Tier 1 s/d Tier 4).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* TIER 1 */}
                <div className="bg-background/60 p-4 rounded-xl border border-surface-light/30 space-y-3">
                    <div className="bg-blue-600/20 text-blue-300 font-black text-xs px-2.5 py-1.5 rounded-lg text-center uppercase tracking-wider">
                        TIER 1
                    </div>
                    
                    <div className="space-y-2.5 text-xs text-white">
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer font-bold">
                                <input
                                    type="checkbox"
                                    checked={!!tier1.multiModalTeaching}
                                    onChange={e => onChange('tier1', 'multiModalTeaching', e.target.checked)}
                                    className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                                />
                                <span>Multi modal teaching strategies :</span>
                            </label>
                            {tier1.multiModalTeaching && (
                                <input
                                    type="text"
                                    placeholder="Catatan strategi..."
                                    value={tier1.multiModalTeachingNotes || ''}
                                    onChange={e => onChange('tier1', 'multiModalTeachingNotes', e.target.value)}
                                    className="mt-1 w-full bg-background border border-surface-light/50 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                />
                            )}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.zoneOfRegulation}
                                onChange={e => onChange('tier1', 'zoneOfRegulation', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Zone of Regulation</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.flexibleSeating}
                                onChange={e => onChange('tier1', 'flexibleSeating', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Flexible seating</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.descriptiveLanguage}
                                onChange={e => onChange('tier1', 'descriptiveLanguage', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Descriptive language</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.visualAids}
                                onChange={e => onChange('tier1', 'visualAids', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Visual aids</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.manipulatives}
                                onChange={e => onChange('tier1', 'manipulatives', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Manipulatives</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.simulations}
                                onChange={e => onChange('tier1', 'simulations', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Simulations</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.rolePlaying}
                                onChange={e => onChange('tier1', 'rolePlaying', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Role playing</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier1.wholeClassMovement}
                                onChange={e => onChange('tier1', 'wholeClassMovement', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Whole Class Movement</span>
                        </label>
                    </div>
                </div>

                {/* TIER 2 */}
                <div className="bg-background/60 p-4 rounded-xl border border-surface-light/30 space-y-3">
                    <div className="bg-emerald-600/20 text-emerald-300 font-black text-xs px-2.5 py-1.5 rounded-lg text-center uppercase tracking-wider">
                        TIER 2
                    </div>
                    
                    <div className="space-y-2.5 text-xs text-white">
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer font-bold">
                                <input
                                    type="checkbox"
                                    checked={!!tier2.teachersImplementClassroomStrategies}
                                    onChange={e => onChange('tier2', 'teachersImplementClassroomStrategies', e.target.checked)}
                                    className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                                />
                                <span>Teachers implement Classroom strategies :</span>
                            </label>
                            {tier2.teachersImplementClassroomStrategies && (
                                <input
                                    type="text"
                                    placeholder="Catatan strategi..."
                                    value={tier2.teachersImplementClassroomStrategiesNotes || ''}
                                    onChange={e => onChange('tier2', 'teachersImplementClassroomStrategiesNotes', e.target.value)}
                                    className="mt-1 w-full bg-background border border-surface-light/50 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                />
                            )}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.behaviorStrategies}
                                onChange={e => onChange('tier2', 'behaviorStrategies', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Behavior strategies</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.pemantauanPerilaku}
                                onChange={e => onChange('tier2', 'pemantauanPerilaku', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Pemantauan perilaku secara teratur dan penguatan ekstra untuk perilaku yang sesuai.</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.intervensiKelompokKecil}
                                onChange={e => onChange('tier2', 'intervensiKelompokKecil', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Intervensi kelompok kecil dengan konselor untuk masalah tertentu</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.penugasanMentorDewasa}
                                onChange={e => onChange('tier2', 'penugasanMentorDewasa', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Penugasan seorang mentor dewasa</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.bimbinganAkademikTambahan}
                                onChange={e => onChange('tier2', 'bimbinganAkademikTambahan', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Bimbingan akademik tambahan dan bantuan pekerjaan rumah, jika itu merupakan masalah</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier2.upayaKhususMenangkapSiswaBerperilakuBaik}
                                onChange={e => onChange('tier2', 'upayaKhususMenangkapSiswaBerperilakuBaik', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Upaya khusus untuk “menangkap siswa berperilaku baik” dan memperkuat mereka ketika hal itu terjadi.</span>
                        </label>
                    </div>
                </div>

                {/* TIER 3 */}
                <div className="bg-background/60 p-4 rounded-xl border border-surface-light/30 space-y-3">
                    <div className="bg-amber-600/20 text-amber-300 font-black text-xs px-2.5 py-1.5 rounded-lg text-center uppercase tracking-wider">
                        TIER 3
                    </div>
                    
                    <div className="space-y-2.5 text-xs text-white">
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer font-bold">
                                <input
                                    type="checkbox"
                                    checked={!!tier3.otAssessmentIndividualStrategies}
                                    onChange={e => onChange('tier3', 'otAssessmentIndividualStrategies', e.target.checked)}
                                    className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                                />
                                <span>OT Assessment / Individual Strategies :</span>
                            </label>
                            {tier3.otAssessmentIndividualStrategies && (
                                <input
                                    type="text"
                                    placeholder="Catatan strategi..."
                                    value={tier3.otAssessmentIndividualStrategiesNotes || ''}
                                    onChange={e => onChange('tier3', 'otAssessmentIndividualStrategiesNotes', e.target.value)}
                                    className="mt-1 w-full bg-background border border-surface-light/50 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                />
                            )}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.oneOneInteraction}
                                onChange={e => onChange('tier3', 'oneOneInteraction', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>One-one interaction</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.consultationWithTeamMembers}
                                onChange={e => onChange('tier3', 'consultationWithTeamMembers', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Consultation with team members</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.penilaianPerilakuFungsional}
                                onChange={e => onChange('tier3', 'penilaianPerilakuFungsional', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Penilaian perilaku fungsional (FBA)</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.konselingIndividu}
                                onChange={e => onChange('tier3', 'konselingIndividu', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Konseling individu untuk masalah tertentu (mis., intimidasi).</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.penempatanPerawatanKelasKhusus}
                                onChange={e => onChange('tier3', 'penempatanPerawatanKelasKhusus', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Penempatan perawatan kelas khusus atau residensial di mana lebih banyak struktur dan pengawasan dapat diberikan.</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier3.terapiKesehatanMental}
                                onChange={e => onChange('tier3', 'terapiKesehatanMental', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Terapi kesehatan mental dari profesional</span>
                        </label>
                    </div>
                </div>

                {/* TIER 4 */}
                <div className="bg-background/60 p-4 rounded-xl border border-surface-light/30 space-y-3">
                    <div className="bg-rose-600/20 text-rose-300 font-black text-xs px-2.5 py-1.5 rounded-lg text-center uppercase tracking-wider">
                        TIER 4
                    </div>
                    
                    <div className="space-y-2.5 text-xs text-white">
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer font-bold">
                                <input
                                    type="checkbox"
                                    checked={!!tier4.multipleNeeds}
                                    onChange={e => onChange('tier4', 'multipleNeeds', e.target.checked)}
                                    className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                                />
                                <span>Multiple Needs</span>
                            </label>
                            {tier4.multipleNeeds && (
                                <input
                                    type="text"
                                    placeholder="Catatan..."
                                    value={tier4.multipleNeedsNotes || ''}
                                    onChange={e => onChange('tier4', 'multipleNeedsNotes', e.target.value)}
                                    className="mt-1 w-full bg-background border border-surface-light/50 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                />
                            )}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.changePlaces}
                                onChange={e => onChange('tier4', 'changePlaces', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Change Places</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.dukunganAkademikIndividualIntensif}
                                onChange={e => onChange('tier4', 'dukunganAkademikIndividualIntensif', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Dukungan akademik individual yang intensif</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.pengajaranKeterampilanSosialIndividuIntensif}
                                onChange={e => onChange('tier4', 'pengajaranKeterampilanSosialIndividuIntensif', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Pengajaran keterampilan sosial individu yang intensif</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.rencanaManajemenPerilakuIndividu}
                                onChange={e => onChange('tier4', 'rencanaManajemenPerilakuIndividu', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Rencana manajemen perilaku individu</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.pelatihanDanKerjasamaOrangTua}
                                onChange={e => onChange('tier4', 'pelatihanDanKerjasamaOrangTua', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Pelatihan dan kerjasama orang tua</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.kolaborasiMultiLembaga}
                                onChange={e => onChange('tier4', 'kolaborasiMultiLembaga', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Kolaborasi multi-lembaga (layanan menyeluruh)</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.alternatifLainPositiveDiscipline}
                                onChange={e => onChange('tier4', 'alternatifLainPositiveDiscipline', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Alternatif lain (positive discipline)</span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!tier4.pembelajaranKomunitasDanLayanan}
                                onChange={e => onChange('tier4', 'pembelajaranKomunitasDanLayanan', e.target.checked)}
                                className="mt-0.5 rounded text-primary border-surface-light bg-surface"
                            />
                            <span>Pembelajaran komunitas dan layanan</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

const initialOTReport: OccupationalTherapyReport = {
    examinerName: '', examinationNumber: 1, examinationDate1: new Date().toISOString().split('T')[0], examinationDate2: '', examinationDate3: '', examinationDate4: '', referredBy: '',
    generalObservation: { reactionToExaminer: '', reactionToExamination: '', conspicuousBehavior: '', desireSpirit: '' },
    sensoryModulation: {
        tactile: { response: '', comment: '' }, proprioceptive: { response: '', comment: '' }, vestibular: { response: '', comment: '' }, auditory: { response: '', comment: '' }, visual: { response: '', comment: '' }
    },
    combinedSensory: { performance: '', comment: '' },
    fedc: { regulationAndAttention: '', engagementAndRelating: '', purposefulCommunication: '', complexCommunication: '', creativeAndMeaningful: '', buildingLogicalBridges: '' },
    occupationalArea: {}, performanceSkills: {}, bodyFunction: {}, outcome: {},
    interventionMethods: {
        preparationAndTask: false,
        educationAndTraining: false,
        advocacy: false,
        groupIntervention: false,
    },
    interventionFrequency: '', programDuration: '', recommendation: '',
    psb: initialPSBData,
};

const initialSTReport: SpeechTherapyReport = {
    examinerName: '', examinationDate: new Date().toISOString().split('T')[0], parentPhoneNumber: '', religion: '', originSchool: '', examinationPurpose: '', generalOverview: '',
    abilities: {
        motorikKasar: null, motorikHalus: null, visualMotorCoordination: null, motorikComment: '', penglihatan: null, pendengaran: null, taktilKinestetik: null, sensorikComment: '',
        reseptif: null, ekspresif: null, bahasaComment: '', bunyi: null, fonem: null, wicaraComment: '', pernafasan: null, penyaringan: null, nada: null, suaraComment: '',
        iramaNada: null, kecepatanBicara: null, iramaComment: '', organMulut: null, sikat: null, gerakanBibir: null, gerakanLidah: null, gerakanKunyah: null, hisap: null,
        tiup: null, kembungPipi: null, batuk: null, reflekMuntah: null, menelanComment: '',
    },
    recommendation: '',
    psb: initialPSBData,
};

const initialRemedialReport: RemedialTherapyReport = {
    examinerName: '', examinationDate: new Date().toISOString().split('T')[0],
    academicSkills: { targetDate: '', items: [{ id: '1', awal: '', tujuan: '', hasil: '' }], comment: '' },
    languageLiteracySkills: { targetDate: '', items: [{ id: '1', awal: '', tujuan: '', hasil: '' }], comment: '' },
    writingSkills: { targetDate: '', items: [{ id: '1', awal: '', tujuan: '', hasil: '' }], comment: '' },
    focusConcentrationSkills: { targetDate: '', items: [{ id: '1', awal: '', tujuan: '', hasil: '' }], comment: '' },
    followUp: [],
};

const initialPhysioReport: PhysiotherapyReport = {
    examinerName: '',
    examinationDate: new Date().toISOString().split('T')[0],
    generalBehavior: {
        interaction: { awal: { teramati: false, tidak: false }, hasil: { teramati: false, tidak: false } },
        followCommand: { awal: { teramati: false, tidak: false }, hasil: { teramati: false, tidak: false } },
        exploration: { awal: { teramati: false, tidak: false }, hasil: { teramati: false, tidak: false } },
        emotionalIdea: { awal: { teramati: false, tidak: false }, hasil: { teramati: false, tidak: false } },
        organizeBehavior: { awal: { teramati: false, tidak: false }, hasil: { teramati: false, tidak: false } },
        comment: ''
    },
    sensoryModulation: {
        items: [
            { type: 'Therapy brush', awal: '', hasil: '' },
            { type: 'Bermain slime', awal: '', hasil: '' },
            { type: 'Mendorong', awal: '', hasil: '' },
            { type: 'Memindahkan bola', awal: '', hasil: '' },
            { type: 'Bermain ayunan', awal: '', hasil: '' },
        ],
        comment: ''
    },
    motorSkills: {
        grossMotor: [
            { activity: 'Merangkak', awal: '', hasil: '' },
            { activity: 'Melompat', awal: '', hasil: '' },
            { activity: 'Menendang bola', awal: '', hasil: '' },
            { activity: 'Beguling', awal: '', hasil: '' },
            { activity: 'Duduk', awal: '', hasil: '' },
            { activity: 'Berdiri', awal: '', hasil: '' },
            { activity: 'Berjalan', awal: '', hasil: '' },
        ],
        fineMotor: [
            { activity: 'Memasang / melepas jepitan', awal: '', hasil: '' },
            { activity: 'Mengambil bola dari dalam baju', awal: '', hasil: '' },
            { activity: 'Memasukkan koin kedalam celengan', awal: '', hasil: '' },
            { activity: 'Meremas mainan', awal: '', hasil: '' },
        ],
        comment: ''
    },
    physicalFunctional: {
        gmfm: [
            { activity: 'Berbaring dan berguling', awal: null, hasil: null },
            { activity: 'Berdiri', awal: null, hasil: null },
            { activity: 'Merangkak', awal: null, hasil: null },
            { activity: 'Duduk', awal: null, hasil: null },
            { activity: 'Berjalan', awal: null, hasil: null },
            { activity: 'Berlari', awal: null, hasil: null },
            { activity: 'Melompat', awal: null, hasil: null },
        ],
        sensoryIntegration: [
            { activity: 'Tekstur kasar dan halus', awal: null, hasil: null },
            { activity: 'Bermain ayunan', awal: null, hasil: null },
            { activity: 'Bermain trampolin mini', awal: null, hasil: null },
            { activity: 'Mendorong bola besar', awal: null, hasil: null },
            { activity: 'Mengikuti ketukan', awal: null, hasil: null },
            { activity: 'Bertepuk tangan', awal: null, hasil: null },
        ],
        comment: ''
    },
    followUp: [],
    homeProgram: []
};


const AssessmentReportForm: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: Omit<AssessmentReport, 'id'> | AssessmentReport) => void;
    children: MasterChild[];
    therapists: Therapist[];
    therapyTypes: TherapyDefinition[];
    editingReport: AssessmentReport | null;
}> = ({ isOpen, onClose, onSave, children, therapists, therapyTypes, editingReport }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'ot' | 'st' | 'remedial' | 'physio'>('general');
    const [otSubTab, setOtSubTab] = useState<'main' | 'psb'>('main');
    const [stSubTab, setStSubTab] = useState<'main' | 'psb'>('main');

    const handlePSBChange = (
        reportType: 'occupationalTherapy' | 'speechTherapy',
        tier: 'tier1' | 'tier2' | 'tier3' | 'tier4',
        field: string,
        value: any
    ) => {
        setReportData(prev => {
            const currentReport = prev[reportType];
            if (!currentReport) return prev;
            const currentPsb = currentReport.psb || { ...initialPSBData };
            const currentTier = currentPsb[tier] || {};
            
            return {
                ...prev,
                [reportType]: {
                    ...currentReport,
                    psb: {
                        ...currentPsb,
                        [tier]: {
                            ...currentTier,
                            [field]: value
                        }
                    }
                }
            };
        });
    };

    const getInitialState = (): AssessmentReport => {
        if (editingReport) {
            // Deep copy and ensure snapshot fields exist (migration for old data)
            const report = JSON.parse(JSON.stringify(editingReport));
            const linkedChild = children.find(c => c.id === report.childId);
            
            // Fallback to linked child data if snapshot data is missing
            if (!report.studentName && linkedChild) {
                report.studentName = linkedChild.name;
                report.studentBirthDate = linkedChild.birthDate;
                report.studentGender = linkedChild.gender;
                report.studentClass = linkedChild.className;
                report.studentParentName = linkedChild.parentName;
                report.studentMotherName = linkedChild.motherName;
                report.studentAddress = linkedChild.address;
                report.studentReligion = linkedChild.religion;
                report.studentPhone = linkedChild.phone;
                report.studentOriginSchool = linkedChild.originSchool;
            }
            return report;
        }
        return {
            id: '',
            childId: '',
            studentName: '',
            studentBirthDate: '',
            studentGender: 'Laki-Laki',
            studentClass: '',
            studentParentName: '',
            studentMotherName: '',
            studentAddress: '',
            studentReligion: '',
            studentPhone: '',
            studentOriginSchool: '',
            referredBy: '',
            assessmentDate: new Date().toISOString().split('T')[0],
            occupationalTherapy: undefined,
            speechTherapy: undefined,
            remedialTherapy: undefined,
            physiotherapy: undefined,
        };
    };

    const [reportData, setReportData] = useState(getInitialState);

    useEffect(() => {
        setReportData(getInitialState());
    }, [editingReport, isOpen]);

    if (!isOpen) return null;

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    // Specialized handler for student name input (manual + autocomplete)
    const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const foundChild = children.find(c => c.name.toLowerCase() === value.toLowerCase());

        if (foundChild) {
            // Autofill if found in master list
            setReportData(prev => ({
                ...prev,
                childId: foundChild.id,
                studentName: foundChild.name,
                studentBirthDate: foundChild.birthDate || '',
                studentGender: foundChild.gender || 'Laki-Laki',
                studentClass: foundChild.className || '',
                studentParentName: foundChild.parentName || '',
                studentMotherName: foundChild.motherName || '',
                studentAddress: foundChild.address || '',
                studentReligion: foundChild.religion || '',
                studentPhone: foundChild.phone || '',
                studentOriginSchool: foundChild.originSchool || '',
            }));
        } else {
            // Manual entry mode
            setReportData(prev => ({
                ...prev,
                childId: '', // Clear ID since it's a manual/new entry
                studentName: value,
            }));
        }
    };

    const handleNestedChange = <T extends any>(
        reportType: 'occupationalTherapy' | 'speechTherapy' | 'remedialTherapy' | 'physiotherapy',
        updates: Partial<T>
    ) => {
        setReportData(prev => ({
            ...prev,
            [reportType]: {
                ...(prev[reportType] as any),
                ...updates
            }
        }));
    };
    
    const handleDeepNestedChange = <T extends OccupationalTherapyReport | SpeechTherapyReport | RemedialTherapyReport | PhysiotherapyReport, K extends keyof T, F extends keyof T[K]>(
        reportType: 'occupationalTherapy' | 'speechTherapy' | 'remedialTherapy' | 'physiotherapy', field: K, subField: F, value: any
    ) => {
        setReportData(prev => ({
            ...prev,
            [reportType]: {
                ...prev[reportType],
                [field]: {
                    ...(prev[reportType] as T)[field],
                    [subField]: value
                }
            }
        }));
    };
    
    const handleSensoryModulationChange = (
        id: keyof OTSensoryModulation, field: 'response' | 'comment', value: string
    ) => {
        const currentSensory = reportData.occupationalTherapy!.sensoryModulation[id];
        handleDeepNestedChange<OccupationalTherapyReport, 'sensoryModulation', keyof OTSensoryModulation>('occupationalTherapy', 'sensoryModulation', id, {
            ...currentSensory,
            [field]: value
        });
    }

    const handleCheckboxGroupChange = (
        group: 'occupationalArea' | 'performanceSkills' | 'bodyFunction' | 'outcome',
        key: string, checked: boolean
    ) => {
        handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', {
            [group]: {
                ...(reportData.occupationalTherapy as OccupationalTherapyReport)[group],
                [key]: checked
            }
        } as Partial<OccupationalTherapyReport>);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportData.studentName) {
            alert("Nama siswa wajib diisi.");
            return;
        }
        onSave(reportData);
    };
    
    const toggleReport = (reportType: 'occupationalTherapy' | 'speechTherapy' | 'remedialTherapy' | 'physiotherapy') => {
        setReportData(prev => {
            let initialReport;
            switch(reportType) {
                case 'occupationalTherapy': initialReport = initialOTReport; break;
                case 'speechTherapy': initialReport = initialSTReport; break;
                case 'remedialTherapy': initialReport = initialRemedialReport; break;
                case 'physiotherapy': initialReport = initialPhysioReport; break;
            }
            return {
                ...prev,
                [reportType]: prev[reportType] ? undefined : initialReport
            };
        });
    };
    
    const renderContent = () => {
        const occupationalAreaOptions = [
            { key: 'adlsSelfCare', label: 'ADLs-Self care' }, { key: 'adlsControlSphincter', label: 'ADLs-Control Sphincter' },
            { key: 'adlsFunctionalMobility', label: 'ADLs-Functional Mobility' }, { key: 'adlsLocomotion', label: 'ADLs-Locomotion' },
            { key: 'iadls', label: 'IADLs' }, { key: 'restAndSleep', label: 'Rest and Sleep' },
            { key: 'educationalParticipation', label: 'Educational Participation' }, { key: 'play', label: 'Play' }, { key: 'leisure', label: 'Leisure' },
        ];
        const performanceSkillsOptions = [
            { key: 'sensoryPerceptualSkills', label: 'Sensory Perceptual Skills' }, { key: 'motorAndPraxisSkills', label: 'Motor and Praxis Skills' },
            { key: 'emotionalRegulationSkills', label: 'Emotional Regulation Skills' }, { key: 'cognitiveSkills', label: 'Cognitive Skills' },
            { key: 'communicationAndSocialSkills', label: 'Communication and Social Skills' },
        ];
        const bodyFunctionOptions = [
            { key: 'fungsiMental', label: 'Fungsi Mental' }, { key: 'fungsiMentalKhusus', label: 'Fungsi Mental Khusus' },
            { key: 'fungsiMentalPraxis', label: 'Fungsi Mental terkait Praxis' }, { key: 'fungsiSensori', label: 'Fungsi Sensori' },
            { key: 'nyeri', label: 'Nyeri' }, { key: 'fungsiNeuromuskuloskeletal', label: 'Fungsi neuromuskuloskeletal dan hubungan gerakan' },
            { key: 'fungsiSendi', label: 'Fungsi sendi dan tulang' }, { key: 'fungsiOtot', label: 'Fungsi Otot' },
            { key: 'fungsiGerakan', label: 'Fungsi Gerakan' }, { key: 'fungsiKardiovaskuler', label: 'Fungsi kardiovaskuler' },
            { key: 'modifikasi', label: 'Modifikasi (adaptasi,kompensasi)' }, { key: 'prevensi', label: 'Prevensi' },
        ];
        const outcomeOptions = [
            { key: 'improvement', label: 'Improvement' }, { key: 'enhancement', label: 'Enhancement' },
            { key: 'prevention', label: 'Prevention' }, { key: 'healthyAndWellbeing', label: 'Healthy and wellbeing' },
            { key: 'qualityOfLife', label: 'Quality of life' }, { key: 'participation', label: 'Participation' },
            { key: 'roleOfCompetencies', label: 'Role of Competencies' }, { key: 'welfare', label: 'Welfare' },
        ];

        switch(activeTab) {
            case 'general': {
                return (
                    <div>
                        <FormSection title="Informasi Umum Laporan">
                            <div className="md:col-span-1">
                                <label htmlFor="studentNameInput" className="block mb-2 text-xs font-medium text-muted">Nama Siswa</label>
                                <input 
                                    id="studentNameInput"
                                    list="child-options" 
                                    value={reportData.studentName} 
                                    onChange={handleStudentNameChange} 
                                    className="bg-background border border-surface-light/50 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                                    placeholder="Ketik nama siswa..." 
                                    autoComplete="off"
                                />
                                <datalist id="child-options">
                                    {children.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                                {reportData.childId ? <p className="text-xs text-success mt-1">Terhubung dengan data master: {reportData.childId}</p> : <p className="text-xs text-warning mt-1">Input Manual (Data master tidak terhubung)</p>}
                            </div>
                            <FormInput label="Tanggal Assesment Utama" name="assessmentDate" type="date" value={reportData.assessmentDate} onChange={handleGeneralChange}/>
                        </FormSection>
            
                        <FormSection title="Detail Siswa (Dapat Diedit)">
                            <div className="md:col-span-2 space-y-2">
                                <FormInput label="Nama Lengkap" name="studentName" value={reportData.studentName} onChange={handleGeneralChange} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Tanggal Lahir" name="studentBirthDate" type="date" value={reportData.studentBirthDate} onChange={handleGeneralChange} />
                                    <FormSelect label="Jenis Kelamin" name="studentGender" value={reportData.studentGender} onChange={handleGeneralChange}>
                                        <option value="Laki-Laki">Laki-Laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </FormSelect>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Kelas" name="studentClass" value={reportData.studentClass} onChange={handleGeneralChange} />
                                    <FormInput label="Agama" name="studentReligion" value={reportData.studentReligion} onChange={handleGeneralChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Nama Ayah" name="studentParentName" value={reportData.studentParentName} onChange={handleGeneralChange} />
                                    <FormInput label="Nama Ibu" name="studentMotherName" value={reportData.studentMotherName} onChange={handleGeneralChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="No. HP" name="studentPhone" value={reportData.studentPhone} onChange={handleGeneralChange} />
                                    <FormInput label="Asal Sekolah" name="studentOriginSchool" value={reportData.studentOriginSchool} onChange={handleGeneralChange} />
                                </div>
                                <FormInput label="Dirujuk Oleh" name="referredBy" value={reportData.referredBy} onChange={handleGeneralChange} />
                                <TextArea label="Alamat" name="studentAddress" value={reportData.studentAddress} onChange={(e: any) => handleGeneralChange(e)} />
                            </div>
                        </FormSection>
                    </div>
                );
            }
            case 'ot': {
                if (!reportData.occupationalTherapy) {
                    return <div className="text-center p-8"><button type="button" onClick={() => toggleReport('occupationalTherapy')} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">Tambahkan Laporan Okupasi Terapi</button></div>;
                }
                const otData = reportData.occupationalTherapy;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-surface-light pb-3">
                            <button
                                type="button"
                                onClick={() => setOtSubTab('main')}
                                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
                                    otSubTab === 'main' ? 'bg-primary text-background shadow' : 'bg-surface-light/40 text-muted hover:text-white'
                                }`}
                            >
                                📋 Form Utama Okupasi Terapi
                            </button>
                            <button
                                type="button"
                                onClick={() => setOtSubTab('psb')}
                                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                                    otSubTab === 'psb' ? 'bg-amber-500 text-background shadow' : 'bg-surface-light/40 text-muted hover:text-white'
                                }`}
                            >
                                <span className="px-1.5 py-0.5 text-[10px] bg-amber-900/40 text-amber-300 rounded font-black border border-amber-400/30">PSB</span>
                                🏫 Form PSB (Saran & Dukungan Inklusi)
                            </button>
                        </div>

                        {otSubTab === 'psb' ? (
                            <PSBFormComponent
                                psbData={otData.psb}
                                onChange={(tier, field, val) => handlePSBChange('occupationalTherapy', tier, field, val)}
                            />
                        ) : (
                            <div>
                                <FormSection title="Detail Pemeriksaan OT">
                                     <FormSelect label="Nama Pemeriksa (Terapis)" name="examinerName" value={otData.examinerName} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinerName: e.target.value })}>
                                        <option value="">Pilih Terapis</option>
                                        {therapists.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </FormSelect>
                                     <FormInput label="Pemeriksaan ke" name="examinationNumber" type="number" value={otData.examinationNumber} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinationNumber: parseInt(e.target.value) || 1 })}/>
                                     <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormInput label="Tgl Periksa 1" name="examinationDate1" type="date" value={otData.examinationDate1 || ''} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinationDate1: e.target.value })}/>
                                        <FormInput label="Tgl Periksa 2" name="examinationDate2" type="date" value={otData.examinationDate2 || ''} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinationDate2: e.target.value })}/>
                                        <FormInput label="Tgl Periksa 3" name="examinationDate3" type="date" value={otData.examinationDate3 || ''} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinationDate3: e.target.value })}/>
                                        <FormInput label="Tgl Periksa 4" name="examinationDate4" type="date" value={otData.examinationDate4 || ''} onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { examinationDate4: e.target.value })}/>
                                     </div>
                                </FormSection>
                                 <FormSection title="Pengamatan Umum">
                                    <TextArea label="Reaksi Terhadap Pemeriksa" name="reactionToExaminer" value={otData.generalObservation.reactionToExaminer} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'generalObservation', 'reactionToExaminer'>('occupationalTherapy', 'generalObservation', 'reactionToExaminer', e.target.value)} />
                                    <TextArea label="Reaksi Terhadap Pemeriksaan" name="reactionToExamination" value={otData.generalObservation.reactionToExamination} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'generalObservation', 'reactionToExamination'>('occupationalTherapy', 'generalObservation', 'reactionToExamination', e.target.value)} />
                                    <TextArea label="Perilaku yang Mencolok" name="conspicuousBehavior" value={otData.generalObservation.conspicuousBehavior} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'generalObservation', 'conspicuousBehavior'>('occupationalTherapy', 'generalObservation', 'conspicuousBehavior', e.target.value)} />
                                    <TextArea label="Pengamatan Keadaan Hasrat / Semangat" name="desireSpirit" value={otData.generalObservation.desireSpirit} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'generalObservation', 'desireSpirit'>('occupationalTherapy', 'generalObservation', 'desireSpirit', e.target.value)} />
                                </FormSection>
                                <FormSection title="Pengamatan Sensori Modulasi" columns={1}>
                                   <SensoryModulationInput label="a. Respon terhadap input Taktil" id="tactile" data={otData.sensoryModulation.tactile} onChange={handleSensoryModulationChange} />
                                   <SensoryModulationInput label="b. Respon terhadap input Proprioseptif" id="proprioceptive" data={otData.sensoryModulation.proprioceptive} onChange={handleSensoryModulationChange} />
                                   <SensoryModulationInput label="c. Respon terhadap Input Vestibular" id="vestibular" data={otData.sensoryModulation.vestibular} onChange={handleSensoryModulationChange} />
                                   <SensoryModulationInput label="d. Respon terhadap Input Auditori" id="auditory" data={otData.sensoryModulation.auditory} onChange={handleSensoryModulationChange} />
                                   <SensoryModulationInput label="e. Respon Terhadap Input Visual" id="visual" data={otData.sensoryModulation.visual} onChange={handleSensoryModulationChange} />
                                </FormSection>
                                <FormSection title="Proses Sensori Kombinasi & FEDC" columns={1}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput label="Performa (Visual + Vestibular + Proprioseptif)" name="combinedPerformance" value={otData.combinedSensory.performance} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'combinedSensory', 'performance'>('occupationalTherapy', 'combinedSensory', 'performance', e.target.value)} />
                                        <TextArea label="Komentar (Proses Sensori Kombinasi)" name="combinedComment" value={otData.combinedSensory.comment} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'combinedSensory', 'comment'>('occupationalTherapy', 'combinedSensory', 'comment', e.target.value)} span={1} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TextArea label="Regulation and Attention" name="fedcRegulation" value={otData.fedc.regulationAndAttention} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'regulationAndAttention'>('occupationalTherapy', 'fedc', 'regulationAndAttention', e.target.value)} span={1} />
                                        <TextArea label="Engagement and Relating" name="fedcEngagement" value={otData.fedc.engagementAndRelating} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'engagementAndRelating'>('occupationalTherapy', 'fedc', 'engagementAndRelating', e.target.value)} span={1} />
                                        <TextArea label="Purposeful Communication" name="fedcPurposeful" value={otData.fedc.purposefulCommunication} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'purposefulCommunication'>('occupationalTherapy', 'fedc', 'purposefulCommunication', e.target.value)} span={1} />
                                        <TextArea label="Complex Communication" name="fedcComplex" value={otData.fedc.complexCommunication} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'complexCommunication'>('occupationalTherapy', 'fedc', 'complexCommunication', e.target.value)} span={1} />
                                        <TextArea label="Creative and Meaningful of ideas" name="fedcCreative" value={otData.fedc.creativeAndMeaningful} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'creativeAndMeaningful'>('occupationalTherapy', 'fedc', 'creativeAndMeaningful', e.target.value)} span={1} />
                                        <TextArea label="Building Logical Bridges" name="fedcLogical" value={otData.fedc.buildingLogicalBridges} onChange={e => handleDeepNestedChange<OccupationalTherapyReport, 'fedc', 'buildingLogicalBridges'>('occupationalTherapy', 'fedc', 'buildingLogicalBridges', e.target.value)} span={1} />
                                    </div>
                                </FormSection>
                                <FormSection title="IV. Rekomendasi" columns={1}>
                                    <TextArea 
                                        label="Rekomendasi Terapi Okupasi" 
                                        name="recommendation" 
                                        value={otData.recommendation || ''} 
                                        onChange={e => handleNestedChange<OccupationalTherapyReport>('occupationalTherapy', { recommendation: e.target.value })} 
                                        rows={6}
                                    />
                                </FormSection>
                                 <FormSection title="V. Occupational Therapy Intervention" columns={2}>
                                   <ChecklistGroup title="Area Okupasional" options={occupationalAreaOptions} values={otData.occupationalArea} onChange={(key, checked) => handleCheckboxGroupChange('occupationalArea', key, checked)} />
                                   <ChecklistGroup title="Performance Skills" options={performanceSkillsOptions} values={otData.performanceSkills} onChange={(key, checked) => handleCheckboxGroupChange('performanceSkills', key, checked)} />
                                   <ChecklistGroup title="Body Function" options={bodyFunctionOptions} values={otData.bodyFunction} onChange={(key, checked) => handleCheckboxGroupChange('bodyFunction', key, checked)} />
                                   <ChecklistGroup title="Occupational Therapy Outcome" options={outcomeOptions} values={otData.outcome} onChange={(key, checked) => handleCheckboxGroupChange('outcome', key, checked)} />
                                   <div className="md:col-span-1">
                                       <ChecklistGroup 
                                            title="Metode Intervensi" 
                                            options={[
                                                { key: 'preparationAndTask', label: '1. Persiapan dan tugas' },
                                                { key: 'educationAndTraining', label: '2. Edukasi dan Training' },
                                                { key: 'advocacy', label: '3. Advokasi' },
                                                { key: 'groupIntervention', label: '4. Intervensi Kelompok' },
                                            ]} 
                                            values={otData.interventionMethods || {}} 
                                            onChange={(key, checked) => {
                                                handleDeepNestedChange<OccupationalTherapyReport, 'interventionMethods', any>('occupationalTherapy', 'interventionMethods', key as any, checked);
                                            }} 
                                        />
                                   </div>
                                   <div className="md:col-span-1 space-y-4">
                                        <FormInput label="Frekuensi Pemberian Intervensi" name="interventionFrequency" value={otData.interventionFrequency} onChange={e => handleNestedChange('occupationalTherapy', { interventionFrequency: e.target.value })}/>
                                        <FormInput label="Lamanya Program Intervensi" name="programDuration" value={otData.programDuration} onChange={e => handleNestedChange('occupationalTherapy', { programDuration: e.target.value })}/>
                                   </div>
                                </FormSection>
                            </div>
                        )}
                        <button type="button" onClick={() => toggleReport('occupationalTherapy')} className="text-danger text-sm mt-4">Hapus Laporan Okupasi Terapi</button>
                    </div>
                );
            }
             case 'st': {
                if (!reportData.speechTherapy) {
                    return <div className="text-center p-8"><button type="button" onClick={() => toggleReport('speechTherapy')} className="bg-violet-500 text-white font-bold py-2 px-4 rounded-lg">Tambahkan Laporan Terapi Wicara</button></div>;
                }
                const stData = reportData.speechTherapy;
                const handleAbilityChange = (field: keyof STAbilities, value: any) => {
                    handleDeepNestedChange<SpeechTherapyReport, 'abilities', keyof STAbilities>('speechTherapy', 'abilities', field, value);
                };

                return (
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-surface-light pb-3">
                            <button
                                type="button"
                                onClick={() => setStSubTab('main')}
                                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
                                    stSubTab === 'main' ? 'bg-violet-600 text-white shadow' : 'bg-surface-light/40 text-muted hover:text-white'
                                }`}
                            >
                                📋 Form Utama Terapi Wicara
                            </button>
                            <button
                                type="button"
                                onClick={() => setStSubTab('psb')}
                                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                                    stSubTab === 'psb' ? 'bg-amber-500 text-background shadow' : 'bg-surface-light/40 text-muted hover:text-white'
                                }`}
                            >
                                <span className="px-1.5 py-0.5 text-[10px] bg-amber-900/40 text-amber-300 rounded font-black border border-amber-400/30">PSB</span>
                                🏫 Form PSB (Saran & Dukungan Inklusi)
                            </button>
                        </div>

                        {stSubTab === 'psb' ? (
                            <PSBFormComponent
                                psbData={stData.psb}
                                onChange={(tier, field, val) => handlePSBChange('speechTherapy', tier, field, val)}
                            />
                        ) : (
                            <div>
                                <FormSection title="Detail Pemeriksaan TW">
                                     <FormSelect label="Nama Pemeriksa (Terapis)" name="examinerName" value={stData.examinerName} onChange={e => handleNestedChange<SpeechTherapyReport>('speechTherapy', { examinerName: e.target.value })}>
                                        <option value="">Pilih Terapis</option>
                                        {therapists.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </FormSelect>
                                    <FormInput label="Tanggal Pemeriksaan" name="examinationDate" type="date" value={stData.examinationDate} onChange={e => handleNestedChange<SpeechTherapyReport>('speechTherapy', { examinationDate: e.target.value })}/>
                                </FormSection>
                                <FormSection title="Tujuan & Gambaran" columns={1}>
                                    <TextArea label="Tujuan Pemeriksaan" name="examinationPurpose" value={stData.examinationPurpose} onChange={e => handleNestedChange<SpeechTherapyReport>('speechTherapy', { examinationPurpose: e.target.value })} rows={5} />
                                    <TextArea label="Gambaran Umum Siswa" name="generalOverview" value={stData.generalOverview} onChange={e => handleNestedChange<SpeechTherapyReport>('speechTherapy', { generalOverview: e.target.value })} rows={8} />
                                </FormSection>
                                
                                <FormSection title="Keterampilan / Kemampuan Saat Ini" columns={1}>
                                    <AbilitiesTable 
                                        title1="Motorik" fields1={[{key: 'motorikKasar', label: 'Motorik Kasar'}, {key: 'motorikHalus', label: 'Motorik Halus'}, {key: 'visualMotorCoordination', label: 'Visual Motor Koordinasi'}]}
                                        title2="Sensorik" fields2={[{key: 'penglihatan', label: 'Penglihatan'}, {key: 'pendengaran', label: 'Pendengaran'}, {key: 'taktilKinestetik', label: 'Taktil Kinestetik'}]}
                                        commentKey="motorikComment" commentValue={stData.abilities.motorikComment}
                                        abilities={stData.abilities} onChange={handleAbilityChange}
                                    />
                                     <AbilitiesTable 
                                        title1="Bahasa" fields1={[{key: 'reseptif', label: 'Reseptif'}, {key: 'ekspresif', label: 'Ekspresif'}]}
                                        title2="Wicara" fields2={[{key: 'bunyi', label: 'Bunyi'}, {key: 'fonem', label: 'Fonem'}]}
                                        commentKey="bahasaComment" commentValue={stData.abilities.bahasaComment}
                                        abilities={stData.abilities} onChange={handleAbilityChange}
                                    />
                                     <AbilitiesTable 
                                        title1="Suara" fields1={[{key: 'pernafasan', label: 'Pernafasan'}, {key: 'penyaringan', label: 'Penyaringan'}, {key: 'nada', label: 'Nada'}]}
                                        title2="Irama & Kelancaran" fields2={[{key: 'iramaNada', label: 'Nada'}, {key: 'kecepatanBicara', label: 'Kecepatan Bicara'}]}
                                        commentKey="suaraComment" commentValue={stData.abilities.suaraComment} commentLabel="Komentar Suara & Irama"
                                        abilities={stData.abilities} onChange={handleAbilityChange}
                                    />
                                    <AbilitiesTable 
                                        title1="Menelan" fields1={[
                                            {key: 'organMulut', label: 'Organ mulut'}, 
                                            {key: 'sikat', label: 'Sikat'}, 
                                            {key: 'gerakanBibir', label: 'Gerakan bibir'},
                                            {key: 'gerakanLidah', label: 'Gerakan lidah'}, 
                                            {key: 'gerakanKunyah', label: 'Gerakan kunyah'}
                                        ]}
                                        title2="Tingkah Laku" fields2={[
                                            {key: 'hisap', label: 'Hisap'},
                                            {key: 'tiup', label: 'Tiup'}, 
                                            {key: 'kembungPipi', label: 'Kembung pipi'}, 
                                            {key: 'batuk', label: 'Batuk'},
                                            {key: 'reflekMuntah', label: 'Reflek muntah'}
                                        ]}
                                        commentKey="menelanComment" commentValue={stData.abilities.menelanComment}
                                        abilities={stData.abilities} onChange={handleAbilityChange}
                                    />
                                </FormSection>

                                <FormSection title="Rekomendasi" columns={1}>
                                    <TextArea label="Rekomendasi Terapi Wicara" name="recommendation" value={stData.recommendation} onChange={e => handleNestedChange<SpeechTherapyReport>('speechTherapy', { recommendation: e.target.value })} />
                                </FormSection>
                            </div>
                        )}
                        <button type="button" onClick={() => toggleReport('speechTherapy')} className="text-danger text-sm mt-4">Hapus Laporan Terapi Wicara</button>
                    </div>
                );
            }
            case 'remedial':
                if (!reportData.remedialTherapy) {
                    return <div className="text-center p-8"><button type="button" onClick={() => toggleReport('remedialTherapy')} className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg">Tambahkan Laporan Remedial Terapi</button></div>;
                }
                const remData = reportData.remedialTherapy;
                
                const handleRemSectionChange = (sectionKey: 'academicSkills' | 'languageLiteracySkills' | 'writingSkills' | 'focusConcentrationSkills', updates: Partial<RemedialSection>) => {
                    setReportData(prev => ({
                        ...prev,
                        remedialTherapy: {
                            ...prev.remedialTherapy!,
                            [sectionKey]: {
                                ...prev.remedialTherapy![sectionKey],
                                ...updates
                            }
                        }
                    }));
                };

                return (
                    <div className="space-y-6">
                        <FormSection title="Detail Pemeriksaan Remedial">
                             <FormSelect label="Nama Pemeriksa (Remedial Terapis)" name="examinerName" value={remData.examinerName} onChange={e => handleNestedChange<RemedialTherapyReport>('remedialTherapy', { examinerName: e.target.value })}>
                                <option value="">Pilih Terapis</option>
                                {therapists.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </FormSelect>
                            <FormInput label="Tanggal Pemeriksaan" name="examinationDate" type="date" value={remData.examinationDate} onChange={e => handleNestedChange<RemedialTherapyReport>('remedialTherapy', { examinationDate: e.target.value })}/>
                        </FormSection>

                        <div className="space-y-8">
                            <RemedialSectionForm title="Kemampuan Akademik" sectionKey="academicSkills" data={remData.academicSkills} onChange={handleRemSectionChange} />
                            <RemedialSectionForm title="Kemampuan Bahasa dan Literasi" sectionKey="languageLiteracySkills" data={remData.languageLiteracySkills} onChange={handleRemSectionChange} />
                            <RemedialSectionForm title="Kemampuan Menulis" sectionKey="writingSkills" data={remData.writingSkills} onChange={handleRemSectionChange} />
                            <RemedialSectionForm title="Kemampuan Fokus dan Konsentrasi" sectionKey="focusConcentrationSkills" data={remData.focusConcentrationSkills} onChange={handleRemSectionChange} />
                        </div>

                        <FormSection title="Follow Up" columns={1}>
                            <div className="space-y-4">
                                <ul className="space-y-2">
                                    {remData.followUp.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center p-3 bg-surface-light/10 rounded-lg group border border-surface-light/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                                                <span className="text-sm text-white leading-relaxed">{item}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleNestedChange<RemedialTherapyReport>('remedialTherapy', { followUp: remData.followUp.filter((_, i) => i !== idx) })}
                                                className="text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-danger/10 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        id="new-followup-input" 
                                        placeholder="Tambah item follow up..." 
                                        className="bg-background border border-surface-light/50 text-white text-sm rounded-lg block w-full p-2.5 focus:border-primary outline-none transition-colors"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val) {
                                                    handleNestedChange<RemedialTherapyReport>('remedialTherapy', { followUp: [...remData.followUp, val] });
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('new-followup-input') as HTMLInputElement;
                                            const val = input.value.trim();
                                            if (val) {
                                                handleNestedChange<RemedialTherapyReport>('remedialTherapy', { followUp: [...remData.followUp, val] });
                                                input.value = '';
                                            }
                                        }}
                                        className="bg-primary px-4 py-2.5 rounded-lg text-background font-bold hover:bg-primary-dark transition flex items-center gap-2"
                                    >
                                        <Plus size={18} /> Tambah
                                    </button>
                                </div>
                            </div>
                        </FormSection>
                        <button type="button" onClick={() => toggleReport('remedialTherapy')} className="text-danger text-sm mt-4">Hapus Laporan Remedial Terapi</button>
                    </div>
                );
            case 'physio':
                if (!reportData.physiotherapy) {
                    return <div className="text-center p-8"><button type="button" onClick={() => toggleReport('physiotherapy')} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Tambahkan Laporan Fisioterapi</button></div>;
                }
                const physioData = reportData.physiotherapy;

                const handlePhysioBehaviorChange = (key: keyof PhysioGeneralBehavior, type: 'awal' | 'hasil', field: 'teramati' | 'tidak', value: boolean) => {
                    const current = physioData.generalBehavior[key] as PhysioAwalHasil<PhysioResponsePair>;
                    const updated = {
                        ...current,
                        [type]: {
                            ...current[type],
                            [field]: value,
                            [field === 'teramati' ? 'tidak' : 'teramati']: value ? false : current[type][field === 'teramati' ? 'tidak' : 'teramati']
                        }
                    };
                    handleDeepNestedChange<PhysiotherapyReport, 'generalBehavior', any>('physiotherapy', 'generalBehavior', key, updated);
                };

                const handlePhysioItemChange = (section: 'sensoryModulation' | 'motorSkills' | 'physicalFunctional', subSection: string, index: number, field: 'awal' | 'hasil', value: any) => {
                    const sectionData = physioData[section] as any;
                    const items = [...sectionData[subSection]];
                    items[index] = { ...items[index], [field]: value };
                    setReportData(prev => ({
                        ...prev,
                        physiotherapy: {
                            ...prev.physiotherapy!,
                            [section]: {
                                ...prev.physiotherapy![section],
                                [subSection]: items
                            }
                        }
                    }));
                };

                return (
                    <div className="space-y-6">
                        <FormSection title="Detail Pemeriksaan Fisioterapi">
                             <FormSelect label="Nama Pemeriksa (Fisioterapis)" name="examinerName" value={physioData.examinerName} onChange={e => handleNestedChange<PhysiotherapyReport>('physiotherapy', { examinerName: e.target.value })}>
                                <option value="">Pilih Terapis</option>
                                {therapists.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </FormSelect>
                            <FormInput label="Tanggal Pemeriksaan" name="examinationDate" type="date" value={physioData.examinationDate} onChange={e => handleNestedChange<PhysiotherapyReport>('physiotherapy', { examinationDate: e.target.value })}/>
                        </FormSection>

                        <FormSection title="A. Perilaku Umum" columns={1}>
                            <div className="overflow-x-auto border border-surface-light/30 rounded-lg bg-background/40">
                                <table className="w-full text-xs text-left text-white border-collapse">
                                    <thead>
                                        <tr className="border-b border-surface-light bg-blue-600/10">
                                            <th className="p-3">RESPON</th>
                                            <th className="p-3 text-center border-l border-surface-light/20 w-32">AWAL</th>
                                            <th className="p-3 text-center border-l border-surface-light/20 w-32">HASIL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-light/20">
                                        {[
                                            { key: 'interaction', label: 'Ada upaya terlibat interaksi dengan terapis' },
                                            { key: 'followCommand', label: 'Mengikuti perintah' },
                                            { key: 'exploration', label: 'Terlibat dalam perilaku eksplorasi' },
                                            { key: 'emotionalIdea', label: 'Mengelola ide emosional' },
                                            { key: 'organizeBehavior', label: 'Mengorganisir perilaku untuk menyelesaikan tugas dengan sukses' },
                                        ].map((item) => (
                                            <PhysioBehaviorRow 
                                                key={item.key} 
                                                label={item.label} 
                                                value={physioData.generalBehavior[item.key as keyof PhysioGeneralBehavior] as PhysioAwalHasil<PhysioResponsePair>}
                                                onChange={val => {
                                                    handleNestedChange('physiotherapy', {
                                                        generalBehavior: {
                                                            ...physioData.generalBehavior,
                                                            [item.key]: val
                                                        }
                                                    });
                                                }}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <TextArea label="Komentar Perilaku Umum" name="behaviorComment" value={physioData.generalBehavior.comment} onChange={e => handleDeepNestedChange<PhysiotherapyReport, 'generalBehavior', 'comment'>('physiotherapy', 'generalBehavior', 'comment', e.target.value)} rows={4} />
                        </FormSection>

                        <FormSection title="B. Sensory Processing" columns={1}>
                            <PhysioSensoryTable items={physioData.sensoryModulation.items} onChange={(idx, field, val) => handlePhysioItemChange('sensoryModulation', 'items', idx, field, val)} />
                            <TextArea label="Komentar Sensori" name="sensoryComment" value={physioData.sensoryModulation.comment} onChange={e => handleDeepNestedChange<PhysiotherapyReport, 'sensoryModulation', 'comment'>('physiotherapy', 'sensoryModulation', 'comment', e.target.value)} rows={4} />
                        </FormSection>

                        <FormSection title="C. Perkembangan Kemampuan Motorik" columns={1}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PhysioMotorTable title="1. MOTORIK KASAR" subSection="grossMotor" items={physioData.motorSkills.grossMotor} onChange={(idx, field, val) => handlePhysioItemChange('motorSkills', 'grossMotor', idx, field, val)} />
                                <PhysioMotorTable title="2. MOTORIK HALUS" subSection="fineMotor" items={physioData.motorSkills.fineMotor} onChange={(idx, field, val) => handlePhysioItemChange('motorSkills', 'fineMotor', idx, field, val)} />
                            </div>
                            <TextArea label="Komentar Motorik" name="motorComment" value={physioData.motorSkills.comment} onChange={e => handleDeepNestedChange<PhysiotherapyReport, 'motorSkills', 'comment'>('physiotherapy', 'motorSkills', 'comment', e.target.value)} rows={4}/>
                        </FormSection>

                        <FormSection title="D. Perkembangan Fisik dan Fungsional" columns={1}>
                             <div className="space-y-4">
                                <PhysioGMFMTable title="GMFM (Gross Motor Function Measure)" subSection="gmfm" items={physioData.physicalFunctional.gmfm} onChange={(idx, field, val) => handlePhysioItemChange('physicalFunctional', 'gmfm', idx, field, val)} 
                                    legend="0: Tidak Memulai, 1: Memulai, 2: Melakukan sebagian, 3: Melakukan Sempurna" />
                                <PhysioGMFMTable title="Integrasi Sensorik" subSection="sensoryIntegration" items={physioData.physicalFunctional.sensoryIntegration} onChange={(idx, field, val) => handlePhysioItemChange('physicalFunctional', 'sensoryIntegration', idx, field, val)} 
                                    legend="0: Tidak Mampu, 1: Respon Kurang/Berlebihan, 2: Respon Sesuai tapi Belum Stabil, 3: Respon Sesuai dan Stabil" />
                             </div>
                             <TextArea label="Komentar Fisik dan Fungsional" name="physioComment" value={physioData.physicalFunctional.comment} onChange={e => handleDeepNestedChange<PhysiotherapyReport, 'physicalFunctional', 'comment'>('physiotherapy', 'physicalFunctional', 'comment', e.target.value)} rows={4} />
                        </FormSection>

                        <FormSection title="E. FOLLOW UP" columns={1}>
                             <div className="space-y-2">
                                {physioData.followUp.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-surface-light/5 p-2 rounded border border-surface-light/20">
                                        <span className="text-muted font-bold text-xs">{idx + 1}.</span>
                                        <input type="text" value={item} onChange={e => {
                                            const updated = [...physioData.followUp];
                                            updated[idx] = e.target.value;
                                            handleNestedChange('physiotherapy', { followUp: updated });
                                        }} className="w-full bg-transparent border-none focus:ring-0 text-sm py-1" placeholder="Masukkan follow up..." />
                                        <button type="button" onClick={() => handleNestedChange('physiotherapy', { followUp: physioData.followUp.filter((_, i) => i !== idx) })} className="p-1.5 text-danger hover:bg-danger/10 rounded transition"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleNestedChange('physiotherapy', { followUp: [...physioData.followUp, ''] })} className="w-full py-2 border border-dashed border-primary/30 rounded text-primary text-xs font-bold hover:bg-primary/5 transition flex items-center justify-center gap-1"><Plus size={14}/> Tambah Follow Up</button>
                             </div>
                        </FormSection>

                        <FormSection title="F. HOME PROGRAM" columns={1}>
                              <div className="overflow-hidden border border-surface-light/30 rounded-lg bg-background/40">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-indigo-600/20 border-b border-surface-light/30 text-white font-bold">
                                            <th className="p-2.5">Aktivitas</th>
                                            <th className="p-2.5 border-l border-surface-light/20">Frekuensi</th>
                                            <th className="p-2.5 border-l border-surface-light/20">Durasi</th>
                                            <th className="p-2.5 border-l border-surface-light/20 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-light/20">
                                        {physioData.homeProgram.map((prog, idx) => (
                                            <tr key={idx} className="hover:bg-surface-light/5">
                                                <td className="p-1"><input type="text" value={prog.activity} onChange={e => {
                                                    const updated = [...physioData.homeProgram];
                                                    updated[idx] = { ...updated[idx], activity: e.target.value };
                                                    handleNestedChange('physiotherapy', { homeProgram: updated });
                                                }} className="w-full bg-transparent border-none focus:ring-0 p-1.5" placeholder="Nama aktivitas..." /></td>
                                                <td className="p-1 border-l border-surface-light/20"><input type="text" value={prog.frequency} onChange={e => {
                                                    const updated = [...physioData.homeProgram];
                                                    updated[idx] = { ...updated[idx], frequency: e.target.value };
                                                    handleNestedChange('physiotherapy', { homeProgram: updated });
                                                }} className="w-full bg-transparent border-none focus:ring-0 p-1.5 text-center" placeholder="Misal: Setiap Hari" /></td>
                                                <td className="p-1 border-l border-surface-light/20"><input type="text" value={prog.duration} onChange={e => {
                                                    const updated = [...physioData.homeProgram];
                                                    updated[idx] = { ...updated[idx], duration: e.target.value };
                                                    handleNestedChange('physiotherapy', { homeProgram: updated });
                                                }} className="w-full bg-transparent border-none focus:ring-0 p-1.5 text-center" placeholder="Misal: 15 Menit" /></td>
                                                <td className="p-1 border-l border-surface-light/20"><button type="button" onClick={() => handleNestedChange('physiotherapy', { homeProgram: physioData.homeProgram.filter((_, i) => i !== idx) })} className="p-1.5 text-danger hover:bg-danger/10 rounded transition mx-auto block"><Trash2 size={14}/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button type="button" onClick={() => handleNestedChange('physiotherapy', { homeProgram: [...physioData.homeProgram, { activity: '', frequency: '', duration: '' }] })} className="w-full py-2 border-t border-surface-light/30 text-primary text-xs font-bold hover:bg-primary/5 transition flex items-center justify-center gap-1"><Plus size={14}/> Tambah Program</button>
                              </div>
                        </FormSection>
                        <button type="button" onClick={() => toggleReport('physiotherapy')} className="text-danger text-sm mt-4">Hapus Laporan Fisioterapi</button>
                    </div>
                );
        }
    }
    
    const tabClass = (tabName: 'general' | 'ot' | 'st' | 'remedial' | 'physio') => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none whitespace-nowrap ${
            activeTab === tabName 
            ? 'bg-primary/10 text-primary border-b-2 border-primary' 
            : 'text-text-muted hover:bg-surface-light hover:text-text-heading'
        }`;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up" onClick={onClose}>
            <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-5xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-surface-light flex-shrink-0 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{editingReport ? 'Edit' : 'Buat'} Laporan Assesment</h3>
                     <button type="button" onClick={onClose} className="text-muted hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSave} className="flex-grow flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 border-b border-surface-light">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>Informasi Umum</button>
                            <button type="button" onClick={() => setActiveTab('ot')} className={tabClass('ot')}>Okupasi Terapi</button>
                            <button type="button" onClick={() => setActiveTab('st')} className={tabClass('st')}>Terapi Wicara</button>
                            <button type="button" onClick={() => setActiveTab('remedial')} className={tabClass('remedial')}>Remedial</button>
                            <button type="button" onClick={() => setActiveTab('physio')} className={tabClass('physio')}>Fisioterapi</button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto">
                       {renderContent()}
                    </div>
                     <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0 mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg hover:bg-surface-light/50 transition">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-dark transition">Simpan Laporan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// #endregion Form Modal Component


// #region Main Page Component

export interface ReportExaminerDetail {
    therapyKey: 'OT' | 'ST' | 'Remedial' | 'Physio';
    therapyLabel: string;
    examinerName: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
    iconEmoji: string;
}

const getAllExaminers = (report: AssessmentReport): ReportExaminerDetail[] => {
    const list: ReportExaminerDetail[] = [];

    if (report.occupationalTherapy?.examinerName) {
        list.push({
            therapyKey: 'OT',
            therapyLabel: 'Okupasi (OT)',
            examinerName: report.occupationalTherapy.examinerName,
            badgeBg: 'bg-emerald-500/10',
            badgeText: 'text-emerald-300',
            badgeBorder: 'border-emerald-500/30',
            dotColor: 'bg-emerald-400',
            iconEmoji: '🩺'
        });
    }

    if (report.speechTherapy?.examinerName) {
        list.push({
            therapyKey: 'ST',
            therapyLabel: 'Wicara (TW)',
            examinerName: report.speechTherapy.examinerName,
            badgeBg: 'bg-cyan-500/10',
            badgeText: 'text-cyan-300',
            badgeBorder: 'border-cyan-500/30',
            dotColor: 'bg-cyan-400',
            iconEmoji: '🗣️'
        });
    }

    if (report.remedialTherapy?.examinerName) {
        list.push({
            therapyKey: 'Remedial',
            therapyLabel: 'Remedial',
            examinerName: report.remedialTherapy.examinerName,
            badgeBg: 'bg-amber-500/10',
            badgeText: 'text-amber-300',
            badgeBorder: 'border-amber-500/30',
            dotColor: 'bg-amber-400',
            iconEmoji: '📚'
        });
    }

    if (report.physiotherapy?.examinerName) {
        list.push({
            therapyKey: 'Physio',
            therapyLabel: 'Fisioterapi (FT)',
            examinerName: report.physiotherapy.examinerName,
            badgeBg: 'bg-purple-500/10',
            badgeText: 'text-purple-300',
            badgeBorder: 'border-purple-500/30',
            dotColor: 'bg-purple-400',
            iconEmoji: '🏃'
        });
    }

    return list;
};

const AssessmentReportPage: React.FC<{
    reports: AssessmentReport[];
    children: MasterChild[];
    therapists: Therapist[];
    onAddReport: (report: Omit<AssessmentReport, 'id'>) => void;
    onUpdateReport: (report: AssessmentReport) => void;
    onDeleteReport: (reportId: string) => void;
    logoUrl: string;
    therapyTypes: TherapyDefinition[];
    userRole: UserRole;
}> = ({ reports, children, therapists, onAddReport, onUpdateReport, onDeleteReport, logoUrl, therapyTypes, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [therapyFilter, setTherapyFilter] = useState<'ALL' | 'OT' | 'ST' | 'REMEDIAL' | 'PHYSIO'>('ALL');
    const [examinerFilter, setExaminerFilter] = useState('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<AssessmentReport | null>(null);
    const [reportToPrint, setReportToPrint] = useState<AssessmentReport | null>(null);
    const [autoPrint, setAutoPrint] = useState<boolean>(false);

    const handleViewPdf = (report: AssessmentReport) => {
        setAutoPrint(false);
        setReportToPrint(report);
    };

    const handlePrintA4 = (report: AssessmentReport) => {
        setAutoPrint(true);
        setReportToPrint(report);
    };

    const childMap = useMemo(() => new Map(children.map(c => [c.id, c])), [children]);

    // Unique list of all examiners from existing reports + therapist directory
    const availableExaminers = useMemo(() => {
        const namesSet = new Set<string>();
        therapists.forEach(t => namesSet.add(t.name));
        reports.forEach(r => {
            if (r.occupationalTherapy?.examinerName) namesSet.add(r.occupationalTherapy.examinerName);
            if (r.speechTherapy?.examinerName) namesSet.add(r.speechTherapy.examinerName);
            if (r.remedialTherapy?.examinerName) namesSet.add(r.remedialTherapy.examinerName);
            if (r.physiotherapy?.examinerName) namesSet.add(r.physiotherapy.examinerName);
        });
        return Array.from(namesSet).filter(Boolean).sort();
    }, [reports, therapists]);

    // KPI Summary Metrics
    const metrics = useMemo(() => {
        return {
            total: reports.length,
            ot: reports.filter(r => Boolean(r.occupationalTherapy)).length,
            st: reports.filter(r => Boolean(r.speechTherapy)).length,
            remedial: reports.filter(r => Boolean(r.remedialTherapy)).length,
            physio: reports.filter(r => Boolean(r.physiotherapy)).length,
        };
    }, [reports]);
    
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const linkedChild = childMap.get(report.childId);
            const childName = report.studentName || linkedChild?.name || '';
            const parentName = report.studentParentName || linkedChild?.parentName || '';
            const regId = report.childId || '';
            const examiners = getAllExaminers(report);
            const examinersStr = examiners.map(e => e.examinerName).join(' ');

            // Search Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                !searchTerm ||
                childName.toLowerCase().includes(searchLower) ||
                parentName.toLowerCase().includes(searchLower) ||
                regId.toLowerCase().includes(searchLower) ||
                examinersStr.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // Therapy Type Filter
            if (therapyFilter === 'OT' && !report.occupationalTherapy) return false;
            if (therapyFilter === 'ST' && !report.speechTherapy) return false;
            if (therapyFilter === 'REMEDIAL' && !report.remedialTherapy) return false;
            if (therapyFilter === 'PHYSIO' && !report.physiotherapy) return false;

            // Examiner Filter
            if (examinerFilter !== 'ALL') {
                const hasExaminer = examiners.some(e => e.examinerName.toLowerCase() === examinerFilter.toLowerCase());
                if (!hasExaminer) return false;
            }

            return true;
        }).sort((a,b) => {
            return b.assessmentDate.localeCompare(a.assessmentDate);
        });
    }, [reports, searchTerm, therapyFilter, examinerFilter, childMap]);

    const handleOpenForm = (report: AssessmentReport | null) => {
        setEditingReport(report);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingReport(null);
        setIsFormOpen(false);
    };

    const handleSaveReport = (report: Omit<AssessmentReport, 'id'> | AssessmentReport) => {
        if ('id' in report && report.id) {
            onUpdateReport(report as AssessmentReport);
        } else {
            onAddReport(report);
        }
        handleCloseForm();
    };

    const handleDelete = (reportId: string, childName: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus laporan hasil asesmen untuk ${childName}?`)) {
            onDeleteReport(reportId);
        }
    };
    
    // Create a transient child object for printing from the selected report
    const getChildForPrint = (report: AssessmentReport | null): (Partial<MasterChild> & { referredBy?: string }) | undefined => {
        if (!report) return undefined;
        const linkedChild = childMap.get(report.childId);
        
        return {
            name: report.studentName || linkedChild?.name || 'Siswa Asesmen',
            birthDate: report.studentBirthDate || linkedChild?.birthDate,
            gender: report.studentGender || linkedChild?.gender || 'Laki-Laki',
            className: report.studentClass || linkedChild?.className || '-',
            parentName: report.studentParentName || linkedChild?.parentName || '-',
            motherName: report.studentMotherName || linkedChild?.motherName || '-',
            address: report.studentAddress || linkedChild?.address || '-',
            religion: report.studentReligion || linkedChild?.religion || '-',
            phone: report.studentPhone || linkedChild?.phone || '-',
            originSchool: report.studentOriginSchool || linkedChild?.originSchool || '-',
            referredBy: report.referredBy || linkedChild?.referredBy || '-',
        };
    };

    const canEdit = userRole !== 'siswa' && userRole !== 'orang_tua';

    return (
        <>
            <AssessmentReportForm 
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveReport}
                children={children}
                therapists={therapists}
                therapyTypes={therapyTypes}
                editingReport={editingReport}
            />
            {reportToPrint && (
                <AssessmentPrintPreviewModal 
                    isOpen={!!reportToPrint}
                    onClose={() => {
                        setReportToPrint(null);
                        setAutoPrint(false);
                    }}
                    report={reportToPrint}
                    child={getChildForPrint(reportToPrint)}
                    therapists={therapists}
                    logoUrl={logoUrl}
                    therapyTypes={therapyTypes}
                    userRole={userRole}
                    onEdit={handleOpenForm}
                    autoPrint={autoPrint}
                />
            )}
            <main className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* 1. HEADER SECTION (EXECUTIVE CLINICAL MODEL) */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    Portal Hasil Assesment Klinis Siswa
                                </span>
                                <span className="text-xs font-black uppercase tracking-wider text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                                    Dokumen Rahasia (Confidential)
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    Format Cetak Resmi Standar A4 • Evaluasi Terpadu Tumbuh Kembang
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                <span>Hasil & Laporan Assesment Siswa</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                                Kelola berkas dokumen rahasia hasil evaluasi asesmen klinis anak (Okupasi, Wicara, Remedial, Fisioterapi), pantau seluruh tim terapis pemeriksa, dan cetak dokumen laporan dalam format A4 siap serah ke orang tua.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {canEdit ? (
                                <button
                                    onClick={() => handleOpenForm(null)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 active:scale-95 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Buat Laporan Baru</span>
                                </button>
                            ) : (
                                <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                    <span>Mode Lihat Saja (Read-Only)</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 2. SUMMARY KPI STATISTIC CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* Total Laporan */}
                        <div 
                            onClick={() => setTherapyFilter('ALL')}
                            className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
                                therapyFilter === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Total Laporan</span>
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <FileCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white">{metrics.total}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Seluruh berkas asesmen</p>
                        </div>

                        {/* Okupasi Terapi (OT) */}
                        <div 
                            onClick={() => setTherapyFilter(therapyFilter === 'OT' ? 'ALL' : 'OT')}
                            className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
                                therapyFilter === 'OT' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Okupasi (OT)</span>
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <OccupationalTherapyIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white">{metrics.ot}</div>
                            <p className="text-[11px] text-emerald-400/80 mt-1">Sensori & Motorik</p>
                        </div>

                        {/* Terapi Wicara (TW) */}
                        <div 
                            onClick={() => setTherapyFilter(therapyFilter === 'ST' ? 'ALL' : 'ST')}
                            className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
                                therapyFilter === 'ST' ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Wicara (TW)</span>
                                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                                    <SpeechTherapyIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white">{metrics.st}</div>
                            <p className="text-[11px] text-cyan-400/80 mt-1">Bahasa & Artikulasi</p>
                        </div>

                        {/* Terapi Remedial */}
                        <div 
                            onClick={() => setTherapyFilter(therapyFilter === 'REMEDIAL' ? 'ALL' : 'REMEDIAL')}
                            className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
                                therapyFilter === 'REMEDIAL' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Remedial</span>
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                                    <RemedialTherapyIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white">{metrics.remedial}</div>
                            <p className="text-[11px] text-amber-400/80 mt-1">Kognitif & Belajar</p>
                        </div>

                        {/* Fisioterapi (FT) */}
                        <div 
                            onClick={() => setTherapyFilter(therapyFilter === 'PHYSIO' ? 'ALL' : 'PHYSIO')}
                            className={`bg-slate-900 border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:border-slate-700 ${
                                therapyFilter === 'PHYSIO' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-800'
                            }`}
                        >
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Fisioterapi (FT)</span>
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                    <PhysiotherapyIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white">{metrics.physio}</div>
                            <p className="text-[11px] text-purple-400/80 mt-1">Gross Motor & Postur</p>
                        </div>
                    </div>

                    {/* 3. FILTER & PENCARIAN BAR */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari nama siswa, orang tua, no. registrasi, atau nama terapis pemeriksa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Filters Dropdowns */}
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                {/* Filter Jenis Terapi */}
                                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                                    <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <select
                                        value={therapyFilter}
                                        onChange={(e) => setTherapyFilter(e.target.value as any)}
                                        className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer pr-1"
                                    >
                                        <option value="ALL" className="bg-slate-900 text-white">Semua Jenis Laporan</option>
                                        <option value="OT" className="bg-slate-900 text-white">Okupasi Terapi (OT)</option>
                                        <option value="ST" className="bg-slate-900 text-white">Terapi Wicara (TW)</option>
                                        <option value="REMEDIAL" className="bg-slate-900 text-white">Terapi Remedial</option>
                                        <option value="PHYSIO" className="bg-slate-900 text-white">Fisioterapi (FT)</option>
                                    </select>
                                </div>

                                {/* Filter Terapis Pemeriksa */}
                                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <select
                                        value={examinerFilter}
                                        onChange={(e) => setExaminerFilter(e.target.value)}
                                        className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer max-w-[160px] truncate"
                                    >
                                        <option value="ALL" className="bg-slate-900 text-white">Semua Pemeriksa</option>
                                        {availableExaminers.map((name, idx) => (
                                            <option key={idx} value={name} className="bg-slate-900 text-white">
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reset Filter */}
                                {(searchTerm || therapyFilter !== 'ALL' || examinerFilter !== 'ALL') && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setTherapyFilter('ALL');
                                            setExaminerFilter('ALL');
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-2.5 py-1.5 bg-indigo-500/10 rounded-xl cursor-pointer transition-colors"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Status Count */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>
                                Menampilkan <strong className="text-white">{filteredReports.length}</strong> dari total <strong className="text-white">{reports.length}</strong> laporan hasil asesmen
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <Printer className="w-3 h-3" />
                                Siap Cetak Format A4 Resmi
                            </span>
                        </div>
                    </div>

                    {/* 4. MAIN DATA TABLE (HASIL & LAPORAN ASSESMEN) */}
                    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-950 border-b-2 border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="px-5 py-4 min-w-[220px]">Nama Siswa</th>
                                        <th className="px-4 py-4 min-w-[180px]">Tanggal Laporan</th>
                                        <th className="px-4 py-4 min-w-[190px]">Jenis Laporan</th>
                                        <th className="px-5 py-4 min-w-[280px]">Pemeriksa / Pelapor (Semua Terapis)</th>
                                        <th className="px-5 py-4 text-center whitespace-nowrap min-w-[280px]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                    {filteredReports.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-slate-400">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <FolderDown className="w-10 h-10 text-slate-600 mb-1" />
                                                    <p className="text-sm font-bold text-slate-300">
                                                        Tidak ada laporan asesmen yang ditemukan.
                                                    </p>
                                                    <p className="text-xs text-slate-500 max-w-sm">
                                                        {searchTerm || therapyFilter !== 'ALL' || examinerFilter !== 'ALL'
                                                            ? 'Coba sesuaikan kata kunci pencarian atau reset filter di atas.'
                                                            : 'Klik tombol "+ Buat Laporan Baru" di atas untuk menambahkan laporan hasil asesmen siswa.'}
                                                    </p>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => handleOpenForm(null)}
                                                            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                                                        >
                                                            + Buat Laporan Baru
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReports.map((report) => {
                                            const linkedChild = childMap.get(report.childId);
                                            const displayName = report.studentName || linkedChild?.name || 'Siswa Asesmen';
                                            const displayId = report.childId || 'REG-MANUAL';
                                            const displayPhoto = linkedChild?.photoUrl;
                                            const gender = report.studentGender || linkedChild?.gender || 'Laki-Laki';
                                            const birthDate = report.studentBirthDate || linkedChild?.birthDate;
                                            const ageStr = getAge(birthDate);
                                            const parentName = report.studentParentName || report.studentMotherName || linkedChild?.parentName || linkedChild?.motherName || '-';

                                            // Collect active report types
                                            const reportTypes: { name: string; key: string; color: string; bg: string; border: string }[] = [];
                                            if (report.occupationalTherapy) {
                                                reportTypes.push({ name: 'Okupasi (OT)', key: 'OT', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' });
                                            }
                                            if (report.speechTherapy) {
                                                reportTypes.push({ name: 'Wicara (TW)', key: 'ST', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' });
                                            }
                                            if (report.remedialTherapy) {
                                                reportTypes.push({ name: 'Remedial', key: 'Remedial', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' });
                                            }
                                            if (report.physiotherapy) {
                                                reportTypes.push({ name: 'Fisioterapi', key: 'Physio', color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30' });
                                            }

                                            // Collect ALL examiners involved
                                            const examiners = getAllExaminers(report);

                                            const dateObj = new Date(report.assessmentDate);
                                            const formattedDate = !isNaN(dateObj.getTime())
                                                ? dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
                                                : report.assessmentDate;

                                            return (
                                                <tr key={report.id} className="hover:bg-slate-800/50 transition-colors">
                                                    {/* 1. NAMA SISWA */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative shrink-0">
                                                                {displayPhoto ? (
                                                                    <img 
                                                                        src={displayPhoto} 
                                                                        alt={displayName} 
                                                                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-black text-sm uppercase border border-indigo-500/30 shadow-xs">
                                                                        {displayName.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[8px] font-black text-white shadow-2xs ${
                                                                    gender === 'Laki-Laki' ? 'bg-blue-600' : 'bg-rose-500'
                                                                }`}>
                                                                    {gender === 'Laki-Laki' ? 'L' : 'P'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-extrabold text-white block text-sm hover:text-indigo-300 transition-colors">
                                                                    {displayName}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                                                                    <span className="font-mono text-indigo-400 font-semibold">{displayId}</span>
                                                                    <span>•</span>
                                                                    <span>{ageStr}</span>
                                                                    <span>•</span>
                                                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[8.5px] font-black tracking-wider uppercase">
                                                                        RAHASIA
                                                                    </span>
                                                                </div>
                                                                {parentName !== '-' && (
                                                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                                                        Ortu: <strong className="text-slate-400">{parentName}</strong>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 2. TANGGAL LAPORAN */}
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-white font-extrabold text-xs">
                                                                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                                <span>{formattedDate}</span>
                                                            </div>
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono">
                                                                <Clock className="w-3 h-3 text-slate-500" />
                                                                <span>Asesmen</span>
                                                                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1 rounded">Rahasia</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 3. JENIS LAPORAN */}
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                            {reportTypes.map((rt) => (
                                                                <span 
                                                                    key={rt.key}
                                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-bold border ${rt.bg} ${rt.color} ${rt.border} shadow-2xs`}
                                                                >
                                                                    {rt.key === 'OT' && <OccupationalTherapyIcon className="w-3 h-3 shrink-0" />}
                                                                    {rt.key === 'ST' && <SpeechTherapyIcon className="w-3 h-3 shrink-0" />}
                                                                    {rt.key === 'Remedial' && <RemedialTherapyIcon className="w-3 h-3 shrink-0" />}
                                                                    {rt.key === 'Physio' && <PhysiotherapyIcon className="w-3 h-3 shrink-0" />}
                                                                    <span>{rt.name}</span>
                                                                </span>
                                                            ))}
                                                            {reportTypes.length === 0 && (
                                                                <span className="text-[11px] text-slate-500 italic">
                                                                    Umum (Belum ditentukan)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* 4. PEMERIKSA / PELAPOR (SEMUA TERAPIS TERLIHAT) */}
                                                    <td className="px-5 py-4">
                                                        {examiners.length > 0 ? (
                                                            <div className="space-y-1.5">
                                                                {examiners.map((ex, idx) => (
                                                                    <div 
                                                                        key={idx}
                                                                        className={`flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-xl border text-[11px] ${ex.badgeBg} ${ex.badgeBorder}`}
                                                                    >
                                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                                            <span className="text-xs">{ex.iconEmoji}</span>
                                                                            <span className={`font-black text-[10px] uppercase tracking-wider ${ex.badgeText}`}>
                                                                                {ex.therapyLabel}:
                                                                            </span>
                                                                            <span className="font-extrabold text-white truncate max-w-[170px]" title={ex.examinerName}>
                                                                                {ex.examinerName}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${ex.dotColor} shrink-0`}></span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-[11px] italic flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>Belum ada terapis pelapor terdata</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* 5. AKSI (LIHAT PDF, PRINT A4, EDIT, HAPUS) */}
                                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Tombol Lihat PDF */}
                                                            <button
                                                                onClick={() => handleViewPdf(report)}
                                                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                                title="Buka Dokumen & Pratinjau PDF Format A4 Resmi"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>Lihat PDF</span>
                                                            </button>

                                                            {/* Tombol Print Laporan A4 */}
                                                            <button
                                                                onClick={() => handlePrintA4(report)}
                                                                className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                                                title="Cetak Langsung Lembar Standar A4 Resmi (Print)"
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                                <span>Print A4</span>
                                                            </button>

                                                            {/* Tombol Edit Laporan */}
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => handleOpenForm(report)}
                                                                    className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                                                                    title="Edit Data Laporan Assesment"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}

                                                            {/* Tombol Hapus Laporan */}
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => handleDelete(report.id, displayName)}
                                                                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                                                                    title="Hapus Laporan Assesment"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
};
// #endregion Main Page Component

export default AssessmentReportPage;
