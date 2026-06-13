import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  FileText, 
  Trash2, 
  Edit, 
  Settings, 
  HelpCircle, 
  Clock, 
  Plus, 
  AlertCircle,
  X,
  CheckCircle,
  Sliders
} from 'lucide-react';

interface ExamItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: {
    id: string;
    questionText: string;
  }[];
}

export const ManageExams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for Editing General Exam Details (Modal-based)
  const [editExam, setEditExam] = useState<ExamItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/admin/exams');
      setExams(resp.data);
    } catch (err: any) {
      console.error('Failed to fetch exams:', err);
      setError('Could not retrieve school exams. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (examId: string) => {
    if (!window.confirm('WARNING: Are you sure you choose to delete this exam permanently? This removes all associated student grades.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/exams/${examId}`);
      setSuccess('Exam destroyed successfully.');
      setExams(exams.filter(e => e.id !== examId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to wipe exam. Please review details.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleOpenEditModal = (exam: ExamItem) => {
    setEditExam(exam);
    setEditTitle(exam.title);
    setEditDesc(exam.description);
    setEditDuration(exam.duration);
  };

  const handleCloseModal = () => {
    setEditExam(null);
  };

  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;

    try {
      const resp = await api.put(`/api/admin/exams/${editExam.id}`, {
        title: editTitle,
        description: editDesc,
        duration: editDuration
      });

      setSuccess('Exam stashed successfully.');
      setEditExam(null);
      fetchExams();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update exam details.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Manage MCQ Examinations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure parameters, customize questions rosters, and inspect assessment bounds.
            </p>
          </div>
          <Link
            to="/admin/create-exam"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4" />
            Establish New Exam
          </Link>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 scale-110 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 scale-110 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center p-16 bg-white border border-slate-200 rounded-xl space-y-4">
            <FileText className="h-12 w-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-755">No examinations found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active tests exist in your school portal database yet. Click below to establish your first one.
              </p>
            </div>
            <Link
              to="/admin/create-exam"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Plus className="h-4 w-4" />
              Build Main MCQ Test
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow transition duration-150">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-extrabold text-slate-850 tracking-tight leading-snug line-clamp-1">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono font-bold shrink-0">
                      <Clock className="h-3 w-3 text-slate-450" />
                      {exam.duration}m
                    </div>
                  </div>

                  <p className="text-xs text-slate-550 leading-relaxed line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="flex gap-4 text-xxs font-mono text-slate-450 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {exam.questions.length} MCQ Questions
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-550">ID: {exam.id}</span>
                  </div>
                </div>

                {/* Operations Toolbar triggers */}
                <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditModal(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded-lg text-xs text-slate-700 font-bold transition"
                  >
                    <Sliders className="h-3.5 w-3.5 text-slate-450" />
                    Configure Info
                  </button>

                  <Link
                    to={`/admin/exams/${exam.id}/questions`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-xs text-blue-750 border border-blue-200 rounded-lg font-bold transition"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Set Questions
                  </Link>

                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Exam Details Modal */}
        {editExam && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-850">Configure Exam Parameters</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateExam} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description / Directives</label>
                    <input
                      type="text"
                      required
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-4.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Duration (Min)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      className="w-full px-4.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-sm text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4.5 py-2 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    Stash Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default ManageExams;
