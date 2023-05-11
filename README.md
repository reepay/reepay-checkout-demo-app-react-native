# Reepay Checkout - React Native Example

This is an example of Reepay Checkout using [React Native](https://reactnative.dev/) app.

## Setup

This React Native app is built with Expo CLI. The development environment is described in [React Native Docs](https://reactnative.dev/docs/environment-setup). Install node modules with `npm install`.

```
npm install -g expo-cli
```

## Table of Contents

- [Available Scripts](#available-scripts)
  - [npm run start](#npm-run-start)
  - [npm run qr](#npm-run-qr)
  - [npm run android](#npm-run-android)
  - [npm run ios](#npm-run-ios)
  - [npm run web](#npm-run-web)
  - [npm run eject](#npm-run-eject)
- [Events](#events)
  - [Url path changes](#url-path-changes)
  - [Extra](#extra)
- [Usage](#usage)
  - [Reepay Private API Key](#reepay-private-api-key)
  - [Reepay MobilePay Checkout](#reepay-mobilepay-checkout)
- [Troubleshooting](#troubleshooting)
  - [Apple Silicon build issues](#apple-silicon-build-issues)

## Available Scripts

The project is built with `node version v16.15.1`, `npm version 8.11.0`, `React Native version 0.68.2` and [`React Native WebView 11.18.1`](https://github.com/react-native-webview/react-native-webview).

### `npm run start`

Runs your app in development mode.

```
npm run start
```

### `npm run qr`

Runs your app in [Expo](https://expo.dev/) development client by scanning the generated QR code. The app can be viewed using [Expo for Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [Expo Go for iOS](https://apps.apple.com/us/app/expo-go/id982107779).

```
npm run qr
```

#### `npm run android`

Like `npm run start`, but also attempts to open your app on a connected Android device or Android emulator. It requires installation of Android build tools (see [React Native Docs](https://reactnative.dev/docs/running-on-device) for how to run on devices). An Android folder will be generated which can be opened with [Android Studio](https://developer.android.com/studio).

```
npm run android
```

#### `npm run ios`

Like `npm run start`, but also attempts to open your app on an iOS simulator. An iOS folder will be generated which can be opened in [Xcode](https://developer.apple.com/xcode/), which you can run your app on an [iOS device](https://reactnative.dev/docs/running-on-device#running-your-app-on-ios-devices). There may be some issues with Apple Silicon processor (M1) if you are using nvm and running your app with `npm run ios`. Read more under [Troubleshooting](#troubleshooting).

```
npm run ios
```

#### `npm run web`

Runs your app in a web browser.

```
npm run web
```

#### `npm run eject`

If you plan to include your own native code, you will need to "eject" to create your own native builds. The "React Native CLI Quickstart" instructions will be required to continue working on this project.

Warning: Running eject is a permanent action (aside from whatever version control system you use). An ejected app will require you to have an [Xcode and/or Android Studio environment](https://reactnative.dev/docs/environment-setup) set up.

```
npm run eject
```

## Events
In the app, we will use URL path changes as events that WebView listens to, thus checking whether URL contains `accept` or `cancel` in the path. 

### URL path changes
As we are using WebView by passing session URL, we will receive response with as either Accept URL or Cancel URL as defined in the request body [docs](https://docs.reepay.com/reference/createchargesession):
```
{
  ...
  "accept_url":"https://webshop.com/accept/order-12345",
  "cancel_url":"https://webshop.com/decline/order-12345"
}
```
In the WebView, we will listen to URL changes when the checkout has completed a redirect, either accept or cancel by checking the URL path. For example the above cancel_url, we will check for `/decline` meaning the cancel_url has been triggered and WebView has redirected. 

### Extra
For additional parameters to be passed, use query parameters in `accept_url` or `cancel_url`. For example, `https://webshop.com/decline/order-12345?myEvent=someValue&yourEvent=anotherValue`.

## Usage

Card payment steps:

1. Generate Private API Key from your Reepay account.
2. Add the Private API Key to Globals.ts or in the app.
3. (Optional) Add an unique identifier for your Order and/or Customer handle.
4. Generate a charge session.
5. Create Reepay checkout in the webview.
6. Complete the purchase with a [test card](https://reference.reepay.com/api/#testing) or cancel the checkout.

#### Accept flow

https://user-images.githubusercontent.com/108516218/181744232-6ecc46e1-34e1-48cb-95a0-61467cfe0f88.MOV

#### Cancel flow

https://user-images.githubusercontent.com/108516218/181744248-75d8d79a-e953-4335-8d0b-d5dd8fbb4523.MOV

### Reepay Private API Key

When you have generated a [Private API Key](https://app.reepay.com/#/rp/dev/api) from Reepay. Add the value to `REEPAY_PRIVATE_API_KEY` located at `./src/Globals.ts`.

Alternatively, run your app and add it directly in the Private API Key input field.

<img width="382" alt="Screenshot 2022-07-29 at 12 37 23" src="https://user-images.githubusercontent.com/108516218/181742087-5f6f5a55-be59-41fe-9768-377a5c5bbb04.png">

### Reepay MobilePay Checkout

MobilePay Online must be activated in your Reepay account under Configuration -> Payment Methods -> Mobile Payments. For Reepay Test accounts, it is required to get [`MobilePay Sandbox`](https://developer.mobilepay.dk/products/online/getting-started) app. Reepay Live accounts will use `MobilePay` app.

Recommended to use `npm run qr` for testing MobilePay Checkout.

MobilePay Online steps:

1. Generate Private API Key from your Reepay account.
2. Add the Private API Key to Globals.ts or in the app.
3. Add a Danish phone number.
4. Generate a charge session.
5. Create MobilePay checkout in the webview.
6. Complete the purchase with a [MobilePay test user](https://developer.mobilepay.dk/products/online/test) or reject the payment.

https://user-images.githubusercontent.com/108516218/185397780-77cc8d5b-16e6-4a35-90c4-93e99e6748e5.mov

## Troubleshooting

### Apple Silicon build issues

An issue have been found regarding building React Native apps for iOS using Apple Silicon processors (M1). There are conflicts with node version when using nvm thus creating errors on build.

Upon receiving `PhaseScriptExecution [CP-User] error` when building iOS using `npm run ios`. Follow this temporary [solution](https://stackoverflow.com/questions/66742033/phasescriptexecution-cp-user-error-in-react-native/70309731#70309731).

Note that the iOS build works when running in Xcode. In case of the Xcode build error `Could not find node. Make sure it is in bash PATH or set the NODE_BINARY environment variable.`, please refer to [this.](https://stackoverflow.com/a/67342683/18702051)
