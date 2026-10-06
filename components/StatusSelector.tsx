import React, { useState, useRef, useEffect } from 'react';
import { AttendanceStatus } from '../types';
import StatusBadge from './StatusBadge';

interface StatusSelectorProps {
  currentStatus: AttendanceStatus;
  onChange: (newStatus: AttendanceStatus) => void;
}

const statusOptions = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.PENDING,
];

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (status: AttendanceStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full">
        <StatusBadge status={currentStatus} className="w-full justify-center transition hover:scale-105" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-36 z-10 bg-surface border border-surface-light rounded-lg shadow-xl animate-fade-in-up">
          <ul className="p-1 space-y-1">
            {statusOptions.map(status => (
              <li key={status}>
                <button
                  onClick={() => handleSelect(status)}
                  className={`w-full text-left rounded-md px-2 py-1.5 transition-colors text-sm ${
                    status === currentStatus
                      ? 'bg-primary/50 text-white'
                      : 'text-slate-300 hover:bg-surface-light'
                  }`}
                >
                  <StatusBadge status={status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusSelector;