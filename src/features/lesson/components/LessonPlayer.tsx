import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ChapterContent } from "@/types/lesson";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useViewMode } from "@/features/lesson/hooks/useViewMode";
import LanguageTextWord from "@/features/lesson/components/LanguageTextWord";
import PlaybackControls from "@/features/playback/components/PlaybackControls";
import Separator from "@/components/ui/Separator";
import { colors } from "@/theme/colors";

interface LessonPlayerProps {
  chapter: ChapterContent;
}

export default function LessonPlayer({ chapter }: LessonPlayerProps) {
  const { viewMode, cycleViewMode, viewModeLabel, switchLabel } = useViewMode();
  const [autoScroll, setAutoScroll] = React.useState(true);
  const activeKichwaWordRef = useRef<View>(null);
  const activeSpanishWordRef = useRef<View>(null);

  const { isPlaying, currentTime, duration, isLoading, error, playPause, stop, seek } =
    useAudioPlayer(chapter.audio);

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
      <View style={styles.header}>
        <Text style={styles.title}>{viewModeLabel}</Text>
        <TouchableOpacity onPress={cycleViewMode} style={styles.languageButton}>
          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
          <Text style={styles.languageButtonText}>{switchLabel}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === "dual" ? (
        <>
          <View style={styles.languageSection}>
            <View style={styles.languageHeader}>
              <Text style={styles.languageTitle}>Kichwa</Text>
            </View>
            <View style={styles.dualContentContainer}>
              <LanguageTextWord
                wordTimings={chapter.kichwaWords}
                currentTime={currentTime}
                onWordPress={seek}
                activeWordRef={activeKichwaWordRef}
              />
            </View>
          </View>
          <Separator />
          <View style={styles.languageSection}>
            <View style={styles.languageHeader}>
              <Text style={styles.languageTitle}>Spanish</Text>
            </View>
            <View style={styles.dualContentContainer}>
              <LanguageTextWord
                wordTimings={chapter.spanishWords}
                currentTime={currentTime}
                onWordPress={seek}
                activeWordRef={activeSpanishWordRef}
              />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.contentContainer}>
          <LanguageTextWord
            wordTimings={
              viewMode === "kichwa"
                ? chapter.kichwaWords
                : chapter.spanishWords
            }
            currentTime={currentTime}
            onWordPress={seek}
            activeWordRef={
              viewMode === "kichwa"
                ? activeKichwaWordRef
                : activeSpanishWordRef
            }
          />
        </View>
      )}

      <View style={styles.controlsContainer}>
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={playPause}
          onStop={stop}
          onSeek={seek}
          autoScroll={autoScroll}
          onToggleAutoScroll={() => setAutoScroll((prev) => !prev)}
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
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  languageButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  languageButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
  },
  dualContentContainer: {
    flex: 0.5,
  },
  languageSection: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  languageHeader: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  controlsContainer: {
    marginTop: 16,
  },
});
