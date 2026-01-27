import { Category, Department, Status } from './types';

// Constants
export const DEPARTMENTS: Department[] = [
  Department.Electrical,
  Department.Water,
  Department.Medical,
  Department.Sanitation,
  Department.Roads,
];

export const ISSUE_CATEGORIES: Category[] = [
  Category.Pothole,
  Category.Garbage,
  Category.Streetlight,
  Category.WaterLeak,
  Category.Sewage,
  Category.Other,
];

export const STATUSES: Status[] = [
  Status.Pending,
  Status.InProgress,
  Status.Resolved,
];

// Department icons and colors
export const DEPARTMENT_CONFIG: Record<Department, { icon: string; color: string; bgColor: string }> = {
  [Department.Electrical]: {
    icon: 'Zap',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  [Department.Water]: {
    icon: 'Droplets',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  [Department.Medical]: {
    icon: 'Heart',
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  [Department.Sanitation]: {
    icon: 'Trash2',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  [Department.Roads]: {
    icon: 'Construction',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
};

// Status configuration
export const STATUS_CONFIG: Record<Status, { color: string; bgColor: string; icon: string }> = {
  [Status.Pending]: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'Clock',
  },
  [Status.InProgress]: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'Loader',
  },
  [Status.Resolved]: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: 'CheckCircle',
  },
};

// Priority configuration
export const PRIORITY_CONFIG = {
  low: {
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    label: 'Low',
  },
  medium: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Medium',
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'High',
  },
  urgent: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Urgent',
  },
};

// Passkeys (for demo purposes - in production these would be server-side)
export const SUPER_ADMIN_PASSKEY = 'ykls_764';
export const DEPARTMENT_PASSKEYS: Record<Department, string> = {
  [Department.Electrical]: 'ljn_9871',
  [Department.Water]: 'ljn_9872',
  [Department.Medical]: 'ljn_9873',
  [Department.Sanitation]: 'ljn_9874',
  [Department.Roads]: 'ljn_9875',
};

// App info
export const APP_INFO = {
  name: 'Civic Connect',
  tagline: 'Building Better Communities Together',
  description: 'Report local issues, track their progress, and see real change happen in your community.',
  version: '1.0.0',
  year: 2026,
};
