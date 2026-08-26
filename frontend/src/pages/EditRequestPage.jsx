import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { RequestForm } from '../components/requests/RequestForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const EditRequestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await requestService.getRequestById(id);
        setRequest(res.data);
      } catch (err) {
        console.error('Failed to load request:', err);
        setError(
          err.response?.data?.message || 'Failed to load service request for editing.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      await requestService.updateRequest(id, formData);
      setTimeout(() => {
        navigate(`/requests/${id}`);
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 max-w-3xl">
        <LoadingSpinner text="Loading request details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Edit Service Request
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify request details or status.
        </p>
      </div>

      {/* Form */}
      <RequestForm
        initialData={request}
        isEdit={true}
        onSubmit={handleUpdate}
        isLoading={submitting}
      />
    </div>
  );
};
