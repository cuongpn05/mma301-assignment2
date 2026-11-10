import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getWishlistFromFirebase,
  removeFromWishlistFirebase,
} from "../services/firebaseService";
import { triggerLocalNotification } from "../services/notificationService";
import { CartContext } from "../context/CartContext";
import StatusView from "../components/StatusView";

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { addToCart } = useContext(CartContext);

  const loadWishlist = async () => {
    setLoading(true);
    setErrorMsg("");

    const result = await getWishlistFromFirebase();
    if (result.success) {
      setItems(result.data);
    } else {
      setErrorMsg(result.error);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, []),
  );

  const handleRemoveItem = async (productId, productTitle) => {
    const res = await removeFromWishlistFirebase(productId);

    if (res.success) {
      setItems((prevList) => prevList.filter((item) => item.id !== productId));
      await triggerLocalNotification(
        "Đã xóa khỏi Wishlist 💔",
        `Đã gỡ "${productTitle || "sản phẩm"}" khỏi danh sách yêu thích.`,
      );
    } else {
      Alert.alert("Lỗi", res.error);
    }
  };

  const handleAddToCart = async (item) => {
    addToCart(item);
    await triggerLocalNotification(
      "Đã thêm vào giỏ! 🛒",
      `"${item.title}" từ Wishlist đã được thêm vào giỏ hàng.`,
    );
  };

  const handlePressItem = (productId) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleBrowseProducts = () => {
    navigation.navigate("Products");
  };

  const handleRetry = () => {
    loadWishlist();
  };

  if (loading) {
    return <StatusView status="loading" />;
  }

  if (errorMsg) {
    return (
      <StatusView
        status="error"
        errorMessage={errorMsg}
        onRetry={handleRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-dislike-outline" size={70} color="#ccc" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
        <Text style={styles.emptySubtitle}>
          {"Hãy bấm nút 'Yêu thích' ở trang chi tiết để lưu lại các sản phẩm bạn quan tâm nhé!"}
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={handleBrowseProducts}
        >
          <Text style={styles.browseBtnText}>Khám phá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity
              onPress={() => handlePressItem(item.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>

            <View style={styles.info}>
              <TouchableOpacity onPress={() => handlePressItem(item.id)}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              <Text style={styles.price}>${item.price}</Text>

              <TouchableOpacity
                style={styles.cartActionBtn}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="cart-outline" size={14} color="#0066cc" style={{ marginRight: 4 }} />
                <Text style={styles.cartActionText}>Thêm vào giỏ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.title)}
              style={styles.removeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />
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
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginVertical: 12,
    lineHeight: 18,
  },
  browseBtn: {
    backgroundColor: "#e74c3c",
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
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#e67e22",
    marginVertical: 4,
  },
  cartActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#eef6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  cartActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0066cc",
  },
  removeBtn: {
    padding: 10,
  },
});
