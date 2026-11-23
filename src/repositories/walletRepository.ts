import { api } from "./api";

export const getIncome = async (userId: number) => {
  const response = await api.get(`/income/${userId}`);
  return response.data;
};

export const getExpenses = async (userId: number) => {
  const response = await api.get(`/expenses/${userId}`);
  return response.data;
};

export const createIncome = async (data: any) => {
  const response = await api.post("/income", data);
  return response.data;
};

export const createExpense = async (data: any) => {
  const response = await api.post("/expenses", data);
  return response.data;
};
