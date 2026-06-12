export interface User {
  id: string; // from Firestore document ID
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface StoreSettings {
  name: string;
  logoUrl: string;
  phoneNumber: string; // used for WA
  address: string;
  updatedAt: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: string; // stringified JSON of CartItem[]
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  createdAt: number;
  updatedAt: number;
}
