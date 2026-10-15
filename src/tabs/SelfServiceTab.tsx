import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  PhoneCall,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  Laptop,
  Receipt,
  Clock,
  Sparkles,
  AlertCircle,
  Cake,
} from 'lucide-react';
import {
  EmployeeProfile,
  LeaveRequest,
  AttendanceRecord,
  Asset,
  ExpenseClaim,
  LeaveBalance,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { getTodayDateStr, formatDatePretty } from '../utils/timeHelpers';

interface SelfServiceTabProps {
  currentEmployee: EmployeeProfile;
  onSaveProfile: (profile: EmployeeProfile) => void;
  leaves: LeaveRequest[];
  attendanceList: AttendanceRecord[];
  assets: Asset[];
  expenses: ExpenseClaim[];
  onNavigateTab: (tabId: string) => void;
}

const DEFAULT_QUOTAS: LeaveBalance = {
  casual: 12,
  sick: 10,
  earned: 15,
  rh: 2,
};

export const SelfServiceTab: React.FC<SelfServiceTabProps> = ({
  currentEmployee,
  onSaveProfile,
  leaves,
  attendanceList,
  assets,
  expenses,
  onNavigateTab,
}) => {
  const [formData, setFormData] = useState<EmployeeProfile>(currentEmployee);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(currentEmployee);
  }, [currentEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter your full name!');
      return;
    }
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Calculate personal leave balance dynamically based on employee name / ID
  const myApprovedLeaves = leaves.filter(
    (l) => l.employeeId === currentEmployee.id && l.status === 'Approved'
  );

  const usedCasual = myApprovedLeaves
    .filter((l) => l.leaveType === 'Casual Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedSick = myApprovedLeaves
    .filter((l) => l.leaveType === 'Sick Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedEarned = myApprovedLeaves
    .filter((l) => l.leaveType === 'Earned Leave')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const usedRH = myApprovedLeaves
    .filter((l) => l.leaveType === 'Restricted Holiday')
    .reduce((sum, l) => sum + l.daysCount, 0);

  const personalBalance = {
    casual: Math.max(0, DEFAULT_QUOTAS.casual - usedCasual),
    sick: Math.max(0, DEFAULT_QUOTAS.sick - usedSick),
    earned: Math.max(0, DEFAULT_QUOTAS.earned - usedEarned),
    rh: Math.max(0, DEFAULT_QUOTAS.rh - usedRH),
  };

  // Personal Today Attendance
  const todayStr = getTodayDateStr();
  const myTodayAtt = attendanceList.find(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  // My Assets
  const myAssets = assets.filter((a) => a.assignedToEmployeeId === currentEmployee.id);

  // My Expenses
  const myExpenses = expenses.filter((e) => e.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {currentEmployee.name ? currentEmployee.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentEmployee.name || 'Setup Your Profile'}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentEmployee.designation || 'Employee'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentEmployee.department || 'Department'} • Joined {formatDatePretty(currentEmployee.joiningDate)}
              </p>
            </div>
          </div>

          <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Daily attendance check-in unlocks once your profile name is saved.</span>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Profile successfully saved! Name updated. You can now use 1-click Check-in on the Attendance tab.
            </span>
          </div>
        )}
      </div>

      {/* Two Column Layout: Profile Form & My Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Employee Profile Details</h3>
              <p className="text-xs text-slate-500">
                Update personal information, designation, and emergency contact details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Engineering / Product / Sales"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Lead Engineer / Specialist"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Emergency Phone
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 98111 22334 (Family/Doctor)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Flat No, Building, Street, City, State, Pincode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Date of Joining
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-pink-500" /> Date of Birth (Birthday)
                </label>
                <div className="relative">
                  <Cake className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Used on the dashboard for birthday reminders and celebratory notifications</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-300 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Personalized Employee Balances & Assigned Assets */}
        <div className="space-y-6">
          {/* Personalized Leave Balances card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Personal Leave Balance</h4>
              <button
                onClick={() => onNavigateTab('leave')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Apply Leave →
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Live balance calculated from your approved leave requests:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 uppercase">Casual (CL)</span>
                <div className="text-xl font-black text-indigo-950 mt-1">{personalBalance.casual} <span className="text-xs font-normal text-indigo-400">/ 12</span></div>
                <span className="text-[10px] text-indigo-600">{usedCasual} used</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Sick (SL)</span>
                <div className="text-xl font-black text-emerald-950 mt-1">{personalBalance.sick} <span className="text-xs font-normal text-emerald-400">/ 10</span></div>
                <span className="text-[10px] text-emerald-600">{usedSick} used</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Earned (EL)</span>
                <div className="text-xl font-black text-amber-950 mt-1">{personalBalance.earned} <span className="text-xs font-normal text-amber-400">/ 15</span></div>
                <span className="text-[10px] text-amber-700">{usedEarned} used</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase">RH (Optional)</span>
                <div className="text-xl font-black text-purple-950 mt-1">{personalBalance.rh} <span className="text-xs font-normal text-purple-400">/ 2</span></div>
                <span className="text-[10px] text-purple-600">{usedRH} used</span>
              </div>
            </div>
          </div>

          {/* Today's Attendance snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Today&apos;s Attendance Status</h4>
            {myTodayAtt ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Check-in:</span>
                  <span className="font-mono font-bold text-slate-900">{myTodayAtt.checkIn || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <StatusBadge status={myTodayAtt.status} />
                </div>
                {myTodayAtt.isLate && (
                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    ⚠️ {myTodayAtt.lateMinutes} min late arrival today
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
                Not checked in yet today.
              </div>
            )}
            <button
              onClick={() => onNavigateTab('attendance')}
              className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Go to Check-in Desk →
            </button>
          </div>

          {/* Assigned Assets */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-600" /> My Assigned Hardware
            </h4>
            {myAssets.length === 0 ? (
              <p className="text-xs text-slate-400">No hardware assets assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {myAssets.map((ast) => (
                  <div key={ast.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-semibold text-slate-900">{ast.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tag: {ast.assetTag} • Issued: {formatDatePretty(ast.issueDate || '')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
