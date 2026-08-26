import React from 'react';
import {
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  Archive,
} from 'lucide-react';

export const StatCards = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Total Requests',
      value: stats.total ?? 0,
      icon: Inbox,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Open',
      value: stats.open ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'In Progress',
      value: stats.inProgress ?? 0,
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Resolved',
      value: stats.resolved ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Closed',
      value: stats.closed ?? 0,
      icon: Archive,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-white p-4 rounded-xl border ${card.borderColor} shadow-sm transition-all duration-200 hover:shadow`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-medium text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl md:text-3xl font-bold text-slate-800">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
