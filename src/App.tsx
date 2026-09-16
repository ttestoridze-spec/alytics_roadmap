import { useState, useMemo } from 'react';
import { Card, ZoomLevel, Status, ListGroupBy, STATUS_CONFIG, VOLUME_UNITS, PRIORITY_CONFIG } from './types';
import { useRoadmapData } from './useRoadmapData';
import { GanttChart } from './components/GanttChart';
import { CardForm } from './components/CardForm';
import { SettingsModal } from './components/SettingsModal';
import { DataManagement } from './components/DataManagement';
import { TaskList } from './components/TaskList';
import { formatDate, daysBetween, addDays, formatMonthYear } from './utils';

function App() {
  const {
    data,
    addCard,
    updateCard,
    deleteCard,
    reorderCards,
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
  } = useRoadmapData();

  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [listGroupBy, setListGroupBy] = useState<ListGroupBy>('priority');

  // Paging state — видимое окно дат (по умолчанию 3 месяца от сегодня)
  const today = new Date();
  const [viewStart, setViewStart] = useState<Date>(() => addDays(today, -30));
  const [viewEnd, setViewEnd] = useState<Date>(() => addDays(today, 60));

  // Modal states
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Filtered cards
  const filteredCards = useMemo(() => {
    let result = data.cards;
    if (filterType !== 'all') result = result.filter(c => c.typeId === filterType);
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    return result;
  }, [data.cards, filterType, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const cards = data.cards;
    return {
      total: cards.length,
      completed: cards.filter(c => c.status === 'completed').length,
      inProgress: cards.filter(c => c.status === 'in_progress').length,
      planned: cards.filter(c => c.status === 'planned').length,
      blocked: cards.filter(c => c.status === 'blocked').length,
    };
  }, [data.cards]);

  const handleViewChange = (start: Date, end: Date) => {
    setViewStart(start);
    setViewEnd(end);
  };

  const navigatePeriod = (direction: number) => {
    const days = Math.round((viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const step = Math.round(days * direction);
    setViewStart(addDays(viewStart, step));
    setViewEnd(addDays(viewEnd, step));
  };

  const zoomToPeriod = (months: number) => {
    const center = new Date((viewStart.getTime() + viewEnd.getTime()) / 2);
    const halfDays = Math.round((months * 30) / 2);
    setViewStart(addDays(center, -halfDays));
    setViewEnd(addDays(center, halfDays));
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleCardClick = (card: Card) => setSelectedCard(card);

  const handleCardSubmit = (cardData: Omit<Card, 'id' | 'order'>) => {
    if (editingCard) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    setShowCardModal(false);
    setEditingCard(null);
  };

  const currentPeriodLabel = `${formatMonthYear(viewStart)} — ${formatMonthYear(viewEnd)}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">A</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{data.projectName}</h1>
                <p className="text-xs text-gray-500">{data.projectDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataManagement data={data} onImport={(importedData) => {
                localStorage.setItem('roadmap-alytics-data', JSON.stringify(importedData));
                window.location.reload();
              }} />
              <button onClick={() => setShowSettings(true)} className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">⚙️ Настройки</button>
              <button onClick={() => { setEditingCard(null); setShowCardModal(true); }} className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                <span>+</span> Новая карточка
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters bar */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-1">Тип:</span>
              <button onClick={() => setFilterType('all')} className={`px-2 py-1 rounded-md text-xs transition-all ${filterType === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>Все</button>
              {data.settings.cardTypes.map(type => (
                <button key={type.id} onClick={() => setFilterType(filterType === type.id ? 'all' : type.id)} className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${filterType === type.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }}></span>
                  {type.name}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-700"></div>

            <div className="flex items-center gap-1">
              <button onClick={() => setFilterStatus('all')} className={`px-2 py-1 rounded-md text-xs transition-all ${filterStatus === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>Все</button>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = key === 'completed' ? stats.completed : key === 'in_progress' ? stats.inProgress : key === 'planned' ? stats.planned : stats.blocked;
                return (
                  <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key as Status)} className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${filterStatus === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
                    <span>{config.icon}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
                <button key={z} onClick={() => setZoom(z)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${zoom === z ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}>
                  {z === 'day' ? 'Дни' : z === 'week' ? 'Недели' : 'Месяцы'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Всего задач</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">В работе</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Завершено</div>
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Запланировано</div>
            <div className="text-2xl font-bold text-blue-400">{stats.planned}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Прогресс</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart with paging */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold">Временная шкала</h2>
                <p className="text-xs text-gray-500 mt-0.5">🖱️ Крутите колёсико для переключения периода • Перетаскивайте карточки • Тяните за края</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[10px]">Приоритет:</span>
                  <span className="w-2 h-2 rounded-full bg-red-500" title="Критический"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-500" title="Высокий"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" title="Средний"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-500" title="Низкий"></span>
                </div>
              </div>
            </div>

            {/* Period navigation */}
            <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2">
              <button onClick={() => navigatePeriod(-1)} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">← Назад</button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{currentPeriodLabel}</span>
                <div className="flex items-center gap-1 bg-gray-900/50 rounded-md p-0.5">
                  <button onClick={() => zoomToPeriod(1)} className="px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="1 месяц">1М</button>
                  <button onClick={() => zoomToPeriod(3)} className="px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="3 месяца">3М</button>
                  <button onClick={() => zoomToPeriod(6)} className="px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="6 месяцев">6М</button>
                  <button onClick={() => zoomToPeriod(12)} className="px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="12 месяцев">1Г</button>
                </div>
              </div>

              <button onClick={() => navigatePeriod(1)} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">Вперёд →</button>
            </div>
          </div>

          <div className="p-4">
            {data.cards.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Роадмап пуст</h3>
                <p className="text-gray-500 mb-6">Создайте первую карточку для начала планирования</p>
                <button onClick={() => { setEditingCard(null); setShowCardModal(true); }} className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">+ Создать карточку</button>
              </div>
            ) : (
              <GanttChart
                cards={filteredCards}
                cardTypes={data.settings.cardTypes}
                assignees={data.settings.assignees}
                groups={data.settings.groups}
                zoom={zoom}
                viewStart={viewStart}
                viewEnd={viewEnd}
                onViewChange={handleViewChange}
                onCardClick={handleCardClick}
                onCardUpdate={updateCard}
                collapsedGroups={collapsedGroups}
                toggleGroupCollapse={toggleGroupCollapse}
              />
            )}
          </div>
        </div>

        {/* Task List with drag & drop */}
        <div className="mt-6">
          <TaskList
            cards={filteredCards}
            cardTypes={data.settings.cardTypes}
            assignees={data.settings.assignees}
            groups={data.settings.groups}
            groupBy={listGroupBy}
            onGroupByChange={setListGroupBy}
            onCardClick={handleCardClick}
            onReorder={reorderCards}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-600">Данные сохраняются локально в браузере</p>
          <button onClick={() => { if (confirm('Сбросить все данные к примеру?')) resetData(); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Сбросить данные</button>
        </div>
      </main>

      {/* Card Form Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowCardModal(false); setEditingCard(null); }}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">{editingCard ? 'Редактировать карточку' : 'Новая карточка'}</h3>
              <button onClick={() => { setShowCardModal(false); setEditingCard(null); }} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
              <CardForm onSubmit={handleCardSubmit} onCancel={() => { setShowCardModal(false); setEditingCard(null); }} cardTypes={data.settings.cardTypes} assignees={data.settings.assignees} groups={data.settings.groups} initialData={editingCard || undefined} />
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCard(null)}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
            {(() => {
              const type = data.settings.cardTypes.find(t => t.id === selectedCard.typeId);
              const assignee = data.settings.assignees.find(a => a.id === selectedCard.assigneeId);
              const group = data.settings.groups.find(g => g.id === selectedCard.groupId);
              const duration = daysBetween(selectedCard.startDate, selectedCard.endDate);

              return (
                <>
                  <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {type && <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${type.color}30` }}>{type.icon}</div>}
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedCard.title}</h3>
                        {type && <p className="text-xs text-gray-500">{type.name}</p>}
                      </div>
                    </div>
                    <button onClick={() => setSelectedCard(null)} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                    {selectedCard.description && <p className="text-gray-400 text-sm">{selectedCard.description}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Начало</p>
                        <p className="text-sm text-white font-medium">{formatDate(selectedCard.startDate)}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Конец</p>
                        <p className="text-sm text-white font-medium">{formatDate(selectedCard.endDate)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Объём</p>
                        <p className="text-sm text-white font-medium">{selectedCard.volume} {VOLUME_UNITS[selectedCard.volumeUnit].label}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Длительность</p>
                        <p className="text-sm text-white font-medium">{duration} дней</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedCard.status].bg}/20 ${STATUS_CONFIG[selectedCard.status].color}`}>
                        {STATUS_CONFIG[selectedCard.status].icon} {STATUS_CONFIG[selectedCard.status].label}
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${PRIORITY_CONFIG[selectedCard.priority].hex}25`, color: PRIORITY_CONFIG[selectedCard.priority].hex }}>
                        {PRIORITY_CONFIG[selectedCard.priority].icon} {PRIORITY_CONFIG[selectedCard.priority].label}
                      </div>
                      {assignee && <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">{assignee.emoji} {assignee.name}</div>}
                      {group && <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }}></div>{group.name}</div>}
                    </div>
                    {selectedCard.jiraLink && (
                      <a href={selectedCard.jiraLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 rounded-lg px-3 py-2">
                        🔗 Открыть в Jira
                      </a>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-gray-700">
                      <button onClick={() => { setEditingCard(selectedCard); setShowCardModal(true); setSelectedCard(null); }} className="flex-1 bg-gray-800 border border-gray-700 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">✏️ Редактировать</button>
                      <button onClick={() => { if (confirm(`Удалить карточку "${selectedCard.title}"?`)) { deleteCard(selectedCard.id); setSelectedCard(null); } }} className="flex-1 bg-red-500/10 border border-red-500/30 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">🗑️ Удалить</button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        cardTypes={data.settings.cardTypes}
        assignees={data.settings.assignees}
        groups={data.settings.groups}
        onAddCardType={addCardType}
        onUpdateCardType={updateCardType}
        onDeleteCardType={deleteCardType}
        onAddAssignee={addAssignee}
        onUpdateAssignee={updateAssignee}
        onDeleteAssignee={deleteAssignee}
        onAddGroup={addGroup}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
      />
    </div>
  );
}

export default App;
