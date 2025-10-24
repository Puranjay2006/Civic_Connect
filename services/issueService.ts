
import { CivicIssue, Status, User } from '../types';
import { addNotification } from './authService';

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
export const addIssue = (issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'status' | 'userId' | 'userEmail' | 'username'>, user: User): CivicIssue => {
  const issues = getIssues();
  const newIssue: CivicIssue = {
    ...issueData,
    id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    status: Status.Pending,
    userId: user.id,
    userEmail: user.email,
    username: user.username,
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
  issues[issueIndex] = updatedIssue;
  saveIssues(issues);

  // Notify the user who reported the issue
  addNotification(updatedIssue.userId, `The status of your report "${updatedIssue.title}" has been updated to "${newStatus}".`);

  return updatedIssue;
};