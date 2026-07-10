import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Logo } from "@/components/ui/Logo";
import type { ChapterContent } from "@/types/lesson";
import { getChapterIds, loadChapter } from "@/content/chapters/registry";
import { formatTime } from "@/utils/formatTime";
import { colors } from "@/theme/colors";

export default function Index() {
  const router = useRouter();

  const chapters = getChapterIds()
    .map((id) => loadChapter(id))
    .filter((c): c is ChapterContent => c !== null);

  const openChapter = (chapterId: string) => {
    router.push({ pathname: "/lesson/[chapterId]", params: { chapterId } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Logo width={150} height={150} />
          <Text style={styles.title}>Kury Shimy</Text>
          <Text style={styles.tagline}>
            Aprende Kichwa leyendo y escuchando
          </Text>
          <Text style={styles.description}>
            Historias bilingües con audio sincronizado. Sigue el texto en Kichwa
            y Español mientras escuchas la narración.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Capítulos</Text>

        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.meta.id}
            style={styles.chapterCard}
            onPress={() => openChapter(chapter.meta.id)}
            activeOpacity={0.85}
          >
            <View style={styles.chapterIcon}>
              <Ionicons name="headset" size={26} color={colors.primary} />
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterNumber}>
                Capítulo {chapter.meta.chapterNumber}
              </Text>
              <Text style={styles.chapterTitle} numberOfLines={2}>
                {chapter.meta.title}
              </Text>
              <View style={styles.chapterMeta}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.chapterDuration}>
                  {formatTime(chapter.meta.durationMs)}
                </Text>
              </View>
            </View>
            <View style={styles.playBadge}>
              <Ionicons name="play" size={18} color={colors.background} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chapterIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  chapterInfo: {
    flex: 1,
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  chapterMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  chapterDuration: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },
  playBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
