import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, LogOut, Bot, BarChart2, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isBlurred, setIsBlurred] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/analytics', icon: BarChart2, label: 'Progress' },
    { path: '/ai-companion', icon: Bot, label: 'AI Companion' },
  ];

  useEffect(() => {
    let lastPress = 0;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastPress < 500) { // Double tap within 500ms
          setIsBlurred(prev => !prev);
        }
        lastPress = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isBlurred) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center cursor-pointer" onClick={() => setIsBlurred(false)}>
        <div className="text-center text-gray-400">
          <h1 className="text-4xl font-bold mb-4">Google</h1>
          <input type="text" className="border border-gray-300 rounded-full px-6 py-2 w-96" placeholder="Search Google or type a URL" readOnly />
          <p className="mt-8 text-sm">Double tap 'Esc' or click anywhere to return.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-secondary/20 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">MindEase</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-textSub hover:bg-white hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button 
            onClick={() => setIsBlurred(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-textSub hover:bg-white hover:text-primary transition-colors w-full text-left mt-auto"
          >
            <EyeOff className="w-5 h-5" />
            <span className="font-medium">Quick Hide</span>
          </button>
        </nav>

        <div className="absolute bottom-8 w-full px-6">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-textSub hover:bg-red-50 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;