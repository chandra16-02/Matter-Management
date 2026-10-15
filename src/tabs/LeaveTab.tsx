import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  LeaveRequest,
  LeaveType,
  Holiday,
  EmployeeProfile,
  UserRole,
  LeaveBalance,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import {
  calculateDaysBetween,
  formatDatePretty,
  getTodayDateStr,
} from '../utils/timeHelpers';

interface LeaveTabProps {
  leaves: LeaveRequest[];
  holidays: Holiday[];
  employees: EmployeeProfile[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  searchQuery: string;
  onApplyLeave: (leave: LeaveRequest) => void;
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
  onDeleteLeave: (leaveId: string) => void;
}

const DEFAULT_QUOTAS: LeaveBalance = {
  casual: 12,
  sick: 10,
  earned: 15,
  rh: 2,
};

export const LeaveTab: React.FC<LeaveTabProps> = ({
  leaves,
  holidays,
  employees,
  currentRole,
  currentEmployee,
  searchQuery,
  onApplyLeave,
  onApproveLeave,
  onRejectLeave,
  onDeleteLeave,
}) => {
  const todayStr = getTodayDateStr();

  // Application form state
  const [selectedEmpId, setSelectedEmpId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [formSubmittedMsg, setFormSubmittedMsg] = useState(false);

  // Active view tab: "applications" | "balances" | "holidays"
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'balances' | 'holidays'>('applications');

  // Selected employee for balance checking
  const activeTargetEmp =
    currentRole === 'Employee'
      ? currentEmployee
      : employees.find((e) => e.id === selectedEmpId) || currentEmployee;

  // Calculate used leaves for target employee
  const targetApprovedLeaves = leaves.filter(
    (l) => l.employeeId === activeTargetEmp?.id && l.status === 'Approved'
  );

  const usedCasual = targetApprovedLeaves
    .filter((l) => l.leaveType === 'Casual Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedSick = targetApprovedLeaves
    .filter((l) => l.leaveType === 'Sick Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedEarned = targetApprovedLeaves
    .filter((l) => l.leaveType === 'Earned Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedRH = targetApprovedLeaves
    .filter((l) => l.leaveType === 'Restricted Holiday')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const remainingBalances = {
    casual: Math.max(0, DEFAULT_QUOTAS.casual - usedCasual),
    sick: Math.max(0, DEFAULT_QUOTAS.sick - usedSick),
    earned: Math.max(0, DEFAULT_QUOTAS.earned - usedEarned),
    rh: Math.max(0, DEFAULT_QUOTAS.rh - usedRH),
  };

  // Day count calculation
  const calculatedDays = calculateDaysBetween(fromDate, toDate);

  // Validation warnings
  const isDateRangeInvalid = calculatedDays === -1;

  let currentCategoryBalance = remainingBalances.casual;
  if (leaveType === 'Sick Leave') currentCategoryBalance = remainingBalances.sick;
  if (leaveType === 'Earned Leave') currentCategoryBalance = remainingBalances.earned;
  if (leaveType === 'Restricted Holiday') currentCategoryBalance = remainingBalances.rh;

  const isBalanceInsufficient = calculatedDays > 0 && calculatedDays > currentCategoryBalance;

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDateRangeInvalid) {
      alert("Error: 'To date' cannot be before 'From date'!");
      return;
    }
    if (isBalanceInsufficient) {
      alert(`Warning: Insufficient leave balance! Available: ${currentCategoryBalance} days, Requested: ${calculatedDays} days.`);
    }

    const emp = currentRole === 'Employee' ? currentEmployee : employees.find((x) => x.id === selectedEmpId);
    if (!emp) return;

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType,
      fromDate,
      toDate,
      daysCount: Math.max(1, calculatedDays),
      reason,
      status: 'Pending',
      appliedDate: todayStr,
    };

    onApplyLeave(newLeave);
    setReason('');
    setFormSubmittedMsg(true);
    setTimeout(() => setFormSubmittedMsg(false), 3000);
  };

  // Filter leaves
  const filteredLeaves = leaves
    .filter((item) => {
      if (currentRole === 'Employee') {
        // Employee can see all or own, typically their own + company dashboard
        return true;
      }
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.employeeName.toLowerCase().includes(q) ||
        item.leaveType.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));

  return (
    <div className="space-y-6">
      {/* Sub tabs and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'applications'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌴 Leave Requests & Apply
          </button>
          <button
            onClick={() => setActiveSubTab('balances')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'balances'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Leave Balances
          </button>
          <button
            onClick={() => setActiveSubTab('holidays')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'holidays'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗓️ Holidays & RH Calendar
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Approving leaves automatically creates &apos;On Leave&apos; entries in attendance</span>
        </div>
      </div>

      {activeSubTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply Leave Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Apply for Leave</h3>
                <p className="text-xs text-slate-500">Automatic day count calculation & quota validation</p>
              </div>
            </div>

            {formSubmittedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Leave application submitted successfully! Pending approval.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Employee Name
                </label>
                {currentRole === 'Employee' ? (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800">
                    {currentEmployee?.name || 'Self'}
                  </div>
                ) : (
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.designation})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Casual Leave">Casual Leave (CL) - Balance: {remainingBalances.casual}</option>
                  <option value="Sick Leave">Sick Leave (SL) - Balance: {remainingBalances.sick}</option>
                  <option value="Earned Leave">Earned Leave (EL) - Balance: {remainingBalances.earned}</option>
                  <option value="Restricted Holiday">Restricted Holiday (RH) - Balance: {remainingBalances.rh}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Calculated Days and Validation Feedback */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Counted Days:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {calculatedDays > 0 ? `${calculatedDays} ${calculatedDays > 1 ? 'days' : 'day'}` : '0 days'}
                  </span>
                </div>

                {isDateRangeInvalid && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>⚠️ Invalid date range! &apos;To date&apos; cannot be before &apos;From date&apos;.</span>
                  </div>
                )}

                {isBalanceInsufficient && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Insufficient leave balance! Available: {currentCategoryBalance} days, Requested: {calculatedDays} days.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Attending brother's wedding / Medical appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isDateRangeInvalid}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 font-semibold text-sm text-white shadow-sm transition-all"
              >
                Submit Leave Application
              </button>
            </form>
          </div>

          {/* Leave Requests Table (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Leave Applications & Approval Status</h3>
                  <p className="text-xs text-slate-500">
                    Employees can apply for leave; Approvals authorized by Managing Director and Manager.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                          No leave requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {item.employeeName}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                            {item.leaveType}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {formatDatePretty(item.fromDate)}
                            {item.fromDate !== item.toDate ? ` to ${formatDatePretty(item.toDate)}` : ''}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-xs bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-800">
                              {item.daysCount} d
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[180px] truncate" title={item.reason}>
                            {item.reason}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {(currentRole === 'Managing Director' || currentRole === 'Manager') && item.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => onApproveLeave(item.id)}
                                    title="Approve leave (auto creates On Leave attendance)"
                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => onRejectLeave(item.id)}
                                    title="Reject leave"
                                    className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {currentRole === 'Admin' && item.status === 'Pending' && (
                                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  Pending Director / Manager Approval
                                </span>
                              )}

                              {currentRole !== 'Employee' && (
                                <button
                                  onClick={() => onDeleteLeave(item.id)}
                                  title="Delete record"
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {currentRole === 'Employee' && (
                                <span className="text-xs text-slate-400 italic">
                                  {item.status === 'Pending' ? 'In Director Review' : item.status}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredLeaves.length} leave requests</span>
              <span className="font-medium text-emerald-700">
                Approved leaves directly link with Attendance Register.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Balances */}
      {activeSubTab === 'balances' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Leave Balances Overview</h3>
              <p className="text-xs text-slate-500">
                Annual leave quotas and consumed days calculated live from approved leaves.
              </p>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Active Employee: <strong>{activeTargetEmp?.name}</strong> ({activeTargetEmp?.department})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Casual Leave (CL)</span>
              <div className="text-3xl font-extrabold text-indigo-950">{remainingBalances.casual} <span className="text-sm font-medium text-indigo-500">/ {DEFAULT_QUOTAS.casual}</span></div>
              <p className="text-xs text-indigo-700">{usedCasual} days utilized</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sick Leave (SL)</span>
              <div className="text-3xl font-extrabold text-emerald-950">{remainingBalances.sick} <span className="text-sm font-medium text-emerald-500">/ {DEFAULT_QUOTAS.sick}</span></div>
              <p className="text-xs text-emerald-700">{usedSick} days utilized</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Earned Leave (EL)</span>
              <div className="text-3xl font-extrabold text-amber-950">{remainingBalances.earned} <span className="text-sm font-medium text-amber-500">/ {DEFAULT_QUOTAS.earned}</span></div>
              <p className="text-xs text-amber-800">{usedEarned} days utilized</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Restricted Holiday (RH)</span>
              <div className="text-3xl font-extrabold text-purple-950">{remainingBalances.rh} <span className="text-sm font-medium text-purple-500">/ {DEFAULT_QUOTAS.rh}</span></div>
              <p className="text-xs text-purple-700">{usedRH} days utilized (Optional festivals)</p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Holidays & RH */}
      {activeSubTab === 'holidays' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Company Holiday & RH Calendar 2026-2027</h3>
              <p className="text-xs text-slate-500">
                Employees can avail up to 2 Restricted Holidays (RH) annually in addition to mandatory holidays.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all space-y-3 bg-slate-50/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{h.name}</h4>
                  {h.isRestricted ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      RH (Restricted)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Mandatory
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 font-medium">
                  {formatDatePretty(h.date)} • {h.dayOfWeek}
                </div>

                <p className="text-xs text-slate-500">{h.description}</p>

                {h.isRestricted && (
                  <button
                    onClick={() => {
                      setLeaveType('Restricted Holiday');
                      setFromDate(h.date);
                      setToDate(h.date);
                      setReason(`Availing RH on occasion of ${h.name}`);
                      setActiveSubTab('applications');
                    }}
                    className="w-full mt-2 py-2 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                  >
                    Select this RH in Leave Form →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
