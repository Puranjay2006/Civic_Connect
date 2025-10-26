// FIX: Adding an 'Email' type and a 'deliveryMethod' property to support the new simulated email notification system.

export enum Department {
    Electrical = 'Electrical',
    Water = 'Water',
    Medical = 'Medical',
    Sanitation = 'Sanitation',
    Roads = 'Roads',
}
  
export enum Category {
    Pothole = 'Pothole',
    Garbage = 'Garbage',
    Streetlight = 'Streetlight',
    Other = 'Other',
}
  
export enum Status {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Resolved = 'Resolved',
}

export enum NotificationType {
    StatusUpdate = 'StatusUpdate',
    RatingReceived = 'RatingReceived',
    FeedbackReceived = 'FeedbackReceived',
    PasswordReset = 'PasswordReset',
    General = 'General',
    Email = 'Email', // For simulated emails
}

export interface NotificationMessage {
    id: string;
    message: string;
    read: boolean;
    createdAt: number;
    type: NotificationType;
    deliveryMethod: 'in-app' | 'email';
    emailContent?: {
        subject: string;
        body: string;
        cta?: { text: string; link: string; };
    };
}
  
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    notifications: NotificationMessage[];
    department?: Department;
    passwordResetToken?: string;
    passwordResetExpires?: number;
}
  
export interface CivicIssue {
    id: string;
    title: string;
    description: string;
    category: Category;
    department: Department;
    photo: string;
    location: { lat: number; lng: number };
    createdAt: number;
    acknowledgedAt: number | null;
    resolvedAt: number | null;
    status: Status;
    userId: string;
    userEmail: string;
    username: string;
    rating: number | null;
    feedback?: string;
}

export interface LeaderboardUser {
  userId: string;
  username: string;
  score: number;
  reportsSubmitted: number;
  ratingsGiven: number;
  feedbacksProvided: number;
}

export type View =
  | 'home'
  | 'dashboard'
  | 'report'
  | 'admin'
  | 'admin-department-select'
  | 'track'
  | 'login'
  | 'admin-login'
  | 'admin-role-select'
  | 'department-login'
  | 'signup'
  | 'notifications'
  | 'my-reports'
  | 'forgot-password'
  | 'reset-password'
  | 'feedback'
  | 'reports'
  | 'public-reports';