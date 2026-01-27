// Enums
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
  WaterLeak = 'Water Leak',
  Sewage = 'Sewage',
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
  Email = 'Email',
}

// Interfaces
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
    cta?: { text: string; link: string };
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  isAdmin: boolean;
  notifications: NotificationMessage[];
  department?: Department;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  avatar?: string;
  createdAt: number;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  photo: string;
  location: { lat: number; lng: number; address?: string };
  createdAt: number;
  acknowledgedAt: number | null;
  resolvedAt: number | null;
  status: Status;
  userId: string;
  userEmail: string;
  username: string;
  rating: number | null;
  feedback?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface LeaderboardUser {
  userId: string;
  username: string;
  score: number;
  reportsSubmitted: number;
  ratingsGiven: number;
  feedbacksProvided: number;
  avatar?: string;
  rank?: number;
}

export interface DashboardStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  inProgressReports: number;
  averageResolutionTime: number;
  departmentStats: {
    department: Department;
    count: number;
    resolved: number;
  }[];
}

// Route types
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
  | 'public-reports'
  | 'leaderboard';

// API Response types (for future backend integration)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
