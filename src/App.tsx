import { useState, useMemo } from 'react';
import { Epic, Story, ZoomLevel, Status, EPIC_COLORS, STATUS_CONFIG } from './types';
import { useRoadmapData } from './useRoadmapData';
import { GanttChart } from './components/GanttChart';
import { Modal, EpicForm, StoryForm, DetailPanel } from './components/Modals';
import { formatDate } from './utils';

function App() {
  const {
    data,
    addEpic,
    updateEpic,
    deleteEpic,
    addStory,
    updateStory,
    deleteStory,
    resetData,
  } = useRoadmapData();

  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  // Modal states
  const [showEpicModal, setShowEpicModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editingStory, setEditingStory] = useState<{ epic: Epic; story: Story } | null>(null);
  const [storyForEpic, setStoryForEpic] = useState<Epic | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedStory, setSelectedStory] = useState<{ epic: Epic; story: Story } | null>(null);

  // Filtered epics
  const filteredEpics = useMemo(() => {
    if (filterStatus === 'all') return data.epics;
    return data.epics
      .map(epic => ({
        ...epic,
        stories: epic.stories.filter(s => s.status === filterStatus),
      }))
      .filter(epic => epic.stories.length > 0 || epic.stories.length === 0);
  }, [data.epics, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const allStories = data.epics.flatMap(e => e.stories);
    return {
      total: allStories.length,
      completed: allStories.filter(s => s.status === 'completed').length,
      inProgress: allStories.filter(s => s.status === 'in_progress').length,
      planned: allStories.filter(s => s.status === 'planned').length,
      blocked: allStories.filter(s => s.status === 'blocked').length,
      epics: data.epics.length,
    };
  }, [data.epics]);

  const toggleEpicCollapse = (epicId: string) => {
    setCollapsedEpics(prev => {
      const next = new Set(prev);
      if (next.has(epicId)) next.delete(epicId);
      else next.add(epicId);
      return next;
    });
  };

  const handleEpicClick = (epic: Epic) => {
    setSelectedEpic(epic);
    setSelectedStory(null);
  };

  const handleStoryClick = (epic: Epic, story: Story) => {
    setSelectedStory({ epic, story });
    setSelectedEpic(null);
  };

  const handleEpicSubmit = (formData: { title: string; description: string; color: string; startDate: string; endDate: string }) => {
    if (editingEpic) {
      updateEpic(editingEpic.id, formData);
    } else {
      addEpic(formData);
    }
    setShowEpicModal(false);
    setEditingEpic(null);
  };

  const handleStorySubmit = (formData: { title: string; description: string; startDate: string; endDate: string; status: Status; priority: string; assignee: string }) => {
    const epic = editingStory?.epic || storyForEpic;
    if (!epic) return;

    if (editingStory) {
      updateStory(epic.id, editingStory.story.id, {
        ...formData,
        priority: formData.priority as import('./types').Priority,
      });
    } else {
      addStory({ ...formData, epicId: epic.id, priority: formData.priority as import('./types').Priority });
    }
    setShowStoryModal(false);
    setEditingStory(null);
    setStoryForEpic(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/20">
                SA
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {data.projectName}
                </h1>
                <p className="text-xs text-gray-500">{data.projectDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditingEpic(null); setShowEpicModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span>+</span> Новый эпик
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Всего:</span>
              <span className="text-sm font-medium text-white">{stats.total} задач</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = key === 'completed' ? stats.completed
                : key === 'in_progress' ? stats.inProgress
                : key === 'planned' ? stats.planned
                : stats.blocked;
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(filterStatus === key ? 'all' : key as Status)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                    filterStatus === key ? 'bg-gray-800 ring-1 ring-gray-600' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className={config.color}>{count}</span>
                </button>
              );
            })}
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ✕ Сбросить
              </button>
            )}
            <div className="flex-1"></div>
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    zoom === z ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {z === 'day' ? 'Дни' : z === 'week' ? 'Недели' : 'Месяцы'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Progress overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Прогресс</span>
              <span className="text-xs text-purple-400">{stats.epics} эпиков</span>
            </div>
            <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
            <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">В работе</span>
              <span className="text-yellow-400">🔄</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">активных задач</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Завершено</span>
              <span className="text-green-400">✅</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">из {stats.total} задач</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Заблокировано</span>
              <span className="text-red-400">🚫</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.blocked}</div>
            <p className="text-xs text-gray-500 mt-1">требуют внимания</p>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Временная шкала</h2>
              <p className="text-xs text-gray-500 mt-0.5">Нажмите на задачу для подробностей • ▶ для сворачивания эпика</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-red-500/60"></div>
                <span>Сегодня</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {data.epics.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Роадмап пуст</h3>
                <p className="text-gray-500 mb-6">Добавьте первый эпик, чтобы начать планирование</p>
                <button
                  onClick={() => { setEditingEpic(null); setShowEpicModal(true); }}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  + Создать эпик
                </button>
              </div>
            ) : (
              <GanttChart
                epics={filteredEpics}
                zoom={zoom}
                onEpicClick={handleEpicClick}
                onStoryClick={handleStoryClick}
                collapsedEpics={collapsedEpics}
                toggleEpicCollapse={toggleEpicCollapse}
              />
            )}
          </div>
        </div>

        {/* Epics list (mobile-friendly) */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.epics.map(epic => {
            const completedCount = epic.stories.filter(s => s.status === 'completed').length;
            const totalCount = epic.stories.length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div
                key={epic.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all cursor-pointer group"
                onClick={() => handleEpicClick(epic)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic.color }}></div>
                    <h3 className="font-medium text-sm group-hover:text-purple-300 transition-colors">{epic.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{completedCount}/{totalCount}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{epic.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatDate(epic.startDate)}</span>
                  <span>{formatDate(epic.endDate)}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: epic.color }}
                  ></div>
                </div>
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {epic.stories.slice(0, 4).map(story => (
                    <div
                      key={story.id}
                      className={`w-2 h-2 rounded-full ${
                        story.status === 'completed' ? 'bg-green-500' :
                        story.status === 'in_progress' ? 'bg-yellow-500' :
                        story.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      title={story.title}
                    ></div>
                  ))}
                  {epic.stories.length > 4 && (
                    <span className="text-[10px] text-gray-500">+{epic.stories.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Данные сохраняются локально в браузере
          </p>
          <button
            onClick={() => {
              if (confirm('Сбросить все данные к примеру? Это действие нельзя отменить.')) {
                resetData();
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Сбросить данные
          </button>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showEpicModal}
        onClose={() => { setShowEpicModal(false); setEditingEpic(null); }}
        title={editingEpic ? 'Редактировать эпик' : 'Новый эпик'}
      >
        <EpicForm
          onSubmit={handleEpicSubmit}
          onCancel={() => { setShowEpicModal(false); setEditingEpic(null); }}
          initialData={editingEpic ? { title: editingEpic.title, description: editingEpic.description, color: editingEpic.color, startDate: editingEpic.startDate, endDate: editingEpic.endDate } : undefined}
          colors={EPIC_COLORS}
        />
      </Modal>

      <Modal
        isOpen={showStoryModal}
        onClose={() => { setShowStoryModal(false); setEditingStory(null); setStoryForEpic(null); }}
        title={editingStory ? 'Редактировать задачу' : 'Новая задача'}
      >
        {(editingStory?.epic || storyForEpic) && (
          <StoryForm
            onSubmit={handleStorySubmit}
            onCancel={() => { setShowStoryModal(false); setEditingStory(null); setStoryForEpic(null); }}
            epic={editingStory?.epic || storyForEpic!}
            initialData={editingStory?.story}
          />
        )}
      </Modal>

      {/* Detail Panel */}
      <DetailPanel
        epic={selectedEpic}
        story={selectedStory?.story || null}
        onClose={() => { setSelectedEpic(null); setSelectedStory(null); }}
        onEditEpic={selectedEpic ? () => {
          setEditingEpic(selectedEpic);
          setShowEpicModal(true);
          setSelectedEpic(null);
        } : undefined}
        onDeleteEpic={selectedEpic ? () => {
          if (confirm(`Удалить эпик "${selectedEpic.title}" и все его задачи?`)) {
            deleteEpic(selectedEpic.id);
            setSelectedEpic(null);
          }
        } : undefined}
        onEditStory={selectedStory ? () => {
          setEditingStory(selectedStory);
          setShowStoryModal(true);
          setSelectedStory(null);
        } : undefined}
        onDeleteStory={selectedStory ? () => {
          if (confirm(`Удалить задачу "${selectedStory.story.title}"?`)) {
            deleteStory(selectedStory.epic.id, selectedStory.story.id);
            setSelectedStory(null);
          }
        } : undefined}
        onAddStory={selectedEpic ? () => {
          setStoryForEpic(selectedEpic);
          setShowStoryModal(true);
          setSelectedEpic(null);
        } : undefined}
      />
    </div>
  );
}

export default App;
