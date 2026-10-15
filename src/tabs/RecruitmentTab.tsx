import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  MapPin,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Filter,
  UserPlus,
} from 'lucide-react';
import {
  JobOpening,
  Candidate,
  CandidateStage,
  JobStatus,
  UserRole,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { formatDatePretty, getTodayDateStr } from '../utils/timeHelpers';

interface RecruitmentTabProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  currentRole: UserRole;
  searchQuery: string;
  onAddJob: (job: JobOpening) => void;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidateStage: (candidateId: string, stage: CandidateStage, details?: Partial<Candidate>) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onDeleteJob: (jobId: string) => void;
}

export const RecruitmentTab: React.FC<RecruitmentTabProps> = ({
  jobs,
  candidates,
  currentRole,
  searchQuery,
  onAddJob,
  onUpdateJobStatus,
  onAddCandidate,
  onUpdateCandidateStage,
  onDeleteCandidate,
  onDeleteJob,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'candidates'>('candidates');

  // New Job Modal
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('Engineering');
  const [jobLocation, setJobLocation] = useState('Bengaluru / Hybrid');
  const [jobSalary, setJobSalary] = useState('₹18 - ₹25 LPA');
  const [jobExp, setJobExp] = useState('3 - 6 years');
  const [jobOpenings, setJobOpenings] = useState(1);
  const [jobDesc, setJobDesc] = useState('');

  // New Candidate Modal
  const [isAddCandOpen, setIsAddCandOpen] = useState(false);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candJobId, setCandJobId] = useState(jobs[0]?.id || '');
  const [candExp, setCandExp] = useState('3 years');
  const [candNotes, setCandNotes] = useState('');

  // Filter candidates
  const filteredCandidates = candidates
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.stage.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));

  // Filter jobs
  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.department.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.salaryRange.toLowerCase().includes(q)
    );
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      title: jobTitle,
      department: jobDept,
      location: jobLocation,
      salaryRange: jobSalary,
      experience: jobExp,
      openings: jobOpenings,
      status: 'Open',
      postedDate: getTodayDateStr(),
      description: jobDesc,
    };
    onAddJob(newJob);
    setIsAddJobOpen(false);
    setJobTitle('');
    setJobDesc('');
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = jobs.find((j) => j.id === candJobId);
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      name: candName,
      email: candEmail,
      phone: candPhone,
      jobId: candJobId,
      jobTitle: targetJob ? targetJob.title : 'General Pool',
      experience: candExp,
      stage: 'Applied',
      appliedDate: getTodayDateStr(),
      notes: candNotes,
    };
    onAddCandidate(newCand);
    setIsAddCandOpen(false);
    setCandName('');
    setCandEmail('');
    setCandPhone('');
    setCandNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Subtab Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('candidates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'candidates'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 Candidates & Pipeline ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jobs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'jobs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💼 Open Jobs ({jobs.filter((j) => j.status === 'Open').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentRole !== 'Employee' && (
            <>
              <button
                onClick={() => setIsAddCandOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" /> Add Candidate
              </button>
              <button
                onClick={() => setIsAddJobOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subtab 1: Candidates Pipeline */}
      {activeSubTab === 'candidates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Candidate Tracker & Hiring Pipeline</h3>
              <p className="text-xs text-slate-500">
                Phone details, stages, direct &apos;Offer&apos; and &apos;Reject&apos; actions
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {currentRole === 'Employee'
                ? 'ℹ️ Employee referral view. Actions reserved for Managing Director & Admin.'
                : '👑 Managing Director / Admin: Manage Offer, Reject & Interview rounds.'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">Exp</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Interview / Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {cand.name}
                        <div className="text-[11px] text-slate-400 font-normal">
                          Applied: {formatDatePretty(cand.appliedDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-indigo-500" />
                          {cand.phone}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {cand.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 text-xs">
                        {cand.jobTitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {cand.experience}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={cand.stage} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[220px]">
                        {cand.interviewDate ? (
                          <div className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md inline-block">
                            📅 {cand.interviewDate}
                          </div>
                        ) : null}
                        <p className="truncate text-slate-500 mt-0.5" title={cand.notes}>
                          {cand.notes || 'No notes added'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {currentRole !== 'Employee' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {cand.stage !== 'Offer' && (
                              <button
                                onClick={() => onUpdateCandidateStage(cand.id, 'Offer')}
                                title="Move to Offer stage"
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                              >
                                Offer
                              </button>
                            )}
                            {cand.stage !== 'Rejected' && (
                              <button
                                onClick={() => onUpdateCandidateStage(cand.id, 'Rejected')}
                                title="Reject candidate"
                                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteCandidate(cand.id)}
                              title="Delete candidate record"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      )}

      {/* Subtab 2: Jobs Board */}
      {activeSubTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {job.department}
                  </span>
                  <StatusBadge status={job.status} />
                </div>

                <h4 className="font-bold text-slate-900 text-lg mt-3">{job.title}</h4>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Location:</strong> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>Salary:</strong> {job.salaryRange}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Experience:</strong> {job.experience} ({job.openings} Openings)
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{job.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Posted: {formatDatePretty(job.postedDate)}
                </span>
                {currentRole !== 'Employee' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateJobStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open')
                      }
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                    >
                      {job.status === 'Open' ? 'Close Job' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Post New Job */}
      {isAddJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Create New Job Opening</h3>
              <button
                onClick={() => setIsAddJobOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Staff Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Remote"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹20 - ₹28 LPA"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 - 7 years"
                    value={jobExp}
                    onChange={(e) => setJobExp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Key responsibilities and required skillsets..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Candidate */}
      {isAddCandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Add New Candidate</h3>
              <button
                onClick={() => setIsAddCandOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Candidate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Varun Kapoor"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="candidate@email.com"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number (Required)
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Apply for Job</label>
                  <select
                    value={candJobId}
                    onChange={(e) => setCandJobId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 years"
                    value={candExp}
                    onChange={(e) => setCandExp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes / Screening Feedback</label>
                <textarea
                  rows={2}
                  value={candNotes}
                  onChange={(e) => setCandNotes(e.target.value)}
                  placeholder="Notes about portfolio, current CTC, notice period..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCandOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
