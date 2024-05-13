import { CommonActions } from "@react-navigation/native";
import Constants from "expo-constants";
import React, { Component, ReactNode } from "react";
import {
  Alert,
  EmitterSubscription,
  Linking,
  Platform,
  View,
} from "react-native";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { GLOBALS } from "../Globals";
import { Api } from "../utils/Api";
import { getLogger } from "../utils/Logger";

interface Props {
  navigation: any;
}

export default class CheckoutWebView extends Component<Props> {
  private sessionId: string;
  private sessionUrl: string;
  private previousScreen: string;
  private listener: EmitterSubscription | undefined;
  private webview: WebView | null | undefined;

  private logger = getLogger();

  state: {
    alertShown: boolean;
    mpUrlOpened: boolean;
    url: string;
    shouldLoad: boolean;
  };

  constructor(props: any) {
    super(props);
    // console.log(JSON.stringify(props.route.params));

    this.sessionId = props.route.params.id;
    this.sessionUrl = props.route.params.url;
    this.previousScreen = props.route.params.previousScreen;

    this.state = {
      alertShown: false,
      mpUrlOpened: false,
      url: this.sessionUrl,
      shouldLoad: false,
    };
  }

  componentDidMount() {
    this.listener = Linking.addEventListener("url", (event: any) => {
      console.log("Initial url changed: ", event);

      if ((event.url as String).includes("?cancel=true")) {
        this._onCancelUrl();
        return;
      }

      if ((event.url as String).includes("accept")) {
        this._onAcceptUrl();
      }
    });

    Constants.getWebViewUserAgentAsync().then((userAgent: string) => {
      this.logger.info("Constants.getWebViewUserAgentAsync:", userAgent);
    });
  }

  componentWillUnmount() {
    this.listener?.remove();
  }

  private _openUrl(url: string) {
    const isHyperTextUrl: boolean = url.startsWith("http");
    const isDeepLinkingUrl: boolean = url.includes(Api.getDeepLinkingUrl());
    const isStagingRedirectUrl: boolean = url.includes(
      "https://staging-checkout-api.reepay.com/redirect"
    );
    const isMobilePaymentMethod: boolean =
      url.includes("mobilepay") ||
      url.includes("swish") ||
      url.includes("vipps");

    // * Trigger app switch:
    if (isMobilePaymentMethod && !isStagingRedirectUrl && !isDeepLinkingUrl) {
      this._openExternalBrowser(url);
      return;
    }

    // * Stay within webview:
    if (isHyperTextUrl) {
      this._openInWebView(url);
      return;
    }
  }

  // Load URL within webview
  private _openInWebView(url: string) {
    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (!supported) {
          console.error("[Linking.canOpenURL] Could not open URL:", url);
          return;
        }
        this.logger.info("[_openInWebView] URL:", url);
        this.setState({ url: url, shouldLoad: true });
      })
      .catch((reason: any) => {
        console.error("[Linking.canOpenURL] error reason:", reason);
      });
  }

  // Open URL in external browser / app switch
  private _openExternalBrowser(url: string) {
    Linking.openURL(url)
      .then(() => {
        this.logger.info("[_openExternalBrowser] URL:", url);
      })
      .catch((err: any) =>
        console.error("[Linking.openURL] error occurred", err)
      );
  }

  render(): ReactNode {
    const sessionUrl: string =
      this.sessionUrl ?? GLOBALS.TEST_CHECKOUT_SESSION_URL;

    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={(ref) => (this.webview = ref)}
          source={{
            // todo: change here for testing webview url vs. html
            uri: this.state.url, // with url
            // html: this._getReepayHtml(this.sessionId), // with html
          }}
          originWhitelist={["*"]} // allow all URIs to load
          style={{ marginVertical: 30 }}
          onLoadEnd={(event: any) => {
            this.logger.debug("event.nativeEvent.url", event.nativeEvent?.url);
            this.setState({ url: event.nativeEvent?.url, shouldLoad: false });
          }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          pullToRefreshEnabled={true}
          onShouldStartLoadWithRequest={(event: ShouldStartLoadRequest) => {
            /**
             * Special case handling iframes for iOS
             * isFirstLoad is needed b/c onShouldStartLoadWithRequest is called on first load
             * isTopFrame is needed to separate iframe requests from topframe requests
             */
            if (Platform.OS === "ios") {
              const isFirstLoad = event.url === sessionUrl && !event.canGoBack;
              if (!event.isTopFrame || isFirstLoad) return true;
            }

            if (event.url !== sessionUrl) {
              this._openUrl(event.url);
              return this.state.shouldLoad;
            }
            return true;
          }}
          onLoadProgress={({ nativeEvent }) => {
            // console.log(nativeEvent);
          }}
          onNavigationStateChange={(state) => {
            // this.logger.debug("[WebView][onNavigationStateChange]", state);

            if (this.previousScreen === "MobilePayCheckoutScreen") {
              this._onMpUrlChange(state);
              return;
            }
            this._onUrlChange(state);
          }}
        />
      </View>
    );
  }

  private _getReepayHtml(id: string): string {
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
  private _onMpUrlChange(response: any) {
    console.log("Checkout ~ onMpUrlChange ~ response:", response);

    if (response.url.includes("accep=true")) {
      this._onAcceptUrl();
      return;
    }

    if (response.title.includes("MobilePay")) {
      if (!this.state.mpUrlOpened) {
        this.setState({ mpUrlOpened: true });
        console.log("OPENING MP:", response.url);
        Linking.canOpenURL(response.url)
          .then((supported: boolean) => {
            if (supported) {
              Linking.openURL(response.url);
            } else {
              console.error("Could not open: ", response.url);
            }
          })
          .catch((reason: any) => {
            console.error("ERROR REASON:");
            console.error(reason);
          });
      }
    }
  }

  /**
   * Handle Card payment accept/cancel URL redirects
   */
  private _onUrlChange(response: any) {
    if (response.url.includes("cancel=true")) {
      this._onCancelUrl();
      return;
    }

    if (response.url.includes("accept=true")) {
      this._onAcceptUrl();
    }
  }

  private _onCancelUrl() {
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

  private _onAcceptUrl() {
    if (!this.state.alertShown) {
      this.setState({ alertShown: true });

      if (Platform.OS === "android") {
        console.log("ANDROID MOBILEPAY: payment successful!");
        this._resetAndBack();
        return;
      }

      Alert.alert("Response", "Payment successful", [
        {
          text: "Go back",
          onPress: () => {
            this._resetAndBack();
          },
        },
      ]);
    }
  }

  private _resetAndBack() {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: this.previousScreen }],
    });
    this.props.navigation.dispatch(resetAction);
  }
}
