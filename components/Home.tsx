import React from 'react';
import { User, View } from '../types';

interface HomeProps {
  navigateTo: (view: View) => void;
  currentUser: User | null;
}

const CityIllustration = () => (
    <svg className="w-full h-auto text-slate-300 dark:text-slate-600" viewBox="0 0 200 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="50" width="20" height="50" rx="2"/>
      <rect x="35" y="30" width="30" height="70" rx="2"/>
      <rect x="70" y="60" width="15" height="40" rx="2"/>
      <rect x="90" y="20" width="25" height="80" rx="2"/>
      <rect x="120" y="45" width="20" height="55" rx="2"/>
      <rect x="145" y="35" width="45" height="65" rx="2"/>
      <circle cx="40" cy="45" r="2" className="text-white dark:text-slate-400"/>
      <circle cx="100" cy="35" r="3" className="text-white dark:text-slate-400"/>
      <circle cx="160" cy="55" r="2.5" className="text-white dark:text-slate-400"/>
    </svg>
  );


const Home: React.FC<HomeProps> = ({ navigateTo, currentUser }) => {
  if (currentUser) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 ring-4 ring-offset-4 ring-offset-slate-100 dark:ring-offset-slate-900 ring-blue-200 dark:ring-blue-800 text-3xl">
          {currentUser.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          Welcome back, {currentUser.isAdmin ? 'Admin' : currentUser.username}!
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8">
          {currentUser.isAdmin
            ? "Manage community reports and update their progress from the admin panel."
            : "Ready to make a difference? Report a new issue or check the status of existing ones on the community dashboard."
          }
        </p>
        {currentUser.isAdmin ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigateTo('admin')}
              className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-clipboard-list"></i>
              Go to Admin Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <>
              <button
                onClick={() => navigateTo('report')}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-bullhorn"></i>
                Report an Issue
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full sm:w-auto bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-transform hover:scale-105 text-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-chart-line"></i>
                View Dashboard
              </button>
            </>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-16 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              Civic Connect
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              The direct line to a better community. Report local issues, track their progress, and see real change happen.
            </p>
            <div className="flex flex-col sm:flex-row md:justify-start justify-center items-center gap-4">
              <button
                onClick={() => navigateTo('login')}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-user"></i>
                User Login / Sign Up
              </button>
              <button
                onClick={() => navigateTo('admin-login')}
                className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-800 transition-transform hover:scale-105 text-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-user-shield"></i>
                Admin Login
              </button>
            </div>
        </div>
        <div className="hidden md:block">
            <CityIllustration />
        </div>
      </div>
    </div>
  );
};

export default Home;