import { useState } from 'react';
import { CardType, Assignee, CardGroup, TYPE_COLORS } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTypes: CardType[];
  assignees: Assignee[];
  groups: CardGroup[];
  onAddCardType: (type: Omit<CardType, 'id'>) => void;
  onUpdateCardType: (id: string, updates: Partial<CardType>) => void;
  onDeleteCardType: (id: string) => void;
  onAddAssignee: (assignee: Omit<Assignee, 'id'>) => void;
  onUpdateAssignee: (id: string, updates: Partial<Assignee>) => void;
  onDeleteAssignee: (id: string) => void;
  onAddGroup: (group: Omit<CardGroup, 'id'>) => void;
  onUpdateGroup: (id: string, updates: Partial<CardGroup>) => void;
  onDeleteGroup: (id: string) => void;
}

type Tab = 'types' | 'assignees' | 'groups';

export function SettingsModal({
  isOpen,
  onClose,
  cardTypes,
  assignees,
  groups,
  onAddCardType,
  onUpdateCardType,
  onDeleteCardType,
  onAddAssignee,
  onUpdateAssignee,
  onDeleteAssignee,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>('types');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingAssigneeId, setEditingAssigneeId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // New item forms
  const [newType, setNewType] = useState({ name: '', color: TYPE_COLORS[0], icon: '📦' });
  const [newAssignee, setNewAssignee] = useState({ name: '', role: '', emoji: '👤' });
  const [newGroup, setNewGroup] = useState({ name: '', color: TYPE_COLORS[0] });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-bold text-white">⚙️ Настройки</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 px-6 flex gap-1 flex-shrink-0">
          {[
            { id: 'types' as Tab, label: '🏷️ Типы карточек', count: cardTypes.length },
            { id: 'assignees' as Tab, label: '👥 Ответственные', count: assignees.length },
            { id: 'groups' as Tab, label: '📁 Группы', count: groups.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label} <span className="text-xs text-gray-600">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'types' && (
            <div className="space-y-3">
              {/* Existing types */}
              {cardTypes.map(type => (
                <div key={type.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 group">
                  {editingTypeId === type.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={type.icon}
                        onChange={e => onUpdateCardType(type.id, { icon: e.target.value })}
                        className="w-10 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                      />
                      <input
                        type="text"
                        value={type.name}
                        onChange={e => onUpdateCardType(type.id, { name: e.target.value })}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                      />
                      <div className="flex gap-1">
                        {TYPE_COLORS.slice(0, 6).map(color => (
                          <button
                            key={color}
                            onClick={() => onUpdateCardType(type.id, { color })}
                            className={`w-5 h-5 rounded ${type.color === color ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setEditingTypeId(null)}
                        className="text-green-400 hover:text-green-300 text-sm px-2"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${type.color}30` }}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{type.name}</div>
                      </div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }}></div>
                      <button
                        onClick={() => setEditingTypeId(type.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all text-sm px-2"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить тип "${type.name}"?`)) onDeleteCardType(type.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-sm px-2"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add new type */}
              <div className="flex items-center gap-2 bg-gray-800/30 border border-dashed border-gray-700 rounded-lg p-3">
                <input
                  type="text"
                  value={newType.icon}
                  onChange={e => setNewType({ ...newType, icon: e.target.value })}
                  className="w-10 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                  placeholder="📦"
                />
                <input
                  type="text"
                  value={newType.name}
                  onChange={e => setNewType({ ...newType, name: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white placeholder-gray-500"
                  placeholder="Название типа"
                />
                <div className="flex gap-1">
                  {TYPE_COLORS.slice(0, 4).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewType({ ...newType, color })}
                      className={`w-5 h-5 rounded ${newType.color === color ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (newType.name.trim()) {
                      onAddCardType(newType);
                      setNewType({ name: '', color: TYPE_COLORS[cardTypes.length % TYPE_COLORS.length], icon: '📦' });
                    }
                  }}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-500/30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {tab === 'assignees' && (
            <div className="space-y-3">
              {assignees.map(assignee => (
                <div key={assignee.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 group">
                  {editingAssigneeId === assignee.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={assignee.emoji}
                        onChange={e => onUpdateAssignee(assignee.id, { emoji: e.target.value })}
                        className="w-10 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                      />
                      <input
                        type="text"
                        value={assignee.name}
                        onChange={e => onUpdateAssignee(assignee.id, { name: e.target.value })}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                        placeholder="Имя"
                      />
                      <input
                        type="text"
                        value={assignee.role}
                        onChange={e => onUpdateAssignee(assignee.id, { role: e.target.value })}
                        className="w-32 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                        placeholder="Роль"
                      />
                      <button
                        onClick={() => setEditingAssigneeId(null)}
                        className="text-green-400 hover:text-green-300 text-sm px-2"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">
                        {assignee.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{assignee.name}</div>
                        <div className="text-xs text-gray-500">{assignee.role}</div>
                      </div>
                      <button
                        onClick={() => setEditingAssigneeId(assignee.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all text-sm px-2"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить "${assignee.name}"?`)) onDeleteAssignee(assignee.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-sm px-2"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2 bg-gray-800/30 border border-dashed border-gray-700 rounded-lg p-3">
                <input
                  type="text"
                  value={newAssignee.emoji}
                  onChange={e => setNewAssignee({ ...newAssignee, emoji: e.target.value })}
                  className="w-10 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                  placeholder="👤"
                />
                <input
                  type="text"
                  value={newAssignee.name}
                  onChange={e => setNewAssignee({ ...newAssignee, name: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white placeholder-gray-500"
                  placeholder="Имя / Команда"
                />
                <input
                  type="text"
                  value={newAssignee.role}
                  onChange={e => setNewAssignee({ ...newAssignee, role: e.target.value })}
                  className="w-32 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white placeholder-gray-500"
                  placeholder="Роль"
                />
                <button
                  onClick={() => {
                    if (newAssignee.name.trim()) {
                      onAddAssignee(newAssignee);
                      setNewAssignee({ name: '', role: '', emoji: '👤' });
                    }
                  }}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-500/30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {tab === 'groups' && (
            <div className="space-y-3">
              {groups.map(group => (
                <div key={group.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 group">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={group.name}
                        onChange={e => onUpdateGroup(group.id, { name: e.target.value })}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                      />
                      <div className="flex gap-1">
                        {TYPE_COLORS.slice(0, 6).map(color => (
                          <button
                            key={color}
                            onClick={() => onUpdateGroup(group.id, { color })}
                            className={`w-5 h-5 rounded ${group.color === color ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setEditingGroupId(null)}
                        className="text-green-400 hover:text-green-300 text-sm px-2"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                      <div className="flex-1 text-sm text-white">{group.name}</div>
                      <button
                        onClick={() => setEditingGroupId(group.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all text-sm px-2"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить группу "${group.name}"?`)) onDeleteGroup(group.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all text-sm px-2"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2 bg-gray-800/30 border border-dashed border-gray-700 rounded-lg p-3">
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white placeholder-gray-500"
                  placeholder="Название группы (можно с эмодзи)"
                />
                <div className="flex gap-1">
                  {TYPE_COLORS.slice(0, 4).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewGroup({ ...newGroup, color })}
                      className={`w-5 h-5 rounded ${newGroup.color === color ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (newGroup.name.trim()) {
                      onAddGroup(newGroup);
                      setNewGroup({ name: '', color: TYPE_COLORS[groups.length % TYPE_COLORS.length] });
                    }
                  }}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-500/30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
