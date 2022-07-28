import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Button,
  DevSettings,
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
  const [apiKey, setApiKey] = useState("");
  const [customerHandle, onChangeCustomer] = useState("");
  const [orderHandle, onChangeOrder] = useState("");
  const [sessionUrl, onChangedSession] = useState("");
  const [sessionId, setId] = useState("");

  const ApiKeyInput = () => {
    if (!GLOBALS.REEPAY_PRIVATE_API_KEY) {
      return (
        <View>
          <Text>Private API Key</Text>
          <TextInput
            clearButtonMode="always"
            style={styles.input}
            onChangeText={setApiKey}
            value={apiKey}
            placeholder="<your private api key>"
          />
        </View>
      );
    }
    return null;
  };

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
          title="Reset"
          onPress={() => {
            onChangeOrder("");
            onChangeCustomer("");
            onChangedSession("");
            setId("");
          }}
          color={"#194c85"}
          disabled={!sessionUrl}
        ></Button>
      </View>
      <ApiKeyInput></ApiKeyInput>
      <Text>Order handle</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        onChangeText={onChangeOrder}
        value={orderHandle}
        placeholder="order-example-9999"
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

          if (customerHandle) {
            Api.getChargeSession(customerHandle, orderHandle)
              .then((session: any) => {
                onSessionSuccess(session);
              })
              .catch((rejected) => {
                onSessionError(rejected);
              });
            return;
          }

          Api.getCustomerHandle().then((customerHandle: string) => {
            Api.getChargeSession(customerHandle, orderHandle)
              .then((session: any) => {
                onSessionSuccess(session);
              })
              .catch((rejected) => {
                onSessionError(rejected);
              });
          });
        }}
        color={"#194c85"}
        disabled={!orderHandle}
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
    borderWidth: 1,
    borderColor: "#737373",
    padding: 10,
  },
});
