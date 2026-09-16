export type Status = 'planned' | 'in_progress' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ZoomLevel = 'day' | 'week' | 'month';
export type VolumeUnit = 'hours' | 'days' | 'weeks' | 'story_points';
export type ListGroupBy = 'priority' | 'startDate' | 'type' | 'status' | 'none';

export interface CardType {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Assignee {
  id: string;
  name: string;
  role: string;
  emoji: string;
}

export interface CardGroup {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  typeId: string;
  groupId?: string;
  startDate: string;
  endDate: string;
  volume: number;
  volumeUnit: VolumeUnit;
  jiraLink?: string;
  assigneeId?: string;
  status: Status;
  priority: Priority;
  order: number; // для сортировки в списке
}

export interface Settings {
  cardTypes: CardType[];
  assignees: Assignee[];
  groups: CardGroup[];
}

export interface RoadmapData {
  projectName: string;
  projectDescription: string;
  cards: Card[];
  settings: Settings;
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: string }> = {
  planned: { label: 'Запланировано', color: 'text-blue-400', bg: 'bg-blue-500', icon: '📋' },
  in_progress: { label: 'В работе', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: '🔄' },
  completed: { label: 'Завершено', color: 'text-green-400', bg: 'bg-green-500', icon: '✅' },
  blocked: { label: 'Заблокировано', color: 'text-red-400', bg: 'bg-red-500', icon: '🚫' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; hex: string; icon: string; weight: number }> = {
  critical: { label: 'Критический', color: 'text-red-400', bg: 'bg-red-500', hex: '#ef4444', icon: '🔴', weight: 0 },
  high: { label: 'Высокий', color: 'text-orange-400', bg: 'bg-orange-500', hex: '#f97316', icon: '🟠', weight: 1 },
  medium: { label: 'Средний', color: 'text-blue-400', bg: 'bg-blue-500', hex: '#3b82f6', icon: '🔵', weight: 2 },
  low: { label: 'Низкий', color: 'text-gray-400', bg: 'bg-gray-500', hex: '#6b7280', icon: '⚪', weight: 3 },
};

export const VOLUME_UNITS: Record<VolumeUnit, { label: string; short: string }> = {
  hours: { label: 'часов', short: 'ч' },
  days: { label: 'дней', short: 'д' },
  weeks: { label: 'недель', short: 'нд' },
  story_points: { label: 'SP', short: 'SP' },
};

export const TYPE_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7',
  '#84cc16', '#eab308',
];
