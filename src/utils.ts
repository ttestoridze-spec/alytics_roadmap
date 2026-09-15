import { ZoomLevel } from './types';

export function getTimelineRange(items: { startDate: string; endDate: string }[]) {
  let minDate = new Date('2099-01-01');
  let maxDate = new Date('2000-01-01');
  const padDays = 15;

  items.forEach(item => {
    const s = new Date(item.startDate);
    const e = new Date(item.endDate);
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  });

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
      const isFirst = current.getDate() === 1;
      ticks.push({
        date: new Date(current),
        label: current.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        isMajor: isFirst,
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (zoom === 'week') {
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

export function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}
