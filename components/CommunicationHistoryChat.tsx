import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  User, 
  Clock, 
  Calendar, 
  Search, 
  Sparkles, 
  MessageSquare, 
  CheckCheck, 
  CornerDownRight, 
  Paperclip, 
  HeartHandshake, 
  Filter, 
  Download,
  ShieldCheck,
  Stethoscope,
  Smile,
  AlertCircle
} from 'lucide-react';
import { Child, Therapist, UserRole, ParentComment, TherapistReply } from '../types';
import { 
  getStoredComments, 
  saveStoredComments, 
  addParentComment, 
  addTherapistReply,
  getCommentsForStudent,
  getCommentsForSession
} from '../utils/parentCommentStorage';
import { getUserPhoto, getInitials } from '../utils/rbacStorage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  senderRole: 'terapis' | 'orang_tua' | 'manager';
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: string;
  rating?: number;
  attachments?: string[];
  sessionDate?: string;
  therapyType?: string;
  commentId?: string;
  sessionId?: string;
  therapistId?: string;
}

interface CommunicationHistoryChatProps {
  student: Child;
  therapists: Therapist[];
  userRole?: UserRole;
  loggedInUserId?: string | null;
  loggedInUser?: { name: string; photoUrl?: string; role?: string };
  sessionDate?: string;
  activeSession?: any;
  scheduledTherapist?: Therapist;
}

export const CommunicationHistoryChat: React.FC<CommunicationHistoryChatProps> = ({
  student,
  therapists,
  userRole = 'terapis',
  loggedInUserId,
  loggedInUser,
  sessionDate,
  activeSession,
  scheduledTherapist
}) => {
  const [comments, setComments] = useState<ParentComment[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load comments strictly filtered by this schedule date & scheduled therapist
  const loadData = () => {
    if (sessionDate) {
      const list = getCommentsForSession(
        student.id,
        sessionDate,
        scheduledTherapist?.id || activeSession?.therapistId,
        activeSession?.id,
        activeSession?.type
      );
      setComments(list);
    } else {
      const list = getCommentsForStudent(student.id);
      setComments(list);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('pelangi360_comments_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_comments_updated', handleUpdate);
  }, [student.id, sessionDate, activeSession?.id, activeSession?.type, activeSession?.therapistId, scheduledTherapist?.id]);

  // Transform comments and replies for this specific schedule into chronological conversation messages
  const chatMessages: ChatMessage[] = useMemo(() => {
    const list: ChatMessage[] = [];
    const currentTherapistId = scheduledTherapist?.id || activeSession?.therapistId;

    comments.forEach(c => {
      // 1. Parent main message
      const combinedText = [
        c.comment,
        c.homeCondition && c.homeCondition !== c.comment ? `Kondisi di Rumah: ${c.homeCondition}` : '',
        c.visibleProgress ? `Perkembangan yang Terlihat: ${c.visibleProgress}` : '',
        c.homeActivities && !c.homeActivities.startsWith('Percakapan sesi') ? `Aktivitas di Rumah: ${c.homeActivities}` : '',
        c.question ? `Pertanyaan untuk Terapis: "${c.question}"` : ''
      ].filter(Boolean).join('\n\n');

      if (combinedText.trim()) {
        list.push({
          id: `cmt-${c.id}`,
          senderRole: 'orang_tua',
          senderName: c.parentName || `Orang Tua ${student.name.split(' ')[0]}`,
          senderPhoto: c.parentPhoto || getUserPhoto(c.parentId) || (userRole === 'orang_tua' || userRole === 'siswa' ? loggedInUser?.photoUrl : undefined),
          text: combinedText,
          timestamp: c.createdAt,
          rating: c.rating,
          attachments: c.attachments,
          sessionDate: c.sessionDate,
          therapyType: c.therapyType,
          commentId: c.id,
          sessionId: c.sessionId,
          therapistId: c.therapistId
        });
      }

      // 2. Therapist replies - strictly isolate to the scheduled therapist if specified
      if (c.replies && c.replies.length > 0) {
        c.replies.forEach(r => {
          if (currentTherapistId && r.therapistId && r.therapistId !== currentTherapistId) {
            return; // Skip replies from a different therapist
          }
          list.push({
            id: `rep-${r.id}`,
            senderRole: 'terapis',
            senderName: r.therapistName,
            senderPhoto: r.therapistPhoto,
            text: r.reply,
            timestamp: r.createdAt,
            therapyType: c.therapyType,
            commentId: c.id,
            sessionId: c.sessionId,
            therapistId: r.therapistId
          });
        });
      }
    });

    // Sort chronologically
    return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [comments, student, scheduledTherapist?.id, activeSession?.therapistId]);

  // Filter messages by search and sender type
  const filteredMessages = useMemo(() => {
    return chatMessages.filter(m => {
      const matchSearch = !searchQuery || 
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterType === 'ALL' || 
        (filterType === 'PARENT' && m.senderRole === 'orang_tua') ||
        (filterType === 'THERAPIST' && m.senderRole === 'terapis');
      return matchSearch && matchFilter;
    });
  }, [chatMessages, searchQuery, filterType]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const isParentRole = userRole === 'orang_tua' || userRole === 'siswa';
    const effectiveDate = sessionDate || new Date().toISOString().split('T')[0];
    const effectiveType = activeSession?.type || 'OT';
    const effectiveTherapistId = scheduledTherapist?.id || activeSession?.therapistId || 'T11';

    if (isParentRole) {
      addParentComment({
        sessionId: activeSession?.id,
        sessionDate: effectiveDate,
        therapyType: effectiveType,
        therapistId: effectiveTherapistId,
        parentId: loggedInUserId || `parent-${student.id}`,
        parentName: loggedInUser?.name || student.parentName || `Keluarga ${student.name.split(' ')[0]}`,
        parentPhoto: loggedInUser?.photoUrl,
        studentId: student.id,
        studentName: student.name,
        comment: inputText,
        homeCondition: inputText,
        homeActivities: `Percakapan sesi ${effectiveType} • ${effectiveDate}`,
        question: '',
        rating: 5
      });
    } else {
      // Find latest comment in this session to reply to, or create one
      const targetComment = comments[comments.length - 1] || comments[0];
      if (targetComment) {
        addTherapistReply(targetComment.id, {
          therapistId: scheduledTherapist?.id || loggedInUserId || effectiveTherapistId,
          therapistName: scheduledTherapist?.name || loggedInUser?.name || 'Terapis Penanggung Jawab',
          therapistPhoto: scheduledTherapist?.photoUrl || loggedInUser?.photoUrl,
          reply: inputText
        });
      } else {
        // Fallback create comment thread and reply for this session schedule
        const newCmt = addParentComment({
          sessionId: activeSession?.id,
          sessionDate: effectiveDate,
          therapyType: effectiveType,
          therapistId: effectiveTherapistId,
          parentId: `parent-${student.id}`,
          parentName: student.parentName || `Keluarga ${student.name.split(' ')[0]}`,
          studentId: student.id,
          studentName: student.name,
          comment: '',
          homeCondition: '',
          homeActivities: '',
          question: '',
          rating: 5
        });
        addTherapistReply(newCmt.id, {
          therapistId: scheduledTherapist?.id || loggedInUserId || effectiveTherapistId,
          therapistName: scheduledTherapist?.name || loggedInUser?.name || 'Terapis Penanggung Jawab',
          therapistPhoto: scheduledTherapist?.photoUrl || loggedInUser?.photoUrl,
          reply: inputText
        });
      }
    }

    setInputText('');
    loadData();
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatIndonesianDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatMessageDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[750px]">
      {/* Top Chat Header */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img 
              src={student.photoUrl || `https://i.pravatar.cc/100?u=${student.id}`} 
              alt={student.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                Forum Komunikasi • {student.name}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Live Thread
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Percakapan dua arah terapis dan keluarga ({chatMessages.length} pesan pada jadwal ini)
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={cn("px-2.5 py-1 rounded-lg transition-all cursor-pointer", filterType === 'ALL' ? "bg-white dark:bg-slate-900 shadow-xs text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400")}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('PARENT')}
              className={cn("px-2.5 py-1 rounded-lg transition-all cursor-pointer", filterType === 'PARENT' ? "bg-white dark:bg-slate-900 shadow-xs text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400")}
            >
              Keluarga
            </button>
            <button
              onClick={() => setFilterType('THERAPIST')}
              className={cn("px-2.5 py-1 rounded-lg transition-all cursor-pointer", filterType === 'THERAPIST' ? "bg-white dark:bg-slate-900 shadow-xs text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400")}
            >
              Terapis
            </button>
          </div>
        </div>
      </div>

      {/* Schedule & Therapist Context Info Bar */}
      <div className="px-5 py-3 bg-teal-500/10 dark:bg-teal-950/40 border-b border-teal-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-teal-500/20 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{sessionDate ? formatIndonesianDate(sessionDate) : 'Hari Ini'}</span>
          </div>
          {activeSession?.time && (
            <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeSession.time}</span>
            </div>
          )}
          {activeSession?.type && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-teal-600 text-white shadow-2xs">
              {activeSession.type}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>{scheduledTherapist?.name || therapists.find(t => t.id === activeSession?.therapistId)?.name || 'Terapis Penanggung Jawab'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/70 px-2.5 py-1 rounded-full border border-teal-500/30">
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          <span>Terkunci Pada Jadwal & Terapis Ini</span>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]/50 dark:bg-slate-950/40 custom-scrollbar">
        {filteredMessages.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto ring-4 ring-teal-500/5 shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                Belum Ada Forum Komunikasi pada Jadwal Ini
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Forum komunikasi khusus untuk jadwal <span className="font-bold text-slate-700 dark:text-slate-300">{sessionDate ? formatIndonesianDate(sessionDate) : 'hari ini'}</span> bersama terapis <span className="font-bold text-slate-700 dark:text-slate-300">{scheduledTherapist?.name || therapists.find(t => t.id === activeSession?.therapistId)?.name || 'terapis penanggung jawab'}</span> ({activeSession?.type || 'Terapi'}).
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 text-left">
              💬 <span className="font-bold">Info Jadwal:</span> Forum komunikasi hanya tersimpan dan ditampilkan pada hari serta jadwal terapis yang bersangkutan. Jika membuka hari atau jadwal terapis berbeda, forum komunikasi hanya menampilkan percakapan pada jadwal tersebut.
            </div>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isTherapist = msg.senderRole === 'terapis';
            const isParent = msg.senderRole === 'orang_tua';

            return (
              <div 
                key={msg.id || index}
                className={cn(
                  "flex items-start gap-3 max-w-2xl",
                  isParent ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.senderPhoto ? (
                    <img 
                      src={msg.senderPhoto} 
                      alt="" 
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                    />
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs select-none",
                      isTherapist ? "bg-indigo-600" : "bg-teal-600"
                    )}>
                      {isTherapist ? <Stethoscope className="w-4 h-4" /> : getInitials(msg.senderName)}
                    </div>
                  )}
                </div>

                {/* Bubble Container */}
                <div className={cn("space-y-1", isParent ? "items-end text-right" : "items-start text-left")}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                      {msg.senderName}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                      isTherapist 
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                    )}>
                      {isTherapist ? 'Terapis' : 'Orang Tua'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line",
                    isParent 
                      ? "bg-teal-600 text-white rounded-tr-xs" 
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs"
                  )}>
                    {msg.text}

                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-current/20 flex flex-wrap gap-2">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att} target="_blank" rel="noreferrer" className="rounded-lg overflow-hidden block">
                            <img src={att} alt="" className="w-16 h-16 object-cover hover:scale-105 transition-transform" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                    <span>{formatMessageDate(msg.timestamp)}</span>
                    {msg.therapyType && <span>• Modus {msg.therapyType}</span>}
                    <CheckCheck className="w-3 h-3 text-teal-500" />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Templates */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
        <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Template Cepat:
        </span>
        {[
          "Hari ini anak mampu mengikuti instruksi 2 langkah.",
          "Di rumah juga terlihat lebih responsif dan tenang.",
          "Silakan lanjutkan latihan kontak mata yang sudah diberikan 10-15 menit.",
          "Anak sangat antusias setelah sesi terapi hari ini."
        ].map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(tmpl)}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors shrink-0 text-left truncate max-w-[240px] cursor-pointer"
          >
            {tmpl}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              userRole === 'orang_tua' || userRole === 'siswa'
                ? `Kirim pesan atau kabar perkembangan ${student.name.split(' ')[0]} di rumah...`
                : `Tulis tanggapan atau instruksi stimulasi untuk orang tua ${student.name.split(' ')[0]}...`
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-600/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CommunicationHistoryChat;
