import { CommonActions, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import React, { ReactNode, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GLOBALS } from "../Globals";
import Checkout from "./CheckoutWebView";

interface Props {
  navigation: any;
}

const Stack = createNativeStackNavigator();

function SessionUrlInput() {
  const defaultSessionUrl: string = GLOBALS.TEST_CHECKOUT_SESSION_URL
    ? GLOBALS.TEST_CHECKOUT_SESSION_URL
    : "";

  const navigation = useNavigation();
  const [sessionUrl, setSessionUrl] = useState(defaultSessionUrl);
  const [clipboardText, setClipboardText] = useState("");

  const copyToClipboard = () => {
    Clipboard.setStringAsync(sessionUrl);
    setClipboardText("Copied to clipboard");
    setTimeout(() => setClipboardText(""), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ marginTop: 40 }}>Add checkout session URL</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={(text) => {
          setSessionUrl(text);
        }}
        value={sessionUrl}
        placeholder="https://checkout.reepay.com/#/<id>"
      />
      {sessionUrl ? (
        <TouchableOpacity onPress={copyToClipboard}>
          <Text style={styles.urlText}>{sessionUrl}</Text>
        </TouchableOpacity>
      ) : null}
      {clipboardText ? (
        <Text style={styles.clipboardText}>{clipboardText}</Text>
      ) : null}
      <Button
        title="Create checkout webview"
        onPress={() => {
          if (!sessionUrl.startsWith("https://" || "http://")) {
            Alert.alert("Error", "Url must start with https:// or http://");
            setSessionUrl(`https://${sessionUrl}`);
            return;
          }

          navigation.dispatch(
            CommonActions.navigate({
              name: "Checkout",
              params: {
                previousScreen: "TestCheckoutScreen",
                url: sessionUrl.trim(),
              },
            })
          );
        }}
        disabled={!sessionUrl}
        color={"#194c85"}
      />
    </SafeAreaView>
  );
}

function TestCheckoutScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Open checkout in WebView</Text>
        <Text style={styles.subtitle}>Charge | Recurring | Subscription</Text>
      </View>
      <SessionUrlInput />
    </ScrollView>
  );
}

export default class TestCheckout extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render(): ReactNode {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TestCheckoutScreen"
          component={TestCheckoutScreen}
          options={{
            headerShown: true,
            title: "React Native WebView",
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="Checkout"
          component={Checkout}
          options={{
            headerShown: true,
            title: "React Native WebView",
          }}
        />
      </Stack.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    width: 300,
    height: 50,
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  subtitle: {
    fontWeight: "normal",
    fontSize: 14,
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
  urlText: {
    padding: 20,
  },
  clipboardText: {
    paddingBottom: 20,
    color: "#1eaa7d",
  },
});
