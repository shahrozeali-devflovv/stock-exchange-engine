import api from "@/lib/api";

export const getStocks = async () => {
  const response = await api.get("/stocks");
  return response.data;
};

export const syncStock = async (symbol: string, name: string) => {
  const response = await api.post("/stocks/sync", {
    symbol,
    name,
  });

  return response.data;
};