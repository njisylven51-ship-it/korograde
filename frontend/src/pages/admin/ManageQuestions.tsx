import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Save, 
  X,
  Sparkles
} from 'lucide-react';

interface QuestionItem {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface ExamDetail {
  id: string;
  title: string;
  questions: QuestionItem[];
}

export const ManageQuestions: React.FC = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for creating/editing a question
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Control panel for "Add New Question" box
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchExamDetails = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/api/student/exams/${examId}`); // Reuse student detailed fetch
      setExam(resp.data);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setError('Could not fetch questions roster. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const handleOpenEdit = (q: QuestionItem) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setOptA(q.options.A);
    setOptB(q.options.B);
    setOptC(q.options.C);
    setOptD(q.options.D);
    setCorrect(q.correctAnswer);
    setShowAddForm(false);
  };

  const handleCancelAction = () => {
    setEditingQuestion(null);
    setShowAddForm(false);
    clearForm();
  };

  const clearForm = () => {
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrect('A');
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setError('Please fill in all question prompt and choices fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingQuestion) {
        // Edit flow
        await api.put(`/api/admin/questions/${editingQuestion.id}`, {
          questionText: questionText.trim(),
          options: { A: optA.trim(), B: optB.trim(), C: optC.trim(), D: optD.trim() },
          correctAnswer: correct
        });
        setSuccess('MCQ Question modified successfully!');
      } else {
        // Add new flow
        await api.post('/api/admin/questions', {
          examId,
          questionText: questionText.trim(),
          options: { A: optA.trim(), B: optB.trim(), C: optC.trim(), D: optD.trim() },
          correctAnswer: correct
        });
        setSuccess('New question appended successfully!');
      }

      clearForm();
      setEditingQuestion(null);
      setShowAddForm(false);
      await fetchExamDetails();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit question. Please check constraints.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qId: string) => {
    if (!window.confirm('Are you sure you want to delete this specific question?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/questions/${qId}`);
      setSuccess('Question annihilated.');
      setExam(prev => prev ? { ...prev, questions: prev.questions.filter(q => q.id !== qId) } : null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to purge question.');
      setTimeout(() => setError(null), 3500);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3">
            <Link
              to="/admin/manage-exams"
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-850 shrink-0 transition shadow-sm"
              title="Return to Exams"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Question Manager Workspace</h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                Exam: <strong className="text-slate-800 font-semibold">{exam?.title || 'Retrieving...'}</strong>
              </p>
            </div>
          </div>

          {!showAddForm && !editingQuestion && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-lg shadow transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              Append New Question
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-220 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-220 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Dynamic Builder Form Workspace */}
        {(showAddForm || editingQuestion) && (
          <div className="bg-white p-6 rounded-xl border border-slate-250 shadow-md space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                {editingQuestion ? 'Edit Question Properties' : 'Append New MCQ Item'}
              </h3>
              <button onClick={handleCancelAction} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Question Text / Stem</label>
                <input
                  type="text"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Which of the following defines a kinetic energy tensor?"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm transition"
                />
              </div>

              {/* Four choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Option A</label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Option B</label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Option C</label>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Option D</label>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Correct letter selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-150">
                <div className="flex items-center gap-2.5">
                  <label className="text-xs font-bold text-slate-700">Flag Correct Option:</label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setCorrect(letter)}
                        className={`
                          w-8 h-8 rounded-md text-xs font-extrabold transition-all duration-150
                          ${correct === letter 
                            ? 'bg-blue-650 text-white shadow' 
                            : 'text-slate-600 hover:bg-slate-200'}
                        `}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelAction}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save Question
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Existing questions display */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <HelpCircle className="h-4.5 w-4.5 text-slate-450" />
            Questions Roster Inventory ({(exam?.questions || []).length} items)
          </h3>

          {loading && !exam ? (
            <div className="space-y-4">
              <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ) : (exam?.questions || []).length === 0 ? (
            <div className="text-center p-12 text-slate-405 text-sm">
              Your MCQ exam is currently empty. Click "Append New Question" to add MCQ items!
            </div>
          ) : (
            <div className="space-y-4">
              {(exam?.questions || []).map((q, idx) => (
                <div key={q.id} className="bg-slate-50/55 p-4 rounded-xl border border-slate-200 shadow-xxs flex justify-between items-start gap-4 hover:border-slate-300 transition duration-150">
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-850">
                      Question {idx + 1}: <span className="font-semibold text-slate-700">{q.questionText}</span>
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pl-2">
                      <span className={`p-1 pl-2.5 rounded-md border ${q.correctAnswer === 'A' ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-bold' : 'bg-white border-slate-200/80'}`}>
                        A: {q.options.A}
                      </span>
                      <span className={`p-1 pl-2.5 rounded-md border ${q.correctAnswer === 'B' ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-bold' : 'bg-white border-slate-200/80'}`}>
                        B: {q.options.B}
                      </span>
                      <span className={`p-1 pl-2.5 rounded-md border ${q.correctAnswer === 'C' ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-bold' : 'bg-white border-slate-200/80'}`}>
                        C: {q.options.C}
                      </span>
                      <span className={`p-1 pl-2.5 rounded-md border ${q.correctAnswer === 'D' ? 'bg-emerald-50 border-emerald-250 text-emerald-800 font-bold' : 'bg-white border-slate-200/80'}`}>
                        D: {q.options.D}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-700 font-mono font-bold pt-1 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Correct Answer: Option {q.correctAnswer}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-1 self-start select-none">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-lg hover:border-slate-350 shadow-xxs transition"
                      title="Edit Question"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-lg hover:border-rose-300 shadow-xxs transition"
                      title="Purge Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default ManageQuestions;
