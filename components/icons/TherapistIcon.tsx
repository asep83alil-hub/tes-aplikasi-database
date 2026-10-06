import React from 'react';

const TherapistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 20.5c-2.4-2.4-2.4-6.6 0-9s6.6-2.4 9 0" />
    <path d="M12 11.5V15" />
    <path d="M10.5 13H15" />
    <path d="M18.5 3.5c2.4 2.4 2.4 6.6 0 9s-6.6 2.4-9 0" />
    <path d="M12 2.5V6" />
    <path d="M13.5 4.5H9" />
  </svg>
);

export default TherapistIcon;