import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Activity, 
  Calendar 
} from 'lucide-react';

interface StudentStats {
  totalExamsAvailable: number;
  totalCompleted: number;
  averageScore: number;
  recentResults: {
    id: string;
    examId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
  }[];
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalExamsAvailable: 0,
    totalCompleted: 0,
    averageScore: 0,
    recentResults: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const resp = await api.get('/api/student/stats');
        setStats(resp.data);
      } catch (err: any) {
        console.error('Failed to load student stats:', err);
        setError('Could not retrieve progress logs. Checking secure session...');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-905 tracking-tight">Student Assessment Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              School Account: <strong className="text-slate-800">{user?.name}</strong>. Attempt tests, check correction notes, and monitor performance.
            </p>
          </div>
          <Link
            to="/student/exams"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-650 hover:bg-blue-750 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Explore Active Exams
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-225 rounded-xl text-xs font-semibold text-rose-800">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
          </div>
        ) : (
          /* Cards general */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Available Exams</p>
                <p className="text-3xl font-extrabold text-slate-905 group-hover:text-blue-650 transition">{stats.totalExamsAvailable}</p>
              </div>
              <span className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Evaluated Submissions</p>
                <p className="text-3xl font-extrabold text-slate-905 group-hover:text-emerald-650 transition">{stats.totalCompleted}</p>
              </div>
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6" />
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">My Average Score</p>
                <p className="text-3xl font-extrabold text-slate-905 group-hover:text-amber-500 transition">{stats.averageScore}%</p>
              </div>
              <span className="p-3 bg-amber-50 text-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent results column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              My Recent Performance Records
            </h3>

            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded text-xs"></div>
              </div>
            ) : stats.recentResults.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                You have not completed any examinations yet. Check "Available Exams" to start a test.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentResults.map((res) => (
                  <div key={res.id} className="py-3 flex justify-between items-center">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-805 truncate">{res.examTitle}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(res.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold font-mono border ${
                        res.percentage >= 50 
                          ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                          : 'bg-rose-50 border-rose-150 text-rose-800'
                      }`}>
                        {res.percentage}%
                      </span>
                      <Link
                        to={`/student/results/details/${res.id}`}
                        className="px-2.5 py-1 text-xxs font-extrabold border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 rounded text-slate-650 transition shadow-xxs"
                      >
                        Correction Notes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick instructions guide right sidebar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-905 border-b border-slate-100 pb-3">
                📋 Exam Regulations Guide
              </h3>
              
              <div className="space-y-3 pt-1 text-xs text-slate-650">
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xxs shrink-0 mt-0.5">1</span>
                  <p>Each MCQ examination can only be attempted <strong>ONCE</strong>.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xxs shrink-0 mt-0.5">2</span>
                  <p>Exams are governed by an active countdown timer. Avoid refresh.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xxs shrink-0 mt-0.5">3</span>
                  <p>Upon submission, results and question corrections are evaluated in real-time.</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/student/exams"
                className="w-full justify-center flex items-center gap-1 py-3 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md"
              >
                Go to Exam Center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};
export default StudentDashboard;
