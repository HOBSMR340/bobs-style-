import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    t,
    language,
    formatPrice,
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartSubtotal,
    cartShippingCost,
    cartTotal,
    settings,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-extrabold text-neutral-950 uppercase tracking-wider">
                {t('cartTitle')} ({cart.length})
              </h2>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-800 mb-1.5">
              <Truck className="w-4 h-4 text-neutral-700" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  {t('freeShippingNotice')}{' '}
                  <strong>{formatPrice(freeShippingThreshold)}</strong> (encore{' '}
                  <span className="font-bold text-neutral-950">{formatPrice(remainingForFreeShipping)}</span>)
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('freeShippingQualified')}
                </span>
              )}
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{t('emptyCart')}</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Parcourez nos nouveautés et collections pour ajouter des articles à votre panier.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  id={`cart-item-${item.cartItemId}`}
                  className="flex gap-4 p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name[language]}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {item.product.name[language] || item.product.name.fr}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.cartItemId)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.variant.colorHex }}
                          />
                          <span>{item.variant.colorName[language] || item.variant.colorName.fr}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-neutral-800">
                          Taille: {item.variant.size}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                          disabled={item.quantity >= item.variant.stock}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Line price */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-neutral-950">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with totals & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-white space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>{t('shipping')}</span>
                  {cartShippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">
                      {t('freeShipping')}
                    </span>
                  ) : (
                    <span className="font-semibold text-neutral-900">
                      {formatPrice(cartShippingCost)}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-950">
                  <span>{t('total')}</span>
                  <span className="text-base">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.99]"
              >
                <span>{t('checkoutButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <button
                  onClick={clearCart}
                  className="hover:text-rose-600 transition-colors"
                >
                  {t('clearCart')}
                </button>
                <span>Paiement sécurisé à la livraison</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
