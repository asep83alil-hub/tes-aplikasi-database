import React from 'react';
import { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const statusStyles: { [key in AttendanceStatus]: { container: string; dot: string; } } = {
  [AttendanceStatus.PRESENT]: { container: 'bg-success/10 text-success', dot: 'bg-success' },
  [AttendanceStatus.ABSENT]: { container: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  [AttendanceStatus.PERMIT]: { container: 'bg-amber-500/10 text-amber-500', dot: 'bg-amber-500' },
  [AttendanceStatus.PENDING]: { container: 'bg-warning/10 text-warning', dot: 'bg-warning' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = statusStyles[status];
  return (
    <div className={`inline-flex items-center gap-x-2 px-3 py-1 text-xs font-medium rounded-full ${styles.container} ${className}`}>
      <span className={`h-2 w-2 rounded-full ${styles.dot}`}></span>
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;