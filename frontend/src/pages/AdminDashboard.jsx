import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { StatCards } from '../components/common/StatCards';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SearchFilterToolbar } from '../components/common/SearchFilterToolbar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Layers,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const AdminDashboard = () => {
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
  const [successMessage, setSuccessMessage] = useState('');

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    requestId: null,
    requestTitle: '',
    loading: false,
  });

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
      console.error('Error fetching admin requests:', err);
      setError(
        err.response?.data?.message || 'Failed to load system service requests.'
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

  const handleQuickStatusChange = async (requestId, newStatus) => {
    try {
      await requestService.updateRequest(requestId, { status: newStatus });
      setSuccessMessage(`Status updated to "${newStatus}"`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update request status'
      );
      setTimeout(() => setError(''), 4000);
    }
  };

  const openDeleteModal = (req) => {
    setDeleteModal({
      isOpen: true,
      requestId: req._id,
      requestTitle: req.title,
      loading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      requestId: null,
      requestTitle: '',
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.requestId) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await requestService.deleteRequest(deleteModal.requestId);
      closeDeleteModal();
      setSuccessMessage('Service request successfully deleted.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete service request'
      );
      closeDeleteModal();
    }
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Service Request Hub
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              <Shield className="w-3 h-3" /> Admin Console
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global view and management for all company technical service requests.
          </p>
        </div>
        <Link
          to="/requests/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-200 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Request</span>
        </Link>
      </div>

      {/* Global Stat Cards */}
      <StatCards stats={stats} />

      {/* Feedback alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
        searchPlaceholder="Search by title or employee name..."
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <LoadingSpinner text="Loading all service requests..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No service requests found."
          description={
            search || status || priority || category
              ? "No requests matched your active filters. Try adjusting your search query or clear filters."
              : "No service requests have been logged in the system yet."
          }
          actionText="Create New Request"
          actionLink="/requests/create"
          onReset={
            search || status || priority || category ? handleResetFilters : null
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Title & Description</th>
                  <th scope="col" className="px-6 py-4">Employee</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Priority</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-6 py-4 max-w-xs">
                      <Link
                        to={`/requests/${req._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {req.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {req.description}
                      </p>
                    </td>

                    {/* Employee Requester */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200">
                          {req.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-800">
                            {req.createdBy?.name || 'Unknown User'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {req.createdBy?.email || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {req.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleQuickStatusChange(req._id, e.target.value)
                        }
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(req.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-1.5">
                      <Link
                        to={`/requests/${req._id}`}
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/requests/${req._id}/edit`}
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                        title="Edit Request"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(req)}
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {requests.map((req) => (
              <div key={req._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/requests/${req._id}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600 text-sm"
                  >
                    {req.title}
                  </Link>
                  <PriorityBadge priority={req.priority} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Requester: <strong className="text-slate-700">{req.createdBy?.name || 'Unknown'}</strong></span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {req.category}
                    </span>
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleQuickStatusChange(req._id, e.target.value)
                      }
                      className="text-xs font-medium px-2 py-0.5 rounded border border-slate-200 bg-white"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(req.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                  <Link
                    to={`/requests/${req._id}`}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/requests/${req._id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(req)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {requests.length} of {stats.total} total system requests</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Service Request"
        message={`Are you sure you want to permanently delete "${deleteModal.requestTitle}"? This action cannot be undone.`}
        confirmText="Delete Request"
        isDanger={true}
        isLoading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
