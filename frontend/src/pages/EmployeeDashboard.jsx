import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { StatCards } from '../components/common/StatCards';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SearchFilterToolbar } from '../components/common/SearchFilterToolbar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        sortBy,
        order,
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const res = await requestService.getRequests(params);
      setRequests(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(
        err.response?.data?.message || 'Failed to load your service requests.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, sortBy, order]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRequests();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchRequests]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategory('');
    setSortBy('createdAt');
    setOrder('desc');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Service Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your submitted technical assistance requests.
          </p>
        </div>
        <Link
          to="/requests/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Request</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <StatCards stats={stats} />

      {/* Search & Filter Toolbar */}
      <SearchFilterToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        category={category}
        setCategory={setCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        onReset={handleResetFilters}
        searchPlaceholder="Search your requests..."
      />

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Request Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <LoadingSpinner text="Loading your service requests..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No service requests found."
          description={
            search || status || priority || category
              ? "No requests matched your active filters. Try adjusting your search query or clear filters."
              : "You haven't submitted any service requests yet."
          }
          actionText="Create Request"
          actionLink="/requests/create"
          onReset={
            search || status || priority || category ? handleResetFilters : null
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Title & Description</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Priority</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Submitted</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/requests/${req._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {req.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                        {req.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {req.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      <Link
                        to={`/requests/${req._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <Link
                        to={`/requests/${req._id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="divide-y divide-slate-100 md:hidden">
            {requests.map((req) => (
              <div key={req._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/requests/${req._id}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600 text-sm"
                  >
                    {req.title}
                  </Link>
                  <StatusBadge status={req.status} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {req.category}
                  </span>
                  <PriorityBadge priority={req.priority} />
                  <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/requests/${req._id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer / Summary */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {requests.length} of {stats.total} total requests</span>
          </div>
        </div>
      )}
    </div>
  );
};
