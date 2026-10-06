import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  Star, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Reply, 
  HeartHandshake, 
  ShieldCheck, 
  Eye, 
  FileText, 
  Sparkles, 
  X, 
  Save, 
  User, 
  Calendar,
  ThumbsUp,
  Image as ImageIcon,
  MessageCircle,
  CornerDownRight,
  Filter
} from 'lucide-react';
import { Child, Therapist, UserRole, ParentComment, TherapistReply } from '../types';
import { 
  getStoredComments, 
  saveStoredComments, 
  addParentComment, 
  addTherapistReply,
  getCommentsForStudent
} from '../utils/parentCommentStorage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ParentCommentSectionProps {
  student: Child;
  selectedDate: string;
  therapyType?: string;
  therapistId?: string;
  therapists: Therapist[];
  userRole?: UserRole;
  loggedInUserId?: string | null;
  loggedInUser?: { name: string; photoUrl?: string; role?: string };
  onNavigateToHistoryTab?: () => void;
}

export const ParentCommentSection: React.FC<ParentCommentSectionProps> = ({
  student,
  selectedDate,
  therapyType = 'OT',
  therapistId,
  therapists,
  userRole = 'terapis',
  loggedInUserId,
  loggedInUser,
  onNavigateToHistoryTab
}) => {
  const [comments, setComments] = useState<ParentComment[]>([]);
  const [homeCondition, setHomeCondition] = useState('');
  const [visibleProgress, setVisibleProgress] = useState('');
  const [homeActivities, setHomeActivities] = useState('');
  const [question, setQuestion] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Quick reply state for therapists
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // File upload simulation
  const [uploadUrlInput, setUploadUrlInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load comments
  const loadComments = () => {
    const list = getCommentsForStudent(student.id);
    setComments(list);
  };

  useEffect(() => {
    loadComments();
    const handleUpdate = () => loadComments();
    window.addEventListener('pelangi360_comments_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_comments_updated', handleUpdate);
  }, [student.id]);

  // Determine current active therapist
  const activeTherapist = useMemo(() => {
    if (therapistId) {
      return therapists.find(t => t.id === therapistId);
    }
    return therapists[0];
  }, [therapistId, therapists]);

  // Determine user identity
  const isParent = userRole === 'orang_tua' || userRole === 'siswa';
  const isTherapist = userRole === 'terapis';
  const isManager = userRole === 'manager' || userRole === 'super_admin' || userRole === 'admin';

  // Current session comment (if any)
  const currentSessionComments = useMemo(() => {
    return comments.filter(c => c.studentId === student.id && c.sessionDate === selectedDate);
  }, [comments, student.id, selectedDate]);

  // Recent other comments for this student
  const pastStudentComments = useMemo(() => {
    return comments.filter(c => c.studentId === student.id && c.sessionDate !== selectedDate);
  }, [comments, student.id, selectedDate]);

  // Handle submit comment (or save draft)
  const handleSubmitComment = (isDraft: boolean = false) => {
    if (!homeCondition.trim() && !visibleProgress.trim() && !homeActivities.trim() && !question.trim()) {
      alert('Mohon isi minimal kondisi anak di rumah atau perkembangan yang terlihat.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const parentName = student.parentName 
        ? `${student.parentName} (Orang Tua ${student.name.split(' ')[0]})`
        : loggedInUser?.name || 'Orang Tua Siswa';

      addParentComment({
        sessionDate: selectedDate,
        therapyType,
        parentId: loggedInUserId || `parent-${student.id}`,
        parentName,
        studentId: student.id,
        studentName: student.name,
        homeCondition,
        visibleProgress,
        homeActivities,
        question,
        rating,
        attachments,
        isDraft
      });

      setIsSubmitting(false);
      setSubmitFeedback(isDraft ? 'Draft feedback keluarga berhasil disimpan!' : 'Feedback keluarga berhasil dikirimkan ke terapis!');
      
      if (!isDraft) {
        setHomeCondition('');
        setVisibleProgress('');
        setHomeActivities('');
        setQuestion('');
        setAttachments([]);
      }

      setTimeout(() => setSubmitFeedback(null), 4000);
      loadComments();
    }, 600);
  };

  // Handle submit reply by therapist
  const handleSubmitReply = (commentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    setTimeout(() => {
      const thName = loggedInUser?.name || activeTherapist?.name || 'Terapis Penanggung Jawab';
      const thId = loggedInUserId || activeTherapist?.id || 'T11';
      const thPhoto = loggedInUser?.photoUrl || activeTherapist?.photoUrl;

      addTherapistReply(commentId, {
        therapistId: thId,
        therapistName: thName,
        therapistPhoto: thPhoto,
        reply: replyText
      });

      setIsSubmittingReply(false);
      setReplyingCommentId(null);
      setReplyText('');
      loadComments();
    }, 500);
  };

  const handleAddSampleAttachment = (url: string) => {
    if (!attachments.includes(url)) {
      setAttachments([...attachments, url]);
    }
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {submitFeedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{submitFeedback}</span>
          </div>
          <button onClick={() => setSubmitFeedback(null)} className="p-1 text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 border border-teal-500/20 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  Komunikasi Dua Arah
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• Sesi Terapi {therapyType}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Komentar & Umpan Balik Orang Tua
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Jembatan komunikasi interaktif antara orang tua dan terapis agar stimulasi di rumah selaras dengan program terapi klinik {student.name}.
              </p>
            </div>
          </div>

          {onNavigateToHistoryTab && (
            <button
              onClick={onNavigateToHistoryTab}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-teal-600" />
              <span>Lihat Riwayat Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Layout 1 Kolom Saja: Form Feedback Keluarga & Riwayat Tanggapan */}
      <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
        {/* Form Komentar Orang Tua (1 Kolom) */}
        <div className="w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Formulir Komentar & Perkembangan Rumah
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Sesi: {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="space-y-5">
              {/* Field 1: Kondisi Anak di Rumah */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>1. Kondisi Anak di Rumah</span>
                  <span className="text-[10px] text-slate-400 font-normal">Contoh: "Anak terlihat lebih fokus saat belajar dan mulai mengikuti instruksi sederhana."</span>
                </label>
                <textarea
                  value={homeCondition}
                  onChange={(e) => setHomeCondition(e.target.value)}
                  placeholder="Ceritakan kondisi atau respon anak di rumah setelah sesi terapi..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Field 2: Perkembangan yang Terlihat */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>2. Perkembangan yang Terlihat</span>
                  <span className="text-[10px] text-slate-400 font-normal">Contoh: "Mulai berani berinteraksi dengan teman."</span>
                </label>
                <textarea
                  value={visibleProgress}
                  onChange={(e) => setVisibleProgress(e.target.value)}
                  placeholder="Ceritakan kemajuan atau perilaku positif yang terlihat di lingkungan rumah / sekolah..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Field 3: Pertanyaan untuk Terapis */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>3. Pertanyaan untuk Terapis</span>
                  <span className="text-[10px] text-slate-400 font-normal">Contoh: "Apakah latihan kontak mata perlu dilakukan setiap hari?"</span>
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ada kendala atau pertanyaan yang ingin dikonsultasikan dengan terapis penanggung jawab? Tuliskan di sini..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Field 4: Rating Sesi (1 - 5) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Rating Sesi
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluasi kepuasan Anda terhadap pelayanan dan arahan sesi ini (Skala 1–5).
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${star} Bintang`}
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            isFilled 
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]" 
                              : "text-slate-300 dark:text-slate-600"
                          )}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-mono font-bold text-sm text-amber-500">{rating}.0</span>
                </div>
              </div>

              {/* Field 5: Upload Lampiran (Foto, Video, Dokumen) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Upload Lampiran (Foto / Video / Dokumen)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>+ Lampirkan Foto / Video / Dokumen</span>
                  </button>
                </div>

                {attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={url} alt="Lampiran" className="w-20 h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                          title="Hapus lampiran"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada lampiran aktivitas dari rumah (Foto / Video / Dokumen).
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSubmitComment(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-slate-400" />
                  <span>Simpan Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitComment(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black tracking-wide shadow-lg shadow-teal-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Feedback Keluarga & Tanggapan Terapis (1 Kolom) */}
        <div className="w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Komentar & Umpan Balik Keluarga Terbaru
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                {currentSessionComments.length + pastStudentComments.length} Umpan Balik
              </span>
            </div>

            {/* List of comments */}
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              {currentSessionComments.length === 0 && pastStudentComments.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <MessageSquareHeart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Belum ada komentar untuk ananda {student.name}.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Orang tua dapat mengisi formulir di atas setelah membaca catatan terapi.
                  </p>
                </div>
              ) : (
                [...currentSessionComments, ...pastStudentComments].map((item) => (
                  <div 
                    key={item.id} 
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-4 hover:border-teal-500/40 transition-colors"
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                          {item.parentName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">
                            {item.parentName}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                              {item.therapyType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rating Badges */}
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono">
                          {item.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {item.homeCondition && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-1">
                            Kondisi Anak di Rumah:
                          </span>
                          <p className="leading-relaxed">{item.homeCondition}</p>
                        </div>
                      )}

                      {item.visibleProgress && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                            Perkembangan yang Terlihat:
                          </span>
                          <p className="leading-relaxed">{item.visibleProgress}</p>
                        </div>
                      )}

                      {item.homeActivities && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
                            Aktivitas yang Dilakukan di Rumah:
                          </span>
                          <p className="leading-relaxed">{item.homeActivities}</p>
                        </div>
                      )}

                      {item.question && (
                        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
                            Pertanyaan untuk Terapis:
                          </span>
                          <p className="leading-relaxed italic font-medium">"{item.question}"</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                            Lampiran Foto/Video ({item.attachments.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {item.attachments.map((att, i) => (
                              <a 
                                key={i} 
                                href={att} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-teal-500 transition-all"
                              >
                                <img src={att} alt="" className="w-14 h-14 object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Therapist Replies List */}
                    {item.replies && item.replies.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Tanggapan Terapis:
                        </span>
                        {item.replies.map((rep) => (
                          <div 
                            key={rep.id} 
                            className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 rounded-xl space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                {rep.therapistName}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(rep.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              {rep.reply}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tombol Balas (Untuk Terapis / Manager) */}
                    {(isTherapist || isManager) && (
                      <div className="pt-2">
                        {replyingCommentId === item.id ? (
                          <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Tuliskan tanggapan atau saran untuk ${item.parentName}...`}
                              rows={2}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingCommentId(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitReply(item.id)}
                                disabled={isSubmittingReply || !replyText.trim()}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {isSubmittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingCommentId(item.id);
                              setReplyText('');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Reply className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Balas Komentar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Sample Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h5 className="font-extrabold text-slate-900 dark:text-white text-base">
                Pilih atau Masukkan URL Lampiran
              </h5>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih contoh foto dokumentasi stimulasi anak di rumah atau masukkan URL gambar / video:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Latihan Kontak Mata', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' },
                { label: 'Bermain Playdough', url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80' },
                { label: 'Sensory Bin Beras', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80' },
                { label: 'Mengerjakan Puzzle', url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80' }
              ].map((samp, i) => (
                <div 
                  key={i} 
                  onClick={() => handleAddSampleAttachment(samp.url)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-500 cursor-pointer group text-center"
                >
                  <img src={samp.url} alt="" className="w-full h-20 object-cover rounded-lg mb-1 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                    {samp.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Atau Tempel URL Gambar Kustom:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uploadUrlInput}
                  onChange={(e) => setUploadUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (uploadUrlInput.trim()) {
                      handleAddSampleAttachment(uploadUrlInput.trim());
                      setUploadUrlInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentCommentSection;
