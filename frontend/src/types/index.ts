export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  ownerId: number;
  rating?: number;
  userRating?: number;
}

export interface Rating {
  id: number;
  storeId: number;
  userId: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface ValidationRules {
  name: {
    required: true;
    minLength: 20;
    maxLength: 60;
  };
  address: {
    required: true;
    maxLength: 400;
  };
  password: {
    required: true;
    minLength: 8;
    maxLength: 16;
    pattern: RegExp; // Requires uppercase and special character
  };
  email: {
    required: true;
    pattern: RegExp;
  };
}