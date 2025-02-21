import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendAudioToHuggingFace } from "./../script/sendAudioToHuggingFace";
import { loadSound, playAudio, stopAudio } from "./../script/audioPlayer";

const textData = {
  text: "",
};

export default function AudioTextSync() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [displayText, setDisplayText] = useState(textData.text);
  const [processedText, setProcessedText] = useState(textData);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const [words, setWords] = useState([
    { word: "Hola", start: 0.2, end: 0.5 },
    { word: "mundo.", start: 0.5, end: 1.0 },
    { word: "Esto", start: 1.2, end: 1.6 },
    { word: "es", start: 1.6, end: 1.8 },
    { word: "una", start: 1.8, end: 2.1 },
    { word: "prueba.", start: 2.1, end: 2.5 },
  ]);

  useEffect(() => {
    const loadInitialSound = async () => {
      try {
        const loadedSound = await loadSound(setSound);
        if (loadedSound) {
          const initialText = await sendAudioToHuggingFace(
            loadedSound,
            setWords
          );
          if (initialText) {
            setProcessedText(initialText);
            setIsLoading(false);
          }
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

  async function handleStopAudio() {
    try {
      await stopAudio(sound, setCurrentTime, setIsPlaying, intervalRef);
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  }
  // Highlight active word
  function getHighlightedText() {
    return (
      <View style={styles.textContainer}>
        {words.map((wordObj, index) => {
          const isActive =
            currentTime >= wordObj.start && currentTime <= wordObj.end;

          return (
            <Text
              key={index}
              style={[styles.word, isActive && styles.highlightedWord]}
            >
              {wordObj.word}{" "}
            </Text>
          );
        })}
      </View>
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
      <TouchableOpacity
        onPress={isPlaying ? handleStopAudio : handlePlayAudio}
        style={styles.button}
      >
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={50}
          color="black"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.processButton]}
        onPress={() => sendAudioToHuggingFace(sound)}
      >
        <Text style={styles.buttonText}>Process Text</Text>
      </TouchableOpacity>
    </View>
  );
  setDisplayText;
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
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  word: {
    fontSize: 24,
    color: "black",
  },
  highlightedWord: {
    color: "blue",
    fontWeight: "bold",
    backgroundColor: "#e6f3ff",
    borderRadius: 4,
  },
});
