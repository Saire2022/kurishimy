import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LessonPlayer from "@/features/lesson/components/LessonPlayer";
import { useViewMode } from "@/features/lesson/hooks/useViewMode";
import { loadChapter } from "@/content/chapters/registry";
import { colors } from "@/theme/colors";
import { es } from "@/i18n/es";

export default function LessonScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const resolvedChapterId = chapterId ?? "1";
  // Keep the same wordTimings array references across re-renders (e.g. when
  // toggling view mode), otherwise LanguageTextWord treats it as new content
  // and resets its scroll position/measurements every time.
  const chapter = useMemo(
    () => loadChapter(resolvedChapterId),
    [resolvedChapterId],
  );
  const { viewMode, cycleViewMode, nextModeLabel } = useViewMode();

  const screenOptions = {
    title: es.lesson.chapterLabel(
      chapter ? chapter.meta.chapterNumber : resolvedChapterId,
    ),
    headerShadowVisible: false,
    headerTintColor: colors.primary,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.textPrimary },
    headerRight: () => (
      <TouchableOpacity onPress={cycleViewMode} style={styles.switchButton}>
        <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
        <Text style={styles.switchButtonText}>{nextModeLabel}</Text>
      </TouchableOpacity>
    ),
  };

  if (!chapter) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {es.lesson.chapterNotFound(resolvedChapterId)}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <LessonPlayer chapter={chapter} viewMode={viewMode} />
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
  switchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  switchButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 5,
  },
});
