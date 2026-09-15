import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Star, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, language, formatPrice, addToCart, openQuickView } = useStore();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Group unique colors from variants
  const uniqueColors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, v])).values()
  ) as ProductVariant[];

  // Calculate total stock
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0 || product.status === 'out_of_stock';
  const isLowStock = !isOutOfStock && totalStock <= (product.minStockThreshold || 6);

  // First available variant
  const defaultVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || !defaultVariant) return;

    // If product has multiple sizes, it's better UX to open quick view for size pick,
    // but if it's one size or quick click, add default
    if (product.variants.length > 1) {
      openQuickView(product);
      return;
    }

    addToCart(product, defaultVariant, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const discountPercent =
    product.isPromo && product.promoPrice && product.regularPrice > product.promoPrice
      ? Math.round(((product.regularPrice - product.promoPrice) / product.regularPrice) * 100)
      : null;

  return (
    <div
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openQuickView(product)}
      className="group relative bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-400/80 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:shadow-lg"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isNewArrival && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500 text-white tracking-wide shadow-sm">
            {t('badgeNew')}
          </span>
        )}
        {product.isPromo && discountPercent && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-600 text-white tracking-wide shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {product.isBestSeller && !product.isNewArrival && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-white tracking-wide shadow-sm">
            {t('badgeBest')}
          </span>
        )}
      </div>

      {/* Stock warning badge if low or out */}
      {isOutOfStock ? (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-900/80 text-white backdrop-blur-sm">
          {t('outOfStock')}
        </span>
      ) : isLowStock ? (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          {t('lowStockAlert')}
        </span>
      ) : null}

      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 flex items-center justify-center p-4">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
          alt={product.name[language]}
          className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Quick View Floating Overlay on Desktop */}
        <div
          className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-200 flex items-center justify-center ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-neutral-900 text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            {t('quickView')}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Subcategory / Color */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="font-medium uppercase tracking-wider text-[11px] text-neutral-400">
              {product.brand}
            </span>
            {product.subCategory && (
              <span className="text-[11px] truncate max-w-[120px]">{product.subCategory}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1 group-hover:text-black transition-colors">
            {product.name[language] || product.name.fr}
          </h3>

          {/* Color swatches preview */}
          {uniqueColors.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2">
              {uniqueColors.slice(0, 4).map((variant, idx) => (
                <span
                  key={variant.id}
                  title={variant.colorName[language] || variant.colorName.fr}
                  style={{ backgroundColor: variant.colorHex }}
                  className={`w-3.5 h-3.5 rounded-full border border-neutral-300 transition-transform ${
                    idx === selectedColorIndex ? 'scale-110 ring-1 ring-neutral-900' : ''
                  }`}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[10px] text-neutral-400 font-medium">
                  +{uniqueColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-neutral-950 text-base">
              {product.isPromo && product.promoPrice
                ? formatPrice(product.promoPrice)
                : formatPrice(product.regularPrice)}
            </span>
            {product.isPromo && product.promoPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-500">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-neutral-500 text-[11px] font-medium">
              ({product.reviewCount})
            </span>
          </div>

          {/* Add to cart CTA button */}
          <button
            type="button"
            id={`btn-add-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-950 text-white hover:bg-black active:scale-[0.98]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('addedToCart')}</span>
              </>
            ) : isOutOfStock ? (
              <span>{t('outOfStock')}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
