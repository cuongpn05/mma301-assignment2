import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log("Cảnh báo cấu hình notification handler:", e);
}

export const ensureNotificationChannel = async () => {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default Channel",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (e) {
      console.log("Lỗi tạo notification channel:", e);
    }
  }
};

export const requestNotificationPermission = async () => {
  try {
    await ensureNotificationChannel();

    const existing = await Notifications.getPermissionsAsync();
    let finalGranted = existing.granted || existing.status === "granted";

    if (!finalGranted) {
      const requested = await Notifications.requestPermissionsAsync();
      finalGranted = requested.granted || requested.status === "granted";
    }

    return finalGranted;
  } catch (error) {
    console.log("Lỗi kiểm tra quyền thông báo:", error);
    return false;
  }
};

export const triggerLocalNotification = async (title, body) => {
  await ensureNotificationChannel();

  try {
    await requestNotificationPermission();

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          channelId: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });
    } catch (_err) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          channelId: "default",
        },
        trigger: null,
      });
    }

    Alert.alert(`🔔 ${title}`, body);
    return true;
  } catch (error) {
    console.log("Lỗi gửi notification (fallback sang Alert):", error);
    Alert.alert(`🔔 ${title}`, body);
    return true;
  }
};
