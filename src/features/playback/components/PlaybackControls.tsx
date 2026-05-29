import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { formatTime } from "@/utils/formatTime";
import { colors } from "@/theme/colors";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (timeMs: number) => void;
  currentTime: number;
  duration: number;
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  onSeek,
  currentTime,
  duration,
}: PlaybackControlsProps) {
  const skipTime = (seconds: number) => {
    const newTime = Math.max(
      0,
      Math.min(duration, currentTime + seconds * 1000)
    );
    onSeek(newTime);
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={currentTime}
        onSlidingComplete={onSeek}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.sliderTrack}
        thumbTintColor={colors.primary}
      />

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={() => skipTime(-5)}
          style={styles.controlButton}
        >
          <Ionicons name="play-back" size={30} color={colors.textMuted} />
          <Text style={styles.buttonLabel}>5s</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onStop} style={styles.controlButton}>
          <Ionicons name="stop-circle" size={50} color={colors.stop} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          style={[styles.controlButton, styles.playButton]}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={70}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => skipTime(5)}
          style={styles.controlButton}
        >
          <Ionicons name="play-forward" size={30} color={colors.textMuted} />
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
  progressContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  buttonLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
