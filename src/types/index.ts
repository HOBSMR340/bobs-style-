export type Language = 'fr' | 'ar' | 'en';
export type CurrencyCode = 'DZD' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  exchangeRateFromDZD: number; // e.g. 1 DZD = 0.0068 EUR, 0.0074 USD
  decimals: number;
}

export type GenderCategory = 'homme' | 'femme' | 'enfant' | 'chaussures' | 'accessoires' | 'unisex';

export interface ProductCategory {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  image: string;
  itemCount: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  colorName: {
    fr: string;
    ar: string;
    en: string;
  };
  colorHex: string;
  size: string;
  stock: number;
  priceModifier?: number; // extra price if any
}

export type ProductStatus = 'active' | 'out_of_stock' | 'hidden';

export interface Product {
  id: string;
  sku: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  description: {
    fr: string;
    ar: string;
    en: string;
  };
  categoryId: string;
  subCategory?: string;
  brand: string;
  gender: GenderCategory;
  ageGroup?: string;
  buyPrice: number; // in DZD
  regularPrice: number; // in DZD
  promoPrice?: number; // in DZD
  isPromo: boolean;
  promoStartDate?: string;
  promoEndDate?: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  images: string[];
  videoUrl?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  tags: string[];
  minStockThreshold: number;
  status: ProductStatus;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'pending' // Nouvelle
  | 'confirmed' // Confirmée
  | 'processing' // En préparation
  | 'shipped' // Expédiée
  | 'delivered' // Livrée
  | 'cancelled' // Annulée
  | 'returned'; // Retournée

export type PaymentMethod = 'cod' | 'cib_card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantInfo: string; // e.g. "Noir / M"
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  wilaya: string;
  wilayaCode: string;
  commune: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. HBS-2026-0041
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber?: string;
  internalNotes?: string;
  whatsappConfirmed?: boolean;
  whatsappConfirmedAt?: string;
  gmailConfirmed?: boolean;
  gmailConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  wilaya: string;
  wilayaCode: string;
  totalSpent: number;
  ordersCount: number;
  registeredAt: string;
  notes?: string;
}

export type MovementType = 'in' | 'out' | 'adjustment' | 'sale' | 'return';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantDesc: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  user: string;
  createdAt: string;
}

export type UserRole = 'super_admin' | 'manager' | 'sales' | 'stock_manager';

export interface UserPermission {
  canManageProducts: boolean;
  canManageStock: boolean;
  canManageOrders: boolean;
  canManageCustomers: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoText: string;
  logoSubtext: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  announcementText: {
    fr: string;
    ar: string;
    en: string;
  };
  defaultLanguage: Language;
  defaultCurrency: CurrencyCode;
  freeShippingThreshold: number; // in DZD
  standardShippingRate: number; // in DZD
  taxRatePercent: number;
  pricesIncludeTax: boolean;
  enableCod: boolean;
  enableCardPayment: boolean;
  enableBankTransfer: boolean;
  lowStockAlertThreshold: number;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyShipped: boolean;
  whatsappNumber: string;
  gmailNotificationEmail: string;
  autoOpenWhatsAppOnCheckout: boolean;
  autoNotifyGmailOnCheckout: boolean;
  currencies: Record<CurrencyCode, CurrencyConfig>;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  targetEntity: string;
  entityId: string;
  details: string;
  timestamp: string;
}
