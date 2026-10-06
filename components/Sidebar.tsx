import React, { useState, useMemo, useEffect } from 'react';
import { View, UserRole } from '../types';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  ClipboardList, 
  FileCheck, 
  UserCog, 
  BarChart3, 
  Target, 
  Wallet, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Activity, 
  Shield, 
  TrendingUp, 
  Coins, 
  UserPlus, 
  CalendarCheck,
  Lock,
  Layers,
  FileSpreadsheet,
  X,
  Sparkles,
  FolderArchive,
  Cloud
} from 'lucide-react';
import EditMenuIcon from './icons/EditMenuIcon';
import { getStoredMenuCustomizations, MenuCustomizationConfig } from '../utils/menuCustomizationStorage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarGroup {
  id: string;
  label: string;
  items: {
    id: View;
    label: string;
    icon: React.FC<{ className?: string }>;
    roles?: UserRole[];
    badge?: string;
  }[];
}

const MENU_GROUPS: SidebarGroup[] = [
  {
    id: 'operasional',
    label: 'OPERASIONAL',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'registrasi', label: 'Registrasi', icon: UserPlus, roles: ['admin', 'manager', 'super_admin', 'terapis'] },
      { id: 'papanJadwal', label: 'Jadwal Terapi', icon: CalendarRange },
      { id: 'rekapKehadiran', label: 'Kehadiran', icon: CalendarCheck },
      { id: 'manajemenAnak', label: 'Manajemen Anak', icon: Users },
      { id: 'programTerapi', label: 'Program Terapi', icon: Layers },
      { id: 'bukuCatatanTerapi', label: 'Buku Catatan Terapi', icon: BookOpen },
      { id: 'rapot', label: 'Rapor Terapi', icon: ClipboardList },
      { id: 'dokumenSiswa', label: 'Dokumen Perkembangan Siswa', icon: FolderArchive, roles: ['admin', 'manager', 'super_admin', 'siswa', 'orang_tua'] }
    ]
  },
  {
    id: 'assessment',
    label: 'ASSESSMENT',
    items: [
      { id: 'assesmentAnak', label: 'Assessment Anak', icon: ClipboardCheck },
      { id: 'laporanAssesment', label: 'Hasil Assessment', icon: FileCheck }
    ]
  },
  {
    id: 'sdm',
    label: 'SDM',
    items: [
      { id: 'manajemenTerapis', label: 'Manajemen Terapis', icon: UserCog, roles: ['admin'] }
    ]
  },
  {
    id: 'keuangan',
    label: 'KEUANGAN',
    items: [
      { id: 'tagihan', label: 'Tagihan', icon: CreditCard, roles: ['admin', 'siswa'] },
      { id: 'laporanKeuangan', label: 'Laporan Keuangan', icon: FileSpreadsheet, roles: ['admin'] }
    ]
  },
  {
    id: 'laporan',
    label: 'LAPORAN',
    items: [
      { id: 'pusatLaporan', label: 'Dashboard KPI', icon: BarChart3, roles: ['admin'] },
      { id: 'balancedScorecard', label: 'Balanced Scorecard', icon: TrendingUp, roles: ['admin'] },
      { id: 'strategicPlan', label: 'Strategic Plan', icon: Target, roles: ['admin'] }
    ]
  },
  {
    id: 'pengaturan',
    label: 'PENGATURAN',
    items: [
      { id: 'googleWorkspace', label: 'Google Drive & Sheets', icon: Cloud, roles: ['admin', 'manager', 'super_admin'] },
      { id: 'manajemenPengguna', label: 'Manajemen Pengguna', icon: Users, roles: ['admin', 'manager', 'super_admin'] },
      { id: 'rolePermission', label: 'Manajemen Role & Hak Akses', icon: Lock, roles: ['manager', 'super_admin'] },
      { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings, roles: ['admin', 'manager', 'super_admin'] },
      { id: 'editMenu', label: 'Edit Menu & Teks', icon: EditMenuIcon, roles: ['manager'] }
    ]
  }
];

interface SidebarProps {
  userRole: UserRole;
  activeView: View;
  onNavigate: (view: View) => void;
  logoUrl?: string;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  allowedMenus?: View[];
  newRegistrationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeView,
  onNavigate,
  logoUrl,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  allowedMenus,
  newRegistrationsCount = 0
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuConfig, setMenuConfig] = useState<MenuCustomizationConfig>(getStoredMenuCustomizations());

  // Listen to menu & text customizations update
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMenuConfig(e.detail);
      }
    };
    window.addEventListener('pelangi360_menu_customization_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_menu_customization_updated', handleUpdate);
  }, []);

  // Filter menu items by role, dynamic RBAC allowedMenus, and search query
  const filteredGroups = useMemo(() => {
    return MENU_GROUPS.map(group => {
      const items = group.items.filter(item => {
        // Strict security rule: editMenu is ONLY visible and accessible to Manager
        if (item.id === 'editMenu') {
          if (userRole !== 'manager') {
            return false;
          }
        }

        // Strict security rule: rolePermission is ONLY visible and accessible to Manager and Super Admin
        if (item.id === 'rolePermission') {
          if (userRole !== 'manager' && userRole !== 'super_admin') {
            return false;
          }
        }

        // Strict security rule: pengaturan is ONLY visible and accessible to Manager and Admin
        if (item.id === 'pengaturan') {
          if (userRole !== 'manager' && userRole !== 'admin' && userRole !== 'super_admin') {
            return false;
          }
        }

        // If dynamic allowedMenus are provided from RBAC, check membership
        if (allowedMenus && allowedMenus.length > 0) {
          // If the role is super_admin or manager, always allow rolePermission and editMenu (for manager)
          if (item.id === 'rolePermission' && (userRole === 'manager' || userRole === 'super_admin')) {
            // Keep visible
          } else if (item.id === 'editMenu' && userRole === 'manager') {
            // Keep visible
          } else if (!allowedMenus.includes(item.id)) {
            return false;
          }
        } else {
          // Fallback static role check
          if (item.roles && userRole && !item.roles.includes(userRole) && userRole !== 'manager' && userRole !== 'super_admin') {
            return false;
          }
          if ((userRole === 'siswa' || userRole === 'orang_tua') && !['dashboard', 'papanJadwal', 'bukuCatatanTerapi', 'programTerapi', 'rapot', 'tagihan', 'rekapKehadiran', 'dokumenSiswa'].includes(item.id)) {
            return false;
          }
        }

        // Search query check using custom label
        let itemLabel = (menuConfig.menuLabels as any)[item.id] || item.label;
        if (item.id === 'dokumenSiswa' && (userRole === 'siswa' || userRole === 'orang_tua')) {
          itemLabel = 'Dokumen Perkembangan Saya';
        }
        if (searchQuery.trim()) {
          return itemLabel.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
      return { ...group, items };
    }).filter(group => group.items.length > 0);
  }, [userRole, allowedMenus, searchQuery, menuConfig]);

  const handleSelectView = (view: View) => {
    onNavigate(view);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 border-r border-slate-800">
      {/* Brand & Logo */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Activity className="w-5 h-5 text-white" />
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight truncate">
                  {menuConfig.brand.appTitle || 'Pelangi360'}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {menuConfig.brand.badgeText || 'Enterprise'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {menuConfig.brand.appSubtitle || 'Lazuardi Therapy & Growth Center'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input (visible when expanded) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari menu... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav Menu Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {filteredGroups.map(group => {
          const groupTitle = menuConfig.groups[group.id] || group.label;
          return (
            <div key={group.id} className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {groupTitle}
                </h4>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const IconComponent = item.icon;
                  const isActive = activeView === item.id;
                  const itemLabel = (menuConfig.menuLabels as any)[item.id] || item.label;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectView(item.id)}
                      title={isCollapsed ? itemLabel : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 group relative text-left",
                        isActive
                          ? item.id === 'editMenu'
                            ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                            : "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25"
                          : item.id === 'editMenu'
                            ? "text-purple-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      )}
                    >
                      <IconComponent className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive 
                          ? "text-white" 
                          : item.id === 'editMenu'
                            ? "text-purple-400 group-hover:text-purple-200"
                            : "text-slate-400 group-hover:text-slate-200"
                      )} />

                      {!isCollapsed && (
                        <span className="truncate flex-1 tracking-normal">{itemLabel}</span>
                      )}

                      {item.id === 'editMenu' && !isCollapsed && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          Manager
                        </span>
                      )}

                      {item.id === 'registrasi' && newRegistrationsCount > 0 && (
                        <span className={cn(
                          "rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shadow-sm shrink-0",
                          isCollapsed 
                            ? "absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[9px]" 
                            : "px-1.5 py-0.5 ml-auto"
                        )}>
                          {newRegistrationsCount}
                        </span>
                      )}

                      {isActive && !isCollapsed && !(item.id === 'registrasi' && newRegistrationsCount > 0) && item.id !== 'editMenu' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto shadow-sm"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-900/60">
        {onLogout && (
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Keluar' : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Keluar Sesi</span>}
          </button>
        )}

        {/* Collapse toggle (Desktop only) */}
        <div className="hidden md:flex items-center justify-end pt-2 border-t border-slate-800/40">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block shrink-0 transition-all duration-300 ease-in-out select-none",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fade-in-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
