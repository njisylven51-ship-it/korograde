import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  User as UserIcon, 
  Mail, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Award,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompletedExamItem {
  id: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<CompletedExamItem[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const resp = await api.get('/api/student/results');
        setCompletions(resp.data);

        // Calculate average percentage
        const list = resp.data as CompletedExamItem[];
        if (list.length > 0) {
          const sum = list.reduce((acc, curr) => acc + curr.percentage, 0);
          setAverage(parseFloat((sum / list.length).toFixed(1)));
        }
      } catch (err: any) {
        console.error('Failed to fetch profile stats:', err);
        setError('Error loading performance records history.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-905 tracking-tight">Academic Student Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Display credentials and historic performance evaluation metrics stashed under your school portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-225 rounded-xl text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Personal configurations */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-widest font-mono border-b border-slate-100 pb-3 block">
              👤 Personal Credentials
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-850 truncate">{user?.name}</p>
                  <p className="text-xxs text-slate-450 uppercase font-bold tracking-wider mt-0.5">{user?.role} portal</p>
                </div>
              </div>

              <div className="pt-2 divide-y divide-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-450 font-medium">Email login</span>
                  <span className="text-slate-700 font-semibold text-right truncate max-w-[150px]">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-slate-450 font-medium">Registered Date</span>
                  <span className="text-slate-700 font-semibold text-right">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-slate-450 font-medium">One-Attempt Security</span>
                  <span className="px-2 py-0.5 roundedbg-blue-50 text-[10px] bg-sky-50 text-blue-800 border border-blue-200 font-bold uppercase font-mono">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Overall stats & grading logs history list */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-widest font-mono border-b border-slate-100 pb-3">
              📈 Historical Evaluations ({completions.length} tests completed)
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block"></div>
              </div>
            ) : completions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs shadow-xxs rounded-lg border border-slate-100 italic">
                No exam logs compiled. Try an active MCQ test.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Aggregated metrics bar */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-180 mb-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">My Average Percentage</p>
                    <p className="text-xl font-extrabold text-slate-805">{average}%</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">Tests Completed</p>
                    <p className="text-xl font-extrabold text-slate-805">{completions.length} exams</p>
                  </div>
                </div>

                {/* Exams list */}
                <div className="divide-y divide-slate-150 border border-slate-150 rounded-xl overflow-hidden shadow-xxs">
                  {completions.map((comp) => (
                    <div key={comp.id} className="p-3.5 bg-white flex justify-between items-center gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-805 truncate">{comp.examTitle}</p>
                        <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(comp.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 border rounded-full text-xxs font-extrabold font-mono ${
                          comp.percentage >= 50 
                            ? 'bg-emerald-50 border-emerald-155 text-emerald-800' 
                            : 'bg-rose-50 border-rose-155 text-rose-800'
                        }`}>
                          {comp.percentage}%
                        </span>
                        <Link
                          to={`/student/results/details/${comp.id}`}
                          className="px-2.5 py-1 border border-slate-205 bg-white text-xxs font-extrabold rounded hover:bg-slate-50 text-slate-650 shadow-xxs transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default StudentProfile;
