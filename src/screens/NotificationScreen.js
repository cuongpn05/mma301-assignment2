import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermission,
  triggerLocalNotification,
} from "../services/notificationService";

export default function NotificationScreen() {
  const [permissionStatus, setPermissionStatus] = useState("Đang kiểm tra...");
  const [isGranted, setIsGranted] = useState(false);

  const checkCurrentPermission = useCallback(async () => {
    try {
      const res = await Notifications.getPermissionsAsync();
      const granted = Boolean(res.granted || res.status === "granted");
      setIsGranted(granted);

      if (granted) {
        setPermissionStatus("Đã cấp quyền (Allowed)");
      } else if (res.status === "undetermined") {
        setPermissionStatus("Chưa xác nhận (Chờ cấp quyền)");
      } else {
        setPermissionStatus("Chưa cấp quyền (Denied / Disabled)");
      }
    } catch (e) {
      console.log("Lỗi kiểm tra quyền thông báo:", e);
      setIsGranted(false);
      setPermissionStatus("Không hỗ trợ trên thiết bị này");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkCurrentPermission();
    }, [checkCurrentPermission]),
  );

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      setIsGranted(granted);
      setPermissionStatus(
        granted ? "Đã cấp quyền (Allowed)" : "Chưa cấp quyền (Denied / Disabled)",
      );

      if (granted) {
        Alert.alert("Thành công", "Bạn đã cấp quyền thông báo thành công!");
      } else {
        Alert.alert(
          "Chưa có quyền thông báo",
          "Trên Android / Expo Go, nếu hệ thống không hiện bảng hỏi, bạn cần vào Cài đặt máy > Ứng dụng > Expo Go > Thông báo và bật 'Cho phép thông báo'.",
          [
            { text: "Để sau", style: "cancel" },
            { text: "Mở Cài đặt", onPress: handleOpenDeviceSettings },
          ],
        );
      }
    } catch (e) {
      console.log("Lỗi yêu cầu quyền:", e);
      Alert.alert(
        "Thông báo",
        "Không thể yêu cầu quyền thông báo trên môi trường này.",
      );
    }
  };

  const handleRefreshStatus = () => {
    checkCurrentPermission();
  };

  const handleOpenDeviceSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert(
        "Lỗi",
        "Không thể mở Cài đặt tự động. Vui lòng vào Cài đặt thiết bị của bạn.",
      );
    });
  };

  const handleTestNotification = async () => {
    await triggerLocalNotification(
      "Ưu đãi đặc biệt! 🎁",
      "Đơn hàng đầu tiên của bạn đang được giảm giá 10% hôm nay.",
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Thông báo</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Trạng thái quyền thiết bị:</Text>
        <Text
          style={[
            styles.status,
            isGranted ? styles.textGreen : styles.textRed,
          ]}
        >
          {permissionStatus}
        </Text>
        {!isGranted && (
          <Text style={styles.hint}>
            💡 Lưu ý: Trên Expo Go Android, quyền thông báo phụ thuộc vào cài đặt ứng dụng Expo Go trên máy của bạn.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleRequestPermission}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Yêu cầu cấp quyền</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnRefresh}
        onPress={handleRefreshStatus}
        activeOpacity={0.8}
      >
        <Text style={styles.btnRefreshText}>🔄 Làm mới / Kiểm tra lại trạng thái</Text>
      </TouchableOpacity>

      {!isGranted && (
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={handleOpenDeviceSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.btnOutlineText}>⚙️ Mở Cài đặt máy để bật quyền</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={handleTestNotification}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Gửi thông báo thử nghiệm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#333" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1,
  },
  label: { fontSize: 14, color: "#666", marginBottom: 6 },
  status: { fontSize: 16, fontWeight: "bold" },
  hint: { fontSize: 12, color: "#888", marginTop: 8, lineHeight: 18 },
  textGreen: { color: "#28a745" },
  textRed: { color: "#dc3545" },
  btnPrimary: {
    backgroundColor: "#0066cc",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnRefresh: {
    backgroundColor: "#eef2f7",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnRefreshText: { color: "#333", fontSize: 13, fontWeight: "500" },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0066cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnOutlineText: { color: "#0066cc", fontWeight: "600", fontSize: 14 },
  btnSecondary: {
    backgroundColor: "#17a2b8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
