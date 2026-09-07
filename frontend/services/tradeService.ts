import api from "@/lib/api";

export const buyStock = async (
  stockId: number,
  quantity: number
) => {
  const response = await api.post("/trade/buy", {
    stock_id: stockId,
    quantity,
  });

  return response.data;
};

export const sellStock = async (
  stockId: number,
  quantity: number
) => {
  const response = await api.post("/trade/sell", {
    stock_id: stockId,
    quantity,
  });

  return response.data;
};