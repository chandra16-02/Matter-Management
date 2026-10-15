/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Briefcase,
  TrendingUp,
  Receipt,
  Laptop,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import {
  UserRole,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  JobOpening,
  Candidate,
  PerformanceReview,
  TimesheetEntry,
  ExpenseClaim,
  Asset,
  ExitRecord,
  OfficeSettings,
  BirthdayWish,
} from './types/hrms';

import {
  DEFAULT_OFFICE_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_HOLIDAYS,
  getInitialAttendance,
  INITIAL_LEAVES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_PERFORMANCE,
  INITIAL_TIMESHEETS,
  INITIAL_EXPENSES,
  INITIAL_ASSETS,
  INITIAL_EXITS,
  INITIAL_BIRTHDAY_WISHES,
  loadFromStorage,
  saveToStorage,
  resetAllStorage,
} from './utils/storage';

import { getDateRangeArray } from './utils/timeHelpers';

import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { LoginModal } from './components/LoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { DashboardTab } from './tabs/DashboardTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { LeaveTab } from './tabs/LeaveTab';
import { SelfServiceTab } from './tabs/SelfServiceTab';
import { RecruitmentTab } from './tabs/RecruitmentTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TimeExpenseTab } from './tabs/TimeExpenseTab';
import { AssetExitTab } from './tabs/AssetExitTab';

export default function App() {
  // 1. Roles & Active Employee
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = loadFromStorage<string>('userRole', 'Admin');
    if (saved === 'HR Admin') return 'Admin';
    if (saved === 'Manager') return 'Manager';
    if (saved === 'Managing Director' || saved === 'Admin' || saved === 'Employee') return saved;
    return 'Admin';
  });

  const [employees, setEmployees] = useState<EmployeeProfile[]>(() =>
    loadFromStorage<EmployeeProfile[]>('employees', INITIAL_EMPLOYEES)
  );

  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(() =>
    loadFromStorage<string>('currentEmployeeId', 'emp-1')
  );

  // Active employee object
  const currentEmployee =
    employees.find((e) => e.id === currentEmployeeId) || employees[0] || INITIAL_EMPLOYEES[0];

  // 2. Global Search & Tab navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 3. Office & Timing Settings
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>(() =>
    loadFromStorage<OfficeSettings>('officeSettings', DEFAULT_OFFICE_SETTINGS)
  );

  // 4. Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5. Data Entities
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() =>
    loadFromStorage<AttendanceRecord[]>('attendance', getInitialAttendance())
  );

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() =>
    loadFromStorage<LeaveRequest[]>('leaves', INITIAL_LEAVES)
  );

  const [holidays, setHolidays] = useState<Holiday[]>(() =>
    loadFromStorage<Holiday[]>('holidays', INITIAL_HOLIDAYS)
  );

  const [jobs, setJobs] = useState<JobOpening[]>(() =>
    loadFromStorage<JobOpening[]>('jobs', INITIAL_JOBS)
  );

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    loadFromStorage<Candidate[]>('candidates', INITIAL_CANDIDATES)
  );

  const [performance, setPerformance] = useState<PerformanceReview[]>(() =>
    loadFromStorage<PerformanceReview[]>('performance', INITIAL_PERFORMANCE)
  );

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(() =>
    loadFromStorage<TimesheetEntry[]>('timesheets', INITIAL_TIMESHEETS)
  );

  const [expenses, setExpenses] = useState<ExpenseClaim[]>(() =>
    loadFromStorage<ExpenseClaim[]>('expenses', INITIAL_EXPENSES)
  );

  const [assets, setAssets] = useState<Asset[]>(() =>
    loadFromStorage<Asset[]>('assets', INITIAL_ASSETS)
  );

  const [exits, setExits] = useState<ExitRecord[]>(() =>
    loadFromStorage<ExitRecord[]>('exits', INITIAL_EXITS)
  );

  const [birthdayWishes, setBirthdayWishes] = useState<BirthdayWish[]>(() =>
    loadFromStorage<BirthdayWish[]>('birthdayWishes', INITIAL_BIRTHDAY_WISHES)
  );

  // Sync to local storage
  useEffect(() => saveToStorage('userRole', currentRole), [currentRole]);
  useEffect(() => saveToStorage('employees', employees), [employees]);
  useEffect(() => saveToStorage('currentEmployeeId', currentEmployeeId), [currentEmployeeId]);
  useEffect(() => saveToStorage('officeSettings', officeSettings), [officeSettings]);
  useEffect(() => saveToStorage('attendance', attendanceList), [attendanceList]);
  useEffect(() => saveToStorage('leaves', leaves), [leaves]);
  useEffect(() => saveToStorage('holidays', holidays), [holidays]);
  useEffect(() => saveToStorage('jobs', jobs), [jobs]);
  useEffect(() => saveToStorage('candidates', candidates), [candidates]);
  useEffect(() => saveToStorage('performance', performance), [performance]);
  useEffect(() => saveToStorage('timesheets', timesheets), [timesheets]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('assets', assets), [assets]);
  useEffect(() => saveToStorage('exits', exits), [exits]);
  useEffect(() => saveToStorage('birthdayWishes', birthdayWishes), [birthdayWishes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ===================== Handlers =====================

  // Reset to Defaults
  const handleResetData = () => {
    resetAllStorage();
    setEmployees(INITIAL_EMPLOYEES);
    setCurrentEmployeeId('emp-1');
    setCurrentRole('Admin');
    setOfficeSettings(DEFAULT_OFFICE_SETTINGS);
    setAttendanceList(getInitialAttendance());
    setLeaves(INITIAL_LEAVES);
    setHolidays(INITIAL_HOLIDAYS);
    setJobs(INITIAL_JOBS);
    setCandidates(INITIAL_CANDIDATES);
    setPerformance(INITIAL_PERFORMANCE);
    setTimesheets(INITIAL_TIMESHEETS);
    setExpenses(INITIAL_EXPENSES);
    setAssets(INITIAL_ASSETS);
    setExits(INITIAL_EXITS);
    setBirthdayWishes(INITIAL_BIRTHDAY_WISHES);
    showToast('All HRMS sample data restored successfully!');
  };

  // Birthday wish celebratory notification dispatch
  const handleSendBirthdayWish = (wish: BirthdayWish) => {
    setBirthdayWishes((prev) => [wish, ...prev]);
    showToast(`🎉 Celebratory Birthday Notification dispatched to ${wish.employeeName}!`);
  };

  // Profile Save
  const handleSaveProfile = (updatedProfile: EmployeeProfile) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === updatedProfile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedProfile;
        return copy;
      }
      return [...prev, updatedProfile];
    });
    setCurrentEmployeeId(updatedProfile.id);
    showToast(`Profile for ${updatedProfile.name} saved! Attendance check-in is now unlocked.`);
  };

  // Leave & Attendance Automated Linking
  const handleApproveLeave = (leaveId: string) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) return;

    const approverTitle =
      currentRole === 'Managing Director'
        ? (currentEmployee?.name || 'Managing Director')
        : currentRole === 'Manager'
        ? (currentEmployee?.name || 'Manager')
        : 'Managing Director';

    // 1. Update leave status
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? { ...l, status: 'Approved', approvedBy: approverTitle }
          : l
      )
    );

    // 2. Generate date range array and create 'On Leave' records in attendance
    const dates = getDateRangeArray(leave.fromDate, leave.toDate);
    setAttendanceList((prev) => {
      const updatedList = [...prev];

      dates.forEach((d) => {
        const existingIdx = updatedList.findIndex(
          (a) => a.employeeId === leave.employeeId && a.date === d
        );

        if (existingIdx >= 0) {
          // Replace with On Leave
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            status: 'On Leave',
            source: 'leave-auto',
            remarks: `Approved ${leave.leaveType}`,
          };
        } else {
          // Create new record for this date
          updatedList.push({
            id: `att-leave-${Date.now()}-${d}`,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            date: d,
            checkIn: '',
            checkOut: '',
            status: 'On Leave',
            workHours: 0,
            isLate: false,
            lateMinutes: 0,
            source: 'leave-auto',
            remarks: `Approved ${leave.leaveType}`,
          });
        }
      });

      return updatedList;
    });

    showToast(`Leave approved! Automatically registered 'On Leave' for ${dates.length} ${dates.length > 1 ? 'days' : 'day'} in the Attendance Register.`);
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Rejected' } : l))
    );
    showToast('Leave request rejected.');
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    showToast('Leave record deleted.');
  };

  // Attendance Handlers
  const handleAddAttendance = (rec: AttendanceRecord) => {
    setAttendanceList((prev) => [rec, ...prev]);
    showToast(`Attendance entry saved for ${rec.employeeName}`);
  };

  const handleUpdateAttendance = (rec: AttendanceRecord) => {
    setAttendanceList((prev) =>
      prev.map((a) => (a.id === rec.id ? rec : a))
    );
    showToast(`Attendance updated: ${rec.checkIn ? `In: ${rec.checkIn}` : ''} ${rec.checkOut ? `Out: ${rec.checkOut}` : ''}`);
  };

  const handleDeleteAttendance = (recId: string) => {
    setAttendanceList((prev) => prev.filter((a) => a.id !== recId));
    showToast('Attendance log removed.');
  };

  // Expense Handlers
  const handleApproveExpense = (id: string) => {
    const approverTitle =
      currentRole === 'Managing Director'
        ? (currentEmployee?.name || 'Managing Director')
        : currentRole === 'Manager'
        ? (currentEmployee?.name || 'Manager')
        : 'Managing Director';

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: 'Approved', approvedBy: approverTitle } : e
      )
    );
    showToast(
      currentRole === 'Manager'
        ? 'Reimbursement claim approved successfully by Manager.'
        : 'Reimbursement claim approved successfully by Managing Director.'
    );
  };

  const handleRejectExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Rejected' } : e))
    );
    showToast('Expense claim rejected.');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense claim deleted.');
  };

  // Navigation Tabs Definition
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;
  const pendingExpensesCount = expenses.filter((e) => e.status === 'Pending').length;
  const fnfPendingCount = exits.filter((e) => e.fnfStatus !== 'Cleared').length;
  const openJobsCount = jobs.filter((j) => j.status === 'Open').length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    {
      id: 'leave',
      label: 'Leave & Holiday',
      icon: Calendar,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'attendance', label: 'Attendance', icon: Clock, badge: null },
    { id: 'self-service', label: 'Self Service', icon: User, badge: null },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      badge: openJobsCount > 0 ? openJobsCount : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    { id: 'performance', label: 'Performance', icon: TrendingUp, badge: null },
    {
      id: 'time-expense',
      label: 'Time & Expense',
      icon: Receipt,
      badge: pendingExpensesCount > 0 ? pendingExpensesCount : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'asset-exit',
      label: 'Asset & Exit',
      icon: Laptop,
      badge: fnfPendingCount > 0 ? fnfPendingCount : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header with Role Switcher, Search & Settings */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        employees={employees}
        currentEmployee={currentEmployee}
        onEmployeeSelect={(emp) => setCurrentEmployeeId(emp.id)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        officeSettings={officeSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Navigation Tab Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-[97px] md:top-[85px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-indigo-700' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            attendanceList={attendanceList}
            leaves={leaves}
            jobs={jobs}
            candidates={candidates}
            timesheets={timesheets}
            expenses={expenses}
            assets={assets}
            exits={exits}
            holidays={holidays}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            birthdayWishes={birthdayWishes}
            onSendBirthdayWish={handleSendBirthdayWish}
            onNavigateTab={setActiveTab}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveTab
            leaves={leaves}
            holidays={holidays}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            searchQuery={searchQuery}
            onApplyLeave={(nl) => {
              setLeaves((prev) => [nl, ...prev]);
              showToast('Leave request submitted successfully!');
            }}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onDeleteLeave={handleDeleteLeave}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            attendanceList={attendanceList}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            officeSettings={officeSettings}
            leaves={leaves}
            searchQuery={searchQuery}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'self-service' && (
          <SelfServiceTab
            currentEmployee={currentEmployee}
            onSaveProfile={handleSaveProfile}
            leaves={leaves}
            attendanceList={attendanceList}
            assets={assets}
            expenses={expenses}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'recruitment' && (
          <RecruitmentTab
            jobs={jobs}
            candidates={candidates}
            currentRole={currentRole}
            searchQuery={searchQuery}
            onAddJob={(nj) => {
              setJobs((prev) => [nj, ...prev]);
              showToast(`New job created: ${nj.title}`);
            }}
            onUpdateJobStatus={(jobId, st) => {
              setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: st } : j)));
              showToast('Job status updated.');
            }}
            onAddCandidate={(nc) => {
              setCandidates((prev) => [nc, ...prev]);
              showToast(`Candidate ${nc.name} added to pipeline.`);
            }}
            onUpdateCandidateStage={(candId, st, details) => {
              setCandidates((prev) =>
                prev.map((c) => (c.id === candId ? { ...c, stage: st, ...details } : c))
              );
              showToast(`Candidate stage updated to ${st}.`);
            }}
            onDeleteCandidate={(id) => {
              setCandidates((prev) => prev.filter((c) => c.id !== id));
              showToast('Candidate removed.');
            }}
            onDeleteJob={(id) => {
              setJobs((prev) => prev.filter((j) => j.id !== id));
              showToast('Job opening removed.');
            }}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab
            reviews={performance}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            searchQuery={searchQuery}
            onAddReview={(nr) => {
              setPerformance((prev) => [nr, ...prev]);
              showToast('Appraisal submitted successfully.');
            }}
            onUpdateReview={(ur) => {
              setPerformance((prev) => prev.map((r) => (r.id === ur.id ? ur : r)));
              showToast(`Appraisal reviewed! Average rating: ${ur.averageRating.toFixed(1)}`);
            }}
            onDeleteReview={(id) => {
              setPerformance((prev) => prev.filter((r) => r.id !== id));
              showToast('Appraisal deleted.');
            }}
          />
        )}

        {activeTab === 'time-expense' && (
          <TimeExpenseTab
            timesheets={timesheets}
            expenses={expenses}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            searchQuery={searchQuery}
            onAddTimesheet={(nt) => {
              setTimesheets((prev) => [nt, ...prev]);
              showToast(`Logged ${nt.hours} hours on ${nt.project}.`);
            }}
            onDeleteTimesheet={(id) => {
              setTimesheets((prev) => prev.filter((t) => t.id !== id));
              showToast('Timesheet record removed.');
            }}
            onAddExpense={(ne) => {
              setExpenses((prev) => [ne, ...prev]);
              showToast(`Submitted ₹${ne.amount} expense claim for ${ne.category}.`);
            }}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'asset-exit' && (
          <AssetExitTab
            assets={assets}
            exits={exits}
            employees={employees}
            currentRole={currentRole}
            currentEmployee={currentEmployee}
            searchQuery={searchQuery}
            onAddAsset={(na) => {
              setAssets((prev) => [na, ...prev]);
              showToast(`Hardware asset ${na.assetTag} registered.`);
            }}
            onUpdateAsset={(ua) => {
              setAssets((prev) => prev.map((a) => (a.id === ua.id ? ua : a)));
              showToast('Asset status updated.');
            }}
            onDeleteAsset={(id) => {
              setAssets((prev) => prev.filter((a) => a.id !== id));
              showToast('Asset deleted.');
            }}
            onAddExit={(ne) => {
              setExits((prev) => [ne, ...prev]);
              showToast(`Resignation recorded for ${ne.employeeName}. FnF Pending.`);
            }}
            onUpdateExit={(ue) => {
              setExits((prev) => prev.map((e) => (e.id === ue.id ? ue : e)));
              showToast(`Exit updated: FnF status is ${ue.fnfStatus}.`);
            }}
            onDeleteExit={(id) => {
              setExits((prev) => prev.filter((e) => e.id !== id));
              showToast('Exit record removed.');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={officeSettings}
        onSave={(newSettings) => {
          setOfficeSettings(newSettings);
          showToast(`Office timing updated: ${newSettings.officeStartTime} AM (Grace: ${newSettings.gracePeriodMinutes}m)`);
        }}
        isHRorManager={currentRole !== 'Employee'}
      />

      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetData}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          showToast(`Role switched to ${role}`);
        }}
        employees={employees}
        currentEmployee={currentEmployee}
        onEmployeeSelect={(emp) => {
          setCurrentEmployeeId(emp.id);
          showToast(`Switched active profile to ${emp.name}`);
        }}
      />

      {/* Offline connectivity status banner */}
      <OfflineIndicator />
    </div>
  );
}
