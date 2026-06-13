import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  ArrowLeft, 
  BarChart2, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  Clock, 
  FileText,
  HelpCircle,
  Award
} from 'lucide-react';

interface CorrectionItem {
  questionText: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface SubmissionDetail {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  corrections?: CorrectionItem[];
}

export const StudentPerformance: React.FC = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const resp = await api.get(`/api/student/results/${submissionId}`);
        setSubmission(resp.data);
      } catch (err: any) {
        console.error('Failed to load performance details:', err);
        setError('Could not retrieve detailed correction sheet. Check access permissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [submissionId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-24">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 text-xs">Loading performance review...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-3 max-w-lg mx-auto text-center">
          <p className="text-sm font-bold text-rose-800">⚠️ Failed to Load correction Sheet</p>
          <p className="text-xs text-rose-600">{error || 'Record does not exist.'}</p>
          <Link to="/admin/results" className="inline-block px-4 py-2 bg-slate-800 text-white rounded text-xs transition">
            Back to Results
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const passed = submission.percentage >= 50;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Navigation header row */}
        <div className="flex justify-between items-center bg-transparent">
          <Link
            to="/admin/results"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-205 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 transition shadow-xxs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roster
          </Link>
          <span className="text-[10px] text-slate-400 font-mono">Submission ID: {submission.id}</span>
        </div>

        {/* Master sheet header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3.5">
            <div className="space-y-1">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono tracking-wider ${
                passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {passed ? 'PASSED ASSESSED' : 'UNSATISFACTORY'}
              </span>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-905">{submission.examTitle}</h1>
            </div>

            {/* Profile boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-180">
                <User className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-805 truncate">{submission.studentName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{submission.studentEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-180">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-805">Submitted On</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scores wheel presentation */}
          <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-1">
            <Award className={`h-8 w-8 ${passed ? 'text-amber-500' : 'text-slate-405'}`} />
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{submission.percentage}%</p>
            <p className="text-xs font-bold text-slate-650">Score Obtained</p>
            <p className="text-[10px] text-slate-405 font-mono">{submission.score} / {submission.totalQuestions} Questions</p>
          </div>
        </div>

        {/* Detailed Correction list */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-805 uppercase tracking-widest font-mono border-b border-slate-100 pb-3">
            🎯 Detailed MCQ Corrections Sheet
          </h3>

          {!submission.corrections || submission.corrections.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs">No question-level correction traces returned.</p>
          ) : (
            <div className="space-y-5">
              {submission.corrections.map((corr, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex gap-4 ${
                    corr.isCorrect ? 'bg-emerald-50/30 border-emerald-150' : 'bg-rose-50/20 border-rose-150'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {corr.isCorrect ? (
                      <CheckCircle className="h-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 h-5 text-rose-600" />
                    )}
                  </span>

                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-850">
                      Q{idx + 1}: <span className="font-semibold text-slate-705 leading-relaxed">{corr.questionText}</span>
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const isSelected = corr.selectedOption === letter;
                        const isCorrectAnswer = corr.correctAnswer === letter;
                        
                        let borderStyle = 'border-slate-200 bg-white';
                        if (isSelected) borderStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                        if (isCorrectAnswer) borderStyle = 'border-emerald-450 bg-emerald-50 text-emerald-950 font-bold';

                        return (
                          <div key={letter} className={`p-2 rounded-lg border flex items-center gap-2 ${borderStyle}`}>
                            <span className="font-bold font-mono">{letter}:</span>
                            <span className="truncate">{corr.options[letter]}</span>
                            {isSelected && <span className="text-[9px] font-mono uppercase font-bold text-rose-700 ml-auto">their answer</span>}
                            {isCorrectAnswer && <span className="text-[9px] font-mono uppercase font-bold text-emerald-700 ml-auto">correct option</span>}
                          </div>
                        );
                      })}
                    </div>
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
export default StudentPerformance;
