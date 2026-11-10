import axios from "axios";

const BASE_URL = "https://dummyjson.com/products";

export const fetchProductsApi = async (
  page = 0,
  limit = 10,
  searchQuery = "",
) => {
  const skip = page * limit;
  let url = `${BASE_URL}?limit=${limit}&skip=${skip}`;

  if (searchQuery.trim().length > 0) {
    url = `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`;
  }

  const response = await axios.get(url, { timeout: 8000 });
  return {
    products: response.data.products || [],
    total: response.data.total || 0,
  };
};

export const fetchProductDetailApi = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`, { timeout: 8000 });
  return response.data;
};

export const fetchAllProductsForAI = async () => {
  const url = `${BASE_URL}?limit=0&select=id,title,category,price,thumbnail,description`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data.products || [];
};
