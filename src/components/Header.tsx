import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  User,
  Users,
  Search,
  RotateCcw,
  Sliders,
  Sparkles,
  ChevronDown,
  Smartphone,
} from 'lucide-react';
import { UserRole, EmployeeProfile, OfficeSettings } from '../types/hrms';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  employees: EmployeeProfile[];
  currentEmployee: EmployeeProfile;
  onEmployeeSelect: (employee: EmployeeProfile) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  officeSettings: OfficeSettings;
  onOpenSettings: () => void;
  onOpenReset: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  employees,
  currentEmployee,
  onEmployeeSelect,
  searchQuery,
  onSearchChange,
  officeSettings,
  onOpenSettings,
  onOpenReset,
  onTabChange,
  onOpenLogin,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice: Role status & info */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">
            Office Check-in: <strong className="text-white">{officeSettings.officeStartTime} AM</strong> (Grace: {officeSettings.gracePeriodMinutes} mins on-time)
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            Live Time: <span className="text-emerald-400 font-mono font-semibold">{timeStr}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 py-0.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Click to Switch Role or Employee / Mobile Login"
          >
            <span className="text-slate-400">Role:</span>
            <span className="text-amber-300 font-bold">{currentRole}</span>
            <span className="text-[10px] text-indigo-300 ml-0.5">▾ Switch</span>
          </button>
          {currentRole === 'Employee' && (
            <button
              onClick={() => onTabChange('self-service')}
              className="text-xs text-indigo-300 hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              Logged in as: <strong className="text-white">{currentEmployee?.name || 'Set Name'}</strong>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg tracking-wider">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                  Matter Management
                </h1>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  HRMS Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Workforce & People Operations</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search across all records, leaves, employees, candidates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 hover:bg-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* PWA Install Button for Apple & Android */}
          <PWAInstallButton compact />

          {/* Mobile & Desktop Login / Switch Button */}
          <button
            onClick={onOpenLogin}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Open Mobile Login & Role Switcher"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Login / Switch</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-white text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Managing Director">🏢 Managing Director</option>
              <option value="Manager">💼 Manager</option>
              <option value="Admin">👑 Admin</option>
              <option value="Employee">👤 Employee</option>
            </select>
          </div>

          {/* Active Profile Picker for Employee or Manager */}
          {(currentRole === 'Employee' || currentRole === 'Manager') && (
            <div className="relative">
              <select
                value={currentEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find((x) => x.id === e.target.value);
                  if (emp) onEmployeeSelect(emp);
                }}
                className="bg-indigo-50/80 text-indigo-900 border border-indigo-200 text-xs font-semibold py-1.5 pl-2 pr-7 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none max-w-[160px] truncate"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Office Time Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure Office Check-in standard time and grace period"
            className="p-2 text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors shadow-xs flex items-center gap-1 text-xs font-medium"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Reset Data Button */}
          <button
            onClick={onOpenReset}
            title="Reset data to sample initial state"
            className="p-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all shadow-xs flex items-center gap-1 text-xs font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
