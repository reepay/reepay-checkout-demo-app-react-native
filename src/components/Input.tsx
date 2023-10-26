import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GLOBALS } from "../Globals";
import { Api } from "../utils/Api";

export const Input = () => {
  const defaultSessionUrl: string = GLOBALS.TEST_CHECKOUT_SESSION_URL
    ? GLOBALS.TEST_CHECKOUT_SESSION_URL
    : "";

  const navigation = useNavigation();
  const [apiKey, onApiKeyChange] = useState("");
  const [customerHandle, onChangeCustomer] = useState("");
  const [orderHandle, onChangeOrder] = useState("");
  const [sessionUrl, onChangedSession] = useState(defaultSessionUrl);
  const [sessionId, setId] = useState("");

  function getCustomer(): void {
    Api.getCustomer(customerHandle).then(
      (handle: string) => {
        if (!handle) {
          Alert.alert("Error", "Customer not found");
          return;
        }
        createChargeSession(handle);
      },
      (error) => {
        Alert.alert("Error", JSON.stringify(error));
      }
    );
  }

  function createChargeSession(customerHandle: string): void {
    Api.getChargeSession(customerHandle, orderHandle)
      .then((session: { id: string; url: string; customerHandle: string }) => {
        onSessionSuccess(session);
      })
      .catch((rejected) => {
        onSessionError(rejected);
      });
  }

  function onSessionSuccess(session: {
    id: string;
    url: string;
    customerHandle: string;
  }): void {
    Alert.alert("Response", JSON.stringify(session), [
      {
        text: "Enter session",
        onPress: () => {
          console.log("Session:", session);
          onChangeCustomer(session.customerHandle);
          onChangedSession(session.url);
          setId(session.id);
        },
      },
    ]);
  }

  function onSessionError(rejected: any): void {
    Alert.alert("Error", JSON.stringify(rejected), [
      {
        text: "OK",
        onPress: () => {
          console.error("Rejected:", rejected);
        },
      },
    ]);
  }

  return (
    <SafeAreaView>
      <View>
        <Button
          title="Reset example"
          onPress={() => {
            onApiKeyChange("");
            onChangeOrder("");
            onChangeCustomer("");
            onChangedSession(defaultSessionUrl);
            setId("");
          }}
          color={"#194c85"}
        ></Button>
      </View>
      {GLOBALS.REEPAY_PRIVATE_API_KEY ? (
        <Text style={styles.header}>API key added</Text>
      ) : (
        <View>
          <Text>Private API Key</Text>
          <TextInput
            clearButtonMode="always"
            style={styles.input}
            onChangeText={onApiKeyChange}
            value={apiKey}
            placeholder="<your private api key>"
          />
        </View>
      )}
      <Text>Order handle</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={onChangeOrder}
        value={orderHandle}
        placeholder="<optional>"
      />
      <Text>Customer handle</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={onChangeCustomer}
        value={customerHandle}
        placeholder="<optional>"
      />
      <Button
        title="Generate session"
        onPress={() => {
          if (apiKey) {
            Api.setApiKey(apiKey.trim());
          }

          if (customerHandle) {
            getCustomer();
          } else {
            createChargeSession("");
          }
        }}
        color={"#194c85"}
        disabled={sessionUrl.length > 0}
      ></Button>
      <View style={styles.separator} />
      <Text>Generated checkout session</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={(text) => {
          onChangedSession(text);
          if (!text) {
            setId("");
          }
        }}
        value={sessionUrl}
        placeholder="https://checkout.reepay.com/#/<id>"
      />
      <TextInput
        style={styles.disabledInput}
        editable={false}
        value={sessionId}
        placeholder="<generated session id>"
      />
      <Button
        title="Create checkout webview"
        onPress={() => {
          if (!sessionUrl.startsWith("https://" || "http://")) {
            Alert.alert("Error", "Url must start with https:// or http://");
            onChangedSession(`https://${sessionUrl}`);
            return;
          }

          navigation.navigate("Checkout", {
            previousScreen: "CardCheckoutScreen",
            url: sessionUrl.trim(),
            id: sessionId.trim(),
          });
        }}
        disabled={!sessionUrl}
        color={"#194c85"}
      ></Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    margin: 20,
    textAlign: "center",
    color: "#1eaa7d",
    fontSize: 17,
  },
  input: {
    width: 300,
    height: 50,
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
  separator: {
    marginTop: 10,
    marginBottom: 30,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disabledInput: {
    width: 300,
    height: 50,
    margin: 10,
    borderWidth: 0.2,
    borderColor: "#737373",
    padding: 10,
    color: "#737373",
  },
});
