import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Lock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  History, 
  Shield, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Calendar,
  Check,
  IdCard,
  UserCheck
} from 'lucide-react';
import { getStoredLogs, getInitials } from '../utils/rbacStorage';

export interface ProfileUser {
  id: string;
  fullName: string;
  displayName?: string;
  email: string;
  phone: string;
  photoUrl?: string;
  role?: string;
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: ProfileUser;
  // Fallback prop compatibility
  currentProfile?: { name: string; email: string; photoUrl: string };
  onSaveProfile?: (updated: { fullName: string; displayName?: string; email: string; phone: string; photoUrl?: string }) => Promise<{ success: boolean; message?: string } | boolean | void> | { success: boolean; message?: string } | boolean | void;
  onSavePhoto?: (newPhotoUrl: string) => Promise<{ success: boolean; message?: string } | boolean | void> | { success: boolean; message?: string } | boolean | void;
  onDeletePhoto?: () => Promise<{ success: boolean; message?: string } | boolean | void> | { success: boolean; message?: string } | boolean | void;
  onSavePassword?: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onSave?: (newProfile: { name: string; email: string; photoUrl: string }) => Promise<void> | void;
}

export { getInitials };

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser: propUser, 
  currentProfile,
  onSaveProfile,
  onSavePhoto,
  onDeletePhoto,
  onSavePassword,
  onSave
}) => {
  // Normalize user data with robust fallbacks
  const effectiveUser: ProfileUser = useMemo(() => {
    if (propUser) return propUser;
    if (currentProfile) {
      return {
        id: 'USR-CURRENT',
        fullName: currentProfile.name || 'Pengguna Pelangi',
        displayName: currentProfile.name ? currentProfile.name.split(' ')[0] : 'Pengguna',
        email: currentProfile.email || '',
        phone: '',
        photoUrl: currentProfile.photoUrl || '',
        role: 'Admin'
      };
    }
    return {
      id: 'USR-GUEST',
      fullName: 'Pengguna Pelangi',
      displayName: 'Pengguna',
      email: '',
      phone: '',
      photoUrl: '',
      role: 'Pengguna'
    };
  }, [propUser, currentProfile]);

  // Active Tab: starts in 'view' (Ringkasan Profil), toggles to 'editProfile', 'changePhoto', 'changePassword', or 'history'
  const [activeTab, setActiveTab] = useState<'view' | 'editProfile' | 'changePhoto' | 'changePassword' | 'history'>('view');

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status & Notification Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // Photo Crop & Edit State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [photoScale, setPhotoScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // Synchronize state when modal opens or user updates
  useEffect(() => {
    if (isOpen) {
      setFullName(effectiveUser.fullName || '');
      setDisplayName(effectiveUser.displayName || '');
      setEmail(effectiveUser.email || '');
      setPhone(effectiveUser.phone || '');
      setPhotoPreview(effectiveUser.photoUrl || null);
      setRawImageSrc(effectiveUser.photoUrl || null);
      setPhotoScale(1);
      setPanOffset({ x: 0, y: 0 });
      setActiveTab('view');
      setProfileError(null);
      setProfileSuccess(null);
      setPhotoError(null);
      setPhotoSuccess(null);
      setPassError(null);
      setPassSuccess(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSaving(false);
      setIsProcessingPhoto(false);
      setIsSavingPass(false);
    }
  }, [isOpen, effectiveUser]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Activity logs filtered for profile changes
  const profileLogs = useMemo(() => {
    try {
      const logs = getStoredLogs();
      return logs.filter(l => 
        (l.userId === effectiveUser.id || l.userName === effectiveUser.fullName) &&
        (l.actionType === 'UPDATE' || l.actionType === 'PASSWORD_RESET')
      );
    } catch {
      return [];
    }
  }, [effectiveUser]);

  // Helper to generate cropped image from canvas (JPG max quality square avatar)
  const generateCroppedImage = async (): Promise<string> => {
    if (!rawImageSrc) {
      throw new Error('Tidak ada gambar untuk dipotong.');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const outputSize = 400; // Standard crisp square avatar
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak dapat diinisialisasi.'));
          return;
        }

        // Fill background
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Aspect ratio calculations
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let drawWidth = outputSize * photoScale;
        let drawHeight = outputSize * photoScale;

        if (imgAspect > 1) {
          drawWidth = outputSize * imgAspect * photoScale;
        } else {
          drawHeight = (outputSize / imgAspect) * photoScale;
        }

        // Center position + pan offset scaled to canvas
        const posX = (outputSize - drawWidth) / 2 + panOffset.x * (outputSize / 150);
        const posY = (outputSize - drawHeight) / 2 + panOffset.y * (outputSize / 150);

        ctx.drawImage(img, posX, posY, drawWidth, drawHeight);

        // Compress to high quality JPEG data URL
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(croppedUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar foto.'));
      img.src = rawImageSrc;
    });
  };

  // Validate photo file (JPG, JPEG, PNG, WEBP, max 5 MB)
  const validatePhotoFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return '❌ Format file tidak didukung. Mohon gunakan format JPG, JPEG, PNG, atau WEBP.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return '❌ Ukuran file foto melebihi batas maksimal 5 MB.';
    }
    return null;
  };

  // Handle Photo File Change in Crop Tab
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    setPhotoSuccess(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validatePhotoFile(file);
      if (error) {
        setPhotoError(error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRawImageSrc(reader.result);
          setPhotoPreview(reader.result);
          setPhotoScale(1);
          setPanOffset({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Quick Photo Pick from Edit Profile form
  const handleQuickPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validatePhotoFile(file);
      if (error) {
        setProfileError(error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
          setRawImageSrc(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Profile Form: Validate -> Loading -> Save to DB -> Success Notif -> Close Edit Mode -> Instant Update
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const cleanName = fullName.trim();
    const cleanDisplay = displayName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    // 1. Validasi: Nama wajib diisi
    if (!cleanName) {
      setProfileError('❌ Nama wajib diisi.');
      fullNameInputRef.current?.focus();
      return;
    }

    // 2. Validasi: Email harus valid
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (cleanEmail && !emailRegex.test(cleanEmail)) {
      setProfileError('❌ Email tidak valid.');
      return;
    }

    // 3. Validasi: Nomor HP harus valid
    if (cleanPhone) {
      const phoneDigits = cleanPhone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 8 || phoneDigits.length > 16) {
        setProfileError('❌ Nomor HP tidak valid.');
        return;
      }
    }

    // 4. Loading State
    setIsSaving(true);

    try {
      let isSuccess = true;
      let errorMsg = '❌ Gagal menyimpan profil. Silakan coba kembali.';

      if (onSaveProfile) {
        const res = await onSaveProfile({
          fullName: cleanName,
          displayName: cleanDisplay || cleanName.split(' ')[0],
          email: cleanEmail,
          phone: cleanPhone,
          photoUrl: photoPreview || undefined
        });

        if (typeof res === 'object' && res !== null && 'success' in res) {
          isSuccess = (res as any).success;
          if (!isSuccess && (res as any).message) {
            errorMsg = (res as any).message;
          }
        } else if (res === false) {
          isSuccess = false;
        }
      } else if (onSave) {
        await onSave({
          name: cleanDisplay || cleanName,
          email: cleanEmail,
          photoUrl: photoPreview || effectiveUser.photoUrl || ''
        });
      }

      if (!isSuccess) {
        setProfileError(errorMsg);
        setIsSaving(false);
        return;
      }

      // Success Notification
      setProfileSuccess('✅ Profil berhasil diperbarui.');
      setIsSaving(false);

      // Tutup mode edit dan tampilkan data terbaru di Ringkasan Profil
      setTimeout(() => {
        setActiveTab('view');
      }, 600);

      // Auto-hide success notification after a few seconds
      setTimeout(() => {
        setProfileSuccess(null);
      }, 4000);

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileError('❌ Gagal menyimpan profil. Silakan coba kembali.');
      setIsSaving(false);
    }
  };

  // Submit Photo in Crop Tab
  const handleSubmitPhoto = async () => {
    setPhotoError(null);
    setPhotoSuccess(null);

    if (!rawImageSrc) {
      setPhotoError('❌ Belum ada foto yang dipilih. Silakan upload foto terlebih dahulu.');
      return;
    }

    setIsProcessingPhoto(true);
    try {
      const croppedUrl = await generateCroppedImage();
      let isSuccess = true;
      let errorMsg = '❌ Gagal menyimpan foto profil. Silakan coba kembali.';

      if (onSavePhoto) {
        const res = await onSavePhoto(croppedUrl);
        if (typeof res === 'object' && res !== null && 'success' in res) {
          isSuccess = (res as any).success;
          if (!isSuccess && (res as any).message) errorMsg = (res as any).message;
        } else if (res === false) {
          isSuccess = false;
        }
      } else if (onSaveProfile) {
        await onSaveProfile({
          fullName: effectiveUser.fullName,
          displayName: effectiveUser.displayName,
          email: effectiveUser.email,
          phone: effectiveUser.phone,
          photoUrl: croppedUrl
        });
      } else if (onSave) {
        await onSave({
          name: effectiveUser.displayName || effectiveUser.fullName,
          email: effectiveUser.email,
          photoUrl: croppedUrl
        });
      }

      if (!isSuccess) {
        setPhotoError(errorMsg);
        setIsProcessingPhoto(false);
        return;
      }

      setPhotoPreview(croppedUrl);
      setPhotoSuccess('✅ Profil berhasil diperbarui.');
      setIsProcessingPhoto(false);

      setTimeout(() => {
        setPhotoSuccess(null);
        setActiveTab('view');
      }, 800);
    } catch (err: any) {
      setPhotoError(err?.message || '❌ Gagal memproses crop foto. Silakan coba kembali.');
      setIsProcessingPhoto(false);
    }
  };

  // Handle Remove Photo (revert to initials avatar)
  const handleRemovePhoto = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus foto profil? Avatar akan otomatis menampilkan inisial nama.')) {
      try {
        if (onDeletePhoto) {
          await onDeletePhoto();
        } else if (onSavePhoto) {
          await onSavePhoto('');
        } else if (onSaveProfile) {
          await onSaveProfile({
            fullName: effectiveUser.fullName,
            displayName: effectiveUser.displayName,
            email: effectiveUser.email,
            phone: effectiveUser.phone,
            photoUrl: ''
          });
        } else if (onSave) {
          await onSave({
            name: effectiveUser.displayName || effectiveUser.fullName,
            email: effectiveUser.email,
            photoUrl: ''
          });
        }
        setPhotoPreview(null);
        setRawImageSrc(null);
        setProfileSuccess('✅ Profil berhasil diperbarui.');
        setTimeout(() => {
          setProfileSuccess(null);
          setActiveTab('view');
        }, 800);
      } catch (err) {
        setProfileError('❌ Gagal menghapus foto profil.');
      }
    }
  };

  // Pan / Reposition helper buttons
  const nudgePan = (deltaX: number, deltaY: number) => {
    setPanOffset(prev => ({
      x: Math.max(-60, Math.min(60, prev.x + deltaX)),
      y: Math.max(-60, Math.min(60, prev.y + deltaY))
    }));
  };

  const resetCrop = () => {
    setPhotoScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Reset form fields back to currently saved values
  const handleResetForm = () => {
    setFullName(effectiveUser.fullName || '');
    setDisplayName(effectiveUser.displayName || '');
    setEmail(effectiveUser.email || '');
    setPhone(effectiveUser.phone || '');
    setPhotoPreview(effectiveUser.photoUrl || null);
    setProfileError(null);
    setProfileSuccess(null);
    fullNameInputRef.current?.focus();
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    handleResetForm();
    setActiveTab('view');
  };

  // Submit Password Change
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setPassError('❌ Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (cleanNew.length < 6) {
      setPassError('❌ Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPassError('❌ Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSavingPass(true);

    try {
      if (onSavePassword) {
        const res = await onSavePassword(cleanOld, cleanNew);
        if (!res.success) {
          setPassError(`❌ ${res.message || 'Gagal mengubah kata sandi.'}`);
          setIsSavingPass(false);
          return;
        }
        setPassSuccess(`✅ ${res.message || 'Kata sandi berhasil diperbarui!'}`);
      } else {
        setPassSuccess('✅ Kata sandi berhasil diperbarui!');
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSavingPass(false);

      setTimeout(() => {
        setPassSuccess(null);
        setActiveTab('view');
      }, 1000);
    } catch (err: any) {
      setPassError('❌ Gagal menyimpan kata sandi baru. Silakan coba kembali.');
      setIsSavingPass(false);
    }
  };

  if (!isOpen) return null;

  const displayedAvatar = photoPreview || effectiveUser.photoUrl;
  const userInitials = getInitials(effectiveUser.fullName || effectiveUser.displayName || 'PL');

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Profil Pengguna"
      >
        {/* ================= HEADER HERO: TAMPILAN NAMA FULL DI PROFIL ================= */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 border-b border-slate-800 shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Profil"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* AVATAR WITH QUICK CAMERA TRIGGER */}
            <div className="relative group shrink-0">
              {displayedAvatar ? (
                <img
                  src={displayedAvatar}
                  alt={effectiveUser.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl group-hover:opacity-90 transition"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-indigo-500/30 shadow-xl tracking-wider select-none">
                  {userInitials}
                </div>
              )}

              {/* Quick Camera Overlay */}
              <button
                type="button"
                onClick={() => setActiveTab('changePhoto')}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition cursor-pointer border-2 border-slate-900 active:scale-95 flex items-center justify-center"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* USER INFO: TAMPILAN NAMA FULL DI PROFIL */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {effectiveUser.role || 'Pengguna'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                  ID: {effectiveUser.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktif
                </span>
              </div>

              {/* Prominent Full Name Display */}
              <h2 
                className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1.5 break-words line-clamp-2"
                title={effectiveUser.fullName}
              >
                {effectiveUser.fullName}
              </h2>

              {/* Display Name Subtitle if set and different */}
              {effectiveUser.displayName && effectiveUser.displayName !== effectiveUser.fullName && (
                <p className="text-xs text-indigo-300/90 font-medium truncate flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Nama Tampilan: <strong className="text-white">{effectiveUser.displayName}</strong></span>
                </p>
              )}

              <p className="text-xs text-slate-400 mt-1 truncate flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{effectiveUser.email || 'Belum ada email terdaftar'}</span>
              </p>

              {/* Quick Action Buttons in Profile Header */}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('editProfile');
                    setTimeout(() => fullNameInputRef.current?.focus(), 100);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    activeTab === 'editProfile'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('changePhoto')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    activeTab === 'changePhoto'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80'
                  }`}
                >
                  <Camera className="w-3 h-3 text-indigo-400" />
                  <span>Ubah Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('changePassword')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    activeTab === 'changePassword'
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80'
                  }`}
                >
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Ubah Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs shrink-0">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
              activeTab === 'view'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Ringkasan Profil</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('editProfile');
              setTimeout(() => fullNameInputRef.current?.focus(), 100);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
              activeTab === 'editProfile'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('changePhoto')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
              activeTab === 'changePhoto'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ubah Foto Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('changePassword')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
              activeTab === 'changePassword'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ubah Password</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat</span>
          </button>
        </div>

        {/* ================= TAB BODY ================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-900">
          
          {/* GLOBAL SUCCESS & ERROR NOTIFICATIONS (ALWAYS VISIBLE WHEN ACTIVE) */}
          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-semibold">{profileError}</span>
            </div>
          )}

          {/* TAB 1: RINGKASAN PROFIL (VIEW MODE DENGAN NAMA FULL) */}
          {activeTab === 'view' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Ringkasan Profil Pengguna
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('editProfile');
                    setTimeout(() => fullNameInputRef.current?.focus(), 100);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profil</span>
                </button>
              </div>

              {/* Data Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* Nama Lengkap */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                      Nama Lengkap (Full Name)
                    </span>
                    <span className="text-sm font-bold text-white break-words block mt-0.5">
                      {effectiveUser.fullName}
                    </span>
                  </div>
                </div>

                {/* Nama Tampilan */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                      Nama Tampilan / Panggilan di Navbar
                    </span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">
                      {effectiveUser.displayName || effectiveUser.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-indigo-400/80 block mt-0.5">
                      Ditampilkan di pojok kanan atas navbar
                    </span>
                  </div>
                </div>

                {/* Email & Telepon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        Alamat Email
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5">
                        {effectiveUser.email || 'Belum ditambahkan'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        Nomor Handphone
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5">
                        {effectiveUser.phone || 'Belum ditambahkan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role & ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        Hak Akses / Role
                      </span>
                      <span className="text-xs font-bold text-indigo-300 capitalize block mt-0.5">
                        {effectiveUser.role || 'Pengguna'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700/80 shrink-0">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        ID Pengguna
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-300 block mt-0.5">
                        {effectiveUser.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions in View Mode */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('changePassword')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ganti Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('editProfile');
                    setTimeout(() => fullNameInputRef.current?.focus(), 100);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profil Pengguna</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFIL (FORM EDIT PROFIL AKTIF) */}
          {activeTab === 'editProfile' && (
            <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Form Edit Profil Pengguna
                </span>
                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Mode Pengubahan Data
                </span>
              </div>

              {/* Foto Profil Quick Upload inside Edit Form */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center ring-2 ring-indigo-500/40 select-none">
                      {userInitials}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-xs font-bold text-white block">Foto Profil</span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Format: JPG, JPEG, PNG, WEBP (Maksimal 5 MB)
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => editPhotoInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      Ganti Foto
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('changePhoto')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer"
                      title="Buka alat potong & zoom foto"
                    >
                      Crop Lanjutan
                    </button>
                  </div>
                  <input
                    ref={editPhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleQuickPhotoPick}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Input Field: Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-slate-200 font-bold block text-xs flex items-center justify-between">
                  <span>Nama Lengkap <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">Wajib diisi</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    ref={fullNameInputRef}
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda..."
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (profileError) setProfileError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              {/* Input Field: Nama Tampilan */}
              <div className="space-y-1.5">
                <label className="text-slate-200 font-bold block text-xs flex items-center justify-between">
                  <span>Nama Tampilan / Panggilan di Navbar</span>
                  <span className="text-[10px] text-indigo-400 font-medium">Tampil di pojok kanan atas</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: dr. Dian / Bunda Alya / Asep..."
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (profileError) setProfileError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Nama ini yang langsung terlihat pada header kanan atas dan salam aplikasi.
                </span>
              </div>

              {/* Grid: Email & Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-200 font-bold block text-xs">Alamat Email:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (profileError) setProfileError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-200 font-bold block text-xs">Nomor Handphone / WhatsApp:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (profileError) setProfileError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold cursor-pointer transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: UBAH FOTO PROFIL (UPLOAD, CROP, PREVIEW, HAPUS, SIMPAN) */}
          {activeTab === 'changePhoto' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  Ubah Foto Profil & Crop
                </span>
                <span className="text-[10px] text-slate-400">JPG, JPEG, PNG, WEBP (Maks 5 MB)</span>
              </div>

              {photoError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="font-semibold">{photoError}</span>
                </div>
              )}

              {photoSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">{photoSuccess}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoFileChange}
                className="hidden"
              />

              {/* Crop & Viewport Frame */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                
                {/* Visual Viewport with Circular Mask & Drag Handlers */}
                <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-indigo-500 shadow-2xl bg-slate-950 flex items-center justify-center select-none group">
                  {rawImageSrc ? (
                    <div
                      className="w-full h-full relative cursor-move flex items-center justify-center"
                      onMouseDown={(e) => {
                        setIsDragging(true);
                        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
                      }}
                      onMouseMove={(e) => {
                        if (isDragging) {
                          setPanOffset({
                            x: Math.max(-60, Math.min(60, e.clientX - dragStart.x)),
                            y: Math.max(-60, Math.min(60, e.clientY - dragStart.y))
                          });
                        }
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                    >
                      <img
                        src={rawImageSrc}
                        alt="Crop target"
                        draggable={false}
                        style={{
                          transform: `scale(${photoScale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-4xl flex items-center justify-center select-none">
                      {userInitials}
                    </div>
                  )}
                </div>

                {/* Crop & Position Controls */}
                {rawImageSrc && (
                  <div className="w-full max-w-sm space-y-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    {/* Zoom Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><ZoomOut className="w-3 h-3" /> Perkecil</span>
                        <span className="font-mono text-indigo-300 font-bold">{Math.round(photoScale * 100)}%</span>
                        <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Perbesar</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={photoScale}
                        onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Pan / Nudge Controls */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Move className="w-3 h-3" /> Geser Posisi:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => nudgePan(-5, 0)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Geser Kiri"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgePan(0, -5)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Geser Atas"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgePan(0, 5)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Geser Bawah"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgePan(5, 0)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Geser Kanan"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={resetCrop}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 flex items-center gap-1"
                          title="Reset Posisi & Zoom"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload & Delete Buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Baru</span>
                  </button>

                  {effectiveUser.photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Hapus foto dan gunakan inisial nama"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
                  Format yang didukung: JPG, JPEG, PNG, WEBP (Maksimal 5 MB).
                </p>
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  disabled={isProcessingPhoto}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPhoto}
                  disabled={!rawImageSrc || isProcessingPhoto}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isProcessingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Foto Profil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: UBAH PASSWORD */}
          {activeTab === 'changePassword' && (
            <form onSubmit={handleSubmitPassword} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Ubah Kata Sandi Akun
                </span>
                <span className="text-[10px] text-slate-400">Minimal 6 karakter</span>
              </div>

              {passError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="font-semibold">{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">{passSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Kata Sandi Saat Ini (Lama):</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    placeholder="Masukkan kata sandi lama Anda..."
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 pr-9 text-xs text-white outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Kata Sandi Baru <span className="text-rose-400">*</span>:
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder="Minimal 6 karakter..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 pr-9 text-xs text-white outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-400">*</span>:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    placeholder="Ulangi kata sandi baru..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 pr-9 text-xs text-white outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  disabled={isSavingPass}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPass}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-75 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isSavingPass ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: RIWAYAT PERUBAHAN */}
          {activeTab === 'history' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  <History className="w-4 h-4 text-indigo-400" />
                  Log Riwayat Perubahan Akun
                </span>
                <span className="text-[10px] text-slate-500">{profileLogs.length} catatan</span>
              </div>

              {profileLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Belum ada catatan riwayat perubahan pada akun ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {profileLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">{log.actionType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{log.description}</p>
                      {log.target && (
                        <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded inline-block">
                          Target: {log.target}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Status Akun: <strong className="text-emerald-400">Aktif & Siap Digunakan</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
