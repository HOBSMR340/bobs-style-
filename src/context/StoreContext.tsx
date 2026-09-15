import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AdminUser,
  AuditLog,
  CartItem,
  CurrencyCode,
  Customer,
  InventoryMovement,
  Language,
  MovementType,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductVariant,
  StoreSettings,
  UserRole,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_MOVEMENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../data/seedData';
import { translations, TranslationKey } from '../locales/translations';

interface StoreContextType {
  // Localization & Currency
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  t: (key: TranslationKey) => string;
  formatPrice: (priceInDzd: number) => string;
  convertPrice: (priceInDzd: number) => number;

  // Navigation & Modes
  currentView: 'shop' | 'admin';
  setCurrentView: (view: 'shop' | 'admin') => void;
  adminTab: 'dashboard' | 'products' | 'stock' | 'prices' | 'orders' | 'customers' | 'reports' | 'settings' | 'users' | 'audit';
  setAdminTab: (tab: 'dashboard' | 'products' | 'stock' | 'prices' | 'orders' | 'customers' | 'reports' | 'settings' | 'users' | 'audit') => void;
  shopCategory: string | null;
  setShopCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Catalog State & Operations
  products: Product[];
  categories: ProductCategory[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  duplicateProduct: (id: string) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  bulkUpdatePrices: (productIds: string[], percentageChange: number, isPromoAdjustment?: boolean) => void;

  // Stock & Inventory
  adjustStock: (productId: string, variantId: string, quantityChange: number, type: MovementType, reason: string) => void;
  inventoryMovements: InventoryMovement[];
  lowStockProducts: { product: Product; variant: ProductVariant; totalStock: number }[];

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartShippingCost: number;
  cartTotal: number;
  cartItemCount: number;

  // Modals
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string) => void;
  markOrderWhatsAppConfirmed: (orderId: string) => void;
  markOrderGmailConfirmed: (orderId: string) => void;
  addOrderInternalNote: (orderId: string, note: string) => void;

  // Customers
  customers: Customer[];
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Team & Auth
  users: AdminUser[];
  currentUser: AdminUser;
  setCurrentUser: (user: AdminUser) => void;
  hasPermission: (action: string) => boolean;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetDatabase: () => void;

  // Audit
  auditLogs: AuditLog[];
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'hobs_ecommerce_store_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [savedData] = useState(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [language, setLanguageState] = useState<Language>(savedData?.language || 'fr');
  const [currency, setCurrency] = useState<CurrencyCode>(savedData?.currency || 'DZD');
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'stock' | 'prices' | 'orders' | 'customers' | 'reports' | 'settings' | 'users' | 'audit'>('dashboard');
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<Product[]>(savedData?.products || INITIAL_PRODUCTS);
  const [categories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(savedData?.orders || INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(savedData?.customers || INITIAL_CUSTOMERS);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(savedData?.inventoryMovements || INITIAL_MOVEMENTS);
  const [users] = useState<AdminUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<AdminUser>(INITIAL_USERS[0]);
  const [settings, setSettings] = useState<StoreSettings>(savedData?.settings || INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(savedData?.auditLogs || [
    {
      id: 'log-1',
      userName: 'Sohaib Missour',
      userRole: 'Super Admin',
      action: 'Initialisation Système',
      targetEntity: 'Magasin HOBS STYLE',
      entityId: 'SYSTEM',
      details: 'Démarrage officiel de la boutique en ligne HOBS STYLE',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(savedData?.cart || []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync RTL and lang attribute
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Persist to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        language,
        currency,
        products,
        orders,
        customers,
        inventoryMovements,
        settings,
        auditLogs,
        cart,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [language, currency, products, orders, customers, inventoryMovements, settings, auditLogs, cart]);

  // Translation helper
  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.fr;
    return (dict as Record<string, string>)[key] || translations.fr[key] || key;
  };

  // Price conversion & formatting
  const convertPrice = (priceInDzd: number): number => {
    const currConfig = settings.currencies[currency] || settings.currencies.DZD;
    return priceInDzd * currConfig.exchangeRateFromDZD;
  };

  const formatPrice = (priceInDzd: number): string => {
    const currConfig = settings.currencies[currency] || settings.currencies.DZD;
    const converted = priceInDzd * currConfig.exchangeRateFromDZD;

    if (currency === 'DZD') {
      // In Algeria, format as e.g. "6 500 DA" or "12 900 دج"
      const formattedNumber = Math.round(converted).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR');
      return language === 'ar' ? `${formattedNumber} دج` : `${formattedNumber} DA`;
    }

    if (currency === 'EUR') {
      return `${converted.toFixed(2).replace('.', ',')} €`;
    }

    return `$${converted.toFixed(2)}`;
  };

  // Permission check
  const hasPermission = (action: string): boolean => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'manager') {
      return !['manage_users', 'delete_database'].includes(action);
    }
    if (currentUser.role === 'sales') {
      return ['manage_orders', 'view_orders', 'view_customers', 'manage_customers', 'view_products'].includes(action);
    }
    if (currentUser.role === 'stock_manager') {
      return ['manage_stock', 'view_stock', 'view_products'].includes(action);
    }
    return false;
  };

  const addAudit = (action: string, targetEntity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetEntity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAudit('Ajout Produit', 'Produit', newId, `Ajout de ${newProduct.name.fr} (${newProduct.sku})`);
    showToast(`Produit "${newProduct.name[language]}" ajouté avec succès`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );
    addAudit('Modification Produit', 'Produit', id, `Mise à jour des informations`);
    showToast(`Produit mis à jour`);
  };

  const duplicateProduct = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const newId = 'prod-' + Date.now();
    const duplicated: Product = {
      ...original,
      id: newId,
      sku: `${original.sku}-COPY`,
      name: {
        fr: `${original.name.fr} (Copie)`,
        ar: `${original.name.ar} (نسخة)`,
        en: `${original.name.en} (Copy)`,
      },
      variants: original.variants.map((v, i) => ({
        ...v,
        id: `v-${newId}-${i}`,
        productId: newId,
        sku: `${v.sku}-CP`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicated, ...prev]);
    addAudit('Duplication Produit', 'Produit', newId, `Dupliqué depuis ${original.sku}`);
    showToast(`Produit dupliqué avec succès`);
  };

  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (product) {
      addAudit('Suppression Produit', 'Produit', id, `Suppression de ${product.name.fr}`);
      showToast(`Produit supprimé`, 'info');
    }
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'active' ? 'hidden' : 'active';
          return { ...p, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
    showToast(`Statut du produit modifié`);
  };

  const bulkUpdatePrices = (productIds: string[], percentageChange: number, isPromoAdjustment = false) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (productIds.includes(p.id)) {
          if (isPromoAdjustment) {
            // Apply promo discount
            const discountFactor = (100 - Math.abs(percentageChange)) / 100;
            const newPromo = Math.round(p.regularPrice * discountFactor);
            return {
              ...p,
              promoPrice: newPromo,
              isPromo: true,
              updatedAt: new Date().toISOString(),
            };
          } else {
            // Modify regular price
            const factor = (100 + percentageChange) / 100;
            const newPrice = Math.round(p.regularPrice * factor);
            return {
              ...p,
              regularPrice: newPrice,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return p;
      })
    );
    addAudit(
      'Modification Massive de Prix',
      'Catalogue',
      `${productIds.length} produits`,
      `Ajustement de ${percentageChange}% sur ${productIds.length} produits`
    );
    showToast(`Prix mis à jour pour ${productIds.length} produits`);
  };

  // Stock operations
  const adjustStock = (
    productId: string,
    variantId: string,
    quantityChange: number,
    type: MovementType,
    reason: string
  ) => {
    let prodName = '';
    let variantDesc = '';
    let previousStock = 0;
    let newStock = 0;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        prodName = prod.name.fr;
        const updatedVariants = prod.variants.map((v) => {
          if (v.id !== variantId) return v;
          previousStock = v.stock;
          newStock = Math.max(0, v.stock + quantityChange);
          variantDesc = `${v.colorName.fr} / ${v.size}`;
          return { ...v, stock: newStock };
        });
        return {
          ...prod,
          variants: updatedVariants,
          status: updatedVariants.reduce((sum, v) => sum + v.stock, 0) === 0 ? 'out_of_stock' : prod.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const movement: InventoryMovement = {
      id: 'mov-' + Date.now(),
      productId,
      productName: prodName,
      variantId,
      variantDesc,
      type,
      quantity: quantityChange,
      previousStock,
      newStock,
      reason,
      user: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setInventoryMovements((prev) => [movement, ...prev]);
    addAudit('Mouvement de Stock', 'Inventaire', productId, `${type.toUpperCase()}: ${quantityChange} pour ${prodName} (${variantDesc})`);
    showToast(`Stock ajusté: ${newStock} unités`);
  };

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const cartItemId = `${product.id}-${variant.id}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const unitPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.regularPrice;
      return [...prev, { cartItemId, product, variant, quantity, unitPrice }];
    });
    setIsCartOpen(true);
    showToast(`${product.name[language]} ajouté au panier !`);
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast(`Article retiré du panier`, 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartShippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (cartSubtotal >= settings.freeShippingThreshold) return 0;
    return settings.standardShippingRate;
  }, [cartSubtotal, settings, cart.length]);

  const cartTotal = cartSubtotal + cartShippingCost;

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Quick view
  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };
  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Place order
  const placeOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order => {
    const generatedNumber = `HBS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: generatedNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Decrement stock for ordered items
    newOrder.items.forEach((item) => {
      adjustStock(item.productId, item.variantId, -item.quantity, 'sale', `Commande #${generatedNumber}`);
    });

    // Update or add customer record
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === orderData.customerPhone || (orderData.customerEmail && c.email === orderData.customerEmail));
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalSpent: c.totalSpent + newOrder.totalAmount,
                ordersCount: c.ordersCount + 1,
              }
            : c
        );
      } else {
        const [firstName, ...rest] = (orderData.customerName || 'Client').split(' ');
        const newCust: Customer = {
          id: 'cust-' + Date.now(),
          firstName: firstName || 'Client',
          lastName: rest.join(' ') || 'HOBS',
          email: orderData.customerEmail || `${orderData.customerPhone}@client.dz`,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress.address,
          wilaya: orderData.shippingAddress.wilaya,
          wilayaCode: orderData.shippingAddress.wilayaCode,
          totalSpent: newOrder.totalAmount,
          ordersCount: 1,
          registeredAt: new Date().toISOString(),
        };
        return [newCust, ...prev];
      }
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    addAudit('Nouvelle Commande', 'Commande', newOrder.id, `Commande #${generatedNumber} de ${newOrder.totalAmount} DA`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status,
            paymentStatus: status === 'delivered' ? 'paid' : ord.paymentStatus,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return ord;
      })
    );
    addAudit('Statut Commande', 'Commande', orderId, `Statut passé à: ${status}`);
    showToast(`Statut de la commande mis à jour: ${status}`);
  };

  const updateOrderTracking = (orderId: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            trackingNumber: trackingNumber.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    addAudit('Suivi Colis', 'Commande', orderId, `Numéro de suivi mis à jour : ${trackingNumber}`);
    showToast(`Numéro de suivi enregistré : ${trackingNumber}`);
  };

  const markOrderWhatsAppConfirmed = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            whatsappConfirmed: true,
            whatsappConfirmedAt: new Date().toISOString(),
            status: ord.status === 'pending' ? 'confirmed' : ord.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    addAudit('Confirmation WhatsApp', 'Commande', orderId, `Commande confirmée via WhatsApp`);
    showToast('Commande marquée comme confirmée via WhatsApp !', 'success');
  };

  const markOrderGmailConfirmed = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            gmailConfirmed: true,
            gmailConfirmedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    addAudit('Notification Gmail', 'Commande', orderId, `Notification de confirmation envoyée par Gmail`);
    showToast('Confirmation enregistrée et email préparé !', 'success');
  };

  const addOrderInternalNote = (orderId: string, note: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const prevNotes = ord.internalNotes ? `${ord.internalNotes} | ` : '';
          return {
            ...ord,
            internalNotes: `${prevNotes}[${new Date().toLocaleTimeString()} ${currentUser.name}]: ${note}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    showToast('Note interne enregistrée');
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Client mis à jour');
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAudit('Configuration', 'Paramètres', 'SETTINGS', `Modification des paramètres de la boutique`);
    showToast('Configuration enregistrée avec succès');
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setInventoryMovements(INITIAL_MOVEMENTS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    showToast('Base de données réinitialisée aux valeurs d’usine !', 'info');
  };

  // Low stock alert list
  const lowStockProducts = useMemo(() => {
    const list: { product: Product; variant: ProductVariant; totalStock: number }[] = [];
    products.forEach((p) => {
      const threshold = p.minStockThreshold || settings.lowStockAlertThreshold;
      p.variants.forEach((v) => {
        if (v.stock <= threshold) {
          list.push({ product: p, variant: v, totalStock: v.stock });
        }
      });
    });
    return list;
  }, [products, settings.lowStockAlertThreshold]);

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
        formatPrice,
        convertPrice,
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        shopCategory,
        setShopCategory,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        addProduct,
        updateProduct,
        duplicateProduct,
        deleteProduct,
        toggleProductStatus,
        bulkUpdatePrices,
        adjustStock,
        inventoryMovements,
        lowStockProducts,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        cartSubtotal,
        cartShippingCost,
        cartTotal,
        cartItemCount,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        orders,
        placeOrder,
        updateOrderStatus,
        updateOrderTracking,
        markOrderWhatsAppConfirmed,
        markOrderGmailConfirmed,
        addOrderInternalNote,
        customers,
        updateCustomer,
        users,
        currentUser,
        setCurrentUser,
        hasPermission,
        settings,
        updateSettings,
        resetDatabase,
        auditLogs,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
