import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Play,
  ClipboardList
} from 'lucide-react';

interface ExamDetail {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  submissionId: string | null;
  questions: any[];
}

export const ExamInstructions: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const resp = await api.get(`/api/student/exams/${examId}`);
        setExam(resp.data);
      } catch (err: any) {
        console.error('Failed to load exam specs:', err);
        setError('Could not locate exam coordinates.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-24">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs text-slate-500">Retrieving instructions sheet...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !exam) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-4 max-w-md mx-auto text-center shadow-md">
          <p className="font-bold text-rose-800">⚠️ Failed to Load Details</p>
          <p className="text-xs text-rose-600">{error || 'This exam file is corrupt or has been removed.'}</p>
          <Link to="/student/exams" className="inline-block px-4 py-2 bg-slate-800 text-white rounded text-xs transition font-semibold">
            Back to Available Exams
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* Navigation line */}
        <div className="flex justify-between items-center bg-transparent">
          <Link
            to="/student/exams"
            className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-205 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition shadow-xxs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
          <span className="text-[10px] text-slate-400 font-mono">Exam ID: {exam.id}</span>
        </div>

        {/* Info card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-2 text-center border-b border-slate-100 pb-5">
            <ClipboardList className="h-10 w-10 text-blue-600 mx-auto" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-905 leading-tight">{exam.title}</h1>
            <p className="text-xs text-slate-550 max-w-md mx-auto">{exam.description}</p>
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Time Limit</p>
                <p className="text-xs font-bold text-slate-800">{exam.duration} Minutes</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-purple-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Questions</p>
                <p className="text-xs font-bold text-slate-800">{exam.questions.length} MCQ Questions</p>
              </div>
            </div>
          </div>

          {/* Attempt policy red bounds block */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4.5 space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wide">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0 animate-pulse" />
              ⚠️ Crucial Academic integrity Guidelines
            </h4>
            <div className="text-xxs sm:text-xs text-rose-800/90 space-y-2 leading-relaxed pl-6 list-disc font-medium">
              <p>• Once you click "Start Examination", the countdown timer is permanently loaded.</p>
              <p>• Multiple attempts are <strong>strictly forbidden</strong>. Do NOT refresh or press Back keys.</p>
              <p>• Leaving or closing the tab during exam will NOT pause your countdown timer.</p>
              <p>• Upon timer expiry, the testing client will auto-calculate responses and submit.</p>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex pt-4 justify-center">
            {exam.completed ? (
              <div className="text-center space-y-2 w-full">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
                  "You have already completed this exam. Multiple attempts are not allowed."
                </div>
                <Link
                  to={`/student/results/details/${exam.submissionId}`}
                  className="inline-block px-5 py-2 w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition shadow-sm"
                >
                  Inspect completed Correction Details
                </Link>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/student/exams/${exam.id}/take`)}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-650 hover:bg-blue-750 text-white font-bold text-sm rounded-xl transition shadow-lg w-full group select-none"
              >
                Start Examination
                <Play className="h-4 w-4 text-blue-100 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
export default ExamInstructions;
