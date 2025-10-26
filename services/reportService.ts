import { CivicIssue, Department, Status, Category, User, LeaderboardUser } from '../types';
import { getIssues } from './issueService';
import { DEPARTMENTS, ISSUE_CATEGORIES } from '../constants';

const SLA_TARGET_HOURS = 3; // For demo purposes
const OVERDUE_TARGET_HOURS = 3; // For demo purposes

const SLA_TARGET_MS = SLA_TARGET_HOURS * 60 * 60 * 1000;
const OVERDUE_TARGET_MS = OVERDUE_TARGET_HOURS * 60 * 60 * 1000;

const msToDays = (ms: number): number => (ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0);

interface TimeTrend {
    period: string;
    avgResolutionTimeDays: number;
}

export interface DepartmentReport {
    totalRequests: number;
    resolvedRequests: number;
    pendingRequests: number;
    inProgressRequests: number;
    overdueRequests: number;
    avgResolutionTimeMs: number;
    slaComplianceRate: number; // Percentage
    avgSatisfaction: number; // 1-5
    categoryDistribution: { [key in Category]?: number };
    weeklyTrends: TimeTrend[];
}

export interface AdminReportData extends DepartmentReport {
    department: Department;
}

const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('civic-users');
  return usersJson ? JSON.parse(usersJson) : [];
};

export const getLeaderboardData = (): LeaderboardUser[] => {
    const allIssues = getIssues();
    const allUsers = getUsers().filter(u => !u.isAdmin);

    const userScores = allUsers.map(user => {
        const userIssues = allIssues.filter(issue => issue.userId === user.id);
        const reportsSubmitted = userIssues.length;
        const ratingsGiven = userIssues.filter(issue => issue.rating !== null).length;
        const feedbacksProvided = userIssues.filter(issue => issue.feedback).length;

        const score = (reportsSubmitted * 10) + (ratingsGiven * 5) + (feedbacksProvided * 3);

        return {
            userId: user.id,
            username: user.username,
            score,
            reportsSubmitted,
            ratingsGiven,
            feedbacksProvided,
        };
    });

    return userScores.sort((a, b) => b.score - a.score);
};


export const generateDepartmentReport = (department: Department): DepartmentReport => {
    const allIssues = getIssues();
    const deptIssues = allIssues.filter(i => i.department === department);
    
    const resolvedIssues = deptIssues.filter(i => i.status === Status.Resolved && i.resolvedAt);
    
    const totalRequests = deptIssues.length;
    const resolvedRequests = resolvedIssues.length;
    const pendingRequests = deptIssues.filter(i => i.status === Status.Pending).length;
    const inProgressRequests = deptIssues.filter(i => i.status === Status.InProgress).length;

    const overdueRequests = deptIssues.filter(i => 
        (i.status === Status.Pending || i.status === Status.InProgress) && 
        (Date.now() - i.createdAt > OVERDUE_TARGET_MS)
    ).length;

    const totalResolutionTime = resolvedIssues.reduce((acc, issue) => {
        return acc + (issue.resolvedAt! - issue.createdAt);
    }, 0);
    const avgResolutionTimeMs = resolvedRequests > 0 ? totalResolutionTime / resolvedRequests : 0;

    const slaCompliantCount = resolvedIssues.filter(i => (i.resolvedAt! - i.createdAt) <= SLA_TARGET_MS).length;
    const slaComplianceRate = resolvedRequests > 0 ? (slaCompliantCount / resolvedRequests) * 100 : 100;

    const ratedIssues = deptIssues.filter(i => i.rating !== null && i.rating > 0);
    const totalRating = ratedIssues.reduce((acc, issue) => acc + issue.rating!, 0);
    const avgSatisfaction = ratedIssues.length > 0 ? totalRating / ratedIssues.length : 0;

    // New: Category Distribution
    const categoryDistribution = deptIssues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
    }, {} as { [key in Category]?: number });


    // New: Weekly Trends (last 8 weeks)
    const weeklyTrends: TimeTrend[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) + (6 - now.getDay()));
        weekEnd.setHours(23, 59, 59, 999);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const issuesInWeek = resolvedIssues.filter(issue => 
            issue.resolvedAt! >= weekStart.getTime() && issue.resolvedAt! <= weekEnd.getTime()
        );

        if (issuesInWeek.length > 0) {
            const weeklyTotalTime = issuesInWeek.reduce((acc, issue) => acc + (issue.resolvedAt! - issue.createdAt), 0);
            weeklyTrends.push({
                period: `W${i}`,
                avgResolutionTimeDays: msToDays(weeklyTotalTime / issuesInWeek.length)
            });
        } else {
             weeklyTrends.push({ period: `W${i}`, avgResolutionTimeDays: 0 });
        }
    }


    return {
        totalRequests,
        resolvedRequests,
        pendingRequests,
        inProgressRequests,
        overdueRequests,
        avgResolutionTimeMs,
        slaComplianceRate,
        avgSatisfaction,
        categoryDistribution,
        weeklyTrends,
    };
};

export const generateAdminReport = (): AdminReportData[] => {
    return DEPARTMENTS.map(dept => {
        const report = generateDepartmentReport(dept);
        return {
            department: dept,
            ...report
        };
    });
};