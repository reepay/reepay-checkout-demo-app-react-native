import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import React, { Component } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CardCheckout from "./src/components/CardCheckout";
import CheckoutWebBrowser from "./src/components/CheckoutWebBrowser";
import { Home } from "./src/components/Home";
import MobilePayCheckout from "./src/components/MobilePayCheckout";
import TestCheckout from "./src/components/TestCheckout";
import { Api } from "./src/utils/Api";

const Drawer = createDrawerNavigator();

const CustomStatusBar = () => {
  if (Platform.OS === "android") {
    return <StatusBar></StatusBar>;
  } else if (Platform.OS === "ios") {
    return <StatusBar barStyle={"dark-content"}></StatusBar>;
  }
  return null;
};

type Props = {};
export default class App extends Component<Props> {
  componentDidMount(): void {
    Linking.getInitialURL()
      .then((url) => {
        console.log("Deep Linking URL: " + url);
        if (url) {
          Api.setDeepLinkingUrl(url);
        } else {
          throw new Error("Missing Deep Linking URL: " + url);
        }
      })
      .catch((err) => {
        console.error("Deeplinking error", err);
        Alert.alert(
          "Missing Deep Linking URL",
          "Please run 'npm run qr' or implement your own deep linking URL scheme."
        );
      });
  }

  render() {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <CustomStatusBar />
          <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
              drawerType: "front",
              drawerStyle: {
                paddingTop: 20,
                backgroundColor: "#fff",
              },
            }}
            drawerContent={(props) => {
              return (
                <SafeAreaView style={{ flex: 1 }}>
                  <View
                    style={{
                      height: 100,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={require("./assets/billwerk-logo-color.png")}
                      style={{ flex: 1, width: 200, height: 100 }}
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
            <Drawer.Screen
              name="MobilePay Checkout"
              component={MobilePayCheckout}
              options={{
                title: "MobilePay Checkout",
                headerTintColor: "#fff",
                headerStyle: { backgroundColor: "#1eaa7d" },
                drawerIcon: () => (
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color="#194c85"
                  />
                ),
              }}
            />
            <Drawer.Screen
              name="Checkout WebView"
              component={TestCheckout}
              options={{
                title: "Checkout WebView",
                headerTintColor: "#fff",
                headerStyle: { backgroundColor: "#1eaa7d" },
                drawerIcon: () => (
                  <Ionicons name="globe-outline" size={20} color="#194c85" />
                ),
              }}
            />
            <Drawer.Screen
              name="Checkout WebBrowser"
              component={CheckoutWebBrowser}
              options={{
                title: "Checkout WebBrowser",
                headerTintColor: "#fff",
                headerStyle: { backgroundColor: "#1eaa7d" },
                drawerIcon: () => (
                  <Ionicons name="browsers-outline" size={20} color="#194c85" />
                ),
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}
