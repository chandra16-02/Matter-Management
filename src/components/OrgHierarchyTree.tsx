import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Network,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  Shield,
  ShieldCheck,
  Check,
  CheckCircle2,
  Briefcase,
  X,
  Info,
} from 'lucide-react';
import { EmployeeProfile, AttendanceRecord, UserRole } from '../types/hrms';

export interface OrgHierarchyTreeProps {
  employees: EmployeeProfile[];
  attendanceList?: AttendanceRecord[];
  todayStr: string;
  currentEmployee?: EmployeeProfile;
  currentRole?: UserRole;
  onSelectEmployee?: (emp: EmployeeProfile) => void;
}

export interface OrgTreeNode {
  employee: EmployeeProfile;
  manager?: EmployeeProfile;
  directReports: OrgTreeNode[];
  level: number;
}

// Department color styling map
const DEPARTMENT_COLORS: Record<
  string,
  { bg: string; text: string; border: string; badge: string; accent: string }
> = {
  Engineering: {
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    accent: 'from-indigo-600 to-blue-600',
  },
  Product: {
    bg: 'bg-amber-50/70',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    accent: 'from-amber-500 to-orange-600',
  },
  'HR & Operations': {
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accent: 'from-emerald-600 to-teal-600',
  },
  Design: {
    bg: 'bg-purple-50/70',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    accent: 'from-purple-600 to-pink-600',
  },
  Sales: {
    bg: 'bg-rose-50/70',
    text: 'text-rose-900',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    accent: 'from-rose-600 to-red-600',
  },
};

const DEFAULT_DEPT_COLOR = {
  bg: 'bg-slate-50',
  text: 'text-slate-900',
  border: 'border-slate-200',
  badge: 'bg-slate-100 text-slate-700 border-slate-200',
  accent: 'from-slate-700 to-slate-900',
};

export const OrgHierarchyTree: React.FC<OrgHierarchyTreeProps> = ({
  employees,
  attendanceList = [],
  todayStr,
  currentEmployee,
  currentRole,
  onSelectEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<EmployeeProfile | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'roster' | 'roles'>('tree');

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return ['All', ...Array.from(set)];
  }, [employees]);

  // Build tree from employee profiles
  const { rootNodes, employeeMap } = useMemo(() => {
    const empMap = new Map<string, EmployeeProfile>();
    const nameMap = new Map<string, EmployeeProfile>();

    employees.forEach((emp) => {
      empMap.set(emp.id, emp);
      nameMap.set(emp.name.toLowerCase().trim(), emp);
    });

    // Helper to find manager
    const findManager = (emp: EmployeeProfile): EmployeeProfile | undefined => {
      if (!emp.managerName) return undefined;
      const cleanManagerName = emp.managerName.toLowerCase().trim();
      if (
        cleanManagerName === 'founder' ||
        cleanManagerName === 'ceo' ||
        cleanManagerName === 'board' ||
        cleanManagerName === 'none'
      ) {
        return undefined;
      }
      return nameMap.get(cleanManagerName);
    };

    // Build children mapping
    const childrenMap = new Map<string, EmployeeProfile[]>();
    const roots: EmployeeProfile[] = [];

    employees.forEach((emp) => {
      const manager = findManager(emp);
      if (manager && manager.id !== emp.id) {
        const list = childrenMap.get(manager.id) || [];
        list.push(emp);
        childrenMap.set(manager.id, list);
      } else {
        roots.push(emp);
      }
    });

    // Cycle detection & recursive tree builder
    const visited = new Set<string>();
    const buildNode = (emp: EmployeeProfile, level: number): OrgTreeNode => {
      visited.add(emp.id);
      const manager = findManager(emp);
      const childProfiles = childrenMap.get(emp.id) || [];
      const directReports = childProfiles
        .filter((child) => !visited.has(child.id))
        .map((child) => buildNode(child, level + 1));

      return {
        employee: emp,
        manager,
        directReports,
        level,
      };
    };

    const treeRoots = roots.map((rootEmp) => buildNode(rootEmp, 0));

    // Handle any orphaned employees (in case of mutual cycle)
    employees.forEach((emp) => {
      if (!visited.has(emp.id)) {
        treeRoots.push(buildNode(emp, 0));
      }
    });

    return { rootNodes: treeRoots, employeeMap: empMap };
  }, [employees]);

  // Attendance status lookup for today
  const getTodayAttendanceStatus = (empId: string): string => {
    const record = attendanceList.find(
      (a) => (a.employeeId === empId || a.employeeName === employeeMap.get(empId)?.name) && a.date === todayStr
    );
    if (!record) return 'Not Checked In';
    return record.status;
  };

  // Toggle collapse state
  const toggleCollapse = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedNodeIds(new Set());
  };

  const collapseAll = () => {
    const allManagerIds = new Set<string>();
    const gatherManagers = (nodes: OrgTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.directReports.length > 0) {
          allManagerIds.add(n.employee.id);
          gatherManagers(n.directReports);
        }
      });
    };
    gatherManagers(rootNodes);
    setCollapsedNodeIds(allManagerIds);
  };

  // Check if a node matches search or department filter
  const isNodeHighlighted = (emp: EmployeeProfile) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  };

  const matchesDept = (emp: EmployeeProfile) => {
    if (selectedDept === 'All') return true;
    return emp.department === selectedDept;
  };

  // Modal employee reporting chain calculation
  const getReportingChain = (emp: EmployeeProfile) => {
    const chain: EmployeeProfile[] = [emp];
    let curr = emp;
    const visited = new Set<string>([emp.id]);

    while (curr.managerName) {
      const cleanManagerName = curr.managerName.toLowerCase().trim();
      const manager = employees.find((e) => e.name.toLowerCase().trim() === cleanManagerName);
      if (manager && !visited.has(manager.id)) {
        chain.unshift(manager);
        visited.add(manager.id);
        curr = manager;
      } else {
        break;
      }
    }
    return chain;
  };

  // Modal direct reports calculation
  const getDirectReports = (emp: EmployeeProfile) => {
    return employees.filter(
      (e) => e.managerName && e.managerName.toLowerCase().trim() === emp.name.toLowerCase().trim()
    );
  };

  // Render a Single Node in Tree
  const renderTreeNode = (node: OrgTreeNode) => {
    const emp = node.employee;
    const isCollapsed = collapsedNodeIds.has(emp.id);
    const hasReports = node.directReports.length > 0;
    const isHighlighted = isNodeHighlighted(emp);
    const deptColor = DEPARTMENT_COLORS[emp.department] || DEFAULT_DEPT_COLOR;
    const attendanceStatus = getTodayAttendanceStatus(emp.id);
    const isCurrentEmp = currentEmployee && currentEmployee.id === emp.id;

    // Filter visibility
    const isDeptMatched = matchesDept(emp);

    return (
      <div key={emp.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => {
            setActiveEmployeeModal(emp);
            if (onSelectEmployee) onSelectEmployee(emp);
          }}
          className={`relative group cursor-pointer w-64 sm:w-72 bg-white rounded-2xl border transition-all duration-200 select-none p-4 ${
            isHighlighted
              ? 'ring-3 ring-indigo-500 shadow-lg border-indigo-400 bg-indigo-50/20'
              : 'shadow-xs hover:shadow-md hover:border-indigo-300 border-slate-200'
          } ${!isDeptMatched && selectedDept !== 'All' ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}
        >
          {/* Header Accent Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${deptColor.accent}`}
          />

          <div className="flex items-start gap-3 mt-1">
            {/* Avatar / Initial Badge */}
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${deptColor.accent} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
            >
              {emp.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                  {emp.name}
                  {isCurrentEmp && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 font-bold uppercase tracking-wider">
                      You
                    </span>
                  )}
                </h4>
              </div>

              <p className="text-xs font-medium text-slate-700 truncate">{emp.designation}</p>

              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate max-w-[130px] ${deptColor.badge}`}
                >
                  {emp.department}
                </span>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                    emp.role === 'Managing Director'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : emp.role === 'Manager'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : emp.role === 'Admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                  title={emp.role}
                >
                  {emp.role}
                </span>
              </div>
            </div>
          </div>

          {/* Node Footer: Today's Status & Reports Counter */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 truncate">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  attendanceStatus === 'Present' || attendanceStatus === 'WFH'
                    ? 'bg-emerald-500'
                    : attendanceStatus === 'On Leave'
                    ? 'bg-rose-500'
                    : attendanceStatus === 'Half Day'
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
              />
              <span className="truncate">{attendanceStatus}</span>
            </div>

            {hasReports && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-500" />
                {node.directReports.length}{' '}
                {node.directReports.length === 1 ? 'Report' : 'Reports'}
              </span>
            )}
          </div>

          {/* Expand/Collapse Handle Button for Managers */}
          {hasReports && (
            <button
              onClick={(e) => toggleCollapse(emp.id, e)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-xs hover:bg-indigo-50 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all z-10"
              title={isCollapsed ? 'Expand Team' : 'Collapse Team'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              )}
            </button>
          )}
        </div>

        {/* Tree Connectors & Children */}
        {hasReports && !isCollapsed && (
          <div className="flex flex-col items-center mt-3 w-full">
            {/* Vertical connector from parent */}
            <div className="w-0.5 h-6 bg-slate-300" />

            {/* Horizontal branch bar if multiple direct reports */}
            <div className="relative flex justify-center items-start pt-3">
              {node.directReports.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-slate-300"
                  style={{
                    left: `calc(100% / ${node.directReports.length * 2})`,
                    right: `calc(100% / ${node.directReports.length * 2})`,
                  }}
                />
              )}

              <div className="flex gap-6 sm:gap-10 items-start">
                {node.directReports.map((childNode) => (
                  <div key={childNode.employee.id} className="relative flex flex-col items-center">
                    {/* Vertical connector to child */}
                    <div className="w-0.5 h-3 bg-slate-300 -mt-3 mb-1" />
                    {renderTreeNode(childNode)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Container */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Organizational Hierarchy</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {employees.length} Team Members
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive reporting tree structure displaying leadership, managers, and direct reports.
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tree vs Matrix View */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'tree'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Tree Chart
            </button>
            <button
              onClick={() => setViewMode('roster')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'roster'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Manager Roster
            </button>
            <button
              onClick={() => setViewMode('roles')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'roles'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Roles & Delegation
            </button>
          </div>

          {viewMode === 'tree' && (
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                title="Expand All Nodes"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                title="Collapse All Nodes"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collapse All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, or department..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">
            Department:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualization Content */}
      {viewMode === 'tree' ? (
        <div className="p-6 sm:p-10 overflow-x-auto bg-slate-50/30 min-h-[460px] flex items-center justify-center">
          <div className="min-w-fit py-4 px-6 flex flex-col items-center">
            {/* Top Founder / Board Label */}
            <div className="mb-6 flex flex-col items-center">
              <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide shadow-sm flex items-center gap-2 border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Matter Executive Board & Leadership
              </div>
              <div className="w-0.5 h-6 bg-slate-300 mt-1" />
            </div>

            {/* Tree Root Nodes (e.g. Head of People / Executives) */}
            <div className="flex gap-12 sm:gap-16 items-start justify-center">
              {rootNodes.map((rootNode) => renderTreeNode(rootNode))}
            </div>
          </div>
        </div>
      ) : viewMode === 'roster' ? (
        /* Roster / Matrix View */
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/30">
          {employees
            .filter(matchesDept)
            .filter((emp) => {
              if (!searchQuery.trim()) return true;
              return isNodeHighlighted(emp);
            })
            .map((emp) => {
              const deptColor = DEPARTMENT_COLORS[emp.department] || DEFAULT_DEPT_COLOR;
              const directReports = getDirectReports(emp);
              const attendanceStatus = getTodayAttendanceStatus(emp.id);

              return (
                <div
                  key={emp.id}
                  onClick={() => setActiveEmployeeModal(emp)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${deptColor.accent} text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0`}
                      >
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-base truncate">{emp.name}</h4>
                        <p className="text-xs text-slate-600 truncate">{emp.designation}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${deptColor.badge}`}
                          >
                            {emp.department}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              emp.role === 'Managing Director'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.role === 'Manager'
                                ? 'bg-blue-100 text-blue-800'
                                : emp.role === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {emp.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reporting information */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Reports to:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {emp.managerName || 'Executive Board'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> Direct Reports:
                        </span>
                        <span className="font-semibold text-indigo-600">
                          {directReports.length}{' '}
                          {directReports.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      {directReports.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {directReports.map((r) => (
                            <span
                              key={r.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          attendanceStatus === 'Present' || attendanceStatus === 'WFH'
                            ? 'bg-emerald-500'
                            : attendanceStatus === 'On Leave'
                            ? 'bg-rose-500'
                            : 'bg-slate-300'
                        }`}
                      />
                      {attendanceStatus}
                    </span>
                    <span className="font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
                      View profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Roles & Authority Matrix View */
        <div className="p-6 bg-slate-50/40 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">Role Authority & Responsibility Framework</h4>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Overview of organizational roles, core duties, and approval privileges across the team.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-xl text-xs text-blue-100 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>4 Roles: <strong>Managing Director, Manager, Admin, Employee</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Role</th>
                  <th className="py-3.5 px-4">Core Responsibility</th>
                  <th className="py-3.5 px-4">Leave Approval</th>
                  <th className="py-3.5 px-4">Reimbursement Approval</th>
                  <th className="py-3.5 px-4">Active Team Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Managing Director */}
                <tr className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        MD
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          🏢 Managing Director
                        </span>
                        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                          Executive Head
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-[220px]">
                    Overall organization leadership, business operations, strategy, and chief executive decision making.
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Primary Approver (Full)
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Primary Approver (Full)
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {employees.filter((e) => e.role === 'Managing Director').map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setActiveEmployeeModal(e)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-[11px] transition-colors"
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* 2. Manager */}
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                        MGR
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          💼 Manager
                        </span>
                        <span className="text-[10px] text-blue-800 bg-blue-100 border border-blue-300 px-1.5 py-0.2 rounded font-semibold">
                          Team Leadership
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 max-w-[220px]">
                    Sprint & project delivery, team mentoring, performance tracking, and operations management.
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Authorized Approver
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      <Check className="w-3 h-3 text-emerald-600" /> Authorized Approver
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {employees.filter((e) => e.role === 'Manager').map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setActiveEmployeeModal(e)}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold text-[11px] transition-colors"
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* 3. Admin */}
                <tr className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        ADM
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          👑 Admin
                        </span>
                        <span className="text-[10px] text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded font-semibold">
                          HR & Operations
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-[220px]">
                    Employee records, attendance policies, onboarding/offboarding, office timing settings, and compliance.
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Audit & Record Only
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Audit & Verify Only
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {employees.filter((e) => e.role === 'Admin').map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setActiveEmployeeModal(e)}
                          className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-[11px] transition-colors"
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* 4. Employee */}
                <tr className="hover:bg-slate-100/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        EMP
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          👤 Employee
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                          Self-Service
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-[220px]">
                    Core engineering, product, design, and sales execution; daily check-in/out attendance logging.
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Apply Only
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Submit Only
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {employees.filter((e) => e.role === 'Employee').map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setActiveEmployeeModal(e)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium text-[11px] transition-colors"
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend & Instructions Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" /> Node Guide:
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present / WFH
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> On Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Not Checked In
          </span>
        </div>

        <div className="text-slate-400 text-[11px]">
          Tip: Click on any employee card to view their complete reporting line & team roster.
        </div>
      </div>

      {/* ================= EMPLOYEE DETAIL POPUP MODAL ================= */}
      {activeEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-xl flex items-center justify-center border border-white/20">
                  {activeEmployeeModal.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{activeEmployeeModal.name}</h3>
                  <p className="text-xs text-indigo-200">{activeEmployeeModal.designation}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/20">
                      {activeEmployeeModal.department}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200">
                      {activeEmployeeModal.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveEmployeeModal(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Reporting Chain Breadcrumb */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-indigo-600" /> Reporting Line
                </h5>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  {getReportingChain(activeEmployeeModal).map((chainEmp, idx, arr) => (
                    <React.Fragment key={chainEmp.id}>
                      <button
                        onClick={() => setActiveEmployeeModal(chainEmp)}
                        className={`font-semibold px-2.5 py-1 rounded-lg transition-all ${
                          chainEmp.id === activeEmployeeModal.id
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {chainEmp.name}
                      </button>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Direct Reports */}
              {(() => {
                const directReports = getDirectReports(activeEmployeeModal);
                return (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" /> Direct Reports (
                        {directReports.length})
                      </span>
                    </h5>
                    {directReports.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        No direct reporting employees assigned to this profile.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {directReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => setActiveEmployeeModal(report)}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-900 truncate">
                                {report.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {report.designation}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Contact & Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Email Address
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">
                    {activeEmployeeModal.email}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> Mobile Contact
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeEmployeeModal.phone}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Date of Joining
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {activeEmployeeModal.joiningDate}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-400" /> Today&apos;s Status
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        getTodayAttendanceStatus(activeEmployeeModal.id) === 'Present' ||
                        getTodayAttendanceStatus(activeEmployeeModal.id) === 'WFH'
                          ? 'bg-emerald-500'
                          : getTodayAttendanceStatus(activeEmployeeModal.id) === 'On Leave'
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    {getTodayAttendanceStatus(activeEmployeeModal.id)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveEmployeeModal(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
