import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { formatTime } from "@/utils/formatTime";
import { colors } from "@/theme/colors";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (timeMs: number) => void;
  currentTime: number;
  duration: number;
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  currentTime,
  duration,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sliderRow}>
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
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={onPrevious} style={styles.skipButton}>
          <Ionicons
            name="play-skip-back"
            size={26}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color={colors.background}
            style={isPlaying ? undefined : styles.playIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext} style={styles.skipButton}>
          <Ionicons
            name="play-skip-forward"
            size={26}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    height: 32,
  },
  timeText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 8,
    fontVariant: ["tabular-nums"],
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    marginLeft: 3,
  },
});
