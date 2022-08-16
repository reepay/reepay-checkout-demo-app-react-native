import { CommonActions } from "@react-navigation/native";
import React from "react";
import {
  Alert, Button, ScrollView,
  StyleSheet, Text, View
} from "react-native";

export const Home = ({ navigation }: any) => {
  return (
    <View
      style={{
        flexGrow: 1,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Reepay Checkout Examples</Text>
          <Button onPress={() => navigation.openDrawer()} title="Open menu" />
        </View>
      </ScrollView>
      <View style={styles.container}>
        <Button
          onPress={() => {
            Alert.alert("Restart app", "Do you want to restart the app?", [
              {
                text: "Yes",
                onPress: () => {
                  const resetAction = CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                  navigation.dispatch(resetAction);
                },
              },
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel",
              },
            ]);
          }}
          title="Restart app"
        />
      </View>
    </View>
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
  },
  scrollView: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  statusBar: {
    backgroundColor: "#1eaa7d",
  },
});
