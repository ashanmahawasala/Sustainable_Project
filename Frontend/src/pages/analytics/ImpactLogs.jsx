import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Recycle,
  HeartHandshake,
  BadgeDollarSign,
  Scale,
  Leaf,
  FileText,
  Filter,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  CalendarRange,
  AlertTriangle,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  getImpactLogs,
  updateImpactLog,
  deleteImpactLog,
} from '../../services/api';

import recordBanner from '../../assets/RecordBanner.png';

import { PageShell, SummaryCard } from '../../shared/PageShell';

const VALID_ACTIONS = ['RECYCLE', 'DONATE', 'SELL'];
const VALID_CATEGORIES = ['Laptop', 'Phone', 'Battery', 'Cable', 'CRT', 'PCB'];
const MAX_SEARCH_LENGTH = 100;

const ImpactLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [filterMessage, setFilterMessage] = useState('');

  const [selectedLog, setSelectedLog] = useState(null);
  const [editForm, setEditForm] = useState({
    weightKg: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!filterMessage) return undefined;

    const timer = setTimeout(() => setFilterMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [filterMessage]);

  useEffect(() => {
    if (actionFilter && !VALID_ACTIONS.includes(actionFilter)) {
      setActionFilter('');
      setFilterMessage('Invalid action filter detected. It was reset.');
    }
  }, [actionFilter]);

  useEffect(() => {
    if (categoryFilter && !VALID_CATEGORIES.includes(categoryFilter)) {
      setCategoryFilter('');
      setFilterMessage('Invalid category filter detected. It was reset.');
    }
  }, [categoryFilter]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await getImpactLogs({
          actionType: actionFilter || undefined,
          category: categoryFilter || undefined,
        });
        setLogs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load impact logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [actionFilter, categoryFilter]);

  const formatNum = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    });

  const validatedKeyword = useMemo(() => {
    const value = searchTerm.trim();

    if (!value) return '';

    if (value.length > MAX_SEARCH_LENGTH) {
      return '';
    }

    return value.toLowerCase();
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    if (!validatedKeyword) return logs;

    return logs.filter((item) => {
      const createdAt = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString().toLowerCase()
        : '';

      return (
        item.userName?.toLowerCase().includes(validatedKeyword) ||
        item.actionType?.toLowerCase().includes(validatedKeyword) ||
        item.category?.toLowerCase().includes(validatedKeyword) ||
        createdAt.includes(validatedKeyword)
      );
    });
  }, [logs, validatedKeyword]);

  const stats = useMemo(() => {
    const totalLogs = filteredLogs.length;
    const totalWeight = filteredLogs.reduce(
      (sum, item) => sum + (Number(item.weightKg) || 0),
      0
    );
    const totalCo2 = filteredLogs.reduce(
      (sum, item) => sum + (Number(item.co2SavedKg) || 0),
      0
    );
    const recycleCount = filteredLogs.filter(
      (item) => item.actionType === 'RECYCLE'
    ).length;

    return {
      totalLogs,
      totalWeight,
      totalCo2,
      recycleCount,
    };
  }, [filteredLogs]);

  const getBadgeStyle = (action) => {
    switch (action) {
      case 'RECYCLE':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'DONATE':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'SELL':
        return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'RECYCLE':
        return <Recycle className="w-4 h-4" />;
      case 'DONATE':
        return <HeartHandshake className="w-4 h-4" />;
      case 'SELL':
        return <BadgeDollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);

    if (value.trim().length > MAX_SEARCH_LENGTH) {
      setSearchError(`Search must be ${MAX_SEARCH_LENGTH} characters or fewer.`);
      return;
    }

    setSearchError('');
  };

  const handleEditClick = (log) => {
    setSelectedLog(log);
    setEditForm({
      weightKg: log.weightKg ?? '',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLog) return;

    if (editForm.weightKg === '' || Number(editForm.weightKg) <= 0) {
      alert('Weight must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);

      const response = await updateImpactLog(selectedLog._id, {
        weightKg: Number(editForm.weightKg),
      });

      setLogs((prev) =>
        prev.map((item) =>
          item._id === selectedLog._id ? response.data : item
        )
      );

      setSelectedLog(null);
      setEditForm({ weightKg: '' });
    } catch (error) {
      console.error('Failed to update impact log:', error);
      alert(error?.response?.data?.message || 'Failed to update impact log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this impact log?'
    );
    if (!confirmed) return;

    try {
      await deleteImpactLog(id);
      setLogs((prev) => prev.filter((item) => item._id !== id));

      if (selectedLog?._id === id) {
        setSelectedLog(null);
        setEditForm({ weightKg: '' });
      }
    } catch (error) {
      console.error('Failed to delete impact log:', error);
      alert(error?.response?.data?.message || 'Failed to delete impact log');
    }
  };

  return (
    <PageShell
      banner={recordBanner}
      bannerAlt="Impact records banner"
      loading={loading}
    >
      <div className="text-center mb-10">
        <p className="text-[#0f55a7] font-semibold text-sm mb-2 uppercase tracking-widest">
          EcoCycle Admin Portal
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Impact Logs
        </h2>
        <p className="mt-3 text-slate-600 max-w-3xl mx-auto leading-7">
          Review all impact activity in one operational workspace, with a clearer
          view of environmental savings, material flow, and action-level
          performance across the platform.
        </p>
      </div>

      {filterMessage && (
        <div className="max-w-5xl mx-auto mb-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3 shadow-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{filterMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-8">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
          <div className="p-8 md:p-10">
            <div className="inline-flex items-center rounded-full bg-[#0f55a7]/5 text-[#0f55a7] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
              Operational Ledger
            </div>

            <h3 className="mt-5 text-3xl font-bold">
              <span className="text-[#1055a7]">Track every impact</span>{' '}
              <span className="text-[#2a9322]">entry with precision</span>
            </h3>

            <p className="mt-4 text-slate-600 leading-8 max-w-2xl">
              Filter impact records by action and category, inspect platform-wide
              material movement, and monitor environmental value through a cleaner
              and more professional administrative view.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                Action:
                <span className="ml-2 font-semibold text-slate-900">
                  {actionFilter || 'All'}
                </span>
              </div>

              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                Category:
                <span className="ml-2 font-semibold text-slate-900">
                  {categoryFilter || 'All'}
                </span>
              </div>

              <div className="inline-flex items-center rounded-full border border-[#4db848]/20 bg-[#4db848]/10 px-4 py-2 text-sm font-semibold text-[#2c8a28]">
                {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Current Snapshot
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Active Records</span>
                  <Database className="w-4 h-4 text-slate-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatNum(stats.totalLogs)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Processed Weight</span>
                  <Scale className="w-4 h-4 text-slate-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-[#0f55a7]">
                  {formatNum(stats.totalWeight)} kg
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">CO₂ Averted</span>
                  <Leaf className="w-4 h-4 text-slate-300" />
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {formatNum(stats.totalCo2)} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          title="Total Records"
          value={formatNum(stats.totalLogs)}
          subtitle="Matched entries in current result set"
          tone="text-[#0f55a7]"
        />
        <SummaryCard
          title="Total Weight"
          value={`${formatNum(stats.totalWeight)} kg`}
          subtitle="Processed material weight"
          tone="text-[#4db848]"
        />
        <SummaryCard
          title="CO₂ Averted"
          value={`${formatNum(stats.totalCo2)} kg`}
          subtitle="Estimated environmental savings"
          tone="text-emerald-600"
        />
        <SummaryCard
          title="Recycle Actions"
          value={formatNum(stats.recycleCount)}
          subtitle="Entries marked as recycle"
          tone="text-violet-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 md:px-8 md:py-6 bg-white">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Records Explorer
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">
                Impact Logs Management
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search, update, and delete impact activities by action, category,
                and record details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`w-full min-w-[210px] rounded-xl border bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:ring-4 ${
                    searchError
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                {searchError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {searchError}
                  </p>
                )}
              </div>

              <div className="relative">
                <SlidersHorizontal className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <select
                  className="w-full min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="RECYCLE">Recycle</option>
                  <option value="DONATE">Donate</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <select
                  className="w-full min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Phone">Phone</option>
                  <option value="Battery">Battery</option>
                  <option value="Cable">Cable</option>
                  <option value="CRT">CRT</option>
                  <option value="PCB">PCB</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Date
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  User
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Action
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Category
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 text-right">
                  Weight
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 text-right">
                  CO₂ Averted
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h4 className="mt-5 text-lg font-bold text-slate-900">
                        No records found
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        There are no impact logs matching the current filters or
                        search term. Adjust the filters to broaden the result set.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-8 py-5 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-slate-300" />
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="font-semibold text-slate-950">
                        {log.userName}
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getBadgeStyle(
                          log.actionType
                        )}`}
                      >
                        {getActionIcon(log.actionType)}
                        {log.actionType}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-sm text-slate-700">
                      {log.category}
                    </td>

                    <td className="px-8 py-5 text-right text-sm font-semibold text-slate-900">
                      {formatNum(log.weightKg)} kg
                    </td>

                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center justify-end gap-1 text-sm font-bold text-emerald-600">
                        +{formatNum(log.co2SavedKg)} kg
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </td>

                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(log)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(log._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Edit Impact Log
          </h3>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">User</p>
              <p className="font-semibold text-slate-900">
                {selectedLog.userName}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Action</p>
              <p className="font-semibold text-slate-900">
                {selectedLog.actionType}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Category</p>
              <p className="font-semibold text-slate-900">
                {selectedLog.category}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleUpdateSubmit}
            className="flex flex-col md:flex-row gap-4 items-start md:items-end"
          >
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={editForm.weightKg}
                onChange={(e) =>
                  setEditForm({ ...editForm, weightKg: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Enter weight"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#0f55a7] px-5 py-3 text-white font-semibold hover:bg-[#0c4688] disabled:opacity-60"
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLog(null);
                  setEditForm({ weightKg: '' });
                }}
                className="rounded-xl bg-slate-200 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  );
};

export default ImpactLogs;