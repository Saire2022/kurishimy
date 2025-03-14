import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendAudioToHuggingFace } from "./../scripts/sendAudioToHuggingFace";
import {
  loadSound,
  pauseAudio,
  playAudio,
  stopAudio,
} from "./../scripts/audioPlayer";
import lessonData from "./../lessons/Chapter1.json";

export default function AudioTextSync() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // Use JSON data to set initial state
  const [words, setWords] = useState(lessonData.kichwa.words);
  const [processedWords, setProcessedWords] = useState([]);

  // const [words, setWords] = useState([
  //   { word: "Hola", start: 0.2, end: 0.5 },
  //   { word: "mundo.", start: 0.5, end: 1.0 },
  //   { word: "Esto", start: 1.2, end: 1.6 },
  //   { word: "es", start: 1.6, end: 1.8 },
  //   { word: "una", start: 1.8, end: 2.1 },
  //   { word: "prueba.", start: 2.1, end: 2.5 },
  // ]);

  useEffect(() => {
    const loadInitialSound = async () => {
      try {
        const loadedSound = await loadSound(setSound);
        if (loadedSound) {
          const processed = words.flatMap((sentenceObj) => {
            const wordsInSentence = sentenceObj.word.split(" ");
            const timePerWord =
              (sentenceObj.end - sentenceObj.start) / wordsInSentence.length;

            return wordsInSentence.map((word, idx) => ({
              word,
              start: sentenceObj.start + timePerWord * idx,
              end: sentenceObj.start + timePerWord * (idx + 1),
            }));
          });

          setProcessedWords(processed);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load initial sound", error);
        setIsLoading(false);
      }
    };

    loadInitialSound();
  }, []);

  async function handlePlayAudio() {
    try {
      await playAudio(setSound, setIsPlaying, setCurrentTime, intervalRef);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  async function handlePauseAudio() {
    try {
      await pauseAudio(sound, setIsPlaying, intervalRef);
    } catch (error) {
      console.error("Error pausing audio:", error);
    }
  }

  async function handleStopAudio() {
    try {
      await stopAudio(sound, setCurrentTime, setIsPlaying, intervalRef);
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  }

  function getHighlightedText() {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textContainer}>
          {processedWords.map((wordObj, index) => {
            const isActive =
              currentTime >= wordObj.start / 1000 &&
              currentTime <= wordObj.end / 1000;

            return (
              <View key={index} style={styles.wordContainer}>
                <Text style={[styles.word, isActive && styles.highlightedWord]}>
                  {wordObj.word}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {getHighlightedText()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={isPlaying ? handlePauseAudio : handlePlayAudio}
          style={styles.button}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={50}
            color="black"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStopAudio} style={styles.button}>
          <Ionicons name="stop-circle" size={50} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  word: {
    color: "black",
  },
  highlightedWord: {
    color: "blue",
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  processButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 20,
  },
  // Add styles for ScrollView and wordContainer
  scrollContainer: {
    maxHeight: "90%",
    width: "100%",
  },
  contentContainer: {
    padding: 16,
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  wordContainer: {
    marginRight: 6,
    marginBottom: 8,
  },
  word: {
    fontSize: 20,
    color: "#333",
    lineHeight: 28,
  },
  highlightedWord: {
    color: "#2196F3",
    fontWeight: "bold",
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
