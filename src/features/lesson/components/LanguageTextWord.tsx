import React, { useRef, useEffect } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import type { WordTiming } from "@/types/lesson";
import { colors } from "@/theme/colors";

/** How long auto-scroll stays paused after the user scrolls manually. */
const USER_SCROLL_PAUSE_MS = 2000;

interface LanguageTextWordProps {
  wordTimings: WordTiming[];
  currentTime: number;
  onWordPress?: (timeMs: number) => void;
}

export default function LanguageTextWord({
  wordTimings,
  currentTime,
  onWordPress,
}: LanguageTextWordProps) {
  const currentTimeInSeconds = currentTime / 1000;
  const scrollRef = useRef<ScrollView>(null);
  const offsetsRef = useRef<Record<number, number>>({});
  const viewportHeightRef = useRef(0);
  const lastUserScrollAtRef = useRef(0);
  const lastAutoScrolledIndexRef = useRef(-1);

  // Sentence being spoken now; during silences keep the last one started.
  let activeIndex = wordTimings.findIndex(
    (s) => currentTimeInSeconds >= s.start && currentTimeInSeconds < s.end,
  );
  if (activeIndex === -1) {
    for (let i = wordTimings.length - 1; i >= 0; i--) {
      if (currentTimeInSeconds >= wordTimings[i].start) {
        activeIndex = i;
        break;
      }
    }
  }

  // Auto-scroll the active sentence into view (upper third of the panel),
  // unless the user scrolled manually a moment ago.
  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastAutoScrolledIndexRef.current)
      return;
    if (Date.now() - lastUserScrollAtRef.current < USER_SCROLL_PAUSE_MS) return;
    const y = offsetsRef.current[activeIndex];
    if (y === undefined) return;
    lastAutoScrolledIndexRef.current = activeIndex;
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - viewportHeightRef.current / 3),
      animated: true,
    });
  }, [activeIndex]);

  // Reset measurements when the text changes (chapter/view-mode switch).
  useEffect(() => {
    offsetsRef.current = {};
    lastAutoScrolledIndexRef.current = -1;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [wordTimings]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      onLayout={(e) => {
        viewportHeightRef.current = e.nativeEvent.layout.height;
      }}
      onScrollBeginDrag={() => {
        lastUserScrollAtRef.current = Date.now();
      }}
    >
      {wordTimings.map((sentence, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = !isActive && currentTimeInSeconds >= sentence.end;

        return (
          <Text
            key={`sentence-${idx}`}
            onLayout={(e) => {
              offsetsRef.current[idx] = e.nativeEvent.layout.y;
            }}
            onPress={
              onWordPress ? () => onWordPress(sentence.start * 1000) : undefined
            }
            suppressHighlighting
            style={[
              styles.sentence,
              isCompleted && styles.completed,
              isActive && styles.active,
            ]}
          >
            {sentence.word}
          </Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sentence: {
    alignSelf: "flex-start",
    fontSize: 19,
    lineHeight: 30,
    color: colors.textPrimary,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completed: {
    color: colors.completedWord,
  },
  active: {
    backgroundColor: colors.activeWord,
    color: colors.background,
    fontWeight: "600",
  },
});
