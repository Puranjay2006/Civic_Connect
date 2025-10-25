
import { Category, Status, Department } from './types';

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
  Category.Other,
];

export const STATUSES: Status[] = [
  Status.Pending,
  Status.InProgress,
  Status.Resolved,
];