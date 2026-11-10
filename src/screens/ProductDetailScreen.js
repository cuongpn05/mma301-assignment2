import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { fetchProductDetailApi } from "../services/api";
import { addToWishlistFirebase } from "../services/firebaseService";
import { triggerLocalNotification } from "../services/notificationService";
import { CartContext } from "../context/CartContext";
import StatusView from "../components/StatusView";

export default function ProductDetailScreen({ route }) {
  const productId = route?.params?.productId;

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState(productId ? "loading" : "error");
  const [errorMsg, setErrorMsg] = useState(
    productId ? "" : "Không tìm thấy thông tin sản phẩm.",
  );

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let isCurrent = true;

    if (!productId) {
      return;
    }

    fetchProductDetailApi(productId)
      .then((data) => {
        if (isCurrent) {
          setProduct(data);
          setStatus("success");
          setErrorMsg("");
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setErrorMsg(err.message || "Lỗi khi tải chi tiết sản phẩm!");
          setStatus("error");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    addToCart(product);
    await triggerLocalNotification(
      "Giỏ hàng đã cập nhật! 🛒",
      `Đã thêm "${product.title}" vào giỏ hàng thành công.`,
    );
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    const res = await addToWishlistFirebase(product);
    if (res.success) {
      await triggerLocalNotification(
        "Wishlist 💖",
        `"${product.title}" đã được lưu vào danh sách yêu thích.`,
      );
    } else {
      Alert.alert("Lỗi", res.error);
    }
  };

  const handleRetry = async () => {
    if (!productId) return;
    setStatus("loading");
    try {
      const data = await fetchProductDetailApi(productId);
      setProduct(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Lỗi khi tải chi tiết sản phẩm!");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <StatusView status="loading" />;
  }

  if (status === "error") {
    return (
      <StatusView
        status="error"
        errorMessage={errorMsg}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: product?.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.content}>
          <Text style={styles.title}>{product?.title}</Text>
          <Text style={styles.brand}>
            Thương hiệu: {product?.brand || "N/A"}
          </Text>
          <Text style={styles.price}>${product?.price}</Text>
          <Text style={styles.desc}>{product?.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btn, styles.wishlistBtn]}
          onPress={handleAddToWishlist}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Yêu thích</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.cartBtn]}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 80 },
  image: { width: "100%", height: 250, backgroundColor: "#f9f9f9" },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#222" },
  brand: { fontSize: 13, color: "#777", marginVertical: 4 },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e67e22",
    marginBottom: 10,
  },
  desc: { fontSize: 14, color: "#444", lineHeight: 20 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  wishlistBtn: { backgroundColor: "#e74c3c", marginRight: 8 },
  cartBtn: { backgroundColor: "#0066cc" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
