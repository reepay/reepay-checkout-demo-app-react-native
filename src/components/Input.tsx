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
  const navigation = useNavigation();
  const [apiKey, onApiKeyChange] = useState("");
  const [customerHandle, onChangeCustomer] = useState("");
  const [orderHandle, onChangeOrder] = useState("");
  const [sessionUrl, onChangedSession] = useState("");
  const [sessionId, setId] = useState("");

  function onSessionSuccess(session: any): void {
    Alert.alert("Response", JSON.stringify(session), [
      {
        text: "Create session",
        onPress: () => {
          console.log("Session:", session);
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
            onChangedSession("");
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
        title="Generate"
        onPress={() => {
          if (apiKey) {
            Api.setApiKey(apiKey.trim());
          }

          Api.getChargeSession(customerHandle, orderHandle)
            .then((session: any) => {
              onSessionSuccess(session);
            })
            .catch((rejected) => {
              onSessionError(rejected);
            });
        }}
        color={"#194c85"}
        disabled={sessionUrl.length > 0}
      ></Button>
      <View style={styles.separator} />
      <Text>Generated charge session</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={onChangedSession}
        value={sessionUrl}
        placeholder="<generated session url>"
      />
      <TextInput
        style={styles.disabledInput}
        editable={false}
        value={sessionId}
        placeholder="<generated session id>"
      />
      <Button
        title="Create checkout"
        onPress={() => {
          if (!sessionUrl.includes("https://checkout.reepay.com")) {
            alert(
              'Please enter a charge session URL from "https://checkout.reepay.com"'
            );
            return;
          }

          navigation.navigate("Checkout", {
            previousScreen: "CardCheckoutScreen",
            url: sessionUrl.trim(),
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
