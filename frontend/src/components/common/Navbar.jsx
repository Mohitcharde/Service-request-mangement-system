import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Menu, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-indigo-600 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight tracking-tight">
                  Service Desk
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Request Management
                </span>
              </div>
            </Link>
          </div>

          {/* Right section: User Profile & Logout */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium capitalize flex items-center gap-1">
                  {isAdmin ? (
                    <Shield className="w-2.5 h-2.5 text-indigo-600 inline" />
                  ) : (
                    <User className="w-2.5 h-2.5 text-slate-500 inline" />
                  )}
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
