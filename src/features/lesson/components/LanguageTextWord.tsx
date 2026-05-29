import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import type { WordTiming } from "@/types/lesson";
import { WORDS_PER_CHUNK } from "@/constants/lesson";
import { createWordChunks } from "@/utils/createWordChunks";
import { colors } from "@/theme/colors";

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
  const chunks = useMemo(
    () => createWordChunks(wordTimings, WORDS_PER_CHUNK),
    [wordTimings]
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  useEffect(() => {
    const newChunkIndex = chunks.findIndex(
      (chunk) =>
        currentTimeInSeconds >= chunk.start && currentTimeInSeconds < chunk.end
    );

    if (newChunkIndex !== -1 && newChunkIndex !== currentChunkIndex) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setCurrentChunkIndex(newChunkIndex);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [currentTimeInSeconds, chunks, currentChunkIndex, fadeAnim]);

  const currentChunk = chunks[currentChunkIndex] || chunks[0];
  if (!currentChunk) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.textContainer}>
        {currentChunk.words.map((word, idx) => {
          const isActive =
            currentTimeInSeconds >= word.start &&
            currentTimeInSeconds < word.end;
          const isCompleted = currentTimeInSeconds >= word.end;

          const wordElement = (
            <Text
              style={[
                styles.word,
                isActive && styles.activeWord,
                isCompleted && styles.completedWord,
              ]}
            >
              {word.displayText}
            </Text>
          );

          const key = `word-${word.wordIndex}-${idx}`;

          if (onWordPress) {
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onWordPress(word.start * 1000)}
                activeOpacity={0.7}
              >
                {wordElement}
              </TouchableOpacity>
            );
          }

          return <View key={key}>{wordElement}</View>;
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  word: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 28,
    marginRight: 4,
    marginBottom: 4,
  },
  activeWord: {
    color: colors.activeWord,
    fontWeight: "bold",
    backgroundColor: colors.activeWordBg,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  completedWord: {
    color: colors.completedWord,
  },
});
