import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, 
  FileSpreadsheet, 
  HardDrive, 
  RefreshCw, 
  Upload, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Link2, 
  Clock, 
  ShieldCheck, 
  Database, 
  Search, 
  FileJson,
  Calendar,
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  X,
  FileCheck,
  Sparkles,
  Folder
} from 'lucide-react';
import { 
  getGoogleAccessToken, 
  googleSignIn, 
  googleSignOut, 
  getCurrentGoogleUser, 
  subscribeToGoogleAuth 
} from '../utils/googleAuth';
import { 
  getStoredSpreadsheetId, 
  getStoredSpreadsheetMeta, 
  createMasterSpreadsheet, 
  fetchSpreadsheetDetails, 
  exportDatabaseToGoogleSheets, 
  importDatabaseFromGoogleSheets,
  LinkedSpreadsheetInfo, 
  SyncPayload 
} from '../utils/googleSheetsService';
import { 
  listDriveFiles, 
  uploadDatabaseBackupToDrive, 
  downloadBackupContentFromDrive, 
  deleteFileFromDrive, 
  DriveFileItem,
  uploadEverythingToDrive
} from '../utils/googleDriveService';
import { Child, Therapist, RegistrationRecord, FinancialRecord, AttendanceStatus, UserRole, TherapyProgram } from '../types';

interface GoogleWorkspacePageProps {
  childrenData: Child[];
  therapistsData: Therapist[];
  registrationsData: RegistrationRecord[];
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  financialData: { [key: string]: FinancialRecord[] };
  therapyPrograms?: TherapyProgram[];
  targetUserEmail?: string;
  onRestoreDatabase?: (payload: any) => void;
  onUpdateChildren?: (updated: Child[]) => void;
  userRole?: UserRole;
  logoUrl?: string;
}

export const GoogleWorkspacePage: React.FC<GoogleWorkspacePageProps> = ({
  childrenData,
  therapistsData,
  registrationsData,
  attendanceRecords,
  attendanceNotes,
  financialData,
  therapyPrograms = [],
  targetUserEmail = 'asep@lazuardi.sch.id',
  onRestoreDatabase,
  onUpdateChildren,
  userRole
}) => {
  // Google Auth State
  const [googleUser, setGoogleUser] = useState<any>(getCurrentGoogleUser());
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [uploadAllResult, setUploadAllResult] = useState<{ folderUrl: string; sheetUrl?: string; fileCount: number } | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive'>('sheets');

  // Sheets Sync State
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<LinkedSpreadsheetInfo | null>(getStoredSpreadsheetMeta());
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [inputSpreadsheetId, setInputSpreadsheetId] = useState('');
  const [selectedPreviewTab, setSelectedPreviewTab] = useState<'anak' | 'terapis' | 'sesi' | 'catatan' | 'registrasi' | 'keuangan'>('anak');
  const [previewSearch, setPreviewSearch] = useState('');

  // Drive Storage State
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupNote, setBackupNote] = useState('');

  // Destructive Confirmation Modal State (MANDATORY per Workspace guidelines)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete_file' | 'restore_backup' | 'overwrite_sheets';
    title: string;
    description: string;
    payload?: any;
    isExecuting: boolean;
  }>({
    isOpen: false,
    type: 'delete_file',
    title: '',
    description: '',
    isExecuting: false
  });

  // Subscribe to Auth changes
  useEffect(() => {
    const unsub = subscribeToGoogleAuth(async (user, currentToken) => {
      setGoogleUser(user);
      setToken(currentToken);
      if (user && currentToken) {
        loadDriveFilesList();
        // check spreadsheet details if ID exists
        const storedId = getStoredSpreadsheetId();
        if (storedId) {
          try {
            const meta = await fetchSpreadsheetDetails(storedId);
            setSpreadsheetInfo(meta);
          } catch (e) {
            console.warn('Could not refresh spreadsheet details', e);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSyncStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        setSyncStatusMessage({ type: 'success', text: `Berhasil terhubung ke akun Google: ${res.user.email}` });
        await loadDriveFilesList();
      }
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal login dengan akun Google' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setToken(null);
    setDriveFiles([]);
    setSyncStatusMessage({ type: 'info', text: 'Telah keluar dari akun Google' });
  };

  const loadDriveFilesList = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading Drive files', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Create new Master Spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    if (!token) return;
    setIsSyncingSheets(true);
    setSyncStatusMessage({ type: 'info', text: 'Sedang membuat Google Spreadsheet master baru...' });
    try {
      const newSheet = await createMasterSpreadsheet();
      setSpreadsheetInfo(newSheet);
      // Immediately push current database
      await executePushToSheets(newSheet.id);
      setSyncStatusMessage({
        type: 'success',
        text: `Spreadsheet "${newSheet.title}" berhasil dibuat dan seluruh database telah disinkronkan!`
      });
      loadDriveFilesList();
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal membuat spreadsheet baru' });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Link existing spreadsheet
  const handleLinkExistingSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSpreadsheetId.trim() || !token) return;

    setIsSyncingSheets(true);
    try {
      const meta = await fetchSpreadsheetDetails(inputSpreadsheetId);
      setSpreadsheetInfo(meta);
      setIsLinkingModalOpen(false);
      setInputSpreadsheetId('');
      setSyncStatusMessage({
        type: 'success',
        text: `Berhasil menautkan ke Google Sheet "${meta.title}".`
      });
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal menautkan spreadsheet' });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Push / Export database to Google Sheets
  const executePushToSheets = async (targetId?: string) => {
    const sId = targetId || spreadsheetInfo?.id;
    if (!sId) {
      setSyncStatusMessage({ type: 'error', text: 'Belum ada Google Spreadsheet yang terhubung' });
      return;
    }

    setIsSyncingSheets(true);
    setSyncStatusMessage({ type: 'info', text: 'Mengirim dan menyinkronkan seluruh database ke Google Sheets...' });

    const payload: SyncPayload = {
      children: childrenData,
      therapists: therapistsData,
      registrations: registrationsData,
      attendanceRecords: attendanceRecords,
      attendanceNotes: attendanceNotes,
      financialData: financialData,
      therapyPrograms: therapyPrograms || []
    };

    try {
      const res = await exportDatabaseToGoogleSheets(sId, payload);
      setSyncStatusMessage({ type: 'success', text: res.message });
      // Update local metadata
      const updatedMeta = getStoredSpreadsheetMeta();
      if (updatedMeta) setSpreadsheetInfo(updatedMeta);
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal sinkronisasi data' });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Upload EVERYTHING to Google Drive and Google Sheets for targetUserEmail
  const handleUploadEverythingToDriveAndSheets = async () => {
    setIsUploadingAll(true);
    setSyncStatusMessage({
      type: 'info',
      text: `Menyiapkan pengunggahan seluruh database ke Google Drive & Sheets untuk ${targetUserEmail}...`
    });

    try {
      let currentToken = await getGoogleAccessToken();
      if (!currentToken) {
        setSyncStatusMessage({
          type: 'info',
          text: `Membuka jendela login Google untuk ${targetUserEmail}...`
        });
        const res = await googleSignIn(targetUserEmail);
        if (!res?.accessToken) {
          throw new Error('Gagal login ke akun Google');
        }
        currentToken = res.accessToken;
        setGoogleUser(res.user);
        setToken(res.accessToken);
      }

      const syncPayload: SyncPayload = {
        children: childrenData,
        therapists: therapistsData,
        registrations: registrationsData,
        attendanceRecords: attendanceRecords,
        attendanceNotes: attendanceNotes,
        financialData: financialData,
        therapyPrograms: therapyPrograms || []
      };

      // 1. Google Sheets sync
      let sheetMeta = spreadsheetInfo;
      if (!sheetMeta?.id) {
        setSyncStatusMessage({
          type: 'info',
          text: `Membuat Master Google Spreadsheet untuk ${targetUserEmail}...`
        });
        sheetMeta = await createMasterSpreadsheet(`Database Terapi Pelangi Lazuardi (${targetUserEmail})`);
        setSpreadsheetInfo(sheetMeta);
      }

      setSyncStatusMessage({
        type: 'info',
        text: `Menyinkronkan 7 tab spreadsheet ke ${sheetMeta.title}...`
      });
      await exportDatabaseToGoogleSheets(sheetMeta.id, syncPayload);

      // 2. Upload complete categories to Drive
      setSyncStatusMessage({
        type: 'info',
        text: `Membuat folder dan mengunggah seluruh berkas database ke Google Drive ${targetUserEmail}...`
      });
      const driveRes = await uploadEverythingToDrive(syncPayload, targetUserEmail);

      await loadDriveFilesList();

      setUploadAllResult({
        folderUrl: driveRes.folderUrl,
        sheetUrl: sheetMeta.url,
        fileCount: driveRes.uploadedFiles.length
      });

      setSyncStatusMessage({
        type: 'success',
        text: `Berhasil! Seluruh data (${driveRes.uploadedFiles.length} berkas & 7 tab spreadsheet) telah dimasukkan ke Google Drive & Google Sheets ${targetUserEmail}.`
      });
    } catch (err: any) {
      console.error('Error in handleUploadEverythingToDriveAndSheets:', err);
      setSyncStatusMessage({
        type: 'error',
        text: err.message || 'Gagal memasukkan data ke Google Drive'
      });
    } finally {
      setIsUploadingAll(false);
    }
  };

  // Pull / Import data from Google Sheets
  const handlePullFromSheets = async () => {
    if (!spreadsheetInfo?.id) return;
    setIsSyncingSheets(true);
    setSyncStatusMessage({ type: 'info', text: 'Membaca pembaruan data dari Google Sheets...' });
    try {
      const data = await importDatabaseFromGoogleSheets(spreadsheetInfo.id);
      const anakCount = Math.max(0, data.anakRows.length - 1);
      const terapisCount = Math.max(0, data.terapisRows.length - 1);
      const regCount = Math.max(0, data.registrationRows.length - 1);

      setSyncStatusMessage({
        type: 'success',
        text: `Data terbaca dari Google Sheets: ${anakCount} Siswa, ${terapisCount} Terapis, ${regCount} Pendaftaran. Data siap diselaraskan.`
      });
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal membaca data dari Google Sheets' });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Create Google Drive full database backup
  const handleCreateDriveBackup = async () => {
    if (!token) return;
    setIsCreatingBackup(true);
    try {
      const snapshot = {
        children: childrenData,
        therapists: therapistsData,
        registrations: registrationsData,
        attendanceRecords: attendanceRecords,
        attendanceNotes: attendanceNotes,
        financialData: financialData
      };
      const result = await uploadDatabaseBackupToDrive(snapshot, backupNote);
      setBackupNote('');
      setSyncStatusMessage({
        type: 'success',
        text: `Cadangan database berhasil disimpan di Google Drive: ${result.name}`
      });
      await loadDriveFilesList();
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah cadangan ke Google Drive' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Open confirmation modal for Destructive Operations
  const requestDeleteFile = (file: DriveFileItem) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_file',
      title: 'Hapus Berkas dari Google Drive?',
      description: `Apakah Anda yakin ingin menghapus "${file.name}" dari Google Drive? Tindakan ini permanen dan berkas tidak dapat dipulihkan.`,
      payload: file,
      isExecuting: false
    });
  };

  const requestRestoreBackup = (file: DriveFileItem) => {
    setConfirmModal({
      isOpen: true,
      type: 'restore_backup',
      title: 'Pulihkan Database dari Cadangan Google Drive?',
      description: `Anda akan memulihkan data sistem dari berkas "${file.name}". Data operasional saat ini di aplikasi akan diperbarui dengan data dari snapshot cadangan tersebut. Pastikan Anda telah mencadangkan data terkini jika diperlukan.`,
      payload: file,
      isExecuting: false
    });
  };

  // Execute confirmed destructive operation
  const handleConfirmAction = async () => {
    setConfirmModal(prev => ({ ...prev, isExecuting: true }));
    try {
      if (confirmModal.type === 'delete_file') {
        const file: DriveFileItem = confirmModal.payload;
        await deleteFileFromDrive(file.id);
        setDriveFiles(prev => prev.filter(f => f.id !== file.id));
        setSyncStatusMessage({ type: 'success', text: `Berkas "${file.name}" berhasil dihapus dari Google Drive.` });
      } else if (confirmModal.type === 'restore_backup') {
        const file: DriveFileItem = confirmModal.payload;
        const backupData = await downloadBackupContentFromDrive(file.id);
        if (backupData?.payload && onRestoreDatabase) {
          onRestoreDatabase(backupData.payload);
          setSyncStatusMessage({
            type: 'success',
            text: `Database berhasil dipulihkan dari cadangan Google Drive (${file.name})!`
          });
        } else {
          throw new Error('Format berkas cadangan tidak valid atau tidak memuat snapshot database yang lengkap');
        }
      }
      setConfirmModal({ isOpen: false, type: 'delete_file', title: '', description: '', isExecuting: false });
    } catch (err: any) {
      setSyncStatusMessage({ type: 'error', text: err.message || 'Operasi gagal dijalankan' });
      setConfirmModal(prev => ({ ...prev, isExecuting: false }));
    }
  };

  // Filter preview rows
  const filteredPreviewRows = useMemo(() => {
    const q = previewSearch.toLowerCase();
    if (selectedPreviewTab === 'anak') {
      return childrenData.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.className.toLowerCase().includes(q) || 
        c.parentName.toLowerCase().includes(q)
      );
    }
    if (selectedPreviewTab === 'terapis') {
      return therapistsData.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.title.toLowerCase().includes(q)
      );
    }
    if (selectedPreviewTab === 'registrasi') {
      return registrationsData.filter(r => 
        r.childName.toLowerCase().includes(q) || 
        r.parentName.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q)
      );
    }
    return [];
  }, [selectedPreviewTab, previewSearch, childrenData, therapistsData, registrationsData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
              <Cloud className="w-3.5 h-3.5" />
              <span>Integrasi Resmi Google Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Data Google Drive & Google Sheets
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Hubungkan database Terapi Pelangi Lazuardi secara real-time ke Google Sheets untuk analisis spreadsheet kolaboratif dan simpan cadangan otomatis aman di Google Drive.
            </p>
          </div>

          {/* Account status widget */}
          <div className="shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 min-w-[280px]">
            {googleUser && token ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img 
                      src={googleUser.photoURL} 
                      alt={googleUser.displayName || 'Google User'} 
                      className="w-10 h-10 rounded-full ring-2 ring-emerald-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                      {(googleUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-semibold text-emerald-300">Terhubung</span>
                    </div>
                    <p className="font-bold text-sm truncate">{googleUser.displayName || 'Akun Google'}</p>
                    <p className="text-xs text-blue-200 truncate">{googleUser.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Drive & Sheets Aktif</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-medium text-rose-200 hover:text-white transition-colors underline cursor-pointer"
                  >
                    Putuskan
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-xs text-blue-100">
                  Masuk dengan akun Google untuk mengaktifkan sinkronisasi database.
                </p>
                {/* Official Material Google Sign-In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Card: Masukan Semua ke Drive asep@lazuardi.sch.id */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/70 border-2 border-emerald-500/40 p-6 sm:p-7 shadow-xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aksi Instan: Masukan Semua Data ke Drive</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 flex-wrap">
              <span>Masukan Semua ke Google Drive & Sheets</span>
              <span className="text-emerald-400 font-mono text-base sm:text-lg bg-emerald-500/15 px-3 py-0.5 rounded-xl border border-emerald-500/30">
                {targetUserEmail}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Tekan tombol di samping untuk mengekspor dan menyimpan sekaligus seluruh database aplikasi ke Google Drive dan Google Sheets akun <strong className="text-white underline">{targetUserEmail}</strong>. Sistem akan membuat Spreadsheet master dengan 7 tab lengkap dan folder cadangan cloud terenkripsi.
            </p>

            {/* Quick summary badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-blue-300 border border-slate-700/80 font-medium">
                👥 {childrenData.length} Siswa
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 border border-slate-700/80 font-medium">
                🩺 {therapistsData.length} Terapis
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-amber-300 border border-slate-700/80 font-medium">
                📅 {Object.keys(attendanceRecords).length} Hari Presensi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-purple-300 border border-slate-700/80 font-medium">
                📖 {Object.keys(attendanceNotes).length} Catatan EMR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-pink-300 border border-slate-700/80 font-medium">
                📋 {registrationsData.length} Pendaftaran
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-cyan-300 border border-slate-700/80 font-medium">
                💰 {Object.keys(financialData).length} Tahun Finansial
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleUploadEverythingToDriveAndSheets}
              disabled={isUploadingAll}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-60 border border-emerald-400/40"
            >
              <Upload className={`w-5 h-5 ${isUploadingAll ? 'animate-bounce' : ''}`} />
              <span>{isUploadingAll ? 'Sedang Memasukkan Semua ke Drive...' : `Masukan Semua ke Drive ${targetUserEmail}`}</span>
            </button>
          </div>
        </div>

        {/* Success Card with Direct Links if uploaded */}
        {uploadAllResult && (
          <div className="mt-5 pt-5 border-t border-emerald-500/30 bg-emerald-950/40 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Semua Berkas & Database Berhasil Dimasukkan ke Google Drive ({targetUserEmail})!</span>
                </div>
                <p className="text-xs text-emerald-200/70">
                  {uploadAllResult.fileCount} berkas cadangan dan spreadsheet telah dibuat di folder Google Drive Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={uploadAllResult.folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Folder className="w-4 h-4" />
                  <span>Buka Folder Google Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {uploadAllResult.sheetUrl && (
                  <a
                    href={uploadAllResult.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Buka Google Sheet Master</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Alert Notification */}
      {syncStatusMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm animate-fade-in ${
          syncStatusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : syncStatusMessage.type === 'error'
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center gap-3">
            {syncStatusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
             syncStatusMessage.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> :
             <RefreshCw className="w-5 h-5 shrink-0 animate-spin" />}
            <p className="font-medium">{syncStatusMessage.text}</p>
          </div>
          <button 
            onClick={() => setSyncStatusMessage(null)} 
            className="text-xs opacity-60 hover:opacity-100 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets Database</span>
          {spreadsheetInfo && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive Cadangan Cloud</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {driveFiles.length}
          </span>
        </button>
      </div>

      {/* TAB 1: GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Linked Spreadsheet Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Spreadsheet Master Terhubung</span>
                </div>
                {spreadsheetInfo ? (
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <span>{spreadsheetInfo.title}</span>
                      <a 
                        href={spreadsheetInfo.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-normal bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                      >
                        <span>Buka di Google Sheets</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      ID: {spreadsheetInfo.id}
                    </p>
                    {spreadsheetInfo.lastSyncedAt && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Terakhir disinkronkan: {new Date(spreadsheetInfo.lastSyncedAt).toLocaleString('id-ID')}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-slate-200">Belum Ada Spreadsheet Terhubung</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Buat spreadsheet otomatis baru dengan struktur tab Pelangi Lazuardi atau tautkan spreadsheet Google Anda yang sudah ada.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {googleUser && token ? (
                  <>
                    {!spreadsheetInfo ? (
                      <button
                        onClick={handleCreateNewSpreadsheet}
                        disabled={isSyncingSheets}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buat Spreadsheet Master Baru</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => executePushToSheets()}
                        disabled={isSyncingSheets}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-4 h-4 ${isSyncingSheets ? 'animate-bounce' : ''}`} />
                        <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Sinkronkan ke Google Sheets'}</span>
                      </button>
                    )}

                    <button
                      onClick={handlePullFromSheets}
                      disabled={isSyncingSheets || !spreadsheetInfo}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tarik Pembaruan dari Sheets</span>
                    </button>

                    <button
                      onClick={() => setIsLinkingModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{spreadsheetInfo ? 'Ganti Sheet' : 'Tautkan ID'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Masuk Google untuk Sinkronisasi</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Data Siswa</span>
                </div>
                <div className="text-lg font-black text-slate-100">{childrenData.length}</div>
                <div className="text-[10px] text-slate-500">Tab: Data_Anak</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tenaga Terapis</span>
                </div>
                <div className="text-lg font-black text-slate-100">{therapistsData.length}</div>
                <div className="text-[10px] text-slate-500">Tab: Data_Terapis</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Presensi Sesi</span>
                </div>
                <div className="text-lg font-black text-slate-100">
                  {Object.values(attendanceRecords).reduce<number>((acc, curr: any) => acc + Object.keys(curr || {}).length, 0)}
                </div>
                <div className="text-[10px] text-slate-500">Tab: Sesi_Kehadiran</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                  <span>Catatan EMR</span>
                </div>
                <div className="text-lg font-black text-slate-100">
                  {Object.values(attendanceNotes).reduce<number>((acc, curr: any) => acc + Object.keys(curr || {}).length, 0)}
                </div>
                <div className="text-[10px] text-slate-500">Tab: Catatan_Terapi</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Pendaftaran</span>
                </div>
                <div className="text-lg font-black text-slate-100">{registrationsData.length}</div>
                <div className="text-[10px] text-slate-500">Tab: Pendaftaran_Baru</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tahun Buku</span>
                </div>
                <div className="text-lg font-black text-slate-100">{Object.keys(financialData).length}</div>
                <div className="text-[10px] text-slate-500">Tab: Laporan_Keuangan</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Data Preview Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Pratinjau Data Sinkronisasi Spreadsheet</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tinjau baris data yang disinkronkan secara terstruktur per tab sheet.
                </p>
              </div>

              {/* Search & tab switch */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={e => setPreviewSearch(e.target.value)}
                    placeholder="Cari data..."
                    className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 w-44"
                  />
                </div>

                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setSelectedPreviewTab('anak')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      selectedPreviewTab === 'anak' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Data Anak ({childrenData.length})
                  </button>
                  <button
                    onClick={() => setSelectedPreviewTab('terapis')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      selectedPreviewTab === 'terapis' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Terapis ({therapistsData.length})
                  </button>
                  <button
                    onClick={() => setSelectedPreviewTab('registrasi')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      selectedPreviewTab === 'registrasi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pendaftaran ({registrationsData.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                {selectedPreviewTab === 'anak' && (
                  <>
                    <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Tgl Lahir</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4">Orang Tua</th>
                        <th className="py-3 px-4">Sesi Rutin</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-normal text-slate-300">
                      {filteredPreviewRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                        </tr>
                      ) : (
                        (filteredPreviewRows as Child[]).slice(0, 15).map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-mono text-slate-400">{c.id}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-100">{c.name}</td>
                            <td className="py-2.5 px-4">{c.gender}</td>
                            <td className="py-2.5 px-4">{c.birthDate}</td>
                            <td className="py-2.5 px-4">{c.className}</td>
                            <td className="py-2.5 px-4">{c.parentName}</td>
                            <td className="py-2.5 px-4 truncate max-w-[200px]">
                              {(c.recurringSessions || []).map(s => `${s.day} ${s.time}`).join(', ')}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {c.status || 'Aktif'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {selectedPreviewTab === 'terapis' && (
                  <>
                    <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Nama Terapis</th>
                        <th className="py-3 px-4">Gelar & Spesialisasi</th>
                        <th className="py-3 px-4">Kontak</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Ruangan</th>
                        <th className="py-3 px-4">Hari Praktek</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-normal text-slate-300">
                      {filteredPreviewRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                        </tr>
                      ) : (
                        (filteredPreviewRows as Therapist[]).map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-semibold text-slate-100">{t.name}</td>
                            <td className="py-2.5 px-4">{t.title} ({(t.specialties || []).join(', ')})</td>
                            <td className="py-2.5 px-4">{t.phone}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-400">{t.email}</td>
                            <td className="py-2.5 px-4">{t.defaultRoom}</td>
                            <td className="py-2.5 px-4">{(t.workingDays || []).join(', ')}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {t.status || 'Aktif'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {selectedPreviewTab === 'registrasi' && (
                  <>
                    <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">No Registrasi</th>
                        <th className="py-3 px-4">Tgl Daftar</th>
                        <th className="py-3 px-4">Nama Anak</th>
                        <th className="py-3 px-4">Nama Orang Tua</th>
                        <th className="py-3 px-4">Telepon / WA</th>
                        <th className="py-3 px-4">Layanan</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-normal text-slate-300">
                      {filteredPreviewRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                        </tr>
                      ) : (
                        (filteredPreviewRows as RegistrationRecord[]).map(r => (
                          <tr key={r.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-mono text-slate-400">{r.registrationNumber}</td>
                            <td className="py-2.5 px-4">{r.registrationDate}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-100">{r.childName}</td>
                            <td className="py-2.5 px-4">{r.parentName || r.fatherName || r.motherName || '-'}</td>
                            <td className="py-2.5 px-4">{r.whatsapp || '-'}</td>
                            <td className="py-2.5 px-4">{(r.interestedServices || []).join(', ')}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE DRIVE */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          {/* Drive Action Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  <HardDrive className="w-4 h-4" />
                  <span>Cadangan Cloud Google Drive</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  Snapshot Database & Cadangan Aman
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simpan cadangan lengkap semua data anak, sesi terapi, catatan EMR, dan tagihan ke folder Google Drive pribadi Anda untuk keamanan data instan.
                </p>
              </div>

              {/* Backup triggers */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={backupNote}
                  onChange={e => setBackupNote(e.target.value)}
                  placeholder="Catatan cadangan (opsional)..."
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 w-full sm:w-60"
                />
                <button
                  onClick={handleCreateDriveBackup}
                  disabled={!googleUser || !token || isCreatingBackup}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Upload className={`w-4 h-4 ${isCreatingBackup ? 'animate-bounce' : ''}`} />
                  <span>{isCreatingBackup ? 'Mencadangkan...' : 'Cadangkan Sekarang ke Drive'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drive Files List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-400" />
                  <span>Berkas & Cadangan di Google Drive</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar berkas cadangan JSON dan spreadsheet yang tersimpan di Google Drive Pelangi Lazuardi.
                </p>
              </div>

              <button
                onClick={loadDriveFilesList}
                disabled={isLoadingDrive || !googleUser}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {/* Files Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Berkas</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Ukuran</th>
                    <th className="py-3 px-4">Terakhir Diubah</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-normal text-slate-300">
                  {driveFiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        {googleUser 
                          ? 'Belum ada berkas cadangan ditemukan. Klik "Cadangkan Sekarang ke Drive" untuk membuat snapshot pertama.'
                          : 'Silakan masuk dengan akun Google terlebih dahulu untuk melihat berkas Drive.'}
                      </td>
                    </tr>
                  ) : (
                    driveFiles.map(file => {
                      const isJson = file.name.endsWith('.json') || file.mimeType === 'application/json';
                      const isSheet = file.mimeType.includes('spreadsheet');
                      return (
                        <tr key={file.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                            {isSheet ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : isJson ? (
                              <FileJson className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : (
                              <Database className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate max-w-sm">{file.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              {isSheet ? 'Google Spreadsheet' : isJson ? 'JSON Backup' : 'File'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                  title="Buka di Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {isJson && (
                                <button
                                  onClick={() => requestRestoreBackup(file)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                                  title="Pulihkan database dari file cadangan ini"
                                >
                                  Pulihkan
                                </button>
                              )}

                              <button
                                onClick={() => requestDeleteFile(file)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                                title="Hapus berkas ini dari Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
      )}

      {/* Modal: Tautkan Google Spreadsheet ID */}
      {isLinkingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <span>Tautkan Google Spreadsheet</span>
              </h3>
              <button
                onClick={() => setIsLinkingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Masukkan ID Spreadsheet atau URL lengkap Google Sheet yang ingin Anda hubungkan ke database Pelangi Lazuardi.
            </p>

            <form onSubmit={handleLinkExistingSpreadsheet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Spreadsheet ID atau URL
                </label>
                <input
                  type="text"
                  value={inputSpreadsheetId}
                  onChange={e => setInputSpreadsheetId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSyncingSheets || !inputSpreadsheetId.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSyncingSheets ? 'Menautkan...' : 'Tautkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Dialog for Destructive Operations */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">{confirmModal.title}</h3>
                <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
                  Konfirmasi Tindakan
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmModal.isExecuting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmModal.isExecuting}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                  confirmModal.type === 'delete_file'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                }`}
              >
                {confirmModal.isExecuting ? 'Memproses...' : confirmModal.type === 'delete_file' ? 'Ya, Hapus Berkas' : 'Ya, Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleWorkspacePage;
