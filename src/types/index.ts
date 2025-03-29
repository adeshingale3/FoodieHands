
export type UserRole = 'restaurant' | 'ngo' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
}

export interface Restaurant extends User {
  role: 'restaurant';
  totalDonated: number; // in kgs
  totalValue: number; // in currency
  points: number;
}

export interface NGO extends User {
  role: 'ngo';
  isPremium: boolean;
  totalReceived: number; // in kgs
  totalValue: number; // in currency
  points: number;
}

export interface Admin extends User {
  role: 'admin';
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'liter' | 'items'; 
}

export interface FoodDonation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  ngoId: string;
  ngoName: string;
  foodItems: FoodItem[];
  totalQuantity: number;
  totalValue: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  verificationCode?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'donation_request' | 'donation_completed' | 'general';
  read: boolean;
  donationId?: string;
  createdAt: Date;
}
