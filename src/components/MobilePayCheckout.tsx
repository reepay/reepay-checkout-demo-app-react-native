import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { ReactNode, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { GLOBALS } from "../Globals";
import { Api } from "../utils/Api";
import Checkout from "./Checkout";

interface Props {
  navigation: any;
}

const Stack = createNativeStackNavigator();

function PhoneInput() {
  const navigation = useNavigation();
  const [apiKey, onApiKeyChange] = useState("");
  const [phone, onChangePhone] = useState({ number: "" });
  const [customerHandle, onChangeCustomer] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");

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
    Api.getChargeSession(customerHandle, "", true, phone.number)
      .then((session: { id: string; url: string; customerHandle: string }) => {
        setSessionUrl(session.url);
        onChangeCustomer(session.customerHandle);
      })
      .catch((rejected) => {
        console.error(rejected);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Button
          title="Reset example"
          onPress={() => {
            onChangePhone({ number: "" });
            setSessionUrl("");
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
      <Text>Prefill MobilePay phone number</Text>
      <TextInput
        clearButtonMode="always"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => {
          onChangePhone({
            number: text.replace(/[^0-9]/g, "").toString(),
          });
        }}
        value={phone.number}
        placeholder="<optional> e.g. 12345678"
        maxLength={8}
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
            getCustomer();
          } else {
            createChargeSession("");
          }
        }}
        color={"#194c85"}
      ></Button>
      <TextInput
        style={styles.disabledInput}
        editable={false}
        value={sessionUrl}
        placeholder="<generated session url>"
      />
      <Button
        title="Create checkout webview"
        onPress={() => {
          navigation.navigate("Checkout", {
            previousScreen: "MobilePayCheckoutScreen",
            url: sessionUrl,
          });
        }}
        disabled={!sessionUrl}
        color={"#194c85"}
      ></Button>
    </SafeAreaView>
  );
}

function MobilePayCheckoutScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Generate a charge session and create Billwerk+ Checkout with MobilePay
          only
        </Text>
      </View>
      <PhoneInput></PhoneInput>
    </ScrollView>
  );
}

export default class MobilePayCheckout extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render(): ReactNode {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="MobilePayCheckoutScreen"
          component={MobilePayCheckoutScreen}
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
