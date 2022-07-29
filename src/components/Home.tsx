import React from "react";
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  Platform,
} from "react-native";
import { Input } from "./Input";

const CustomStatusBar = () => {
  if (Platform.OS === "android") {
    return <StatusBar></StatusBar>;
  } else if (Platform.OS === "ios") {
    return <StatusBar barStyle={"light-content"}></StatusBar>;
  }
  return null;
};

export const Home = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <CustomStatusBar />
        <Text style={styles.title}>
          Generate a charge session and create a Reepay Checkout
        </Text>
        <Input />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  scrollView: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  statusBar: {
    backgroundColor: "#1eaa7d",
  },
});
