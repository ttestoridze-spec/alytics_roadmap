import { useState, useRef } from 'react';
import { Card, CardType, Assignee, CardGroup, Status, Priority, ListGroupBy, STATUS_CONFIG, PRIORITY_CONFIG, VOLUME_UNITS } from '../types';
import { formatDate, daysBetween } from '../utils';

interface TaskListProps {
  cards: Card[];
  cardTypes: CardType[];
  assignees: Assignee[];
  groups: CardGroup[];
  groupBy: ListGroupBy;
  onGroupByChange: (groupBy: ListGroupBy) => void;
  onCardClick: (card: Card) => void;
  onReorder: (newOrder: Card[]) => void;
}

export function TaskList({
  cards,
  cardTypes,
  assignees,
  groups,
  groupBy,
  onGroupByChange,
  onCardClick,
  onReorder,
}: TaskListProps) {
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dragOverCard, setDragOverCard] = useState<Card | null>(null);

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
  };

  const handleDragOver = (e: React.DragEvent, card: Card) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCard(card);
  };

  const handleDragLeave = () => {
    setDragOverCard(null);
  };

  const handleDrop = (e: React.DragEvent, targetCard: Card) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }

    // Создаём новый порядок
    const newOrder = [...cards];
    const draggedIndex = newOrder.findIndex(c => c.id === draggedCard.id);
    const targetIndex = newOrder.findIndex(c => c.id === targetCard.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Удаляем перетаскиваемую карточку
    newOrder.splice(draggedIndex, 1);
    // Вставляем на новое место
    newOrder.splice(targetIndex, 0, draggedCard);

    onReorder(newOrder);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCard(null);
  };

  interface CardGroupItem {
    label: string;
    cards: Card[];
    color?: string;
  }

  // Группировка карточек
  const getGroupedCards = (): CardGroupItem[] => {
    const sortedCards = [...cards].sort((a, b) => a.order - b.order);

    if (groupBy === 'none') {
      return [{ label: 'Все задачи', cards: sortedCards }];
    }

    if (groupBy === 'priority') {
      const priorityOrder: Priority[] = ['critical', 'high', 'medium', 'low'];
      return priorityOrder.map(priority => ({
        label: `${PRIORITY_CONFIG[priority].icon} ${PRIORITY_CONFIG[priority].label}`,
        cards: sortedCards.filter(c => c.priority === priority),
        color: PRIORITY_CONFIG[priority].hex,
      })).filter(g => g.cards.length > 0);
    }

    if (groupBy === 'startDate') {
      const byMonth = new Map<string, Card[]>();
      sortedCards.forEach(card => {
        const date = new Date(card.startDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        if (!byMonth.has(key)) {
          byMonth.set(key, []);
        }
        byMonth.get(key)!.push(card);
      });

      return Array.from(byMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, cards]) => ({
          label: `📅 ${cards[0].startDate ? new Date(cards[0].startDate).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : key}`,
          cards,
        }));
    }

    if (groupBy === 'type') {
      const byType = new Map<string, Card[]>();
      sortedCards.forEach(card => {
        const type = cardTypes.find(t => t.id === card.typeId);
        const key = card.typeId;
        if (!byType.has(key)) {
          byType.set(key, []);
        }
        byType.get(key)!.push(card);
      });

      return Array.from(byType.entries()).map(([key, cards]) => {
        const type = cardTypes.find(t => t.id === key);
        return {
          label: `${type?.icon || '📦'} ${type?.name || 'Без типа'}`,
          cards,
          color: type?.color,
        };
      });
    }

    if (groupBy === 'status') {
      const statusOrder: Status[] = ['in_progress', 'planned', 'blocked', 'completed'];
      return statusOrder.map(status => ({
        label: `${STATUS_CONFIG[status].icon} ${STATUS_CONFIG[status].label}`,
        cards: sortedCards.filter(c => c.status === status),
      })).filter(g => g.cards.length > 0);
    }

    return [{ label: 'Все задачи', cards: sortedCards }];
  };

  const groupedCards = getGroupedCards();

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">📋 Список задач</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Перетаскивайте задачи для изменения приоритета • Группировка по категориям
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Группировка:</span>
          <select
            value={groupBy}
            onChange={e => onGroupByChange(e.target.value as ListGroupBy)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="none">Без группировки</option>
            <option value="priority">По приоритету</option>
            <option value="startDate">По дате начала</option>
            <option value="type">По типу</option>
            <option value="status">По статусу</option>
          </select>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {groupedCards.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 mb-2 px-2">
                {group.color && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }}></div>
                )}
                <h3 className="text-sm font-semibold text-gray-300">{group.label}</h3>
                <span className="text-xs text-gray-500">({group.cards.length})</span>
              </div>
            )}

            <div className="space-y-2">
              {group.cards.map(card => {
                const type = cardTypes.find(t => t.id === card.typeId);
                const assignee = assignees.find(a => a.id === card.assigneeId);
                const group = groups.find(g => g.id === card.groupId);
                const duration = daysBetween(card.startDate, card.endDate);
                const isDragging = draggedCard?.id === card.id;
                const isDragOver = dragOverCard?.id === card.id;

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={e => handleDragStart(e, card)}
                    onDragOver={e => handleDragOver(e, card)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, card)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick(card)}
                    className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-gray-600 transition-all cursor-pointer group relative overflow-hidden ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    } ${isDragOver ? 'border-purple-500 border-2' : ''}`}
                  >
                    {/* Priority stripe */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{
                        backgroundColor: card.priority === 'critical' ? '#ef4444' :
                          card.priority === 'high' ? '#f97316' :
                          card.priority === 'medium' ? '#3b82f6' : '#6b7280'
                      }}
                    ></div>

                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {type && (
                            <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: `${type.color}30` }}>
                              {type.icon}
                            </div>
                          )}
                          <h4 className="text-sm font-medium text-gray-200 group-hover:text-purple-300 transition-colors truncate">
                            {card.title}
                          </h4>
                        </div>

                        {group && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }}></div>
                            <span className="text-[10px] text-gray-500 truncate">{group.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span>{formatDate(card.startDate)}</span>
                          <span>→</span>
                          <span>{formatDate(card.endDate)}</span>
                          <span className="text-gray-600">({duration}д)</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
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
                            onClick={e => e.stopPropagation()}
                            className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors"
                          >
                            🔗 Jira
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Drag handle indicator */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600">
                      ⋮⋮
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>Нет задач для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
}
