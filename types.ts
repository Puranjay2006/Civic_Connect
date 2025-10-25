export enum Status {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

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
  Streetlight = 'Streetlight Failure',
  Other = 'Other',
}

export enum NotificationType {
  StatusUpdate = 'StatusUpdate',
  RatingReceived = 'RatingReceived',
  FeedbackReceived = 'FeedbackReceived',
  General = 'General',
}

export interface NotificationMessage {
  id: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: NotificationType;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  notifications: NotificationMessage[];
  passwordResetToken?: string;
  passwordResetExpires?: number;
  department?: Department;
}

export interface CivicIssue {
  id:string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  photo: string; // base64 data URL
  location: {
    lat: number;
    lng: number;
  };
  status: Status;
  createdAt: number; // timestamp
  acknowledgedAt: number | null;
  resolvedAt: number | null;
  userId: string;
  userEmail: string;
  username?: string;
  rating: number | null; // 1-5 stars
  feedback?: string;
}

export type View = 'home' | 'dashboard' | 'report' | 'admin' | 'track' | 'login' | 'signup' | 'notifications' | 'my-reports' | 'admin-login' | 'forgot-password' | 'reset-password' | 'admin-department-select' | 'feedback';