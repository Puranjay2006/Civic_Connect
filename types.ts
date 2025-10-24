export enum Status {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export enum Category {
  Pothole = 'Pothole',
  Garbage = 'Garbage',
  Streetlight = 'Streetlight Failure',
  Other = 'Other',
}

export interface NotificationMessage {
  id: string;
  message: string;
  read: boolean;
  createdAt: number;
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
}

export interface CivicIssue {
  id:string;
  title: string;
  description: string;
  category: Category;
  photo: string; // base64 data URL
  location: {
    lat: number;
    lng: number;
  };
  status: Status;
  createdAt: number; // timestamp
  userId: string;
  userEmail: string;
  username?: string;
}

export type View = 'home' | 'dashboard' | 'report' | 'admin' | 'track' | 'login' | 'signup' | 'notifications' | 'my-reports' | 'admin-login' | 'forgot-password' | 'reset-password';