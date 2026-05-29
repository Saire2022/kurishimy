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
    setSound(null);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);

    let mounted = true;
    let soundInstance: Audio.Sound | null = null;

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
          { shouldPlay: false }
        );

        soundInstance = loadedSound;

        if (!mounted) {
          await loadedSound.unloadAsync();
          return;
        }

        setSound(loadedSound);

        const status = await loadedSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis ?? 0);
        }

        setIsLoading(false);
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
      soundInstance?.unloadAsync();
    };
  }, [audioSource]);

  useEffect(() => {
    if (!sound) return;

    const onStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setCurrentTime(status.positionMillis);
      setIsPlaying(status.isPlaying);
    };

    sound.setOnPlaybackStatusUpdate(onStatusUpdate);
    return () => {
      sound.setOnPlaybackStatusUpdate(null);
    };
  }, [sound]);

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
    [sound]
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
