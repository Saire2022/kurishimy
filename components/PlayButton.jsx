import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View>
      <TouchableOpacity onPress={togglePlayPause}>
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={60}
          color="black"
        />
      </TouchableOpacity>
    </View>
  );
}
