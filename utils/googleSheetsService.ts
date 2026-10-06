import { getGoogleAccessToken } from './googleAuth';
import { Child, Therapist, RegistrationRecord, FinancialRecord, AttendanceStatus, TherapyProgram } from '../types';

export interface LinkedSpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  lastSyncedAt?: string;
  sheets?: string[];
}

const STORAGE_KEY_SPREADSHEET_ID = 'pelangi360_google_spreadsheet_id';
const STORAGE_KEY_SPREADSHEET_META = 'pelangi360_google_spreadsheet_meta';

export const getStoredSpreadsheetId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID);
  } catch {
    return null;
  }
};

export const setStoredSpreadsheetId = (id: string | null) => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
    }
  } catch (err) {
    console.error('Error saving spreadsheet id', err);
  }
};

export const getStoredSpreadsheetMeta = (): LinkedSpreadsheetInfo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPREADSHEET_META);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSpreadsheetMeta = (meta: LinkedSpreadsheetInfo | null) => {
  try {
    if (meta) {
      localStorage.setItem(STORAGE_KEY_SPREADSHEET_META, JSON.stringify(meta));
    } else {
      localStorage.removeItem(STORAGE_KEY_SPREADSHEET_META);
    }
  } catch (err) {
    console.error('Error saving spreadsheet meta', err);
  }
};

export interface SyncPayload {
  children: Child[];
  therapists: Therapist[];
  registrations: RegistrationRecord[];
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  financialData: { [key: string]: FinancialRecord[] };
  therapyPrograms?: TherapyProgram[];
}

/**
 * Creates a brand new Google Spreadsheet configured with tabs for Pelangi Lazuardi
 */
export const createMasterSpreadsheet = async (customTitle?: string): Promise<LinkedSpreadsheetInfo> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const title = customTitle || `Database Terapi Pelangi Lazuardi - ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}`;
  
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title,
        locale: 'id_ID',
        timeZone: 'Asia/Jakarta'
      },
      sheets: [
        { properties: { title: 'Data_Anak', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Data_Terapis', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Sesi_Kehadiran', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Catatan_Terapi_Harian', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Program_Terapi', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Pendaftaran_Baru', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Laporan_Keuangan', gridProperties: { frozenRowCount: 1 } } }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat spreadsheet: ${response.statusText} (${errorText})`);
  }

  const data = await response.json();
  const info: LinkedSpreadsheetInfo = {
    id: data.spreadsheetId,
    title: data.properties.title,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    lastSyncedAt: new Date().toISOString(),
    sheets: data.sheets?.map((s: any) => s.properties.title) || []
  };

  setStoredSpreadsheetId(info.id);
  setStoredSpreadsheetMeta(info);
  return info;
};

/**
 * Validates and gets details of an existing Spreadsheet by ID
 */
export const fetchSpreadsheetDetails = async (spreadsheetId: string): Promise<LinkedSpreadsheetInfo> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const cleanId = spreadsheetId.includes('/d/') 
    ? (spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || spreadsheetId)
    : spreadsheetId.trim();

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties.title`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Tidak dapat mengakses spreadsheet (Pastikan ID benar dan akun memiliki akses): ${err}`);
  }

  const data = await response.json();
  const info: LinkedSpreadsheetInfo = {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Google Sheet Pelangi Lazuardi',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets: data.sheets?.map((s: any) => s.properties?.title) || []
  };

  setStoredSpreadsheetId(info.id);
  setStoredSpreadsheetMeta(info);
  return info;
};

/**
 * Pushes complete application database into the linked Google Sheet
 */
export const exportDatabaseToGoogleSheets = async (
  spreadsheetId: string,
  payload: SyncPayload
): Promise<{ success: boolean; rowsCount: number; message: string }> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  // 1. Prepare Data_Anak rows
  const anakHeaders = [
    'ID Anak', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Kelas / Sekolah',
    'Nama Orang Tua / Ayah', 'Nama Ibu', 'Alamat', 'Status Akun', 'Status Asesmen', 'Jadwal Sesi Rutin'
  ];
  const anakRows = payload.children.map(c => [
    c.id || '',
    c.name || '',
    c.gender || '',
    c.birthDate || '',
    c.className || '',
    c.parentName || '',
    c.motherName || '',
    c.address || '',
    c.status || 'Aktif',
    c.assessmentStatus || 'Selesai',
    (c.recurringSessions || []).map(s => `${s.day} ${s.time} (${s.type})`).join('; ')
  ]);

  // 2. Prepare Data_Terapis rows
  const terapisHeaders = [
    'ID / Nomor', 'Nama Terapis', 'Gelar & Spesialisasi', 'Nomor Telepon', 'Email',
    'Ruangan', 'Klien Maks/Hari', 'Hari Praktek', 'Status'
  ];
  const terapisRows = payload.therapists.map((t, idx) => [
    `T-${idx + 1}`,
    t.name || '',
    `${t.title || ''} (${(t.specialties || []).join(', ')})`,
    t.phone || '',
    t.email || '',
    t.defaultRoom || '',
    t.maxClientsPerDay || 6,
    (t.workingDays || []).join(', '),
    t.status || 'Aktif'
  ]);

  // 3. Prepare Sesi_Kehadiran rows
  const sesiHeaders = [
    'Tanggal', 'Sesi ID', 'ID Siswa', 'Nama Siswa', 'Jenis Terapi',
    'Jam Sesi', 'ID Terapis', 'Status Kehadiran', 'Catatan Ringkas'
  ];
  const sesiRows: any[][] = [];
  const childMap = new Map<string, string>();
  payload.children.forEach(c => childMap.set(c.id, c.name));

  Object.entries(payload.attendanceRecords).forEach(([dateKey, sessionMap]) => {
    Object.entries(sessionMap).forEach(([sessionId, status]) => {
      // Find child info from sessionId or notes
      const matchedChild = payload.children.find(c => 
        sessionId.includes(c.id) || (c.sessions && c.sessions.some(s => s.id === sessionId))
      );
      const note = payload.attendanceNotes[dateKey]?.[sessionId];
      const noteStr = typeof note === 'string' ? note : note?.note || '';
      const therapyType = note?.type || 'Terapi';
      
      sesiRows.push([
        dateKey,
        sessionId,
        matchedChild?.id || '-',
        matchedChild?.name || 'Siswa',
        therapyType,
        sessionId.includes('-') ? sessionId.split('-').slice(-2).join(' - ') : '-',
        note?.therapistId || '-',
        status,
        noteStr
      ]);
    });
  });

  // 4. Prepare Catatan_Terapi_Harian rows
  const catatanHeaders = [
    'Tanggal', 'Sesi ID', 'Jenis Terapi', 'Terapis', 'Catatan Perkembangan & Lembar Kerja', 'Respon Intervensi'
  ];
  const catatanRows: any[][] = [];
  Object.entries(payload.attendanceNotes).forEach(([dateKey, sessionNotes]) => {
    Object.entries(sessionNotes).forEach(([sessionId, noteObj]: [string, any]) => {
      const text = typeof noteObj === 'string' ? noteObj : noteObj?.note || '';
      const responseIntervention = typeof noteObj === 'object' ? noteObj?.detailedProgress?.responseToIntervention || '' : '';
      catatanRows.push([
        dateKey,
        sessionId,
        noteObj?.type || 'OT',
        noteObj?.therapistId || '-',
        text,
        responseIntervention
      ]);
    });
  });

  // 5. Prepare Pendaftaran_Baru rows
  const regHeaders = [
    'No Pendaftaran', 'Tanggal Daftar', 'Nama Anak', 'Tgl Lahir / Usia',
    'Nama Orang Tua', 'No WhatsApp', 'Keluhan / Kebutuhan', 'Layanan Diminati', 'Status Pendaftaran'
  ];
  const regRows = payload.registrations.map(r => [
    r.registrationNumber || r.id,
    r.registrationDate || '',
    r.childName || '',
    r.birthDate || '',
    r.parentName || r.fatherName || r.motherName || '',
    r.whatsapp || '',
    r.mainComplaint || '',
    (r.interestedServices || []).join(', '),
    r.status || 'Registrasi Baru'
  ]);

  // 6. Prepare Laporan_Keuangan rows
  const finHeaders = [
    'Tahun Ajaran', 'Bulan', 'Total Pemasukan (IDR)', 'Total Pengeluaran (IDR)', 'Surplus / Saldo (IDR)'
  ];
  const finRows: any[][] = [];
  Object.entries(payload.financialData).forEach(([year, records]) => {
    records.forEach(rec => {
      finRows.push([
        year,
        rec.month,
        rec.income,
        rec.expense,
        rec.income - rec.expense
      ]);
    });
  });

  // 7. Prepare Program_Terapi rows
  const programHeaders = [
    'ID Program', 'ID Siswa', 'Nama Siswa', 'Jenis Terapi', 'Target Waktu', 'Target Terapi', 'Aktivitas Terapi', 'Keterangan', 'Progres'
  ];
  const programRows: any[][] = [];
  (payload.therapyPrograms || []).forEach(prog => {
    const studentName = childMap.get(prog.childId) || prog.childId;
    (prog.items || []).forEach(item => {
      programRows.push([
        item.id,
        prog.childId,
        studentName,
        item.therapyType,
        item.targetWaktu || '',
        item.targetTerapi || '',
        item.aktifitasTerapi || '',
        item.keterangan || '',
        item.progres || ''
      ]);
    });
  });

  // Batch update values
  const batchData = [
    { range: 'Data_Anak!A1', values: [anakHeaders, ...anakRows] },
    { range: 'Data_Terapis!A1', values: [terapisHeaders, ...terapisRows] },
    { range: 'Sesi_Kehadiran!A1', values: [sesiHeaders, ...sesiRows] },
    { range: 'Catatan_Terapi_Harian!A1', values: [catatanHeaders, ...catatanRows] },
    { range: 'Program_Terapi!A1', values: [programHeaders, ...programRows] },
    { range: 'Pendaftaran_Baru!A1', values: [regHeaders, ...regRows] },
    { range: 'Laporan_Keuangan!A1', values: [finHeaders, ...finRows] }
  ];

  // First, verify sheets exist or add missing sheets
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (metaRes.ok) {
    const metaJson = await metaRes.json();
    const existingTitles: string[] = metaJson.sheets?.map((s: any) => s.properties?.title) || [];
    const requiredSheets = ['Data_Anak', 'Data_Terapis', 'Sesi_Kehadiran', 'Catatan_Terapi_Harian', 'Program_Terapi', 'Pendaftaran_Baru', 'Laporan_Keuangan'];
    const missingSheets = requiredSheets.filter(t => !existingTitles.includes(t));

    if (missingSheets.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: missingSheets.map(title => ({
            addSheet: {
              properties: { title, gridProperties: { frozenRowCount: 1 } }
            }
          }))
        })
      });
    }
  }

  // Clear previous values on the target sheets to prevent ghost old rows
  const clearRanges = ['Data_Anak!A:Z', 'Data_Terapis!A:Z', 'Sesi_Kehadiran!A:Z', 'Catatan_Terapi_Harian!A:Z', 'Program_Terapi!A:Z', 'Pendaftaran_Baru!A:Z', 'Laporan_Keuangan!A:Z'];
  for (const range of clearRanges) {
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // Continue even if sheet doesn't exist yet
    }
  }

  // Execute batch update
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: batchData
    })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal mengirim data ke Google Sheets: ${errText}`);
  }

  const totalRows = anakRows.length + terapisRows.length + sesiRows.length + catatanRows.length + programRows.length + regRows.length + finRows.length;
  
  // Update last synced meta
  const currentMeta = getStoredSpreadsheetMeta();
  if (currentMeta) {
    setStoredSpreadsheetMeta({
      ...currentMeta,
      lastSyncedAt: new Date().toISOString()
    });
  }

  return {
    success: true,
    rowsCount: totalRows,
    message: `Berhasil menyinkronkan ${totalRows} baris data ke Google Sheets.`
  };
};

/**
 * Reads data preview from a specific sheet tab in the linked Google Sheet
 */
export const readSheetData = async (spreadsheetId: string, sheetName: string, maxRows = 50): Promise<string[][]> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const range = `${sheetName}!A1:Z${maxRows}`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal membaca tab ${sheetName}: ${err}`);
  }

  const data = await response.json();
  return data.values || [];
};

/**
 * Imports / Pulls data updates from Google Sheets back into application records
 */
export const importDatabaseFromGoogleSheets = async (spreadsheetId: string) => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const [anakData, terapisData, regData] = await Promise.all([
    readSheetData(spreadsheetId, 'Data_Anak', 300).catch(() => []),
    readSheetData(spreadsheetId, 'Data_Terapis', 100).catch(() => []),
    readSheetData(spreadsheetId, 'Pendaftaran_Baru', 200).catch(() => [])
  ]);

  return {
    anakRows: anakData,
    terapisRows: terapisData,
    registrationRows: regData
  };
};
