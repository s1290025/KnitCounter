import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeName } from '../theme/themes';

const STORAGE_KEY = '@knit_counter_app_data';

export type Language = 'ja' | 'en';

export type HistoryType =
  | 'row'
  | 'stitch'
  | 'mark';

export type HistoryItem = {
  id: string;
  row: number;
  stitch: number;
  type: HistoryType;
};

export type CounterState = {
  row: number;
  stitch: number;
  history: HistoryItem[];
};

export type Project = {
  id: string;
  name: string;
  memo: string;

  row: number;
  stitch: number;

  history: HistoryItem[];
  undoStack: CounterState[];
};

export type AppData = {
  projects: Project[];
  language: Language;
  theme: ThemeName;
};

const defaultData: AppData = {
  projects: [],
  language: 'ja',
  theme: 'pink',
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(
      STORAGE_KEY
    );

    if (!raw) {
      return defaultData;
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...defaultData,
      ...parsed,
    };
  } catch (error) {
    console.error(
      'loadAppData error:',
      error
    );

    return defaultData;
  }
}

export async function saveAppData(
  data: AppData
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error(
      'saveAppData error:',
      error
    );

    throw error;
  }
}

export async function getProjectById(
  id: string
): Promise<Project | null> {
  const data =
    await loadAppData();

  return (
    data.projects.find(
      (project) =>
        project.id === id
    ) ?? null
  );
}

export async function updateProject(
  updatedProject: Project
): Promise<void> {
  const data =
    await loadAppData();

  const projects =
    data.projects.map(
      (project) =>
        project.id ===
        updatedProject.id
          ? updatedProject
          : project
    );

  await saveAppData({
    ...data,
    projects,
  });
}