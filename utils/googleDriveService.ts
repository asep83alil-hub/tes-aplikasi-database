import { getGoogleAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
}

const APP_FOLDER_NAME = 'Pelangi Lazuardi - Cloud Database & Backup';

/**
 * Searches for or creates the dedicated Pelangi Lazuardi root folder on Google Drive
 */
export const getOrCreatePelangiFolder = async (customFolderName?: string): Promise<string> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const folderName = customFolderName || APP_FOLDER_NAME;

  // Search if folder already exists
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: `Folder penyimpanan otomatis data dan cadangan sistem Terapi Pelangi Lazuardi`
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat folder di Google Drive: ${errText}`);
  }

  const createdFolder = await createRes.json();
  return createdFolder.id;
};

/**
 * Lists files stored in the Pelangi Lazuardi Google Drive folder or relevant app files
 */
export const listDriveFiles = async (folderId?: string): Promise<DriveFileItem[]> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  let query = 'trashed = false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  } else {
    // List backups and spreadsheets
    query += ` and (name contains 'Pelangi' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/json')`;
  }

  const fields = 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,iconLink)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&pageSize=50&fields=${encodeURIComponent(fields)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal memuat berkas dari Google Drive: ${err}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Uploads a complete application snapshot / backup JSON directly to Google Drive
 */
export const uploadDatabaseBackupToDrive = async (
  snapshotData: any,
  note = ''
): Promise<DriveFileItem> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const folderId = await getOrCreatePelangiFolder();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Backup_Database_Pelangi_Lazuardi_${dateStr}.json`;

  const backupContent = JSON.stringify({
    version: '1.0.0',
    appName: 'Terapi Pelangi Lazuardi',
    createdAt: new Date().toISOString(),
    backupNote: note,
    payload: snapshotData
  }, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Cadangan snapshot data operasional Pelangi Lazuardi. Catatan: ${note || 'Otomatis'}`
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupContent +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal mengunggah cadangan ke Google Drive: ${errText}`);
  }

  return await response.json();
};

/**
 * Downloads a backup JSON file content from Google Drive
 */
export const downloadBackupContentFromDrive = async (fileId: string): Promise<any> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal mengunduh berkas cadangan dari Google Drive: ${err}`);
  }

  return await response.json();
};

/**
 * Deletes a file from Google Drive (MUST be preceded by UI user confirmation!)
 */
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal menghapus file dari Google Drive: ${err}`);
  }

  return true;
};

/**
 * Uploads any custom text or JSON file directly into a Google Drive folder
 */
export const uploadCustomFileToDrive = async (
  fileName: string,
  mimeType: string,
  content: string,
  folderId?: string,
  description = ''
): Promise<DriveFileItem> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const targetFolderId = folderId || (await getOrCreatePelangiFolder());
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
    description: description
  };
  if (targetFolderId) {
    metadata.parents = [targetFolderId];
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal mengunggah ${fileName} ke Google Drive: ${errText}`);
  }

  return await response.json();
};

/**
 * Uploads ALL system databases and categories directly into the user's Google Drive folder
 */
export const uploadEverythingToDrive = async (
  payload: any,
  userEmail = 'asep@lazuardi.sch.id'
): Promise<{ folderId: string; folderUrl: string; uploadedFiles: DriveFileItem[] }> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Harap login dengan akun Google terlebih dahulu');

  const folderName = `Pelangi Lazuardi - Data Terapi (${userEmail})`;
  const folderId = await getOrCreatePelangiFolder(folderName);
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dateDisplay = now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });

  const uploadedFiles: DriveFileItem[] = [];

  // 1. Master Complete Snapshot
  const masterJson = JSON.stringify({
    appName: 'Terapi Pelangi Lazuardi',
    targetEmail: userEmail,
    exportedAt: now.toISOString(),
    version: '1.0.0',
    stats: {
      totalChildren: payload.children?.length || 0,
      totalTherapists: payload.therapists?.length || 0,
      totalRegistrations: payload.registrations?.length || 0,
      attendanceRecordsCount: Object.keys(payload.attendanceRecords || {}).length,
      attendanceNotesCount: Object.keys(payload.attendanceNotes || {}).length,
      financialYears: Object.keys(payload.financialData || {}).length
    },
    database: payload
  }, null, 2);

  const masterFile = await uploadCustomFileToDrive(
    `1_Backup_Utuh_Database_Pelangi_Lazuardi_${dateStr}.json`,
    'application/json',
    masterJson,
    folderId,
    `Snapshot utuh seluruh database sistem untuk ${userEmail} (${dateDisplay})`
  );
  uploadedFiles.push(masterFile);

  // 2. Data Master Anak
  const childrenJson = JSON.stringify(payload.children || [], null, 2);
  const childFile = await uploadCustomFileToDrive(
    `2_Data_Master_Siswa_Anak_${dateStr}.json`,
    'application/json',
    childrenJson,
    folderId,
    `Data profil lengkap siswa & anak terapi Pelangi Lazuardi (${payload.children?.length || 0} siswa)`
  );
  uploadedFiles.push(childFile);

  // 3. Data Tenaga Terapis
  const therapistsJson = JSON.stringify(payload.therapists || [], null, 2);
  const therapistFile = await uploadCustomFileToDrive(
    `3_Data_Tenaga_Terapis_${dateStr}.json`,
    'application/json',
    therapistsJson,
    folderId,
    `Daftar tenaga profesional terapis & jadwal kerja (${payload.therapists?.length || 0} terapis)`
  );
  uploadedFiles.push(therapistFile);

  // 4. Buku Catatan Terapi EMR & Presensi
  const notesJson = JSON.stringify({
    attendanceRecords: payload.attendanceRecords || {},
    attendanceNotes: payload.attendanceNotes || {},
    therapyPrograms: payload.therapyPrograms || []
  }, null, 2);
  const notesFile = await uploadCustomFileToDrive(
    `4_Buku_Catatan_Terapi_EMR_${dateStr}.json`,
    'application/json',
    notesJson,
    folderId,
    `Rekam medis digital EMR dan log presensi harian sesi terapi`
  );
  uploadedFiles.push(notesFile);

  // 5. Pendaftaran & Registrasi
  const regJson = JSON.stringify(payload.registrations || [], null, 2);
  const regFile = await uploadCustomFileToDrive(
    `5_Pendaftaran_Klien_Baru_${dateStr}.json`,
    'application/json',
    regJson,
    folderId,
    `Database registrasi calon klien baru (${payload.registrations?.length || 0} pendaftar)`
  );
  uploadedFiles.push(regFile);

  // 6. Laporan Keuangan
  const finJson = JSON.stringify(payload.financialData || {}, null, 2);
  const finFile = await uploadCustomFileToDrive(
    `6_Laporan_Keuangan_Klinik_${dateStr}.json`,
    'application/json',
    finJson,
    folderId,
    `Laporan keuangan, pemasukan, dan pengeluaran per tahun ajaran`
  );
  uploadedFiles.push(finFile);

  // 7. README / Manifest file
  const readmeText = `=====================================================
SISTEM INFORMASI TERAPI PELANGI LAZUARDI
DOKUMEN CADANGAN LENGKAP GOOGLE DRIVE
=====================================================
Akun Tujuan  : ${userEmail}
Tanggal Unggah: ${dateDisplay}
Total Siswa   : ${payload.children?.length || 0} Siswa
Total Terapis : ${payload.therapists?.length || 0} Terapis
Total Registrasi: ${payload.registrations?.length || 0} Calon Klien
Folder Drive  : ${folderName}

BERKAS YANG DIUNGGAH KE FOLDER INI:
1. 1_Backup_Utuh_Database_Pelangi_Lazuardi_${dateStr}.json (Snapshot database utama)
2. 2_Data_Master_Siswa_Anak_${dateStr}.json (Profil siswa, orang tua, & jadwal rutin)
3. 3_Data_Tenaga_Terapis_${dateStr}.json (Data terapis, spesialisasi, ruangan, & kontak)
4. 4_Buku_Catatan_Terapi_EMR_${dateStr}.json (Log presensi, lembar kerja EMR, target program)
5. 5_Pendaftaran_Klien_Baru_${dateStr}.json (Data registrasi & asesmen)
6. 6_Laporan_Keuangan_Klinik_${dateStr}.json (Laporan arus kas dan tahun buku)

Semua data tersimpan aman dan terenkripsi di Google Drive pribadi Anda (${userEmail}).
=====================================================
`;
  const readmeFile = await uploadCustomFileToDrive(
    `0_README_Informasi_Cadangan_${dateStr}.txt`,
    'text/plain',
    readmeText,
    folderId,
    `Informasi ringkasan data yang diunggah ke Google Drive ${userEmail}`
  );
  uploadedFiles.push(readmeFile);

  return {
    folderId,
    folderUrl,
    uploadedFiles
  };
};
