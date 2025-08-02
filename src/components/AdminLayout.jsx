// AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, LogOut, Users, Menu, X, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import sinjaiLogo from '../assets/sinjai.png';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg transform scale-105'
      : 'text-gray-300 hover:text-white hover:bg-black hover:bg-opacity-10 hover:transform hover:scale-105';

  const handleLogout = () => {
 Swal.fire({
  title: 'Konfirmasi Logout',
  text: 'Apakah Anda yakin ingin keluar dari sistem?',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Ya, Logout',
  cancelButtonText: 'Batal',
  confirmButtonColor: '#ef4444', // merah Tailwind
  cancelButtonColor: '#6b7280',  // gray-500 Tailwind
  customClass: {
    popup: darkMode ? 'dark-popup' : '',
    confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md',
    cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth).then(() => {
          localStorage.removeItem('lastActivity');
          Swal.fire({
            title: 'Berhasil Logout',
            text: 'Anda telah keluar dari sistem',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/admin');
          });
        });
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const namePart = user.email.split('@')[0];
        setAdminName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        setAdminEmail(user.email);
      } else {
        navigate('/admin');
      }
    });

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > 30 * 60 * 1000) {
        signOut(auth).then(() => {
          localStorage.removeItem('lastActivity');
          Swal.fire({
            title: 'Sesi Berakhir',
            text: 'Sesi Anda telah berakhir. Silakan login kembali.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6'
          }).then(() => {
            navigate('/admin');
          });
        });
      }
    };

    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    window.addEventListener('click', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);

    const interval = setInterval(checkInactivity, 60 * 1000);
    updateLastActivity();

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      navigate(1);
    };

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
    };
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        setIsSidebarOpen(false);
      }
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, showProfileMenu]);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/upload', icon: Upload, label: 'Upload Buku' },
    { path: '/books', icon: BookOpen, label: 'Koleksi Buku' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar fixed top-0 left-0 bottom-0 z-30 w-72 bg-gradient-to-b from-gray-800 via-gray-900 to-black transform transition-all duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-21 h-21 rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/10">
                <img src={sinjaiLogo} alt="Logo Sinjai" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Perpustakaan Desa Palae</h2>
                <p className="text-gray-400 text-sm">Perpustakaan Digital</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Menu Utama
          </div>
          {menuItems.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive(path)}`}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium flex-1">{label}</span>
              {badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hamburger-btn md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:ml-0 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
