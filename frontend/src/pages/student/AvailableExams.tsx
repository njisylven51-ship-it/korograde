import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle
} from 'lucide-react';

interface ExamListItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  questionCount: number;
  completed: boolean;
  score: number | null;
  percentage: number | null;
  submissionId: string | null;
}

export const AvailableExams: React.FC = () => {
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const resp = await api.get('/api/student/exams');
        setExams(resp.data);
      } catch (err: any) {
        console.error('Failed to load exams:', err);
        setError('Could not retrieve available tests rosters.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-905 tracking-tight">Examination Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pick a subject to take your online test. Remember, multiple attempts are strictly forbidden.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-225 rounded-xl text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center p-16 bg-white border border-slate-200 rounded-xl space-y-3.5 max-w-lg mx-auto shadow-sm">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-slate-805">No Active Exams</h4>
            <p className="text-xs text-slate-505 leading-relaxed">
              Your class teacher hasn’t published any online MCQ tests yet. Please coordinate directly with your class mentors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {exams.map((exam) => {
              const completed = exam.completed;
              return (
                <div 
                  key={exam.id} 
                  className={`
                    rounded-xl border shadow-sm p-6 flex flex-col justify-between hover:shadow transition duration-150
                    ${completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200'}
                  `}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-base font-extrabold text-slate-805 truncate leading-tight">
                        {exam.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-550 font-mono font-bold shrink-0">
                        <Clock className="h-3 w-3" />
                        {exam.duration}m
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    <div className="flex gap-4 text-xxs font-mono text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {exam.questionCount} Questions
                      </span>
                      <span>|</span>
                      <span>ID: {exam.id}</span>
                    </div>
                  </div>

                  {/* Submission status or active start test button */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    {completed ? (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Attempt Completed ({exam.percentage}%)</span>
                        </div>
                        <Link
                          to={`/student/results/details/${exam.submissionId}`}
                          className="px-3.5 py-1.5 border border-slate-205 hover:border-slate-350 hover:bg-slate-50 rounded text-xxs font-extrabold text-slate-700 transition shadow-xxs"
                        >
                          View Corrections
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="text-[10px] text-slate-400 font-mono">
                          * 1 attempt strictly enforced
                        </div>
                        <Link
                          to={`/student/exams/${exam.id}/instructions`}
                          className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-650 hover:bg-blue-750 text-white text-xs font-bold rounded-lg transition shadow group"
                        >
                          <PlayCircle className="h-4.5 w-4.5 text-blue-105 group-hover:scale-105 transition-transform" />
                          Take Exam
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default AvailableExams;
