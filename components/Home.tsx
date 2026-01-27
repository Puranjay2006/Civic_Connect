import React from 'react';
import { User, View } from '../types';

interface HomeProps {
  navigateTo: (view: View) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const CityIllustration = () => (
    <div className="relative float-animation">
        {/* Glowing backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl transform scale-110"></div>
        <svg className="w-full h-auto relative z-10" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          {/* Buildings with gradient fills */}
          <defs>
            <linearGradient id="building1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="building2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="building3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="building4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x="10" y="50" width="20" height="50" rx="3" fill="url(#building1)" />
          <rect x="35" y="30" width="30" height="70" rx="3" fill="url(#building2)" />
          <rect x="70" y="60" width="15" height="40" rx="3" fill="url(#building3)" />
          <rect x="90" y="20" width="25" height="80" rx="3" fill="url(#building4)" />
          <rect x="120" y="45" width="20" height="55" rx="3" fill="url(#building1)" />
          <rect x="145" y="35" width="45" height="65" rx="3" fill="url(#building2)" />
          {/* Windows with glow effect */}
          <circle cx="20" cy="60" r="2" fill="white" className="animate-pulse" />
          <circle cx="50" cy="45" r="2.5" fill="white" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="100" cy="35" r="3" fill="white" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="130" cy="55" r="2" fill="white" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="167" cy="50" r="2.5" fill="white" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
        </svg>
    </div>
  );

const Home: React.FC<HomeProps> = ({ navigateTo, currentUser, onLogout }) => {
  if (currentUser) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative text-center">
          {/* Glowing background effect */}
          <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
          
          <div className="relative premium-card p-8 md:p-12 rounded-3xl max-w-4xl mx-auto spotlight-card">
            {/* User avatar with glow */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white ring-4 ring-white/30 dark:ring-slate-700/50 text-4xl shadow-xl">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              {currentUser.isNewUser ? 'Welcome' : 'Welcome back'}, <span className="gradient-text-animated">{currentUser.isAdmin ? 'Admin' : currentUser.username}!</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8">
              {currentUser.isAdmin
                ? "Oversee community reports, update their progress, and ensure civic harmony from the admin dashboard."
                : "Ready to make a difference? Report a new issue or check the status of existing ones."
              }
            </p>
            {currentUser.isAdmin ? (
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4 stagger-fade-in">
                <button
                  onClick={() => navigateTo('admin')}
                  className="group w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                >
                  <i className="fa-solid fa-clipboard-list group-hover:rotate-[-6deg] transition-transform"></i>
                  Go to Admin Dashboard
                </button>
                 <button
                  onClick={() => navigateTo('reports')}
                  className="group w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-purple-600 hover:to-violet-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                >
                  <i className="fa-solid fa-chart-pie group-hover:rotate-6 transition-transform"></i>
                  View Performance Analytics
                </button>
                {!currentUser.department && (
                   <button
                      onClick={() => navigateTo('admin-department-select')}
                      className="group w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                    >
                      <i className="fa-solid fa-building-user group-hover:scale-110 transition-transform"></i>
                      Choose Department
                    </button>
                )}
                 {currentUser.department && (
                  <button
                    onClick={() => {
                      onLogout();
                      navigateTo('department-login');
                    }}
                    className="group w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                  >
                    <i className="fa-solid fa-right-left group-hover:rotate-12 transition-transform"></i>
                    Change Department
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center items-center gap-4 stagger-fade-in">
                <button
                  onClick={() => navigateTo('report')}
                  className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                >
                  <i className="fa-solid fa-bullhorn group-hover:animate-pulse"></i>
                  Report an Issue
                </button>
                 <button
                  onClick={() => navigateTo('my-reports')}
                  className="group w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                >
                  <i className="fa-solid fa-file-lines group-hover:translate-x-1 transition-transform"></i>
                  My Reports
                </button>
                <button
                  onClick={() => navigateTo('track')}
                  className="group w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-purple-600 hover:to-violet-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
                >
                <i className="fa-solid fa-magnifying-glass-chart group-hover:scale-110 transition-transform"></i>
                Track Issue
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="group w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 text-lg flex items-center justify-center gap-3 btn-hover-lift ripple"
              >
                <i className="fa-solid fa-chart-line group-hover:-translate-y-1 transition-transform"></i>
                View Dashboard
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center py-16 md:py-24 px-4">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                <div className="text-center md:text-left z-10">
                    <div className="premium-card p-8 md:p-10 rounded-3xl spotlight-card">
                        {/* Badge with pulse */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                          </span>
                          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">AI-Powered Civic Platform</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6">
                          <span className="text-slate-900 dark:text-white">Transform Your</span>
                          <br />
                          <span className="gradient-text-animated">Community</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                          Report local issues in seconds, track their progress in real-time, and witness meaningful change powered by AI automation.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center sm:items-start gap-4">
                            {/* User Login Button */}
                             <div className="relative group/tooltip w-full sm:w-auto">
                                <button
                                    onClick={() => navigateTo('login')}
                                    className="group/button btn-hover-lift ripple w-full sm:w-auto bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 text-base flex items-center justify-center gap-3"
                                    >
                                    <i className="fa-solid fa-rocket group-hover/button:translate-x-1 group-hover/button:-translate-y-0.5 transition-transform duration-200"></i>
                                    Get Started
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900 text-white text-sm rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transform scale-95 group-hover/tooltip:scale-100 translate-y-1 group-hover/tooltip:translate-y-0 transition-all duration-300 ease-in-out invisible group-hover/tooltip:visible pointer-events-none z-50">
                                    Access your dashboard, report new issues, and track their progress.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-900"></div>
                                </div>
                            </div>

                            {/* Admin Login Button */}
                            <div className="relative group/tooltip w-full sm:w-auto">
                                <button
                                onClick={() => navigateTo('admin-role-select')}
                                className="group/button btn-hover-lift w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 shadow-lg text-base flex items-center justify-center gap-3"
                                >
                                <i className="fa-solid fa-shield-halved group-hover/button:scale-110 transition-transform duration-200 text-purple-500"></i>
                                Admin Portal
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900 text-white text-sm rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transform scale-95 group-hover/tooltip:scale-100 translate-y-1 group-hover/tooltip:translate-y-0 transition-all duration-300 ease-in-out invisible group-hover/tooltip:visible pointer-events-none z-50">
                                Access departmental dashboards, advanced analytics, and administrative tools.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block z-0">
                    <div className="relative">
                      {/* Decorative elements */}
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
                      <CityIllustration />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 md:py-28 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">HOW IT WORKS</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Four Simple Steps</h2>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                        A transparent process designed to turn community concerns into visible improvements.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    <div className="group card-fade-in-up premium-card text-center p-8 rounded-3xl transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl">
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <i className="fa-solid fa-camera-retro text-3xl text-white"></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-blue-600">1</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Report</h3>
                        <p className="text-slate-600 dark:text-slate-400">Snap a photo, add details, and submit your report in under a minute.</p>
                    </div>

                    <div className="group card-fade-in-up premium-card text-center p-8 rounded-3xl transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl" style={{ animationDelay: '0.15s' }}>
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-xl shadow-purple-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl text-white"></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-purple-600">2</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">AI Assignment</h3>
                        <p className="text-slate-600 dark:text-slate-400">Our AI automatically routes your issue to the right department.</p>
                    </div>
                    
                    <div className="group card-fade-in-up premium-card text-center p-8 rounded-3xl transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl" style={{ animationDelay: '0.3s' }}>
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <i className="fa-solid fa-chart-line text-3xl text-white"></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-orange-600">3</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Track Progress</h3>
                        <p className="text-slate-600 dark:text-slate-400">Monitor real-time status updates with our intelligent tracking system.</p>
                    </div>

                    <div className="group card-fade-in-up premium-card text-center p-8 rounded-3xl transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl" style={{ animationDelay: '0.45s' }}>
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6 shadow-xl shadow-green-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                            <i className="fa-solid fa-check-double text-3xl text-white"></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-green-600">4</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">See Impact</h3>
                        <p className="text-slate-600 dark:text-slate-400">View resolved issues and celebrate community improvements together.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Home;