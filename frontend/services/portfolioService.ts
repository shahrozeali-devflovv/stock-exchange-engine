import api from "@/lib/api";

export const getPortfolio = async () => {
  const response = await api.get("/portfolio");
  return response.data;
};