import React from 'react';

const statusStyles = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusDots = {
  Open: 'bg-blue-500',
  'In Progress': 'bg-amber-500 animate-pulse',
  Resolved: 'bg-emerald-500',
  Closed: 'bg-slate-400',
};

export const StatusBadge = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dot = statusDots[status] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};
