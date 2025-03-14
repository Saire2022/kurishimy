import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatTime } from "../scripts/wordProcessor";

function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  autoScroll,
  onToggleAutoScroll,
  currentTime,
  duration,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onStop} style={styles.controlButton}>
          <Ionicons name="stop-circle" size={50} color="#FF5252" />
        </TouchableOpacity>

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
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  controlButton: {
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    marginHorizontal: 24,
  },
  activeButton: {
    opacity: 1,
  },
  inactiveButton: {
    opacity: 0.6,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  timeText: {
    fontSize: 16,
    color: "#757575",
  },
});

export default PlaybackControls;
