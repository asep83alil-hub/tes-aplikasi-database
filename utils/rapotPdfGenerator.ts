import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Standardized filename format according to specification:
 * "Nama Lengkap Siswa - Rapot - Tanggal.pdf"
 */
export function formatRapotDownloadFileName(childName: string, dateString?: string, version?: number): string {
  const cleanName = (childName || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  let formattedDate = dateString;
  if (!formattedDate) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    formattedDate = `${day}-${month}-${year}`;
  } else {
    formattedDate = formattedDate.replace(/[/\\?%*:|"<>]/g, '-');
  }
  const ver = version && version > 1 ? ` (v${version})` : '';
  return `${cleanName} - Rapot - ${formattedDate}${ver}.pdf`;
}

/**
 * Standardized filename format for Assessment report:
 * "Nama Lengkap Siswa - Laporan Assessment [Tipe] - Tanggal.pdf"
 */
export function formatAssessmentDownloadFileName(childName: string, therapyType?: string, dateString?: string): string {
  const cleanName = (childName || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanType = (therapyType || 'Terpadu').trim().replace(/[/\\?%*:|"<>]/g, '-');
  let formattedDate = dateString;
  if (!formattedDate) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    formattedDate = `${day}-${month}-${year}`;
  } else {
    formattedDate = formattedDate.replace(/[/\\?%*:|"<>]/g, '-');
  }
  return `${cleanName} - Laporan Assessment ${cleanType} - ${formattedDate}.pdf`;
}

/**
 * Standardized filename format for Therapy Notebook records:
 * "Nama Lengkap Siswa - Rekam Catatan Terapi - Tanggal.pdf"
 */
export function formatTherapyNotebookDownloadFileName(childName: string, dateString?: string): string {
  const cleanName = (childName || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  let formattedDate = dateString;
  if (!formattedDate) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    formattedDate = `${day}-${month}-${year}`;
  } else {
    formattedDate = formattedDate.replace(/[/\\?%*:|"<>]/g, '-');
  }
  return `${cleanName} - Rekam Catatan Terapi - ${formattedDate}.pdf`;
}

/**
 * Standardized filename format for Therapy Program report:
 * "Nama Lengkap Siswa - Program Terapi [Kategori] - Tanggal.pdf"
 */
export function formatProgramDownloadFileName(childName: string, categoryLabel?: string): string {
  const cleanName = (childName || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cat = categoryLabel ? ` - ${categoryLabel.replace(/[/\\?%*:|"<>]/g, '-')}` : '';
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${cleanName} - Program Terapi${cat} - ${day}-${month}-${year}.pdf`;
}

/**
 * Standardized filename format for Monthly Attendance Recap report:
 * "Rekap Kehadiran Siswa - [Bulan] [Tahun].pdf"
 */
export function formatAttendanceRecapDownloadFileName(monthName: string, year: number | string): string {
  const cleanMonth = (monthName || 'Bulan').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanYear = String(year || new Date().getFullYear()).trim().replace(/[/\\?%*:|"<>]/g, '-');
  return `Rekap Kehadiran Siswa - ${cleanMonth} ${cleanYear}.pdf`;
}

/**
 * Standardized filename format for Individual Student Monthly Attendance report:
 * "Nama Lengkap Siswa - Rekap Kehadiran - [Bulan] [Tahun].pdf"
 */
export function formatStudentMonthlyAttendanceFileName(childName: string, monthName: string, year: number | string): string {
  const cleanName = (childName || 'Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanMonth = (monthName || 'Bulan').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanYear = String(year || new Date().getFullYear()).trim().replace(/[/\\?%*:|"<>]/g, '-');
  return `${cleanName} - Rekap Kehadiran - ${cleanMonth} ${cleanYear}.pdf`;
}

/**
 * Standardized filename format for Guest Registration form PDF:
 * "Formulir Registrasi - [Nama Anak] - [No Registrasi].pdf"
 */
export function formatRegistrationDownloadFileName(childName: string, regNumber: string): string {
  const cleanName = (childName || 'Calon Siswa').trim().replace(/[/\\?%*:|"<>]/g, '-');
  const cleanReg = (regNumber || 'REG').trim().replace(/[/\\?%*:|"<>]/g, '-');
  return `Formulir Registrasi - ${cleanName} - ${cleanReg}.pdf`;
}

/**
 * Triggers standard browser print with document.title temporarily matching fileName.
 * Enforces strict A4 Portrait (210mm x 297mm) in @page so "Save as PDF" and physical printers
 * default strictly to Portrait layout without distortion.
 */
export function triggerBrowserA4Print(fileName: string = 'Dokumen-Cetak-A4.pdf'): void {
  const originalTitle = document.title;
  const cleanTitle = fileName.replace(/\.pdf$/i, '');
  document.title = cleanTitle;

  // Dynamically set strict A4 portrait @page orientation in a temporary style tag
  const dynamicStyleId = 'dynamic-print-page-style';
  let dynamicStyle = document.getElementById(dynamicStyleId) as HTMLStyleElement | null;
  if (!dynamicStyle) {
    dynamicStyle = document.createElement('style');
    dynamicStyle.id = dynamicStyleId;
    document.head.appendChild(dynamicStyle);
  }
  dynamicStyle.innerHTML = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print, header, nav, aside, button:not(.a4-sheet button), .print-toolbar {
        display: none !important;
      }
      div.fixed, div[class*="backdrop"] {
        position: static !important;
        inset: auto !important;
        background: transparent !important;
        overflow: visible !important;
      }
      div[style*="transform"], div[style*="scale"] {
        transform: none !important;
      }
      .a4-sheet {
        width: 210mm !important;
        min-height: 297mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 15mm !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        overflow: hidden !important;
      }
      .a4-sheet.margin-15mm, .a4-sheet[data-margin="15mm"] {
        padding: 15mm !important;
      }
      .a4-sheet:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .report-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .section-title {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .report-table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .catatan-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .signature-section, .therapy-signature-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .signature-block {
        text-align: center !important;
        align-items: center !important;
        justify-content: center !important;
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        margin: 0 auto !important;
      }
      .signature-box, .signature-area {
        min-height: 56px !important;
        max-height: 75px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        width: 100% !important;
      }
      .a4-sheet .signature-section *,
      .a4-sheet .therapy-signature-block * {
        text-align: center !important;
        text-align-last: center !important;
      }
      .signature-name {
        font-size: 14px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        color: #0f172a !important;
        text-align: center !important;
        text-align-last: center !important;
        line-height: 1.3 !important;
        margin: 0 auto !important;
        width: 100% !important;
        display: block !important;
      }
      .signature-position, .signature-role {
        font-size: 12px !important;
        font-weight: 500 !important;
        color: #555555 !important;
        text-align: center !important;
        text-align-last: center !important;
        line-height: 1.3 !important;
        margin: 2px auto 0 auto !important;
        width: 100% !important;
        display: block !important;
      }
      .signature-header, .signature-title, .signature-knowing, .signature-date {
        font-size: 12px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        color: #1e293b !important;
        text-align: center !important;
        text-align-last: center !important;
        margin: 0 auto 4px auto !important;
        width: 100% !important;
        display: block !important;
      }
      .signature-line {
        width: 220px !important;
        max-width: 220px !important;
        height: 2px !important;
        background-color: #1f2937 !important;
        border: none !important;
        margin: 4px auto 6px auto !important;
        display: block !important;
      }
      .upload-signature,
      .signature-upload-box,
      .upload-button {
        display: none !important;
      }
      .therapy-chart-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  `;

  window.focus();
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
      if (dynamicStyle && dynamicStyle.parentNode) {
        dynamicStyle.parentNode.removeChild(dynamicStyle);
      }
    }, 1000);
  }, 100);
}

/**
 * Export specific A4 page DOM elements directly into a high-fidelity downloadable PDF.
 * Strictly configured for A4 Portrait (210mm x 297mm).
 * Strips all scaling/zoom transforms in cloned DOM and enforces crisp typography rules
 * to prevent letter overlapping, clipped words, or distorted columns.
 */
export async function exportPagesToPdf(
  pageElements: HTMLElement[],
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (!pageElements || pageElements.length === 0) {
    throw new Error('Tidak ada halaman untuk diekspor ke PDF');
  }

  // Ensure all web fonts are loaded prior to canvas rasterization
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // Continue if font check fails
    }
  }

  // Strict A4 Portrait (210mm width x 297mm height)
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const targetPxW = 794; // Standard 96 DPI pixel width for 210mm
  const targetPxH = 1123; // Standard 96 DPI pixel height for 297mm

  for (let i = 0; i < pageElements.length; i++) {
    const el = pageElements[i];

    if (i > 0) {
      pdf.addPage('a4', 'p');
    }

    if (onProgress) {
      onProgress(Math.round(((i + 0.2) / pageElements.length) * 100));
    }

    const canvas = await html2canvas(el, {
      scale: 2, // High-resolution crisp rendering (300 DPI equivalent)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: targetPxW,
      windowHeight: targetPxH,
      onclone: (clonedDoc, clonedEl) => {
        // Strip zoom or CSS transforms from cloned target and all its ancestors
        clonedEl.style.transform = 'none';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.width = `${targetPxW}px`;
        clonedEl.style.minHeight = `${targetPxH}px`;
        clonedEl.style.height = `${targetPxH}px`;
        clonedEl.style.maxHeight = `${targetPxH}px`;
        clonedEl.style.boxSizing = 'border-box';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.borderRadius = '0';
        clonedEl.style.border = 'none';

        let parent = clonedEl.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = 'none';
          (parent.style as any).zoom = '1';
          parent.style.margin = '0';
          parent.style.padding = '0';
          parent.style.overflow = 'visible';
          parent.style.maxWidth = 'none';
          parent.style.maxHeight = 'none';
          parent.style.filter = 'none';
          parent = parent.parentElement;
        }

        // Inject strict typographic rules to prevent letter joining or character overlap
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
            font-feature-settings: "liga" 0 !important;
            font-variant-ligatures: none !important;
            text-rendering: geometricPrecision !important;
            -webkit-font-smoothing: antialiased !important;
          }
          .a4-sheet {
            width: 794px !important;
            min-height: 1123px !important;
            height: 1123px !important;
            max-height: 1123px !important;
            padding: 15mm !important;
            transform: none !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
          }
          .a4-sheet.margin-15mm, .a4-sheet[data-margin="15mm"] {
            padding: 15mm !important;
          }
          .report-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .section-title {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .report-table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .catatan-box {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .signature-section, .therapy-signature-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .signature-block {
            text-align: center !important;
            align-items: center !important;
            justify-content: center !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            margin: 0 auto !important;
          }
          .signature-box, .signature-area {
            min-height: 56px !important;
            max-height: 75px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            width: 100% !important;
          }
          .a4-sheet .signature-section *,
          .a4-sheet .therapy-signature-block * {
            text-align: center !important;
            text-align-last: center !important;
          }
          .signature-name {
            font-size: 14px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #0f172a !important;
            text-align: center !important;
            text-align-last: center !important;
            line-height: 1.3 !important;
            margin: 0 auto !important;
            width: 100% !important;
            display: block !important;
          }
          .signature-position, .signature-role {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: #555555 !important;
            text-align: center !important;
            text-align-last: center !important;
            line-height: 1.3 !important;
            margin: 2px auto 0 auto !important;
            width: 100% !important;
            display: block !important;
          }
          .signature-header, .signature-title, .signature-knowing, .signature-date {
            font-size: 12px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #1e293b !important;
            text-align: center !important;
            text-align-last: center !important;
            margin: 0 auto 4px auto !important;
            width: 100% !important;
            display: block !important;
          }
          .signature-line {
            width: 220px !important;
            max-width: 220px !important;
            height: 2px !important;
            background-color: #1f2937 !important;
            border: none !important;
            margin: 4px auto 6px auto !important;
            display: block !important;
          }
          .upload-signature,
          .signature-upload-box,
          .upload-button {
            display: none !important;
          }
          .therapy-chart-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pageElements.length) * 100));
    }
  }

  const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  pdf.save(finalFileName);
}

/**
 * Export container to PDF by searching for .a4-print-page elements or slicing
 */
export async function exportContainerToPdf(
  container: HTMLElement,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const explicitPages = container.querySelectorAll<HTMLElement>('.a4-print-page');
  if (explicitPages.length > 0) {
    await exportPagesToPdf(Array.from(explicitPages), fileName, onProgress);
    return;
  }

  // Fallback: render whole container and paginate proportionally
  if (onProgress) onProgress(20);
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  if (onProgress) onProgress(60);

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage('a4', 'p');
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  if (onProgress) onProgress(100);
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
