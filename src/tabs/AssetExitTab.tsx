import React, { useState } from 'react';
import {
  Laptop,
  UserMinus,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  Asset,
  ExitRecord,
  FnFStatus,
  AssetCategory,
  AssetStatus,
  EmployeeProfile,
  UserRole,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { formatDatePretty, getTodayDateStr } from '../utils/timeHelpers';

interface AssetExitTabProps {
  assets: Asset[];
  exits: ExitRecord[];
  employees: EmployeeProfile[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  searchQuery: string;
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddExit: (record: ExitRecord) => void;
  onUpdateExit: (record: ExitRecord) => void;
  onDeleteExit: (recordId: string) => void;
}

export const AssetExitTab: React.FC<AssetExitTabProps> = ({
  assets,
  exits,
  employees,
  currentRole,
  currentEmployee,
  searchQuery,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddExit,
  onUpdateExit,
  onDeleteExit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'exit'>('assets');
  const todayStr = getTodayDateStr();

  // Add Asset Modal
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('Laptop');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetAssigneeId, setAssetAssigneeId] = useState('');
  const [assetIssueDate, setAssetIssueDate] = useState(todayStr);

  // Submit Resignation / Exit Modal
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitEmpId, setExitEmpId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [resignationDate, setResignationDate] = useState(todayStr);
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [reason, setReason] = useState('');
  const [settlementAmount, setSettlementAmount] = useState<number>(100000);

  // Metrics
  const issuedAssetsCount = assets.filter((a) => a.status === 'Issued').length;
  const fnfPendingCount = exits.filter((e) => e.fnfStatus === 'Pending' || e.fnfStatus === 'In Progress').length;
  const fnfClearedCount = exits.filter((e) => e.fnfStatus === 'Cleared').length;

  // Filter Assets
  const filteredAssets = assets.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.assetTag.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.assignedToName && a.assignedToName.toLowerCase().includes(q)) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  // Filter Exits
  const filteredExits = exits.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.employeeName.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.reason.toLowerCase().includes(q) ||
      e.fnfStatus.toLowerCase().includes(q)
    );
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEmp = employees.find((emp) => emp.id === assetAssigneeId);
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      name: assetName,
      assetTag: assetTag || `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      category: assetCategory,
      serialNumber: assetSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      assignedToEmployeeId: assignedEmp ? assignedEmp.id : undefined,
      assignedToName: assignedEmp ? assignedEmp.name : undefined,
      issueDate: assignedEmp ? assetIssueDate : undefined,
      status: assignedEmp ? 'Issued' : 'Available',
    };
    onAddAsset(newAsset);
    setIsAssetModalOpen(false);
    setAssetName('');
    setAssetTag('');
    setAssetSerial('');
  };

  const handleCreateExit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = currentRole === 'Employee' ? currentEmployee : employees.find((x) => x.id === exitEmpId);
    if (!emp) return;

    // Default last working day is 60 days from resignation date
    let lwd = lastWorkingDay;
    if (!lwd) {
      const d = new Date(resignationDate + 'T00:00:00');
      d.setDate(d.getDate() + 60);
      lwd = d.toISOString().split('T')[0];
    }

    const newExit: ExitRecord = {
      id: `exit-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      resignationDate,
      lastWorkingDay: lwd,
      reason,
      noticePeriodDays: 60,
      fnfStatus: 'Pending',
      settlementAmount,
      assetsReturned: false,
      remarks: 'Resignation logged; KT & Clearance pending.',
    };

    onAddExit(newExit);
    setIsExitModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('assets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'assets'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💻 Asset Management ({assets.length})
          </button>
          <button
            onClick={() => setActiveSubTab('exit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'exit'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚪 Exit & FnF Clearance Desk ({exits.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'assets' ? (
            currentRole !== 'Employee' && (
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add / Issue Hardware Asset
              </button>
            )
          ) : (
            <button
              onClick={() => {
                setExitEmpId(currentEmployee?.id || employees[0]?.id || '');
                setIsExitModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <UserMinus className="w-4 h-4" /> Submit Resignation / Exit
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Asset Management */}
      {activeSubTab === 'assets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-indigo-600 uppercase">Issued Hardware</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {issuedAssetsCount} / {assets.length}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Currently assigned to employees</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase">In Stock / Available</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {assets.filter((a) => a.status === 'Available').length}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ready for immediate allocation</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Categories</span>
              <div className="text-xs font-semibold text-slate-800 mt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-100">Laptops</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100">4K Monitors</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100">Keyboards</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100">Mobile QA</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Company Hardware Assets Inventory</h3>
                <p className="text-xs text-slate-500">
                  Asset tag, category, assigned employee, issue date, and lifecycle status
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {currentRole === 'Employee'
                  ? 'ℹ️ Employee views assigned assets. Managing Director & Admin administer hardware.'
                  : '👑 Managing Director / Admin: Issue, Return & Modify assets.'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Asset Tag</th>
                    <th className="py-3 px-4">Hardware Model</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                        No hardware assets found.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((ast) => (
                      <tr key={ast.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700">
                          {ast.assetTag}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {ast.name}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          {ast.category}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {ast.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {ast.issueDate ? formatDatePretty(ast.issueDate) : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                          {ast.serialNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={ast.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {currentRole !== 'Employee' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {ast.status === 'Issued' ? (
                                <button
                                  onClick={() =>
                                    onUpdateAsset({
                                      ...ast,
                                      status: 'Available',
                                      assignedToEmployeeId: undefined,
                                      assignedToName: undefined,
                                    })
                                  }
                                  title="Mark returned to stock"
                                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                >
                                  Return
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const emp = employees[0];
                                    onUpdateAsset({
                                      ...ast,
                                      status: 'Issued',
                                      assignedToEmployeeId: emp.id,
                                      assignedToName: emp.name,
                                      issueDate: todayStr,
                                    });
                                  }}
                                  title="Assign to employee"
                                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                >
                                  Assign
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteAsset(ast.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Delete asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">View only</span>
                          )}
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

      {/* Subtab 2: Exit & FnF Management */}
      {activeSubTab === 'exit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-rose-700 uppercase">FnF Pending</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {fnfPendingCount} Case{fnfPendingCount > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Awaiting KT, handover & clearance</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase">FnF Cleared</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {fnfClearedCount} Settled
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Relieving letters & payout completed</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Exit Compliance</span>
              <p className="text-xs text-slate-600 mt-2">
                Hardware returns, knowledge transfer confirmation, and final settlement calculation.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Resignation & Full and Final (FnF) Desk</h3>
                <p className="text-xs text-slate-500">
                  Resignation date, reason for leaving, last working day, returned hardware, and FnF clearance status
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Status: Pending (Amber), Cleared (Green)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Resignation Date</th>
                    <th className="py-3 px-4">Last Working Day</th>
                    <th className="py-3 px-4">Reason for Leaving</th>
                    <th className="py-3 px-4">FnF Settlement</th>
                    <th className="py-3 px-4">Hardware Returned</th>
                    <th className="py-3 px-4">FnF Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                        No exit records found.
                      </td>
                    </tr>
                  ) : (
                    filteredExits.map((exit) => (
                      <tr key={exit.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {exit.employeeName}
                          <div className="text-[11px] text-slate-400 font-normal">{exit.department}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDatePretty(exit.resignationDate)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDatePretty(exit.lastWorkingDay)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={exit.reason}>
                          {exit.reason}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          ₹{exit.settlementAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {exit.assetsReturned ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={exit.fnfStatus === 'Cleared' ? 'Cleared' : 'Pending'} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {currentRole !== 'Employee' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {exit.fnfStatus !== 'Cleared' ? (
                                <button
                                  onClick={() =>
                                    onUpdateExit({
                                      ...exit,
                                      fnfStatus: 'Cleared',
                                      assetsReturned: true,
                                      remarks: 'Full settlement credited; clearances completed.',
                                    })
                                  }
                                  title="Clear FnF settlement"
                                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                  Clear FnF
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    onUpdateExit({
                                      ...exit,
                                      fnfStatus: 'Pending',
                                    })
                                  }
                                  title="Mark pending"
                                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                >
                                  Reopen
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteExit(exit.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">View only</span>
                          )}
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

      {/* Modal: Add Hardware Asset */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Add Company Hardware Asset</h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 14 M3 / Dell UltraSharp 27"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. AST-1045"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile Device</option>
                    <option value="Peripheral">Peripheral / Keyboard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. C02GK018MD6M"
                  value={assetSerial}
                  onChange={(e) => setAssetSerial(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign to Employee</label>
                  <select
                    value={assetAssigneeId}
                    onChange={(e) => setAssetAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- None (Keep in Stock) --</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={assetIssueDate}
                    onChange={(e) => setAssetIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Resignation */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Submit Resignation & Exit</h3>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee</label>
                {currentRole === 'Employee' ? (
                  <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                    {currentEmployee.name}
                  </div>
                ) : (
                  <select
                    value={exitEmpId}
                    onChange={(e) => setExitEmpId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Resignation Date
                  </label>
                  <input
                    type="date"
                    value={resignationDate}
                    onChange={(e) => setResignationDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Expected Last Working Day
                  </label>
                  <input
                    type="date"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                    placeholder="Defaults to 60 days"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Resignation
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Higher studies, career advancement, personal relocation..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Estimated FnF Settlement (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  Submit Resignation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
