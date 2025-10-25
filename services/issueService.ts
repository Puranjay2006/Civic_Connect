
import { CivicIssue, Status, User, NotificationType } from '../types';
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
export const addIssue = (issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'status' | 'userId' | 'userEmail' | 'username' | 'acknowledgedAt' | 'resolvedAt' | 'rating'>, user: User): CivicIssue => {
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
  
  return newIssue;
};

// Update the status of an existing issue
export const updateIssueStatus = (id: string, newStatus: Status): CivicIssue | null => {
  const issues = getIssues();
  const issueIndex = issues.findIndex(issue => issue.id === id);

  if (issueIndex === -1) {
    console.error(`Issue with id ${id} not found.`);
    return null;
  }

  const originalStatus = issues[issueIndex].status;
  if (originalStatus === newStatus) {
    return issues[issueIndex]; // No change
  }

  const updatedIssue = { ...issues[issueIndex], status: newStatus };
  
  // Set timestamps based on status change
  if (originalStatus === Status.Pending && (newStatus === Status.InProgress || newStatus === Status.Resolved)) {
    updatedIssue.acknowledgedAt = Date.now();
  }
  if (newStatus === Status.Resolved) {
    updatedIssue.resolvedAt = Date.now();
  }


  issues[issueIndex] = updatedIssue;
  saveIssues(issues);

  // Notify the user who reported the issue
  addNotification(updatedIssue.userId, `The status of your report "${updatedIssue.title}" has been updated to "${newStatus}".`, NotificationType.StatusUpdate);

  return updatedIssue;
};

export const addRatingToIssue = (id: string, rating: number): CivicIssue | null => {
    const issues = getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) {
        console.error(`Issue with id ${id} not found.`);
        return null;
    }

    const updatedIssue = { ...issues[issueIndex], rating };
    issues[issueIndex] = updatedIssue;
    saveIssues(issues);

    // Notify user
    addNotification(updatedIssue.userId, `Your ${rating}-star rating for "${updatedIssue.title}" has been recorded. Thank you!`, NotificationType.General);

    // Notify department admin
    const admin = findAdminByDepartment(updatedIssue.department);
    if (admin) {
        addNotification(admin.id, `A user gave a ${rating}-star rating for the resolved issue: "${updatedIssue.title}".`, NotificationType.RatingReceived);
    }

    return updatedIssue;
};

export const addFeedbackToIssue = (id: string, feedback: string): CivicIssue | null => {
    const issues = getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) {
        console.error(`Issue with id ${id} not found.`);
        return null;
    }

    const updatedIssue = { ...issues[issueIndex], feedback };
    issues[issueIndex] = updatedIssue;
    saveIssues(issues);
    
    // Notify user
    addNotification(updatedIssue.userId, `Your feedback for "${updatedIssue.title}" has been received. Thank you!`, NotificationType.FeedbackReceived);

    // Notify department admin
    const admin = findAdminByDepartment(updatedIssue.department);
    if (admin) {
        addNotification(admin.id, `New feedback was submitted for the issue: "${updatedIssue.title}".`, NotificationType.FeedbackReceived);
    }

    return updatedIssue;
};