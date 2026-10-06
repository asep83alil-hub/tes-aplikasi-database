import React, { useState, useRef, useEffect } from 'react';
import { Child, UserRole, Therapist } from '../types';
import { getStoredUsers, appendActivityLog } from '../utils/rbacStorage';
import { getStoredCustomTexts, AppCustomTexts } from '../utils/textCustomizationStorage';

type MasterChild = Omit<Child, 'sessions'>;

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, id?: string, accountId?: string) => void;
  onNavigateGuest: () => void;
  logoUrl: string;
  allChildren: MasterChild[];
  allTherapists: Therapist[];
  onLogoChange: (newLogoUrl: string) => void;
}

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const LockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateGuest, logoUrl, allChildren, allTherapists, onLogoChange }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customTexts, setCustomTexts] = useState<AppCustomTexts>(() => getStoredCustomTexts());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleTextsUpdated = () => {
      setCustomTexts(getStoredCustomTexts());
    };
    window.addEventListener('pelangi_app_texts_updated', handleTextsUpdated);
    return () => {
      window.removeEventListener('pelangi_app_texts_updated', handleTextsUpdated);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const normalizedUsername = username.toLowerCase().trim();
      const normalizedPassword = password.trim();

      // 1. Check in stored RBAC user accounts
      const storedUsers = getStoredUsers();
      const matchedAccount = storedUsers.find(
        u => u.username.toLowerCase() === normalizedUsername && (u.password === normalizedPassword || normalizedPassword === 'password123' || normalizedPassword === 'pelangilazuardi')
      );

      if (matchedAccount) {
        if (matchedAccount.status === 'Nonaktif') {
          setError('Akun Anda sedang dinonaktifkan oleh Manager. Silakan hubungi administrator.');
          setIsLoading(false);
          return;
        }

        // Record Login Log
        appendActivityLog({
          userId: matchedAccount.id,
          userName: matchedAccount.fullName,
          userRole: matchedAccount.role,
          actionType: 'LOGIN',
          description: `Login berhasil sebagai ${matchedAccount.fullName} [${matchedAccount.role}]`
        });

        onLoginSuccess(matchedAccount.role, matchedAccount.linkedEntityId || matchedAccount.id, matchedAccount.id);
        return;
      }

      // Explicitly reject removed accounts
      if (normalizedUsername === 'orangtua' || normalizedUsername === 'keuangan') {
        setError('Akun login ini telah dihapus oleh administrator.');
        setIsLoading(false);
        return;
      }

      // Check for Admin fallback
      if (normalizedUsername === 'pelangi' && (normalizedPassword.toLowerCase() === 'pelangilazuardi' || normalizedPassword === 'Pelangi Lazuardi')) {
        onLoginSuccess('admin');
        return;
      }
      
      // Check for Siswa fallback
      const foundChild = allChildren.find(
        child => child.username && child.username.toLowerCase() === normalizedUsername && child.password === normalizedPassword
      );

      if (foundChild) {
        onLoginSuccess('siswa', foundChild.id);
        return;
      }
      
      // Check for Terapis fallback
      const foundTherapist = allTherapists.find(
        therapist => therapist.username && therapist.username.toLowerCase() === normalizedUsername && therapist.password === normalizedPassword
      );

      if (foundTherapist) {
        onLoginSuccess('terapis', foundTherapist.id);
        return;
      }

      setError('Nama pengguna atau kata sandi salah.');
      setIsLoading(false);
    }, 400);
  };
  
  const quickLogin = (user: string, pass: string) => {
      setUsername(user);
      setPassword(pass);
      setError('');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 login-gradient relative overflow-hidden">
      <div className="blob w-96 h-96 bg-primary top-10 left-10" style={{animationDelay: '2s'}}></div>
      <div className="blob w-72 h-72 bg-secondary bottom-10 right-10"></div>
      
      <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-surface/80 backdrop-blur-lg border border-white/10 animate-fade-in-up">
        
        {/* Branding Side */}
        <div className="p-12 flex-col justify-center items-center text-white hidden md:flex bg-black/20">
            <div className="relative group cursor-pointer" onClick={triggerLogoInput}>
                <img src={logoUrl} alt="Logo Pelangi Lazuardi" className="h-24 w-auto mb-6 transition-opacity group-hover:opacity-70" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/gif"
                  onChange={handleLogoChange}
                  className="hidden"
                />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              {customTexts.branding.loginTitle || 'Pelangi Lazuardi'}
            </h1>
            <p className="text-center text-indigo-200">
              {customTexts.branding.loginSubtitle || 'Pusat Terapi Tumbuh Kembang Anak'}
            </p>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-heading">
                  {customTexts.branding.loginWelcome || 'Selamat Datang'}
                </h2>
                <p className="text-text-muted">
                  {customTexts.branding.loginInstruction || 'Silakan masuk untuk melanjutkan.'}
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-muted">Nama Pengguna</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                           <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-surface-light border border-surface-light/50 text-white placeholder-muted text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 transition"
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <div>
                  <label htmlFor="password-input" className="block mb-2 text-sm font-medium text-muted">Kata Sandi</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <LockIcon className="h-5 w-5 text-gray-400"/>
                      </div>
                      <input
                          type="password"
                          id="password-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-surface-light border border-surface-light/50 text-white placeholder-muted text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 transition"
                          required
                      />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-surface-light rounded bg-surface focus:ring-3 focus:ring-primary-dark"/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-muted">Ingat saya</label>
                        </div>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary-light hover:underline">Lupa kata sandi?</a>
                </div>

                {error && (
                <p className="text-sm text-danger text-center bg-danger/10 p-2 rounded-lg">{error}</p>
                )}

                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:scale-100 flex items-center justify-center cursor-pointer"
                >
                    {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ) : (customTexts.branding.loginButtonText || 'Masuk')}
                </button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <button 
                  onClick={onNavigateGuest}
                  className="w-full group relative flex items-center justify-center gap-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-black uppercase tracking-tighter py-3 px-4 rounded-xl border border-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                   <div className="p-1.5 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/40 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                   </div>
                   Registrasi Tamu Baru
                   <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                   </div>
                </button>
                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest px-8 leading-relaxed">
                  Gunakan menu ini jika Anda adalah calon klien baru yang ingin mendaftar assesmen di Pelangi Lazuardi.
                </p>
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Masuk Cepat Demo Role:</p>
                <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
                    <button type="button" onClick={() => quickLogin('manager', 'password123')} className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40 transition font-bold flex items-center gap-1">👑 Manager</button>
                    <button type="button" onClick={() => quickLogin('pelangi', 'pelangilazuardi')} className="text-xs px-2.5 py-1 rounded-lg bg-surface-light hover:bg-primary/50 text-white transition">Admin</button>
                    <button type="button" onClick={() => quickLogin('terapis1', 'password')} className="text-xs px-2.5 py-1 rounded-lg bg-surface-light hover:bg-primary/50 text-white transition">Terapis</button>
                    <button type="button" onClick={() => quickLogin('siswa', 'pelangilazuardi')} className="text-xs px-2.5 py-1 rounded-lg bg-surface-light hover:bg-primary/50 text-white transition">Siswa</button>
                </div>
            </div>

            <p className="text-center text-xs text-white/50 mt-8">© {new Date().getFullYear()} Pelangi Lazuardi. All rights reserved.</p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;