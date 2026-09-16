import { useState } from 'react';
import { Card, CardType, Assignee, CardGroup, Status, Priority, VolumeUnit, STATUS_CONFIG, PRIORITY_CONFIG, VOLUME_UNITS } from '../types';
import { daysBetween } from '../utils';

function calculateEndDate(startDate: string, volume: number, unit: VolumeUnit): string {
  const start = new Date(startDate);
  let daysToAdd = 0;

  switch (unit) {
    case 'hours': daysToAdd = Math.ceil(volume / 8); break;
    case 'days': daysToAdd = volume; break;
    case 'weeks': daysToAdd = volume * 7; break;
    case 'story_points': daysToAdd = Math.ceil(volume * 0.5); break;
  }

  daysToAdd = Math.max(daysToAdd, 1);
  const end = new Date(start);
  end.setDate(end.getDate() + daysToAdd);
  return end.toISOString().split('T')[0];
}

interface CardFormProps {
  onSubmit: (card: Omit<Card, 'id' | 'order'>) => void;
  onCancel: () => void;
  cardTypes: CardType[];
  assignees: Assignee[];
  groups: CardGroup[];
  initialData?: Card;
}

export function CardForm({ onSubmit, onCancel, cardTypes, assignees, groups, initialData }: CardFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    typeId: initialData?.typeId || cardTypes[0]?.id || '',
    groupId: initialData?.groupId || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    volume: initialData?.volume || 5,
    volumeUnit: (initialData?.volumeUnit || 'days') as VolumeUnit,
    jiraLink: initialData?.jiraLink || '',
    assigneeId: initialData?.assigneeId || '',
    status: (initialData?.status || 'planned') as Status,
    priority: (initialData?.priority || 'medium') as Priority,
  });

  const [autoResize, setAutoResize] = useState(!initialData);

  const calculatedEndDate = calculateEndDate(form.startDate, form.volume, form.volumeUnit);
  const endDateDiffers = calculatedEndDate !== form.endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const finalEndDate = autoResize ? calculatedEndDate : form.endDate;
    onSubmit({
      ...form,
      endDate: finalEndDate,
      groupId: form.groupId || undefined,
      jiraLink: form.jiraLink || undefined,
      assigneeId: form.assigneeId || undefined,
    });
  };

  const duration = daysBetween(form.startDate, form.endDate);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Название *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Например: Реализовать авторизацию"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Тип</label>
          <select
            value={form.typeId}
            onChange={e => setForm({ ...form, typeId: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            {cardTypes.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Группа</label>
          <select
            value={form.groupId}
            onChange={e => setForm({ ...form, groupId: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="">Без группы</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Начало *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => setForm({ ...form, startDate: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Конец *</label>
          <input
            type="date"
            value={form.endDate}
            onChange={e => setForm({ ...form, endDate: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
            required
            disabled={autoResize}
          />
        </div>
      </div>

      {duration > 0 && (
        <div className="text-xs text-gray-500 -mt-2">Длительность: {duration} дн.</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Объём</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.volume}
              onChange={e => setForm({ ...form, volume: Math.max(0, Number(e.target.value)) })}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
              min="0"
            />
            <select
              value={form.volumeUnit}
              onChange={e => setForm({ ...form, volumeUnit: e.target.value as VolumeUnit })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              {Object.entries(VOLUME_UNITS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          {autoResize && endDateDiffers && (
            <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-1.5">
              📏 Карточка растянется на {daysBetween(form.startDate, calculatedEndDate)} дн. → до {new Date(calculatedEndDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Ответственный</label>
          <select
            value={form.assigneeId}
            onChange={e => setForm({ ...form, assigneeId: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="">Не назначен</option>
            {assignees.map(a => (
              <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Ссылка на Jira</label>
        <input
          type="url"
          value={form.jiraLink}
          onChange={e => setForm({ ...form, jiraLink: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="https://jira.example.com/ALY-123"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Статус</label>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as Status })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Приоритет</label>
          <select
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
        <div>
          <div className="text-sm font-medium text-gray-200">📐 Авторасчёт размера</div>
          <div className="text-xs text-gray-500">
            {autoResize ? 'Длительность карточки = объём задачи' : 'Даты задаются вручную'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAutoResize(!autoResize)}
          className={`relative w-11 h-6 rounded-full transition-colors ${autoResize ? 'bg-purple-500' : 'bg-gray-700'}`}
        >
          <div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
            style={{ transform: autoResize ? 'translateX(22px)' : 'translateX(0)' }}
          ></div>
        </button>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {initialData ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-800 border border-gray-700 py-2.5 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
