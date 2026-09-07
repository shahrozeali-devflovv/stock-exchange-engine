export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Wallet {
  balance: number;
}

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
}

export interface Portfolio {
  stock_id: number;
  quantity: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}