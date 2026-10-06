import React from 'react';

const UserManagementIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 11.26c.26-.43.26-.94 0-1.37l-1.32-2.22c-.2-.34-.53-.56-.9-.56h-2.58c-.37 0-.71.22-.9.56l-1.32 2.22c-.26.43-.26.94 0 1.37l1.32 2.22c.2.34.53.56.9.56h2.58c.37 0 .71-.22.9-.56l1.32-2.22z" />
  </svg>
);

export default UserManagementIcon;
