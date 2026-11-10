import "react-native-gesture-handler";
import { LogBox } from "react-native";
import { registerRootComponent } from "expo";

import App from "./App";

// Ẩn cảnh báo thông tin về Push Notification trên Expo Go
LogBox.ignoreLogs([
  "[expo-notifications] Push notifications (remote notifications) are unavailable in Expo Go",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
