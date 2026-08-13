import { useState, useEffect, useCallback } from "react";
import {
  setAudioModeAsync,
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

interface UseAudioPlayerResult {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  playPause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (timeMs: number) => Promise<void>;
}

// 100ms status updates: kichwa words are ~300-600ms long, so the
// default 500ms interval skips right past their highlight window.
const STATUS_UPDATE_INTERVAL_MS = 100;

/** expo-audio reports seconds; the lesson UI works in milliseconds throughout. */
const MS_PER_SECOND = 1000;

export function useAudioPlayer(audioSource: number): UseAudioPlayerResult {
  const player = useExpoAudioPlayer(audioSource, {
    updateInterval: STATUS_UPDATE_INTERVAL_MS,
  });
  const status = useAudioPlayerStatus(player);

  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: "duckOthers",
    }).catch((err) => {
      if (mounted) {
        setError(
          err instanceof Error ? err.message : "Failed to configure audio",
        );
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // The player is keyed on the source, so a new chapter starts from zero.
  useEffect(() => {
    setCurrentTime(0);
  }, [audioSource]);

  useEffect(() => {
    if (status.isLoaded) {
      setCurrentTime(status.currentTime * MS_PER_SECOND);
    }
  }, [status.isLoaded, status.currentTime]);

  const playPause = useCallback(async () => {
    if (!status.isLoaded) return;

    try {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error("Error in play/pause:", err);
    }
  }, [player, status.isLoaded, status.playing]);

  const stop = useCallback(async () => {
    if (!status.isLoaded) return;

    try {
      player.pause();
      setCurrentTime(0);
      await player.seekTo(0);
    } catch (err) {
      console.error("Error stopping:", err);
    }
  }, [player, status.isLoaded]);

  const seek = useCallback(
    async (timeMs: number) => {
      if (!status.isLoaded) return;

      try {
        // A seek while paused emits no status update, so move the highlight
        // now rather than waiting for playback to resume.
        setCurrentTime(timeMs);
        await player.seekTo(timeMs / MS_PER_SECOND);
      } catch (err) {
        console.error("Error seeking:", err);
      }
    },
    [player, status.isLoaded],
  );

  return {
    isPlaying: status.playing,
    currentTime,
    duration: status.duration * MS_PER_SECOND,
    isLoading: !status.isLoaded,
    error,
    playPause,
    stop,
    seek,
  };
}
