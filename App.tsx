import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Image, Platform, SafeAreaView, StatusBar, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CardCheckout from "./src/components/CardCheckout";
import { Home } from "./src/components/Home";

const Drawer = createDrawerNavigator();

const CustomStatusBar = () => {
  if (Platform.OS === "android") {
    return <StatusBar></StatusBar>;
  } else if (Platform.OS === "ios") {
    return <StatusBar barStyle={"dark-content"}></StatusBar>;
  }
  return null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <CustomStatusBar />
        <Drawer.Navigator
          initialRouteName="CardCheckout"
          useLegacyImplementation
          screenOptions={{
            drawerType: "front",
            drawerStyle: {
              paddingTop: 20,
            },
          }}
          drawerContent={(props) => {
            return (
              <SafeAreaView style={{ flex: 1 }}>
                <View
                  style={{
                    height: 60,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("./assets/reepay-logo-color.png")}
                    style={{ flex: 1, width: 200, height: 60 }}
                    resizeMode="contain"
                  />
                </View>
                <ScrollView>
                  <DrawerItemList {...props} />
                </ScrollView>
              </SafeAreaView>
            );
          }}
        >
          <Drawer.Screen
            name="Home"
            component={Home}
            options={{
              title: "Home",
              headerTintColor: "#fff",
              headerStyle: { backgroundColor: "#1eaa7d" },
              drawerIcon: () => (
                <Ionicons name="home-outline" size={20} color="#194c85" />
              ),
            }}
          />
          <Drawer.Screen
            name="CardCheckout"
            component={CardCheckout}
            options={{
              title: "Card Checkout",
              headerTintColor: "#fff",
              headerStyle: { backgroundColor: "#1eaa7d" },
              drawerIcon: () => (
                <Ionicons name="card-outline" size={20} color="#194c85" />
              ),
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
