import React, { forwardRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const LanguageText = forwardRef(
  ({ wordTimings, currentTime, onWordPress, activeWordRef }, ref) => {
    // Early return if wordTimings is empty
    if (!wordTimings || wordTimings.length === 0) {
      return (
        <ScrollView
          ref={ref}
          horizontal={false} // Changed to false to enable vertical scrolling
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.noContentText}>No text content available</Text>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        ref={ref}
        horizontal={false} // Changed to false to enable vertical scrolling
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textContainer}>
          {wordTimings.map((wordObj, index) => {
            const isActive =
              currentTime >= wordObj.start && currentTime <= wordObj.end;

            // Check if this is a new sentence to add line breaks
            const isNewSentence =
              index > 0 &&
              wordObj.sentenceId !== wordTimings[index - 1].sentenceId;

            return (
              <React.Fragment key={wordObj.id}>
                {isNewSentence && <View style={styles.lineBreak} />}
                <TouchableOpacity
                  ref={isActive ? activeWordRef : null}
                  onPress={() => onWordPress(wordObj)}
                  style={[
                    styles.wordContainer,
                    isActive && styles.activeWordContainer,
                  ]}
                >
                  <Text
                    style={[styles.word, isActive && styles.highlightedWord]}
                  >
                    {wordObj.word}
                  </Text>
                </TouchableOpacity>
                {/* Add a space after each word for better readability */}
                <Text style={styles.wordSpace}> </Text>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    );
  }
);

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
    flexWrap: "wrap", // This enables text wrapping
    width: "100%", // Ensure container takes full width
    alignItems: "flex-start",
  },
  wordContainer: {
    marginRight: 0, // Removed right margin to avoid extra spacing
    marginBottom: 8,
    borderRadius: 4,
    // Removed fixed width to allow natural word sizing
  },
  wordSpace: {
    fontSize: 20, // Match the size of the words
  },
  activeWordContainer: {
    backgroundColor: "#E3F2FD",
  },
  word: {
    fontSize: 20,
    color: "#333333",
    lineHeight: 32,
  },
  highlightedWord: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  lineBreak: {
    width: "100%",
    height: 16, // Increased for better sentence separation
  },
  noContentText: {
    fontSize: 18,
    color: "#757575",
    padding: 20,
  },
});

export default LanguageText;
