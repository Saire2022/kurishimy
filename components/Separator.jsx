import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Octicons from "@expo/vector-icons/Octicons";
export default function Separator() {
  return (
    <View style={styles.container}>
      <Octicons name="horizontal-rule" size={24} color="black" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});
