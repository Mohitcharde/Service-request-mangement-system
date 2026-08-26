import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { RequestForm } from '../components/requests/RequestForm';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, HelpCircle } from 'lucide-react';

export const CreateRequestPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      const res = await requestService.createRequest(formData);
      const createdId = res.data?._id;
      setTimeout(() => {
        if (createdId) {
          navigate(`/requests/${createdId}`);
        } else {
          navigate(isAdmin ? '/admin' : '/dashboard');
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create New Service Request
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below to submit a technical issue or equipment request to the IT team.
        </p>
      </div>

      {/* Info helper note */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3 text-xs text-indigo-900 max-w-3xl">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Helpful Tip for Faster Resolution:</p>
          <p className="mt-0.5 text-indigo-800/90">
            Be as specific as possible in your description. Include error messages, device identifiers, or specific steps that trigger the issue.
          </p>
        </div>
      </div>

      {/* Reusable Form */}
      <RequestForm onSubmit={handleCreate} isLoading={loading} />
    </div>
  );
};
