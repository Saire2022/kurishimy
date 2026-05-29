import { View, StyleSheet } from "react-native";
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
});
