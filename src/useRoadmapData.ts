import { useState, useEffect, useCallback } from 'react';
import { RoadmapData, Card, CardType, Assignee, CardGroup, Status, Priority, VolumeUnit, TYPE_COLORS } from './types';

const STORAGE_KEY = 'roadmap-alytics-data';

const DEFAULT_TYPES: CardType[] = [
  { id: 'type-backend', name: 'Backend', color: '#8b5cf6', icon: '⚙️' },
  { id: 'type-frontend', name: 'Frontend / UI', color: '#06b6d4', icon: '🎨' },
  { id: 'type-devops', name: 'DevOps', color: '#f59e0b', icon: '🔧' },
  { id: 'type-infra', name: 'Инфраструктура', color: '#10b981', icon: '🏗️' },
  { id: 'type-v3', name: 'V3 Alytics', color: '#ec4899', icon: '🚀' },
  { id: 'type-techdebt', name: 'Техдолг', color: '#ef4444', icon: '🧹' },
  { id: 'type-analytics', name: 'Аналитика', color: '#6366f1', icon: '📊' },
  { id: 'type-security', name: 'Безопасность', color: '#14b8a6', icon: '🔒' },
];

const DEFAULT_ASSIGNEES: Assignee[] = [
  { id: 'a-1', name: 'Фронтенд команда', role: 'Frontend', emoji: '🎨' },
  { id: 'a-2', name: 'Бэкенд команда', role: 'Backend', emoji: '⚙️' },
  { id: 'a-3', name: 'DevOps', role: 'Infrastructure', emoji: '🔧' },
  { id: 'a-4', name: 'Бизнес-заказчик', role: 'Business', emoji: '💼' },
  { id: 'a-5', name: 'Аналитик', role: 'Analytics', emoji: '📊' },
  { id: 'a-6', name: 'QA', role: 'Testing', emoji: '🧪' },
];

const DEFAULT_GROUPS: CardGroup[] = [
  { id: 'g-1', name: '🏗️ Архитектура и инфраструктура', color: '#8b5cf6' },
  { id: 'g-2', name: '📊 Дашборды и визуализация', color: '#06b6d4' },
  { id: 'g-3', name: '🤖 AI / ML модуль', color: '#f59e0b' },
  { id: 'g-4', name: '🔗 Интеграции', color: '#10b981' },
];

const DEFAULT_CARDS: Card[] = [
  {
    id: 'c-1',
    title: 'Настройка CI/CD пайплайна',
    description: 'GitHub Actions + Docker',
    typeId: 'type-devops',
    groupId: 'g-1',
    startDate: '2026-01-01',
    endDate: '2026-01-20',
    volume: 15,
    volumeUnit: 'days',
    jiraLink: 'https://jira.example.com/ALY-101',
    assigneeId: 'a-3',
    status: 'completed',
    priority: 'high',
  },
  {
    id: 'c-2',
    title: 'Проектирование БД',
    description: 'PostgreSQL + миграции',
    typeId: 'type-backend',
    groupId: 'g-1',
    startDate: '2026-01-10',
    endDate: '2026-02-15',
    volume: 28,
    volumeUnit: 'days',
    assigneeId: 'a-2',
    status: 'completed',
    priority: 'critical',
  },
  {
    id: 'c-3',
    title: 'Drag & Drop конструктор',
    description: 'Виджеты, сетка, ресайз',
    typeId: 'type-frontend',
    groupId: 'g-2',
    startDate: '2026-02-01',
    endDate: '2026-03-31',
    volume: 40,
    volumeUnit: 'story_points',
    assigneeId: 'a-1',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'c-4',
    title: 'Детекция аномалий',
    description: 'ML алгоритмы',
    typeId: 'type-v3',
    groupId: 'g-3',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    volume: 60,
    volumeUnit: 'story_points',
    assigneeId: 'a-5',
    status: 'planned',
    priority: 'high',
  },
  {
    id: 'c-5',
    title: 'REST API v2',
    description: 'Публичный API',
    typeId: 'type-backend',
    groupId: 'g-4',
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    volume: 30,
    volumeUnit: 'hours',
    jiraLink: 'https://jira.example.com/ALY-205',
    assigneeId: 'a-2',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'c-6',
    title: 'Рефакторинг legacy кода',
    description: 'Миграция на новые паттерны',
    typeId: 'type-techdebt',
    groupId: 'g-1',
    startDate: '2026-02-15',
    endDate: '2026-03-10',
    volume: 20,
    volumeUnit: 'hours',
    assigneeId: 'a-2',
    status: 'blocked',
    priority: 'medium',
  },
];

const DEFAULT_DATA: RoadmapData = {
  projectName: 'Roadmap Alytics',
  projectDescription: 'Интерактивный роадмап развития проекта',
  cards: DEFAULT_CARDS,
  settings: {
    cardTypes: DEFAULT_TYPES,
    assignees: DEFAULT_ASSIGNEES,
    groups: DEFAULT_GROUPS,
  },
};

export function useRoadmapData() {
  const [data, setData] = useState<RoadmapData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new fields exist
        return {
          ...DEFAULT_DATA,
          ...parsed,
          settings: {
            ...DEFAULT_DATA.settings,
            ...(parsed.settings || {}),
          },
        };
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addCard = useCallback((card: Omit<Card, 'id'>) => {
    const newCard: Card = { ...card, id: `c-${Date.now()}` };
    setData(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
    return newCard.id;
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setData(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== id),
    }));
  }, []);

  // Settings
  const addCardType = useCallback((type: Omit<CardType, 'id'>) => {
    const newType: CardType = { ...type, id: `type-${Date.now()}` };
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, cardTypes: [...prev.settings.cardTypes, newType] },
    }));
  }, []);

  const updateCardType = useCallback((id: string, updates: Partial<CardType>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        cardTypes: prev.settings.cardTypes.map(t => t.id === id ? { ...t, ...updates } : t),
      },
    }));
  }, []);

  const deleteCardType = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, cardTypes: prev.settings.cardTypes.filter(t => t.id !== id) },
    }));
  }, []);

  const addAssignee = useCallback((assignee: Omit<Assignee, 'id'>) => {
    const newAssignee: Assignee = { ...assignee, id: `a-${Date.now()}` };
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, assignees: [...prev.settings.assignees, newAssignee] },
    }));
  }, []);

  const updateAssignee = useCallback((id: string, updates: Partial<Assignee>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        assignees: prev.settings.assignees.map(a => a.id === id ? { ...a, ...updates } : a),
      },
    }));
  }, []);

  const deleteAssignee = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, assignees: prev.settings.assignees.filter(a => a.id !== id) },
    }));
  }, []);

  const addGroup = useCallback((group: Omit<CardGroup, 'id'>) => {
    const newGroup: CardGroup = { ...group, id: `g-${Date.now()}` };
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, groups: [...prev.settings.groups, newGroup] },
    }));
  }, []);

  const updateGroup = useCallback((id: string, updates: Partial<CardGroup>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        groups: prev.settings.groups.map(g => g.id === id ? { ...g, ...updates } : g),
      },
    }));
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, groups: prev.settings.groups.filter(g => g.id !== id) },
      cards: prev.cards.map(c => c.groupId === id ? { ...c, groupId: undefined } : c),
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  return {
    data,
    addCard,
    updateCard,
    deleteCard,
    addCardType,
    updateCardType,
    deleteCardType,
    addAssignee,
    updateAssignee,
    deleteAssignee,
    addGroup,
    updateGroup,
    deleteGroup,
    resetData,
  };
}

export { TYPE_COLORS };
