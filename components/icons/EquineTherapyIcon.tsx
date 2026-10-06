import React from 'react';

const EquineTherapyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Horse Head / Silhouette */}
    <path d="M4 19a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9.5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a4 4 0 0 0-4-4h-3.5a2 2 0 0 0-1.4.6L8.5 6H5a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2z" />
    <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
    <path d="M12 11h3" />
  </svg>
);

export default EquineTherapyIcon;
