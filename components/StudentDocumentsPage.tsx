import React, { useState, useMemo, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  FileCheck, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Tag, 
  Trash2, 
  Edit3, 
  MoveRight, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  HardDrive, 
  Layers, 
  Sparkles, 
  FileCode, 
  FileSpreadsheet, 
  ExternalLink, 
  History, 
  ArrowLeft,
  Calendar,
  Shield,
  FolderArchive,
  Grid,
  List as ListIcon,
  Play,
  Share2,
  FileQuestion,
  Users
} from 'lucide-react';
import { View, UserRole, Child } from '../types';
import { 
  StudentFolder, 
  StudentDocument, 
  DocumentCategory, 
  FileType, 
  CATEGORY_LABELS,
  DEFAULT_SUBFOLDER_NAMES,
  getStoredFolders, 
  saveStoredFolders, 
  getStoredDocuments, 
  saveStoredDocuments, 
  getStoredDocumentLogs,
  ensureStudentFoldersExist,
  createCustomStudentFolder,
  renameStudentFolder,
  deleteStudentFolder,
  uploadStudentDocument,
  updateStudentDocument,
  moveStudentDocument,
  requestDeleteDocument,
  deleteStudentDocumentPermanently,
  getFilteredDocumentsForUser,
  getFilteredFoldersForUser,
  getDocumentStats,
  formatFileSize,
  DocumentActivityLog
} from '../utils/studentDocumentStorage';

interface StudentDocumentsPageProps {
  userRole?: UserRole;
  currentStudentId?: string;
  currentStudentName?: string;
  currentUserName?: string;
  allChildren?: any[];
  onNavigate?: (view: View) => void;
  logoUrl?: string;
}

export const StudentDocumentsPage: React.FC<StudentDocumentsPageProps> = ({
  userRole = 'admin',
  currentStudentId = 'C-ADRIEL',
  currentStudentName = 'Adriel Djulian Putra Aditya',
  currentUserName = 'Admin Pelangi',
  allChildren = [],
  onNavigate,
  logoUrl
}) => {
  // Roles check
  const isStudentRole = userRole === 'siswa' || userRole === 'orang_tua';
  const isManagerOrSuperAdmin = userRole === 'manager' || userRole === 'super_admin';
  const isAdmin = userRole === 'admin';
  const canManage = isManagerOrSuperAdmin || isAdmin;

  // Safe Student Identifiers
  const safeCurrentStudentId = String(currentStudentId || 'C-ADRIEL').trim();
  const safeCurrentStudentName = String(currentStudentName || 'Adriel Djulian Putra Aditya').trim();

  // State
  const [folders, setFolders] = useState<StudentFolder[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<DocumentActivityLog[]>([]);

  // Navigation / Folder selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return isStudentRole ? safeCurrentStudentId : 'C-ADRIEL';
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all'); // 'all' or specific folderId
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState<boolean>(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState<boolean>(false);
  const [isMoveDocModalOpen, setIsMoveDocModalOpen] = useState<boolean>(false);
  const [docToMove, setDocToMove] = useState<StudentDocument | null>(null);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>('');

  // Edit Doc Modal
  const [docToEdit, setDocToEdit] = useState<StudentDocument | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>('assessment');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);

  // New Folder Form State
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [folderFormError, setFolderFormError] = useState<string | null>(null);

  // Upload Form State
  const [uploadStudentTarget, setUploadStudentTarget] = useState<string>('C-ADRIEL');
  const [uploadFolderTarget, setUploadFolderTarget] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('assessment');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadDate, setUploadDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [uploadTags, setUploadTags] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Load and sync data
  const loadData = () => {
    const loadedFolders = getStoredFolders();
    const loadedDocs = getStoredDocuments();
    const loadedLogs = getStoredDocumentLogs();
    setFolders(loadedFolders);
    setDocuments(loadedDocs);
    setActivityLogs(loadedLogs);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('pelangi360_documents_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_documents_updated', handleUpdate);
  }, []);

  // Guarantee folders exist for all children
  useEffect(() => {
    if (allChildren && allChildren.length > 0) {
      allChildren.forEach(child => {
        if (child && child.id && child.name) {
          ensureStudentFoldersExist(child.id, child.name, 'Sistem');
        }
      });
      loadData();
    }
  }, [allChildren]);

  // Synchronize student ID for Student / Parent
  useEffect(() => {
    if (isStudentRole) {
      setSelectedStudentId(safeCurrentStudentId);
    }
  }, [isStudentRole, safeCurrentStudentId]);

  // Combined Students List with Fallback
  const resolvedStudentList = useMemo(() => {
    if (Array.isArray(allChildren) && allChildren.length > 0) {
      return allChildren;
    }
    return [
      { id: 'C-ADRIEL', name: 'Adriel Djulian Putra Aditya', parentName: 'Aditya' },
      { id: 'C102', name: 'Bagas Pratama', parentName: 'Hendro' },
      { id: 'C103', name: 'Cantika Dewi', parentName: 'Dewi' },
      { id: 'C104', name: 'Davin Alamsyah', parentName: 'Bambang' },
      { id: 'C105', name: 'Elvano Rizky', parentName: 'Rizky' }
    ];
  }, [allChildren]);

  // Active student object
  const activeStudent = useMemo(() => {
    if (isStudentRole) {
      return resolvedStudentList.find(c => c.id.toLowerCase() === safeCurrentStudentId.toLowerCase()) || {
        id: safeCurrentStudentId,
        name: safeCurrentStudentName,
        parentName: 'Orang Tua'
      };
    }
    return resolvedStudentList.find(c => c.id === selectedStudentId) || resolvedStudentList[0];
  }, [isStudentRole, safeCurrentStudentId, safeCurrentStudentName, resolvedStudentList, selectedStudentId]);

  // Filter folders accessible by the user (enforces studentId privacy)
  const accessibleFolders = useMemo(() => {
    return getFilteredFoldersForUser(folders, userRole, safeCurrentStudentId);
  }, [folders, userRole, safeCurrentStudentId]);

  // Subfolders for the active student
  const activeStudentFolders = useMemo(() => {
    const studentIdToFilter = isStudentRole ? safeCurrentStudentId : activeStudent.id;
    return accessibleFolders.filter(f => f.studentId === studentIdToFilter);
  }, [accessibleFolders, isStudentRole, safeCurrentStudentId, activeStudent]);

  // Filter documents accessible by the user (strict role & student ID isolation)
  const accessibleDocuments = useMemo(() => {
    return getFilteredDocumentsForUser(documents, userRole, safeCurrentStudentId);
  }, [documents, userRole, safeCurrentStudentId]);

  // Documents for the current student
  const studentDocuments = useMemo(() => {
    const studentIdToFilter = isStudentRole ? safeCurrentStudentId : activeStudent.id;
    return accessibleDocuments.filter(d => d.studentId === studentIdToFilter);
  }, [accessibleDocuments, isStudentRole, safeCurrentStudentId, activeStudent]);

  // Final Filtered Documents according to folder, search, category, and type
  const displayedDocuments = useMemo(() => {
    return studentDocuments.filter(doc => {
      // Folder filter
      if (selectedFolderId !== 'all' && doc.folderId !== selectedFolderId) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'office' && !['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(doc.fileType)) {
          return false;
        } else if (typeFilter !== 'office' && doc.fileType !== typeFilter) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchFileName = doc.fileName.toLowerCase().includes(q);
        const matchDesc = doc.description.toLowerCase().includes(q);
        const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
        const matchCategory = (CATEGORY_LABELS[doc.category] || '').toLowerCase().includes(q);
        if (!matchTitle && !matchFileName && !matchDesc && !matchTags && !matchCategory) {
          return false;
        }
      }
      return true;
    });
  }, [studentDocuments, selectedFolderId, categoryFilter, typeFilter, searchQuery]);

  // Overall Statistics Widget
  const stats = useMemo(() => {
    return getDocumentStats(isStudentRole ? studentDocuments : accessibleDocuments);
  }, [isStudentRole, studentDocuments, accessibleDocuments]);

  // Selected folder object
  const activeFolderObj = useMemo(() => {
    if (selectedFolderId === 'all') return null;
    return activeStudentFolders.find(f => f.id === selectedFolderId) || null;
  }, [selectedFolderId, activeStudentFolders]);

  // Handle Create Folder Submit
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    setFolderFormError(null);

    const name = newFolderName.trim();
    if (!name) {
      setFolderFormError('Nama folder tidak boleh kosong.');
      return;
    }

    if (activeStudentFolders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      setFolderFormError('Folder dengan nama ini sudah ada.');
      return;
    }

    createCustomStudentFolder(
      activeStudent.id,
      activeStudent.name,
      name,
      currentUserName || 'Admin',
      userRole || 'admin'
    );

    loadData();
    setNewFolderName('');
    setIsCreateFolderModalOpen(false);
  };

  // Handle Delete Folder
  const handleDeleteFolder = (folderId: string) => {
    if (!isManagerOrSuperAdmin && !isAdmin) return;
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    if (confirm(`Apakah Anda yakin ingin menghapus folder "${folder.name}"? Berkas di dalamnya akan dipindahkan ke folder "Dokumen Lainnya".`)) {
      const res = deleteStudentFolder(folderId, currentUserName || 'Admin', userRole || 'admin');
      if (res.success) {
        if (selectedFolderId === folderId) {
          setSelectedFolderId('all');
        }
        loadData();
      } else {
        alert(res.message);
      }
    }
  };

  // Handle Document Delete (Admin requests approval, Manager directly deletes)
  const handleDeleteDocument = (doc: StudentDocument) => {
    if (isStudentRole) return;

    if (isManagerOrSuperAdmin) {
      if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${doc.title}" secara permanen?`)) {
        deleteStudentDocumentPermanently(doc.id, currentUserName || 'Manager', userRole || 'manager');
        loadData();
        if (previewDoc && previewDoc.id === doc.id) {
          setPreviewDoc(null);
        }
      }
    } else if (isAdmin) {
      if (confirm(`Sesuai kebijakan keamanan, penghapusan dokumen oleh Admin membutuhkan persetujuan Manager. Ajukan permohonan hapus untuk "${doc.title}"?`)) {
        requestDeleteDocument(doc.id, currentUserName || 'Admin', 'admin');
        loadData();
        alert('Permohonan hapus dokumen telah diajukan ke Manager.');
      }
    }
  };

  // Handle Move Document
  const handleOpenMoveModal = (doc: StudentDocument) => {
    setDocToMove(doc);
    setTargetMoveFolderId(doc.folderId);
    setIsMoveDocModalOpen(true);
  };

  const handleConfirmMoveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToMove || !targetMoveFolderId) return;

    const targetFolder = activeStudentFolders.find(f => f.id === targetMoveFolderId);
    const folderName = targetFolder ? targetFolder.name : 'Folder Baru';

    moveStudentDocument(
      docToMove.id,
      targetMoveFolderId,
      folderName,
      currentUserName || 'Admin',
      userRole || 'admin'
    );

    loadData();
    setIsMoveDocModalOpen(false);
    setDocToMove(null);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (doc: StudentDocument) => {
    setDocToEdit(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditDesc(doc.description);
    setEditTags(doc.tags ? doc.tags.join(', ') : '');
  };

  const handleSaveEditDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToEdit) return;

    const parsedTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    updateStudentDocument(
      docToEdit.id,
      {
        title: editTitle.trim(),
        category: editCategory,
        description: editDesc.trim(),
        tags: parsedTags
      },
      currentUserName || 'Admin',
      userRole || 'admin'
    );

    loadData();
    setDocToEdit(null);
  };

  // Handle Upload Form File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      const validDocExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      const validImgExts = ['jpg', 'jpeg', 'png', 'webp'];
      const validVidExts = ['mp4', 'mov'];

      const isDoc = validDocExts.includes(ext);
      const isImg = validImgExts.includes(ext);
      const isVid = validVidExts.includes(ext);

      if (!isDoc && !isImg && !isVid) {
        setUploadError(`Format file .${ext} tidak didukung. Format yang diizinkan: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, JPG/PNG, MP4/MOV.`);
        setSelectedFile(null);
        return;
      }

      // Size checks: 20MB for docs/images, 200MB for video
      if ((isDoc || isImg) && file.size > 20 * 1024 * 1024) {
        setUploadError('Ukuran file dokumen/gambar melebihi batas maksimal 20 MB.');
        setSelectedFile(null);
        return;
      }

      if (isVid && file.size > 200 * 1024 * 1024) {
        setUploadError('Ukuran video melebihi batas maksimal 200 MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (!uploadTitle) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(cleanTitle);
      }
    }
  };

  // Submit Upload Document
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!uploadTitle.trim()) {
      setUploadError('Nama dokumen wajib diisi.');
      return;
    }

    if (!selectedFile) {
      setUploadError('Mohon pilih berkas yang akan diunggah.');
      return;
    }

    const studentObj = resolvedStudentList.find(s => s.id === uploadStudentTarget) || resolvedStudentList[0];
    const studentFolders = folders.filter(f => f.studentId === studentObj.id);
    const chosenFolderId = uploadFolderTarget || (studentFolders[0]?.id || `fld-${studentObj.id}-lainnya`);

    // Determine FileType
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    let fileType: FileType = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) fileType = 'image';
    else if (['mp4', 'mov'].includes(ext)) fileType = 'video';
    else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
    else if (['xls', 'xlsx'].includes(ext)) fileType = 'xlsx';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'pptx';

    setIsUploading(true);

    try {
      // Simulate fast upload with browser Data URL / Object URL
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string;

        uploadStudentDocument({
          studentId: studentObj.id,
          studentName: studentObj.name,
          folderId: chosenFolderId,
          title: uploadTitle.trim(),
          category: uploadCategory,
          description: uploadDesc.trim() || 'Dokumen perkembangan anak di Pelangi Lazuardi.',
          documentDate: uploadDate || new Date().toISOString().split('T')[0],
          fileType,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileUrl: resultUrl,
          thumbnailUrl: fileType === 'image' ? resultUrl : undefined,
          tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
          uploadedBy: currentUserName || 'Admin Pelangi',
          uploadedByRole: userRole || 'admin'
        });

        setIsUploading(false);
        setUploadSuccess(`Dokumen "${uploadTitle.trim()}" berhasil diunggah.`);
        loadData();

        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadTitle('');
          setUploadDesc('');
          setSelectedFile(null);
          setUploadSuccess(null);
        }, 1000);
      };

      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Gagal membaca berkas. Silakan coba kembali.');
      };

      // Read small files as DataURL, for videos or large files use sample URL
      if (selectedFile.size < 5 * 1024 * 1024) {
        reader.readAsDataURL(selectedFile);
      } else {
        // Fallback for larger files
        uploadStudentDocument({
          studentId: studentObj.id,
          studentName: studentObj.name,
          folderId: chosenFolderId,
          title: uploadTitle.trim(),
          category: uploadCategory,
          description: uploadDesc.trim() || 'Dokumen perkembangan anak di Pelangi Lazuardi.',
          documentDate: uploadDate || new Date().toISOString().split('T')[0],
          fileType,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileUrl: fileType === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : undefined,
          tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
          uploadedBy: currentUserName || 'Admin Pelangi',
          uploadedByRole: userRole || 'admin'
        });

        setIsUploading(false);
        setUploadSuccess(`Dokumen "${uploadTitle.trim()}" berhasil diunggah.`);
        loadData();

        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadTitle('');
          setUploadDesc('');
          setSelectedFile(null);
          setUploadSuccess(null);
        }, 1000);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setIsUploading(false);
      setUploadError('Terjadi kesalahan saat mengunggah berkas.');
    }
  };

  // File Icon Resolver
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-400" />;
      case 'doc':
      case 'docx':
        return <FileCheck className="w-5 h-5 text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-teal-400" />;
      case 'ppt':
      case 'pptx':
        return <Layers className="w-5 h-5 text-amber-400" />;
      default:
        return <FileQuestion className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 custom-scrollbar">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
              Pelangi 360 Arsip Digital
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">
              {isStudentRole ? 'Dokumen Perkembangan Saya' : 'Dokumen Perkembangan Siswa'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderArchive className="w-7 h-7 text-indigo-400" />
            {isStudentRole ? 'Dokumen Perkembangan Saya' : 'Dokumen Perkembangan Siswa'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isStudentRole
              ? `Pusat arsip digital seluruh laporan assessment, program, foto, dan evaluasi tumbuh kembang ananda ${safeCurrentStudentName.split(' ')[0]}.`
              : 'Pusat arsip digital seluruh dokumen perkembangan anak secara terstruktur, aman, dan mudah diakses.'}
          </p>
        </div>

        {/* Action Buttons for Admin & Manager */}
        {canManage && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsActivityLogModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Lihat riwayat aktivitas dokumen"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Riwayat Aktivitas</span>
            </button>

            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Buat folder baru untuk siswa ini"
            >
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Folder Baru</span>
            </button>

            <button
              onClick={() => {
                setUploadStudentTarget(activeStudent.id);
                setUploadFolderTarget(selectedFolderId !== 'all' ? selectedFolderId : '');
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Dokumen</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= SUMMARY STATS WIDGET ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Total Dokumen</span>
            <Folder className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {stats.totalDocuments}
            </span>
            <span className="text-[11px] text-slate-400">berkas</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Format PDF</span>
            <FileText className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {stats.totalPdf}
            </span>
            <span className="text-[11px] text-slate-400">laporan</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Foto Terapi</span>
            <ImageIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {stats.totalImage}
            </span>
            <span className="text-[11px] text-slate-400">foto</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Video Terapi</span>
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {stats.totalVideo}
            </span>
            <span className="text-[11px] text-slate-400">rekaman</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Office & Word</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums">
              {stats.totalOffice}
            </span>
            <span className="text-[11px] text-slate-400">dokumen</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">Kapasitas Cloud</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white tracking-tight truncate">
              {stats.totalSizeFormatted}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">/ 10 GB</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT SPLIT (FOLDER NAV & DOCUMENT REPOSITORY) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: STUDENT & FOLDER EXPLORER TREE */}
        <div className="lg:col-span-4 space-y-4">
          {/* Siswa Selector (Khusus Admin & Manager) */}
          {!isStudentRole && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Pilih Siswa / Pasien:
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {resolvedStudentList.length} Siswa Terdaftar
                </span>
              </label>

              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setSelectedFolderId('all');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-semibold"
              >
                {resolvedStudentList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) - Wali: {c.parentName || 'Orang Tua'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Profile Card in Document View */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-base shrink-0 shadow-inner">
              {activeStudent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                ID: {activeStudent.id}
              </span>
              <h3 className="text-sm font-extrabold text-white truncate mt-1">
                {activeStudent.name}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Wali Murid: {activeStudent.parentName || 'Keluarga Siswa'}
              </p>
            </div>
          </div>

          {/* Folders Tree List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                Struktur Folder
              </span>
              <span className="text-[10px] text-slate-500">
                {activeStudentFolders.length} Folder
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {/* All Documents option */}
              <button
                onClick={() => setSelectedFolderId('all')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  selectedFolderId === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className="truncate">Seluruh Dokumen Siswa</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedFolderId === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {studentDocuments.length}
                </span>
              </button>

              {/* Subfolders list */}
              {activeStudentFolders.map(folder => {
                const count = studentDocuments.filter(d => d.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className={`group rounded-xl transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex-1 p-2.5 text-left text-xs font-semibold flex items-center gap-2 truncate cursor-pointer"
                    >
                      <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                      <span className="truncate">{folder.name}</span>
                    </button>

                    <div className="flex items-center gap-1 pr-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>

                      {/* Delete folder button for custom folders (Admin & Manager) */}
                      {canManage && !folder.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className={`p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                            isSelected ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                          title="Hapus folder kustom ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REPOSITORY, SEARCH, TOOLBAR, & DOCUMENT LIST */}
        <div className="lg:col-span-8 space-y-4">
          {/* Breadcrumbs & Layout Toggle Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs truncate">
              <span 
                onClick={() => setSelectedFolderId('all')}
                className="text-slate-400 hover:text-indigo-300 cursor-pointer transition font-medium"
              >
                {isStudentRole ? 'Dokumen Perkembangan Saya' : activeStudent.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-white font-bold truncate">
                {activeFolderObj ? activeFolderObj.name : 'Seluruh Dokumen'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {displayedDocuments.length} berkas
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewLayout === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Grid"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewLayout === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan List"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama dokumen, kata kunci tag, atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 sm:w-48"
              >
                <option value="all">Semua Kategori</option>
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 sm:w-36"
              >
                <option value="all">Semua Format</option>
                <option value="pdf">📄 PDF</option>
                <option value="image">🖼️ Gambar / Foto</option>
                <option value="video">🎥 Video</option>
                <option value="office">📑 Office / Word</option>
              </select>
            </div>
          </div>

          {/* Document Content View (Empty State or Items) */}
          {displayedDocuments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
                <FolderArchive className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                {isStudentRole ? 'Belum Ada Dokumen Perkembangan' : 'Folder Belum Berisi Dokumen'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isStudentRole
                  ? 'Belum ada dokumen yang diunggah ke folder ini oleh klinik. Setiap laporan hasil assessment dan evaluasi akan otomatis tampil di sini.'
                  : 'Belum ada dokumen yang diunggah pada folder atau kriteria pencarian ini. Gunakan tombol "Upload Dokumen" di atas untuk menambahkan berkas baru.'}
              </p>
              {canManage && (
                <button
                  onClick={() => {
                    setUploadStudentTarget(activeStudent.id);
                    setUploadFolderTarget(selectedFolderId !== 'all' ? selectedFolderId : '');
                    setIsUploadModalOpen(true);
                  }}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Berkas ke Folder Ini</span>
                </button>
              )}
            </div>
          ) : viewLayout === 'grid' ? (
            /* ================= GRID VIEW ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedDocuments.map(doc => {
                const isPendingDelete = Boolean(doc.isPendingDeleteApproval);
                return (
                  <div
                    key={doc.id}
                    className={`bg-slate-900 border rounded-2xl p-4 shadow-lg hover:border-indigo-500/50 transition-all flex flex-col justify-between group relative overflow-hidden ${
                      isPendingDelete ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
                    }`}
                  >
                    {isPendingDelete && (
                      <div className="absolute top-2 right-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Menunggu Persetujuan Hapus
                      </div>
                    )}

                    <div>
                      {/* Top Bar: Icon, Category Badge & Date */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[160px]">
                          {CATEGORY_LABELS[doc.category] || doc.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 
                        onClick={() => setPreviewDoc(doc)}
                        className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                        title={doc.title}
                      >
                        {doc.title}
                      </h4>

                      {/* Excerpt Description */}
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {doc.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Meta & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="space-y-0.5">
                        <span className="block font-mono font-semibold text-slate-300">{doc.fileSizeFormatted}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(doc.documentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (doc.fileUrl) {
                              const link = document.createElement('a');
                              link.href = doc.fileUrl;
                              link.download = doc.fileName;
                              link.click();
                            } else {
                              alert(`Mengunduh berkas: ${doc.fileName}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Admin / Manager actions */}
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenMoveModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Pindahkan ke folder lain"
                            >
                              <MoveRight className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Ubah metadata dokumen"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title={isManagerOrSuperAdmin ? 'Hapus berkas permanen' : 'Ajukan hapus ke Manager'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= LIST VIEW ================= */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-slate-800/80">
                {displayedDocuments.map(doc => {
                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {CATEGORY_LABELS[doc.category] || doc.category}
                            </span>
                            <h4 
                              onClick={() => setPreviewDoc(doc)}
                              className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate cursor-pointer"
                            >
                              {doc.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {doc.fileName} • {doc.fileSizeFormatted} • Diunggah oleh {doc.uploadedBy}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>

                        <button
                          onClick={() => {
                            if (doc.fileUrl) {
                              const link = document.createElement('a');
                              link.href = doc.fileUrl;
                              link.download = doc.fileName;
                              link.click();
                            } else {
                              alert(`Mengunduh berkas: ${doc.fileName}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenMoveModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title="Pindahkan ke folder lain"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title="Edit metadata"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title={isManagerOrSuperAdmin ? 'Hapus berkas' : 'Ajukan hapus'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL 1: PREVIEW DOKUMEN (PDF, GAMBAR, VIDEO, OFFICE) ================= */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div className="truncate">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {CATEGORY_LABELS[previewDoc.category] || previewDoc.category}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">
                    {previewDoc.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (previewDoc.fileUrl) {
                      const link = document.createElement('a');
                      link.href = previewDoc.fileUrl;
                      link.download = previewDoc.fileName;
                      link.click();
                    } else {
                      alert(`Mengunduh berkas: ${previewDoc.fileName}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </button>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[380px] custom-scrollbar">
              {/* 1. PDF VIEWER */}
              {previewDoc.fileType === 'pdf' && (
                <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4 font-sans border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                        PL
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">KLINIK TERAPI PELANGI LAZUARDI</h4>
                        <p className="text-[10px] text-slate-500">Pusat Layanan Tumbuh Kembang & Stimulasi Anak</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold border border-slate-300">
                      LEMBAR ARSIP RESMI
                    </span>
                  </div>

                  <div className="py-2 text-center border-b border-slate-100">
                    <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                      {previewDoc.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Pasien: <strong>{previewDoc.studentName}</strong> (ID: {previewDoc.studentId})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tanggal Dokumen: {new Date(previewDoc.documentDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                    <h5 className="font-bold text-slate-900">Ringkasan Catatan Klinis:</h5>
                    <p>{previewDoc.description}</p>
                    <div className="pt-2 text-[11px] text-slate-500 italic">
                      "Dokumen ini disimpan secara aman dalam sistem arsip digital Pelangi 360 dan telah diverifikasi oleh tenaga profesional penanggung jawab."
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-200">
                    <span>Diunggah oleh: <strong>{previewDoc.uploadedBy}</strong></span>
                    <span>File: {previewDoc.fileName} ({previewDoc.fileSizeFormatted})</span>
                  </div>
                </div>
              )}

              {/* 2. IMAGE GALLERY PREVIEW */}
              {previewDoc.fileType === 'image' && (
                <div className="w-full flex flex-col items-center justify-center space-y-3">
                  <div className="max-h-[60vh] max-w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                    <img 
                      src={previewDoc.fileUrl || previewDoc.thumbnailUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80'} 
                      alt={previewDoc.title} 
                      className="max-h-[60vh] w-auto object-contain mx-auto"
                    />
                  </div>
                  <p className="text-xs text-slate-300 text-center max-w-md">
                    {previewDoc.description}
                  </p>
                </div>
              )}

              {/* 3. VIDEO PLAYER */}
              {previewDoc.fileType === 'video' && (
                <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-3">
                  <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black aspect-video flex items-center justify-center">
                    <video 
                      controls 
                      className="w-full h-full object-contain"
                      src={previewDoc.fileUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    >
                      Browser Anda tidak mendukung tag video HTML5.
                    </video>
                  </div>
                  <p className="text-xs text-slate-300 text-center max-w-md">
                    {previewDoc.description}
                  </p>
                </div>
              )}

              {/* 4. OFFICE / WORD / SPREADSHEET PREVIEW */}
              {['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'other'].includes(previewDoc.fileType) && (
                <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                    {getFileIcon(previewDoc.fileType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{previewDoc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{previewDoc.fileName} ({previewDoc.fileSizeFormatted})</p>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed text-left">
                    {previewDoc.description}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dokumen ini adalah berkas format Office/Word/Excel. Anda dapat mengunduh berkas lengkap untuk diedit di aplikasi Office Anda.
                  </p>
                  <button
                    onClick={() => {
                      if (previewDoc.fileUrl) {
                        const link = document.createElement('a');
                        link.href = previewDoc.fileUrl;
                        link.download = previewDoc.fileName;
                        link.click();
                      } else {
                        alert(`Mengunduh berkas: ${previewDoc.fileName}`);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh {previewDoc.fileName}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Diunggah: {new Date(previewDoc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>Oleh: {previewDoc.uploadedBy} ({previewDoc.uploadedByRole})</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: UPLOAD DOKUMEN (ADMIN & MANAGER) ================= */}
      {isUploadModalOpen && canManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Dokumen Perkembangan</h3>
                  <p className="text-xs text-slate-400">Simpan laporan, foto, atau video ke arsip siswa</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* Siswa & Folder Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Siswa:</label>
                  <select
                    value={uploadStudentTarget}
                    onChange={(e) => setUploadStudentTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {resolvedStudentList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Folder:</label>
                  <select
                    value={uploadFolderTarget}
                    onChange={(e) => setUploadFolderTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Folder Utama (Otomatis)</option>
                    {folders.filter(f => f.studentId === uploadStudentTarget).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Pilih Berkas (File):</label>
                <div className="p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl bg-slate-950/60 text-center space-y-2 transition cursor-pointer">
                  <input
                    type="file"
                    id="fileUploadInput"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.mov"
                  />
                  <label htmlFor="fileUploadInput" className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                    {selectedFile ? (
                      <div>
                        <span className="font-bold text-white text-xs block">{selectedFile.name}</span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {formatFileSize(selectedFile.size)} - Siap Diunggah
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-slate-300 block">Klik untuk memilih berkas</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Format: PDF, Word, Excel, Foto (maks 20MB) atau Video (maks 200MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Nama Dokumen */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nama Dokumen:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Assessment Okupasi Triwulan I"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Kategori & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Kategori Dokumen:</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tanggal Dokumen:</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Deskripsi Dokumen:</label>
                <textarea
                  rows={3}
                  placeholder="Berikan ringkasan isi dokumen, evaluasi, atau catatan klinis..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Tag / Kata Kunci */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Tag / Kata Kunci (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  placeholder="Contoh: okupasi, sensori, semester 1, evaluasi"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Upload Meta Note */}
              <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                <div>Diunggah Oleh: <strong>{currentUserName}</strong> ({userRole})</div>
                <div>Waktu Unggah: <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Mengunggah...' : 'Upload Dokumen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: BUAT FOLDER BARU (ADMIN & MANAGER) ================= */}
      {isCreateFolderModalOpen && canManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsCreateFolderModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Buat Folder Baru</h3>
                  <p className="text-xs text-slate-400">Untuk ananda {activeStudent.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {folderFormError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{folderFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nama Folder Baru:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semester 1, Laporan Tahunan, Assessment TW..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Preset Folder Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rekomendasi Nama Folder:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Semester 1',
                    'Semester 2',
                    'Laporan Tahunan',
                    'Assessment OT',
                    'Assessment TW',
                    'Assessment Psikolog',
                    'Hasil Medis & Laboratorium',
                    'Konsultasi Orang Tua'
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setNewFolderName(preset)}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Buat Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: PINDAHKAN DOKUMEN (ADMIN & MANAGER) ================= */}
      {isMoveDocModalOpen && docToMove && canManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsMoveDocModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <MoveRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pindahkan Dokumen</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[240px]">{docToMove.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMoveDocModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMoveDoc} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Pilih Folder Tujuan:</label>
                <select
                  value={targetMoveFolderId}
                  onChange={(e) => setTargetMoveFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  {activeStudentFolders.map(f => (
                    <option key={f.id} value={f.id}>📁 {f.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMoveDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Pindahkan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: EDIT METADATA DOKUMEN ================= */}
      {docToEdit && canManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setDocToEdit(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ubah Metadata Dokumen</h3>
                  <p className="text-xs text-slate-400">{docToEdit.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setDocToEdit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDoc} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Nama Dokumen:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Kategori:</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Deskripsi / Catatan:</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Tag / Kata Kunci:</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDocToEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: RIWAYAT AKTIVITAS DOKUMEN ================= */}
      {isActivityLogModalOpen && canManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsActivityLogModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Riwayat Aktivitas Dokumen</h3>
                  <p className="text-xs text-slate-400">Pencatatan riwayat unggah, ubah, dan hapus berkas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsActivityLogModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {activityLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Belum ada log aktivitas tercatat.
                </div>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        {log.userName} ({log.userRole})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300">{log.details}</p>
                    <span className="text-[10px] text-indigo-400 block">
                      Terkait: {log.studentName} {log.documentTitle ? `• ${log.documentTitle}` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setIsActivityLogModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentsPage;
