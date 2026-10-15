import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Briefcase,
  User,
  Crown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { UserRole, EmployeeProfile } from '../types/hrms';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  employees: EmployeeProfile[];
  currentEmployee: EmployeeProfile;
  onEmployeeSelect: (employee: EmployeeProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
  employees,
  currentEmployee,
  onEmployeeSelect,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchEmp, setSearchEmp] = useState('');
  const [activeGuideTab, setActiveGuideTab] = useState<'login' | 'mobile'>('login');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const rolesConfig: {
    role: UserRole;
    title: string;
    icon: any;
    color: string;
    badgeBg: string;
    description: string;
    permissions: string[];
  }[] = [
    {
      role: 'Managing Director',
      title: 'Managing Director',
      icon: Crown,
      color: 'from-blue-600 to-indigo-700 text-white',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Executive authority: Approves all leaves, reimbursement claims & reviews org metrics.',
      permissions: ['Leave Approvals (Final)', 'Reimbursement Approvals', 'Org Hierarchy Oversight', 'Company Analytics'],
    },
    {
      role: 'Manager',
      title: 'Manager',
      icon: Briefcase,
      color: 'from-amber-500 to-orange-600 text-white',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Team leadership: Approves team leaves and reimbursement claims, conducts reviews.',
      permissions: ['Leave Approvals', 'Reimbursement Approvals', 'Team Performance Reviews', 'Project Timesheets'],
    },
    {
      role: 'Admin',
      title: 'Admin',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700 text-white',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'People Operations: Employee roster, office timings, hiring pipeline & exit clearances.',
      permissions: ['Employee Management', 'Office Timings Config', 'Recruitment Pipeline', 'Asset & Exit Offboarding'],
    },
    {
      role: 'Employee',
      title: 'Employee',
      icon: User,
      color: 'from-slate-700 to-slate-900 text-white',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Staff portal: Self-attendance punch in/out, leave application & expense reimbursement submission.',
      permissions: ['Self Check-in / Check-out', 'Apply for Leaves', 'Submit Reimbursements', 'Log Daily Timesheet'],
    },
  ];

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchEmp.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
              <Smartphone className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Mobile & User Login</h2>
              <p className="text-xs text-slate-300">
                Choose your role or active profile to login & operate on mobile or desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveGuideTab('login')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeGuideTab === 'login'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Select Role & Profile</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('mobile')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeGuideTab === 'mobile'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Setup Guide</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeGuideTab === 'login' && (
            <>
              {/* Current Active Status Card */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                      Currently Logged In As
                    </div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{currentRole}</span>
                      {(currentRole === 'Employee' || currentRole === 'Manager') && (
                        <span className="text-slate-600 font-normal">
                          • {currentEmployee?.name} ({currentEmployee?.designation})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-indigo-600 text-white font-semibold px-2.5 py-1 rounded-lg">
                  Active Session
                </span>
              </div>

              {/* 1. Step: Select Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Role / Role Chunein:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rolesConfig.map((item) => {
                    const isSelected = currentRole === item.role;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.role}
                        onClick={() => onRoleChange(item.role)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xs`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-sm text-slate-900">{item.title}</span>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <span className="text-xs text-slate-400">Select</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-snug mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.permissions.slice(0, 2).map((perm, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              ✓ {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Step: If Employee or Manager, select individual profile */}
              {(currentRole === 'Employee' || currentRole === 'Manager') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Select Employee Profile / Apna Naam Chunein:
                    </label>
                    <span className="text-xs text-slate-500">{employees.length} Employees</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by name, role, department..."
                    value={searchEmp}
                    onChange={(e) => setSearchEmp(e.target.value)}
                    className="w-full mb-2.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredEmployees.map((emp) => {
                      const isEmpSelected = currentEmployee?.id === emp.id;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => onEmployeeSelect(emp)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isEmpSelected
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {emp.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-xs text-slate-900 truncate">
                                {emp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {emp.designation} • {emp.department}
                              </div>
                            </div>
                          </div>
                          {isEmpSelected && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {activeGuideTab === 'mobile' && (
            <div className="space-y-4">
              {/* App URL Share Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  Mobile me App Kholne Ka Link
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Ye link apne mobile ke browser (Google Chrome, Safari, ya Brave) me open karein:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* In-app Install Card for Apple & Android */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Direct Mobile App Install
                  </div>
                  <p className="text-[11px] text-indigo-700/80 mt-0.5">
                    Apple iPhone (Safari) ya Android (Chrome) me 1-click me install karein
                  </p>
                </div>
                <PWAInstallButton />
              </div>

              {/* 3 Step Guide */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Mobile Browser me Link Open Karein
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Apne phone me WhatsApp ya email se upar diya gaya link bhejein aur Google Chrome (Android) ya Safari (iPhone) me kholein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Home Screen pe Add Karein (Native App ki Tarah)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      • <strong>Android (Chrome)</strong>: Top-right 3-dots menu par click karein aur <strong>"Add to Home screen"</strong> ya <strong>"Install app"</strong> chunein.<br />
                      • <strong>iPhone (Safari)</strong>: Niche Share icon (box with arrow) par tap karein aur <strong>"Add to Home Screen"</strong> chunein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Login / Role Chunein & Punch-in Karein
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Top bar me <strong>Role</strong> chunein (Managing Director, Manager, Admin, Employee) aur agar Employee hain toh apna naam select karein. Iske baad aap Attendance Punch-in, Leave Apply, ya Expense approval asani se kar sakte hain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current: <strong className="text-slate-800">{currentRole}</strong>
            {(currentRole === 'Employee' || currentRole === 'Manager') && (
              <span> ({currentEmployee?.name})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Done / Continue
          </button>
        </div>
      </div>
    </div>
  );
};
