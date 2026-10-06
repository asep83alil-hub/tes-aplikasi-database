import { RapotArchiveFolder, RapotArchiveItem } from '../types';

const STORAGE_KEY_ARCHIVES = 'pelangi_rapot_archives_v1';
const STORAGE_KEY_FOLDERS = 'pelangi_rapot_folders_v1';

export function formatArchiveDate(d: Date = new Date()): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatArchiveTime(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

export function generateArchiveFileName(
  studentName: string,
  dateStr: string,
  timeStr: string,
  existingFileNames: string[]
): string {
  const cleanName = (studentName || 'Siswa').trim();
  const baseName = `${cleanName} - ${dateStr} - ${timeStr}`;
  let fileName = `${baseName}.pdf`;

  if (!existingFileNames.includes(fileName)) {
    return fileName;
  }

  let counter = 1;
  while (existingFileNames.includes(`${baseName} (${counter}).pdf`)) {
    counter++;
  }
  return `${baseName} (${counter}).pdf`;
}

export function getStoredFolders(): RapotArchiveFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading archive folders from localStorage:', e);
  }

  // Default initial folders
  const defaultFolders: RapotArchiveFolder[] = [
    { id: 'folder_ta_2025_2026', name: 'Tahun Ajaran 2025/2026', timestamp: Date.now() - 86400000 * 30 },
    { id: 'folder_sem_1', name: 'Evaluasi Semester Ganjil', timestamp: Date.now() - 86400000 * 10 },
  ];
  saveStoredFolders(defaultFolders);
  return defaultFolders;
}

export function saveStoredFolders(folders: RapotArchiveFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Error saving archive folders to localStorage:', e);
  }
}

export function getStoredArchives(): RapotArchiveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARCHIVES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading archives from localStorage:', e);
  }
  return [];
}

export function saveStoredArchives(archives: RapotArchiveItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARCHIVES, JSON.stringify(archives));
  } catch (e) {
    console.error('Error saving archives to localStorage:', e);
  }
}
