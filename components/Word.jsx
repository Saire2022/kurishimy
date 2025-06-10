import React, { forwardRef, memo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

// Use forwardRef to allow the ref to be forwarded to the TouchableOpacity
const Word = memo(
  forwardRef(function Word(props, ref) {
    const { word, isActive, isApproaching, onPress } = props;

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        style={[
          styles.wordContainer,
          isApproaching && styles.approachingWordContainer,
          isActive && styles.activeWordContainer,
        ]}
      >
        <Text
          style={[
            styles.wordText,
            isApproaching && styles.approachingWordText,
            isActive && styles.activeWordText,
          ]}
        >
          {word}
        </Text>
      </TouchableOpacity>
    );
  })
);

const styles = StyleSheet.create({
  wordContainer: {
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeWordContainer: {
    backgroundColor: "#2196F3",
  },
  wordText: {
    fontSize: 16,
    color: "#333333",
  },
  activeWordText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default Word;
