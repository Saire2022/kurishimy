import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { ChapterContent, ViewMode } from "@/types/lesson";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import LanguageTextWord from "@/features/lesson/components/LanguageTextWord";
import PlaybackControls from "@/features/playback/components/PlaybackControls";
import Separator from "@/components/ui/Separator";
import { colors } from "@/theme/colors";

/** Pressing "previous" this long into a sentence restarts it instead. */
const RESTART_THRESHOLD_SECONDS = 2;

interface LessonPlayerProps {
  chapter: ChapterContent;
  viewMode: ViewMode;
}

export default function LessonPlayer({ chapter, viewMode }: LessonPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    playPause,
    seek,
  } = useAudioPlayer(chapter.audio);

  // Both language tracks share the same sentence boundaries.
  const sentences = chapter.spanishWords;

  const getCurrentSentenceIndex = () => {
    const t = currentTime / 1000;
    const idx = sentences.findIndex((s) => t >= s.start && t < s.end);
    if (idx !== -1) return idx;
    for (let i = sentences.length - 1; i >= 0; i--) {
      if (t >= sentences[i].start) return i;
    }
    return 0;
  };

  const handlePrevious = () => {
    const t = currentTime / 1000;
    const idx = getCurrentSentenceIndex();
    const target =
      idx > 0 && t - sentences[idx].start < RESTART_THRESHOLD_SECONDS
        ? idx - 1
        : idx;
    seek(sentences[target].start * 1000);
  };

  const handleNext = () => {
    const idx = getCurrentSentenceIndex();
    if (idx < sentences.length - 1) {
      seek(sentences[idx + 1].start * 1000);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {viewMode === "dual" ? (
        <>
          <View style={styles.languageSection}>
            <LanguageTextWord
              wordTimings={chapter.kichwaWords}
              currentTime={currentTime}
              onWordPress={seek}
            />
          </View>
          <Separator />
          <View style={styles.languageSection}>
            <LanguageTextWord
              wordTimings={chapter.spanishWords}
              currentTime={currentTime}
              onWordPress={seek}
            />
          </View>
        </>
      ) : (
        <View style={styles.contentContainer}>
          <LanguageTextWord
            wordTimings={
              viewMode === "kichwa" ? chapter.kichwaWords : chapter.spanishWords
            }
            currentTime={currentTime}
            onWordPress={seek}
          />
        </View>
      )}

      <View style={styles.controlsContainer}>
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={playPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={seek}
          currentTime={currentTime}
          duration={duration}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: colors.stop,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
  },
  languageSection: {
    flex: 1,
  },
  controlsContainer: {
    marginTop: 12,
  },
});
