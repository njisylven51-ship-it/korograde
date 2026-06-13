import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup, isAuthenticated, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) return;

    setLoading(true);
    try {
      await signup(name, email, password, role);
    } catch (err) {
      // Error handled by AuthContext displays in label
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6">
      <div className="max-w-md w-full space-y-7 bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">KoroGrade</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Create your school account</h2>
          <p className="text-sm text-slate-550">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
              Log in here
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-bold text-slate-755 uppercase tracking-wider font-mono">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-350 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-bold text-slate-755 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arthur@school.edu"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-350 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-bold text-slate-755 uppercase tracking-wider font-mono">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-350 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Role selector buttons - Clean custom styled radio buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-755 uppercase tracking-wider font-mono">
              Role Access type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`
                  p-3 rounded-lg border text-sm font-semibold flex flex-col items-center justify-center gap-1 transition
                  ${role === 'student' 
                    ? 'border-blue-600 bg-blue-50/50 text-blue-750 font-bold ring-2 ring-blue-650' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}
                `}
              >
                🎓 Student Account
                <span className="text-[10px] text-slate-450 font-normal">Take tests and view reports</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`
                  p-3 rounded-lg border text-sm font-semibold flex flex-col items-center justify-center gap-1 transition
                  ${role === 'admin' 
                    ? 'border-blue-700 bg-blue-50/50 text-blue-750 font-bold ring-2 ring-blue-650' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}
                `}
              >
                🏫 Teacher Portal
                <span className="text-[10px] text-slate-450 font-normal">Manage exams and monitor performance</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-blue-100 disabled:text-blue-500 shadow-md group mt-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Confirm Registration
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
export default SignupPage;
