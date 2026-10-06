import React from 'react';
import { AssessmentStatus } from '../types';

interface AssessmentStatusBadgeProps {
  status: AssessmentStatus;
}

const statusStyles: { [key in AssessmentStatus]: string } = {
  [AssessmentStatus.NOT_ASSESSED]: 'bg-muted/20 text-muted',
  [AssessmentStatus.IN_PROGRESS]: 'bg-warning/20 text-warning',
  [AssessmentStatus.COMPLETED]: 'bg-success/20 text-success',
};

const AssessmentStatusBadge: React.FC<AssessmentStatusBadgeProps> = ({ status }) => {
  const styles = statusStyles[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>
      {status}
    </span>
  );
};

export default AssessmentStatusBadge;
