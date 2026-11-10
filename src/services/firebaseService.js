import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "wishlist";

export const getWishlistFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items = [];

    querySnapshot.forEach((document) => {
      items.push({ id: document.id, ...document.data() });
    });

    return { success: true, data: items };
  } catch (error) {
    console.log("Lỗi đọc dữ liệu Firestore:", error);
    return {
      success: false,
      error: "Không thể tải dữ liệu từ máy chủ Firebase!",
    };
  }
};

export const addToWishlistFirebase = async (product) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, product.id.toString());

    await setDoc(docRef, {
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category || "",
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.log("Lỗi ghi dữ liệu Firestore:", error);
    return { success: false, error: "Lỗi khi lưu sản phẩm vào Firebase!" };
  }
};

export const removeFromWishlistFirebase = async (productId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, productId.toString()));
    return { success: true };
  } catch (error) {
    console.log("Lỗi xóa dữ liệu Firestore:", error);
    return { success: false, error: "Lỗi khi xóa khỏi Firebase!" };
  }
};
