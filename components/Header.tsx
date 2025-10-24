import React, { useState } from 'react';
import { User, View } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  navigateTo: (view: View) => void;
  unreadNotifications: number;
  currentView: View;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, navigateTo, unreadNotifications, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink: React.FC<{ view: View; children: React.ReactNode }> = ({ view, children }) => (
    <button
      onClick={() => {
        navigateTo(view);
        setIsMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-blue-600 text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
              <i className="fa-solid fa-city text-blue-500"></i>
              <span>Civic Connect</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <NavLink view="admin">Admin Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink view="report">Report Issue</NavLink>
                    <NavLink view="my-reports">My Reports</NavLink>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                    <NavLink view="track">Track Issue</NavLink>
                  </>
                )}
              </>
            ) : (
                <>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                    <NavLink view="track">Track Issue</NavLink>
                </>
            )}
          </div>
          <div className="flex items-center gap-4">
             {currentUser ? (
              <>
                {!currentUser.isAdmin && (
                  <button onClick={() => navigateTo('notifications')} className="relative text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400">
                    <i className="fa-solid fa-bell text-xl"></i>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                )}
                <div className="hidden md:block">
                  <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => navigateTo('login')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    Login / Sign Up
                </button>
              </div>
            )}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400">
                <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-stretch">
            {currentUser ? (
              <>
                {currentUser.isAdmin ? (
                  <NavLink view="admin">Admin Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink view="report">Report Issue</NavLink>
                    <NavLink view="my-reports">My Reports</NavLink>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                    <NavLink view="track">Track Issue</NavLink>
                  </>
                )}
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full mt-4 text-left px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                  Logout
                </button>
              </>
            ) : (
                <>
                    <NavLink view="dashboard">Public Dashboard</NavLink>
                    <NavLink view="track">Track Issue</NavLink>
                    <button onClick={() => { navigateTo('login'); setIsMenuOpen(false); }} className="w-full mt-4 text-left px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Login / Sign Up
                    </button>
                </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;