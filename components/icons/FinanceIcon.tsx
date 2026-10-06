import React from 'react';

const FinanceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2H6" />
    <path d="M12 11v6" />
    <path d="M15 14h-6" />
    <path d="M18 21a2 2 0 0 0 2-2V7H4v12a2 2 0 0 0 2 2Z" />
  </svg>
);

export default FinanceIcon;
