import { Child, AttendanceStatus } from '../types';
import { RecapData, formatLocalDateKey } from '../components/AttendanceRecapPage';

type MasterChild = Omit<Child, 'sessions'>;

interface MonthlyRecapExportOptions {
  monthKey: string; // YYYY-MM
  monthDisplayName: string; // e.g. "September 2026"
  allChildren: MasterChild[];
  monthlyRecapData: RecapData[];
  overallStats: {
    totalSessions: number;
    totalPresent: number;
    totalAbsent: number;
    totalPermit: number;
    totalPending: number;
    avgAttendanceRate: string;
  };
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes?: { [dateKey: string]: { [sessionId: string]: string } };
}

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/**
 * Escapes CSV values to handle commas, double quotes, and line breaks properly.
 */
function escapeCsv(cell: string | number | undefined | null): string {
  if (cell === undefined || cell === null) return '""';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers instant browser download of complete 1-Month Attendance Recap in Excel-friendly CSV format.
 * Features UTF-8 BOM (\uFEFF) to ensure Microsoft Excel and Google Sheets render characters without distortion.
 */
export function downloadMonthlyAttendanceCSV(options: MonthlyRecapExportOptions): void {
  const {
    monthKey,
    monthDisplayName,
    allChildren,
    monthlyRecapData,
    overallStats,
    attendanceRecords,
  } = options;

  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const lines: string[] = [];

  // 1. INSTITUTION & REPORT HEADER
  lines.push(escapeCsv("PUSAT LAYANAN TERAPI TUMBUH KEMBANG PELANGI LAZUARDI"));
  lines.push(escapeCsv("LAPORAN REKAPITULASI KEHADIRAN & KETIDAKHADIRAN SISWA BULANAN"));
  lines.push(`${escapeCsv("Periode Bulan:")},${escapeCsv(monthDisplayName)},${escapeCsv("Tahun:")},${escapeCsv(year)}`);
  lines.push(`${escapeCsv("Waktu Ekspor:")},${escapeCsv(new Date().toLocaleString('id-ID'))},${escapeCsv("Sistem:")},${escapeCsv("Presensi Digital Terapi")}`);
  lines.push(""); // Blank line

  // 2. EXECUTIVE KPI SUMMARY BLOCK
  lines.push(escapeCsv("=== RINGKASAN EKSEKUTIF BULANAN ==="));
  lines.push([
    escapeCsv("Total Siswa"),
    escapeCsv("Total Sesi Terjadwal"),
    escapeCsv("Total Sesi Hadir"),
    escapeCsv("Tidak Hadir (Absen)"),
    escapeCsv("Total Izin/Sakit"),
    escapeCsv("Belum Dipresensi"),
    escapeCsv("Rata-rata Kehadiran (%)")
  ].join(','));

  lines.push([
    escapeCsv(monthlyRecapData.length),
    escapeCsv(overallStats.totalSessions),
    escapeCsv(overallStats.totalPresent),
    escapeCsv(overallStats.totalAbsent),
    escapeCsv(overallStats.totalPermit),
    escapeCsv(overallStats.totalPending),
    escapeCsv(`${overallStats.avgAttendanceRate}%`)
  ].join(','));
  lines.push(""); // Blank line

  // 3. TABLE 1: SUMMARY PER STUDENT
  lines.push(escapeCsv("=== TABEL 1: REKAPITULASI KEHADIRAN PER SISWA ==="));
  lines.push([
    escapeCsv("No"),
    escapeCsv("ID Siswa"),
    escapeCsv("Nama Lengkap Siswa"),
    escapeCsv("Kelas / Rombel"),
    escapeCsv("Total Sesi Bulan Ini"),
    escapeCsv("Hadir (Sesi)"),
    escapeCsv("Tidak Hadir / Absen"),
    escapeCsv("Izin / Sakit"),
    escapeCsv("Belum Terlaksana"),
    escapeCsv("Tingkat Kehadiran (%)"),
    escapeCsv("Status Evaluasi")
  ].join(','));

  monthlyRecapData.forEach((item, index) => {
    let evalStatus = "Belum Dimulai";
    if (item.present + item.absent + item.permit > 0) {
      if (item.attendanceRate >= 85) evalStatus = "Sangat Baik";
      else if (item.attendanceRate >= 70) evalStatus = "Cukup";
      else evalStatus = "Perlu Perhatian";
    }

    lines.push([
      escapeCsv(index + 1),
      escapeCsv(item.childId),
      escapeCsv(item.childName),
      escapeCsv(item.className || 'Kelas Terapi'),
      escapeCsv(item.totalSessions),
      escapeCsv(item.present),
      escapeCsv(item.absent),
      escapeCsv(item.permit),
      escapeCsv(item.pending),
      escapeCsv(`${item.attendanceRate}%`),
      escapeCsv(evalStatus)
    ].join(','));
  });
  lines.push(""); // Blank line

  // 4. TABLE 2: DAILY ATTENDANCE MATRIX (DAY 1 TO 28/30/31)
  lines.push(escapeCsv(`=== TABEL 2: MATRIKS RINCIAN KEHADIRAN HARIAN (TANGGAL 1 - ${daysInMonth} ${monthDisplayName}) ===`));
  lines.push(escapeCsv("Keterangan Kode: H = Hadir | A = Absen / Tidak Hadir | I = Izin / Sakit | M = Menunggu Presensi | - = Tidak Ada Jadwal"));
  
  const matrixHeaders = [
    escapeCsv("No"),
    escapeCsv("ID Siswa"),
    escapeCsv("Nama Siswa"),
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    matrixHeaders.push(escapeCsv(`Tgl ${d}`));
  }
  matrixHeaders.push(escapeCsv("Total Hadir"));
  matrixHeaders.push(escapeCsv("Total Absen"));
  matrixHeaders.push(escapeCsv("Total Izin"));
  matrixHeaders.push(escapeCsv("Kehadiran (%)"));

  lines.push(matrixHeaders.join(','));

  monthlyRecapData.forEach((item, index) => {
    const childMaster = allChildren.find(c => c.id === item.childId);
    const row = [
      escapeCsv(index + 1),
      escapeCsv(item.childId),
      escapeCsv(item.childName),
    ];

    if (!childMaster || !childMaster.recurringSessions || childMaster.recurringSessions.length === 0) {
      for (let d = 1; d <= daysInMonth; d++) {
        row.push(escapeCsv("-"));
      }
    } else {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayIndex = date.getDay();
        const dayOfWeekName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

        const localKey = formatLocalDateKey(date);
        const isoKey = date.toISOString().split('T')[0];

        const sessionsOnThisDay = childMaster.recurringSessions.filter(rs => rs.day === dayOfWeekName);
        if (sessionsOnThisDay.length === 0) {
          row.push(escapeCsv("-"));
        } else {
          // Collect status codes
          const codes = sessionsOnThisDay.map(recSession => {
            const sessionId = `s-recur-${item.childId}-${dayOfWeekName.replace(/\s/g, '')}-${recSession.time}`;
            const status = attendanceRecords[localKey]?.[sessionId]
              || attendanceRecords[isoKey]?.[sessionId]
              || AttendanceStatus.PENDING;

            switch (status) {
              case AttendanceStatus.PRESENT: return 'H';
              case AttendanceStatus.ABSENT: return 'A';
              case AttendanceStatus.PERMIT: return 'I';
              case AttendanceStatus.PENDING:
              default: return 'M';
            }
          });
          row.push(escapeCsv(codes.join('/')));
        }
      }
    }

    row.push(escapeCsv(item.present));
    row.push(escapeCsv(item.absent));
    row.push(escapeCsv(item.permit));
    row.push(escapeCsv(`${item.attendanceRate}%`));

    lines.push(row.join(','));
  });

  lines.push("");
  lines.push(escapeCsv("Dicetak secara otomatis melalui Sistem Terapi Pelangi Lazuardi"));

  // Build CSV content with UTF-8 BOM
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanMonthName = monthDisplayName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `Rekap_Kehadiran_Siswa_${cleanMonthName}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single student's 1-month attendance log into an Excel-friendly CSV.
 */
export function downloadSingleStudentMonthlyAttendanceCSV(
  child: MasterChild,
  monthKey: string,
  monthDisplayName: string,
  stats: { totalSessions: number; present: number; absent: number; permit: number; pending: number; rate: number },
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } },
  attendanceNotes?: { [dateKey: string]: { [sessionId: string]: string } }
): void {
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const lines: string[] = [];

  // Header
  lines.push(escapeCsv("PUSAT LAYANAN TERAPI TUMBUH KEMBANG PELANGI LAZUARDI"));
  lines.push(escapeCsv(`LAPORAN REKAPITULASI KEHADIRAN INDIVIDU SISWA - ${monthDisplayName.toUpperCase()}`));
  lines.push("");
  lines.push(`${escapeCsv("Nama Siswa:")},${escapeCsv(child.name)},${escapeCsv("ID Siswa:")},${escapeCsv(child.id)}`);
  lines.push(`${escapeCsv("Kelas:")},${escapeCsv(child.className || '- ')},${escapeCsv("Nama Orang Tua:")},${escapeCsv(child.parentName || '-')}`);
  lines.push(`${escapeCsv("Periode:")},${escapeCsv(monthDisplayName)},${escapeCsv("Waktu Unduh:")},${escapeCsv(new Date().toLocaleString('id-ID'))}`);
  lines.push("");

  // Stats
  lines.push(escapeCsv("=== RINGKASAN KEHADIRAN SISWA BULAN INI ==="));
  lines.push([
    escapeCsv("Total Sesi"),
    escapeCsv("Hadir"),
    escapeCsv("Tidak Hadir (Absen)"),
    escapeCsv("Izin / Sakit"),
    escapeCsv("Belum Terlaksana"),
    escapeCsv("Persentase Kehadiran (%)")
  ].join(','));
  lines.push([
    escapeCsv(stats.totalSessions),
    escapeCsv(stats.present),
    escapeCsv(stats.absent),
    escapeCsv(stats.permit),
    escapeCsv(stats.pending),
    escapeCsv(`${stats.rate}%`)
  ].join(','));
  lines.push("");

  // Daily Detail
  lines.push(escapeCsv("=== RINCIAN LOG KEHADIRAN HARIAN ==="));
  lines.push([
    escapeCsv("No"),
    escapeCsv("Tanggal"),
    escapeCsv("Hari"),
    escapeCsv("Waktu"),
    escapeCsv("Jenis Terapi"),
    escapeCsv("Status Kehadiran"),
    escapeCsv("Catatan Presensi")
  ].join(','));

  let rowCount = 0;
  if (child.recurringSessions && child.recurringSessions.length > 0) {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayIndex = date.getDay();
      const dayOfWeekName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

      const localKey = formatLocalDateKey(date);
      const isoKey = date.toISOString().split('T')[0];

      const sessionsOnThisDay = child.recurringSessions.filter(rs => rs.day === dayOfWeekName);
      sessionsOnThisDay.forEach(recSession => {
        rowCount++;
        const sessionId = `s-recur-${child.id}-${dayOfWeekName.replace(/\s/g, '')}-${recSession.time}`;
        const status = attendanceRecords[localKey]?.[sessionId]
          || attendanceRecords[isoKey]?.[sessionId]
          || AttendanceStatus.PENDING;

        const note = attendanceNotes?.[localKey]?.[sessionId]
          || attendanceNotes?.[isoKey]?.[sessionId]
          || '-';

        let statusLabel = 'Menunggu';
        if (status === AttendanceStatus.PRESENT) statusLabel = 'Hadir';
        else if (status === AttendanceStatus.ABSENT) statusLabel = 'Tidak Hadir (Absen)';
        else if (status === AttendanceStatus.PERMIT) statusLabel = 'Izin';

        lines.push([
          escapeCsv(rowCount),
          escapeCsv(localKey),
          escapeCsv(dayOfWeekName),
          escapeCsv(recSession.time),
          escapeCsv(recSession.type),
          escapeCsv(statusLabel),
          escapeCsv(note)
        ].join(','));
      });
    }
  }

  if (rowCount === 0) {
    lines.push(escapeCsv("Tidak ada jadwal terapi terjadwal pada bulan ini."));
  }

  lines.push("");
  lines.push(escapeCsv("Dicetak secara resmi melalui Sistem Informasi Manajemen Terapi Pelangi Lazuardi"));

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanChildName = child.name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const cleanMonth = monthDisplayName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `Rekap_Kehadiran_${cleanChildName}_${cleanMonth}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
