import React from 'react';

const AssessmentReportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V6.5L15.5 2z" />
    <path d="M15 2v5h5" />
    <path d="M10 16s.8-1.1 2-1.1 2 1.1 2 1.1" />
    <path d="M10 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M14 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

export default AssessmentReportIcon;
