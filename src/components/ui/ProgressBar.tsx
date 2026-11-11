import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface ProgressBarProps {
  /** How full the bar is, from 0 to 1. */
  fraction: number;
}

export function ProgressBar({ fraction }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.sliderTrack,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
