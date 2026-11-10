import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchAllProductsForAI } from "../services/api";
import { getGeminiRecommendation } from "../services/geminiService";
import { CartContext } from "../context/CartContext";
import { triggerLocalNotification } from "../services/notificationService";

const QUICK_PROMPTS = [
  { icon: "shirt-outline", label: "Váy dự tiệc", query: "Tìm váy đầm dạ hội sang trọng, quyến rũ" },
  { icon: "phone-portrait-outline", label: "Smartphone", query: "Điện thoại thông minh cấu hình tốt, camera đẹp" },
  { icon: "laptop-outline", label: "Laptop văn phòng", query: "Máy tính xách tay mỏng nhẹ, pin trâu" },
  { icon: "rose-outline", label: "Nước hoa cao cấp", query: "Nước hoa hương thơm ngọt ngào, lưu hương lâu" },
  { icon: "sparkles-outline", label: "Dưỡng da / Beauty", query: "Sản phẩm dưỡng da mềm mịn, cấp ẩm tốt" },
  { icon: "watch-outline", label: "Đồng hồ thời trang", query: "Đồng hồ đeo tay thanh lịch, sang trọng" },
];

export default function AIScreen({ navigation }) {
  const [userNeed, setUserNeed] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    let isCurrent = true;

    fetchAllProductsForAI()
      .then((products) => {
        if (isCurrent) {
          setCatalog(products);
        }
      })
      .catch((err) => {
        console.log("Lỗi tải toàn bộ kho hàng cho AI:", err);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleConsultAI = async (queryText) => {
    const targetQuery = (typeof queryText === "string" ? queryText : userNeed).trim();

    if (!targetQuery) {
      Alert.alert("Gợi ý", "Vui lòng nhập nhu cầu mua sắm của bạn!");
      return;
    }

    if (typeof queryText === "string") {
      setUserNeed(queryText);
    }

    setLoading(true);
    setResult(null);

    let currentCatalog = catalog;
    if (!currentCatalog || currentCatalog.length === 0) {
      try {
        currentCatalog = await fetchAllProductsForAI();
        setCatalog(currentCatalog);
      } catch (err) {
        console.log("Lỗi tải lại catalog:", err);
      }
    }

    const aiResponse = await getGeminiRecommendation(targetQuery, currentCatalog);
    setResult(aiResponse);
    setLoading(false);
  };

  const handleSelectQuickPrompt = (promptItem) => {
    handleConsultAI(promptItem.query);
  };

  const handleClearInput = () => {
    setUserNeed("");
  };

  const handlePressProductDetail = (productId) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleAddToCartFromAI = async (recommendedProduct) => {
    if (!recommendedProduct) return;

    addToCart(recommendedProduct);
    await triggerLocalNotification(
      "Đã thêm từ gợi ý AI! ✨",
      `"${recommendedProduct.title}" đã được thêm vào giỏ hàng.`,
    );
  };

  const handleResetSearch = () => {
    setUserNeed("");
    setResult(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color="#6366f1" />
              <Text style={styles.aiBadgeText}>Google Gemini Powered</Text>
            </View>
            <Text style={styles.catalogCountText}>
              📦 {catalog.length > 0 ? `${catalog.length} sản phẩm` : "Đang đồng bộ kho"}
            </Text>
          </View>

          <Text style={styles.heroTitle}>Trợ lý Mua sắm AI</Text>
          <Text style={styles.heroSubtitle}>
            Mô tả món đồ bạn muốn tìm, Gemini AI sẽ phân tích toàn bộ kho hàng và chọn ra sản phẩm hoàn hảo nhất cho bạn.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionLabel}>Bạn đang tìm kiếm gì hôm nay?</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#818cf8" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="VD: Cần tìm nước hoa nam thanh lịch mùi gỗ..."
              placeholderTextColor="#9ca3af"
              value={userNeed}
              onChangeText={setUserNeed}
              returnKeyType="search"
              onSubmitEditing={() => handleConsultAI()}
            />
            {userNeed.length > 0 && (
              <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={() => handleConsultAI()}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>AI đang phân tích kho hàng...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Nhờ AI Tìm Ngay</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsTitle}>Gợi ý phổ biến (Nhấn để tìm):</Text>
          <View style={styles.chipsWrap}>
            {QUICK_PROMPTS.map((promptItem, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleSelectQuickPrompt(promptItem)}
                activeOpacity={0.7}
              >
                <Ionicons name={promptItem.icon} size={14} color="#4f46e5" style={{ marginRight: 5 }} />
                <Text style={styles.chipText}>{promptItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.analyzingTitle}>Đang kết nối trí tuệ nhân tạo...</Text>
            <Text style={styles.analyzingSubtitle}>
              Gemini đang đọc dữ liệu, đối chiếu đặc tính, mức giá và tìm kiếm sự lựa chọn tối ưu nhất.
            </Text>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultContainer}>
            {result.success && result.product ? (
              <View style={styles.recommendCard}>
                <View style={styles.recommendHeader}>
                  <View style={styles.sparkleCircle}>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.matchTag}>GỢI Ý TỐT NHẤT CHO BẠN</Text>
                    <Text style={styles.productMatchTitle}>{result.product.title}</Text>
                  </View>
                </View>

                <View style={styles.aiAdviceBox}>
                  <View style={styles.adviceTagRow}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#4f46e5" />
                    <Text style={styles.aiAdviceLabel}>Đánh giá & Lý do từ AI:</Text>
                  </View>
                  <Text style={styles.aiAdviceText}>{result.reason}</Text>
                </View>

                <TouchableOpacity
                  style={styles.productPreview}
                  onPress={() => handlePressProductDetail(result.product.id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: result.product.thumbnail }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.categoryBadge}>
                      {result.product.category ? result.product.category.toUpperCase() : "GENERAL"}
                    </Text>
                    <Text style={styles.previewTitle} numberOfLines={2}>
                      {result.product.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.priceText}>${result.product.price}</Text>
                      {result.product.rating && (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#f59e0b" />
                          <Text style={styles.ratingText}>{result.product.rating}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.viewDetailBtn}
                    onPress={() => handlePressProductDetail(result.product.id)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#4f46e5" style={{ marginRight: 4 }} />
                    <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => handleAddToCartFromAI(result.product)}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle" size={40} color="#ef4444" />
                <Text style={styles.errorTitle}>Chưa tìm thấy sản phẩm phù hợp</Text>
                <Text style={styles.errorSubtitle}>
                  {result.reason || "Kho hàng hiện không có sản phẩm nào khớp với mô tả của bạn."}
                </Text>
                <TouchableOpacity
                  style={styles.retryChip}
                  onPress={handleResetSearch}
                >
                  <Text style={styles.retryChipText}>Thử tìm nhu cầu khác</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
    marginLeft: 4,
  },
  catalogCountText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e1b4b",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
  },
  searchSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#818cf8",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  quickPromptsSection: {
    marginBottom: 16,
  },
  quickPromptsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
    marginLeft: 2,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  analyzingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e1b4b",
    marginTop: 12,
    marginBottom: 6,
  },
  analyzingSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  resultContainer: {
    marginTop: 8,
  },
  recommendCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sparkleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  matchTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6366f1",
    letterSpacing: 0.6,
  },
  productMatchTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  aiAdviceBox: {
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
    marginBottom: 16,
  },
  adviceTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  aiAdviceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3730a3",
    marginLeft: 6,
  },
  aiAdviceText: {
    fontSize: 13.5,
    color: "#312e81",
    lineHeight: 20,
  },
  productPreview: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e67e22",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
    marginLeft: 3,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  viewDetailBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  viewDetailText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 13,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 10,
  },
  addToCartText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  errorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#991b1b",
    marginTop: 10,
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  retryChip: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
  },
});
