import { CommonActions } from "@react-navigation/native";
import Constants from "expo-constants";
import React, { Component, ReactNode } from "react";
import { Alert, EmitterSubscription, Linking, Platform } from "react-native";
import WebView from "react-native-webview";
import { GLOBALS } from "../Globals";

interface Props {
  navigation: any;
}

export default class Checkout extends Component<Props> {
  private sessionId: string;
  private sessionUrl: string;
  private previousScreen: string;
  private listener: EmitterSubscription | undefined;
  private webview: WebView | null | undefined;

  state: {
    alertShown: boolean;
    mpUrlOpened: boolean;
  };

  constructor(props: any) {
    super(props);
    // console.log(props.route.params)

    this.sessionId = props.route.params.id;
    this.sessionUrl = props.route.params.url;
    this.previousScreen = props.route.params.previousScreen;

    this.state = {
      alertShown: false,
      mpUrlOpened: false,
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

    Constants.getWebViewUserAgentAsync().then((userAgent) => {
      console.log(
        "Checkout ~ Constants.getWebViewUserAgentAsync ~ userAgent:",
        userAgent
      );
    });
  }

  componentWillUnmount() {
    this.listener?.remove();
  }

  openWebviewUrl(url: string) {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url)
            .then(() => {
              console.log("Redirecting to:", url);
            })
            .catch((err) =>
              console.log("[Linking.openURL] error occurred", err)
            );
        } else {
          console.error("Could not open: ", url);
        }
      })
      .catch((reason) => {
        console.error("[Linking.canOpenURL] error reason:", reason);
      });
  }

  render(): ReactNode {
    const runFirst = `
      window.isNativeApp = true;
      true; // note: this is required, or you'll sometimes get silent failures
    `;
    const sessionUrl: string = GLOBALS.TEST_CHECKOUT_SESSION_URL
      ? GLOBALS.TEST_CHECKOUT_SESSION_URL
      : this.sessionUrl;

    return (
      <WebView
        ref={(ref) => (this.webview = ref)}
        source={{
          // todo: change here for testing webview url vs. html
          uri: sessionUrl, // with url
          // html: this.getReepayHtml(this.sessionId), // with html
        }}
        originWhitelist={["*"]} // allow all URIs to load
        style={{ marginVertical: 30 }}
        onLoadEnd={() => {}}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onShouldStartLoadWithRequest={(event) => {
          if (event.url !== sessionUrl) {
            this.openWebviewUrl(event.url);
            return false;
          }
          return true;
        }}
        onLoadProgress={({ nativeEvent }) => {
          // console.log(nativeEvent);
        }}
        // injectedJavaScriptBeforeContentLoaded={runFirst}
        onNavigationStateChange={(state) => {
          console.log(
            "🚀 ~ file: Checkout.tsx:82 ~ Checkout ~ render ~ state:",
            state
          );

          if (this.previousScreen === "MobilePayCheckoutScreen") {
            this.onMpUrlChange(state);
            return;
          }
          this.onUrlChange(state);
        }}
      />
    );
  }

  getReepayHtml(id: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <script src="https://checkout.reepay.com/checkout.js"></script>
        </head>
        <body>
          <div id="rp_container" style="min-width: 300px; width: 100%; height: 600px; margin: auto;"></div>
          <script>
            var rp = new Reepay.WindowCheckout("${id}", { html_element: "rp_container" });
          </script>
        </body>
        </html>
      `;
  }

  /**
   * Handle MobilePay Online url redirects
   */
  onMpUrlChange(response: any) {
    console.log("Checkout ~ onMpUrlChange ~ response:", response);

    if (response.url.includes("accept")) {
      this.onAcceptUrl();
      return;
    }

    if (response.title.includes("MobilePay")) {
      if (!this.state.mpUrlOpened) {
        this.setState({ mpUrlOpened: true });
        console.log("OPENING MP:", response.url);
        Linking.canOpenURL(response.url)
          .then((supported) => {
            if (supported) {
              Linking.openURL(response.url);
            } else {
              console.error("Could not open: ", response.url);
            }
          })
          .catch((reason) => {
            console.error("ERROR REASON:");
            console.error(reason);
          });
      }
    }
  }

  /**
   * Handle Card payment accept/cancel URL redirects
   */
  onUrlChange(response: any) {
    if (response.url.includes("cancel")) {
      this.onCancelUrl();
      return;
    }

    if (response.url.includes("accept")) {
      this.onAcceptUrl();
    }
  }

  private onCancelUrl() {
    if (!this.state.alertShown) {
      this.setState({ alertShown: true });
      Alert.alert("Response", "Payment cancelled", [
        {
          text: "Go back",
          onPress: () => {
            this.props.navigation.goBack("");
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
        this.resetAndBack();
        return;
      }

      Alert.alert("Response", "Payment successful", [
        {
          text: "Go back",
          onPress: () => {
            this.resetAndBack();
          },
        },
      ]);
    }
  }

  private resetAndBack() {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: this.previousScreen }],
    });
    this.props.navigation.dispatch(resetAction);
  }
}
