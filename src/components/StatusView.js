import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function StatusView({ status, errorMessage, onRetry }) {
  if (status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.text}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.center}>
        <Text style={[styles.text, styles.errorText]}>
          {errorMessage || "Đã xảy ra sự cố kết nối!"}
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (status === "empty") {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Không tìm thấy sản phẩm nào.</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: { marginTop: 10, fontSize: 14, color: "#555" },
  errorText: { color: "#d9534f", textAlign: "center", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: { color: "#fff", fontWeight: "bold" },
});
