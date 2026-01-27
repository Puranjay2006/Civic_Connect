import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  MapPin,
  Users,
  CheckCircle,
  Shield,
  Zap,
  BarChart3,
  Star,
  Trophy,
  FileText,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { User, CivicIssue, Status } from '../../types';
import { APP_INFO, DEPARTMENT_CONFIG } from '../../constants';
import { getIssues } from '../../services/issueService';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface HomeProps {
  currentUser: User | null;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const [userStats, setUserStats] = useState({ reports: 0, pending: 0, resolved: 0, points: 0 });
  
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      const issues = getIssues();
      const userIssues = issues.filter(i => i.userId === currentUser.id);
      setUserStats({
        reports: userIssues.length,
        pending: userIssues.filter(i => i.status === Status.Pending).length,
        resolved: userIssues.filter(i => i.status === Status.Resolved).length,
        points: userIssues.length * 10 + userIssues.filter(i => i.status === Status.Resolved).length * 5,
      });
    }
  }, [currentUser]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Logged in user view
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Welcome Card */}
            <Card className="overflow-visible relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-accent-500/10 rounded-2xl"></div>
              
              <CardContent className="relative py-12 px-8 text-center">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-primary-500/30"
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-3"
                >
                  Welcome back, {' '}
                  <span className="gradient-text">
                    {currentUser.isAdmin ? 'Admin' : currentUser.username}!
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto"
                >
                  {currentUser.isAdmin
                    ? "Oversee community reports, update their progress, and ensure civic harmony from the admin dashboard."
                    : "Ready to make a difference? Report a new issue or check the status of existing ones."}
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  {currentUser.isAdmin ? (
                    <>
                      <Link to="/admin">
                        <Button variant="primary" size="lg" leftIcon={<Shield className="w-5 h-5" />}>
                          Admin Dashboard
                        </Button>
                      </Link>
                      <Link to="/dashboard">
                        <Button variant="secondary" size="lg" leftIcon={<BarChart3 className="w-5 h-5" />}>
                          View Analytics
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/report">
                        <Button variant="primary" size="lg" leftIcon={<Camera className="w-5 h-5" />}>
                          Report Issue
                        </Button>
                      </Link>
                      <Link to="/my-reports">
                        <Button variant="secondary" size="lg" leftIcon={<FileText className="w-5 h-5" />}>
                          My Reports
                        </Button>
                      </Link>
                      <Link to="/track">
                        <Button variant="accent" size="lg" leftIcon={<MapPin className="w-5 h-5" />}>
                          Track Issue
                        </Button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </CardContent>
            </Card>

            {/* Quick Stats - Real data from user's reports */}
            {!currentUser.isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8"
              >
                {[
                  { icon: FileText, label: 'Reports', value: userStats.reports.toString(), color: 'primary' },
                  { icon: Clock, label: 'Pending', value: userStats.pending.toString(), color: 'amber' },
                  { icon: CheckCircle, label: 'Resolved', value: userStats.resolved.toString(), color: 'green' },
                  { icon: Star, label: 'Points', value: userStats.points.toString(), color: 'purple' },
                ].map((stat, index) => (
                  <Card key={index} className="p-3 sm:p-4 text-center" hover>
                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-${stat.color}-500`} />
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </Card>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Public landing page
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center py-12 sm:py-20">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 text-sm font-medium mb-4 sm:mb-6"
              >
                <Zap className="w-4 h-4" />
                Empowering Citizens, One Report at a Time
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-white leading-tight mb-4 sm:mb-6"
              >
                Building{' '}
                <span className="gradient-text">Better</span>
                <br />
                Communities
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {APP_INFO.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" leftIcon={<BarChart3 className="w-5 h-5" />}>
                    View Dashboard
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators - For new app launch */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-12 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Launching Soon in Your City
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Secure & Private
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right content - Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-card p-6 relative z-10 floating">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">Pothole Reported</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Main Street, Block 12</p>
                    </div>
                    <span className="ml-auto badge-warning">In Progress</span>
                  </div>
                  <div className="h-40 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-slate-400" />
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-8 -right-8 glass-card p-4 z-20"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Issue Resolved!</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-8 glass-card p-4 z-20"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">AI-Powered Tracking</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A simple, transparent process for community improvement in four easy steps.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Camera,
                title: 'Report',
                description: 'Snap a photo, add details, and submit your report in minutes.',
                color: 'primary',
                step: 1,
              },
              {
                icon: MapPin,
                title: 'Track',
                description: 'Get a unique ID and use our AI assistant to check status anytime.',
                color: 'secondary',
                step: 2,
              },
              {
                icon: Users,
                title: 'Resolve',
                description: 'City officials work on solutions and update status until fixed.',
                color: 'accent',
                step: 3,
              },
              {
                icon: Star,
                title: 'Rate',
                description: 'Provide feedback, earn points, and climb the leaderboard.',
                color: 'amber',
                step: 4,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full text-center p-4 sm:p-6">
                  <div className="relative inline-flex mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/40 flex items-center justify-center`}>
                      <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${item.color}-500`} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Instead of fake stats */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Why Choose <span className="gradient-text">Civic Connect?</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A platform designed for transparency, accountability, and community empowerment.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Camera, title: 'Easy Reporting', description: 'Snap a photo and submit in under a minute', color: 'primary' },
              { icon: MapPin, title: 'Real-Time Tracking', description: 'Get updates as your issue progresses', color: 'secondary' },
              { icon: Zap, title: 'AI Assistant', description: 'Casey helps answer your questions 24/7', color: 'accent' },
              { icon: Shield, title: 'Secure & Private', description: 'Your data is protected and confidential', color: 'amber' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/40 mb-4`}>
                    <feature.icon className={`w-7 h-7 sm:w-8 sm:h-8 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-[length:200%_100%] animate-gradient p-8 sm:p-12 md:p-16 text-center"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4 sm:mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Be part of the change. Report issues and help improve your community today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary-600 hover:bg-slate-100 shadow-xl"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/admin-login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-white/80 text-white hover:bg-white/10"
                    leftIcon={<Shield className="w-5 h-5" />}
                  >
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
