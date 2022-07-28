import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Checkout from "./src/components/Checkout";
import { Home } from "./src/components/Home";
import { Button } from "react-native";
import { Input } from "./src/components/Input";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "Reepay Checkout Example",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#1eaa7d" },
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={Checkout}
          options={{
            title: "Checkout",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#1eaa7d" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
