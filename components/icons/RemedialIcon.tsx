
import React from 'react';

const RemedialIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    <path d="M16 8a4 4 0 0 1-8 0" />
    <path d="M12 12v2" />
    <path d="M12 2v2" />
    <path d="M12 16a4 4 0 0 1 0-8" />
  </svg>
);

export default RemedialIcon;
