import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ShieldAlert,
  HelpCircle,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();

  const navItems = isAdmin
    ? [
        {
          name: 'All Service Requests',
          path: '/admin',
          icon: ShieldAlert,
        },
        {
          name: 'Create Service Request',
          path: '/requests/create',
          icon: PlusCircle,
        },
      ]
    : [
        {
          name: 'My Service Requests',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Submit New Request',
          path: '/requests/create',
          icon: PlusCircle,
        },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between lg:hidden mb-4 pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase text-slate-400">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 px-3 py-2 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <p className="text-xs font-semibold text-indigo-900">
              Role: <span className="capitalize font-bold text-indigo-600">{user?.role}</span>
            </p>
            <p className="text-[11px] text-indigo-700/80 mt-0.5">
              {isAdmin
                ? 'Full administrative control over all requests.'
                : 'Manage and track your technical requests.'}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Need IT help? Contact IT Desk at #4000</span>
          </div>
        </div>
      </aside>
    </>
  );
};
