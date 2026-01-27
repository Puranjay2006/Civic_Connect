import React, { useState, useMemo } from 'react';
import { signUp } from '../services/authService';
import { User, View } from '../types';
import AuthLayout from './AuthLayout';

interface SignUpProps {
  onSignUp: (user: User) => void;
  navigateTo: (view: View) => void;
}

// Password strength calculation
const getPasswordStrength = (password: string): { level: 'weak' | 'strong' | 'very-strong'; label: string; color: string; tips: string } => {
  const hasLength = password.length >= 8;
  const hasLongLength = password.length >= 12;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>\[\]\\;'`~_+=\-]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  
  const score = [hasLength, hasLetters, hasNumbers, hasSymbols, hasMixedCase, hasLongLength].filter(Boolean).length;
  
  if (password.length === 0) {
    return { level: 'weak', label: '', color: 'bg-slate-200 dark:bg-slate-700', tips: '' };
  }
  
  if (score <= 2 || !hasLength) {
    return { 
      level: 'weak', 
      label: '🔴 Weak', 
      color: 'bg-red-500', 
      tips: 'Make your password stronger by adding symbols or numbers.' 
    };
  }
  
  if (score <= 4) {
    return { 
      level: 'strong', 
      label: '🟡 Strong', 
      color: 'bg-yellow-500', 
      tips: 'Add more variety for extra security.' 
    };
  }
  
  return { 
    level: 'very-strong', 
    label: '🟢 Very Strong', 
    color: 'bg-green-500', 
    tips: 'Great! Your password is very strong.' 
  };
};

const SignUp: React.FC<SignUpProps> = ({ onSignUp, navigateTo }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const newUser = signUp(username, email, password);
      if (newUser) {
        onSignUp(newUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome!">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative flex items-center gap-3" role="alert">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                </div>
                <span className="text-sm">{error}</span>
            </div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-at text-slate-400"></i>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Choose a unique username"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-envelope text-slate-400"></i>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Enter your email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-lock text-slate-400"></i>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Create a strong password"
            />
          </div>
          
          {/* Password Requirements */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Password requirements:</span>
              <span className={`font-medium ${
                password.length >= 8 ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {password.length} / 8+ characters
              </span>
            </div>
            
            {/* Requirement checklist */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full transition-colors ${
                password.length >= 8 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                <i className={`fa-solid ${password.length >= 8 ? 'fa-check' : 'fa-circle'} mr-1 text-[10px]`}></i>
                8+ chars
              </span>
              <span className={`px-2 py-1 rounded-full transition-colors ${
                /[a-zA-Z]/.test(password)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                <i className={`fa-solid ${/[a-zA-Z]/.test(password) ? 'fa-check' : 'fa-circle'} mr-1 text-[10px]`}></i>
                Letters
              </span>
              <span className={`px-2 py-1 rounded-full transition-colors ${
                /[0-9]/.test(password)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                <i className={`fa-solid ${/[0-9]/.test(password) ? 'fa-check' : 'fa-circle'} mr-1 text-[10px]`}></i>
                Numbers
              </span>
              <span className={`px-2 py-1 rounded-full transition-colors ${
                /[!@#$%^&*(),.?":{}|<>\[\]\\;'\`~_+=\-]/.test(password)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                <i className={`fa-solid ${/[!@#$%^&*(),.?":{}|<>\[\]\\;'\`~_+=\-]/.test(password) ? 'fa-check' : 'fa-circle'} mr-1 text-[10px]`}></i>
                Symbols
              </span>
            </div>
            
            {/* Strength meter bar */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                    style={{ 
                      width: passwordStrength.level === 'weak' ? '33%' : 
                             passwordStrength.level === 'strong' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    passwordStrength.level === 'weak' ? 'text-red-500' :
                    passwordStrength.level === 'strong' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                    {passwordStrength.tips}
                  </span>
                </div>
              </div>
            )}
            
            {password.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Your password strength updates as you type.
              </p>
            )}
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <>
                Create Account
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </>
            )}
          </button>
        </div>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Already have an account?</span>
        </div>
      </div>
      <button 
        onClick={() => navigateTo('login')} 
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
      >
        Sign in instead
      </button>
    </AuthLayout>
  );
};

export default SignUp;