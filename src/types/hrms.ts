export type UserRole = 'Managing Director' | 'Manager' | 'Admin' | 'Employee';

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  ifscCode: string;
  bankAccount?: string;
  joiningDate: string;
  dateOfBirth?: string; // YYYY-MM-DD
  avatar?: string;
  role: UserRole;
  managerName?: string;
}

export interface BirthdayWish {
  id: string;
  employeeId: string;
  employeeName: string;
  sentBy: string;
  sentAt: string;
  message: string;
  voucher?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'WFH' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm format (e.g., "09:55" or "10:25")
  checkOut: string; // HH:mm format (e.g., "18:30") or empty
  status: AttendanceStatus;
  workHours: number; // calculated hours
  isLate: boolean;
  lateMinutes: number;
  remarks?: string;
  source?: '1-click' | 'manual' | 'leave-auto';
}

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Restricted Holiday';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isRestricted: boolean; // RH
  description?: string;
}

export interface LeaveBalance {
  casual: number; // default e.g. 12
  sick: number; // default e.g. 10
  earned: number; // default e.g. 15
  rh: number; // default e.g. 2
}

export type JobStatus = 'Open' | 'Closed' | 'On Hold';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: string;
  experience: string;
  openings: number;
  status: JobStatus;
  postedDate: string;
  description: string;
}

export type CandidateStage = 'Applied' | 'Screening' | 'Interview Scheduled' | 'Offer' | 'Rejected' | 'Hired';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  experience: string;
  stage: CandidateStage;
  appliedDate: string;
  interviewDate?: string;
  interviewRound?: string;
  notes?: string;
}

export type AppraisalStatus = 'Draft' | 'Submitted' | 'Reviewed' | 'Approved';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  cycle: string; // e.g., "Q3 2026" or "Annual 2026"
  selfRating: number; // 1.0 to 5.0
  managerRating: number; // 1.0 to 5.0
  averageRating: number; // auto-calculated (self + manager) / 2
  achievements: string;
  areasOfImprovement: string;
  managerFeedback: string;
  status: AppraisalStatus;
  submittedDate: string;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  status: 'Draft' | 'Submitted' | 'Approved';
}

export type ExpenseCategory = 'Travel' | 'Food' | 'Stay' | 'Office' | 'Other';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptNumber?: string;
  status: ExpenseStatus;
  approvedBy?: string;
}

export type AssetStatus = 'Issued' | 'Available' | 'Maintenance' | 'Returned';
export type AssetCategory = 'Laptop' | 'Desktop' | 'Monitor' | 'Mobile' | 'Peripheral';

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  assignedToEmployeeId?: string;
  assignedToName?: string;
  issueDate?: string;
  status: AssetStatus;
  serialNumber: string;
}

export type FnFStatus = 'Pending' | 'In Progress' | 'Cleared';

export interface ExitRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  resignationDate: string;
  lastWorkingDay: string;
  reason: string;
  noticePeriodDays: number;
  fnfStatus: FnFStatus;
  settlementAmount: number;
  assetsReturned: boolean;
  remarks?: string;
}

export interface OfficeSettings {
  officeStartTime: string; // "10:00"
  gracePeriodMinutes: number; // 15
  officeEndTime: string; // "18:30"
  workHoursPerDay: number; // 8.5
}
