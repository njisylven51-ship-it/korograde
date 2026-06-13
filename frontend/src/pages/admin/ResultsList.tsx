import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  BarChart2, 
  Search, 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

interface SubmissionItem {
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
}

export const ResultsList: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const resp = await api.get('/api/admin/results');
        setSubmissions(resp.data);
      } catch (err: any) {
        console.error('Failed to fetch results:', err);
        setError('Could not retrieve submissions logs. Please check server connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Filter submissions by student name, email, or exam title
  const filteredSubmissions = submissions.filter(sub => {
    const q = searchQuery.toLowerCase();
    return (
      (sub.studentName || '').toLowerCase().includes(q) ||
      (sub.studentEmail || '').toLowerCase().includes(q) ||
      (sub.examTitle || '').toLowerCase().includes(q)
    );
  });

  // Calculate some overview metrics
  const averagePercentage = submissions.length > 0
    ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length).toFixed(1)
    : '0';

  const passingCount = submissions.filter(s => s.percentage >= 50).length;
  const passingRate = submissions.length > 0
    ? ((passingCount / submissions.length) * 100).toFixed(0)
    : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Grading & Assessment Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review detailed reports of completed exams, student score percentages, and correction profiles.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-220 rounded-lg text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Dynamic Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider font-mono">Completed Submissions</p>
              <p className="text-2xl font-extrabold text-slate-900">{submissions.length}</p>
            </div>
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="h-5.5 w-5.5" />
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider font-mono">Class Average Score</p>
              <p className="text-2xl font-extrabold text-slate-900">{averagePercentage}%</p>
            </div>
            <span className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="h-5.5 w-5.5" />
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider font-mono">Passing Rate (50%+)</p>
              <p className="text-2xl font-extrabold text-slate-900">{passingRate}%</p>
            </div>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart2 className="h-5.5 w-5.5" />
            </span>
          </div>
        </div>

        {/* Table/List Filter Workspace */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-150 flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name, email, or examination title..."
              className="w-full bg-transparent border-none text-sm text-slate-850 focus:outline-none placeholder-slate-400"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="mt-2 text-xs">Loading submissions history...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-16 text-center text-slate-450 text-sm">
              No matching submission records found.
            </div>
          ) : (
            /* Table list */
            <div className="divide-y divide-slate-150">
              {filteredSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition duration-100">
                  <div className="space-y-1 bg-transparent flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 capitalize truncate">{sub.studentName}</span>
                      <span className="text-xxs text-slate-450 font-mono hidden sm:inline">({sub.studentEmail})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-550 truncate">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{sub.examTitle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Scored badge and trigger details button */}
                  <div className="flex items-center gap-4 shrink-0 self-end md:self-auto select-none">
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold font-mono border ${
                        sub.percentage >= 80 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : sub.percentage >= 50
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {sub.score} / {sub.totalQuestions} ({sub.percentage}%)
                      </span>
                    </div>
                    
                    <Link
                      to={`/admin/results/details/${sub.id}`}
                      className="p-1.5 border border-slate-205 rounded-lg hover:bg-white text-slate-600 hover:text-blue-600 hover:border-slate-300 transition shadow-xxs flex items-center gap-1 text-xs font-semibold"
                    >
                      Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
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
export default ResultsList;
