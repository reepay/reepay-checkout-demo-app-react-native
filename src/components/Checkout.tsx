import { CommonActions } from "@react-navigation/native";
import React, { Component, ReactNode } from "react";
import { Alert } from "react-native";
import WebView from "react-native-webview";

interface Props {
  navigation: any;
}

export default class Checkout extends Component<Props> {
  private sessionUrl: string;

  state: {
    alertShown: boolean;
  };

  constructor(props: any) {
    super(props);
    // console.log(props.route.params);
    this.sessionUrl = props.route.params.url;

    this.state = {
      alertShown: false,
    };
  }

  /**
   * Handle accept/cancel URL redirects
   */
  onUrlChange(url: string): void {
    if (url.includes("cancel")) {
      this.props.navigation.goBack("");
    }
    if (url.includes("accept")) {
      if (!this.state.alertShown) {
        this.setState({ alertShown: true });
        Alert.alert("Response", "Payment successful", [
          {
            text: "Go back",
            onPress: () => {
              const resetAction = CommonActions.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
              this.props.navigation.dispatch(resetAction);
            },
          },
        ]);
      }
    }
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
          this.onUrlChange(state.url);
        }}
      />
    );
  }
}
