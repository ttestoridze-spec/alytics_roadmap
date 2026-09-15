import { useMemo, useRef, useState } from 'react';
import { Epic, Story, ZoomLevel, STATUS_CONFIG } from '../types';
import {
  getTimelineRange,
  getTimelineTicks,
  getPositionForDate,
  getWidthForRange,
  formatDateShort,
} from '../utils';

interface GanttChartProps {
  epics: Epic[];
  zoom: ZoomLevel;
  onEpicClick: (epic: Epic) => void;
  onStoryClick: (epic: Epic, story: Story) => void;
  collapsedEpics: Set<string>;
  toggleEpicCollapse: (epicId: string) => void;
}

export function GanttChart({ epics, zoom, onEpicClick, onStoryClick, collapsedEpics, toggleEpicCollapse }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const { minDate, maxDate } = useMemo(() => getTimelineRange(epics), [epics]);
  const totalDays = useMemo(() => {
    return (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  }, [minDate, maxDate]);

  const ticks = useMemo(() => getTimelineTicks(minDate, maxDate, zoom), [minDate, maxDate, zoom]);

  // Calculate rows: each epic gets 1 row, plus collapsed stories get additional rows
  const rows = useMemo(() => {
    const result: { type: 'epic'; epic: Epic }[] | { type: 'epic'; epic: Epic }[] = [];
    const rows: ({ type: 'epic'; epic: Epic } | { type: 'story'; epic: Epic; story: Story })[] = [];

    epics.forEach(epic => {
      rows.push({ type: 'epic', epic });
      if (!collapsedEpics.has(epic.id)) {
        epic.stories.forEach(story => {
          rows.push({ type: 'story', epic, story });
        });
      }
    });

    return rows;
  }, [epics, collapsedEpics]);

  const today = new Date();
  const todayPosition = getPositionForDate(today, minDate, totalDays);

  const handleBarHover = (e: React.MouseEvent, content: string, id: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40,
        content,
      });
    }
    setHoveredItem(id);
  };

  const handleBarLeave = () => {
    setTooltip(null);
    setHoveredItem(null);
  };

  const ROW_HEIGHT = 44;
  const HEADER_HEIGHT = 60;

  return (
    <div className="relative" ref={containerRef}>
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-30 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          {tooltip.content}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[800px]" style={{ width: '100%' }}>
          {/* Time header */}
          <div className="relative border-b border-gray-700/50" style={{ height: HEADER_HEIGHT }}>
            {/* Month/period labels */}
            <div className="absolute top-0 left-0 right-0 h-8 flex items-center">
              {ticks.filter(t => t.isMajor).map((tick, i) => {
                const pos = getPositionForDate(tick.date, minDate, totalDays);
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
            {/* Tick labels */}
            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end pb-2">
              {ticks.map((tick, i) => {
                const pos = getPositionForDate(tick.date, minDate, totalDays);
                return (
                  <div
                    key={i}
                    className={`absolute text-[10px] ${tick.isMajor ? 'text-gray-400 font-medium' : 'text-gray-600'}`}
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                  >
                    {zoom === 'day' ? tick.label : tick.label}
                  </div>
                );
              })}
            </div>
            {/* Grid lines */}
            {ticks.map((tick, i) => {
              const pos = getPositionForDate(tick.date, minDate, totalDays);
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
                className="absolute top-0 bottom-0 z-20 border-l-2 border-red-500/60"
                style={{ left: `${todayPosition}%` }}
              >
                <div className="absolute -top-1 -left-[5px] w-[10px] h-[10px] bg-red-500 rounded-full"></div>
                <div className="absolute -top-5 -left-6 text-[10px] text-red-400 font-medium whitespace-nowrap">
                  Сегодня
                </div>
              </div>
            )}

            {/* Grid lines for rows */}
            {ticks.map((tick, i) => {
              const pos = getPositionForDate(tick.date, minDate, totalDays);
              return (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 ${tick.isMajor ? 'border-l border-gray-700/20' : 'border-l border-gray-800/20'}`}
                  style={{ left: `${pos}%`, height: rows.length * ROW_HEIGHT }}
                />
              );
            })}

            {rows.map((row, rowIndex) => {
              if (row.type === 'epic') {
                const { epic } = row;
                const left = getPositionForDate(new Date(epic.startDate), minDate, totalDays);
                const width = getWidthForRange(epic.startDate, epic.endDate, minDate, totalDays);
                const isCollapsed = collapsedEpics.has(epic.id);
                const isHovered = hoveredItem === epic.id;

                return (
                  <div
                    key={epic.id}
                    className="relative flex items-center group"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Row background */}
                    <div className={`absolute inset-0 ${rowIndex % 2 === 0 ? 'bg-gray-900/30' : 'bg-transparent'} group-hover:bg-gray-800/20 transition-colors`}></div>

                    {/* Epic bar */}
                    <div
                      className={`absolute h-8 rounded-lg cursor-pointer transition-all duration-200 flex items-center px-3 overflow-hidden ${
                        isHovered ? 'shadow-lg scale-[1.02]' : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 2)}%`,
                        backgroundColor: `${epic.color}30`,
                        border: `1.5px solid ${epic.color}80`,
                        zIndex: 10,
                      }}
                      onClick={() => onEpicClick(epic)}
                      onMouseEnter={(e) => handleBarHover(e, `${epic.title} | ${formatDateShort(epic.startDate)} — ${formatDateShort(epic.endDate)}`, epic.id)}
                      onMouseLeave={handleBarLeave}
                    >
                      {/* Progress indicator */}
                      <div
                        className="absolute left-0 top-0 bottom-0 rounded-lg opacity-30"
                        style={{
                          width: `${(epic.stories.filter(s => s.status === 'completed').length / Math.max(epic.stories.length, 1)) * 100}%`,
                          backgroundColor: epic.color,
                        }}
                      ></div>
                      <span className="relative text-xs font-medium text-white truncate">
                        {epic.title}
                      </span>
                    </div>

                    {/* Collapse toggle */}
                    <button
                      onClick={() => toggleEpicCollapse(epic.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
                      title={isCollapsed ? 'Развернуть' : 'Свернуть'}
                    >
                      <span className={`text-xs transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                    </button>
                  </div>
                );
              } else {
                const { epic, story } = row;
                const left = getPositionForDate(new Date(story.startDate), minDate, totalDays);
                const width = getWidthForRange(story.startDate, story.endDate, minDate, totalDays);
                const isHovered = hoveredItem === story.id;
                const statusConfig = STATUS_CONFIG[story.status];

                return (
                  <div
                    key={story.id}
                    className="relative flex items-center group"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Row background */}
                    <div className={`absolute inset-0 ${rowIndex % 2 === 0 ? 'bg-gray-900/30' : 'bg-transparent'} group-hover:bg-gray-800/20 transition-colors`}></div>

                    {/* Story bar */}
                    <div
                      className={`absolute h-6 rounded-md cursor-pointer transition-all duration-200 flex items-center px-2 overflow-hidden ${
                        isHovered ? 'shadow-lg scale-[1.03]' : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 1.5)}%`,
                        backgroundColor: `${epic.color}20`,
                        border: `1px solid ${epic.color}50`,
                        zIndex: 10,
                      }}
                      onClick={() => onStoryClick(epic, story)}
                      onMouseEnter={(e) => handleBarHover(e, `${story.title} | ${statusConfig.icon} ${statusConfig.label} | ${formatDateShort(story.startDate)} — ${formatDateShort(story.endDate)}`, story.id)}
                      onMouseLeave={handleBarLeave}
                    >
                      {/* Status indicator */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                        style={{ backgroundColor: statusConfig.bg.replace('bg-', '').includes('green') ? '#22c55e' : statusConfig.bg.includes('yellow') ? '#eab308' : statusConfig.bg.includes('red') ? '#ef4444' : '#3b82f6' }}
                      ></div>
                      <span className="relative text-[11px] text-gray-300 truncate pl-2">
                        {story.title}
                      </span>
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
