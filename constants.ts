
import { Category, Status } from './types';

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
