import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
//import lessonData from "./../lessons/Chapter1.json";
//import processWordTimings from "./../scripts/wordProcessor";
import audioService from "./../scripts/audioService";
import PlaybackControls from "../components/PlaybackControls";
import { LayoutAnimationConfig } from "react-native-reanimated";
import LanguageText from "../components/LanguageText";

export default function AudioTextSync() {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("dual"); // "kichwa", "spanish", or "dual"
  const [autoScroll, setAutoScroll] = useState(true);

  // References
  //const intervalRef = useRef(null);
  //const scrollViewRef = useRef(null);
  //const activeWordRef = useRef(null);
  const kichwaScrollViewRef = useRef(null);
  const spanishScrollViewRef = useRef(null);
  const activeKichwaWordRef = useRef(null);
  const activeSpanishWordRef = useRef(null);

  // Word timings for both languages
  //const [kichwaWordTimings, setKichwaWordTimings] = useState([]);
  //const [spanishWordTimings, setSpanishWordTimings] = useState([]);
  const [kichwaWords, setKichwaWords] = useState([]);

  // Audio path
  const audioPath = require("../assets/audio/cap1.mp3");

  // Process word timings from the lesson data
  useEffect(() => {
    //const kichwaWords = processWordTimings(lessonData, "kichwa");
    const kichwaWords = require("../lessons/alignment_output.json");
    //const spanishWords = processWordTimings(lessonData, "spanish");
    //setKichwaWordTimings(kichwaWords);
    //setSpanishWordTimings(spanishWords);
    //console.log("kichwaWords: ", kichwaWords);
  }, []);

  // Load audio when component mounts
  useEffect(() => {
    const kichwaWords = require("../lessons/alignment_output.json");
    setKichwaWords(kichwaWords);
    async function setupAudio() {
      const success = await audioService.loadAudio(audioPath);
      setIsLoading(!success);
    }

    setupAudio();

    // Cleanup on unmountjumpToWord
    return () => {
      audioService.cleanup();
    };
  }, []);

  // Audio control functions
  async function handlePlayPause() {
    if (isPlaying) {
      const success = await audioService.pause();
      if (success) setIsPlaying(false);
    } else {
      const success = await audioService.play(setCurrentTime);
      if (success) setIsPlaying(true);
    }
  }

  async function handleStop() {
    const success = await audioService.stop(setCurrentTime);
    if (success) setIsPlaying(false);
  }

  async function jumpToWord(wordObj) {
    // Jump to slightly before the word starts for context
    const jumpTime = Math.max(0, wordObj.start - 100);

    const success = await audioService.seekTo(jumpTime, setCurrentTime);

    if (success && !isPlaying) {
      const playSuccess = await audioService.play(setCurrentTime);
      if (playSuccess) setIsPlaying(true);
    }
  }

  // Toggle view mode
  function cycleViewMode() {
    setViewMode((prev) => {
      if (prev === "kichwa") return "spanish";
      if (prev === "spanish") return "dual";
      return "kichwa";
    });
  }

  // Auto-scroll to the active word
  useEffect(() => {
    if (!autoScroll) return;

    // Handle Kichwa scrolling
    if (
      (viewMode === "kichwa" || viewMode === "dual") &&
      activeKichwaWordRef.current &&
      kichwaScrollViewRef.current
    ) {
      try {
        activeKichwaWordRef.current.measureLayout(
          kichwaScrollViewRef.current,
          (x, y, width, height) => {
            kichwaScrollViewRef.current.scrollTo({
              y: y - 100, // Scroll vertically
              x: 0,
              animated: true,
            });
          },
          (error) => console.error("Kichwa layout measurement failed:", error)
        );
      } catch (error) {
        console.error("Kichwa auto-scroll error:", error);
      }
    }

    // Handle Spanish scrolling
    if (
      (viewMode === "spanish" || viewMode === "dual") &&
      activeSpanishWordRef.current &&
      spanishScrollViewRef.current
    ) {
      try {
        activeSpanishWordRef.current.measureLayout(
          spanishScrollViewRef.current,
          (x, y, width, height) => {
            spanishScrollViewRef.current.scrollTo({
              y: y - 100, // Scroll vertically
              x: 0,
              animated: true,
            });
          },
          (error) => console.error("Spanish layout measurement failed:", error)
        );
      } catch (error) {
        console.error("Spanish auto-scroll error:", error);
      }
    }
  }, [currentTime, viewMode]);

  async function handleSeek(time) {
    // Create a function that sets the current time and also seeks in the audio
    await audioService.seekTo(time, setCurrentTime);
  }
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
        <LanguageText
          wordTimings={kichwaWords}
          currentTime={currentTime}
          onWordPress={jumpToWord}
          activeWordRef={activeKichwaWordRef}
        />
      </View>

      <View style={styles.controlsContainer}>
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSeek={handleSeek} // Add this line
          autoScroll={autoScroll}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          currentTime={currentTime}
          duration={audioService.duration}
        />
      </View>
    </View>
  );
}

//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#FFFFFF",
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#757575",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333333",
//   },
//   languageButton: {
//     backgroundColor: "#E3F2FD",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   languageButtonText: {
//     color: "#2196F3",
//     fontWeight: "bold",
//   },
//   scrollContainer: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//     borderRadius: 8,
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   textContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     alignItems: "flex-start",
//   },
//   wordContainer: {
//     marginRight: 8,
//     marginBottom: 8,
//     borderRadius: 4,
//   },
//   activeWordContainer: {
//     backgroundColor: "#E3F2FD",
//   },
//   word: {
//     fontSize: 20,
//     color: "#333333",
//     lineHeight: 32,
//   },
//   highlightedWord: {
//     color: "#2196F3",
//     fontWeight: "bold",
//   },
//   lineBreak: {
//     width: "100%",
//     height: 8,
//   },
//   controlsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   controlButton: {
//     margin: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   playButton: {
//     marginHorizontal: 24,
//   },
//   activeButton: {
//     opacity: 1,
//   },
//   inactiveButton: {
//     opacity: 0.6,
//   },
//   progressContainer: {
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   timeText: {
//     fontSize: 16,
//     color: "#757575",
//   },
// });
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
});
