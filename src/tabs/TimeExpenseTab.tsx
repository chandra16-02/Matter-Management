import React, { useState } from 'react';
import {
  Clock,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Calendar,
  Sparkles,
  Plane,
  Utensils,
  Hotel,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  TimesheetEntry,
  ExpenseClaim,
  ExpenseCategory,
  EmployeeProfile,
  UserRole,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { formatDatePretty, getTodayDateStr } from '../utils/timeHelpers';

interface TimeExpenseTabProps {
  timesheets: TimesheetEntry[];
  expenses: ExpenseClaim[];
  employees: EmployeeProfile[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  searchQuery: string;
  onAddTimesheet: (entry: TimesheetEntry) => void;
  onDeleteTimesheet: (entryId: string) => void;
  onAddExpense: (claim: ExpenseClaim) => void;
  onApproveExpense: (expenseId: string) => void;
  onRejectExpense: (expenseId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const TimeExpenseTab: React.FC<TimeExpenseTabProps> = ({
  timesheets,
  expenses,
  employees,
  currentRole,
  currentEmployee,
  searchQuery,
  onAddTimesheet,
  onDeleteTimesheet,
  onAddExpense,
  onApproveExpense,
  onRejectExpense,
  onDeleteExpense,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timesheet' | 'expenses'>('expenses');
  const todayStr = getTodayDateStr();

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expEmpId, setExpEmpId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [expDate, setExpDate] = useState(todayStr);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Travel');
  const [expAmount, setExpAmount] = useState<number>(1200);
  const [expDesc, setExpDesc] = useState('');
  const [expReceipt, setExpReceipt] = useState('');

  // Add Timesheet Modal
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeEmpId, setTimeEmpId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [timeDate, setTimeDate] = useState(todayStr);
  const [timeProject, setTimeProject] = useState('Core Product Platform');
  const [timeTask, setTimeTask] = useState('');
  const [timeHours, setTimeHours] = useState<number>(8.0);

  // Totals calculations
  const totalHours = timesheets.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const pendingExpensesSum = pendingExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const approvedExpensesSum = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filter expenses
  const filteredExpenses = expenses
    .filter((e) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.employeeName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Filter timesheets
  const filteredTimesheets = timesheets
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.employeeName.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.task.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = currentRole === 'Employee' ? currentEmployee : employees.find((x) => x.id === expEmpId);
    if (!emp) return;

    const newClaim: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: expDate,
      category: expCategory,
      amount: expAmount,
      description: expDesc,
      receiptNumber: expReceipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
    };

    onAddExpense(newClaim);
    setIsExpenseModalOpen(false);
    setExpDesc('');
    setExpReceipt('');
  };

  const handleTimesheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = currentRole === 'Employee' ? currentEmployee : employees.find((x) => x.id === timeEmpId);
    if (!emp) return;

    const newEntry: TimesheetEntry = {
      id: `time-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: timeDate,
      project: timeProject,
      task: timeTask,
      hours: timeHours,
      status: 'Submitted',
    };

    onAddTimesheet(newEntry);
    setIsTimeModalOpen(false);
    setTimeTask('');
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'Travel':
        return <Plane className="w-3.5 h-3.5 text-blue-500" />;
      case 'Food':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'Stay':
        return <Hotel className="w-3.5 h-3.5 text-purple-500" />;
      case 'Office':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'expenses'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💰 Expense Claims ({expenses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('timesheet')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'timesheet'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏳ Timesheet ({timesheets.length} entries)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'expenses' ? (
            <button
              onClick={() => {
                setExpEmpId(currentEmployee?.id || employees[0]?.id || '');
                setIsExpenseModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Submit Expense Claim
            </button>
          ) : (
            <button
              onClick={() => {
                setTimeEmpId(currentEmployee?.id || employees[0]?.id || '');
                setIsTimeModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Timesheet Hours
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Expenses */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-700 uppercase">Pending Expenses</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{pendingExpensesSum.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{pendingExpenses.length} claims awaiting review</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Approved Reimbursements</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                ₹{approvedExpensesSum.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Cleared for payroll payout</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Expense Categories</span>
              <div className="text-sm font-semibold text-slate-800 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px]">Travel</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px]">Food</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px]">Stay</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px]">Office</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">Other</span>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Expense Claims Register</h3>
                <p className="text-xs text-slate-500">
                  Categories: Travel, Food, Stay, Office, Other. Status: Approved (Green), Pending (Amber), Rejected (Red).
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {currentRole === 'Managing Director'
                  ? '🏢 Managing Director: Authorized to Approve & Reject reimbursement claims.'
                  : currentRole === 'Manager'
                  ? '💼 Manager: Authorized to Approve & Reject reimbursement claims.'
                  : currentRole === 'Admin'
                  ? '👑 Admin: Audit & review claims. Reimbursement approval reserved for Managing Director / Manager.'
                  : 'ℹ️ Employee: File expense reimbursement claims.'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                        No expense claims found.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDatePretty(exp.date)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {exp.employeeName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                            {getCategoryIcon(exp.category)}
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={exp.description}>
                          {exp.description}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                          {exp.receiptNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(currentRole === 'Managing Director' || currentRole === 'Manager') && exp.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => onApproveExpense(exp.id)}
                                  title="Approve reimbursement claim"
                                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onRejectExpense(exp.id)}
                                  title="Reject reimbursement claim"
                                  className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {currentRole === 'Admin' && exp.status === 'Pending' && (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                Pending Director / Manager Approval
                              </span>
                            )}

                            {currentRole !== 'Employee' && (
                              <button
                                onClick={() => onDeleteExpense(exp.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {currentRole === 'Employee' && (
                              <span className="text-xs text-slate-400 italic">
                                {exp.status === 'Pending' ? 'In Director Review' : exp.status}
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
        </div>
      )}

      {/* Subtab 2: Timesheets */}
      {activeSubTab === 'timesheet' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Timesheet & Hours Logged</h3>
              <p className="text-xs text-slate-500">
                Total hours logged across team projects: <strong>{totalHours} hrs</strong>
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {currentRole === 'Employee'
                ? 'ℹ️ Employee logs hours. Deletions reserved for Managing Director & Admin.'
                : '👑 Managing Director / Admin: Full timesheet audit.'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Hours Logged</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No timesheet entries found.
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {formatDatePretty(entry.date)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {entry.employeeName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 text-xs">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {entry.project}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[240px] truncate" title={entry.task}>
                        {entry.task}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {entry.hours} hrs
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {currentRole !== 'Employee' ? (
                          <button
                            onClick={() => onDeleteTimesheet(entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Logged</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Submit Expense Claim */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Submit Expense Claim</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee</label>
                  {currentRole === 'Employee' ? (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                      {currentEmployee.name}
                    </div>
                  ) : (
                    <select
                      value={expEmpId}
                      onChange={(e) => setExpEmpId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Travel">Travel (Flight/Cab/Train)</option>
                    <option value="Food">Food (Meals/Team Lunch)</option>
                    <option value="Stay">Stay (Hotel/Accommodation)</option>
                    <option value="Office">Office (Equipment/Supplies)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description / Business Purpose
                </label>
                <textarea
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Flight tickets to Mumbai for client meeting"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Receipt / Invoice Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-98231 or UBER-IND-991"
                  value={expReceipt}
                  onChange={(e) => setExpReceipt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Timesheet */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Log Work Hours</h3>
              <button
                onClick={() => setIsTimeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTimesheetSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee</label>
                  {currentRole === 'Employee' ? (
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                      {currentEmployee.name}
                    </div>
                  ) : (
                    <select
                      value={timeEmpId}
                      onChange={(e) => setTimeEmpId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={timeDate}
                    onChange={(e) => setTimeDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project</label>
                  <input
                    type="text"
                    value={timeProject}
                    onChange={(e) => setTimeProject(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hours Logged</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={timeHours}
                    onChange={(e) => setTimeHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Task Summary</label>
                <textarea
                  rows={2}
                  value={timeTask}
                  onChange={(e) => setTimeTask(e.target.value)}
                  placeholder="e.g. Integrated check-in late status calculation logic..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTimeModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Timesheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
