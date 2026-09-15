import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ProductVariant } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const {
    t,
    language,
    formatPrice,
    quickViewProduct: product,
    closeQuickView,
    addToCart,
  } = useStore();

  if (!product) return null;

  // Selected image index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Group colors
  const availableColors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, v])).values()
  ) as ProductVariant[];

  const [selectedColorHex, setSelectedColorHex] = useState<string>(
    availableColors[0]?.colorHex || ''
  );

  // Filter sizes available for chosen color
  const variantsForColor = product.variants.filter(
    (v) => v.colorHex === selectedColorHex
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variantsForColor.find((v) => v.stock > 0) || variantsForColor[0] || null
  );

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Reset when color changes
  useEffect(() => {
    const validVariants = product.variants.filter(
      (v) => v.colorHex === selectedColorHex
    );
    const available = validVariants.find((v) => v.stock > 0) || validVariants[0] || null;
    setSelectedVariant(available);
    setQuantity(1);
  }, [selectedColorHex, product]);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent =
    product.isPromo && product.promoPrice && product.regularPrice > product.promoPrice
      ? Math.round(((product.regularPrice - product.promoPrice) / product.regularPrice) * 100)
      : null;

  const isCurrentOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
      onClick={closeQuickView}
    >
      <div
        id="product-detail-modal-container"
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Photos gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl bg-neutral-50 overflow-hidden border border-neutral-200 flex items-center justify-center p-6">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name[language]}
                  className="w-full h-full object-contain object-center"
                />

                {discountPercent && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-neutral-50 p-1 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-neutral-900 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Aperçu ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Variant Selector */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">
                    {product.brand}
                  </span>
                  <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded">
                    SKU: {selectedVariant?.sku || product.sku}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 leading-tight">
                  {product.name[language] || product.name.fr}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-neutral-800">
                    {product.rating}
                  </span>
                  <span className="text-xs text-neutral-400">
                    ({product.reviewCount} {t('reviewsCount')})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-500 font-medium">Prix unitaire</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-neutral-950">
                      {product.isPromo && product.promoPrice
                        ? formatPrice(product.promoPrice)
                        : formatPrice(product.regularPrice)}
                    </span>
                    {product.isPromo && product.promoPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent && (
                  <div className="text-right">
                    <span className="inline-block text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      Économisez {formatPrice(product.regularPrice - (product.promoPrice || 0))}
                    </span>
                  </div>
                )}
              </div>

              {/* Color selection */}
              {availableColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">{t('selectColor')} :</span>
                    <span className="text-neutral-500 font-medium">
                      {availableColors.find((c) => c.colorHex === selectedColorHex)?.colorName[language] ||
                        availableColors.find((c) => c.colorHex === selectedColorHex)?.colorName.fr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {availableColors.map((col) => (
                      <button
                        key={col.colorHex}
                        onClick={() => setSelectedColorHex(col.colorHex)}
                        style={{ backgroundColor: col.colorHex }}
                        title={col.colorName[language] || col.colorName.fr}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColorHex === col.colorHex
                            ? 'border-neutral-950 ring-2 ring-neutral-400 scale-110'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                      >
                        {selectedColorHex === col.colorHex && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ['#FFFFFF', '#F8FAFC', '#D9C8B4', '#E5D9C5'].includes(col.colorHex)
                                ? 'bg-neutral-900'
                                : 'bg-white'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">{t('selectSize')} :</span>
                  {selectedVariant && (
                    <span
                      className={`text-[11px] font-semibold ${
                        selectedVariant.stock <= 5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedVariant.stock > 0
                        ? `${selectedVariant.stock} ${t('remainingStock')}`
                        : t('outOfStock')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {variantsForColor.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isSoldOut = variant.stock <= 0;
                    return (
                      <button
                        key={variant.id}
                        disabled={isSoldOut}
                        onClick={() => setSelectedVariant(variant)}
                        className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all border ${
                          isSoldOut
                            ? 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-800'
                        }`}
                      >
                        {variant.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector & Add to cart button */}
              <div className="pt-2 flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isCurrentOutOfStock}
                    className="w-8 h-8 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedVariant?.stock || 1, quantity + 1)
                      )
                    }
                    disabled={isCurrentOutOfStock || quantity >= (selectedVariant?.stock || 1)}
                    className="w-8 h-8 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  id="modal-add-to-cart-btn"
                  disabled={isCurrentOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                    isCurrentOutOfStock
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                      : isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-neutral-950 text-white hover:bg-black shadow-neutral-950/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('addedToCart')}</span>
                    </>
                  ) : isCurrentOutOfStock ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('outOfStock')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('addToCart')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('description')}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {product.description[language] || product.description.fr}
                </p>
                {product.material && (
                  <div className="text-xs text-neutral-500 pt-1">
                    <strong>{t('material')}:</strong> {product.material}
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-900" />
                  <span>Livraison partout en Algérie</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-900" />
                  <span>Paiement à la livraison</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
