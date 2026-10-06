import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FolderOpen, 
  Search, 
  Printer, 
  Download, 
  Trash2, 
  Eye, 
  Edit3, 
  MoveRight, 
  FolderInput, 
  Clock, 
  Calendar, 
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  Layers, 
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { RapotArchiveFolder, RapotArchiveItem, Child } from '../types';
import { exportPagesToPdf, triggerBrowserA4Print } from '../utils/rapotPdfGenerator';

interface RapotArchiveViewProps {
  archives: RapotArchiveItem[];
  folders: RapotArchiveFolder[];
  allChildren: Child[];
  logoUrl?: string;
  onOpenArchive: (archive: RapotArchiveItem) => void;
  onDeleteArchive: (archiveId: string) => void;
  onMoveArchive: (archiveId: string, targetFolderId: string | null) => void;
  onCreateFolder: (folderName: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDirectPrintPreview: (archive: RapotArchiveItem) => void;
  onDirectDownloadPdf: (archive: RapotArchiveItem) => void;
  onSwitchToForm: () => void;
}

export const RapotArchiveView: React.FC<RapotArchiveViewProps> = ({
  archives,
  folders,
  allChildren,
  logoUrl,
  onOpenArchive,
  onDeleteArchive,
  onMoveArchive,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDirectPrintPreview,
  onDirectDownloadPdf,
  onSwitchToForm,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'root'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [therapyFilter, setTherapyFilter] = useState<string>('all');

  // Modal states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const [renameFolderTarget, setRenameFolderTarget] = useState<RapotArchiveFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState<string>('');

  const [deleteArchiveTarget, setDeleteArchiveTarget] = useState<RapotArchiveItem | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<RapotArchiveFolder | null>(null);

  const [moveArchiveTarget, setMoveArchiveTarget] = useState<RapotArchiveItem | null>(null);
  const [targetFolderForMove, setTargetFolderForMove] = useState<string>('root');

  // Folder helper
  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Root (Tanpa Folder)';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Folder Tidak Diketahui';
  };

  // Filtered archives
  const filteredArchives = archives.filter(item => {
    // Folder filter
    if (selectedFolderId === 'root') {
      if (item.folderId !== null && item.folderId !== undefined) return false;
    } else if (selectedFolderId !== 'all') {
      if (item.folderId !== selectedFolderId) return false;
    }

    // Therapy filter
    if (therapyFilter !== 'all' && item.type !== therapyFilter) {
      return false;
    }

    // Student search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.childName.toLowerCase().includes(q);
      const matchFileName = item.fileName.toLowerCase().includes(q);
      const matchDate = (item.saveDate || '').includes(q);
      return matchName || matchFileName || matchDate;
    }

    return true;
  });

  const handleConfirmCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  const handleConfirmRenameFolder = () => {
    if (!renameFolderTarget || !renameFolderName.trim()) return;
    onRenameFolder(renameFolderTarget.id, renameFolderName.trim());
    setRenameFolderTarget(null);
    setRenameFolderName('');
  };

  const handleConfirmMoveArchive = () => {
    if (!moveArchiveTarget) return;
    onMoveArchive(moveArchiveTarget.id, targetFolderForMove === 'root' ? null : targetFolderForMove);
    setMoveArchiveTarget(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-100">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
                Arsip Rapot Terapi
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Penyimpanan resmi hasil rapot perkembangan siswa yang sudah final dan siap cetak.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            Folder Baru
          </button>

          <button
            onClick={onSwitchToForm}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            Kembali ke Formulir Rapot
          </button>
        </div>
      </div>

      {/* Main Grid: Folder Sidebar & Archive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Folders List (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-600" /> Kelompok Folder
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {folders.length} Folder
              </span>
            </div>

            <div className="space-y-2">
              {/* All Archives button */}
              <button
                onClick={() => setSelectedFolderId('all')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedFolderId === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4" />
                  <span>Semua Arsip Rapot</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedFolderId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {archives.length}
                </span>
              </button>

              {/* Root archives button */}
              <button
                onClick={() => setSelectedFolderId('root')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedFolderId === 'root'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <span>Root / Tanpa Folder</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedFolderId === 'root' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {archives.filter(a => !a.folderId).length}
                </span>
              </button>

              {/* Custom Folders */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2">
                  Daftar Folder Kustom
                </span>
                {folders.map(folder => {
                  const count = archives.filter(a => a.folderId === folder.id).length;
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="flex-1 flex items-center gap-3 text-left text-xs font-bold cursor-pointer overflow-hidden"
                      >
                        <Folder className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                        <span className="truncate">{folder.name}</span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {count}
                        </span>

                        {/* Edit Folder Name */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameFolderTarget(folder);
                            setRenameFolderName(folder.name);
                          }}
                          className={`p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity ${
                            isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-500'
                          }`}
                          title="Ubah Nama Folder"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Folder */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteFolderTarget(folder);
                          }}
                          className={`p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity ${
                            isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500'
                          }`}
                          title="Hapus Folder"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {folders.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada folder kustom. Klik "Folder Baru" untuk membuat pengelompokan rapot.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search, Filters & Archive Items (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa atau file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Therapy Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline">
                Jenis:
              </span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'OT', label: 'Okupasi (OT)' },
                { id: 'TW', label: 'Wicara (TW)' },
                { id: 'REMEDIAL', label: 'Remedial' },
                { id: 'FT', label: 'Fisioterapi' },
                { id: 'HT', label: 'Hidroterapi' },
                { id: 'BERKUDA', label: 'Terapi Berkuda' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTherapyFilter(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    therapyFilter === t.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Archive Items List */}
          <div className="space-y-4">
            {filteredArchives.map(archive => {
              const therapyBadge = 
                archive.type === 'OT' ? { bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Okupasi Terapi' } :
                archive.type === 'TW' ? { bg: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Terapi Wicara' } :
                archive.type === 'REMEDIAL' ? { bg: 'bg-pink-50 text-pink-700 border-pink-200', label: 'Remedial' } :
                archive.type === 'HT' ? { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Hidroterapi' } :
                archive.type === 'BERKUDA' ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Terapi Berkuda' } :
                { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Fisioterapi' };

              return (
                <div
                  key={archive.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${therapyBadge.bg}`}>
                          {therapyBadge.label}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Periode {archive.period} {archive.year}
                        </span>
                        {archive.folderId && (
                          <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {getFolderName(archive.folderId)}
                          </span>
                        )}
                      </div>

                      {/* Prominent File Name in requested standard */}
                      <div>
                        <h3 className="text-sm md:text-base font-black text-slate-900 truncate tracking-tight">
                          {archive.fileName}
                        </h3>
                        <p className="text-xs font-bold text-slate-600 mt-0.5">
                          Siswa: <span className="text-blue-600 font-black">{archive.childName}</span>
                        </p>
                      </div>

                      {/* Timestamp & metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Tanggal: <strong className="text-slate-600 font-bold">{archive.saveDate}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Jam: <strong className="text-slate-600 font-bold">{archive.saveTime} WIB</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right action buttons: Buka | Print | Download PDF | Hapus */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Buka */}
                      <button
                        onClick={() => onOpenArchive(archive)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Buka rapot ini sesuai kondisi saat disimpan"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Buka
                      </button>

                      {/* Print Preview / Print */}
                      <button
                        onClick={() => onDirectPrintPreview(archive)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-blue-200"
                        title="Lihat Pratinjau Cetak A4"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => onDirectDownloadPdf(archive)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-200"
                        title="Download file PDF format resmi A4"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>

                      {/* Pindahkan Folder */}
                      <button
                        onClick={() => {
                          setMoveArchiveTarget(archive);
                          setTargetFolderForMove(archive.folderId || 'root');
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                        title="Pindahkan ke Folder lain"
                      >
                        <FolderInput className="h-4 w-4" />
                      </button>

                      {/* Hapus */}
                      <button
                        onClick={() => setDeleteArchiveTarget(archive)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Hapus arsip ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredArchives.length === 0 && (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-1">
                  Tidak Ada Arsip Rapot
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  {searchQuery 
                    ? `Tidak ditemukan arsip dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                    : 'Belum ada rapot yang diarsipkan di folder ini. Anda dapat membuka Formulir Rapot dan menekan tombol Simpan Arsip.'}
                </p>
                <button
                  onClick={onSwitchToForm}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-100"
                >
                  <Edit3 className="h-4 w-4" />
                  Buka Formulir Rapot
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Buat Folder Baru */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                <FolderPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Buat Folder Baru</h3>
                <p className="text-xs text-slate-500">Kelompokkan arsip rapot berdasarkan kategori atau tahun ajaran.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Folder</label>
              <input
                type="text"
                placeholder="Contoh: Tahun Ajaran 2026/2027 atau Kelas Inklusi 3"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreateFolder()}
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Simpan Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Nama Folder */}
      {renameFolderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <Edit3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Ubah Nama Folder</h3>
                <p className="text-xs text-slate-500">Perbarui nama folder untuk pengelompokan yang lebih baik.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Baru</label>
              <input
                type="text"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmRenameFolder()}
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameFolderTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRenameFolder}
                disabled={!renameFolderName.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pindahkan Arsip ke Folder */}
      {moveArchiveTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                <FolderInput className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Pindahkan Arsip</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{moveArchiveTarget.fileName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Pilih Folder Tujuan</label>
              <select
                value={targetFolderForMove}
                onChange={(e) => setTargetFolderForMove(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="root">Root / Tanpa Folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    Folder: {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMoveArchiveTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmMoveArchive}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Pindahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Arsip */}
      {deleteArchiveTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Hapus Arsip Rapot?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <p className="font-mono text-slate-800 font-bold break-all">{deleteArchiveTarget.fileName}</p>
              <p className="text-slate-500">Siswa: {deleteArchiveTarget.childName}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteArchiveTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteArchive(deleteArchiveTarget.id);
                  setDeleteArchiveTarget(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-red-200"
              >
                Ya, Hapus Arsip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Folder */}
      {deleteFolderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Hapus Folder?</h3>
                <p className="text-xs text-slate-500">Arsip di dalam folder ini akan dipindahkan ke Root.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus folder <strong>"{deleteFolderTarget.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteFolderTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteFolder(deleteFolderTarget.id);
                  if (selectedFolderId === deleteFolderTarget.id) {
                    setSelectedFolderId('all');
                  }
                  setDeleteFolderTarget(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Hapus Folder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RapotArchiveView;
