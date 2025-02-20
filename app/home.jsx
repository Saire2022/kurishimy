import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import Kichwa from "../components/Kichwa";
import Separator from "../components/Separator";
import Spanish from "../components/Spanish";
import PlayButton from "../components/PlayButton";

export default function Home() {
  return (
    <View style={styles.container}>
      <Kichwa />
      <Separator />
      <Spanish />
      <PlayButton />
      {/* <ProgressBar /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
