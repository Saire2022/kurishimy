import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
//import { EXPO_PUBLIC_HUGGING_FACE_API_KEY } from "@env";

// Example text & timestamps
const textData = {
  text: "",
};

// Add helper function for converting audio to base64
const convertAudioToBase64 = async (sound) => {
  try {
    if (!sound) {
      throw new Error("No sound object provided");
    }

    const asset = Asset.fromModule(require("../assets/audio/audio.wav"));
    await asset.downloadAsync();

    const fileInfo = await FileSystem.getInfoAsync(asset.localUri);
    if (!fileInfo.exists) {
      throw new Error("Audio file not found");
    }

    const audioData = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return audioData;
  } catch (error) {
    console.error("Error in convertAudioToBase64:", error);
    throw error;
  }
};

export default function AudioTextSync() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [displayText, setDisplayText] = useState(textData.text);
  const [processedText, setProcessedText] = useState(textData);
  const [isLoading, setIsLoading] = useState(true);

  const intervalRef = useRef(null);

  // Cleanup on unmount
  // Add this function inside your component
  async function loadSound() {
    try {
      // Request audio permissions first
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Need audio permissions to play");
        return null;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      // Load audio (but don't play)
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/audio/audio.wav"),
        { shouldPlay: false }
      );

      // Set the sound state
      setSound(newSound);
      return newSound;
    } catch (error) {
      console.error("Error loading sound:", error);
      alert("Error loading audio file");
      return null;
    }
  }

  // Then modify your useEffect to use this function
  useEffect(() => {
    const loadInitialSound = async () => {
      try {
        const loadedSound = await loadSound();
        if (loadedSound) {
          // Optionally process text after sound is loaded
          const initialText = await sendAudioToHuggingFace(loadedSound);
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

  async function sendAudioToHuggingFace(sound) {
    try {
      if (!sound) {
        alert("No audio loaded to process");
        return;
      }

      const HUGGING_FACE_API_KEY = process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY;
      const MODEL_URL =
        "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-xlsr-53-spanish";

      // Get audio data
      console.log("Converting audio to base64...");
      const audioBase64 = await convertAudioToBase64(sound);

      if (!audioBase64) {
        throw new Error("Failed to convert audio to base64");
      }

      console.log("Sending to HuggingFace API...");
      const response = await axios.post(
        MODEL_URL,
        { inputs: audioBase64 },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          validateStatus: function (status) {
            return status < 500;
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Invalid API key or authentication failed");
      }

      if (response.data && response.data.text) {
        // console.log("Response received:", response.data);
        // // Update the processed text state with new text and timing
        // setProcessedText({
        //   text: response.data.text,
        console.log("Response received:", response.data.text);
        return response.data.text;
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Authentication failed. Please check your API key.");
        alert("Authentication failed. Please check your API key.");
      } else {
        console.error("Error details:", error.message, error.response?.data);
        alert(`Error processing audio: ${error.message}`);
      }
    }
  }

  // Load Audio
  async function playAudio() {
    try {
      // Request audio permissions first
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Need audio permissions to play");
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/audio/audio.wav"),
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Update current time
      intervalRef.current = setInterval(async () => {
        const status = await newSound.getStatusAsync();
        setCurrentTime(status.positionMillis / 1000);

        // Stop interval when audio ends
        if (status.didJustFinish) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }, 100);
    } catch (error) {
      console.error("Error loading audio:", error);
      alert("Error loading audio file");
    }
  }

  // Stop Audio
  async function stopAudio() {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setCurrentTime(0);
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  }

  // Highlight active word
  function getHighlightedText() {
    console.log("Processed text:", processedText);

    return <Text style={styles.text}>{processedText}</Text>;
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
      <Text style={styles.text}>{getHighlightedText()}</Text>
      <TouchableOpacity
        onPress={isPlaying ? stopAudio : playAudio}
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
});
