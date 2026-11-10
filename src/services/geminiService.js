const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

export const getGeminiRecommendation = async (
  userNeed,
  catalogProducts = [],
) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        reason: "Chưa cấu hình API Key trong file .env!",
      };
    }

    if (!catalogProducts || catalogProducts.length === 0) {
      return { success: false, reason: "Danh mục sản phẩm hiện đang trống." };
    }

    const catalogContext = catalogProducts.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      price: item.price,
    }));

    const prompt = `
Bạn là trợ lý mua sắm trực tuyến thông minh.
Danh mục sản phẩm hiện có trong kho hàng:
${JSON.stringify(catalogContext)}

Nhu cầu khách hàng: "${userNeed}"

Hướng dẫn đối chiếu danh mục:
- "quần áo", "áo", "thời trang", "đầm", "váy": tìm trong mens-shirts, womens-dresses, tops.
- "giày", "dép": tìm trong mens-shoes, womens-shoes.
- "điện thoại": tìm trong smartphones.
- "máy tính", "laptop": tìm trong laptops.
- "nước hoa": tìm trong fragrances.
- "mỹ phẩm", "son", "chăm sóc da": tìm trong beauty, skin-care.
- "đồng hồ": tìm trong mens-watches, womens-watches.
- "túi xách": tìm trong womens-bags.

Yêu cầu bắt buộc:
1. Chọn đúng 1 sản phẩm phù hợp nhất với nhu cầu của khách hàng trong kho hàng.
2. Trả về đúng định dạng JSON:
{"productId": <id_sản_phẩm_chọn>, "reason": "<giải thích lý do bằng tiếng Việt ngắn gọn, hấp dẫn>"}
3. Nếu không tìm thấy sản phẩm nào liên quan, trả về:
{"productId": null, "reason": "Không tìm thấy sản phẩm phù hợp trong danh mục hiện tại."}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || "Lỗi gọi Gemini API";
      console.log("Gemini API Error:", errMsg);
      return { success: false, reason: `Lỗi AI: ${errMsg}` };
    }

    const candidates = data?.candidates;
    const rawText = candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        reason: rawText || "Phản hồi từ AI không đúng cấu trúc JSON.",
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    if (parsedData.productId) {
      const matchedProduct = catalogProducts.find(
        (p) => p.id === parsedData.productId,
      );
      if (matchedProduct) {
        return {
          success: true,
          product: matchedProduct,
          reason: parsedData.reason || "Sản phẩm gợi ý tối ưu nhất cho bạn.",
        };
      }
    }

    return {
      success: false,
      reason:
        parsedData.reason || "Sản phẩm gợi ý không có thật trong kho hàng.",
    };
  } catch (error) {
    console.log("Lỗi Gemini Service:", error);
    return {
      success: false,
      reason: `Không thể kết nối đến AI (${error?.message || "Kiểm tra mạng"}).`,
    };
  }
};
