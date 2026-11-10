import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { fetchProductsApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import StatusView from "../components/StatusView";

const PAGE_SIZE = 10;

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [status, setStatus] = useState("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isFetchingRef = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    fetchProductsApi(0, PAGE_SIZE, "")
      .then((data) => {
        if (isCurrent) {
          setProducts(data.products);
          setTotal(data.total);
          setPage(0);
          setStatus("success");
          setErrorMsg("");
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setErrorMsg(error.message || "Không thể tải danh sách sản phẩm!");
          setStatus("error");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const loadProducts = async (targetPage = 0, query = "", isRefreshAction = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isRefreshAction) {
      setIsRefreshing(true);
    } else if (targetPage === 0) {
      setStatus("loading");
    } else {
      setIsLoadingMore(true);
    }

    try {
      const data = await fetchProductsApi(targetPage, PAGE_SIZE, query);

      if (isRefreshAction || targetPage === 0) {
        setProducts(data.products);
      } else {
        setProducts((prevList) => [...prevList, ...data.products]);
      }

      setTotal(data.total);
      setPage(targetPage);
      setStatus("success");
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message || "Không thể tải danh sách sản phẩm!");
      if (products.length === 0) {
        setStatus("error");
      }
    } finally {
      isFetchingRef.current = false;
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = () => {
    loadProducts(0, searchQuery, false);
  };

  const handleRefresh = () => {
    loadProducts(0, searchQuery, true);
  };

  const handleLoadMore = () => {
    const hasMore = products.length < total;
    if (!isFetchingRef.current && hasMore) {
      loadProducts(page + 1, searchQuery, false);
    }
  };

  const handlePressProduct = (selectedProduct) => {
    navigation.navigate("ProductDetail", { productId: selectedProduct.id });
  };

  const handleRetry = () => {
    loadProducts(0, searchQuery, false);
  };

  if (status === "loading") {
    return <StatusView status="loading" />;
  }

  if (status === "error" && products.length === 0) {
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
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Tìm tên sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {status === "success" && products.length === 0 ? (
        <StatusView status="empty" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => handlePressProduct(item)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator style={{ margin: 15 }} color="#0066cc" />
            ) : null
          }
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  searchBox: { padding: 10, backgroundColor: "#fff" },
  input: {
    height: 40,
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
