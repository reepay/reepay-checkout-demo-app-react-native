import { CommonActions } from "@react-navigation/native";
import React, { Component, ReactNode } from "react";
import { Alert, EmitterSubscription, Linking, Platform } from "react-native";
import WebView from "react-native-webview";

interface Props {
  navigation: any;
}

export default class Checkout extends Component<Props> {
  private sessionUrl: string;
  private previousScreen: string;
  private listener: EmitterSubscription | undefined;

  state: {
    alertShown: boolean;
    mpUrlOpened: boolean;
  };

  constructor(props: any) {
    super(props);
    // console.log(props.route.params);
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
        this.props.navigation.goBack();
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

  render(): ReactNode {
    return (
      <WebView
        source={{
          uri: this.sessionUrl,
        }}
        style={{ marginVertical: 30 }}
        onLoadEnd={() => {}}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onShouldStartLoadWithRequest={() => true}
        onLoadProgress={({ nativeEvent }) => {
          // console.log(nativeEvent);
        }}
        onNavigationStateChange={(state) => {
          // console.log(state);

          if (this.previousScreen === "MobilePayCheckoutScreen") {
            this.onMpUrlChange(state);
            return;
          }
          this.onUrlChange(state);
        }}
      />
    );
  }

  /**
   * Handle MobilePay Online url redirects
   */
  onMpUrlChange(response: any) {
    console.log(response);

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
      this.props.navigation.goBack("");
      return;
    }

    if (response.url.includes("accept")) {
      if (!this.state.alertShown) {
        this.setState({ alertShown: true });
        Alert.alert("Response", "Payment successful", [
          {
            text: "Go back",
            onPress: () => {
              this.onAcceptUrl();
            },
          },
        ]);
      }
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
