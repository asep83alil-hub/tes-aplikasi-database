import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <main className="p-8 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-6">Laporan Perkembangan</h1>
      </div>
      <div className="flex-grow w-full max-w-7xl mx-auto bg-surface border border-surface-light rounded-2xl overflow-hidden">
        <iframe
          src="https://sites.google.com/lazuardi.sch.id/pelangi-lazuardi/home"
          title="Laporan Perkembangan"
          className="w-full h-full border-0"
          allowFullScreen
        >
            Memuat laporan...
        </iframe>
      </div>
    </main>
  );
};

export default ReportsPage;