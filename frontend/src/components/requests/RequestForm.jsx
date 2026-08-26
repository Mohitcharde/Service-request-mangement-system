import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  ArrowLeft,
  Layers,
  FileText,
  Tag,
  Flame,
} from 'lucide-react';

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const RequestForm = ({
  initialData = null,
  isEdit = false,
  onSubmit,
  isLoading = false,
}) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    priority: 'Medium',
    status: 'Open',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Hardware',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Open',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters long';
    } else if (formData.description.trim().length > 3000) {
      newErrors.description = 'Description cannot exceed 3000 characters';
    }

    if (!CATEGORIES.includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }

    if (!PRIORITIES.includes(formData.priority)) {
      newErrors.priority = 'Please select a valid priority';
    }

    if (isEdit && isAdmin && !STATUSES.includes(formData.status)) {
      newErrors.status = 'Please select a valid status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');

    if (!validate()) {
      return;
    }

    try {
      // Clean payload: if not admin or not edit, don't submit status
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      };

      if (isEdit && isAdmin) {
        payload.status = formData.status;
      }

      await onSubmit(payload);
      setServerSuccess(
        isEdit
          ? 'Service request updated successfully!'
          : 'Service request created successfully!'
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        'An unexpected error occurred while saving the request.';
      setServerError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Alert Messages */}
      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Error:</span> {serverError}
          </div>
        </div>
      )}

      {serverSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>{serverSuccess}</div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Request Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. MacBook Pro battery draining quickly"
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 placeholder-slate-400 ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
            </p>
          )}
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Priority <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
            {errors.priority && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.priority}
              </p>
            )}
          </div>
        </div>

        {/* Status Field (Admin Edit Mode Only) */}
        {isEdit && isAdmin && (
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-indigo-900 mb-1.5"
            >
              Request Status (Admin Control)
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full sm:w-64 px-4 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-950 cursor-pointer font-medium"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-indigo-700">
              Change status as the ticket progresses through triage and resolution.
            </p>
          </div>
        )}

        {/* Description Field */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide steps to reproduce, affected software versions, error codes, or specific equipment IDs..."
            className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 placeholder-slate-400 leading-relaxed ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          <div className="mt-1.5 flex justify-between items-center text-xs">
            {errors.description ? (
              <p className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            ) : (
              <span className="text-slate-400">Min 5 characters</span>
            )}
            <span className="text-slate-400">
              {formData.description.length} / 3000
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isEdit ? 'Update Request' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};
