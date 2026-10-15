import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
  size = 'sm',
}) => {
  const norm = (status || '').toLowerCase().trim();

  // Green: Approved, Cleared, On time, Present, Hired, Open, Issued, Active
  const isGreen =
    norm.includes('approved') ||
    norm.includes('cleared') ||
    norm.includes('on time') ||
    norm === 'present' ||
    norm === 'hired' ||
    norm === 'open' ||
    norm === 'issued' ||
    norm === 'active' ||
    norm.startsWith('✅');

  // Amber / Yellow: Pending, Half Day, WFH, Late, In Progress, Screening, Under Review, Draft, Submitted, Interview Scheduled, On Hold
  const isYellow =
    norm.includes('pending') ||
    norm.includes('half day') ||
    norm.includes('wfh') ||
    norm.includes('late') ||
    norm.includes('in progress') ||
    norm.includes('screening') ||
    norm.includes('interview') ||
    norm.includes('draft') ||
    norm.includes('submitted') ||
    norm.includes('on hold') ||
    norm.startsWith('⚠️');

  // Red: Rejected, Absent, FnF Pending (when specifically red), Closed, Damaged, Cancelled
  const isRed =
    norm.includes('rejected') ||
    norm.includes('absent') ||
    norm.includes('closed') ||
    norm.includes('damaged') ||
    norm.includes('cancelled') ||
    norm.startsWith('❌');

  // Blue / Info: On Leave, etc.
  const isBlue = norm.includes('on leave') || norm.includes('offer');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Clock;

  if (isGreen) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
    IconComponent = CheckCircle2;
  } else if (isYellow) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10';
    IconComponent = norm.includes('late') ? AlertTriangle : Clock;
  } else if (isRed) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';
    IconComponent = XCircle;
  } else if (isBlue) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
    IconComponent = ShieldCheck;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full transition-colors whitespace-nowrap shadow-xs ${colorClasses} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />}
      <span>{status}</span>
    </span>
  );
};
