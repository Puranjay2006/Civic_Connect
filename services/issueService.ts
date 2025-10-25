import { CivicIssue, Status, User, NotificationType, Department } from '../types';
import { addNotification, findAdminByDepartment } from './authService';

const ISSUES_KEY = 'civic-issues';

// Helper to get issues from localStorage, also exported for use in components
export const getIssues = (): CivicIssue[] => {
  const issuesJson = localStorage.getItem(ISSUES_KEY);
  return issuesJson ? JSON.parse(issuesJson) : [];
};

// Helper to save issues to localStorage
const saveIssues = (issues: CivicIssue[]) => {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
};

// Get a single issue by its ID
export const getIssueById = (id: string): CivicIssue | undefined => {
  const issues = getIssues();
  return issues.find(issue => issue.id === id);
};

// Add a new issue
export const addIssue = (issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'status' | 'userId' | 'userEmail' | 'username' | 'acknowledgedAt' | 'resolvedAt' | 'rating'>, user: User): { newIssue: CivicIssue, updatedUser: User | null } => {
  const issues = getIssues();
  const newIssue: CivicIssue = {
    ...issueData,
    id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    acknowledgedAt: null,
    resolvedAt: null,
    status: Status.Pending,
    userId: user.id,
    userEmail: user.email,
    username: user.username,
    rating: null,
  };
  
  const updatedIssues = [...issues, newIssue];
  saveIssues(updatedIssues);
  
  // Notify the user who created the issue
  const updatedUser = addNotification(user.id, `Your issue report "${newIssue.title}" has been successfully submitted.`, NotificationType.General);
  
  // Notify the department admin via a simulated email
  const admin = findAdminByDepartment(newIssue.department);
  if (admin) {
      const emailContent = {
        subject: `New Issue Reported for ${newIssue.department}: #${newIssue.id.slice(-6)}`,
        body: `A new civic issue has been assigned to your department.\n\nIssue Title: ${newIssue.title}\nReported by: ${newIssue.username} (${newIssue.userEmail})\nCategory: ${newIssue.category}\n\nPlease review and update the status in the admin dashboard.`
      };
      addNotification(admin.id, `New issue "${newIssue.title}" for your department.`, NotificationType.Email, 'email', emailContent);
  }

  return { newIssue, updatedUser };
};

// Update the status of an existing issue
export const updateIssueStatus = (id: string, newStatus: Status): { updatedIssue: CivicIssue | null; updatedUser: User | null; } => {
  const issues = getIssues();
  const issueIndex = issues.findIndex(issue => issue.id === id);

  if (issueIndex === -1) {
    console.error(`Issue with id ${id} not found.`);
    return { updatedIssue: null, updatedUser: null };
  }

  const originalStatus = issues[issueIndex].status;
  if (originalStatus === newStatus) {
    return { updatedIssue: issues[issueIndex], updatedUser: null }; // No change
  }

  const updatedIssue = { ...issues[issueIndex], status: newStatus };
  
  if (originalStatus === Status.Pending && (newStatus === Status.InProgress || newStatus === Status.Resolved)) {
    updatedIssue.acknowledgedAt = Date.now();
  }
  if (newStatus === Status.Resolved) {
    updatedIssue.resolvedAt = Date.now();
  }

  issues[issueIndex] = updatedIssue;
  saveIssues(issues);

  // If resolved, send a simulated email. Otherwise, send an in-app notification.
  if (newStatus === Status.Resolved) {
      const emailContent = {
          subject: `Your Report has been Resolved: "${updatedIssue.title}"`,
          body: `Hello ${updatedIssue.username},\n\nWe're pleased to inform you that your reported issue, "${updatedIssue.title}", has been marked as resolved by the ${updatedIssue.department} department.\n\nThank you for helping improve our community. We would appreciate it if you could take a moment to rate the service you received.`,
          cta: { text: "Rate Service & View Report", link: `#my-reports` }
      };
      const updatedUser = addNotification(updatedIssue.userId, `Your report "${updatedIssue.title}" has been resolved.`, NotificationType.Email, 'email', emailContent);
      return { updatedIssue, updatedUser };
  } else {
      const updatedUser = addNotification(updatedIssue.userId, `The status of your report "${updatedIssue.title}" has been updated to "${newStatus}".`, NotificationType.StatusUpdate);
      return { updatedIssue, updatedUser };
  }
};

export const addRatingToIssue = (id: string, rating: number): { updatedIssue: CivicIssue | null; updatedUser: User | null; } => {
    const issues = getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) {
        console.error(`Issue with id ${id} not found.`);
        return { updatedIssue: null, updatedUser: null };
    }

    const updatedIssue = { ...issues[issueIndex], rating };
    issues[issueIndex] = updatedIssue;
    saveIssues(issues);

    // Notify user
    const updatedUser = addNotification(updatedIssue.userId, `Your ${rating}-star rating for "${updatedIssue.title}" has been recorded. Thank you!`, NotificationType.General);

    // Notify department admin
    const admin = findAdminByDepartment(updatedIssue.department);
    if (admin) {
        addNotification(admin.id, `A user gave a ${rating}-star rating for the resolved issue: "${updatedIssue.title}".`, NotificationType.RatingReceived);
    }

    return { updatedIssue, updatedUser };
};

export const addFeedbackToIssue = (id: string, feedback: string): { updatedIssue: CivicIssue | null; updatedUser: User | null; } => {
    const issues = getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) {
        console.error(`Issue with id ${id} not found.`);
        return { updatedIssue: null, updatedUser: null };
    }

    const updatedIssue = { ...issues[issueIndex], feedback };
    issues[issueIndex] = updatedIssue;
    saveIssues(issues);
    
    // Notify user
    const updatedUser = addNotification(updatedIssue.userId, `Your feedback for "${updatedIssue.title}" has been received. Thank you!`, NotificationType.FeedbackReceived);

    // Notify department admin
    const admin = findAdminByDepartment(updatedIssue.department);
    if (admin) {
        addNotification(admin.id, `New feedback was submitted for the issue: "${updatedIssue.title}".`, NotificationType.FeedbackReceived);
    }

    return { updatedIssue, updatedUser };
};