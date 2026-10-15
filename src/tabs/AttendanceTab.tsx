import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Plus,
  Trash2,
  Filter,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  EmployeeProfile,
  OfficeSettings,
  UserRole,
  LeaveRequest,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import {
  getCurrentTimeStr,
  getTodayDateStr,
  evaluateCheckInPunctuality,
  calculateWorkHours,
  formatHours,
  formatDatePretty,
} from '../utils/timeHelpers';

interface AttendanceTabProps {
  attendanceList: AttendanceRecord[];
  employees: EmployeeProfile[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  officeSettings: OfficeSettings;
  leaves: LeaveRequest[];
  searchQuery: string;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (recordId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendanceList,
  employees,
  currentRole,
  currentEmployee,
  officeSettings,
  leaves,
  searchQuery,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
  onNavigateTab,
}) => {
  const todayStr = getTodayDateStr();

  // Active sub-view: "today" | "register" | "summary"
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'register' | 'summary'>('today');

  // Selected month for Monthly Summary (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.slice(0, 7)); // e.g. "2026-10"

  // Manual entry modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [formEmployeeId, setFormEmployeeId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [formDate, setFormDate] = useState(todayStr);
  const [formCheckIn, setFormCheckIn] = useState('10:00');
  const [formCheckOut, setFormCheckOut] = useState('18:30');
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('Present');
  const [formRemarks, setFormRemarks] = useState('');

  // Check if current employee has a profile with a name
  const hasValidProfile = Boolean(currentEmployee?.name && currentEmployee.name.trim().length > 0);

  // Check if employee has an approved leave for today
  const hasApprovedLeaveToday = leaves.some(
    (l) =>
      l.employeeId === currentEmployee?.id &&
      l.status === 'Approved' &&
      l.fromDate <= todayStr &&
      l.toDate >= todayStr
  );

  // Today's attendance record for current employee
  const todayEmployeeRecord = attendanceList.find(
    (a) => a.employeeId === currentEmployee?.id && a.date === todayStr
  );

  // Handle 1-click Check-in
  const handleCheckInNow = (overrideTime?: string) => {
    if (!hasValidProfile) {
      alert('Please save your name and profile in Self Service first before checking in!');
      onNavigateTab('self-service');
      return;
    }

    if (hasApprovedLeaveToday) {
      alert('Your leave is approved for today! Check-in is not required.');
      return;
    }

    const checkInTime = overrideTime || getCurrentTimeStr();
    const punctuality = evaluateCheckInPunctuality(checkInTime, officeSettings);

    if (todayEmployeeRecord) {
      // update check-in
      const updated: AttendanceRecord = {
        ...todayEmployeeRecord,
        checkIn: checkInTime,
        status: 'Present',
        isLate: punctuality.isLate,
        lateMinutes: punctuality.lateMinutes,
        workHours: calculateWorkHours(checkInTime, todayEmployeeRecord.checkOut),
        source: '1-click',
      };
      onUpdateAttendance(updated);
    } else {
      // create new record
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        date: todayStr,
        checkIn: checkInTime,
        checkOut: '',
        status: 'Present',
        workHours: 0,
        isLate: punctuality.isLate,
        lateMinutes: punctuality.lateMinutes,
        source: '1-click',
      };
      onAddAttendance(newRecord);
    }
  };

  // Handle 1-click Check-out
  const handleCheckOutNow = () => {
    if (!todayEmployeeRecord || !todayEmployeeRecord.checkIn) {
      alert('Please check in first before checking out!');
      return;
    }
    const checkOutTime = getCurrentTimeStr();
    const hours = calculateWorkHours(todayEmployeeRecord.checkIn, checkOutTime);
    const updated: AttendanceRecord = {
      ...todayEmployeeRecord,
      checkOut: checkOutTime,
      workHours: hours,
    };
    onUpdateAttendance(updated);
  };

  // Handle Manual Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === formEmployeeId);
    if (!emp) return;

    const punctuality =
      formStatus === 'Present' || formStatus === 'Half Day' || formStatus === 'WFH'
        ? evaluateCheckInPunctuality(formCheckIn, officeSettings)
        : { isLate: false, lateMinutes: 0 };

    const hours =
      formStatus === 'Absent' || formStatus === 'On Leave'
        ? 0
        : calculateWorkHours(formCheckIn, formCheckOut);

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: formDate,
      checkIn: formStatus === 'Absent' || formStatus === 'On Leave' ? '' : formCheckIn,
      checkOut: formStatus === 'Absent' || formStatus === 'On Leave' ? '' : formCheckOut,
      status: formStatus,
      workHours: hours,
      isLate: punctuality.isLate,
      lateMinutes: punctuality.lateMinutes,
      remarks: formRemarks,
      source: 'manual',
    };

    onAddAttendance(record);
    setIsManualModalOpen(false);
    setFormRemarks('');
  };

  // Filter attendance records by global search query and role
  const filteredRecords = attendanceList
    .filter((rec) => {
      if (currentRole === 'Employee') {
        // Employee views records related to themselves or all public registers
        return true;
      }
      return true;
    })
    .filter((rec) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        rec.employeeName.toLowerCase().includes(q) ||
        rec.status.toLowerCase().includes(q) ||
        rec.date.includes(q) ||
        (rec.remarks && rec.remarks.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute Monthly Summary
  const monthlyRecords = attendanceList.filter((a) => a.date.startsWith(selectedMonth));
  const monthlySummary = employees.map((emp) => {
    const empRecs = monthlyRecords.filter((a) => a.employeeId === emp.id);
    const presentCount = empRecs.filter((r) => r.status === 'Present').length;
    const absentCount = empRecs.filter((r) => r.status === 'Absent').length;
    const halfDayCount = empRecs.filter((r) => r.status === 'Half Day').length;
    const wfhCount = empRecs.filter((r) => r.status === 'WFH').length;
    const onLeaveCount = empRecs.filter((r) => r.status === 'On Leave').length;
    const lateCount = empRecs.filter(
      (r) => r.isLate && (r.status === 'Present' || r.status === 'WFH' || r.status === 'Half Day')
    ).length;
    const totalHours = empRecs.reduce((sum, r) => sum + (r.workHours || 0), 0);

    return {
      employee: emp,
      presentCount,
      absentCount,
      halfDayCount,
      wfhCount,
      onLeaveCount,
      lateCount,
      totalHours: Math.round(totalHours * 10) / 10,
      totalDays: empRecs.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'today'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🕘 Today&apos;s Check-in / Out
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Attendance Register
          </button>
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'summary'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Monthly Summary
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!hasValidProfile) {
                alert('Please save your profile in Self Service first!');
                onNavigateTab('self-service');
                return;
              }
              setFormEmployeeId(currentEmployee?.id || employees[0]?.id || '');
              setIsManualModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Manual Entry / Correction
          </button>
        </div>
      </div>

      {/* Subtab 1: Today's Check-in / Check-out Card */}
      {activeSubTab === 'today' && (
        <div className="space-y-6">
          {/* Profile Warning if no name */}
          {!hasValidProfile && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Profile Name Not Configured!</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Please set up and save your name in the Self Service tab before performing daily check-in.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('self-service')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0"
              >
                Go to Self Service →
              </button>
            </div>
          )}

          {/* Approved Leave Alert for Today */}
          {hasApprovedLeaveToday && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Your Leave is Approved for Today!</h4>
                <p className="text-xs text-blue-700">
                  Manager/HR has approved your leave, and your status is automatically marked as &apos;On Leave&apos;. No check-in required today.
                </p>
              </div>
            </div>
          )}

          {/* Big Check-in/Out Interactive Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <Clock className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Today&apos;s Check-in / Check-out</h3>
                      <p className="text-xs text-slate-500">
                        Office Standard Time: <strong>{officeSettings.officeStartTime} AM</strong> (Grace: {officeSettings.gracePeriodMinutes} mins)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</div>
                  <div className="text-sm font-bold text-slate-900">{formatDatePretty(todayStr)}</div>
                </div>
              </div>

              {/* Status display for current employee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs font-medium text-slate-500">Check-in Time</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {todayEmployeeRecord?.checkIn || 'Not checked in'}
                    </span>
                  </div>
                  {todayEmployeeRecord?.checkIn && (
                    <div className="pt-1">
                      {todayEmployeeRecord.isLate ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ⚠️ {todayEmployeeRecord.lateMinutes} min late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ✅ On time
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs font-medium text-slate-500">Check-out Time & Hours</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {todayEmployeeRecord?.checkOut || 'Active Shift'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Total Hours: <strong>{formatHours(todayEmployeeRecord?.workHours || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleCheckInNow()}
                  disabled={Boolean(todayEmployeeRecord?.checkIn) || hasApprovedLeaveToday}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  {todayEmployeeRecord?.checkIn ? 'Already Checked-in' : '1-Click Check In'}
                </button>

                <button
                  onClick={handleCheckOutNow}
                  disabled={!todayEmployeeRecord?.checkIn || Boolean(todayEmployeeRecord?.checkOut)}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  {todayEmployeeRecord?.checkOut ? 'Checked Out' : '1-Click Check Out'}
                </button>
              </div>

              {/* Simulation buttons for testing late vs on-time */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Test Time Simulator:
                </span>
                <button
                  onClick={() => handleCheckInNow('09:55')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors"
                >
                  Simulate 09:55 AM (On time)
                </button>
                <button
                  onClick={() => handleCheckInNow('10:12')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors"
                >
                  Simulate 10:12 AM (Grace period)
                </button>
                <button
                  onClick={() => handleCheckInNow('10:35')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 transition-colors"
                >
                  Simulate 10:35 AM (35 min late)
                </button>
              </div>
            </div>

            {/* Right side Today Overview */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  Today&apos;s Team Attendance
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time office presence breakdown for {formatDatePretty(todayStr)}
                </p>

                <div className="space-y-3 mt-6">
                  {employees.map((emp) => {
                    const rec = attendanceList.find((a) => a.employeeId === emp.id && a.date === todayStr);
                    const isPresent = rec?.status === 'Present' || rec?.status === 'WFH' || rec?.status === 'Half Day';
                    return (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between py-2 border-b border-slate-800 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">{emp.designation}</div>
                        </div>

                        <div>
                          {rec ? (
                            <div className="text-right">
                              <StatusBadge status={rec.status} size="sm" />
                              {rec.checkIn && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  In: {rec.checkIn} {rec.isLate ? `(⚠️ ${rec.lateMinutes}m)` : ''}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Not checked in</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Headcount: {employees.length}</span>
                <button
                  onClick={() => setActiveSubTab('register')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View Full Register →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Attendance Register */}
      {activeSubTab === 'register' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Attendance Register</h3>
              <p className="text-xs text-slate-500">
                Daily logs, check-in, check-out, work hours, and punctuality status badges
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {currentRole === 'Employee'
                ? 'ℹ️ Employees can add their attendance. Edit/delete permissions reserved for Managing Director and Admin.'
                : '👑 Managing Director / Admin full access: Edit, Delete, and Correction permissions.'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4">Work Hours</th>
                  <th className="py-3.5 px-4">Late / On-Time Badge</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {rec.employeeName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {formatDatePretty(rec.date)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {rec.checkIn || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {rec.checkOut || '—'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {formatHours(rec.workHours)}
                        </td>
                        <td className="py-3 px-4">
                          {rec.status === 'Present' || rec.status === 'WFH' || rec.status === 'Half Day' ? (
                            rec.isLate ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                ⚠️ {rec.lateMinutes} min late
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ✅ On time
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={rec.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                          {rec.remarks || (rec.source ? `Source: ${rec.source}` : '—')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {currentRole !== 'Employee' ? (
                            <button
                              onClick={() => onDeleteAttendance(rec.id)}
                              title="Delete record (Manager/HR only)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">View only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Monthly Attendance Summary */}
      {activeSubTab === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Monthly Attendance Summary</h3>
              <p className="text-xs text-slate-500">
                Per-employee breakdown of Present, Absent, Half Day, WFH, On Leave, and Late arrivals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Present</th>
                  <th className="py-3.5 px-4 text-center">Absent</th>
                  <th className="py-3.5 px-4 text-center">Half Day</th>
                  <th className="py-3.5 px-4 text-center">WFH</th>
                  <th className="py-3.5 px-4 text-center">On Leave</th>
                  <th className="py-3.5 px-4 text-center">Late Count</th>
                  <th className="py-3.5 px-4 text-right">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummary.map((sum) => (
                  <tr key={sum.employee.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{sum.employee.name}</div>
                      <div className="text-xs text-slate-400">{sum.employee.designation}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {sum.employee.department}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        {sum.presentCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-700">
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
                        {sum.absentCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                        {sum.halfDayCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                        {sum.wfhCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200">
                        {sum.onLeaveCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {sum.lateCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {sum.lateCount} times late
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          0 late (Punctual)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {sum.totalHours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Manual Attendance Entry / Correction</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee</label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  disabled={currentRole === 'Employee'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  required
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Present">Present</option>
                    <option value="WFH">WFH (Work From Home)</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              {formStatus !== 'Absent' && formStatus !== 'On Leave' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Check-in Time</label>
                    <input
                      type="time"
                      value={formCheckIn}
                      onChange={(e) => setFormCheckIn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Check-out Time</label>
                    <input
                      type="time"
                      value={formCheckOut}
                      onChange={(e) => setFormCheckOut(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Regularized biometric miss / Late client call"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
