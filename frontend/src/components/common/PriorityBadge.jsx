import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';

const priorityConfig = {
  High: {
    style: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
  },
  Medium: {
    style: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
  Low: {
    style: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ArrowDown,
  },
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const config = priorityConfig[priority] || {
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${config.style} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  );
};
