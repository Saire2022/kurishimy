import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { audioTimingService } from "../scripts/audioService";
import PlaybackControls from "../components/PlaybackControls";
import LanguageTextWord from "../components/LanguageTextWord";
import { Audio } from "expo-av";
import Separator from "../components/Separator";

export default function ForcedAlignment() {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("dual"); // "kichwa", "spanish", or "dual"
  const [autoScroll, setAutoScroll] = useState(true);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [kichwaWords, setKichwaWords] = useState([]);
  const [SpanishWords, setSpanishWords] = useState([]);
  // References
  const kichwaScrollViewRef = useRef(null);
  const spanishScrollViewRef = useRef(null);
  const activeKichwaWordRef = useRef(null);
  const activeSpanishWordRef = useRef(null);

  // Initialize audio and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load word timings
        const kichwaWords = require("../lessons/alignment_output.json");
        const SpanishWords = require("../lessons/alignment_output.json");
        setKichwaWords(kichwaWords);
        setSpanishWords(SpanishWords);
        // Configure audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });

        // Load audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../assets/audio/cap1.mp3"),
          { shouldPlay: false }
        );
        setSound(newSound);

        // Get duration
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing:", error);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        audioTimingService.pause();
      } else {
        await sound.playAsync();
        audioTimingService.start(currentTime);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error in play/pause:", error);
    }
  };

  // Handle stop
  const handleStop = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      audioTimingService.stop();
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error stopping:", error);
    }
  };

  // Handle seek
  const handleSeek = async (time) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(time);
      audioTimingService.seek(time);
      setCurrentTime(time);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  // Toggle view mode
  const cycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "kichwa") return "spanish";
      if (prev === "spanish") return "dual";
      return "kichwa";
    });
  };

  // Auto-scroll to the active word
  useEffect(() => {
    if (!autoScroll || !kichwaWords.length) return;

    if (activeKichwaWordRef.current && kichwaScrollViewRef.current) {
      try {
        activeKichwaWordRef.current.measureLayout(
          kichwaScrollViewRef.current,
          (x, y, width, height) => {
            kichwaScrollViewRef.current.scrollTo({
              y: y - 100,
              x: 0,
              animated: true,
            });
          },
          (error) => console.error("Layout measurement failed:", error)
        );
      } catch (error) {
        console.error("Auto-scroll error:", error);
      }
    }
  }, [currentTime, viewMode, kichwaWords]);

  // Update current time from playback status when sound is available
  useEffect(() => {
    if (!sound) return;
    const subscription = (status) => {
      if (status.isLoaded) {
        setCurrentTime(status.positionMillis);
      }
    };
    sound.setOnPlaybackStatusUpdate(subscription);
    return () => {
      sound.setOnPlaybackStatusUpdate(null);
    };
  }, [sound]);

  // Loading indicator
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {viewMode === "kichwa"
            ? "Kichwa"
            : viewMode === "spanish"
              ? "Spanish"
              : "Kichwa / Spanish"}
        </Text>
        <TouchableOpacity onPress={cycleViewMode} style={styles.languageButton}>
          <Ionicons name="swap-horizontal" size={20} color="#2196F3" />
          <Text style={styles.languageButtonText}>
            {viewMode === "kichwa"
              ? "Switch to Spanish"
              : viewMode === "spanish"
                ? "Switch to Dual View"
                : "Switch to Kichwa"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <LanguageTextWord
          wordTimings={kichwaWords}
          currentTime={currentTime}
          onWordPress={handleSeek}
          activeWordRef={activeKichwaWordRef}
        />
      </View>
      <Separator />
      <View style={styles.contentContainer}>
        <LanguageTextWord
          wordTimings={SpanishWords}
          currentTime={currentTime}
          onWordPress={handleSeek}
          activeWordRef={activeSpanishWordRef}
        />
      </View>

      <View style={styles.controlsContainer}>
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSeek={handleSeek}
          autoScroll={autoScroll}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          currentTime={currentTime}
          duration={duration}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  languageButton: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  languageButtonText: {
    color: "#2196F3",
    fontWeight: "bold",
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
  },
  languageSection: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  halfHeight: {
    flex: 0.5,
  },
  languageHeader: {
    padding: 8,
    backgroundColor: "#E3F2FD",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  controlsContainer: {
    marginTop: 16,
  },
});
