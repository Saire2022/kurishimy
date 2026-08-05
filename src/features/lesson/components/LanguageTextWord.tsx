import React, { useRef, useEffect } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import type { WordTiming } from "@/types/lesson";
import { colors } from "@/theme/colors";

/** How long auto-scroll stays paused after the user scrolls manually. */
const USER_SCROLL_PAUSE_MS = 2000;

interface SentenceLine {
  y: number;
  text: string;
}

interface LanguageTextWordProps {
  wordTimings: WordTiming[];
  currentTime: number;
  isPlaying: boolean;
  onWordPress?: (timeMs: number) => void;
}

export default function LanguageTextWord({
  wordTimings,
  currentTime,
  isPlaying,
  onWordPress,
}: LanguageTextWordProps) {
  const currentTimeInSeconds = currentTime / 1000;
  const scrollRef = useRef<ScrollView>(null);
  const offsetsRef = useRef<Record<number, number>>({});
  // Per-sentence line boxes from onTextLayout, used to scroll as the reveal
  // progresses through a long sentence, not just once at its start.
  const linesRef = useRef<Record<number, SentenceLine[]>>({});
  const viewportHeightRef = useRef(0);
  const lastUserScrollAtRef = useRef(0);
  const lastAutoScrolledKeyRef = useRef("");

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

  // There's no real per-word audio alignment (each entry spans a whole
  // sentence), so the reveal position is approximated by interpolating
  // character position against elapsed time within the sentence's window.
  const activeSentence = activeIndex >= 0 ? wordTimings[activeIndex] : null;
  let revealCount = 0;
  if (activeSentence) {
    const sentenceDuration = activeSentence.end - activeSentence.start;
    const fraction =
      sentenceDuration > 0
        ? Math.min(
            1,
            Math.max(
              0,
              (currentTimeInSeconds - activeSentence.start) / sentenceDuration,
            ),
          )
        : 1;
    revealCount = Math.round(fraction * activeSentence.word.length);
  }

  // Which visual line of the active sentence the reveal has reached.
  let activeLineIndex = 0;
  if (activeIndex >= 0) {
    const lines = linesRef.current[activeIndex];
    if (lines) {
      let consumed = 0;
      activeLineIndex = Math.max(0, lines.length - 1);
      for (let i = 0; i < lines.length; i++) {
        consumed += lines[i].text.length;
        if (revealCount <= consumed) {
          activeLineIndex = i;
          break;
        }
      }
    }
  }

  // Auto-scroll to keep the reveal position in the upper third of the
  // panel, unless the user scrolled manually a moment ago.
  const scrollToTarget = (index: number, lineIndex: number) => {
    if (index < 0) return;
    const key = `${index}:${lineIndex}`;
    if (key === lastAutoScrolledKeyRef.current) return;
    if (Date.now() - lastUserScrollAtRef.current < USER_SCROLL_PAUSE_MS) return;
    const blockY = offsetsRef.current[index];
    if (blockY === undefined) return;
    const lineY = linesRef.current[index]?.[lineIndex]?.y ?? 0;
    lastAutoScrolledKeyRef.current = key;
    scrollRef.current?.scrollTo({
      y: Math.max(0, blockY + lineY - viewportHeightRef.current / 3),
      animated: true,
    });
  };

  useEffect(() => {
    scrollToTarget(activeIndex, activeLineIndex);
  }, [activeIndex, activeLineIndex]);

  // Reset measurements when the text changes (chapter/view-mode switch).
  useEffect(() => {
    offsetsRef.current = {};
    linesRef.current = {};
    lastAutoScrolledKeyRef.current = "";
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
        const showPauseHighlight = isActive && !isPlaying;

        return (
          <Text
            key={`sentence-${idx}`}
            onLayout={(e) => {
              offsetsRef.current[idx] = e.nativeEvent.layout.y;
              // The active sentence's own layout can arrive after
              // activeIndex already changed (e.g. under JS thread pressure
              // from the frequent playback ticks) — retry now it's known.
              if (idx === activeIndex) scrollToTarget(idx, activeLineIndex);
            }}
            onTextLayout={(e) => {
              linesRef.current[idx] = e.nativeEvent.lines.map((line) => ({
                y: line.y,
                text: line.text,
              }));
              if (idx === activeIndex) scrollToTarget(idx, activeLineIndex);
            }}
            onPress={
              onWordPress ? () => onWordPress(sentence.start * 1000) : undefined
            }
            suppressHighlighting
            style={[
              styles.sentence,
              isCompleted && styles.completed,
              showPauseHighlight && styles.pausedActive,
            ]}
          >
            {isActive ? (
              <>
                <Text style={styles.read}>
                  {sentence.word.slice(0, revealCount)}
                </Text>
                <Text style={styles.unread}>
                  {sentence.word.slice(revealCount)}
                </Text>
              </>
            ) : (
              sentence.word
            )}
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
  // Background box shown on the active sentence only while paused, as a
  // bookmark of where playback stopped.
  pausedActive: {
    backgroundColor: colors.activeWordBg,
  },
  read: {
    color: colors.activeWord,
    fontWeight: "600",
  },
  unread: {
    color: colors.textPrimary,
  },
});
