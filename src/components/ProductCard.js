import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ProductCard({ item, onPress }) {
  const handleCardPress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.category}>{item.category?.toUpperCase()}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  image: { width: 80, height: 80, borderRadius: 6, backgroundColor: "#f0f0f0" },
  info: { flex: 1, marginLeft: 12, justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "600", color: "#333" },
  category: { fontSize: 11, color: "#888", marginTop: 4 },
  price: { fontSize: 15, fontWeight: "bold", color: "#e67e22", marginTop: 4 },
});
