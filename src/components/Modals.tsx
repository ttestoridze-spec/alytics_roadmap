import { useState } from 'react';
import { Epic, Story, Status, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '../types';
import { formatDate } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface EpicFormData {
  title: string;
  description: string;
  color: string;
  startDate: string;
  endDate: string;
}

interface EpicFormProps {
  onSubmit: (data: EpicFormData) => void;
  onCancel: () => void;
  initialData?: EpicFormData;
  colors: string[];
}

export function EpicForm({ onSubmit, onCancel, initialData, colors }: EpicFormProps) {
  const [form, setForm] = useState<EpicFormData>(
    initialData || {
      title: '',
      description: '',
      color: colors[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Название эпика *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Например: 🎯 Мобильное приложение"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
          rows={2}
          placeholder="Краткое описание эпика"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Цвет</label>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setForm({ ...form, color })}
              className={`w-8 h-8 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: color }}
            />
          ))}
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
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Сохранить
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

interface StoryFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: Status;
  priority: Priority;
  assignee: string;
}

interface StoryFormProps {
  onSubmit: (data: StoryFormData) => void;
  onCancel: () => void;
  epic: Epic;
  initialData?: Story;
}

export function StoryForm({ onSubmit, onCancel, epic, initialData }: StoryFormProps) {
  const [form, setForm] = useState<StoryFormData>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          status: initialData.status,
          priority: initialData.priority,
          assignee: initialData.assignee || '',
        }
      : {
          title: '',
          description: '',
          startDate: epic.startDate,
          endDate: epic.endDate,
          status: 'planned',
          priority: 'medium',
          assignee: '',
        }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic.color }}></div>
        <span className="text-sm text-gray-300">{epic.title}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Название задачи *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Например: Реализовать авторизацию"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
          rows={2}
          placeholder="Детали задачи"
        />
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
          />
        </div>
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
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Исполнитель</label>
        <input
          type="text"
          value={form.assignee}
          onChange={e => setForm({ ...form, assignee: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Имя или команда"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Сохранить
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

interface DetailPanelProps {
  epic: Epic | null;
  story: Story | null;
  onClose: () => void;
  onEditEpic?: () => void;
  onDeleteEpic?: () => void;
  onEditStory?: () => void;
  onDeleteStory?: () => void;
  onAddStory?: () => void;
}

export function DetailPanel({ epic, story, onClose, onEditEpic, onDeleteEpic, onEditStory, onDeleteStory, onAddStory }: DetailPanelProps) {
  if (!epic && !story) return null;

  const target = story || epic!;
  const isStory = !!story;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isStory && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic!.color }}></div>
            )}
            <h3 className="text-lg font-bold text-white">{target.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          {target.description && (
            <p className="text-gray-400">{target.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Начало</p>
              <p className="text-sm text-white font-medium">{formatDate(target.startDate)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Конец</p>
              <p className="text-sm text-white font-medium">{formatDate(target.endDate)}</p>
            </div>
          </div>

          {isStory && story && (
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[story.status].bg}/20 ${STATUS_CONFIG[story.status].color}`}>
                {STATUS_CONFIG[story.status].icon} {STATUS_CONFIG[story.status].label}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[story.priority].bg}/20 ${PRIORITY_CONFIG[story.priority].color}`}>
                {PRIORITY_CONFIG[story.priority].label}
              </div>
              {story.assignee && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                  👤 {story.assignee}
                </div>
              )}
            </div>
          )}

          {!isStory && epic && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Задачи ({epic.stories.length}):</p>
              {epic.stories.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span>{STATUS_CONFIG[s.status].icon}</span>
                  <span className="text-gray-300">{s.title}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-700">
            {isStory ? (
              <>
                {onEditStory && (
                  <button onClick={onEditStory} className="flex-1 bg-gray-800 border border-gray-700 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                    ✏️ Редактировать
                  </button>
                )}
                {onDeleteStory && (
                  <button onClick={onDeleteStory} className="flex-1 bg-red-500/10 border border-red-500/30 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                    🗑️ Удалить
                  </button>
                )}
              </>
            ) : (
              <>
                {onEditEpic && (
                  <button onClick={onEditEpic} className="flex-1 bg-gray-800 border border-gray-700 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                    ✏️ Редактировать
                  </button>
                )}
                {onAddStory && (
                  <button onClick={onAddStory} className="flex-1 bg-purple-500/10 border border-purple-500/30 py-2 rounded-lg text-sm text-purple-400 hover:bg-purple-500/20 transition-colors">
                    + Добавить задачу
                  </button>
                )}
                {onDeleteEpic && (
                  <button onClick={onDeleteEpic} className="flex-1 bg-red-500/10 border border-red-500/30 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                    🗑️ Удалить
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
