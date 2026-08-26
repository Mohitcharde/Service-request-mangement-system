import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const homeLink = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 shadow-md shadow-amber-100">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        404
      </h1>
      <h2 className="text-xl font-semibold text-slate-800 mb-3">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The page or service request you are looking for does not exist or has been moved.
      </p>
      <Link
        to={homeLink}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-200 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
