import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Briefcase,
  UserCheck,
  Clock,
  Receipt,
  Laptop,
  UserMinus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cake,
  Gift,
  PartyPopper,
  Heart,
  Send,
  Bell,
  Check,
  X,
  Smile,
} from 'lucide-react';
import {
  AttendanceRecord,
  LeaveRequest,
  JobOpening,
  Candidate,
  TimesheetEntry,
  ExpenseClaim,
  Asset,
  ExitRecord,
  Holiday,
  EmployeeProfile,
  UserRole,
  BirthdayWish,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { OrgHierarchyTree } from '../components/OrgHierarchyTree';
import {
  formatDatePretty,
  getTodayDateStr,
  getUpcomingBirthdays,
  UpcomingBirthdayInfo,
} from '../utils/timeHelpers';

interface DashboardTabProps {
  attendanceList: AttendanceRecord[];
  leaves: LeaveRequest[];
  jobs: JobOpening[];
  candidates: Candidate[];
  timesheets: TimesheetEntry[];
  expenses: ExpenseClaim[];
  assets: Asset[];
  exits: ExitRecord[];
  holidays: Holiday[];
  employees: EmployeeProfile[];
  birthdayWishes: BirthdayWish[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  onNavigateTab: (tabId: string) => void;
  onApproveLeave?: (leaveId: string) => void;
  onRejectLeave?: (leaveId: string) => void;
  onSendBirthdayWish: (wish: BirthdayWish) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  attendanceList,
  leaves,
  jobs,
  candidates,
  timesheets,
  expenses,
  assets,
  exits,
  holidays,
  employees,
  birthdayWishes,
  currentRole,
  currentEmployee,
  onNavigateTab,
  onApproveLeave,
  onRejectLeave,
  onSendBirthdayWish,
}) => {
  const todayStr = getTodayDateStr();

  // Modal state for sending celebratory notification
  const [selectedBirthdayEmp, setSelectedBirthdayEmp] = useState<UpcomingBirthdayInfo | null>(null);
  const [customWishMsg, setCustomWishMsg] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState('₹1,500 Amazon Gift Voucher');
  const [isWishSentSuccess, setIsWishSentSuccess] = useState(false);

  // Metrics calculations
  // 1. Present Today count
  const todayRecords = attendanceList.filter((a) => a.date === todayStr);
  const todayPresentCount = todayRecords.filter(
    (a) => a.status === 'Present' || a.status === 'WFH' || a.status === 'Half Day'
  ).length;

  // 2. Pending leaves count
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  // 3. Open jobs count
  const openJobs = jobs.filter((j) => j.status === 'Open');

  // 4. Candidates & scheduled interviews
  const totalCandidates = candidates.length;
  const scheduledInterviews = candidates.filter((c) => c.stage === 'Interview Scheduled').length;

  // 5. Hours logged (total timesheets)
  const totalHoursLogged = timesheets.reduce((acc, curr) => acc + (curr.hours || 0), 0);

  // 6. Pending expenses (count and sum)
  const pendingExpensesList = expenses.filter((e) => e.status === 'Pending');
  const pendingExpensesSum = pendingExpensesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // 7. Issued assets
  const issuedAssetsCount = assets.filter((a) => a.status === 'Issued').length;

  // 8. FnF Pending
  const fnfPendingCount = exits.filter((e) => e.fnfStatus === 'Pending' || e.fnfStatus === 'In Progress').length;

  // 9. Upcoming holidays sorted by date
  const upcomingHolidays = holidays
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // 10. Upcoming Birthdays calculation
  const allBirthdays = getUpcomingBirthdays(employees, todayStr);
  const todayBirthdays = allBirthdays.filter((b) => b.isToday);
  const nextBirthdays = allBirthdays.filter((b) => !b.isToday).slice(0, 4);

  // Helper to calculate days remaining for holidays
  const getDaysRemainingText = (holidayDateStr: string) => {
    const today = new Date(todayStr + 'T00:00:00');
    const target = new Date(holidayDateStr + 'T00:00:00');
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today 🎉';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const openWishModalForEmployee = (info: UpcomingBirthdayInfo) => {
    setSelectedBirthdayEmp(info);
    setCustomWishMsg(
      `🎂 Happy Birthday, ${info.employee.name}! Wishing you a fabulous year ahead filled with happiness, good health, and immense success. Thank you for being such an integral part of the Matter team! ✨🎉`
    );
    setSelectedVoucher('₹1,500 Amazon Gift Voucher');
    setIsWishSentSuccess(false);
  };

  const handleSendWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBirthdayEmp) return;

    const newWish: BirthdayWish = {
      id: `wish-${Date.now()}`,
      employeeId: selectedBirthdayEmp.employee.id,
      employeeName: selectedBirthdayEmp.employee.name,
      sentBy: currentRole === 'Employee' ? currentEmployee.name : `${currentRole} (${currentEmployee?.name || 'HR Team'})`,
      sentAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      message: customWishMsg,
      voucher: selectedVoucher !== 'None' ? selectedVoucher : undefined,
    };

    onSendBirthdayWish(newWish);
    setIsWishSentSuccess(true);
    setTimeout(() => {
      setSelectedBirthdayEmp(null);
      setIsWishSentSuccess(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Workforce Operations & HRMS Overview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentRole === 'Employee' ? currentEmployee?.name || 'Team Member' : currentRole}!
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Track pending leaves, real-time attendance, open positions, expenses, employee birthdays, and FnF settlements in one unified workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-sm hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              Today&apos;s Check-in / Out
            </button>
            <button
              onClick={() => onNavigateTab('leave')}
              className="px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-medium text-sm border border-indigo-500/40 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-200" />
              Apply Leave
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Present Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Today
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{todayPresentCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {employees.length} Employees</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Present Today</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Checked-in & WFH team members</p>
          </div>
        </div>

        {/* Metric 2: Pending Leaves */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Action Required
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{pendingLeaves.length}</span>
              <span className="text-xs text-slate-400 font-medium">Requests</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Pending Leaves</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Manager/HR Approval</p>
          </div>
        </div>

        {/* Metric 3: Open Jobs */}
        <div
          onClick={() => onNavigateTab('recruitment')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Hiring Active
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{openJobs.length}</span>
              <span className="text-xs text-slate-400 font-medium">Positions</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Open Jobs</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active engineering & design roles</p>
          </div>
        </div>

        {/* Metric 4: Candidates & Interviews */}
        <div
          onClick={() => onNavigateTab('recruitment')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
              Pipeline
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalCandidates}</span>
              <span className="text-xs text-violet-600 font-medium">({scheduledInterviews} Interviews)</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Candidates & Interviews</p>
            <p className="text-[11px] text-slate-400 mt-0.5">In screening, rounds & offer</p>
          </div>
        </div>

        {/* Metric 5: Hours Logged */}
        <div
          onClick={() => onNavigateTab('time-expense')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Timesheet
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalHoursLogged}</span>
              <span className="text-xs text-slate-400 font-medium">Hours Logged</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Productivity Tracker</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Logged across company projects</p>
          </div>
        </div>

        {/* Metric 6: Pending Expenses */}
        <div
          onClick={() => onNavigateTab('time-expense')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {pendingExpensesList.length} Claims
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                ₹{pendingExpensesSum.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Pending Expenses</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Travel, Food, Stay, Office</p>
          </div>
        </div>

        {/* Metric 7: Issued Assets */}
        <div
          onClick={() => onNavigateTab('asset-exit')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Hardware
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{issuedAssetsCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {assets.length} Total</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">Issued Assets</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Laptops, monitors & devices</p>
          </div>
        </div>

        {/* Metric 8: FnF Pending */}
        <div
          onClick={() => onNavigateTab('asset-exit')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <UserMinus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Exit Desk
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{fnfPendingCount}</span>
              <span className="text-xs text-rose-600 font-medium">In Process</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">FnF Pending</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Full & Final settlement clearing</p>
          </div>
        </div>
      </div>

      {/* ================= NEW SECTION: UPCOMING EMPLOYEE BIRTHDAYS & CELEBRATIONS ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/20">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Upcoming Employee Birthdays & Celebrations</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  🎉 Team Life
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Auto-synced from employee profiles; HR can dispatch instant celebratory notifications with custom gift vouchers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              HR Notification Desk
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
              {allBirthdays.length} Profile Birthdays Synced
            </span>
          </div>
        </div>

        {/* 1. If someone's birthday is TODAY */}
        {todayBirthdays.length > 0 && (
          <div className="space-y-3">
            {todayBirthdays.map((bday) => {
              const existingWish = birthdayWishes.find(
                (w) => w.employeeId === bday.employee.id && w.sentAt.includes('2026')
              );

              return (
                <div
                  key={bday.employee.id}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-5 sm:p-6 text-white shadow-lg shadow-pink-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white text-pink-600 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                      🎂
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-yellow-200 mb-1 border border-white/20">
                        <PartyPopper className="w-3.5 h-3.5 text-yellow-200" />
                        TODAY IS {bday.employee.name.toUpperCase()}&apos;S BIRTHDAY! 🎉
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {bday.employee.name}
                        {bday.ageTurning && (
                          <span className="text-pink-100 font-medium text-sm ml-2">
                            (Turning {bday.ageTurning} years old)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-pink-100 mt-0.5">
                        {bday.employee.designation} • {bday.employee.department} Department
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10">
                    {existingWish ? (
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-xs text-white">
                        <div className="flex items-center gap-1.5 font-bold text-yellow-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Celebratory Notification Sent!
                        </div>
                        <div className="text-[11px] text-pink-100 mt-0.5 truncate max-w-xs">
                          {existingWish.voucher ? `Gift: ${existingWish.voucher}` : 'Warm wishes delivered'}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openWishModalForEmployee(bday)}
                        className="px-5 py-3 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
                      >
                        <Gift className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
                        Send Celebratory Notification 🎁
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Upcoming Birthdays Grid (Next in line) */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Coming Up in the Next 30-60 Days
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {nextBirthdays.map((bday) => {
              const existingWish = birthdayWishes.find((w) => w.employeeId === bday.employee.id);

              return (
                <div
                  key={bday.employee.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-pink-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                        {bday.formattedDate}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        In {bday.daysRemaining} days
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {bday.employee.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-sm truncate">{bday.employee.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{bday.employee.designation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {bday.ageTurning ? `Turns ${bday.ageTurning}` : bday.employee.department}
                    </span>

                    {existingWish ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Scheduled
                      </span>
                    ) : (
                      <button
                        onClick={() => openWishModalForEmployee(bday)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Send Wish
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Recent Celebratory Notification History Feed */}
        {birthdayWishes.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" /> Recent Celebratory Notifications Sent by HR
            </h5>
            <div className="divide-y divide-slate-100 bg-slate-50/70 rounded-2xl border border-slate-200 p-2 sm:p-3">
              {birthdayWishes.slice(0, 3).map((w) => (
                <div key={w.id} className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{w.employeeName}</span>
                    <span className="text-slate-500"> — &ldquo;{w.message.slice(0, 80)}...&rdquo;</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {w.voucher && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                        🎁 {w.voucher}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Sent by {w.sentBy} • {w.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= ORGANIZATIONAL HIERARCHY TREE VISUALIZATION ================= */}
      <OrgHierarchyTree
        employees={employees}
        attendanceList={attendanceList}
        todayStr={todayStr}
        currentEmployee={currentEmployee}
        currentRole={currentRole}
        onSelectEmployee={() => {}}
      />

      {/* Two-Column Section: Upcoming Holidays & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Holidays Card (1 column) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Upcoming Holidays</h3>
                  <p className="text-xs text-slate-500">Upcoming company holidays & festivals</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('leave')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Full List <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {upcomingHolidays.map((h) => {
                const countdown = getDaysRemainingText(h.date);
                return (
                  <div key={h.id} className="py-3.5 flex items-start justify-between gap-3 group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{h.name}</span>
                        {h.isRestricted ? (
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                            RH (Restricted)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDatePretty(h.date)} • {h.dayOfWeek}
                      </p>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors whitespace-nowrap">
                      {countdown}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-6 p-4 rounded-b-2xl flex items-center justify-between text-xs text-slate-600">
            <span>Employees can select Restricted Holiday (RH) in leave application.</span>
            <button
              onClick={() => onNavigateTab('leave')}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Apply RH
            </button>
          </div>
        </div>

        {/* Pending Leave Requests & Action Stream (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pending Leave Approvals</h3>
                  <p className="text-xs text-slate-500">
                    Approving leaves automatically creates corresponding &apos;On Leave&apos; attendance entries
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('leave')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all leaves <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-800">All leave requests have been processed!</p>
                <p className="text-xs text-slate-400 mt-1">No pending leave approvals waiting for review.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingLeaves.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{item.employeeName}</span>
                        <StatusBadge status={item.leaveType} />
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.daysCount} {item.daysCount > 1 ? 'days' : 'day'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDatePretty(item.fromDate)} {item.fromDate !== item.toDate ? `to ${formatDatePretty(item.toDate)}` : ''} • Reason: &ldquo;{item.reason}&rdquo;
                      </p>
                    </div>

                    {currentRole === 'Managing Director' || currentRole === 'Manager' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApproveLeave && onApproveLeave(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectLeave && onRejectLeave(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : currentRole === 'Admin' ? (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        Awaiting Director / Manager Approval
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">
                        {item.employeeName === currentEmployee?.name ? 'Your application (Pending Approval)' : 'Pending Approval'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Footer Links */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Permissions: Employees apply for leave; Approvals authorized by Managing Director and Manager.
            </span>
            <button
              onClick={() => onNavigateTab('leave')}
              className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Open Leave & Holiday Tab <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CELEBRATORY NOTIFICATION MODAL ================= */}
      {selectedBirthdayEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Send Celebratory Birthday Notification</h3>
                  <p className="text-xs text-pink-100">Deliver hearty wishes and company perk on behalf of HR</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBirthdayEmp(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendWishSubmit} className="p-6 space-y-4">
              {/* Recipient summary */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedBirthdayEmp.employee.name}</div>
                  <div className="text-xs text-slate-500">
                    {selectedBirthdayEmp.employee.designation} • {selectedBirthdayEmp.employee.department}
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-pink-700 border border-pink-200 shadow-2xs">
                  {selectedBirthdayEmp.isToday ? '🎂 Today 🎉' : `📅 ${selectedBirthdayEmp.formattedDate}`}
                </span>
              </div>

              {/* Message Templates Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Celebratory Message
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomWishMsg(
                        `🎂 Happy Birthday, ${selectedBirthdayEmp.employee.name}! Wishing you a fabulous year ahead filled with happiness, good health, and immense success. Thank you for being such an integral part of Matter! ✨🎉`
                      )
                    }
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-700 border border-slate-200 transition-colors"
                  >
                    Template: Warm & Energetic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomWishMsg(
                        `🎉 Happy Birthday, ${selectedBirthdayEmp.employee.name}! May all your personal and professional dreams come true this year. Cheers to another stellar milestone! 🥂🌟`
                      )
                    }
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-700 border border-slate-200 transition-colors"
                  >
                    Template: Milestones & Cheers
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={customWishMsg}
                  onChange={(e) => setCustomWishMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              {/* Company Gift / Voucher Perk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-pink-600" /> Attach Corporate Gift / Perk Voucher
                </label>
                <select
                  value={selectedVoucher}
                  onChange={(e) => setSelectedVoucher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-pink-500"
                >
                  <option value="₹1,500 Amazon Gift Voucher">🎁 ₹1,500 Amazon Gift Voucher</option>
                  <option value="₹1,000 Swiggy/Zomato Celebration Feast Coupon">🍔 ₹1,000 Swiggy/Zomato Feast Coupon</option>
                  <option value="1 Extra Birthday Privilege Leave Day (Paid)">🌴 1 Extra Birthday Privilege Leave Day (Paid)</option>
                  <option value="Matter Special Swag Hamper">👕 Matter Special Swag Hamper</option>
                  <option value="None">None (Warm Greetings Only)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Voucher details will be dispatched alongside the congratulatory message to the employee.
                </p>
              </div>

              {isWishSentSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Celebratory notification dispatched successfully!</span>
                </div>
              ) : null}

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBirthdayEmp(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWishSentSuccess}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Dispatch Birthday Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
