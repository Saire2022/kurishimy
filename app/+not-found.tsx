import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { es } from "@/i18n/es";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: es.notFound.screenTitle }} />
      <Text>{es.notFound.message}</Text>
      <Link href="/" style={styles.link}>
        <Text>{es.notFound.goHome}</Text>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
