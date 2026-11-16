import { useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_PLAYBACK_RATE,
  parseStoredPlaybackRate,
  type PlaybackRate,
} from "./playbackRate";

/** Versioned so a future change of shape can migrate instead of misread. */
export const PLAYBACK_RATE_STORAGE_KEY = "kurishimy:playbackRate:v1";

// One speed for the whole app, not one per chapter: a learner who slows the
// narration down wants every chapter slow.
let rate: PlaybackRate = DEFAULT_PLAYBACK_RATE;
/** True once the user has picked a speed in this session. */
let changed = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setRate(next: PlaybackRate) {
  if (next === rate) return;
  rate = next;
  listeners.forEach((listener) => listener());
}

/** Reads the stored speed once; later calls reuse the same read. */
export function loadPlaybackRate(): Promise<void> {
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(PLAYBACK_RATE_STORAGE_KEY)
      .then(parseStoredPlaybackRate)
      .catch((err) => {
        console.warn("Could not read saved playback speed:", err);
        return DEFAULT_PLAYBACK_RATE;
      })
      .then((stored) => {
        // A speed picked while the read was in flight is newer than disk.
        if (!changed) setRate(stored);
      });
  }
  return loadPromise;
}

export function getPlaybackRate(): PlaybackRate {
  return rate;
}

/** Updates memory immediately and writes to the device in the background. */
export function savePlaybackRate(next: PlaybackRate): void {
  changed = true;
  setRate(next);
  AsyncStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, JSON.stringify(next)).catch(
    (err) => console.warn("Could not save playback speed:", err),
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The chosen playback speed; re-renders when it changes. */
export function usePlaybackRate(): PlaybackRate {
  useEffect(() => {
    loadPlaybackRate();
  }, []);
  return useSyncExternalStore(subscribe, getPlaybackRate, getPlaybackRate);
}

/** Test-only: forget everything held in memory. */
export function resetPlaybackRateStoreForTests() {
  rate = DEFAULT_PLAYBACK_RATE;
  changed = false;
  loadPromise = null;
  listeners.clear();
}
