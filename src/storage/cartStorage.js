import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "@assignment2_cart_data";

export const saveCartToStorage = async (cartItems) => {
  try {
    const jsonString = JSON.stringify(cartItems);
    await AsyncStorage.setItem(CART_STORAGE_KEY, jsonString);
  } catch (error) {
    console.log("Lỗi khi lưu giỏ hàng vào AsyncStorage:", error);
  }
};

export const loadCartFromStorage = async () => {
  try {
    const jsonString = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return jsonString != null ? JSON.parse(jsonString) : [];
  } catch (error) {
    console.log("Lỗi khi đọc giỏ hàng từ AsyncStorage:", error);
    return [];
  }
};
