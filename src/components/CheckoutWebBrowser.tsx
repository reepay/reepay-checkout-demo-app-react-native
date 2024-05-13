import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import React, { Component, ReactNode, useState } from "react";
import {
  Alert,
  Button,
  EmitterSubscription,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GLOBALS } from "../Globals";

interface Props {
  navigation: any;
}

const Stack = createNativeStackNavigator();

export default class CheckoutWebBrowser extends Component<Props> {
  private listener: EmitterSubscription | undefined;

  state: {
    alertShown: boolean;
  };

  constructor(props: any) {
    super(props);

    this.state = {
      alertShown: false,
    };
  }

  componentDidMount() {
    this.listener = Linking.addEventListener("url", (event) => {
      console.log("Initial url changed: ", event);

      if ((event.url as String).includes("?cancel=true")) {
        this.onCancelUrl();
        return;
      }

      if ((event.url as String).includes("accept")) {
        this.onAcceptUrl();
      }
    });
  }

  componentWillUnmount() {
    this.listener?.remove();
  }

  private onCancelUrl() {
    if (!this.state.alertShown) {
      this.setState({ alertShown: true });
      Alert.alert("Response", "Payment cancelled", [
        {
          text: "Go back",
          onPress: () => {
            WebBrowser.dismissBrowser();
            this.setState({ alertShown: false });
          },
        },
      ]);
    }
  }

  private onAcceptUrl() {
    if (!this.state.alertShown) {
      this.setState({ alertShown: true });

      if (Platform.OS === "android") {
        console.log("ANDROID MOBILEPAY: payment successful!");
        WebBrowser.dismissBrowser();
        this.setState({ alertShown: false });

        return;
      }

      Alert.alert("Response", "Payment successful", [
        {
          text: "Go back",
          onPress: () => {
            WebBrowser.dismissBrowser();
            this.setState({ alertShown: false });
          },
        },
      ]);
    }
  }

  private WebBrowserComponent() {
    const defaultSessionUrl: string = GLOBALS.TEST_CHECKOUT_SESSION_URL
      ? GLOBALS.TEST_CHECKOUT_SESSION_URL
      : "";

    const [sessionUrl, setSessionUrl] = useState(defaultSessionUrl);

    const openSessionUrl = () => {
      WebBrowser.openBrowserAsync(sessionUrl);
    };

    const copyToClipboard = () => {
      Clipboard.setStringAsync(sessionUrl);
      Alert.alert("Copied to Clipboard", `${sessionUrl}`);
    };

    return (
      <ScrollView style={styles.scrollView}>
        <SafeAreaView style={styles.container}>
          <View style={styles.container}>
            <Text style={styles.title}>Open checkout in WebBrowser</Text>
            <Text style={styles.subtitle}>
              Charge | Recurring | Subscription
            </Text>
          </View>
          <Text style={{ marginTop: 40 }}>Add checkout session URL</Text>
          <TextInput
            clearButtonMode="always"
            style={styles.input}
            onChangeText={(text: string) => {
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
          <Button
            title="Open in-app WebBrowser"
            onPress={openSessionUrl}
            disabled={!sessionUrl}
            color={"#194c85"}
          />
        </SafeAreaView>
      </ScrollView>
    );
  }

  render(): ReactNode {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="CheckoutWebBrowser"
          component={this.WebBrowserComponent}
          options={{
            headerShown: true,
            title: "Expo WebBrowser",
          }}
        ></Stack.Screen>
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
  subtitle: {
    fontWeight: "normal",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  scrollView: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  input: {
    width: 300,
    height: 50,
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
  urlText: {
    padding: 20,
  },
});
