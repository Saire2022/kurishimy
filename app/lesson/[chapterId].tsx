import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import LessonPlayer from "@/features/lesson/components/LessonPlayer";
import { loadChapter } from "@/content/chapters/registry";
import { colors } from "@/theme/colors";

export default function LessonScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const chapter = loadChapter(chapterId ?? "1");

  if (!chapter) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Chapter &quot;{chapterId}&quot; not found.
        </Text>
      </View>
    );
  }

  return <LessonPlayer chapter={chapter} />;
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
});
