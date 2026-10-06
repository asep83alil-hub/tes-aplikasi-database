import { ParentComment, TherapistReply } from '../types';

const COMMENTS_STORAGE_KEY = 'pelangi360_parent_comments_v2';
const NOTIFICATIONS_STORAGE_KEY = 'pelangi360_system_notifications_v1';

export const INITIAL_PARENT_COMMENTS: ParentComment[] = [
  {
    id: 'cmt-cahya-01',
    therapyNoteId: 'note-cahya-tw-01',
    sessionId: 'sess-cahya-tw-1',
    sessionDate: '2026-09-29',
    therapyType: 'TW',
    therapistId: 'T12',
    studentId: 'C-CAHYA',
    studentName: 'Cahya Maulana',
    parentId: 'parent-cahya',
    parentName: 'Ibu Ratna Maulana (Mama Cahya)',
    comment: 'Setelah sesi terapi wicara kemarin, Cahya terlihat lebih aktif merespon panggilan namanya dan berusaha meniru kata-kata sederhana.',
    homeCondition: 'Anak terlihat lebih fokus saat belajar dan mulai mengikuti instruksi sederhana.',
    visibleProgress: 'Mulai berani berinteraksi dengan teman dan merespons panggilan nama lebih cepat.',
    homeActivities: 'Kami sudah melatih kontak mata dan latihan tiup balon/sedotan sesuai arahan terapis.',
    question: 'Apakah latihan kontak mata perlu dilakukan setiap hari?',
    rating: 5,
    attachments: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Sudah Dibalas',
    isDraft: false,
    createdAt: '2026-09-29T10:30:00.000Z',
    replies: [
      {
        id: 'rep-cahya-01',
        commentId: 'cmt-cahya-01',
        therapistId: 'T12',
        therapistName: 'Adisty Ayuningtyas, A.Md.TW',
        therapistPhoto: 'https://i.pravatar.cc/100?u=therapist1',
        reply: 'Terima kasih atas informasinya Ibu Ratna. Senang sekali mendengar kemajuan ananda Cahya! Betul Bu, latihan oral motorik dan kontak mata dapat dilakukan 10–15 menit setiap hari sebelum jam makan agar otot bibir dan artikulasi lebih siap.',
        createdAt: '2026-09-29T11:15:00.000Z'
      }
    ]
  },
  {
    id: 'cmt-adriel-01',
    therapyNoteId: 'note-adriel-ot-01',
    sessionId: 'sess-adriel-ot-1',
    sessionDate: '2026-09-28',
    therapyType: 'OT',
    therapistId: 'T11',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    parentId: 'parent-adriel',
    parentName: 'Djuliani Djumhani Djoewarsa (Mama Adriel)',
    comment: 'Adriel terlihat jauh lebih tenang dan fokus saat menyelesaikan pekerjaan dan bermain bersama kakaknya.',
    homeCondition: 'Kondisi Adriel di rumah semakin adaptif. Saat transisi aktivitas tidak lagi mengalami tantrum seperti minggu lalu.',
    homeActivities: 'Kami sudah melatih kontak mata dan bermain playdough untuk melatih kekuatan motorik halus sesuai arahan terapis.',
    question: 'Apakah ananda sudah boleh diperkenalkan dengan aktivitas gunting kertas sederhana di rumah?',
    rating: 5,
    attachments: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Sudah Dibalas',
    isDraft: false,
    createdAt: '2026-09-28T09:30:00.000Z',
    replies: [
      {
        id: 'rep-adriel-01',
        commentId: 'cmt-adriel-01',
        therapistId: 'T11',
        therapistName: 'Rilla Serando, S.Tr.Kes',
        therapistPhoto: 'https://i.pravatar.cc/100?u=therapist0',
        reply: 'Alhamdulillah, progres yang sangat membahagiakan Mama Adriel. Hari ini anak berhasil mempertahankan kontak mata selama 5 detik. Silakan lanjutkan latihan yang sudah diberikan di rumah ya Bu!',
        createdAt: '2026-09-28T10:15:00.000Z'
      }
    ]
  },
  {
    id: 'cmt-adriel-tw-01',
    therapyNoteId: 'note-adriel-tw-01',
    sessionId: 'sess-adriel-tw-1',
    sessionDate: '2026-09-28',
    therapyType: 'TW',
    therapistId: 'T12',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    parentId: 'parent-adriel',
    parentName: 'Djuliani Djumhani Djoewarsa (Mama Adriel)',
    comment: 'Di rumah Adriel mulai senang meniru pelafalan suku kata sederhana saat diajak membaca cerita bergambar.',
    homeCondition: 'Adriel lebih responsif ketika diajak bercerita dan melafalkan vokal dasar A-I-U-E-O.',
    homeActivities: 'Latihan pengucapan vokal dan meniup gelembung sabun di teras rumah.',
    question: 'Apakah latihan meniup perlu ditambah variasinya?',
    rating: 5,
    attachments: [],
    status: 'Sudah Dibalas',
    isDraft: false,
    createdAt: '2026-09-28T12:00:00.000Z',
    replies: [
      {
        id: 'rep-adriel-tw-01',
        commentId: 'cmt-adriel-tw-01',
        therapistId: 'T12',
        therapistName: 'Adisty Ayuningtyas, A.Md.TW',
        therapistPhoto: 'https://i.pravatar.cc/100?u=therapist1',
        reply: 'Bagus sekali Mama Adriel! Di sesi TW hari ini artikulasi vokal ananda sudah semakin jelas. Untuk meniup bisa divariasikan dengan meniup lilin dari jarak aman atau meniup bola kapas kecil di atas meja.',
        createdAt: '2026-09-28T12:45:00.000Z'
      }
    ]
  },
  {
    id: 'cmt-kevin-01',
    therapyNoteId: 'note-kevin-si-01',
    sessionId: 'sess-kevin-si-1',
    sessionDate: '2026-09-29',
    therapyType: 'SI',
    therapistId: 'T11',
    studentId: 'C102',
    studentName: 'Kevin Pratama',
    parentId: 'parent-kevin',
    parentName: 'Ibu Susanti (Mama Kevin)',
    comment: 'Kevin masih agak sensitif dengan tekstur basah/lengket di tangan.',
    homeCondition: 'Setelah sesi terapi SI, Kevin tidur lebih nyenyak malam hari. Namun masih ragu menyentuh slime/bubur beras.',
    homeActivities: 'Sudah mencoba latihan sensory bin menggunakan beras kering dan kacang hijau sesuai jadwal rumah.',
    question: 'Bagaimana cara mengatasi penolakan saat tangan anak terkena lem ketika mewarnai?',
    rating: 4,
    attachments: [],
    status: 'Menunggu Tanggapan',
    isDraft: false,
    createdAt: '2026-09-29T08:15:00.000Z',
    replies: []
  },
  {
    id: 'cmt-bunga-01',
    therapyNoteId: 'note-bunga-ft-01',
    sessionId: 'sess-bunga-ft-1',
    sessionDate: '2026-09-27',
    therapyType: 'FT',
    therapistId: 'T13',
    studentId: 'C103',
    studentName: 'Bunga Santoso',
    parentId: 'parent-bunga',
    parentName: 'Ibu Maria Santoso (Mama Bunga)',
    comment: 'Keseimbangan saat naik turun tangga sudah mulai stabil tanpa berpegangan terlalu erat.',
    homeCondition: 'Anak sangat ceria dan antusias setelah sesi latihan keseimbangan.',
    homeActivities: 'Jalan di atas garis lurus di lantai ubin dan latihan berdiri satu kaki 5 detik.',
    question: 'Apakah perlu sepatu khusus ortopedi untuk latihan di luar rumah?',
    rating: 5,
    attachments: [],
    status: 'Sudah Dibalas',
    isDraft: false,
    createdAt: '2026-09-27T15:45:00.000Z',
    replies: [
      {
        id: 'rep-bunga-01',
        commentId: 'cmt-bunga-01',
        therapistId: 'T13',
        therapistName: 'Dr. Budi',
        therapistPhoto: 'https://i.pravatar.cc/100?u=therapist3',
        reply: 'Perkembangan postur Ananda Bunga sangat bagus Ibu Maria. Untuk saat ini cukup sepatu kets dengan bantalan sol yang fleksibel dan menopang tumit dengan baik, belum perlu sepatu ortopedi khusus. Lanjutkan latihan keseimbangan di rumah!',
        createdAt: '2026-09-27T17:10:00.000Z'
      }
    ]
  }
];

export function getStoredComments(): ParentComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_PARENT_COMMENTS));
      return INITIAL_PARENT_COMMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PARENT_COMMENTS;
  } catch (err) {
    console.error('Error loading comments from localStorage:', err);
    return INITIAL_PARENT_COMMENTS;
  }
}

export function saveStoredComments(comments: ParentComment[]): void {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    window.dispatchEvent(new CustomEvent('pelangi360_comments_updated', { detail: comments }));
  } catch (err) {
    console.error('Error saving comments to localStorage:', err);
  }
}

export function getCommentsForStudent(studentId: string): ParentComment[] {
  const all = getStoredComments();
  if (!studentId) return all;
  const normalizedId = studentId.toLowerCase();
  return all.filter(c => 
    c.studentId.toLowerCase() === normalizedId ||
    (c.studentName && c.studentName.toLowerCase().includes(normalizedId))
  );
}

export function getCommentsForSession(
  studentId: string, 
  sessionDate: string, 
  therapistId?: string, 
  sessionId?: string,
  therapyType?: string
): ParentComment[] {
  const list = getCommentsForStudent(studentId);
  return list.filter(c => {
    // 1. Must match exact date of the therapy schedule
    if (sessionDate) {
      if (!c.sessionDate || c.sessionDate !== sessionDate) {
        return false;
      }
    }

    // 2. Direct sessionId check: if both exist and don't match, exclude
    if (sessionId && c.sessionId && c.sessionId !== sessionId) {
      return false;
    }

    // 3. Therapist check: strictly isolate to scheduled therapist
    // Jika di hari yang berbeda dengan terapis berbeda maka riwayat komunikasi hanya di jadwal tersebut
    if (therapistId) {
      const isDirectTherapist = c.therapistId === therapistId;
      const hasTherapistReply = c.replies && c.replies.some(r => r.therapistId === therapistId);
      
      if (!isDirectTherapist && !hasTherapistReply) {
        return false;
      }
    }

    // 4. Therapy type check (e.g. OT vs TW vs FT)
    if (therapyType && c.therapyType) {
      if (c.therapyType.trim().toUpperCase() !== therapyType.trim().toUpperCase()) {
        return false;
      }
    }

    return true;
  });
}

export function addParentComment(data: {
  therapyNoteId?: string;
  sessionId?: string;
  sessionDate: string;
  therapyType?: string;
  therapistId?: string;
  parentId: string;
  parentName: string;
  parentPhoto?: string;
  studentId: string;
  studentName: string;
  comment?: string;
  homeCondition: string;
  visibleProgress?: string;
  homeActivities: string;
  question?: string;
  rating: number;
  attachments?: string[];
  isDraft?: boolean;
}): ParentComment {
  const comments = getStoredComments();
  const id = `cmt-${Date.now()}`;
  
  const newComment: ParentComment = {
    id,
    therapyNoteId: data.therapyNoteId || `note-${data.studentId}-${Date.now()}`,
    sessionId: data.sessionId,
    sessionDate: data.sessionDate,
    therapyType: data.therapyType || 'OT',
    therapistId: data.therapistId,
    parentId: data.parentId,
    parentName: data.parentName,
    parentPhoto: data.parentPhoto,
    studentId: data.studentId,
    studentName: data.studentName,
    comment: data.comment || data.homeCondition,
    homeCondition: data.homeCondition,
    visibleProgress: data.visibleProgress || '',
    home_progress: data.homeCondition,
    homeActivities: data.homeActivities,
    activities_done: data.homeActivities,
    question: data.question || '',
    rating: data.rating || 5,
    attachments: data.attachments || [],
    status: data.isDraft ? 'Draft' : 'Menunggu Tanggapan',
    isDraft: !!data.isDraft,
    createdAt: new Date().toISOString(),
    replies: []
  };

  const updated = [newComment, ...comments];
  saveStoredComments(updated);

  // Dispatch Therapist Notification
  if (!data.isDraft) {
    dispatchNotification({
      category: 'komentar',
      title: 'Feedback Keluarga Masuk',
      description: `Keluarga dari ${data.studentName} telah memberikan feedback pada sesi terapi terbaru.`,
      targetView: 'bukuCatatanTerapi'
    });
  }

  return newComment;
}

export function addTherapistReply(commentId: string, replyData: {
  therapistId: string;
  therapistName: string;
  therapistPhoto?: string;
  reply: string;
}): TherapistReply | null {
  const comments = getStoredComments();
  const index = comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;

  const replyObj: TherapistReply = {
    id: `rep-${Date.now()}`,
    commentId,
    therapistId: replyData.therapistId,
    therapistName: replyData.therapistName,
    therapistPhoto: replyData.therapistPhoto || `https://i.pravatar.cc/100?u=${replyData.therapistId}`,
    reply: replyData.reply,
    createdAt: new Date().toISOString()
  };

  const current = comments[index];
  const updatedReplies = [...(current.replies || []), replyObj];

  comments[index] = {
    ...current,
    status: 'Sudah Dibalas',
    replies: updatedReplies
  };

  saveStoredComments(comments);

  // Dispatch Parent Notification
  dispatchNotification({
    category: 'komentar',
    title: 'Tanggapan Terapis Diterima',
    description: `Terapis ${replyData.therapistName} telah membalas komentar Anda untuk ananda ${current.studentName}.`,
    targetView: 'bukuCatatanTerapi'
  });

  return replyObj;
}

export function notifyTherapyNoteCreated(studentName: string, dateStr: string): void {
  dispatchNotification({
    category: 'komentar',
    title: 'Catatan Terapi Terbaru',
    description: `Catatan terapi terbaru telah tersedia.`,
    targetView: 'bukuCatatanTerapi'
  });
}

function formatDateSimple(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function dispatchNotification(notif: {
  category: 'komentar' | 'jadwal' | 'assessment' | 'pembayaran' | 'program' | 'kpi';
  title: string;
  description: string;
  targetView: string;
}): void {
  try {
    const item = {
      id: `notif-${Date.now()}`,
      category: notif.category,
      title: notif.title,
      description: notif.description,
      time: 'Baru saja',
      isRead: false,
      targetView: notif.targetView
    };

    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let list = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch {}
    }
    list = [item, ...list];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('pelangi360_new_notification', { detail: item }));
  } catch (e) {
    console.error('Error dispatching notification:', e);
  }
}

export function getFeedbackStats() {
  const comments = getStoredComments();
  const nonDrafts = comments.filter(c => !c.isDraft);
  const totalComments = nonDrafts.length;
  const pendingReplies = nonDrafts.filter(c => c.status === 'Menunggu Tanggapan' || c.replies.length === 0).length;
  const replied = nonDrafts.filter(c => c.replies.length > 0);

  const ratingsSum = nonDrafts.reduce((acc, c) => acc + (c.rating || 5), 0);
  const averageRating = totalComments > 0 ? (ratingsSum / totalComments).toFixed(1) : '5.0';

  // Unique parents commenting
  const uniqueStudents = new Set(nonDrafts.map(c => c.studentId));
  const activeParentPercentage = Math.min(100, Math.round((uniqueStudents.size / 10) * 100)) || 85;

  return {
    totalComments,
    newComments: nonDrafts.filter(c => {
      const diffHours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      return diffHours < 48;
    }).length || 2,
    pendingReplies,
    averageRating: parseFloat(averageRating),
    activeParentPercentage,
    commentsThisMonth: totalComments,
    unresolvedComments: pendingReplies
  };
}
