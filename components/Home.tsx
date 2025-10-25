import React from 'react';
import { User, View } from '../types';

interface HomeProps {
  navigateTo: (view: View) => void;
  currentUser: User | null;
}

const CityIllustration = () => (
    <div className="relative float-animation">
        <svg className="w-full h-auto text-blue-300 dark:text-blue-500" viewBox="0 0 200 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="50" width="20" height="50" rx="2"/>
          <rect x="35" y="30" width="30" height="70" rx="2"/>
          <rect x="70" y="60" width="15" height="40" rx="2"/>
          <rect x="90" y="20" width="25" height="80" rx="2"/>
          <rect x="120" y="45" width="20" height="55" rx="2"/>
          <rect x="145" y="35" width="45" height="65" rx="2"/>
          <circle cx="40" cy="45" r="2" className="text-white"/>
          <circle cx="100" cy="35" r="3" className="text-white"/>
          <circle cx="160" cy="55" r="2.5" className="text-white"/>
        </svg>
    </div>
  );

const Home: React.FC<HomeProps> = ({ navigateTo, currentUser }) => {
  if (currentUser) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center font-bold text-white ring-8 ring-white/20 text-4xl shadow-lg">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{currentUser.isAdmin ? 'Admin' : currentUser.username}!</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8">
            {currentUser.isAdmin
              ? "Oversee community reports, update their progress, and ensure civic harmony from the admin dashboard."
              : "Ready to make a difference? Report a new issue or check the status of existing ones."
            }
          </p>
          {currentUser.isAdmin ? (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => navigateTo('admin')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-10 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-clipboard-list"></i>
                Go to Admin Dashboard
              </button>
              {!currentUser.department && (
                 <button
                    onClick={() => navigateTo('admin-department-select')}
                    className="w-full sm:w-auto bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-10 rounded-full hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-building-user"></i>
                    Choose Department
                  </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={() => navigateTo('report')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-10 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-bullhorn"></i>
                Report an Issue
              </button>
               <button
                onClick={() => navigateTo('my-reports')}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-10 rounded-full hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-file-lines"></i>
                My Reports
              </button>
              <button
                onClick={() => navigateTo('track')}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 px-10 rounded-full hover:from-purple-600 hover:to-violet-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                Track Issue
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 px-10 rounded-full hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-chart-line"></i>
                View Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center py-20 px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="text-center md:text-left z-10">
                    <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                        Civic Connect
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                        The direct line to a better community. Report local issues, track their progress, and see real change happen.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center sm:items-start gap-6">
                            {/* User Login Button */}
                            <div className="relative group w-full sm:w-auto">
                                <button
                                onClick={() => navigateTo('login')}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl text-base flex items-center justify-center gap-3"
                                >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                User Login / Sign Up
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-in-out invisible group-hover:visible pointer-events-none z-50">
                                Report local issues with photos and location details.
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-slate-900"></div>
                                </div>
                            </div>

                            {/* Admin Login Button */}
                            <div className="relative group w-full sm:w-auto">
                                <button
                                onClick={() => navigateTo('admin-login')}
                                className="w-full sm:w-auto bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-8 rounded-full hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all transform hover:scale-105 text-base flex items-center justify-center gap-3"
                                >
                                <i className="fa-solid fa-user-shield"></i>
                                Admin Login
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-in-out invisible group-hover:visible pointer-events-none z-50">
                                Access the admin dashboard to review, update, and track reported issues.
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-slate-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block z-0">
                    <CityIllustration />
                </div>
            </div>
          </div>
        </div>

        <div className="py-20">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How It Works</h2>
                <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-12">
                    A simple, transparent process for community improvement in four easy steps.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="card-fade-in-up text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/30 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg">
                            <i className="fa-solid fa-camera text-4xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">1. Report</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">See a problem? Snap a photo, add details, and submit your report in minutes.</p>
                    </div>

                    <div className="card-fade-in-up text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/30 transform hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg">
                            <i className="fa-solid fa-magnifying-glass-chart text-4xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">2. Track</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Get a unique ID and use our AI assistant to check the status of your report anytime.</p>
                    </div>
                    
                    <div className="card-fade-in-up text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/30 transform hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg">
                            <i className="fa-solid fa-people-roof text-4xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">3. Resolve</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">City officials are notified, work on a solution, and update the status until it's fixed.</p>
                    </div>

                    <div className="card-fade-in-up text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/30 transform hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: '0.6s' }}>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-5 shadow-lg">
                            <i className="fa-solid fa-map-marked-alt text-4xl text-white"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">4. View Impact</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Browse the public dashboard to see all resolved issues and the positive change in your area.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Home;