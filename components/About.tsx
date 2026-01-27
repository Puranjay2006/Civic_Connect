import React, { useEffect } from 'react';
import { View } from '../types';

interface AboutProps {
  navigateTo: (view: View) => void;
}

const About: React.FC<AboutProps> = ({ navigateTo }) => {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-amber-500/8 to-orange-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="space-y-24 pb-20">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center text-center px-4">
          <div className="max-w-5xl mx-auto">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Civic Connect — Empowering India's Future</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
              <span className="text-slate-900 dark:text-white">Your Voice.</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
                Your City.
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">Your Power.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
              One platform to report civic issues, track resolutions, and transform your community. 
              <span className="text-slate-900 dark:text-white font-medium"> No more waiting. No more silence.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('signup')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <i className="fa-solid fa-rocket"></i>
                  Get Started Free
                </span>
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-800 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-play"></i>
                See Live Demo Walkthrough
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-6 animate-bounce hidden md:flex justify-center">
              <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-slate-600 flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-slate-400 dark:bg-slate-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Stats Section */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Description */}
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 mb-6">
                  The Reality
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                  India's Civic Infrastructure Crisis
                </h2>
                
                <div className="space-y-5 text-slate-600 dark:text-slate-300">
                  <p className="text-lg leading-relaxed">
                    Every day, millions of Indians face civic challenges that impact their daily lives—from 
                    <span className="text-amber-500 font-semibold"> pothole-ridden roads</span> causing accidents and vehicle damage, to 
                    <span className="text-blue-500 font-semibold"> contaminated water supply</span> affecting health and hygiene.
                  </p>
                  <p className="text-lg leading-relaxed">
                    <span className="text-red-500 font-semibold">Overflowing garbage</span> piles up in streets, breeding mosquitoes and diseases. 
                    <span className="text-purple-500 font-semibold"> Broken streetlights</span> leave neighborhoods in darkness, compromising safety.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The traditional complaint system is plagued with inefficiencies: 
                    <span className="font-medium text-slate-800 dark:text-slate-200">long queues at municipal offices, lost paperwork, 
                    lack of transparency</span>, and no way to track if issues are actually being resolved.
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white border-l-4 border-red-500 pl-4 mt-6">
                    Citizens feel unheard. Governments lack actionable data. Communities suffer in silence.
                  </p>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '1.68L', label: 'Annual Road Accident Deaths', gradient: 'from-red-500 to-rose-500', icon: 'fa-car-crash', source: '1' },
                  { value: '36%', label: 'Urban Population Share', gradient: 'from-amber-500 to-orange-500', icon: 'fa-city', source: '2' },
                  { value: '1.70L+', label: 'Tonnes Daily Waste Generated', gradient: 'from-purple-500 to-indigo-500', icon: 'fa-trash', source: '3' },
                  { value: '~2M+', label: 'Annual Grievances via CPGRAMS', gradient: 'from-blue-500 to-cyan-500', icon: 'fa-comments', source: '4' },
                ].map((stat, i) => (
                  <div key={i} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500`}></div>
                    <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 text-center hover:border-transparent transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                        <i className={`fa-solid ${stat.icon} text-white text-lg`}></i>
                      </div>
                      <div className={`text-3xl md:text-4xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                        {stat.value}<a href={`#source-${stat.source}`} className="text-xs text-slate-400 ml-0.5 hover:text-blue-500 transition-colors cursor-pointer"><sup>[{stat.source}]</sup></a>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Issues Cards */}
            <div className="mt-12 grid md:grid-cols-4 gap-4">
              {[
                { icon: 'fa-road-barrier', title: 'Potholes', desc: 'Damaged roads causing accidents daily', bgClass: 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-500' },
                { icon: 'fa-trash-can', title: 'Garbage', desc: 'Overflowing waste breeding diseases', bgClass: 'bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20', iconBg: 'bg-red-500/20', iconColor: 'text-red-500' },
                { icon: 'fa-lightbulb', title: 'Streetlights', desc: 'Broken lights compromising safety', bgClass: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-500' },
                { icon: 'fa-droplet', title: 'Water Supply', desc: 'Contaminated or irregular supply', bgClass: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-500' },
              ].map((issue, i) => (
                <div key={i} className={`${issue.bgClass} border rounded-2xl p-5 text-center hover:scale-105 transition-all duration-300`}>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${issue.iconBg} flex items-center justify-center`}>
                    <i className={`fa-solid ${issue.icon} ${issue.iconColor} text-xl`}></i>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{issue.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{issue.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-4">
                The Solution
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Civic Connect: Your Voice, Amplified
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                A digital platform that empowers citizens to report civic issues instantly, 
                track their resolution in real-time, and hold local authorities accountable.
              </p>
            </div>

            {/* Solution Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <i className="fa-solid fa-mobile-screen-button text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Easy Reporting</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Report issues in seconds with photos, location, and AI-powered categorization. 
                  No more standing in queues or filling endless forms.
                </p>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <i className="fa-solid fa-route text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-Time Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Track every step of your complaint's journey—from submission to resolution. 
                  Get notified instantly when status changes.
                </p>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <i className="fa-solid fa-chart-line text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Data-Driven Action</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Interactive maps and analytics help authorities prioritize issues 
                  and allocate resources where they're needed most.
                </p>
              </div>
            </div>

            {/* How It Works Steps */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Simple. Transparent. Effective.
              </h3>
            </div>

            {/* Timeline Steps */}
            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-amber-500 to-green-500 transform -translate-y-1/2 rounded-full"></div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Report', desc: 'Snap a photo, pin the location, describe the issue. Our AI automatically categorizes it.', icon: 'fa-camera', color: 'blue' },
                  { step: '02', title: 'Route', desc: 'Your report is instantly routed to the right department. No bureaucratic delays.', icon: 'fa-route', color: 'purple' },
                  { step: '03', title: 'Track', desc: 'Monitor progress in real-time. Get updates on your phone as work proceeds.', icon: 'fa-location-crosshairs', color: 'amber' },
                  { step: '04', title: 'Resolve', desc: 'Issue fixed! Rate the service and provide feedback to improve civic operations.', icon: 'fa-circle-check', color: 'green' },
                ].map((item, i) => (
                  <div key={i} className="relative group">
                    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-xl`}>
                      {/* Step Number */}
                      <div className={`absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r ${
                        item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        item.color === 'amber' ? 'from-amber-500 to-amber-600' :
                        'from-green-500 to-green-600'
                      } text-white text-xs font-black rounded-full shadow-lg`}>
                        {item.step}
                      </div>
                      
                      <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${
                        item.color === 'blue' ? 'bg-blue-500/20' :
                        item.color === 'purple' ? 'bg-purple-500/20' :
                        item.color === 'amber' ? 'bg-amber-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <i className={`fa-solid ${item.icon} text-xl ${
                          item.color === 'blue' ? 'text-blue-500' :
                          item.color === 'purple' ? 'text-purple-500' :
                          item.color === 'amber' ? 'text-amber-500' :
                          'text-green-500'
                        }`}></i>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-4">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Built for Modern India
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powered by cutting-edge AI and designed for every Indian citizen
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Large Feature - AI */}
              <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 mb-6 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-2xl"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">AI-Powered Intelligence</h3>
                  <p className="text-white/80 text-lg max-w-lg leading-relaxed">
                    Gemini AI automatically categorizes your report, suggests the right department, 
                    and generates summaries for administrators. Smart civic governance starts here.
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 text-white/20 text-8xl font-black">AI</div>
              </div>

              {/* Small Feature - Maps */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:scale-105 transition-all duration-500">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-map-location-dot text-white text-lg"></i>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Live Issue Maps</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  See all issues on an interactive map with real-time updates and location tracking.
                </p>
              </div>

              {/* Small Feature - Notifications */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:scale-105 transition-all duration-500">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-bell text-white text-lg"></i>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Instant Notifications</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Get notified the moment your issue status changes. Always stay informed.
                </p>
              </div>

              {/* Small Feature - Rewards */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:scale-105 transition-all duration-500">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-trophy text-white text-lg"></i>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Citizen Rewards</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Earn points for active participation. Top contributors get recognized.
                </p>
              </div>

              {/* Wide Feature - Analytics */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl">
                    <i className="fa-solid fa-chart-line text-white text-3xl"></i>
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h4>
                    <p className="text-slate-400 max-w-md">
                      Comprehensive insights for administrators. Track resolution rates, identify hotspots, 
                      and make data-driven decisions for better governance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-16">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/20 border border-blue-500/30 mb-6">
                    Our Vision
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Building the
                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      India of Tomorrow
                    </span>
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed mb-6">
                    We envision an India where every citizen has a voice, every complaint is heard, 
                    and every community thrives. Technology should bridge the gap between people and governance.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Aligned with <span className="text-blue-400 font-semibold">Smart Cities Mission</span> and 
                    <span className="text-green-400 font-semibold"> Swachh Bharat Abhiyan</span>, we're creating 
                    cleaner, more responsive urban governance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: 'fa-city', label: 'Smart Cities', color: 'text-blue-400' },
                    { icon: 'fa-users', label: 'Engaged Citizens', color: 'text-purple-400' },
                    { icon: 'fa-handshake', label: 'Accountable Govt', color: 'text-green-400' },
                    { icon: 'fa-leaf', label: 'Cleaner India', color: 'text-emerald-400' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:scale-105 transition-all duration-300">
                      <i className={`fa-solid ${item.icon} text-4xl ${item.color} mb-3`}></i>
                      <p className="text-white font-semibold">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] p-12 md:p-16 overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                    Ready to Make a<br />Difference?
                  </h2>
                  <p className="text-xl text-white/80 max-w-xl mx-auto mb-10">
                    Join thousands of citizens already building better communities. 
                    Your voice matters.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigateTo('signup')}
                      className="group px-10 py-5 bg-white text-purple-600 font-bold text-lg rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-rocket group-hover:animate-bounce"></i>
                      Start Reporting Now
                    </button>
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="px-10 py-5 bg-white/10 backdrop-blur text-white font-bold text-lg rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-compass"></i>
                      Explore Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="fade-up px-4 opacity-0 translate-y-10 transition-all duration-700">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-book-open text-blue-500"></i>
                Data Sources & References
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div id="source-1" className="flex gap-2 scroll-mt-24">
                    <span className="font-bold text-blue-500">[1]</span>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">Ministry of Road Transport & Highways (MoRTH)</p>
                      <a href="https://morth.nic.in/road-accident-in-india" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Road Accidents in India 2022 (Published 2023)</a>
                    </div>
                  </div>
                  <div id="source-2" className="flex gap-2 scroll-mt-24">
                    <span className="font-bold text-blue-500">[2]</span>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">World Bank Data</p>
                      <a href="https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS?locations=IN" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Urban Population (% of total) - India 2024</a>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div id="source-3" className="flex gap-2 scroll-mt-24">
                    <span className="font-bold text-blue-500">[3]</span>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">Central Pollution Control Board (CPCB)</p>
                      <a href="https://cpcb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Annual Report on MSW Management 2021-22</a>
                    </div>
                  </div>
                  <div id="source-4" className="flex gap-2 scroll-mt-24">
                    <span className="font-bold text-blue-500">[4]</span>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">CPGRAMS Portal - DARPG, Govt. of India</p>
                      <a href="https://pgportal.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Public Grievance Redress Portal (Annual Report 2023)</a>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Statistics are based on latest available government data. For most recent figures, please refer to the official sources linked above.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center pt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-city text-white"></i>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Civic Connect</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Built with <span className="text-red-500">❤️</span> for India
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            Youth Solves for India 2026
          </p>
        </section>
      </div>

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .fade-up.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default About;
