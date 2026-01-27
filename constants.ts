
import { Category, Status, Department } from './types';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyCy04Z9p60Selw2tO7lhRQG86va8xKmYP0';

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