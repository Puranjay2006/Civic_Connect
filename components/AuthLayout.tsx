import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500/20 via-pink-500/15 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-pink-400/40 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.6s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-400/40 rounded-full animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.9s' }}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          {/* Logo with glow effect */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-3 rounded-2xl shadow-2xl shadow-blue-500/40 transform hover:scale-105 hover:rotate-3 transition-all duration-300">
              <i className="fa-solid fa-city text-white text-3xl"></i>
            </div>
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <span className="inline-block w-8 h-px bg-slate-300 dark:bg-slate-600"></span>
            Civic Connect
            <span className="inline-block w-8 h-px bg-slate-300 dark:bg-slate-600"></span>
          </p>
        </div>
        <div className="premium-card p-8 rounded-3xl space-y-6 form-fade-in spotlight-card">
            {children}
        </div>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-shield-check text-green-500"></i>
            Secure
          </span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-lock text-blue-500"></i>
            Encrypted
          </span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-user-shield text-purple-500"></i>
            Private
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
