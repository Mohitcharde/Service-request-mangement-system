import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Layers,
  User,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
} from 'lucide-react';

export const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestService.getRequestById(id);
      setRequest(res.data);
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError(
        err.response?.data?.message || 'Unable to retrieve service request details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await requestService.updateRequest(id, { status: newStatus });
      setRequest(res.data);
      setSuccessMessage(`Status updated to "${newStatus}"`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update request status'
      );
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await requestService.deleteRequest(id);
      setDeleteModalOpen(false);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete service request'
      );
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 max-w-4xl">
        <LoadingSpinner text="Retrieving request details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-4xl space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!request) return null;

  const isOwner = request.createdBy?._id === user?._id;
  const canEdit = isAdmin || isOwner;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isAdmin ? 'Admin Dashboard' : 'My Requests'}</span>
        </button>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {canEdit && (
            <Link
              to={`/requests/${request._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-colors"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit Details</span>
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header section with status & category */}
        <div className="p-6 sm:p-8 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} className="text-sm px-3 py-1" />
            <PriorityBadge priority={request.priority} className="text-sm px-3 py-1" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {request.category}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {request.title}
          </h1>

          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDate(request.createdAt)}
            </span>
            {request.updatedAt !== request.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated {formatDate(request.updatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Content & Requester Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Issue Description
            </h3>
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {request.description}
            </div>
          </div>

          {/* Sidebar Panel: Requester Information & Quick Controls */}
          <div className="space-y-6">
            {/* Requester Profile */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Requester Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {request.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {request.createdBy?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {request.createdBy?.role || 'Employee'}
                    </p>
                  </div>
                </div>
                {request.createdBy?.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{request.createdBy.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Quick Status Control */}
            {isAdmin && (
              <div className="bg-indigo-50/60 p-5 rounded-xl border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Admin Status Control
                </h4>
                <p className="text-xs text-indigo-800">
                  Update lifecycle state for this service ticket:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      disabled={request.status === st}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                        request.status === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs cursor-default'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Service Request"
        message={`Are you sure you want to permanently delete "${request.title}"?`}
        confirmText="Delete Request"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
