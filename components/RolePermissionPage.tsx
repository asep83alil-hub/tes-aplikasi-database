import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Key, 
  UserCheck, 
  CheckSquare, 
  Square, 
  Copy, 
  Save, 
  RotateCcw, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Filter, 
  X, 
  Sparkles, 
  Crown, 
  ChevronRight, 
  UserPlus, 
  RefreshCw, 
  Check, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, UserRole, RoleDefinition, UserAccount, ActivityLog, DataPermission } from '../types';
import { 
  MENU_TREE, 
  MODULE_DEFINITIONS, 
  getStoredRoles, 
  saveStoredRoles, 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredLogs, 
  appendActivityLog, 
  INITIAL_ROLES 
} from '../utils/rbacStorage';
import { getStoredCustomTexts, AppCustomTexts } from '../utils/textCustomizationStorage';

interface RolePermissionPageProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
  onNavigate?: (view: View) => void;
  onPermissionsUpdated?: (roles: RoleDefinition[]) => void;
  onOpenTextCustomizer?: () => void;
}

export const RolePermissionPage: React.FC<RolePermissionPageProps> = ({
  currentUserRole = 'manager',
  currentUserId = 'USR-MGR-01',
  onNavigate,
  onPermissionsUpdated,
  onOpenTextCustomizer
}) => {
  // Load State from storage
  const [roles, setRoles] = useState<RoleDefinition[]>(() => getStoredRoles());
  const [users, setUsers] = useState<UserAccount[]>(() => getStoredUsers());
  const [logs, setLogs] = useState<ActivityLog[]>(() => getStoredLogs());
  const [customTexts, setCustomTexts] = useState<AppCustomTexts>(() => getStoredCustomTexts());

  useEffect(() => {
    const handleTextsUpdated = () => {
      setCustomTexts(getStoredCustomTexts());
    };
    const handleProfileSync = () => {
      setUsers(getStoredUsers());
      setLogs(getStoredLogs());
    };
    window.addEventListener('pelangi_app_texts_updated', handleTextsUpdated);
    window.addEventListener('pelangi360_user_profile_updated', handleProfileSync);
    return () => {
      window.removeEventListener('pelangi_app_texts_updated', handleTextsUpdated);
      window.removeEventListener('pelangi360_user_profile_updated', handleProfileSync);
    };
  }, []);

  // Active Selected Role in Left Panel
  const [selectedRoleId, setSelectedRoleId] = useState<string>('terapis');
  const [activeTab, setActiveTab] = useState<'menus' | 'data' | 'users'>('menus');

  // Search & Filter
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [logFilterAction, setLogFilterAction] = useState<string>('ALL');

  // Draft edits for the currently selected role permissions
  const [draftMenus, setDraftMenus] = useState<View[]>([]);
  const [draftDataPermissions, setDraftDataPermissions] = useState<{ [moduleKey: string]: DataPermission }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceRoleId, setCloneSourceRoleId] = useState<string>('admin');
  const [cloneOptions, setCloneOptions] = useState<{ menus: boolean; data: boolean }>({ menus: true, data: true });
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '', templateRole: 'terapis' });
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [userLogModalTarget, setUserLogModalTarget] = useState<UserAccount | null>(null);

  // User Form State
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'terapis',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    photoUrl: ''
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Get active role object
  const activeRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Synchronize draft when selected role changes
  useEffect(() => {
    if (activeRole) {
      setDraftMenus([...(activeRole.allowedMenus || [])]);
      setDraftDataPermissions(JSON.parse(JSON.stringify(activeRole.dataPermissions || {})));
      setHasUnsavedChanges(false);
    }
  }, [selectedRoleId, roles]);

  // Security Check: Manager & Super Admin access
  const isManagerOrSuperAdmin = currentUserRole === 'manager' || currentUserRole === 'super_admin';

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalAdmin = users.filter(u => u.role === 'admin' || u.role === 'super_admin' || u.role === 'manager').length;
    const totalTherapists = users.filter(u => u.role === 'terapis').length;
    const totalStudents = users.filter(u => u.role === 'siswa').length;
    const totalParents = users.filter(u => u.role === 'orang_tua').length;
    const activeToday = users.filter(u => u.status === 'Aktif').length;

    return { totalUsers, totalAdmin, totalTherapists, totalStudents, totalParents, activeToday };
  }, [users]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (!roleSearchTerm.trim()) return roles;
    return roles.filter(r => 
      r.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearchTerm.toLowerCase())
    );
  }, [roles, roleSearchTerm]);

  // Users in Selected Role
  const usersInActiveRole = useMemo(() => {
    return users.filter(u => {
      const matchRole = u.role === selectedRoleId;
      if (!matchRole) return false;
      if (userSearchTerm.trim()) {
        const query = userSearchTerm.toLowerCase();
        return u.fullName.toLowerCase().includes(query) ||
               u.username.toLowerCase().includes(query) ||
               u.email.toLowerCase().includes(query) ||
               u.phone.includes(query);
      }
      return true;
    });
  }, [users, selectedRoleId, userSearchTerm]);

  // Handle Save Permission Changes
  const handleSavePermissions = () => {
    // Security rules:
    // Manager cannot lock their own access to rolePermission
    if (activeRole.id === 'manager' && !draftMenus.includes('rolePermission')) {
      showToast('Keamanan: Manager wajib mempertahankan akses ke Manajemen Role & Hak Akses!', 'error');
      return;
    }

    const updatedRoles = roles.map(r => {
      if (r.id === activeRole.id) {
        return {
          ...r,
          allowedMenus: draftMenus,
          dataPermissions: draftDataPermissions
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    saveStoredRoles(updatedRoles);
    setHasUnsavedChanges(false);

    // Record activity log
    const log = appendActivityLog({
      userId: currentUserId,
      userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
      userRole: currentUserRole || 'manager',
      actionType: 'PERMISSION_CHANGE',
      description: `Memperbarui hak akses menu & izin data untuk Role: ${activeRole.name}`,
      target: `Role: ${activeRole.name}`
    });
    setLogs(prev => [log, ...prev]);

    if (onPermissionsUpdated) {
      onPermissionsUpdated(updatedRoles);
    }

    showToast(`Hak akses untuk role "${activeRole.name}" berhasil disimpan!`, 'success');
  };

  // Toggle single menu
  const handleToggleMenu = (menuId: View) => {
    setDraftMenus(prev => {
      let next: View[];
      if (prev.includes(menuId)) {
        next = prev.filter(m => m !== menuId);
      } else {
        next = [...prev, menuId];
      }
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Toggle Category of menus
  const handleToggleCategory = (categoryItems: { id: View }[], allChecked: boolean) => {
    setDraftMenus(prev => {
      const itemIds = categoryItems.map(i => i.id);
      let next: View[];
      if (allChecked) {
        // Uncheck all
        next = prev.filter(m => !itemIds.includes(m));
      } else {
        // Check all
        const set = new Set([...prev, ...itemIds]);
        next = Array.from(set);
      }
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Toggle Data Permission
  const handleToggleDataPermission = (moduleKey: string, field: keyof DataPermission) => {
    setDraftDataPermissions(prev => {
      const mod = prev[moduleKey] || {
        view: false, create: false, edit: false, delete: false, export: false, print: false, approve: false
      };
      const updated = {
        ...prev,
        [moduleKey]: {
          ...mod,
          [field]: !mod[field]
        }
      };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Batch toggle data permission for a module
  const handleSetModuleQuickPermission = (moduleKey: string, type: 'full' | 'readonly' | 'none') => {
    setDraftDataPermissions(prev => {
      let modPerm: DataPermission;
      if (type === 'full') {
        modPerm = { view: true, create: true, edit: true, delete: true, export: true, print: true, approve: true };
      } else if (type === 'readonly') {
        modPerm = { view: true, create: false, edit: false, delete: false, export: true, print: true, approve: false };
      } else {
        modPerm = { view: false, create: false, edit: false, delete: false, export: false, print: false, approve: false };
      }
      setHasUnsavedChanges(true);
      return {
        ...prev,
        [moduleKey]: modPerm
      };
    });
  };

  // Clone permissions from another role
  const handleExecuteClone = () => {
    const sourceRole = roles.find(r => r.id === cloneSourceRoleId);
    if (!sourceRole) return;

    if (cloneOptions.menus) {
      setDraftMenus([...sourceRole.allowedMenus]);
    }
    if (cloneOptions.data) {
      setDraftDataPermissions(JSON.parse(JSON.stringify(sourceRole.dataPermissions)));
    }
    setHasUnsavedChanges(true);
    setIsCloneModalOpen(false);

    showToast(`Berhasil menduplikasi hak akses dari role "${sourceRole.name}"! Klik "Simpan Perubahan" untuk menerapkan.`, 'info');
  };

  // Reset to default
  const handleResetToDefault = () => {
    const initialMatch = INITIAL_ROLES.find(r => r.id === activeRole.id);
    if (initialMatch) {
      setDraftMenus([...initialMatch.allowedMenus]);
      setDraftDataPermissions(JSON.parse(JSON.stringify(initialMatch.dataPermissions)));
      setHasUnsavedChanges(true);
      showToast(`Pengaturan role "${activeRole.name}" dikembalikan ke preset default.`, 'info');
    }
  };

  // Add Custom Role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    const id = `custom_${Date.now()}`;
    const template = roles.find(r => r.id === newRoleForm.templateRole) || roles[0];

    const newRole: RoleDefinition = {
      id,
      name: newRoleForm.name.trim(),
      description: newRoleForm.description.trim() || 'Role kustom operasional',
      isSystem: false,
      color: '#14B8A6',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      badgeText: 'Custom Role',
      allowedMenus: [...template.allowedMenus],
      dataPermissions: JSON.parse(JSON.stringify(template.dataPermissions))
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    saveStoredRoles(updatedRoles);
    setSelectedRoleId(id);
    setIsAddRoleModalOpen(false);
    setNewRoleForm({ name: '', description: '', templateRole: 'terapis' });

    const log = appendActivityLog({
      userId: currentUserId,
      userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
      userRole: currentUserRole || 'manager',
      actionType: 'CREATE',
      description: `Membuat Custom Role baru: ${newRole.name}`,
      target: newRole.id
    });
    setLogs(prev => [log, ...prev]);

    showToast(`Role baru "${newRole.name}" berhasil dibuat!`, 'success');
  };

  // Open Add User Modal
  const handleOpenAddUser = (defaultRole?: string) => {
    setEditingUser(null);
    setUserFormData({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: defaultRole || selectedRoleId,
      status: 'Aktif',
      photoUrl: ''
    });
    setIsAddUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setUserFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: '', // blank unless modifying
      role: user.role,
      status: user.status,
      photoUrl: user.photoUrl || ''
    });
    setIsAddUserModalOpen(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName.trim() || !userFormData.username.trim()) {
      showToast('Nama Lengkap dan Username wajib diisi!', 'error');
      return;
    }

    if (editingUser) {
      // Check Super Admin safety
      if (editingUser.role === 'super_admin' && currentUserRole === 'admin') {
        showToast('Keamanan: Admin tidak berhak mengubah akun Super Admin!', 'error');
        return;
      }

      const updatedUsers = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            fullName: userFormData.fullName.trim(),
            username: userFormData.username.trim().toLowerCase(),
            email: userFormData.email.trim(),
            phone: userFormData.phone.trim(),
            role: userFormData.role,
            status: userFormData.status,
            photoUrl: userFormData.photoUrl || u.photoUrl,
            ...(userFormData.password ? { password: userFormData.password } : {})
          };
        }
        return u;
      });

      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
      setIsAddUserModalOpen(false);

      const log = appendActivityLog({
        userId: currentUserId,
        userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
        userRole: currentUserRole || 'manager',
        actionType: 'UPDATE',
        description: `Memperbarui profil akun pengguna: ${userFormData.fullName} (${userFormData.username})`,
        target: editingUser.id
      });
      setLogs(prev => [log, ...prev]);

      showToast(`Data akun "${userFormData.fullName}" berhasil diperbarui!`, 'success');
    } else {
      // Create new user
      if (!userFormData.password) {
        showToast('Password wajib diisi untuk akun baru!', 'error');
        return;
      }

      // Check username collision
      if (users.some(u => u.username.toLowerCase() === userFormData.username.trim().toLowerCase())) {
        showToast('Username sudah digunakan oleh akun lain!', 'error');
        return;
      }

      const newUser: UserAccount = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        fullName: userFormData.fullName.trim(),
        username: userFormData.username.trim().toLowerCase(),
        email: userFormData.email.trim(),
        phone: userFormData.phone.trim(),
        role: userFormData.role,
        status: userFormData.status,
        photoUrl: userFormData.photoUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(userFormData.username)}`,
        password: userFormData.password,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Belum pernah login'
      };

      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
      setIsAddUserModalOpen(false);

      const log = appendActivityLog({
        userId: currentUserId,
        userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
        userRole: currentUserRole || 'manager',
        actionType: 'CREATE',
        description: `Membuat akun pengguna baru: ${newUser.fullName} [Role: ${newUser.role}]`,
        target: newUser.id
      });
      setLogs(prev => [log, ...prev]);

      showToast(`Akun "${newUser.fullName}" berhasil ditambahkan!`, 'success');
    }
  };

  // Toggle user status (Aktif / Nonaktif)
  const handleToggleUserStatus = (user: UserAccount) => {
    // Security check: cannot deactivate yourself or super admin
    if (user.id === currentUserId) {
      showToast('Keamanan: Anda tidak dapat menonaktifkan akun Anda sendiri!', 'error');
      return;
    }
    if (user.role === 'super_admin' && currentUserRole !== 'super_admin') {
      showToast('Keamanan: Akun Super Admin tidak dapat dinonaktifkan!', 'error');
      return;
    }

    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    const log = appendActivityLog({
      userId: currentUserId,
      userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
      userRole: currentUserRole || 'manager',
      actionType: 'STATUS_CHANGE',
      description: `Mengubah status akun ${user.fullName} menjadi: ${newStatus}`,
      target: user.id
    });
    setLogs(prev => [log, ...prev]);

    showToast(`Status akun ${user.fullName} diubah menjadi ${newStatus}.`, 'info');
  };

  // Delete User
  const handleDeleteUser = (user: UserAccount) => {
    if (user.id === currentUserId) {
      showToast('Keamanan: Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    if (user.role === 'super_admin') {
      showToast('Keamanan: Akun Super Admin tidak dapat dihapus!', 'error');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus akun "${user.fullName}" (@${user.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      const log = appendActivityLog({
        userId: currentUserId,
        userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
        userRole: currentUserRole || 'manager',
        actionType: 'DELETE',
        description: `Menghapus akun pengguna: ${user.fullName} (@${user.username})`,
        target: user.id
      });
      setLogs(prev => [log, ...prev]);

      showToast(`Akun "${user.fullName}" berhasil dihapus.`, 'info');
    }
  };

  // Reset Password Action
  const handleOpenResetPassword = (user: UserAccount) => {
    setUserToReset(user);
    setNewPasswordValue('');
    setIsResetPassModalOpen(true);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReset || !newPasswordValue.trim()) return;

    if (newPasswordValue.length < 6) {
      showToast('Password baru minimal 6 karakter!', 'error');
      return;
    }

    const updatedUsers = users.map(u => u.id === userToReset.id ? { ...u, password: newPasswordValue.trim() } : u);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setIsResetPassModalOpen(false);

    const log = appendActivityLog({
      userId: currentUserId,
      userName: currentUserRole === 'super_admin' ? 'Super Admin' : 'Ibu Nurul Aini (Manager)',
      userRole: currentUserRole || 'manager',
      actionType: 'PASSWORD_RESET',
      description: `Reset password untuk pengguna: ${userToReset.fullName} (@${userToReset.username})`,
      target: userToReset.id
    });
    setLogs(prev => [log, ...prev]);

    showToast(`Password untuk @${userToReset.username} berhasil di-reset!`, 'success');
  };

  // Open Log for Specific User
  const handleOpenUserLogs = (user: UserAccount) => {
    setUserLogModalTarget(user);
    setIsLogsModalOpen(true);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let result = logs;
    if (userLogModalTarget) {
      result = result.filter(l => l.target === userLogModalTarget.id || l.userId === userLogModalTarget.id);
    }
    if (logFilterAction !== 'ALL') {
      result = result.filter(l => l.actionType === logFilterAction);
    }
    return result;
  }, [logs, userLogModalTarget, logFilterAction]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : toastMessage.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400" />}
            <span className="text-sm font-semibold">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Warning if non-Manager views this page */}
      {!isManagerOrSuperAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-300">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Akses Terbatas: Mode Observasi</p>
              <p className="text-xs text-amber-400/80">Menu ini dikhususkan untuk akun Manager dan Super Admin. Anda dapat melihat struktur hak akses tetapi tidak dapat mengubah konfigurasi sensitif.</p>
            </div>
          </div>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-xl transition"
            >
              Kembali ke Dashboard
            </button>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Manajemen Role & Hak Akses</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Manager Only
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Pusat kontrol Role-Based Access Control (RBAC): atur checklist menu, izin data granular (CRUD), dan kelola akun pengguna.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <button
            onClick={() => { setUserLogModalTarget(null); setIsLogsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition shadow-sm hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Audit Trail & Log Aktivitas</span>
          </button>

          <button
            onClick={() => handleOpenAddUser()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* 6. Dashboard Monitoring - Widget Statistik Pengguna & Log Aktivitas Cepat */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
          <span className="text-[10px] text-slate-500">Semua entitas akun</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Admin</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">{stats.totalAdmin}</div>
          <span className="text-[10px] text-slate-500">Manager & Admin</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Terapis</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.totalTherapists}</div>
          <span className="text-[10px] text-slate-500">Tenaga klinisi aktif</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.totalStudents}</div>
          <span className="text-[10px] text-slate-500">Peserta terapi aktif</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-pink-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orang Tua</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-pink-400">{stats.totalParents}</div>
          <span className="text-[10px] text-slate-500">Wali terhubung</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Akun Aktif</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-400">{stats.activeToday}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Siap login ke sistem</span>
        </div>
      </div>

      {/* Main 2-Panel Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL KIRI: DAFTAR ROLE (4 Kolom pada LG) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Daftar Role Sistem</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">{roles.length}</span>
              </h2>
              <p className="text-xs text-slate-400">Pilih role untuk mengatur izin</p>
            </div>

            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold transition flex items-center gap-1.5"
              title="Tambah Custom Role"
            >
              <Plus className="w-4 h-4" />
              <span>Role Baru</span>
            </button>
          </div>

          {/* Search Role */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari role pengguna..."
              value={roleSearchTerm}
              onChange={(e) => setRoleSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Role List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredRoles.map(role => {
              const isSelected = role.id === selectedRoleId;
              const roleUserCount = users.filter(u => u.role === role.id).length;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 border flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500/50 shadow-md shadow-purple-500/10 text-white'
                      : 'bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: `${role.color}20`, 
                        color: role.color,
                        borderColor: `${role.color}40`,
                        borderWidth: '1px'
                      }}
                    >
                      {role.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate text-white">{role.name}</span>
                        {role.id === 'manager' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{role.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      {roleUserCount} user
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-white transition ${isSelected ? 'rotate-90 text-purple-400' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">💡 Aturan Keamanan Sistem:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500">
              <li>Super Admin memiliki hak akses mutlak tak terbatas.</li>
              <li>Manager berwenang mengonfigurasi seluruh role.</li>
              <li>Admin tidak dapat mengubah izin Manager & Super Admin.</li>
            </ul>
          </div>
        </div>

        {/* PANEL KANAN: KONFIGURASI ROLE (8 Kolom pada LG) */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Header Role Terpilih */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg"
                style={{ 
                  backgroundColor: `${activeRole.color}25`, 
                  color: activeRole.color,
                  borderColor: `${activeRole.color}50`,
                  borderWidth: '1px'
                }}
              >
                {activeRole.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{activeRole.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${activeRole.badgeBg}`}>
                    {activeRole.badgeText}
                  </span>
                  {activeRole.isSystem && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      System Core
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeRole.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenTextCustomizer && (
                <button
                  onClick={onOpenTextCustomizer}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-purple-200 hover:text-white text-xs font-bold rounded-xl border border-purple-500/40 transition shadow-sm cursor-pointer"
                  title="Ubah teks dan tulisan di setiap menu aplikasi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Kustomisasi Tulisan Menu</span>
                </button>
              )}

              <button
                onClick={() => setIsCloneModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                title="Salin izin dari role lain"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Clone Izin</span>
              </button>

              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                title="Kembalikan ke preset awal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSavePermissions}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-lg transition ${
                  hasUnsavedChanges
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30 scale-105 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{hasUnsavedChanges ? 'Simpan Perubahan *' : 'Tersimpan'}</span>
              </button>
            </div>
          </div>

          {/* 3 Tab Navigation: Hak Akses Menu, Hak Akses Data, Pengguna Role Ini */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('menus')}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'menus'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>1. Hak Akses Menu</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/10 text-purple-300 font-bold">
                {draftMenus.length} aktif
              </span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'data'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>2. Hak Akses Data (CRUD)</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-300 font-bold">
                Granular
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. Pengguna Role Ini</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-bold">
                {usersInActiveRole.length}
              </span>
            </button>
          </div>

          {/* TAB 1: HAK AKSES MENU (CHECKBOX TREE) */}
          {activeTab === 'menus' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter nama menu..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const allMenuIds = MENU_TREE.flatMap(g => g.items.map(i => i.id));
                      setDraftMenus(allMenuIds);
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Pilih Semua
                  </button>
                  <button
                    onClick={() => {
                      // Safety: Manager always keeps rolePermission
                      if (activeRole.id === 'manager') {
                        setDraftMenus(['rolePermission', 'dashboard']);
                      } else {
                        setDraftMenus([]);
                      }
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Kosongkan Semua
                  </button>
                </div>
              </div>

              {/* Grouped Tree List */}
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {MENU_TREE.map(group => {
                  const filteredItems = menuSearchTerm.trim()
                    ? group.items.filter(i => i.label.toLowerCase().includes(menuSearchTerm.toLowerCase()) || i.description.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                    : group.items;

                  if (filteredItems.length === 0) return null;

                  const allChecked = filteredItems.every(i => draftMenus.includes(i.id));
                  const someChecked = filteredItems.some(i => draftMenus.includes(i.id)) && !allChecked;

                  return (
                    <div key={group.category} className="bg-slate-950/40 rounded-2xl border border-slate-800/80 overflow-hidden">
                      {/* Group Header */}
                      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(filteredItems, allChecked)}
                            className="text-purple-400 hover:text-purple-300 transition"
                          >
                            {allChecked ? (
                              <CheckSquare className="w-5 h-5 text-purple-400" />
                            ) : someChecked ? (
                              <div className="w-5 h-5 rounded border-2 border-purple-400 bg-purple-500/20 flex items-center justify-center">
                                <div className="w-2.5 h-1 bg-purple-400 rounded-sm" />
                              </div>
                            ) : (
                              <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                          <span className="text-xs font-black text-white tracking-wider uppercase">
                            {customTexts.menuGroupLabels[group.category] || group.categoryLabel}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {filteredItems.filter(i => draftMenus.includes(i.id)).length} dari {filteredItems.length} menu aktif
                        </span>
                      </div>

                      {/* Group Items */}
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filteredItems.map(item => {
                          const isChecked = draftMenus.includes(item.id);
                          // Rule: rolePermission is ONLY visible and permitted for Manager and Super Admin
                          const isRestrictedManagerOnly = item.id === 'rolePermission';
                          const isSpecialConstraint = isRestrictedManagerOnly && !['manager', 'super_admin'].includes(activeRole.id);
                          const customLabel = customTexts.menuLabels[item.id] || item.label;
                          const customDesc = customTexts.menuDescriptions[item.id] || item.description;

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isSpecialConstraint) {
                                  showToast('Menu Manajemen Role & Hak Akses hanya dapat diberikan kepada role Manager & Super Admin!', 'error');
                                  return;
                                }
                                handleToggleMenu(item.id);
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isChecked
                                  ? 'bg-purple-950/20 border-purple-500/40 text-white'
                                  : 'bg-slate-900/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/60'
                              } ${isSpecialConstraint ? 'opacity-50 cursor-not-allowed bg-slate-950/80' : ''}`}
                            >
                              <div className="mt-0.5">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                                    {customLabel}
                                  </span>
                                  {isRestrictedManagerOnly && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      Manager Only
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">{customDesc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HAK AKSES DATA (CRUD & APPROVE) */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Atur izin aksi detail untuk setiap modul data di sistem:</span>
                <span className="text-[11px] text-purple-400 font-semibold">Tersinkronisasi otomatis saat disimpan</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Modul Sistem</th>
                      <th className="p-3.5 text-center">View (Lihat)</th>
                      <th className="p-3.5 text-center">Create (Tambah)</th>
                      <th className="p-3.5 text-center">Edit (Ubah)</th>
                      <th className="p-3.5 text-center">Delete (Hapus)</th>
                      <th className="p-3.5 text-center">Export</th>
                      <th className="p-3.5 text-center">Print</th>
                      <th className="p-3.5 text-center">Approve</th>
                      <th className="p-3.5 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
                    {MODULE_DEFINITIONS.map(mod => {
                      const perm = draftDataPermissions[mod.id] || {
                        view: false, create: false, edit: false, delete: false, export: false, print: false, approve: false
                      };

                      return (
                        <tr key={mod.id} className="hover:bg-slate-900/30 transition">
                          <td className="p-3.5">
                            <span className="font-bold text-white block">{mod.name}</span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-xs">{mod.description}</span>
                          </td>

                          {(['view', 'create', 'edit', 'delete', 'export', 'print', 'approve'] as (keyof DataPermission)[]).map(field => {
                            const isAllowed = perm[field];
                            return (
                              <td key={field} className="p-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleDataPermission(mod.id, field)}
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition mx-auto ${
                                    isAllowed
                                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                                  }`}
                                  title={`${field}: ${isAllowed ? 'Diizinkan' : 'Dilarang'}`}
                                >
                                  {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            );
                          })}

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSetModuleQuickPermission(mod.id, 'full')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                              >
                                Full
                              </button>
                              <button
                                onClick={() => handleSetModuleQuickPermission(mod.id, 'readonly')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                              >
                                Read
                              </button>
                              <button
                                onClick={() => handleSetModuleQuickPermission(mod.id, 'none')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px]"
                              >
                                Clear
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PENGGUNA ROLE INI */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={`Cari pengguna dengan role ${activeRole.name}...`}
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <button
                  onClick={() => handleOpenAddUser(activeRole.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Pengguna Role Ini</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Pengguna</th>
                      <th className="p-3.5">Username</th>
                      <th className="p-3.5">Kontak</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Terakhir Aktif</th>
                      <th className="p-3.5 text-right">Aksi Akun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
                    {usersInActiveRole.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Belum ada pengguna terdaftar dengan role {activeRole.name}.
                          <button
                            onClick={() => handleOpenAddUser(activeRole.id)}
                            className="block mx-auto mt-2 text-xs font-bold text-purple-400 hover:underline"
                          >
                            + Tambah Pengguna Sekarang
                          </button>
                        </td>
                      </tr>
                    ) : (
                      usersInActiveRole.map(user => {
                        const isSelf = user.id === currentUserId;
                        const isSuperAdminUser = user.role === 'super_admin';

                        return (
                          <tr key={user.id} className="hover:bg-slate-900/30 transition">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.photoUrl || `https://i.pravatar.cc/100?u=${user.username}`}
                                  alt={user.fullName}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{user.fullName}</span>
                                    {isSelf && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                                        Anda
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500">{user.email || 'Tanpa email'}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <code className="text-xs text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                                @{user.username}
                              </code>
                            </td>

                            <td className="p-3.5 text-slate-400 text-xs">
                              {user.phone || '-'}
                            </td>

                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                disabled={isSelf || isSuperAdminUser}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition ${
                                  user.status === 'Aktif'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                } ${isSelf || isSuperAdminUser ? 'cursor-not-allowed opacity-80' : ''}`}
                                title={isSelf ? 'Tidak dapat menonaktifkan akun sendiri' : 'Klik untuk mengubah status'}
                              >
                                {user.status}
                              </button>
                            </td>

                            <td className="p-3.5 text-slate-400 text-[11px]">
                              {user.lastLogin || 'Belum login'}
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenUserLogs(user)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                  title="Lihat riwayat aktivitas"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleOpenResetPassword(user)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                                  title="Reset password"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleOpenEditUser(user)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                                  title="Edit akun"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {!isSelf && !isSuperAdminUser && (
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 transition"
                                    title="Hapus akun"
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
          )}
        </div>
      </div>

      {/* MODAL: TAMBAH / EDIT AKUN PENGGUNA */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lengkapi profil dan hak akses untuk akun sistem Pelangi360
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    placeholder="Contoh: Sarah Anindita, S.Psi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="sarah_anindita"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Pilihan Role *
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.badgeText})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="user@lazuardi.sch.id"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Minimal 6 karakter..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Foto Profil URL (Opsional)
                    </label>
                    <input
                      type="text"
                      value={userFormData.photoUrl}
                      onChange={(e) => setUserFormData({ ...userFormData, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Status Akun
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="statusRadio"
                          checked={userFormData.status === 'Aktif'}
                          onChange={() => setUserFormData({ ...userFormData, status: 'Aktif' })}
                          className="accent-purple-500"
                        />
                        <span>Aktif</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="statusRadio"
                          checked={userFormData.status === 'Nonaktif'}
                          onChange={() => setUserFormData({ ...userFormData, status: 'Nonaktif' })}
                          className="accent-purple-500"
                        />
                        <span>Nonaktif</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition"
                  >
                    {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESET PASSWORD */}
      <AnimatePresence>
        {isResetPassModalOpen && userToReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>Reset Password Akun</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Untuk pengguna: <span className="text-white font-bold">{userToReset.fullName}</span> (@{userToReset.username})
                  </p>
                </div>
                <button 
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveResetPassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      placeholder="Masukkan kata sandi baru..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'Pelangi' + Math.floor(1000 + Math.random() * 9000);
                        setNewPasswordValue(randomPass);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-bold"
                    >
                      Acak
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Minimal 6 karakter alphanumeric.</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPassModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CLONE PERMISSION */}
      <AnimatePresence>
        {isCloneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Copy className="w-5 h-5 text-indigo-400" />
                    <span>Clone Hak Akses Role</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Salin izin dari role lain ke role <span className="text-white font-bold">{activeRole.name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsCloneModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pilih Role Sumber (Source)
                  </label>
                  <select
                    value={cloneSourceRoleId}
                    onChange={(e) => setCloneSourceRoleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {roles.filter(r => r.id !== activeRole.id).map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.badgeText})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Izin yang ingin disalin:
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloneOptions.menus}
                      onChange={(e) => setCloneOptions({ ...cloneOptions, menus: e.target.checked })}
                      className="accent-indigo-500"
                    />
                    <span>Hak Akses Menu (Checklist Navigasi Sidebar)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloneOptions.data}
                      onChange={(e) => setCloneOptions({ ...cloneOptions, data: e.target.checked })}
                      className="accent-indigo-500"
                    />
                    <span>Hak Akses Data Granular (View, Create, Edit, Delete, Approve)</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCloneModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteClone}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/25"
                  >
                    Salin Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: TAMBAH CUSTOM ROLE */}
      <AnimatePresence>
        {isAddRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <span>Tambah Custom Role Baru</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Definisikan peran baru sesuai kebutuhan struktural organisasi
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomRole} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    placeholder="Contoh: Koordinator Terapi SI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Deskripsi Ringkas
                  </label>
                  <input
                    type="text"
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                    placeholder="Tugas dan lingkup kerja role ini..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Template Dasar Izin
                  </label>
                  <select
                    value={newRoleForm.templateRole}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, templateRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>Template dari {r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRoleModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-lg shadow-teal-500/25"
                  >
                    Buat Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AUDIT TRAIL / LOG AKTIVITAS */}
      <AnimatePresence>
        {isLogsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>
                      {userLogModalTarget 
                        ? `Riwayat Aktivitas: ${userLogModalTarget.fullName}` 
                        : 'Audit Trail & Log Aktivitas Sistem'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rekam jejak transparansi: siapa yang login, siapa yang mengubah data, dan siapa yang mengubah hak akses.
                  </p>
                </div>
                <button 
                  onClick={() => setIsLogsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Action */}
              <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-400">Filter Aksi:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['ALL', 'LOGIN', 'PERMISSION_CHANGE', 'CREATE', 'UPDATE', 'DELETE', 'PASSWORD_RESET'].map(action => (
                    <button
                      key={action}
                      onClick={() => setLogFilterAction(action)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                        logFilterAction === action
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs Content List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Tidak ada catatan aktivitas yang cocok dengan filter.
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    let badgeColor = 'bg-slate-800 text-slate-300';
                    if (log.actionType === 'PERMISSION_CHANGE') badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                    if (log.actionType === 'LOGIN') badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                    if (log.actionType === 'CREATE') badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    if (log.actionType === 'DELETE') badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                    if (log.actionType === 'PASSWORD_RESET') badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                    return (
                      <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badgeColor}`}>
                              {log.actionType}
                            </span>
                            <span className="text-xs font-bold text-white">{log.userName}</span>
                            <span className="text-[11px] text-slate-500">[{log.userRole}]</span>
                          </div>
                          <p className="text-xs text-slate-300">{log.description}</p>
                          {log.target && (
                            <p className="text-[11px] text-purple-400 font-mono">Target: {log.target}</p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>{log.timestamp}</span>
                          </div>
                          {log.ipAddress && (
                            <span className="text-[10px] text-slate-600 font-mono">{log.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-right">
                <button
                  onClick={() => setIsLogsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  Tutup Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolePermissionPage;
