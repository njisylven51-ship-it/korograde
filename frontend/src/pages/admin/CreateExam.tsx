import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Save,
  GraduationCap
} from 'lucide-react';

interface LocalQuestion {
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(30); // Default 30 min
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);

  // State for the question being currently added in fields
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validate the current question input fields before pushing
  const handleAddQuestion = () => {
    if (!qText.trim()) {
      setError('Question text is required before adding.');
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setError('All Options (A, B, C, and D) must be provided.');
      return;
    }

    const newQ: LocalQuestion = {
      questionText: qText.trim(),
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim()
      },
      correctAnswer: correct
    };

    setQuestions([...questions, newQ]);

    // Wipe question input fields for next entry
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrect('A');
    setError(null);
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !description.trim()) {
      setError('Exam Title and Description are required.');
      return;
    }

    if (duration <= 0) {
      setError('Exam Duration must be greater than zero.');
      return;
    }

    if (questions.length === 0) {
      setError('You must add at least 1 question to publish this examination.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/admin/exams', {
        title: title.trim(),
        description: description.trim(),
        duration,
        questions
      });

      setSuccess('Examination published successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/manage-exams');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish exam. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create MCQ Examination</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build a comprehensive multiples choice assessment. Define answers and set attempt gates.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-250 text-rose-800 text-xs font-semibold rounded-lg">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-205 text-emerald-800 text-xs font-semibold rounded-lg">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-6">
          {/* Section 1: Exam General Configurations */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              1. General Details
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Exam Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Physics Assessment (Grade 12)"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Instructions</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Covers Newtonian forces, electromagnetism, waves. No external assistance."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Question Dynamic Builder */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
              2. Add MCQ Questions ({questions.length} Added)
            </h3>

            {/* Questions list preview inside form */}
            {questions.length > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
                <p className="text-xxs uppercase tracking-wider font-mono text-slate-400 font-bold mb-2">Question Stack Preview</p>
                {questions.map((q, qidx) => (
                  <div key={qidx} className="bg-white p-3.5 rounded-lg border border-slate-180 flex justify-between items-start gap-3 shadow-xxs">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Q{qidx + 1}: {q.questionText}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xxs text-slate-500 mt-1">
                        <span className={q.correctAnswer === 'A' ? 'font-bold text-emerald-600' : ''}>A: {q.options.A}</span>
                        <span className={q.correctAnswer === 'B' ? 'font-bold text-emerald-600' : ''}>B: {q.options.B}</span>
                        <span className={q.correctAnswer === 'C' ? 'font-bold text-emerald-600' : ''}>C: {q.options.C}</span>
                        <span className={q.correctAnswer === 'D' ? 'font-bold text-emerald-600' : ''}>D: {q.options.D}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">Correct Option: {q.correctAnswer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qidx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition shrink-0"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Builder inputs workspace */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-750">Question Prompt</label>
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. Which fundamental force has the longest action range?"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition text-sm text-slate-850"
                />
              </div>

              {/* 4 Choices Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Option A</label>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Choice Content A"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Option B</label>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Choice Content B"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Option C</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Choice Content C"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Option D</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Choice Content D"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition text-xs"
                  />
                </div>
              </div>

              {/* Correct answer and triggers */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-205">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Correct Answer Selection:</label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setCorrect(letter)}
                        className={`
                          w-8 h-8 rounded-md text-xs font-extrabold transition-all duration-150
                          ${correct === letter 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-250'}
                        `}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white text-xs font-bold rounded-lg transition shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add to Question Stack
                </button>
              </div>
            </div>
          </div>

          {/* Publishing Trigger Bar */}
          <div className="flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 rounded-lg text-slate-550 hover:text-slate-900 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-750 font-bold text-white text-sm rounded-lg transition shadow-md disabled:bg-blue-200 disabled:text-blue-500"
            >
              <Save className="h-4.5 w-4.5" />
              {loading ? 'Publishing...' : 'Publish MCQ Exam'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
export default CreateExam;
