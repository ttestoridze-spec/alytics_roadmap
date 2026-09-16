import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardType, Assignee, CardGroup, ZoomLevel, STATUS_CONFIG, VOLUME_UNITS } from '../types';
import {
  getTimelineTicks,
  getPositionForDate,
  getWidthForRange,
  formatDateShort,
  addDays,
  formatMonthYear,
} from '../utils';

interface GanttChartProps {
  cards: Card[];
  cardTypes: CardType[];
  assignees: Assignee[];
  groups: CardGroup[];
  zoom: ZoomLevel;
  viewStart: Date;
  viewEnd: Date;
  onViewChange: (start: Date, end: Date) => void;
  onCardClick: (card: Card) => void;
  onCardUpdate: (id: string, updates: Partial<Card>) => void;
  collapsedGroups: Set<string>;
  toggleGroupCollapse: (groupId: string) => void;
}

type DragMode = 'move' | 'resize-left' | 'resize-right' | null;

export function GanttChart({
  cards,
  cardTypes,
  assignees,
  groups,
  zoom,
  viewStart,
  viewEnd,
  onViewChange,
  onCardClick,
  onCardUpdate,
  collapsedGroups,
  toggleGroupCollapse,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; card: Card } | null>(null);

  const [dragState, setDragState] = useState<{
    mode: DragMode;
    cardId: string;
    startX: number;
    originalStart: string;
    originalEnd: string;
  } | null>(null);

  const totalDays = useMemo(() => {
    return (viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
  }, [viewStart, viewEnd]);

  const ticks = useMemo(() => getTimelineTicks(viewStart, viewEnd, zoom), [viewStart, viewEnd, zoom]);

  const rows = useMemo(() => {
    const result: ({ type: 'group'; group: CardGroup } | { type: 'card'; card: Card })[] = [];
    const groupedCards = new Map<string, Card[]>();
    const ungroupedCards: Card[] = [];

    cards.forEach(card => {
      if (card.groupId) {
        const list = groupedCards.get(card.groupId) || [];
        list.push(card);
        groupedCards.set(card.groupId, list);
      } else {
        ungroupedCards.push(card);
      }
    });

    groups.forEach(group => {
      result.push({ type: 'group', group });
      if (!collapsedGroups.has(group.id)) {
        const groupCards = groupedCards.get(group.id) || [];
        groupCards.forEach(card => result.push({ type: 'card', card }));
      }
    });

    ungroupedCards.forEach(card => result.push({ type: 'card', card }));
    return result;
  }, [cards, groups, collapsedGroups]);

  const today = new Date();
  const todayPosition = getPositionForDate(today, viewStart, totalDays);

  const getTypeColor = (typeId: string) => {
    return cardTypes.find(t => t.id === typeId)?.color || '#6b7280';
  };

  // Колёсиком мыши — paging по времени
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Шаг: 1 неделя при обычном скролле, 1 день при shift
    const stepDays = e.shiftKey ? 1 : 7;
    const direction = e.deltaY > 0 ? 1 : -1;
    
    const newStart = addDays(viewStart, stepDays * direction);
    const newEnd = addDays(viewEnd, stepDays * direction);
    onViewChange(newStart, newEnd);
  };

  // Drag handlers для карточек
  const handleMouseDown = useCallback((e: React.MouseEvent, cardId: string, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    setDragState({
      mode,
      cardId,
      startX: e.clientX,
      originalStart: card.startDate,
      originalEnd: card.endDate,
    });
  }, [cards]);

  useEffect(() => {
    if (!dragState || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pixelsPerDay = containerRect.width / totalDays;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaX / pixelsPerDay);

      if (deltaDays === 0) return;

      const origStart = new Date(dragState.originalStart);
      const origEnd = new Date(dragState.originalEnd);

      let newStart = origStart;
      let newEnd = origEnd;

      if (dragState.mode === 'move') {
        newStart = new Date(origStart);
        newStart.setDate(newStart.getDate() + deltaDays);
        newEnd = new Date(origEnd);
        newEnd.setDate(newEnd.getDate() + deltaDays);
      } else if (dragState.mode === 'resize-right') {
        newEnd = new Date(origEnd);
        newEnd.setDate(newEnd.getDate() + deltaDays);
        if (newEnd <= newStart) {
          newEnd = new Date(newStart);
          newEnd.setDate(newEnd.getDate() + 1);
        }
      } else if (dragState.mode === 'resize-left') {
        newStart = new Date(origStart);
        newStart.setDate(newStart.getDate() + deltaDays);
        if (newStart >= newEnd) {
          newStart = new Date(newEnd);
          newStart.setDate(newStart.getDate() - 1);
        }
      }

      onCardUpdate(dragState.cardId, {
        startDate: newStart.toISOString().split('T')[0],
        endDate: newEnd.toISOString().split('T')[0],
      });
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, totalDays, onCardUpdate]);

  const handleCardHover = (e: React.MouseEvent, card: Card) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 60,
        card,
      });
    }
    setHoveredCard(card.id);
  };

  const handleCardLeave = () => {
    setTooltip(null);
    setHoveredCard(null);
  };

  const ROW_HEIGHT = 44;
  const HEADER_HEIGHT = 60;

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Tooltip */}
      {tooltip && !dragState && (
        <div
          className="absolute z-30 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          <div className="font-medium mb-1">{tooltip.card.title}</div>
          <div className="text-gray-400">
            {formatDateShort(tooltip.card.startDate)} — {formatDateShort(tooltip.card.endDate)}
          </div>
          <div className="text-gray-400 mt-1">
            {tooltip.card.volume} {VOLUME_UNITS[tooltip.card.volumeUnit].short} • {STATUS_CONFIG[tooltip.card.status].icon} {STATUS_CONFIG[tooltip.card.status].label}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-500">Приоритет:</span>
            <span className={`text-[10px] font-medium ${
              tooltip.card.priority === 'critical' ? 'text-red-400' :
              tooltip.card.priority === 'high' ? 'text-orange-400' :
              tooltip.card.priority === 'medium' ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {tooltip.card.priority === 'critical' ? '🔴 Критический' :
               tooltip.card.priority === 'high' ? '🟠 Высокий' :
               tooltip.card.priority === 'medium' ? '🔵 Средний' : '⚪ Низкий'}
            </span>
          </div>
          <div className="text-gray-500 mt-1 text-[10px]">Перетащите для перемещения • Потяните за края для изменения длительности</div>
        </div>
      )}

      <div
        className="overflow-hidden"
        onWheel={handleWheel}
      >
        <div style={{ width: '100%' }}>
          {/* Time header */}
          <div className="relative border-b border-gray-700/50" style={{ height: HEADER_HEIGHT }}>
            <div className="absolute top-0 left-0 right-0 h-8 flex items-center">
              {ticks.filter(t => t.isMajor).map((tick, i) => {
                const pos = getPositionForDate(tick.date, viewStart, totalDays);
                return (
                  <div
                    key={i}
                    className="absolute text-xs font-semibold text-gray-400"
                    style={{ left: `${pos}%`, transform: 'translateX(4px)' }}
                  >
                    {tick.label}
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end pb-2">
              {ticks.map((tick, i) => {
                const pos = getPositionForDate(tick.date, viewStart, totalDays);
                return (
                  <div
                    key={i}
                    className={`absolute text-[10px] ${tick.isMajor ? 'text-gray-400 font-medium' : 'text-gray-600'}`}
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                  >
                    {tick.label}
                  </div>
                );
              })}
            </div>
            {ticks.map((tick, i) => {
              const pos = getPositionForDate(tick.date, viewStart, totalDays);
              return (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 ${tick.isMajor ? 'border-l border-gray-700/30' : 'border-l border-gray-800/30'}`}
                  style={{ left: `${pos}%` }}
                />
              );
            })}
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Today line */}
            {todayPosition >= 0 && todayPosition <= 100 && (
              <div
                className="absolute top-0 z-20 border-l-2 border-red-500/60 pointer-events-none"
                style={{ left: `${todayPosition}%`, height: rows.length * ROW_HEIGHT }}
              >
                <div className="absolute -top-1 -left-[5px] w-[10px] h-[10px] bg-red-500 rounded-full"></div>
                <div className="absolute -top-5 -left-6 text-[10px] text-red-400 font-medium whitespace-nowrap">
                  Сегодня
                </div>
              </div>
            )}

            {/* Grid lines */}
            {ticks.map((tick, i) => {
              const pos = getPositionForDate(tick.date, viewStart, totalDays);
              return (
                <div
                  key={i}
                  className={`absolute top-0 ${tick.isMajor ? 'border-l border-gray-700/20' : 'border-l border-gray-800/20'} pointer-events-none`}
                  style={{ left: `${pos}%`, height: rows.length * ROW_HEIGHT }}
                />
              );
            })}

            {rows.map((row, rowIndex) => {
              if (row.type === 'group') {
                const { group } = row;
                const isCollapsed = collapsedGroups.has(group.id);
                return (
                  <div
                    key={group.id}
                    className="relative flex items-center"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="absolute inset-0 bg-gray-800/20"></div>
                    <div className="relative flex items-center gap-2 px-3 z-10">
                      <button
                        onClick={() => toggleGroupCollapse(group.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <span className={`text-xs transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                      </button>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }}></div>
                      <span className="text-sm font-medium text-gray-200">{group.name}</span>
                    </div>
                  </div>
                );
              } else {
                const { card } = row;
                const left = getPositionForDate(new Date(card.startDate), viewStart, totalDays);
                const width = getWidthForRange(card.startDate, card.endDate, viewStart, totalDays);
                const color = getTypeColor(card.typeId);
                const isHovered = hoveredCard === card.id;
                const isDragging = dragState?.cardId === card.id;
                const statusConfig = STATUS_CONFIG[card.status];
                const assignee = assignees.find(a => a.id === card.assigneeId);

                // Не показываем карточки, которые полностью за пределами видимой области
                if (left + width < 0 || left > 100) return null;

                return (
                  <div
                    key={card.id}
                    className="relative flex items-center"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className={`absolute inset-0 ${rowIndex % 2 === 0 ? 'bg-gray-900/20' : 'bg-transparent'} hover:bg-gray-800/20 transition-colors`}></div>

                    {/* Card bar */}
                    <div
                      className={`gantt-card absolute h-8 rounded-lg flex items-center overflow-hidden transition-shadow ${
                        isDragging ? 'opacity-90 shadow-2xl z-30' : isHovered ? 'shadow-lg z-20' : 'z-10'
                      } ${dragState?.mode === 'move' ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        left: `${Math.max(0, left)}%`,
                        width: `${Math.min(width, 100 - Math.max(0, left))}%`,
                        backgroundColor: `${color}25`,
                        border: `1.5px solid ${color}90`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, card.id, 'move')}
                      onClick={(e) => {
                        if (!dragState) {
                          e.stopPropagation();
                          onCardClick(card);
                        }
                      }}
                      onMouseEnter={(e) => handleCardHover(e, card)}
                      onMouseLeave={handleCardLeave}
                    >
                      {/* Status indicator (left) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{
                          backgroundColor: statusConfig.bg.includes('green') ? '#22c55e' :
                            statusConfig.bg.includes('yellow') ? '#eab308' :
                            statusConfig.bg.includes('red') ? '#ef4444' : '#3b82f6'
                        }}
                      ></div>

                      {/* Priority indicator (top) */}
                      <div
                        className="absolute left-1 right-1 top-0 h-0.5 rounded-full"
                        style={{
                          backgroundColor: card.priority === 'critical' ? '#ef4444' :
                            card.priority === 'high' ? '#f97316' :
                            card.priority === 'medium' ? '#3b82f6' : '#6b7280'
                        }}
                      ></div>

                      {/* Content */}
                      <div className="flex items-center gap-1.5 px-2 pl-3 w-full overflow-hidden">
                        <span className="text-[11px] text-white truncate flex-1 font-medium">
                          {card.title}
                        </span>
                        {assignee && (
                          <span className="text-[10px] flex-shrink-0" title={assignee.name}>
                            {assignee.emoji}
                          </span>
                        )}
                        {card.jiraLink && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0" title="Jira">🔗</span>
                        )}
                      </div>

                      {/* Left resize handle */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, card.id, 'resize-left')}
                        onClick={(e) => e.stopPropagation()}
                      ></div>

                      {/* Right resize handle */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, card.id, 'resize-right')}
                        onClick={(e) => e.stopPropagation()}
                      ></div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
