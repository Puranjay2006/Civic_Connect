// FIX: Import 'useEffect' from 'react' to resolve the 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { User, Department } from '../types';
import { generateDepartmentReport, generateAdminReport, DepartmentReport, AdminReportData } from '../services/reportService';
import BarChart from './BarChart';
import DepartmentReportView from './DepartmentReportView';

const msToDays = (ms: number): number => (ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0);
const msToMinutes = (ms: number): number => (ms > 0 ? ms / (1000 * 60) : 0);

const AdminReportView: React.FC<{ reports: AdminReportData[] }> = ({ reports }) => {
  const [activeTab, setActiveTab] = useState('time');

  const chartData = useMemo(() => {
    switch(activeTab) {
        case 'time':
            return {
                title: 'Average Resolution Time (Minutes)',
                subtitle: '(Demo only — real data shown in days)',
                data: reports.map(r => ({ label: r.department, value: msToMinutes(r.avgResolutionTimeMs), color: 'bg-orange-500' }))
            };
        case 'resolved':
            return {
                title: 'Total Resolved Issues',
                data: reports.map(r => ({ label: r.department, value: r.resolvedRequests, color: 'bg-green-500' }))
            };
        case 'satisfaction':
            return {
                title: 'Average Citizen Satisfaction',
                unit: '/ 5',
                maxValueOverride: 5,
                data: reports.map(r => ({ label: r.department, value: r.avgSatisfaction, color: 'bg-teal-500' }))
            };
        default:
            return { title: '', subtitle: '', data: [] };
    }
  }, [activeTab, reports]);

  const TabButton: React.FC<{tabKey: string, children: React.ReactNode}> = ({ tabKey, children }) => (
    <button onClick={() => setActiveTab(tabKey)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabKey ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
        {children}
    </button>
  );

  return (
    <div className="space-y-10">
       <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">All Departments Overview</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Comparative performance analysis across all departments.</p>
      </div>
      
      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-200 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3">Department</th>
                    <th scope="col" className="px-6 py-3 text-center">Total</th>
                    <th scope="col" className="px-6 py-3 text-center">Resolved</th>
                    <th scope="col" className="px-6 py-3 text-center">Pending</th>
                    <th scope="col" className="px-6 py-3 text-center">Overdue</th>
                    <th scope="col" className="px-6 py-3 text-center">Avg Res. Time (Minutes)</th>
                    <th scope="col" className="px-6 py-3 text-center">SLA %</th>
                    <th scope="col" className="px-6 py-3 text-center">Satisfaction</th>
                </tr>
            </thead>
            <tbody>
                {reports.map(r => (
                    <tr key={r.department} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <th scope="row" className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{r.department}</th>
                        <td className="px-6 py-4 text-center">{r.totalRequests}</td>
                        <td className="px-6 py-4 text-center">{r.resolvedRequests}</td>
                        <td className="px-6 py-4 text-center">{r.pendingRequests + r.inProgressRequests}</td>
                        <td className="px-6 py-4 text-center">{r.overdueRequests}</td>
                        <td className="px-6 py-4 text-center">{msToMinutes(r.avgResolutionTimeMs).toFixed(1)}</td>
                        <td className="px-6 py-4 text-center">{r.slaComplianceRate.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-center">{r.avgSatisfaction.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {/* Charts */}
      <div>
        <div className="flex justify-center items-center gap-4 mb-6">
            <TabButton tabKey="time">Resolution Time</TabButton>
            <TabButton tabKey="resolved">Issues Resolved</TabButton>
            <TabButton tabKey="satisfaction">Satisfaction</TabButton>
        </div>
        <BarChart 
            title={chartData.title}
            subtitle={chartData.subtitle}
            data={chartData.data}
            unit={chartData.unit}
            maxValueOverride={chartData.maxValueOverride}
        />
      </div>
    </div>
  );
};

interface ReportsProps {
  currentUser: User;
  selectedDepartment: Department | null;
}

const Reports: React.FC<ReportsProps> = ({ currentUser, selectedDepartment }) => {
  const [reportData, setReportData] = useState<DepartmentReport | AdminReportData[] | null>(null);

  const departmentToShow = currentUser.department || selectedDepartment;

  useEffect(() => {
    if (currentUser.isAdmin) {
      if (departmentToShow) {
        setReportData(generateDepartmentReport(departmentToShow));
      } else {
        setReportData(generateAdminReport());
      }
    }
  }, [currentUser, departmentToShow]);

  if (!reportData) {
    return (
      <div className="text-center py-20">
        <i className="fa-solid fa-spinner animate-spin text-5xl text-blue-500"></i>
        <p className="mt-4 text-lg">Generating Reports...</p>
      </div>
    );
  }

  if (departmentToShow) {
    return <DepartmentReportView report={reportData as DepartmentReport} departmentName={departmentToShow} />;
  }

  return <AdminReportView reports={reportData as AdminReportData[]} />;
};

export default Reports;