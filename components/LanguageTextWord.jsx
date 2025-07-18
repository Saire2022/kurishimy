import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Helper: interpolate letter timings from word timings
function getLetterTimings(wordTimings) {
  const result = [];
  wordTimings.forEach((wordObj, wordIndex) => {
    const { word, start, end } = wordObj;
    const duration = end - start;
    const letters = word.split("");
    const letterDuration = duration / letters.length;
    letters.forEach((letter, letterIndex) => {
      result.push({
        letter,
        start: start + letterIndex * letterDuration,
        end: start + (letterIndex + 1) * letterDuration,
        wordIndex,
        letterIndex,
      });
    });
    // Add a space after each word (not highlighted)
    result.push({
      letter: " ",
      start: end,
      end: end,
      wordIndex,
      letterIndex: letters.length,
      isSpace: true,
    });
  });
  return result;
}

const LanguageTextWord = ({ wordTimings, currentTime }) => {
  // Convert currentTime to seconds
  const currentTimeInSeconds = currentTime / 1000;
  const letterTimings = getLetterTimings(wordTimings.slice(0, 20));

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.textContainer}>
        {letterTimings.map((lt, idx) => {
          const isActive = !lt.isSpace && currentTimeInSeconds >= lt.end;
          return (
            <Text
              key={`${lt.wordIndex}-${lt.letterIndex}-${idx}`}
              style={isActive ? styles.highlightedLetter : styles.letter}
            >
              {lt.letter}
            </Text>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  contentContainer: {
    padding: 16,
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  letter: {
    fontSize: 20,
    color: "#333333",
    lineHeight: 32,
  },
  highlightedLetter: {
    fontSize: 20,
    color: "#2196F3",
    fontWeight: "bold",
    lineHeight: 32,
  },
});

export default LanguageTextWord;
