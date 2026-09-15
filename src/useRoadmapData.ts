import { useState, useEffect, useCallback } from 'react';
import { RoadmapData, Epic, Story } from './types';

const STORAGE_KEY = 'sa-alytics-roadmap';

const DEFAULT_DATA: RoadmapData = {
  projectName: 'SA Alytics',
  projectDescription: 'Роадмап развития аналитической платформы',
  epics: [
    {
      id: 'epic-1',
      title: '🏗️ Архитектура и инфраструктура',
      description: 'Базовая инфраструктура проекта',
      color: '#8b5cf6',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      stories: [
        {
          id: 'story-1',
          epicId: 'epic-1',
          title: 'Настройка CI/CD пайплайна',
          description: 'GitHub Actions + Docker',
          startDate: '2026-01-01',
          endDate: '2026-01-20',
          status: 'completed',
          priority: 'high',
          assignee: 'DevOps',
        },
        {
          id: 'story-2',
          epicId: 'epic-1',
          title: 'Проектирование базы данных',
          description: 'Схема PostgreSQL + миграции',
          startDate: '2026-01-10',
          endDate: '2026-02-15',
          status: 'completed',
          priority: 'critical',
          assignee: 'Backend',
        },
        {
          id: 'story-3',
          epicId: 'epic-1',
          title: 'Настройка мониторинга',
          description: 'Prometheus + Grafana',
          startDate: '2026-02-01',
          endDate: '2026-03-15',
          status: 'in_progress',
          priority: 'medium',
          assignee: 'DevOps',
        },
      ],
    },
    {
      id: 'epic-2',
      title: '📊 Дашборды и визуализация',
      description: 'Система дашбордов для аналитики',
      color: '#06b6d4',
      startDate: '2026-02-01',
      endDate: '2026-06-30',
      stories: [
        {
          id: 'story-4',
          epicId: 'epic-2',
          title: 'Drag & Drop конструктор дашбордов',
          description: 'Виджеты, сетка, ресайз',
          startDate: '2026-02-01',
          endDate: '2026-03-31',
          status: 'in_progress',
          priority: 'critical',
          assignee: 'Frontend',
        },
        {
          id: 'story-5',
          epicId: 'epic-2',
          title: 'Графики и диаграммы',
          description: 'Line, Bar, Pie, Area charts',
          startDate: '2026-03-01',
          endDate: '2026-04-30',
          status: 'planned',
          priority: 'high',
          assignee: 'Frontend',
        },
        {
          id: 'story-6',
          epicId: 'epic-2',
          title: 'Экспорт в PDF/Excel',
          description: 'Генерация отчётов',
          startDate: '2026-05-01',
          endDate: '2026-06-15',
          status: 'planned',
          priority: 'medium',
          assignee: 'Backend',
        },
      ],
    },
    {
      id: 'epic-3',
      title: '🤖 AI / ML модуль',
      description: 'Интеллектуальная аналитика',
      color: '#f59e0b',
      startDate: '2026-04-01',
      endDate: '2026-09-30',
      stories: [
        {
          id: 'story-7',
          epicId: 'epic-3',
          title: 'Детекция аномалий',
          description: 'Алгоритмы ML для обнаружения аномалий',
          startDate: '2026-04-01',
          endDate: '2026-06-30',
          status: 'planned',
          priority: 'high',
          assignee: 'ML Team',
        },
        {
          id: 'story-8',
          epicId: 'epic-3',
          title: 'Прогнозирование трендов',
          description: 'Time-series forecasting',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          status: 'planned',
          priority: 'high',
          assignee: 'ML Team',
        },
        {
          id: 'story-9',
          epicId: 'epic-3',
          title: 'NLP для инсайтов',
          description: 'Автоматическое описание данных',
          startDate: '2026-08-01',
          endDate: '2026-09-30',
          status: 'planned',
          priority: 'medium',
          assignee: 'ML Team',
        },
      ],
    },
    {
      id: 'epic-4',
      title: '🔗 Интеграции',
      description: 'Подключение внешних систем',
      color: '#10b981',
      startDate: '2026-03-01',
      endDate: '2026-08-31',
      stories: [
        {
          id: 'story-10',
          epicId: 'epic-4',
          title: 'REST API',
          description: 'Публичный API для интеграций',
          startDate: '2026-03-01',
          endDate: '2026-04-15',
          status: 'in_progress',
          priority: 'critical',
          assignee: 'Backend',
        },
        {
          id: 'story-11',
          epicId: 'epic-4',
          title: 'Интеграция с 1С',
          description: 'Коннектор для 1С Предприятие',
          startDate: '2026-05-01',
          endDate: '2026-06-30',
          status: 'planned',
          priority: 'high',
          assignee: 'Backend',
        },
        {
          id: 'story-12',
          epicId: 'epic-4',
          title: 'Webhook система',
          description: 'Уведомления о событиях',
          startDate: '2026-07-01',
          endDate: '2026-08-31',
          status: 'planned',
          priority: 'medium',
          assignee: 'Backend',
        },
      ],
    },
  ],
};

export function useRoadmapData() {
  const [data, setData] = useState<RoadmapData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load roadmap data', e);
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addEpic = useCallback((epic: Omit<Epic, 'id' | 'stories'>) => {
    const newEpic: Epic = {
      ...epic,
      id: `epic-${Date.now()}`,
      stories: [],
    };
    setData(prev => ({ ...prev, epics: [...prev.epics, newEpic] }));
  }, []);

  const updateEpic = useCallback((id: string, updates: Partial<Epic>) => {
    setData(prev => ({
      ...prev,
      epics: prev.epics.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  }, []);

  const deleteEpic = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      epics: prev.epics.filter(e => e.id !== id),
    }));
  }, []);

  const addStory = useCallback((story: Omit<Story, 'id'>) => {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
    };
    setData(prev => ({
      ...prev,
      epics: prev.epics.map(e =>
        e.id === story.epicId
          ? { ...e, stories: [...e.stories, newStory] }
          : e
      ),
    }));
  }, []);

  const updateStory = useCallback((epicId: string, storyId: string, updates: Partial<Story>) => {
    setData(prev => ({
      ...prev,
      epics: prev.epics.map(e =>
        e.id === epicId
          ? { ...e, stories: e.stories.map(s => s.id === storyId ? { ...s, ...updates } : s) }
          : e
      ),
    }));
  }, []);

  const deleteStory = useCallback((epicId: string, storyId: string) => {
    setData(prev => ({
      ...prev,
      epics: prev.epics.map(e =>
        e.id === epicId
          ? { ...e, stories: e.stories.filter(s => s.id !== storyId) }
          : e
      ),
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  return {
    data,
    setData,
    addEpic,
    updateEpic,
    deleteEpic,
    addStory,
    updateStory,
    deleteStory,
    resetData,
  };
}
