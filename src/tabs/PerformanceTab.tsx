import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  User,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import {
  PerformanceReview,
  EmployeeProfile,
  UserRole,
} from '../types/hrms';
import { StatusBadge } from '../components/StatusBadge';
import { formatDatePretty, getTodayDateStr } from '../utils/timeHelpers';

interface PerformanceTabProps {
  reviews: PerformanceReview[];
  employees: EmployeeProfile[];
  currentRole: UserRole;
  currentEmployee: EmployeeProfile;
  searchQuery: string;
  onAddReview: (review: PerformanceReview) => void;
  onUpdateReview: (review: PerformanceReview) => void;
  onDeleteReview: (reviewId: string) => void;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  reviews,
  employees,
  currentRole,
  currentEmployee,
  searchQuery,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isManagerReviewModalOpen, setIsManagerReviewModalOpen] = useState(false);
  const [selectedReviewToReview, setSelectedReviewToReview] = useState<PerformanceReview | null>(null);

  // Form states for Self Appraisal
  const [formEmployeeId, setFormEmployeeId] = useState(currentEmployee?.id || employees[0]?.id || '');
  const [formCycle, setFormCycle] = useState('Q3 2026');
  const [formSelfRating, setFormSelfRating] = useState<number>(4.0);
  const [formAchievements, setFormAchievements] = useState('');
  const [formImprovements, setFormImprovements] = useState('');

  // Manager Review Form
  const [managerRatingInput, setManagerRatingInput] = useState<number>(4.5);
  const [managerFeedbackInput, setManagerFeedbackInput] = useState('');

  // Auto calculate average helper
  const calcAverage = (self: number, manager: number) => {
    if (!manager || manager === 0) return self;
    return Math.round(((self + manager) / 2) * 10) / 10;
  };

  const handleSelfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = currentRole === 'Employee' ? currentEmployee : employees.find((e) => e.id === formEmployeeId);
    if (!emp) return;

    const newReview: PerformanceReview = {
      id: `perf-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      cycle: formCycle,
      selfRating: formSelfRating,
      managerRating: 0,
      averageRating: formSelfRating, // until manager rates
      achievements: formAchievements,
      areasOfImprovement: formImprovements,
      managerFeedback: 'Pending manager review',
      status: 'Submitted',
      submittedDate: getTodayDateStr(),
    };

    onAddReview(newReview);
    setIsSubmitModalOpen(false);
    setFormAchievements('');
    setFormImprovements('');
  };

  const handleSaveManagerReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewToReview) return;

    const avg = calcAverage(selectedReviewToReview.selfRating, managerRatingInput);
    const updated: PerformanceReview = {
      ...selectedReviewToReview,
      managerRating: managerRatingInput,
      averageRating: avg,
      managerFeedback: managerFeedbackInput,
      status: 'Reviewed',
    };

    onUpdateReview(updated);
    setIsManagerReviewModalOpen(false);
    setSelectedReviewToReview(null);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.employeeName.toLowerCase().includes(q) ||
      r.cycle.toLowerCase().includes(q) ||
      r.achievements.toLowerCase().includes(q) ||
      r.managerFeedback.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900">Performance & Appraisals</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Average rating is calculated automatically from self and manager scores.
          </p>
        </div>

        <button
          onClick={() => {
            setFormEmployeeId(currentEmployee?.id || employees[0]?.id || '');
            setIsSubmitModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Submit Self Appraisal
        </button>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredReviews.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            No performance appraisal records found.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {rev.cycle}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1.5">{rev.employeeName}</h4>
                    <p className="text-[11px] text-slate-400">Submitted: {formatDatePretty(rev.submittedDate)}</p>
                  </div>

                  <StatusBadge status={rev.status} />
                </div>

                {/* Ratings Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Self Rating</span>
                    <div className="text-xl font-bold text-slate-900 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {rev.selfRating.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Manager Rating</span>
                    <div className="text-xl font-bold text-slate-900 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {rev.managerRating > 0 ? rev.managerRating.toFixed(1) : '—'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Average Rating</span>
                    <div className="text-xl font-extrabold text-indigo-950 mt-1 flex items-center justify-center gap-1">
                      <Award className="w-4 h-4 text-indigo-600" />
                      {rev.averageRating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-slate-800 font-semibold">Key Achievements:</strong>
                    <p className="text-slate-600 mt-0.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      {rev.achievements}
                    </p>
                  </div>

                  {rev.areasOfImprovement && (
                    <div>
                      <strong className="text-slate-800 font-semibold">Areas of Improvement:</strong>
                      <p className="text-slate-600 mt-0.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {rev.areasOfImprovement}
                      </p>
                    </div>
                  )}

                  {rev.managerFeedback && (
                    <div>
                      <strong className="text-slate-800 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Manager Feedback:
                      </strong>
                      <p className="text-indigo-950 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 mt-0.5">
                        {rev.managerFeedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Calculation: ({rev.selfRating} + {rev.managerRating || rev.selfRating}) / 2 = {rev.averageRating.toFixed(1)}
                </span>

                <div className="flex items-center gap-2">
                  {currentRole !== 'Employee' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedReviewToReview(rev);
                          setManagerRatingInput(rev.managerRating || 4.5);
                          setManagerFeedbackInput(
                            rev.managerFeedback === 'Pending manager review' ? '' : rev.managerFeedback
                          );
                          setIsManagerReviewModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors"
                      >
                        Rate & Review
                      </button>
                      <button
                        onClick={() => onDeleteReview(rev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete appraisal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Submit Self Appraisal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Submit Self Appraisal</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSelfSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee</label>
                  {currentRole === 'Employee' ? (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                      {currentEmployee.name}
                    </div>
                  ) : (
                    <select
                      value={formEmployeeId}
                      onChange={(e) => setFormEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cycle</label>
                  <input
                    type="text"
                    value={formCycle}
                    onChange={(e) => setFormCycle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Self Rating (1.0 to 5.0)
                  </label>
                  <span className="font-bold text-indigo-600 text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {formSelfRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formSelfRating}
                  onChange={(e) => setFormSelfRating(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Key Achievements & Highlights
                </label>
                <textarea
                  rows={3}
                  value={formAchievements}
                  onChange={(e) => setFormAchievements(e.target.value)}
                  placeholder="Projects delivered, impact created, milestones met..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Areas of Improvement / Growth Goals
                </label>
                <textarea
                  rows={2}
                  value={formImprovements}
                  onChange={(e) => setFormImprovements(e.target.value)}
                  placeholder="Skills to learn, areas needing support..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Submit Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manager Review & Rating */}
      {isManagerReviewModalOpen && selectedReviewToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Manager Appraisal Review</h3>
              <button
                onClick={() => setIsManagerReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManagerReview} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  <strong>Employee:</strong> {selectedReviewToReview.employeeName} ({selectedReviewToReview.cycle})
                </div>
                <div>
                  <strong>Self Rating:</strong> ⭐ {selectedReviewToReview.selfRating.toFixed(1)} / 5.0
                </div>
                <div>
                  <strong>Achievements:</strong> {selectedReviewToReview.achievements}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Manager Rating (1.0 to 5.0)
                  </label>
                  <span className="font-bold text-indigo-600 text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {managerRatingInput.toFixed(1)} / 5.0
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={managerRatingInput}
                  onChange={(e) => setManagerRatingInput(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Auto calculated live average preview */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
                <span className="font-medium">Calculated Auto Average Rating:</span>
                <span className="font-black text-sm bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {calcAverage(selectedReviewToReview.selfRating, managerRatingInput).toFixed(1)} / 5.0
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Manager Feedback & Recommendations
                </label>
                <textarea
                  rows={3}
                  value={managerFeedbackInput}
                  onChange={(e) => setManagerFeedbackInput(e.target.value)}
                  placeholder="Manager observations, guidance, goals for next appraisal cycle..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManagerReviewModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Submit & Finalize Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
