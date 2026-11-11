import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import type { ChapterContent, ViewMode } from "@/types/lesson";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import LanguageTextWord from "@/features/lesson/components/LanguageTextWord";
import PlaybackControls from "@/features/playback/components/PlaybackControls";
import Separator from "@/components/ui/Separator";
import { colors } from "@/theme/colors";
import {
  resumePositionMs,
  type ChapterProgress,
} from "@/features/progress/progress";
import { useSaveProgress } from "@/features/progress/useSaveProgress";
import { formatTime } from "@/utils/formatTime";
import { es } from "@/i18n/es";
import { findActiveSentenceIndex } from "@/utils/findActiveSentenceIndex";

/** Pressing "previous" this long into a sentence restarts it instead. */
const RESTART_THRESHOLD_SECONDS = 2;

/** How long the "resumed, start over?" offer stays on screen. */
const RESUME_NOTICE_MS = 8000;

interface LessonPlayerProps {
  chapter: ChapterContent;
  viewMode: ViewMode;
  /** Progress saved by an earlier session. Only read when first mounted. */
  savedProgress?: ChapterProgress;
}

export default function LessonPlayer({
  chapter,
  viewMode,
  savedProgress,
}: LessonPlayerProps) {
  // Fixed at mount: the saved progress changes as this very session writes it.
  const [resumeFromMs] = useState(() =>
    resumePositionMs(savedProgress, chapter.meta.durationMs),
  );
  const [showResumeNotice, setShowResumeNotice] = useState(resumeFromMs > 0);

  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    didJustFinish,
    error,
    playPause,
    seek,
  } = useAudioPlayer(chapter.audio, resumeFromMs);

  useSaveProgress({
    chapterId: chapter.meta.id,
    currentTime,
    // The player's own duration once known; the chapter metadata until then.
    durationMs: duration > 0 ? duration : chapter.meta.durationMs,
    isPlaying,
    didJustFinish,
    enabled: !isLoading && !error,
  });

  useEffect(() => {
    if (isLoading || !showResumeNotice) return;
    const timer = setTimeout(
      () => setShowResumeNotice(false),
      RESUME_NOTICE_MS,
    );
    return () => clearTimeout(timer);
  }, [isLoading, showResumeNotice]);

  const handleStartOver = () => {
    setShowResumeNotice(false);
    seek(0);
  };

  // Both language tracks share the same sentence boundaries.
  const sentences = chapter.spanishWords;

  // Before the first sentence starts, navigation acts from sentence 0.
  const getCurrentSentenceIndex = () =>
    Math.max(0, findActiveSentenceIndex(sentences, currentTime / 1000));

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
        <Text style={styles.loadingText}>{es.lesson.loadingAudio}</Text>
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
              isPlaying={isPlaying}
              onWordPress={seek}
            />
          </View>
          <Separator />
          <View style={styles.languageSection}>
            <LanguageTextWord
              wordTimings={chapter.spanishWords}
              currentTime={currentTime}
              isPlaying={isPlaying}
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
            isPlaying={isPlaying}
            onWordPress={seek}
          />
        </View>
      )}

      {showResumeNotice && (
        <View style={styles.resumeNotice}>
          <Text style={styles.resumeText}>
            {es.lesson.resumedFrom(formatTime(resumeFromMs))}
          </Text>
          <TouchableOpacity onPress={handleStartOver} hitSlop={8}>
            <Text style={styles.resumeAction}>{es.lesson.startOver}</Text>
          </TouchableOpacity>
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
  resumeNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
  resumeText: {
    flexShrink: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resumeAction: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
