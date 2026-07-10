import { useState, useEffect, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

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

export function useAudioPlayer(audioSource: number): UseAudioPlayerResult {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let soundInstance: Audio.Sound | null = null;

    setSound(null);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);

    async function initialize() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound: loadedSound } = await Audio.Sound.createAsync(
          audioSource,
          // 100ms status updates: kichwa words are ~300-600ms long, so the
          // default 500ms interval skips right past their highlight window.
          { shouldPlay: false, progressUpdateIntervalMillis: 100 },
        );

        soundInstance = loadedSound;

        if (!mounted) {
          await loadedSound.unloadAsync();
          return;
        }

        loadedSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded || !mounted) return;
          setCurrentTime(status.positionMillis);
          setIsPlaying(status.isPlaying);
        });

        setSound(loadedSound);

        const status = await loadedSound.getStatusAsync();
        if (status.isLoaded && mounted) {
          setDuration(status.durationMillis ?? 0);
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load audio");
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
      if (soundInstance) {
        soundInstance.setOnPlaybackStatusUpdate(null);
        soundInstance.unloadAsync().catch((err) => {
          console.error("Error unloading sound:", err);
        });
      }
    };
  }, [audioSource]);

  const playPause = useCallback(async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Error in play/pause:", err);
    }
  }, [sound, isPlaying]);

  const stop = useCallback(async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (err) {
      console.error("Error stopping:", err);
    }
  }, [sound]);

  const seek = useCallback(
    async (timeMs: number) => {
      if (!sound) return;

      try {
        await sound.setPositionAsync(timeMs);
        setCurrentTime(timeMs);
      } catch (err) {
        console.error("Error seeking:", err);
      }
    },
    [sound],
  );

  return {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    playPause,
    stop,
    seek,
  };
}
