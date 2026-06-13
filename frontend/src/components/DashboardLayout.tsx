import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  BarChart2, 
  User as UserIcon,
  HelpCircle,
  Clock
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation Links based on role
  const adminLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Create Exam', path: '/admin/create-exam', icon: PlusCircle },
    { label: 'Manage Exams', path: '/admin/manage-exams', icon: FileText },
    { label: 'Grading Reports', path: '/admin/results', icon: BarChart2 },
  ];

  const studentLinks = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Available Exams', path: '/student/exams', icon: Clock },
    { label: 'Performance Logs', path: '/student/results', icon: BarChart2 },
    { label: 'My Profile', path: '/student/profile', icon: UserIcon },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header Banner */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 md:hidden shadow-sm w-full">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">KoroGrade</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Side Navigation - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-400 font-bold" />
            <span className="text-2xl font-extrabold tracking-tight text-white">KoroGrade</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Logger Information */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">My Account</p>
          <p className="text-sm font-semibold truncate text-white mt-1">{user?.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <p className="text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'Teacher / Admin' : 'Student Portal'}</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-450'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Foot / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 hover:bg-rose-950/10 transition-colors duration-150"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Desktop Top Row Header (Minimal) */}
        <section className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-mono">Portal:</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {isAdmin ? 'Teacher' : 'Student'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Logged in as: <strong className="text-slate-900">{user?.email}</strong></span>
          </div>
        </section>

        {/* Actual Dynamic Workspace View */}
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
export default DashboardLayout;
