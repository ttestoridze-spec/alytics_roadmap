import { ZoomLevel } from './types';

export function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function addDays(date: string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function getTimelineRange(epics: { startDate: string; endDate: string; stories: { startDate: string; endDate: string }[] }[]) {
  let minDate = new Date('2099-01-01');
  let maxDate = new Date('2000-01-01');

  const padDays = 15;

  epics.forEach(epic => {
    const es = new Date(epic.startDate);
    const ee = new Date(epic.endDate);
    if (es < minDate) minDate = es;
    if (ee > maxDate) maxDate = ee;

    epic.stories.forEach(story => {
      const ss = new Date(story.startDate);
      const se = new Date(story.endDate);
      if (ss < minDate) minDate = ss;
      if (se > maxDate) maxDate = se;
    });
  });

  // Add padding
  minDate = new Date(minDate);
  minDate.setDate(minDate.getDate() - padDays);
  maxDate = new Date(maxDate);
  maxDate.setDate(maxDate.getDate() + padDays);

  return { minDate, maxDate };
}

export function getTimelineTicks(minDate: Date, maxDate: Date, zoom: ZoomLevel): { date: Date; label: string; isMajor: boolean }[] {
  const ticks: { date: Date; label: string; isMajor: boolean }[] = [];
  const current = new Date(minDate);

  if (zoom === 'day') {
    while (current <= maxDate) {
      const isMonday = current.getDay() === 1;
      const isFirst = current.getDate() === 1;
      ticks.push({
        date: new Date(current),
        label: current.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        isMajor: isFirst,
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (zoom === 'week') {
    // Align to Monday
    while (current.getDay() !== 1) current.setDate(current.getDate() - 1);
    while (current <= maxDate) {
      const isFirst = current.getDate() <= 7;
      ticks.push({
        date: new Date(current),
        label: `${current.getDate()} ${current.toLocaleDateString('ru-RU', { month: 'short' })}`,
        isMajor: isFirst,
      });
      current.setDate(current.getDate() + 7);
    }
  } else {
    current.setDate(1);
    while (current <= maxDate) {
      const isFirst = current.getMonth() === 0;
      ticks.push({
        date: new Date(current),
        label: current.toLocaleDateString('ru-RU', { month: 'short', year: isFirst ? 'numeric' : undefined }),
        isMajor: isFirst || current.getMonth() % 3 === 0,
      });
      current.setMonth(current.getMonth() + 1);
    }
  }

  return ticks;
}

export function getPositionForDate(date: Date, minDate: Date, totalDays: number): number {
  const diff = date.getTime() - minDate.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return (days / totalDays) * 100;
}

export function getWidthForRange(start: string, end: string, minDate: Date, totalDays: number): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return Math.max((days / totalDays) * 100, 0.5);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
