import { useState, useMemo } from 'react';
import { Card, ZoomLevel, Status, STATUS_CONFIG, VOLUME_UNITS } from './types';
import { useRoadmapData } from './useRoadmapData';
import { GanttChart } from './components/GanttChart';
import { CardForm } from './components/CardForm';
import { SettingsModal } from './components/SettingsModal';
import { formatDate, daysBetween } from './utils';

function App() {
  const {
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
  } = useRoadmapData();

  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  // Modal states
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Filtered cards
  const filteredCards = useMemo(() => {
    let result = data.cards;
    if (filterType !== 'all') {
      result = result.filter(c => c.typeId === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }
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
      totalVolume: cards.reduce((sum, c) => sum + c.volume, 0),
    };
  }, [data.cards]);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCardSubmit = (cardData: Omit<Card, 'id'>) => {
    if (editingCard) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    setShowCardModal(false);
    setEditingCard(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {data.projectName}
                </h1>
                <p className="text-xs text-gray-500">{data.projectDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                ⚙️ Настройки
              </button>
              <button
                onClick={() => { setEditingCard(null); setShowCardModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span>+</span> Новая карточка
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters & Stats bar */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-1">Тип:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-md text-xs transition-all ${filterType === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
              >
                Все
              </button>
              {data.settings.cardTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(filterType === type.id ? 'all' : type.id)}
                  className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${filterType === type.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }}></span>
                  {type.name}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-700"></div>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-1 rounded-md text-xs transition-all ${filterStatus === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
              >
                Все
              </button>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = key === 'completed' ? stats.completed
                  : key === 'in_progress' ? stats.inProgress
                  : key === 'planned' ? stats.planned
                  : stats.blocked;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(filterStatus === key ? 'all' : key as Status)}
                    className={`px-2 py-1 rounded-md text-xs transition-all flex items-center gap-1 ${filterStatus === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                  >
                    <span>{config.icon}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1"></div>

            {/* Zoom */}
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
            <div className="text-xs text-gray-500 mb-1">Заблокировано</div>
            <div className="text-2xl font-bold text-red-400">{stats.blocked}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Прогресс</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Временная шкала</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Перетаскивайте карточки для перемещения • Тяните за края для изменения длительности • Клик для деталей
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500/60"></div>
                <span>Сегодня</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">◀ ▶</span>
                <span>Resize</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {data.cards.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Роадмап пуст</h3>
                <p className="text-gray-500 mb-6">Создайте первую карточку для начала планирования</p>
                <button
                  onClick={() => { setEditingCard(null); setShowCardModal(true); }}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  + Создать карточку
                </button>
              </div>
            ) : (
              <GanttChart
                cards={filteredCards}
                cardTypes={data.settings.cardTypes}
                assignees={data.settings.assignees}
                groups={data.settings.groups}
                zoom={zoom}
                onCardClick={handleCardClick}
                onCardUpdate={updateCard}
                collapsedGroups={collapsedGroups}
                toggleGroupCollapse={toggleGroupCollapse}
              />
            )}
          </div>
        </div>

        {/* Cards list */}
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map(card => {
            const type = data.settings.cardTypes.find(t => t.id === card.typeId);
            const assignee = data.settings.assignees.find(a => a.id === card.assigneeId);
            const group = data.settings.groups.find(g => g.id === card.groupId);
            const duration = daysBetween(card.startDate, card.endDate);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {type && (
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ backgroundColor: `${type.color}30` }}>
                        {type.icon}
                      </div>
                    )}
                    <h3 className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                      {card.title}
                    </h3>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_CONFIG[card.status].color} bg-gray-800`}>
                    {STATUS_CONFIG[card.status].icon}
                  </span>
                </div>

                {group && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <span className="text-[10px] text-gray-500 truncate">{group.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                  <span>{formatDate(card.startDate)}</span>
                  <span>→</span>
                  <span>{formatDate(card.endDate)}</span>
                  <span className="text-gray-600">({duration}д)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                      {card.volume} {VOLUME_UNITS[card.volumeUnit].short}
                    </span>
                    {assignee && (
                      <span className="text-xs text-gray-400" title={assignee.name}>
                        {assignee.emoji}
                      </span>
                    )}
                  </div>
                  {card.jiraLink && (
                    <a
                      href={card.jiraLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      🔗 Jira
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-600">Данные сохраняются локально в браузере</p>
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

      {/* Card Form Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowCardModal(false); setEditingCard(null); }}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">{editingCard ? 'Редактировать карточку' : 'Новая карточка'}</h3>
              <button
                onClick={() => { setShowCardModal(false); setEditingCard(null); }}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <CardForm
                onSubmit={handleCardSubmit}
                onCancel={() => { setShowCardModal(false); setEditingCard(null); }}
                cardTypes={data.settings.cardTypes}
                assignees={data.settings.assignees}
                groups={data.settings.groups}
                initialData={editingCard || undefined}
              />
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
                      {type && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${type.color}30` }}>
                          {type.icon}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedCard.title}</h3>
                        {type && <p className="text-xs text-gray-500">{type.name}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {selectedCard.description && (
                      <p className="text-gray-400 text-sm">{selectedCard.description}</p>
                    )}

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
                      {assignee && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                          {assignee.emoji} {assignee.name}
                        </div>
                      )}
                      {group && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }}></div>
                          {group.name}
                        </div>
                      )}
                    </div>

                    {selectedCard.jiraLink && (
                      <a
                        href={selectedCard.jiraLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 rounded-lg px-3 py-2"
                      >
                        🔗 Открыть в Jira
                        <span className="text-xs text-gray-500 truncate">{selectedCard.jiraLink}</span>
                      </a>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => {
                          setEditingCard(selectedCard);
                          setShowCardModal(true);
                          setSelectedCard(null);
                        }}
                        className="flex-1 bg-gray-800 border border-gray-700 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить карточку "${selectedCard.title}"?`)) {
                            deleteCard(selectedCard.id);
                            setSelectedCard(null);
                          }
                        }}
                        className="flex-1 bg-red-500/10 border border-red-500/30 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Settings Modal */}
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
