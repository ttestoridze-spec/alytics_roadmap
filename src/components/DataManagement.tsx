import { useRef, useState } from 'react';
import { RoadmapData } from '../types';
import { exportToJSON, importFromJSON } from '../dataExport';

interface DataManagementProps {
  data: RoadmapData;
  onImport: (data: RoadmapData) => void;
}

export function DataManagement({ data, onImport }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    try {
      exportToJSON(data);
      showMessage('success', '✅ Данные успешно экспортированы!');
    } catch (error) {
      showMessage('error', '❌ Ошибка при экспорте данных');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await importFromJSON(file);
      
      if (confirm(
        `Импортировать данные из файла?\n\n` +
        `📋 Карточек: ${importedData.cards.length}\n` +
        `🏷️ Типов: ${importedData.settings.cardTypes.length}\n` +
        `👥 Ответственных: ${importedData.settings.assignees.length}\n` +
        `📁 Групп: ${importedData.settings.groups.length}\n\n` +
        `⚠️ Текущие данные будут заменены!`
      )) {
        onImport(importedData);
        showMessage('success', '✅ Данные успешно импортированы!');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : '❌ Ошибка при импорте');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
        title="Управление данными"
      >
        💾 Данные
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-semibold text-white">💾 Управление данными</h3>
              <p className="text-xs text-gray-500 mt-0.5">Экспорт и импорт JSON файлов</p>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">📤</div>
                <div>
                  <div className="text-sm font-medium text-white">Экспорт в JSON</div>
                  <div className="text-xs text-gray-500">Скачать все данные как файл</div>
                </div>
              </button>

              <button
                onClick={handleImportClick}
                disabled={importing}
                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 text-left transition-colors group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">📥</div>
                <div>
                  <div className="text-sm font-medium text-white">{importing ? 'Импорт...' : 'Импорт из JSON'}</div>
                  <div className="text-xs text-gray-500">Загрузить данные из файла</div>
                </div>
              </button>

              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/30">
              <p className="text-[10px] text-gray-600 leading-relaxed">💡 Данные автоматически сохраняются в браузере. Используйте экспорт для резервного копирования.</p>
            </div>
          </div>
        </>
      )}

      {message && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}
    </div>
  );
}
