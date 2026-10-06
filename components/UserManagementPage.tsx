import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  Key, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Download, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Sparkles, 
  X, 
  Send,
  Zap,
  Check,
  Shield,
  Layers,
  Eye,
  EyeOff,
  Clock,
  Filter,
  RefreshCw,
  Camera,
  Upload,
  Save,
  User,
  Plus
} from 'lucide-react';
import { Child, Therapist, UserRole, UserAccount, ActivityLog, View } from '../types';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredLogs, 
  appendActivityLog,
  saveOrUpdateStaff,
  deleteStaffUser,
  getInitials
} from '../utils/rbacStorage';

type MasterChild = Omit<Child, 'sessions'>;

interface UserManagementPageProps {
  children: MasterChild[];
  onUpdateChild: (childId: string, updates: Partial<Omit<MasterChild, 'id'>>) => void;
  therapists: Therapist[];
  onUpdateTherapist: (therapistId: string, updates: Partial<Omit<Therapist, 'id'>>) => void;
  userRole: UserRole;
  onNavigate?: (view: View) => void;
  logoUrl?: string;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({
  children,
  onUpdateChild,
  therapists,
  onUpdateTherapist,
  userRole,
  onNavigate
}) => {
  // Check if current user is manager
  const isManager = userRole === 'manager' || userRole === 'super_admin';

  // Navigation Tabs: 'siswa' | 'terapis' | 'staff' | 'logs'
  const [activeTab, setActiveTab] = useState<'siswa' | 'terapis' | 'staff' | 'logs'>('siswa');

  // Ensure non-manager cannot be on 'staff' tab
  React.useEffect(() => {
    if (!isManager && activeTab === 'staff') {
      setActiveTab('siswa');
    }
  }, [isManager, activeTab]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_account' | 'no_account'>('all');

  // RBAC stored users and logs
  const [storedUsers, setStoredUsers] = useState<UserAccount[]>(() => getStoredUsers());
  const [logs, setLogs] = useState<ActivityLog[]>(() => getStoredLogs());

  useEffect(() => {
    const handleProfileSync = () => {
      setStoredUsers(getStoredUsers());
      setLogs(getStoredLogs());
    };
    window.addEventListener('pelangi360_user_profile_updated', handleProfileSync);
    return () => window.removeEventListener('pelangi360_user_profile_updated', handleProfileSync);
  }, []);

  // Password visibility map (for in-table inspection)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modal: Create or Edit Account (Siswa & Terapis)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [targetEntity, setTargetEntity] = useState<{
    type: 'siswa' | 'terapis' | 'staff';
    id: string;
    name: string;
    photoUrl?: string;
    subtitle?: string;
    currentUsername?: string;
    currentPassword?: string;
    role?: string;
  } | null>(null);

  const [modalName, setModalName] = useState('');
  const [modalUsername, setModalUsername] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  // Dedicated Modal: Ubah Nama & Profil Staf serta Kata Sandi (Staff Management)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffModalActiveTab, setStaffModalActiveTab] = useState<'profile' | 'password'>('profile');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffDisplayName, setStaffDisplayName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('admin');
  const [staffStatus, setStaffStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [staffPhotoUrl, setStaffPhotoUrl] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffModalError, setStaffModalError] = useState('');
  const [staffModalSuccess, setStaffModalSuccess] = useState('');
  const staffPhotoFileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return 'Manager Klinik';
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'keuangan': return 'Staf Keuangan';
      case 'assessor': return 'Tim Assessor';
      case 'terapis': return 'Terapis';
      default: return role;
    }
  };

  // Helper to generate clean username from full name
  const generateUsernameFromFullName = (name: string): string => {
    const clean = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/);
    
    if (clean.length === 1) return clean[0];
    if (clean.length >= 2) return `${clean[0]}.${clean[1]}`;
    return `user${Math.floor(100 + Math.random() * 900)}`;
  };

  // Helper to generate strong default password
  const generateDefaultPassword = (): string => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `Pelangi${year}!${rand}`;
  };

  // Open Staff Modal: 'profile' (Ubah Nama & Profil Staf) or 'password' (Ubah Kata Sandi)
  const handleOpenStaffModal = (staff?: UserAccount, initialTab: 'profile' | 'password' = 'profile') => {
    if (staff) {
      setEditingStaffId(staff.id);
      setStaffFullName(staff.fullName || '');
      setStaffDisplayName(staff.displayName || '');
      setStaffUsername(staff.username || '');
      setStaffEmail(staff.email || '');
      setStaffPhone(staff.phone || '');
      setStaffRole(staff.role || 'admin');
      setStaffStatus(staff.status || 'Aktif');
      setStaffPhotoUrl(staff.photoUrl || '');
      setStaffPassword(staff.password || '');
    } else {
      setEditingStaffId(null);
      setStaffFullName('');
      setStaffDisplayName('');
      setStaffUsername('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffRole('admin');
      setStaffStatus('Aktif');
      setStaffPhotoUrl('');
      setStaffPassword(generateDefaultPassword());
    }
    setStaffModalActiveTab(initialTab);
    setShowStaffPassword(true);
    setStaffModalError('');
    setStaffModalSuccess('');
    setIsStaffModalOpen(true);
  };

  // Photo upload handler for staff
  const handleStaffPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffModalError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setStaffModalError('Ukuran file foto maksimal 5 MB.');
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setStaffModalError('Format file harus JPG, JPEG, PNG, atau WEBP.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setStaffPhotoUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Staff Modal (Profile & Password)
  const handleSaveStaffModal = () => {
    setStaffModalError('');
    setStaffModalSuccess('');

    if (!staffFullName.trim()) {
      setStaffModalError('Nama lengkap staf tidak boleh kosong.');
      return;
    }

    const trimmedUser = staffUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!trimmedUser) {
      setStaffModalError('Nama pengguna (username) staf tidak boleh kosong.');
      return;
    }

    if (trimmedUser.length < 3) {
      setStaffModalError('Nama pengguna minimal 3 karakter.');
      return;
    }

    if (staffPassword.trim() && staffPassword.trim().length < 5) {
      setStaffModalError('Kata sandi minimal 5 karakter.');
      return;
    }

    const res = saveOrUpdateStaff({
      id: editingStaffId || undefined,
      fullName: staffFullName.trim(),
      displayName: staffDisplayName.trim() || undefined,
      username: trimmedUser,
      email: staffEmail.trim() || `${trimmedUser}@pelangi.sch.id`,
      phone: staffPhone.trim(),
      role: staffRole,
      status: staffStatus,
      photoUrl: staffPhotoUrl,
      password: staffPassword.trim() || undefined
    }, userRole);

    if (!res.success) {
      setStaffModalError(res.message || 'Gagal menyimpan data staf.');
      return;
    }

    setStoredUsers(getStoredUsers());
    setLogs(getStoredLogs());
    setStaffModalSuccess(res.message || 'Data staf berhasil disimpan!');
    showToast(res.message || 'Data staf berhasil disimpan!', 'success');

    setTimeout(() => {
      setIsStaffModalOpen(false);
    }, 700);
  };

  // Delete staff handler
  const handleDeleteStaffUser = (staff: UserAccount) => {
    if (staff.id === 'USR-ROOT-01' || staff.role === 'super_admin') {
      showToast('Akun Super Admin sistem tidak dapat dihapus.', 'error');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus akun staf "${staff.fullName}" (${staff.username})?`)) {
      return;
    }
    const res = deleteStaffUser(staff.id, userRole);
    if (res.success) {
      setStoredUsers(getStoredUsers());
      setLogs(getStoredLogs());
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // KPI Statistics
  const studentStats = useMemo(() => {
    const total = children.length;
    const hasAccount = children.filter(c => !!c.username).length;
    const noAccount = total - hasAccount;
    return { total, hasAccount, noAccount };
  }, [children]);

  const therapistStats = useMemo(() => {
    const total = therapists.length;
    const hasAccount = therapists.filter(t => !!t.username).length;
    const noAccount = total - hasAccount;
    return { total, hasAccount, noAccount };
  }, [therapists]);

  const staffStats = useMemo(() => {
    const staffList = storedUsers.filter(u => ['manager', 'super_admin', 'admin', 'keuangan', 'assessor'].includes(u.role));
    return { total: staffList.length };
  }, [storedUsers]);

  // Open Modal to Create/Edit Account
  const handleOpenAccountModal = (
    type: 'siswa' | 'terapis' | 'staff',
    id: string,
    name: string,
    photoUrl?: string,
    subtitle?: string,
    currentUsername?: string,
    currentPassword?: string,
    role?: string
  ) => {
    setTargetEntity({
      type,
      id,
      name,
      photoUrl,
      subtitle,
      currentUsername,
      currentPassword,
      role
    });

    const initialUser = currentUsername || generateUsernameFromFullName(name);
    const initialPass = currentPassword || generateDefaultPassword();

    setModalName(name);
    setModalUsername(initialUser);
    setModalPassword(initialPass);
    setShowModalPassword(true);
    setModalError('');
    setIsAccountModalOpen(true);
  };

  // Save Account Modal Handler
  const handleSaveAccount = () => {
    if (!targetEntity) return;

    const trimmedUser = modalUsername.trim().toLowerCase().replace(/\s+/g, '');
    const trimmedPass = modalPassword.trim();

    if (!trimmedUser) {
      setModalError('Nama pengguna (username) tidak boleh kosong.');
      return;
    }

    if (!trimmedPass) {
      setModalError('Kata sandi (password) tidak boleh kosong.');
      return;
    }

    if (trimmedPass.length < 5) {
      setModalError('Kata sandi minimal 5 karakter.');
      return;
    }

    // Check duplicate username across all systems
    const duplicateInStudents = children.find(c => c.id !== targetEntity.id && c.username?.toLowerCase() === trimmedUser);
    const duplicateInTherapists = therapists.find(t => t.id !== targetEntity.id && t.username?.toLowerCase() === trimmedUser);
    const duplicateInStaff = storedUsers.find(u => u.id !== targetEntity.id && u.username.toLowerCase() === trimmedUser && u.linkedEntityId !== targetEntity.id);

    if (duplicateInStudents || duplicateInTherapists || duplicateInStaff) {
      setModalError(`Username "${trimmedUser}" sudah digunakan. Silakan gunakan nama pengguna lain.`);
      return;
    }

    const cleanName = modalName.trim() || targetEntity.name;

    // 1. Update in respective master model
    if (targetEntity.type === 'siswa') {
      onUpdateChild(targetEntity.id, {
        name: cleanName,
        username: trimmedUser,
        password: trimmedPass
      });

      // Update or insert into RBAC storedUsers for seamless authentication
      const existingUser = storedUsers.find(u => u.linkedEntityId === targetEntity.id || u.username === trimmedUser);
      let updatedUsers: UserAccount[];

      if (existingUser) {
        updatedUsers = storedUsers.map(u => u.id === existingUser.id ? {
          ...u,
          username: trimmedUser,
          password: trimmedPass,
          fullName: cleanName,
          role: 'siswa',
          status: 'Aktif'
        } : u);
      } else {
        const newUser: UserAccount = {
          id: `USR-SIS-${Date.now()}`,
          fullName: cleanName,
          username: trimmedUser,
          email: `${trimmedUser}@siswa.lazuardi.sch.id`,
          phone: '',
          role: 'siswa',
          status: 'Aktif',
          photoUrl: targetEntity.photoUrl,
          password: trimmedPass,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: 'Belum pernah login',
          linkedEntityId: targetEntity.id
        };
        updatedUsers = [newUser, ...storedUsers];
      }

      setStoredUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      appendActivityLog({
        userId: 'USR-ADMIN-01',
        userName: 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'UPDATE',
        description: `Memperbarui akun siswa: ${cleanName} (Username: ${trimmedUser})`,
        target: targetEntity.id
      });

    } else if (targetEntity.type === 'terapis') {
      onUpdateTherapist(targetEntity.id, {
        name: cleanName,
        username: trimmedUser,
        password: trimmedPass
      });

      // Update or insert into RBAC storedUsers
      const existingUser = storedUsers.find(u => u.linkedEntityId === targetEntity.id || u.username === trimmedUser);
      let updatedUsers: UserAccount[];

      if (existingUser) {
        updatedUsers = storedUsers.map(u => u.id === existingUser.id ? {
          ...u,
          username: trimmedUser,
          password: trimmedPass,
          fullName: cleanName,
          role: 'terapis',
          status: 'Aktif'
        } : u);
      } else {
        const newUser: UserAccount = {
          id: `USR-TRP-${Date.now()}`,
          fullName: cleanName,
          username: trimmedUser,
          email: `${trimmedUser}@pelangi.sch.id`,
          phone: '',
          role: 'terapis',
          status: 'Aktif',
          photoUrl: targetEntity.photoUrl,
          password: trimmedPass,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: 'Belum pernah login',
          linkedEntityId: targetEntity.id
        };
        updatedUsers = [newUser, ...storedUsers];
      }

      setStoredUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      appendActivityLog({
        userId: 'USR-ADMIN-01',
        userName: 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'UPDATE',
        description: `Memperbarui akun terapis: ${cleanName} (Username: ${trimmedUser})`,
        target: targetEntity.id
      });

    } else if (targetEntity.type === 'staff') {
      const updatedUsers = storedUsers.map(u => u.id === targetEntity.id ? {
        ...u,
        username: trimmedUser,
        password: trimmedPass
      } : u);
      setStoredUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      appendActivityLog({
        userId: 'USR-ADMIN-01',
        userName: 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'PASSWORD_RESET',
        description: `Reset password staf manajemen: ${targetEntity.name} (${trimmedUser})`,
        target: targetEntity.id
      });
    }

    setLogs(getStoredLogs());
    setIsAccountModalOpen(false);
    showToast(`Akun dan kata sandi untuk ${targetEntity.name} berhasil disimpan!`);
  };

  // Delete / Clear Account Credentials
  const handleClearAccount = (type: 'siswa' | 'terapis', id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kredensial login untuk ${name}?`)) return;

    if (type === 'siswa') {
      onUpdateChild(id, { username: '', password: '' });
      const updatedUsers = storedUsers.filter(u => u.linkedEntityId !== id);
      setStoredUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
    } else {
      onUpdateTherapist(id, { username: '', password: '' });
      const updatedUsers = storedUsers.filter(u => u.linkedEntityId !== id);
      setStoredUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
    }

    appendActivityLog({
      userId: 'USR-ADMIN-01',
      userName: 'Administrator',
      userRole: userRole || 'admin',
      actionType: 'DELETE',
      description: `Menghapus akun login ${type}: ${name}`,
      target: id
    });
    setLogs(getStoredLogs());
    showToast(`Kredensial untuk ${name} telah dihapus.`);
  };

  // Bulk Create Accounts for all without credentials
  const handleBulkGenerateAccounts = (type: 'siswa' | 'terapis') => {
    let count = 0;
    const updatedStored = [...storedUsers];

    if (type === 'siswa') {
      const unassigned = children.filter(c => !c.username);
      if (unassigned.length === 0) {
        showToast('Semua siswa sudah memiliki akun login.', 'info');
        return;
      }

      if (!confirm(`Buat akun dan password otomatis untuk ${unassigned.length} siswa yang belum memiliki akun?`)) return;

      unassigned.forEach((child, index) => {
        const username = generateUsernameFromFullName(child.name);
        const password = `Pelangi${new Date().getFullYear()}!${100 + index}`;
        
        onUpdateChild(child.id, { username, password });

        const newUser: UserAccount = {
          id: `USR-SIS-${Date.now()}-${index}`,
          fullName: child.name,
          username,
          email: `${username}@siswa.lazuardi.sch.id`,
          phone: '',
          role: 'siswa',
          status: 'Aktif',
          photoUrl: child.photoUrl,
          password,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: 'Belum pernah login',
          linkedEntityId: child.id
        };
        updatedStored.push(newUser);
        count++;
      });

      setStoredUsers(updatedStored);
      saveStoredUsers(updatedStored);

      appendActivityLog({
        userId: 'USR-ADMIN-01',
        userName: 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'CREATE',
        description: `Pembuatan akun massal: ${count} akun siswa berhasil dibuat otomatis`
      });

    } else {
      const unassigned = therapists.filter(t => !t.username);
      if (unassigned.length === 0) {
        showToast('Semua terapis sudah memiliki akun login.', 'info');
        return;
      }

      if (!confirm(`Buat akun dan password otomatis untuk ${unassigned.length} terapis yang belum memiliki akun?`)) return;

      unassigned.forEach((therapist, index) => {
        const username = generateUsernameFromFullName(therapist.name);
        const password = `Terapis${new Date().getFullYear()}!${100 + index}`;

        onUpdateTherapist(therapist.id, { username, password });

        const newUser: UserAccount = {
          id: `USR-TRP-${Date.now()}-${index}`,
          fullName: therapist.name,
          username,
          email: therapist.email || `${username}@pelangi.sch.id`,
          phone: therapist.phone || '',
          role: 'terapis',
          status: 'Aktif',
          photoUrl: therapist.photoUrl,
          password,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: 'Belum pernah login',
          linkedEntityId: therapist.id
        };
        updatedStored.push(newUser);
        count++;
      });

      setStoredUsers(updatedStored);
      saveStoredUsers(updatedStored);

      appendActivityLog({
        userId: 'USR-ADMIN-01',
        userName: 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'CREATE',
        description: `Pembuatan akun massal: ${count} akun terapis berhasil dibuat otomatis`
      });
    }

    setLogs(getStoredLogs());
    showToast(`Berhasil membuat ${count} akun ${type === 'siswa' ? 'siswa' : 'terapis'} baru!`);
  };

  // Copy WhatsApp Format Credentials
  const handleCopyCredentials = (name: string, username: string, password?: string, roleLabel: string = 'Siswa') => {
    const text = `*Kredensial Akses Akun Terapi Pelangi Lazuardi*
---------------------------------------
Nama: *${name}*
Peran: *${roleLabel}*
Username: *${username}*
Password: *${password || 'pelangilazuardi'}*
Tautan Masuk: https://lazuardi.sch.id/pelangi/login
---------------------------------------
_Simpan informasi ini dengan aman. Anda dapat menggunakan username dan password di atas untuk login ke portal._`;

    navigator.clipboard.writeText(text);
    showToast('Kredensial disalin! Siap dikirim melalui WhatsApp.');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return children.filter(child => {
      if (statusFilter === 'has_account' && !child.username) return false;
      if (statusFilter === 'no_account' && !!child.username) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = child.name.toLowerCase().includes(q);
        const matchClass = (child.className || '').toLowerCase().includes(q);
        const matchParent = (child.parentName || child.motherName || '').toLowerCase().includes(q);
        const matchUser = (child.username || '').toLowerCase().includes(q);
        const matchId = child.id.toLowerCase().includes(q);
        return matchName || matchClass || matchParent || matchUser || matchId;
      }
      return true;
    });
  }, [children, statusFilter, searchQuery]);

  // Filtered Therapists
  const filteredTherapists = useMemo(() => {
    return therapists.filter(therapist => {
      if (statusFilter === 'has_account' && !therapist.username) return false;
      if (statusFilter === 'no_account' && !!therapist.username) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = therapist.name.toLowerCase().includes(q);
        const matchSpecialty = (therapist.specialties || []).join(' ').toLowerCase().includes(q);
        const matchUser = (therapist.username || '').toLowerCase().includes(q);
        const matchRoom = (therapist.defaultRoom || '').toLowerCase().includes(q);
        const matchId = therapist.id.toLowerCase().includes(q);
        return matchName || matchSpecialty || matchUser || matchRoom || matchId;
      }
      return true;
    });
  }, [therapists, statusFilter, searchQuery]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    const list = storedUsers.filter(u => ['manager', 'super_admin', 'admin', 'keuangan', 'assessor'].includes(u.role));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(u => 
      u.fullName.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    );
  }, [storedUsers, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (activeTab === 'siswa') {
      const headers = ['ID Siswa', 'Nama Siswa', 'Kelas', 'Wali Murid', 'Username', 'Password', 'Status Akun'];
      const rows = filteredStudents.map(c => [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.className || '-'}"`,
        `"${c.parentName || c.motherName || '-'}"`,
        `"${c.username || 'Belum Ada'}"`,
        `"${c.password || '-'}"`,
        `"${c.username ? 'Aktif' : 'Belum Ada Akun'}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `kredensial_siswa_pelangi_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast('Data akun siswa berhasil diekspor.');
    } else if (activeTab === 'terapis') {
      const headers = ['ID Terapis', 'Nama Terapis', 'Spesialisasi', 'Ruangan', 'Username', 'Password', 'Status Akun'];
      const rows = filteredTherapists.map(t => [
        `"${t.id}"`,
        `"${t.name}"`,
        `"${(t.specialties || []).join(', ')}"`,
        `"${t.defaultRoom || '-'}"`,
        `"${t.username || 'Belum Ada'}"`,
        `"${t.password || '-'}"`,
        `"${t.username ? 'Aktif' : 'Belum Ada Akun'}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `kredensial_terapis_pelangi_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast('Data akun terapis berhasil diekspor.');
    } else if (activeTab === 'staff') {
      const headers = ['ID Staf', 'Nama Lengkap', 'Nama Panggilan', 'Peran (Role)', 'Email', 'No Telepon', 'Username', 'Password', 'Status'];
      const rows = filteredStaff.map(s => [
        `"${s.id}"`,
        `"${s.fullName}"`,
        `"${s.displayName || '-'}"`,
        `"${getRoleLabel(s.role)}"`,
        `"${s.email}"`,
        `"${s.phone || '-'}"`,
        `"${s.username}"`,
        `"${s.password || '-'}"`,
        `"${s.status || 'Aktif'}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `kredensial_staf_pelangi_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast('Data akun staf manajemen berhasil diekspor.');
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all transform animate-fade-in-up ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' 
            : toastMessage.type === 'error'
            ? 'bg-slate-900 border-red-500/40 text-red-300'
            : 'bg-slate-900 border-indigo-500/40 text-indigo-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-light pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1 font-medium">
            <span>Sistem & Keamanan</span>
            <span>/</span>
            <span className="text-primary font-semibold">Manajemen Pengguna</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manajemen Akun Siswa & Terapis
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sinkronisasi Master
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Data pengguna terhubung langsung dengan Data Siswa dan Data Terapis. Cukup tentukan nama pengguna dan kata sandi.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-text-muted hover:text-white bg-surface border border-surface-light hover:border-slate-600 rounded-xl transition shadow-sm cursor-pointer"
            title="Ekspor daftar kredensial ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor Kredensial (.CSV)</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('rolePermission')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-xl transition shadow-sm cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matriks Hak Akses</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards: Berdasarkan Data Siswa & Terapis */}
      <div className={`grid grid-cols-1 ${isManager ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
        {/* Card 1: Siswa */}
        <div 
          onClick={() => setActiveTab('siswa')}
          className={`bg-surface border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
            activeTab === 'siswa' ? 'border-primary ring-1 ring-primary/30' : 'border-surface-light hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Akun Siswa (Data Siswa)</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{studentStats.total}</span>
            <span className="text-xs text-muted">Total Siswa</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-medium tabular-nums">{studentStats.hasAccount} memiliki akun</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium tabular-nums">{studentStats.noAccount} belum diatur</span>
          </div>
        </div>

        {/* Card 2: Terapis */}
        <div 
          onClick={() => setActiveTab('terapis')}
          className={`bg-surface border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
            activeTab === 'terapis' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-surface-light hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Akun Terapis (Data Terapis)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">{therapistStats.total}</span>
            <span className="text-xs text-muted">Tenaga Medis</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-medium tabular-nums">{therapistStats.hasAccount} memiliki akun</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium tabular-nums">{therapistStats.noAccount} belum diatur</span>
          </div>
        </div>

        {/* Card 3: Staf & Manajemen (Hanya Khusus Manager) */}
        {isManager && (
          <div 
            onClick={() => setActiveTab('staff')}
            className={`bg-surface border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
              activeTab === 'staff' ? 'border-purple-500 ring-1 ring-purple-500/30' : 'border-surface-light hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Staf & Manajemen</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-400 tabular-nums">{staffStats.total}</span>
              <span className="text-xs text-muted">Akun Operasional</span>
            </div>
            <div className="mt-2 text-xs text-muted flex items-center justify-between">
              <span>Manager, Admin, Keuangan, Assessor</span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Khusus Manager</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-surface border border-surface-light rounded-2xl shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-light px-4 sm:px-6 pt-3 gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => { setActiveTab('siswa'); setStatusFilter('all'); }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'siswa'
                  ? 'border-primary text-white bg-primary/10'
                  : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Akun Data Siswa</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
                {children.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('terapis'); setStatusFilter('all'); }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'terapis'
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                  : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Akun Data Terapis</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
                {therapists.length}
              </span>
            </button>

            {/* Tab Staf & Manajemen: Khusus Manager */}
            {isManager && (
              <button
                onClick={() => { setActiveTab('staff'); setStatusFilter('all'); }}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'staff'
                    ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Staf & Manajemen</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
                  {staffStats.total}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-muted hover:text-white hover:bg-surface-light/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Riwayat Akun</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-surface-light text-text-muted tabular-nums">
                {logs.length}
              </span>
            </button>
          </div>

          {/* Quick Bulk Action Button */}
          {activeTab === 'siswa' && studentStats.noAccount > 0 && (
            <button
              onClick={() => handleBulkGenerateAccounts('siswa')}
              className="mb-2 sm:mb-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light rounded-xl transition shadow-md cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buat Akun Otomatis ({studentStats.noAccount} Siswa)</span>
            </button>
          )}

          {activeTab === 'terapis' && therapistStats.noAccount > 0 && (
            <button
              onClick={() => handleBulkGenerateAccounts('terapis')}
              className="mb-2 sm:mb-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-md cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buat Akun Otomatis ({therapistStats.noAccount} Terapis)</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        {activeTab !== 'logs' && (
          <div className="p-4 sm:p-5 bg-surface-light/20 border-b border-surface-light flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'siswa'
                    ? 'Cari nama anak, kelas, orang tua, username...'
                    : activeTab === 'terapis'
                    ? 'Cari nama terapis, spesialisasi, username...'
                    : 'Cari nama staf, peran, username...'
                }
                className="w-full pl-10 pr-4 py-2 bg-background border border-surface-light rounded-xl text-xs sm:text-sm text-white placeholder-muted focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter for Siswa / Terapis */}
            {(activeTab === 'siswa' || activeTab === 'terapis') && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Status:</span>
                <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-surface-light text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'all' ? 'bg-primary text-slate-900 font-bold' : 'text-muted hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStatusFilter('has_account')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'has_account' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-muted hover:text-white'
                    }`}
                  >
                    Sudah Punya Akun
                  </button>
                  <button
                    onClick={() => setStatusFilter('no_account')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'no_account' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-muted hover:text-white'
                    }`}
                  >
                    Belum Dibuat
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons for Staff */}
            {activeTab === 'staff' && isManager && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleOpenStaffModal(undefined, 'profile')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Staf Baru</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-surface-light hover:bg-slate-700 rounded-xl transition cursor-pointer"
                  title="Ekspor CSV Data Staf"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor CSV</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------------- VIEW 1: DATA SISWA TAB ---------------- */}
        {activeTab === 'siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-surface-light">
              <thead className="bg-background/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Data Siswa (Master)</th>
                  <th scope="col" className="px-6 py-3.5">Orang Tua / Kontak</th>
                  <th scope="col" className="px-6 py-3.5">Nama Pengguna (Username)</th>
                  <th scope="col" className="px-6 py-3.5">Kata Sandi (Password)</th>
                  <th scope="col" className="px-6 py-3.5">Status Akun</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Aksi Pembuatan Akun</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-light/60">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((child) => {
                    const hasAccount = !!child.username;
                    const isPasswordVisible = visiblePasswords[child.id] || false;

                    return (
                      <tr key={child.id} className="hover:bg-surface-light/30 transition-colors group">
                        {/* Student Profile */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={child.photoUrl || `https://i.pravatar.cc/100?u=${child.name.replace(/\s/g, '')}`}
                              alt={child.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-surface-light bg-background"
                            />
                            <div>
                              <div className="font-semibold text-white group-hover:text-primary transition">
                                {child.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                                <span className="font-mono">{child.id}</span>
                                {child.className && (
                                  <>
                                    <span>·</span>
                                    <span>Kelas: {child.className}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Parent & Contact */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                          <div>
                            <span className="text-white font-medium">{child.parentName || child.motherName || 'Wali Murid'}</span>
                          </div>
                          <div className="text-muted text-[11px] truncate max-w-[200px] mt-0.5">
                            {child.address || 'Alamat tidak terdata'}
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAccount ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-light text-primary border border-primary/20">
                                {child.username}
                              </span>
                              <button
                                onClick={() => handleCopyCredentials(child.name, child.username!, child.password, 'Siswa')}
                                title="Salin kredensial untuk WhatsApp"
                                className="text-muted hover:text-emerald-400 transition cursor-pointer p-1 rounded-md hover:bg-surface-light"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400/90 font-medium italic">
                              Belum Dibuat
                            </span>
                          )}
                        </td>

                        {/* Password */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {hasAccount ? (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="px-2 py-0.5 rounded bg-surface-light/60 text-slate-200">
                                {isPasswordVisible ? (child.password || 'pelangilazuardi') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(child.id)}
                                className="text-muted hover:text-white transition cursor-pointer"
                                title={isPasswordVisible ? 'Sembunyikan' : 'Tampilkan sandi'}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted/50">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Perlu Dibuat
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {hasAccount ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenAccountModal(
                                  'siswa',
                                  child.id,
                                  child.name,
                                  child.photoUrl,
                                  `Kelas ${child.className || '-'}`,
                                  child.username,
                                  child.password
                                )}
                                className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Akun</span>
                              </button>

                              <button
                                onClick={() => handleCopyCredentials(child.name, child.username!, child.password, 'Siswa')}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                                title="Kirim / Salin Format WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleClearAccount('siswa', child.id, child.name)}
                                className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                title="Hapus Akun Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAccountModal(
                                'siswa',
                                child.id,
                                child.name,
                                child.photoUrl,
                                `Kelas ${child.className || '-'}`
                              )}
                              className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light rounded-xl transition shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Buat Akun & Sandi</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      Tidak ada data siswa yang cocok dengan filter atau kata kunci.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- VIEW 2: DATA TERAPIS TAB ---------------- */}
        {activeTab === 'terapis' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-surface-light">
              <thead className="bg-background/60 text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Data Terapis (Master)</th>
                  <th scope="col" className="px-6 py-3.5">Spesialisasi & Ruangan</th>
                  <th scope="col" className="px-6 py-3.5">Nama Pengguna (Username)</th>
                  <th scope="col" className="px-6 py-3.5">Kata Sandi (Password)</th>
                  <th scope="col" className="px-6 py-3.5">Status Akun</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Aksi Pembuatan Akun</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-light/60">
                {filteredTherapists.length > 0 ? (
                  filteredTherapists.map((therapist) => {
                    const hasAccount = !!therapist.username;
                    const isPasswordVisible = visiblePasswords[therapist.id] || false;

                    return (
                      <tr key={therapist.id} className="hover:bg-surface-light/30 transition-colors group">
                        {/* Therapist Profile */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={therapist.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(therapist.name)}`}
                              alt={therapist.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-surface-light bg-background"
                            />
                            <div>
                              <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                                {therapist.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                                <span className="font-mono">{therapist.id}</span>
                                {therapist.phone && (
                                  <>
                                    <span>·</span>
                                    <span className="font-mono">{therapist.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Specialties & Room */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {(therapist.specialties || []).map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="text-muted text-[11px] mt-1">
                            {therapist.defaultRoom || 'Ruang Fleksibel'}
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAccount ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-light text-emerald-400 border border-emerald-500/20">
                                {therapist.username}
                              </span>
                              <button
                                onClick={() => handleCopyCredentials(therapist.name, therapist.username!, therapist.password, 'Terapis')}
                                title="Salin kredensial untuk WhatsApp"
                                className="text-muted hover:text-emerald-400 transition cursor-pointer p-1 rounded-md hover:bg-surface-light"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400/90 font-medium italic">
                              Belum Dibuat
                            </span>
                          )}
                        </td>

                        {/* Password */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {hasAccount ? (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="px-2 py-0.5 rounded bg-surface-light/60 text-slate-200">
                                {isPasswordVisible ? (therapist.password || 'password') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(therapist.id)}
                                className="text-muted hover:text-white transition cursor-pointer"
                                title={isPasswordVisible ? 'Sembunyikan' : 'Tampilkan sandi'}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted/50">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Perlu Dibuat
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {hasAccount ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenAccountModal(
                                  'terapis',
                                  therapist.id,
                                  therapist.name,
                                  therapist.photoUrl,
                                  therapist.title || 'Tenaga Terapis',
                                  therapist.username,
                                  therapist.password
                                )}
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Akun</span>
                              </button>

                              <button
                                onClick={() => handleCopyCredentials(therapist.name, therapist.username!, therapist.password, 'Terapis')}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                                title="Kirim / Salin Format WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleClearAccount('terapis', therapist.id, therapist.name)}
                                className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                title="Hapus Akun Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAccountModal(
                                'terapis',
                                therapist.id,
                                therapist.name,
                                therapist.photoUrl,
                                therapist.title || 'Tenaga Terapis'
                              )}
                              className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Buat Akun & Sandi</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      Tidak ada data terapis yang cocok dengan filter atau kata kunci.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- VIEW 3: STAF & MANAJEMEN TAB (HANYA MANAGER) ---------------- */}
        {activeTab === 'staff' && (
          isManager ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-surface-light">
                <thead className="bg-background/60 text-xs font-semibold text-muted uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Nama & Profil Staf</th>
                    <th scope="col" className="px-6 py-3.5">Peran (Role)</th>
                    <th scope="col" className="px-6 py-3.5">Nama Pengguna (Username)</th>
                    <th scope="col" className="px-6 py-3.5">Kata Sandi (Password)</th>
                    <th scope="col" className="px-6 py-3.5">Status Akun</th>
                    <th scope="col" className="px-6 py-3.5">Terakhir Masuk</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Aksi Pengelolaan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-surface-light/60">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => {
                      const isPasswordVisible = visiblePasswords[staff.id] || false;

                      return (
                        <tr key={staff.id} className="hover:bg-surface-light/30 transition-colors group">
                          {/* Nama & Profil Staf */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {staff.photoUrl ? (
                                <img
                                  src={staff.photoUrl}
                                  alt={staff.fullName}
                                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500/20 bg-background shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 text-white font-black text-sm flex items-center justify-center ring-2 ring-purple-500/20 shrink-0 select-none shadow-sm">
                                  {getInitials(staff.fullName)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenStaffModal(staff, 'profile')}
                                    className="font-bold text-white group-hover:text-purple-400 transition text-left cursor-pointer hover:underline truncate"
                                    title="Klik untuk ubah nama & profil staf"
                                  >
                                    {staff.fullName}
                                  </button>
                                  {staff.displayName && staff.displayName !== staff.fullName && (
                                    <span className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-medium">
                                      {staff.displayName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span className="font-mono text-[11px] truncate">{staff.email}</span>
                                </div>
                                {staff.phone && (
                                  <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span className="text-[11px]">{staff.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Peran / Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              <Shield className="w-3.5 h-3.5 text-purple-400" />
                              <span>{getRoleLabel(staff.role)}</span>
                            </span>
                          </td>

                          {/* Username */}
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-200">
                            <span className="px-2 py-1 rounded-lg bg-surface-light/40 border border-surface-light">
                              {staff.username}
                            </span>
                          </td>

                          {/* Password */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-surface-light/60 text-slate-200 tracking-wider">
                                {isPasswordVisible ? (staff.password || 'password123') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(staff.id)}
                                className="text-muted hover:text-white transition cursor-pointer p-1 rounded hover:bg-surface-light"
                                title={isPasswordVisible ? "Sembunyikan Kata Sandi" : "Lihat Kata Sandi"}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {staff.status === 'Nonaktif' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Nonaktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Aktif
                              </span>
                            )}
                          </td>

                          {/* Terakhir Masuk */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-muted font-mono">
                            {staff.lastLogin || '-'}
                          </td>

                          {/* Aksi Pengelolaan */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Tombol Ubah Nama & Profil Staf */}
                              <button
                                onClick={() => handleOpenStaffModal(staff, 'profile')}
                                className="px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                title="Ubah Nama & Profil Staf Lengkap"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                                <span>Ubah Nama & Profil</span>
                              </button>

                              {/* Tombol Ubah Sandi */}
                              <button
                                onClick={() => handleOpenStaffModal(staff, 'password')}
                                className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                title="Ubah Kata Sandi Staf"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-400" />
                                <span>Ubah Sandi</span>
                              </button>

                              {/* Tombol Salin Kredensial untuk WhatsApp */}
                              <button
                                onClick={() => handleCopyCredentials(staff.fullName, staff.username, staff.password || 'password123', `Staf (${getRoleLabel(staff.role)})`)}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 rounded-xl transition cursor-pointer"
                                title="Kirim / Salin Format WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              {/* Tombol Hapus Staf (kecuali root super admin) */}
                              {staff.id !== 'USR-ROOT-01' && staff.role !== 'super_admin' && (
                                <button
                                  onClick={() => handleDeleteStaffUser(staff)}
                                  className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition cursor-pointer"
                                  title="Hapus Akun Staf Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted">
                        Tidak ada akun staf atau manajemen yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Akses Dibatasi Khusus Manager</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Daftar akun dan pengelolaan kata sandi Staf & Manajemen hanya dapat diakses oleh akun dengan peran Manager.
              </p>
            </div>
          )
        )}

        {/* ---------------- VIEW 4: AUDIT LOG TAB ---------------- */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-light pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Log Aktivitas Pembuatan & Perubahan Akun</h3>
                <p className="text-xs text-muted mt-0.5">
                  Setiap penambahan username, perubahan sandi siswa dan terapis tercatat secara otomatis.
                </p>
              </div>
              <button
                onClick={() => setLogs(getStoredLogs())}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-white px-3 py-1.5 rounded-lg bg-surface-light hover:bg-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Log</span>
              </button>
            </div>

            <div className="divide-y divide-surface-light">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold border uppercase bg-primary/10 text-primary border-primary/20">
                      {log.actionType}
                    </span>
                    <div>
                      <div className="text-white font-medium">{log.description}</div>
                      <div className="text-muted text-[11px] mt-0.5">
                        Oleh: {log.userName} ({log.userRole})
                      </div>
                    </div>
                  </div>
                  <div className="text-muted font-mono text-[11px] tabular-nums shrink-0">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODAL: BUAT / EDIT AKUN & PASSWORD ---------------- */}
      {isAccountModalOpen && targetEntity && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-surface border border-surface-light rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-light flex justify-between items-center bg-surface-light/20">
              <div className="flex items-center gap-3">
                <img
                  src={targetEntity.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetEntity.name)}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/30 bg-background"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{targetEntity.name}</h3>
                  <p className="text-xs text-muted">{targetEntity.subtitle || targetEntity.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-muted hover:text-white transition p-1.5 rounded-lg hover:bg-surface-light cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Tentukan <strong>nama pengguna</strong> dan <strong>kata sandi</strong> agar {targetEntity.name} dapat login ke sistem.
                </span>
              </div>

              {/* Nama Lengkap Input */}
              <div>
                <label className="text-xs font-semibold text-slate-200 mb-1.5 block">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Username Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Nama Pengguna (Username) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalUsername(generateUsernameFromFullName(modalName || targetEntity.name))}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Sesuai Nama
                  </button>
                </div>
                <input
                  type="text"
                  value={modalUsername}
                  onChange={(e) => setModalUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="contoh: adriel.putra"
                  className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white font-mono text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <span className="text-[11px] text-muted">Huruf kecil, tanpa spasi, minimal 3 karakter.</span>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Kata Sandi (Password) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalPassword(generateDefaultPassword())}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Buat Sandi Acak
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-background border border-surface-light rounded-xl text-white font-mono text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick WhatsApp Copy Preview */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(modalName || targetEntity.name, modalUsername, modalPassword, targetEntity.type === 'siswa' ? 'Siswa' : 'Terapis')}
                  className="w-full py-2 px-3 rounded-xl bg-surface-light/50 hover:bg-surface-light border border-surface-light text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salin Pesan Kredensial untuk WhatsApp</span>
                </button>
              </div>

              {modalError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{modalError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-surface-light/20 border-t border-surface-light flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-white bg-surface-light/50 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAccount}
                className="px-5 py-2 text-xs font-bold text-slate-900 bg-primary hover:bg-primary-light rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer"
              >
                Simpan Akun & Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL DEDIKASI: UBAH NAMA & PROFIL STAF SERTA KATA SANDI ---------------- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-surface border border-surface-light rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-surface-light flex justify-between items-center bg-gradient-to-r from-purple-950/60 via-surface to-surface-light/30">
              <div className="flex items-center gap-3.5 min-w-0">
                {staffPhotoUrl ? (
                  <img
                    src={staffPhotoUrl}
                    alt={staffFullName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/40 bg-background shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 text-white font-black text-base flex items-center justify-center ring-2 ring-purple-500/40 shrink-0 select-none shadow-md">
                    {getInitials(staffFullName || 'Staf')}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
                    {editingStaffId ? 'Ubah Nama & Profil Staf' : 'Tambah Akun Staf Baru'}
                  </h3>
                  <p className="text-xs text-muted truncate">
                    {editingStaffId ? (staffFullName || 'Kelola identitas dan kredensial staf') : 'Buat akun staf operasional baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-muted hover:text-white transition p-1.5 rounded-xl hover:bg-surface-light cursor-pointer shrink-0"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher: Profil Staf vs Ubah Kata Sandi */}
            <div className="flex items-center border-b border-surface-light bg-surface-light/20 p-2 gap-2 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setStaffModalActiveTab('profile')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  staffModalActiveTab === 'profile'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-muted hover:text-white hover:bg-surface-light/40'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>✏️ Nama & Profil Staf</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffModalActiveTab('password')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  staffModalActiveTab === 'password'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-muted hover:text-white hover:bg-surface-light/40'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>🔒 Ubah Kata Sandi</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm custom-scrollbar flex-1">
              
              {staffModalError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{staffModalError}</span>
                </div>
              )}

              {staffModalSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">{staffModalSuccess}</span>
                </div>
              )}

              {/* TAB 1: PROFIL STAF (NAMA, FOTO, ROLE, EMAIL, HP, USERNAME) */}
              {staffModalActiveTab === 'profile' && (
                <div className="space-y-4">
                  {/* Foto Profil Staf Upload Section */}
                  <div className="p-4 rounded-2xl bg-surface-light/30 border border-surface-light flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      {staffPhotoUrl ? (
                        <img
                          src={staffPhotoUrl}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 text-white font-black text-xl flex items-center justify-center ring-2 ring-purple-500/40 shadow-md select-none">
                          {getInitials(staffFullName || 'Staf')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className="text-xs font-bold text-white">Foto Profil Staf</div>
                      <p className="text-[11px] text-muted">
                        Format JPG, PNG, atau WEBP. Maksimum ukuran 5 MB.
                      </p>
                      <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                        <input
                          ref={staffPhotoFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleStaffPhotoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => staffPhotoFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto Baru</span>
                        </button>
                        {staffPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setStaffPhotoUrl('')}
                            className="px-3 py-1.5 rounded-xl bg-surface-light hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Foto</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Field 1: Nama Lengkap */}
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                      Nama Lengkap Staf <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffFullName}
                      onChange={(e) => setStaffFullName(e.target.value)}
                      placeholder="Contoh: dr. Dian Pratama, M.Psi"
                      className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Field 2: Nama Panggilan / Tampilan */}
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center justify-between">
                      <span>Nama Panggilan / Tampilan (Display Name)</span>
                      <span className="text-[11px] text-purple-400">Tampil di header</span>
                    </label>
                    <input
                      type="text"
                      value={staffDisplayName}
                      onChange={(e) => setStaffDisplayName(e.target.value)}
                      placeholder="Contoh: dr. Dian / Bu Dian"
                      className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Field 3: Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Nama Pengguna (Username) <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setStaffUsername(generateUsernameFromFullName(staffFullName || 'staff'))}
                        className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset Sesuai Nama
                      </button>
                    </div>
                    <input
                      type="text"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="contoh: dian.pratama"
                      className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white font-mono text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <span className="text-[11px] text-muted">Huruf kecil, tanpa spasi, minimal 3 karakter untuk login.</span>
                  </div>

                  {/* Grid: Email & Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                        Alamat Email Staf
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          placeholder="staf@pelangi.sch.id"
                          className="w-full pl-9 pr-3 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                        Nomor Handphone / WA
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={staffPhone}
                          onChange={(e) => setStaffPhone(e.target.value)}
                          placeholder="0812-3456-7890"
                          className="w-full pl-9 pr-3 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grid: Peran (Role) & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                        Peran / Hak Akses (Role)
                      </label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                      >
                        <option value="manager">Manager Klinik</option>
                        <option value="admin">Administrator Sistem</option>
                        <option value="keuangan">Staf Keuangan</option>
                        <option value="assessor">Tim Assessor</option>
                        <option value="super_admin">Super Administrator</option>
                        <option value="terapis">Terapis</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                        Status Akun
                      </label>
                      <select
                        value={staffStatus}
                        onChange={(e) => setStaffStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                        className="w-full px-3.5 py-2.5 bg-background border border-surface-light rounded-xl text-white text-xs sm:text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                      >
                        <option value="Aktif">Aktif (Dapat Login)</option>
                        <option value="Nonaktif">Nonaktif (Akses Dinonaktifkan)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UBAH KATA SANDI STAF */}
              {staffModalActiveTab === 'password' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <p className="leading-relaxed">
                      Atur kata sandi baru untuk staf <strong>{staffFullName || 'ini'}</strong>. Minimal 5 karakter. Anda juga dapat menggunakan generator kata sandi acak yang aman.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Kata Sandi Baru <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setStaffPassword(generateDefaultPassword())}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Buat Sandi Acak
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showStaffPassword ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Masukkan kata sandi baru"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-background border border-surface-light rounded-xl text-white font-mono text-xs sm:text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                        title={showStaffPassword ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-muted block mt-1">Minimal 5 karakter. Disarankan kombinasi huruf dan angka.</span>
                  </div>

                  {/* Tombol Salin Kredensial untuk WhatsApp */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(staffFullName || 'Staf', staffUsername, staffPassword || 'password123', `Staf (${getRoleLabel(staffRole)})`)}
                      className="w-full py-2.5 px-3 rounded-xl bg-surface-light/60 hover:bg-surface-light border border-surface-light text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Salin Pesan Kredensial untuk Dikirim ke Staf</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-surface-light/20 border-t border-surface-light flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-white bg-surface-light/50 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStaffModal}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Staf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UserManagementPage;
