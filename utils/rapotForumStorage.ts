import { RapotForumMessage } from '../types';

const RAPOT_FORUM_STORAGE_KEY = 'pelangi360_rapot_forum_messages_v1';

export const INITIAL_FORUM_MESSAGES: RapotForumMessage[] = [
  {
    id: 'rfm-001',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    therapyType: 'OT',
    category: 'Review Rapot',
    senderId: 'USR-ASR-01',
    senderName: 'Dr. Dian Kusumawardhani, Sp.KFR',
    senderRole: 'assessor',
    senderRoleLabel: 'Assessor Medis (Sp.KFR)',
    senderPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    message: 'Selamat pagi rekan-rekan terapis. Saya telah meninjau draft Rapot Terapi Ananda Adriel periode Jan-Jun 2025. Pada bagian Sensori Modulasi (ketinggian dan objek bergoyang), ananda menunjukkan transisi dari Respon Berlebih (BR) ke Sedang (S). Mohon konfirmasi apakah ananda masih membutuhkan pendampingan khusus saat transisi aktivitas vestibular?',
    timestamp: '2026-09-30 08:30 WIB',
    statusBadge: 'Perlu Ditinjau',
    reactions: {
      '👍': ['Rilla Serando, S.Tr.Kes', 'Adisty Ayuningtyas, A.Md.TW'],
      '✅': ['Ibu Nurul Aini (Manager)']
    }
  },
  {
    id: 'rfm-002',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    therapyType: 'OT',
    category: 'Catatan Klinis',
    senderId: 'USR-TRP-01',
    senderName: 'Rilla Serando, S.Tr.Kes',
    senderRole: 'terapis',
    senderRoleLabel: 'Terapis Okupasi',
    senderPhoto: 'https://images.unsplash.com/photo-1594824813524-1e0e85497d39?w=150&auto=format&fit=crop&q=80',
    replyToId: 'rfm-001',
    replyToSnippet: 'Mohon konfirmasi apakah ananda masih membutuhkan pendampingan khusus saat transisi aktivitas vestibular?',
    replyToSender: 'Dr. Dian Kusumawardhani, Sp.KFR',
    message: 'Selamat pagi Dokter Dian. Untuk vestibular linear (ayunan bolak-balik) ananda sudah mandiri dan mampu regulasi diri dengan baik. Namun pada stimulasi rotasi (ayunan berputar), ananda masih perlu supervisi fisik 1:1 sekitar 20-30 detik pertama untuk mencegah over-eksitasi. Saya sudah mencantumkan catatan ini pada komentar modulasi sensori di formulir rapot.',
    timestamp: '2026-09-30 09:12 WIB',
    statusBadge: 'Sudah Ditanggapi',
    reactions: {
      '✅': ['Dr. Dian Kusumawardhani, Sp.KFR'],
      '👏': ['Ibu Nurul Aini (Manager)']
    }
  },
  {
    id: 'rfm-003',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    therapyType: 'TW',
    category: 'Konsultasi Kasus',
    senderId: 'USR-TRP-02',
    senderName: 'Adisty Ayuningtyas, A.Md.TW',
    senderRole: 'terapis',
    senderRoleLabel: 'Terapis Wicara',
    senderPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    message: 'Menyambung diskusi perkembangan Adriel: Pada sesi Terapi Wicara, fokus dan kontak mata ananda meningkat drastis setelah sesi Okupasi Terapi dengan sensory diet taktil & proprioseptif. Produksi ujaran 2-3 kata operasional ("mau main bola", "buka pintu") konsisten teramati. Di draft rapot wicara, capaian pragmatik sudah saya masukkan dalam kategori Memadai (MD).',
    timestamp: '2026-09-30 10:05 WIB',
    reactions: {
      '❤️': ['Rilla Serando, S.Tr.Kes'],
      '👍': ['Dr. Dian Kusumawardhani, Sp.KFR']
    }
  },
  {
    id: 'rfm-004',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    therapyType: 'OT',
    category: 'Rekomendasi',
    senderId: 'USR-ASR-01',
    senderName: 'Dr. Dian Kusumawardhani, Sp.KFR',
    senderRole: 'assessor',
    senderRoleLabel: 'Assessor Medis (Sp.KFR)',
    senderPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    message: 'Sangat baik, terima kasih atas koordinasi multi-disiplin Mbak Rilla dan Mbak Adisty. Untuk bagian Home Program pada rapot, disarankan menambahkan aktivitas deep pressure (pemberian tekanan dalam dengan selimut tebal/gym ball) sebelum waktu tidur ananda di rumah untuk mendukung kualitas tidur dan fokus pagi hari di sekolah.',
    timestamp: '2026-09-30 11:20 WIB',
    statusBadge: 'Rekomendasi ACC',
    reactions: {
      '📌': ['Rilla Serando, S.Tr.Kes', 'Adisty Ayuningtyas, A.Md.TW']
    }
  },
  {
    id: 'rfm-005',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    therapyType: 'OT',
    category: 'Sign-Off Rapot',
    senderId: 'USR-MGR-01',
    senderName: 'Ibu Nurul Aini (Manager)',
    senderRole: 'manager',
    senderRoleLabel: 'Manager Klinik',
    senderPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    message: 'Terima kasih Dokter Dian dan tim terapis. Draft rapot Adriel untuk Okupasi dan Wicara sudah saya periksa bersama penyesuaian home program di atas. Rapot telah disetujui secara klinis dan siap ditandatangani serta dicetak untuk agenda penyerahan evaluasi semester bersama orang tua.',
    timestamp: '2026-09-30 13:45 WIB',
    statusBadge: 'Disetujui',
    reactions: {
      '🎉': ['Dr. Dian Kusumawardhani, Sp.KFR', 'Rilla Serando, S.Tr.Kes', 'Adisty Ayuningtyas, A.Md.TW'],
      '✅': ['Admin Operasional Pelangi']
    }
  },
  {
    id: 'rfm-006',
    studentId: 'C-CAHYA',
    studentName: 'Cahya Maulana',
    therapyType: 'TW',
    category: 'Review Rapot',
    senderId: 'USR-TRP-02',
    senderName: 'Adisty Ayuningtyas, A.Md.TW',
    senderRole: 'terapis',
    senderRoleLabel: 'Terapis Wicara',
    senderPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    message: 'Konsultasi untuk rapot Ananda Cahya: Indikator artikulasi fonem bilabial (/b/, /p/, /m/) sudah tercapai optimal. Apakah pada rapot semester ini perlu disertakan rekomendasi stimulasi lingual-alveolar (/t/, /d/, /n/) sebagai target semester ganjil mendatang?',
    timestamp: '2026-10-01 07:15 WIB',
    statusBadge: 'Perlu Ditinjau',
    reactions: {
      '💬': ['Dr. Dian Kusumawardhani, Sp.KFR']
    }
  },
  {
    id: 'rfm-007',
    studentId: 'C-CAHYA',
    studentName: 'Cahya Maulana',
    therapyType: 'TW',
    category: 'Rekomendasi',
    senderId: 'USR-ASR-01',
    senderName: 'Dr. Dian Kusumawardhani, Sp.KFR',
    senderRole: 'assessor',
    senderRoleLabel: 'Assessor Medis (Sp.KFR)',
    senderPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    replyToId: 'rfm-006',
    replyToSnippet: 'Apakah pada rapot semester ini perlu disertakan rekomendasi stimulasi lingual-alveolar...',
    replyToSender: 'Adisty Ayuningtyas, A.Md.TW',
    message: 'Tepat sekali Mbak Adisty. Cantumkan sebagai target follow-up prioritas di poin E. FOLLOW UP. Ananda memiliki kekuatan motorik lidah yang cukup baik, sehingga target lingual-alveolar sangat rasional untuk semester depan.',
    timestamp: '2026-10-01 08:00 WIB',
    statusBadge: 'Disetujui',
    reactions: {
      '👍': ['Adisty Ayuningtyas, A.Md.TW']
    }
  }
];

export const getStoredForumMessages = (): RapotForumMessage[] => {
  try {
    const raw = localStorage.getItem(RAPOT_FORUM_STORAGE_KEY);
    if (!raw) {
      saveStoredForumMessages(INITIAL_FORUM_MESSAGES);
      return INITIAL_FORUM_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FORUM_MESSAGES;
  } catch (err) {
    console.error('Error loading rapot forum messages:', err);
    return INITIAL_FORUM_MESSAGES;
  }
};

export const saveStoredForumMessages = (messages: RapotForumMessage[]): void => {
  try {
    localStorage.setItem(RAPOT_FORUM_STORAGE_KEY, JSON.stringify(messages));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pelangi360_rapot_forum_updated', { detail: messages }));
    }
  } catch (err) {
    console.error('Error saving rapot forum messages:', err);
  }
};

export const addForumMessage = (
  msgData: Omit<RapotForumMessage, 'id' | 'timestamp'>
): RapotForumMessage => {
  const current = getStoredForumMessages();
  
  const now = new Date();
  const timeFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const newMessage: RapotForumMessage = {
    ...msgData,
    id: `rfm-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: timeFormatted,
    reactions: msgData.reactions || {}
  };

  const updated = [newMessage, ...current];
  saveStoredForumMessages(updated);
  return newMessage;
};

export const deleteForumMessage = (messageId: string): boolean => {
  const current = getStoredForumMessages();
  const updated = current.filter(m => m.id !== messageId);
  saveStoredForumMessages(updated);
  return true;
};

export const toggleMessageReaction = (
  messageId: string, 
  emoji: string, 
  userName: string
): RapotForumMessage | null => {
  const current = getStoredForumMessages();
  const index = current.findIndex(m => m.id === messageId);
  if (index === -1) return null;

  const msg = current[index];
  const reactions = { ...(msg.reactions || {}) };
  const userList = reactions[emoji] ? [...reactions[emoji]] : [];

  const userIdx = userList.indexOf(userName);
  if (userIdx !== -1) {
    // Remove reaction
    userList.splice(userIdx, 1);
    if (userList.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = userList;
    }
  } else {
    // Add reaction
    userList.push(userName);
    reactions[emoji] = userList;
  }

  const updatedMsg: RapotForumMessage = {
    ...msg,
    reactions
  };

  current[index] = updatedMsg;
  saveStoredForumMessages(current);
  return updatedMsg;
};

export const getForumMessagesForStudent = (studentId?: string): RapotForumMessage[] => {
  const all = getStoredForumMessages();
  if (!studentId || studentId === 'all') return all;
  return all.filter(m => m.studentId === studentId);
};
