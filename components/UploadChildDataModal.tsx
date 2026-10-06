import React, { useState, useRef } from 'react';
import { Child, AssessmentStatus } from '../types';
import ExcelIcon from './icons/ExcelIcon';
import FileTextIcon from './icons/FileTextIcon';

type MasterChild = Omit<Child, 'sessions'>;

interface UploadChildDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newChildren: Omit<MasterChild, 'id'>[]) => void;
}

const UploadChildDataModal: React.FC<UploadChildDataModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = ["name", "birthDate", "gender", "className", "parentName", "motherName", "address", "photoUrl"];
    
    const xmlHeader = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="Sheet1">
        <Table>`;
    
    const xmlFooter = `</Table>
      </Worksheet>
    </Workbook>`;

    const headerRow = `<Row>${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}</Row>`;
    
    const xmlContent = xmlHeader + headerRow + xmlFooter;
    
    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_siswa.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
          setError('Hanya file .csv yang diperbolehkan.');
          setSelectedFile(null);
          e.target.value = ''; // Reset the input
          return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  const handleSave = () => {
    setError('');
    if (!selectedFile) {
      setError('Silakan pilih file untuk diunggah.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
            setError('File kosong atau tidak dapat dibaca.');
            return;
        }

        const newChildren: Omit<MasterChild, 'id'>[] = [];
        const rows = csvContent.trim().replace(/\r\n/g, '\n').split('\n');
        const headers = "name,birthdate,gender,classname,parentname,mothername,address,photourl";
        const headerCols = headers.split(',');

        const firstRowValues = rows[0].split(',').map(v => v.trim().toLowerCase().replace(/\s/g, ''));
        const isFirstRowHeader = headerCols.every((header, index) => firstRowValues[index] === header);
        
        const dataRows = isFirstRowHeader ? rows.slice(1) : rows;

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row.trim()) continue;

            const values = row.split(',').map(v => v.trim());
            if (values.length !== headerCols.length) {
                setError(`Baris ${i + 1} memiliki jumlah kolom yang salah. Harusnya ada ${headerCols.length} kolom, tetapi ditemukan ${values.length}.`);
                return;
            }

            const child: Omit<MasterChild, 'id' | 'assessmentStatus' | 'recurringSessions'> = {
                name: values[0],
                birthDate: values[1],
                gender: values[2] as 'Laki-Laki' | 'Perempuan',
                className: values[3],
                parentName: values[4],
                motherName: values[5],
                address: values[6],
                photoUrl: values[7],
            };

            if (!child.name) {
                setError(`Nama pada baris ${i + 1} tidak boleh kosong.`);
                return;
            }

            newChildren.push({
                ...child,
                assessmentStatus: AssessmentStatus.NOT_ASSESSED,
                recurringSessions: [],
                photoUrl: child.photoUrl || `https://i.pravatar.cc/100?u=${child.name.replace(/\s/g, '')}`
            });
        }

        onSave(newChildren);
        onClose();
        setSelectedFile(null);
    };

     reader.onerror = () => {
        setError('Gagal membaca file.');
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up">
      <div className="bg-surface border border-surface-light rounded-2xl shadow-xl w-full max-w-3xl m-4">
        <div className="p-6 border-b border-surface-light flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Upload Data Siswa</h3>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div>
                <h4 className="font-semibold text-white mb-2">Instruksi:</h4>
                 <ol className="text-sm text-muted list-decimal list-inside space-y-2">
                    <li>
                        Unduh template Excel dengan menekan tombol di bawah.
                        <button onClick={handleDownloadTemplate} className="ml-3 inline-flex items-center gap-2 bg-success/10 text-success hover:bg-success/20 transition-colors px-3 py-1 rounded-lg text-xs font-medium">
                            <ExcelIcon className="w-4 h-4"/>
                            Unduh Template Excel
                        </button>
                    </li>
                    <li>Buka file dengan program spreadsheet (Excel, Google Sheets) dan isi data siswa.</li>
                     <li className="font-bold text-warning">
                        PENTING: Setelah selesai, simpan file Anda sebagai <strong className="underline">CSV (Comma Delimited) (*.csv)</strong>.
                    </li>
                    <li>Unggah file <strong className="underline">.csv</strong> yang telah Anda simpan di area di bawah ini.</li>
                </ol>
                <div className="mt-3 p-2 bg-background/50 rounded-md text-xs font-mono text-muted">
                    Urutan Kolom: name, birthDate (YYYY-MM-DD), gender (Laki-Laki/Perempuan), className, parentName, motherName, address, photoUrl (opsional)
                </div>
            </div>
            <div>
                <label htmlFor="csv-upload" className="block mb-2 text-sm font-medium text-muted">Unggah File .csv (dari Template Excel):</label>
                 <div
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-light/50 border-dashed rounded-md cursor-pointer transition hover:border-primary"
                    onClick={triggerFileInput}
                >
                    <div className="space-y-1 text-center">
                        <FileTextIcon className="mx-auto h-12 w-12 text-muted" />
                        {selectedFile ? (
                             <p className="text-sm text-white font-semibold">{selectedFile.name}</p>
                        ) : (
                            <div className="flex text-sm text-muted">
                                <p className="pl-1">Pilih sebuah file atau seret ke sini</p>
                            </div>
                        )}
                        <p className="text-xs text-muted">Hanya file .csv</p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    id="csv-upload"
                    name="csv-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                />
            </div>
             {error && <p className="text-sm text-danger text-center bg-danger/10 p-2 rounded-lg">{error}</p>}
        </div>
        <div className="px-6 py-4 bg-background/50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted bg-surface-light rounded-lg hover:bg-surface-light/50 transition">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-dark transition">Proses & Simpan Data</button>
        </div>
      </div>
    </div>
  );
};

export default UploadChildDataModal;
