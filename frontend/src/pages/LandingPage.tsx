import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2, Award, ClipboardCheck, Users, ShieldAlert } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top row Navigation */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">KoroGrade</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            ⚡ Automated Grading & Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Seamless MCQ Assessment for <span className="text-blue-600">Smart Educators</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600">
            Create examinations, manage questions, and let our grading engine do the heavy lifting instantly. 
            Keep students engaged with instant corrections, comprehensive reports, and detailed feedback logs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/signup" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md group">
              Get Started for Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center justify-center px-6 py-3 bg-white border border-slate-350 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
              Acknowledge Portal
            </Link>
          </div>
        </div>

        {/* Hero Features Visual Grid */}
        <div className="flex-1 w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          <div className="absolute -top-4 -right-4 bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full shadow border border-amber-200 animate-bounce">
            One-Attempt Guard Active! 🛡️
          </div>
          
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition shadow-sm border border-slate-100">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-slate-800">Swift Grading</h3>
            <p className="text-xs text-slate-550 leading-relaxed">Grade exams automatically with detailed percentages and logs.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition shadow-sm border border-slate-100">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
            <h3 className="font-bold text-slate-800">One-Attempt Guard</h3>
            <p className="text-xs text-slate-550 leading-relaxed">Rigid attempt limitations prevent student double-submissions.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition shadow-sm border border-slate-100">
            <Award className="h-8 w-8 text-amber-600" />
            <h3 className="font-bold text-slate-800">Analytics Panel</h3>
            <p className="text-xs text-slate-550 leading-relaxed">Get detailed score reporting, activity logs, and progress metrics.</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition shadow-sm border border-slate-100">
            <Users className="h-8 w-8 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Multi-Role Support</h3>
            <p className="text-xs text-slate-550 leading-relaxed">Separate portals customized for teachers (admin) and students.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-12 text-center text-xs text-slate-500">
        <p>© 2026 KoroGrade Assessment Systems. All rights reserved. Built with precision for educational equity.</p>
      </footer>
    </div>
  );
};
export default LandingPage;
