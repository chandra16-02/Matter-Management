import React, { useState } from 'react';
import { X, Clock, Sliders, Check, AlertCircle } from 'lucide-react';
import { OfficeSettings } from '../types/hrms';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OfficeSettings;
  onSave: (newSettings: OfficeSettings) => void;
  isHRorManager: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isHRorManager,
}) => {
  const [formData, setFormData] = useState<OfficeSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Office Time & Attendance Settings</h3>
              <p className="text-xs text-slate-500">Configure standard check-in time and grace period rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Office Check-in Standard Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.officeStartTime}
                onChange={(e) => setFormData({ ...formData, officeStartTime: e.target.value })}
                disabled={!isHRorManager}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
              <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Default: 10:00 AM (Arrivals after this time and grace are marked late)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Grace Period (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="60"
                value={formData.gracePeriodMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, gracePeriodMinutes: Math.max(0, parseInt(e.target.value, 10) || 0) })
                }
                disabled={!isHRorManager}
                className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
              <span className="text-sm font-medium text-slate-600">Minutes grace</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For example, with a 15-minute grace period, check-ins <strong>up to 10:15 AM</strong> are considered &quot;✅ On time&quot;. Arrivals after 10:15 AM receive a late badge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Office End Time
              </label>
              <input
                type="time"
                value={formData.officeEndTime}
                onChange={(e) => setFormData({ ...formData, officeEndTime: e.target.value })}
                disabled={!isHRorManager}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Work Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                value={formData.workHoursPerDay}
                onChange={(e) =>
                  setFormData({ ...formData, workHoursPerDay: parseFloat(e.target.value) || 8.5 })
                }
                disabled={!isHRorManager}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50"
              />
            </div>
          </div>

          {!isHRorManager && (
            <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Office timing and grace rules can only be modified by a Managing Director, Manager, or Admin.</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {isHRorManager && (
              <button
                type="submit"
                disabled={savedSuccess}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
