import { RoadmapData } from './types';

export function exportToJSON(data: RoadmapData): void {
  try {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    link.download = `roadmap-alytics-backup-${dateStr}_${timeStr}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    throw new Error('Не удалось экспортировать данные');
  }
}

export function importFromJSON(file: File): Promise<RoadmapData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        if (!validateImportedData(parsedData)) {
          reject(new Error('Неверная структура данных в файле'));
          return;
        }

        const cleanData = {
          projectName: parsedData.projectName,
          projectDescription: parsedData.projectDescription,
          cards: parsedData.cards,
          settings: parsedData.settings,
        };

        resolve(cleanData as RoadmapData);
      } catch (error) {
        reject(new Error('Не удалось прочитать файл'));
      }
    };

    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

function validateImportedData(data: any): data is RoadmapData {
  if (!data || typeof data !== 'object') return false;
  if (!data.projectName || typeof data.projectName !== 'string') return false;
  if (!Array.isArray(data.cards)) return false;
  if (!data.settings || typeof data.settings !== 'object') return false;
  if (!Array.isArray(data.settings.cardTypes)) return false;
  if (!Array.isArray(data.settings.assignees)) return false;
  if (!Array.isArray(data.settings.groups)) return false;

  for (const card of data.cards) {
    if (!card.id || !card.title || !card.startDate || !card.endDate) return false;
    if (typeof card.volume !== 'number' || card.volume < 0) return false;
  }

  return true;
}
