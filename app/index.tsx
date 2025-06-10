import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Logo } from "../assets/images/logo";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const handlePress = () => {
    router.push("./forcedAlignment");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textTitle}>Bienvenido a Kury Shimy</Text>
      <View>
        <Logo width={300} height={300} />
      </View>

      <Text style={styles.text}>
        {" "}
        Una App diseñada para el aprendizaje de nuestro idioma nativo. Mediante
        el uso de la lectura y el audio, podrás aprender de una manera más
        sencilla y rápida. ¿Estás listo?, empecemos!.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.textbutton}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c0c0c0",
  },
  textTitle: {
    fontSize: 30,
    color: "black",
    margin: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 26,
    color: "black",
    margin: 20,
  },
  textbutton: {
    fontSize: 20,
    color: "white",
  },
  button: {
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 5,
    marginTop: 20,
  },
});
