import { useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseStoredProgress,
  type ChapterProgress,
  type ProgressMap,
} from "./progress";

/** Versioned so a future change of shape can migrate instead of misread. */
export const PROGRESS_STORAGE_KEY = "kurishimy:progress:v1";

interface ProgressState {
  /** False until the stored progress has been read from the device. */
  loaded: boolean;
  byChapter: ProgressMap;
}

let state: ProgressState = { loaded: false, byChapter: {} };
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: ProgressState) {
  state = next;
  listeners.forEach((listener) => listener());
}

/** Reads stored progress once; later calls reuse the same read. */
export function loadProgress(): Promise<void> {
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(PROGRESS_STORAGE_KEY)
      .then(parseStoredProgress)
      .catch((err) => {
        console.warn("Could not read saved progress:", err);
        return {} as ProgressMap;
      })
      .then((stored) => {
        // Anything saved while the read was in flight is newer than disk.
        setState({
          loaded: true,
          byChapter: { ...stored, ...state.byChapter },
        });
      });
  }
  return loadPromise;
}

export function getProgressState(): ProgressState {
  return state;
}

/** Updates memory immediately and writes to the device in the background. */
export function saveChapterProgress(
  chapterId: string,
  progress: ChapterProgress,
): void {
  const byChapter = { ...state.byChapter, [chapterId]: progress };
  setState({ ...state, byChapter });
  AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(byChapter)).catch(
    (err) => console.warn("Could not save progress:", err),
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Saved progress for every chapter; re-renders when any of it changes. */
export function useProgress(): ProgressState {
  useEffect(() => {
    loadProgress();
  }, []);
  return useSyncExternalStore(subscribe, getProgressState, getProgressState);
}

/** Test-only: forget everything held in memory. */
export function resetProgressStoreForTests() {
  state = { loaded: false, byChapter: {} };
  loadPromise = null;
  listeners.clear();
}
