import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { triggerLocalNotification } from "../services/notificationService";

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useContext(CartContext);

  const handleIncreaseQuantity = (item) => {
    addToCart(item);
  };

  const handleDecreaseQuantity = (productId) => {
    decreaseQuantity(productId);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handlePressItem = (productId) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleBrowseProducts = () => {
    navigation.navigate("Products");
  };

  const handleCheckout = () => {
    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn có muốn thanh toán ${totalItems} sản phẩm với tổng số tiền $${totalPrice}?`,
      [
        { text: "Để sau", style: "cancel" },
        {
          text: "Xác nhận đặt hàng",
          onPress: async () => {
            const finalAmount = totalPrice;
            clearCart();
            await triggerLocalNotification(
              "Đặt hàng thành công! 📦",
              `Đơn hàng trị giá $${finalAmount} của bạn đang được xử lý và giao đến sớm nhất.`,
            );
          },
        },
      ],
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cart-outline" size={70} color="#ccc" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
        <Text style={styles.emptySubtitle}>Hãy khám phá thêm hàng trăm sản phẩm hấp dẫn nhé!</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={handleBrowseProducts}
        >
          <Text style={styles.browseBtnText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              onPress={() => handlePressItem(item.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="cover" />
            </TouchableOpacity>

            <View style={styles.itemInfo}>
              <TouchableOpacity onPress={() => handlePressItem(item.id)}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>${item.price}</Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleDecreaseQuantity(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#333" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleIncreaseQuantity(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id)}
              style={styles.deleteBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Tổng {totalItems} sản phẩm</Text>
          <Text style={styles.totalValue}>${totalPrice}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#e67e22",
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    backgroundColor: "#f1f3f5",
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  deleteBtn: {
    padding: 10,
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
  },
  totalBlock: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#e67e22",
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
