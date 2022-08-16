import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { Component, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Checkout from "./Checkout";
import { Input } from "./Input";

interface Props {
  navigation: any;
}

const Stack = createNativeStackNavigator();

function CardCheckoutScreen({ navigation }: { navigation: any }) {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Generate a charge session and create a Reepay Checkout
        </Text>
        <Input />
      </View>
    </ScrollView>
  );
}

export default class CardCheckout extends Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render(): ReactNode {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="CardCheckoutScreen"
          component={CardCheckoutScreen}
          options={{
            headerShown: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="Checkout"
          component={Checkout}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }
}

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
});
