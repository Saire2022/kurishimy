import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider"; // You'll need to install this package

// Format time in milliseconds to MM:SS format
const formatTime = (timeInMs) => {
  if (!timeInMs) return "00:00";
  const totalSeconds = Math.floor(timeInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  onSeek,
  autoScroll,
  onToggleAutoScroll,
  currentTime,
  duration,
}) {
  // Handle slider change
  const handleSeekComplete = (value) => {
    if (onSeek) {
      onSeek(value);
    }
  };

  // Skip forward or backward
  const skipTime = (seconds) => {
    if (onSeek) {
      const newTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds * 1000)
      );
      onSeek(newTime);
    }
  };

  return (
    <View style={styles.container}>
      {/* Slider for seeking */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={currentTime}
        onSlidingComplete={handleSeekComplete}
        minimumTrackTintColor="#2196F3"
        maximumTrackTintColor="#DDDDDD"
        thumbTintColor="#2196F3"
      />

      {/* Time display */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Skip backward 5s */}
        <TouchableOpacity
          onPress={() => skipTime(-5)}
          style={styles.controlButton}
        >
          <Ionicons name="play-back" size={30} color="#757575" />
          <Text style={styles.buttonLabel}>5s</Text>
        </TouchableOpacity>

        {/* Stop button */}
        <TouchableOpacity onPress={onStop} style={styles.controlButton}>
          <Ionicons name="stop-circle" size={50} color="#FF5252" />
        </TouchableOpacity>

        {/* Play/Pause button */}
        <TouchableOpacity
          onPress={onPlayPause}
          style={[styles.controlButton, styles.playButton]}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={70}
            color="#2196F3"
          />
        </TouchableOpacity>

        {/* Auto-scroll toggle */}
        <TouchableOpacity
          onPress={onToggleAutoScroll}
          style={[
            styles.controlButton,
            autoScroll ? styles.activeButton : styles.inactiveButton,
          ]}
        >
          <Ionicons
            name="text"
            size={30}
            color={autoScroll ? "#2196F3" : "#757575"}
          />
          <Ionicons
            name={autoScroll ? "eye" : "eye-off"}
            size={20}
            color={autoScroll ? "#2196F3" : "#757575"}
          />
        </TouchableOpacity>

        {/* Skip forward 5s */}
        <TouchableOpacity
          onPress={() => skipTime(5)}
          style={styles.controlButton}
        >
          <Ionicons name="play-forward" size={30} color="#757575" />
          <Text style={styles.buttonLabel}>5s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  controlButton: {
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    marginHorizontal: 16,
  },
  activeButton: {
    opacity: 1,
  },
  inactiveButton: {
    opacity: 0.6,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#757575",
  },
  buttonLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
});

export default PlaybackControls;
export { formatTime };
