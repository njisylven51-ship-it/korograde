import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  Users, 
  FileSpreadsheet, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  PlusCircle, 
  Activity, 
  CheckCircle, 
  UserCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  totalSubmissions: number;
  recentActivity: {
    type: 'submission' | 'registration';
    description: string;
    time: string;
  }[];
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalExams: 0,
    totalSubmissions: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await api.get('/api/admin/stats');
        setStats(resp.data);
      } catch (err: any) {
        console.error('Failed to load stats:', err);
        setError('Could not fetch metrics. Please confirm your database connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Console Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800 font-semibold">{user?.name}</strong>. Monitor class MCQ progress and manage examinations.
            </p>
          </div>
          <Link
            to="/admin/create-exam"
            className="flex items-center gap-2 px-4.5 py-2 bg-blue-600 hover:bg-blue-750 text-white text-sm font-semibold rounded-lg shadow transition duration-155"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Establish New Exam
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl text-xs font-semibold text-rose-850">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
            <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
          </div>
        ) : (
          /* Cards Metrics Bento Group */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Total Classes Students</p>
                <p className="text-3xl font-extrabold text-slate-900 group-hover:text-blue-600 transition">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Configured Exams</p>
                <p className="text-3xl font-extrabold text-slate-900 group-hover:text-amber-500 transition">{stats.totalExams}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Assessed Submissions</p>
                <p className="text-3xl font-extrabold text-slate-900 group-hover:text-emerald-500 transition">{stats.totalSubmissions}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: Recent Activities & Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity stream */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
              Recent Academic Activity Logging
            </h3>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ) : stats.recentActivity.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No recent grading activities recorded yet. Publish an exam and share credentials with students to begin!
              </div>
            ) : (
              <div className="space-y-3.5">
                {stats.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start p-3 hover:bg-slate-50 rounded-lg transition border border-transparent hover:border-slate-100">
                    <span className={`p-1.5 rounded-md mt-0.5 ${
                      act.type === 'submission' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {act.type === 'submission' ? <CheckCircle className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 leading-normal">{act.description}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">
                        {new Date(act.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Tool kit Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-905 border-b border-slate-100 pb-3">
                📚 Teacher Operations Toolkit
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure MCQ assessments and grade student answers instantly. Secure authentication blocks multiple attempts automatically.
              </p>
              
              <div className="space-y-2.5 pt-1">
                <Link
                  to="/admin/create-exam"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-semibold text-slate-700"
                >
                  Create & Craft MCQ Exam
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  to="/admin/manage-exams"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-semibold text-slate-700"
                >
                  Manage/Edit Active Exams
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  to="/admin/results"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-semibold text-slate-700"
                >
                  View submissions & corrections
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Quick status box */}
            <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 shrink-0" />
              <p className="text-[10px] text-blue-800 font-medium">
                KoroGrade Dual Sync database is functional. Auto grading online!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminDashboard;
