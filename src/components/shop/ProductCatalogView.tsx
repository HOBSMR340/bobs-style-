import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  Search,
} from 'lucide-react';

export const ProductCatalogView: React.FC = () => {
  const {
    t,
    language,
    products,
    categories,
    shopCategory,
    setShopCategory,
    searchQuery,
    setSearchQuery,
    formatPrice,
  } = useStore();

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [promoOnly, setPromoOnly] = useState<boolean>(shopCategory === 'promos');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Derive unique brands and sizes
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return Array.from(set);
  }, [products]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v.size)));
    return Array.from(set);
  }, [products]);

  // Current category name
  const currentCategory = categories.find((c) => c.id === shopCategory);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status === 'hidden') return false;

      // Category filter
      if (shopCategory === 'promos' && !product.isPromo) return false;
      if (shopCategory === 'new' && !product.isNewArrival) return false;
      if (
        shopCategory &&
        shopCategory !== 'promos' &&
        shopCategory !== 'new' &&
        product.categoryId !== shopCategory
      ) {
        return false;
      }

      // Search query (search in name, brand, sku, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          product.name.fr.toLowerCase().includes(q) ||
          product.name.ar.toLowerCase().includes(q) ||
          product.name.en.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesTag = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesSku && !matchesTag) {
          return false;
        }
      }

      // Brand
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;

      // Size
      if (selectedSize !== 'all' && !product.variants.some((v) => v.size === selectedSize)) return false;

      // Stock
      if (inStockOnly) {
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        if (totalStock <= 0) return false;
      }

      // Promo
      if (promoOnly && !product.isPromo) return false;

      return true;
    });
  }, [products, shopCategory, searchQuery, selectedBrand, selectedSize, inStockOnly, promoOnly]);

  // Sort
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => {
        const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.regularPrice;
        const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.regularPrice;
        return priceA - priceB;
      });
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => {
        const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.regularPrice;
        const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.regularPrice;
        return priceB - priceA;
      });
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [filteredProducts, sortBy]);

  const clearAllFilters = () => {
    setSelectedBrand('all');
    setSelectedSize('all');
    setInStockOnly(false);
    setPromoOnly(false);
    setSearchQuery('');
    setShopCategory(null);
  };

  const getPageTitle = () => {
    if (searchQuery) return `Résultats pour "${searchQuery}"`;
    if (shopCategory === 'promos') return t('promotionsTitle');
    if (shopCategory === 'new') return t('newArrivalsTitle');
    if (currentCategory) return currentCategory.name[language];
    return 'Tous nos articles';
  };

  return (
    <div id="catalog-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-8 border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1.5">
            <button onClick={() => setShopCategory(null)} className="hover:underline">
              {t('navHome')}
            </button>
            <span>/</span>
            <span className="font-semibold text-neutral-900">{getPageTitle()}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {sortedProducts.length} article{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-800 bg-white"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none focus:outline-none text-neutral-900 pr-2 cursor-pointer"
            >
              <option value="featured">Recommandés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="rating">Meilleurs avis</option>
              <option value="newest">Nouveautés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
              <span>Filtres de recherche</span>
            </h3>
            {(selectedBrand !== 'all' || selectedSize !== 'all' || inStockOnly || promoOnly || shopCategory) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Catégories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setShopCategory(null)}
                className={`w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors ${
                  !shopCategory ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Tous les produits
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setShopCategory(c.id)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    shopCategory === c.id ? 'bg-neutral-950 text-white font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span>{c.name[language]}</span>
                  <span className="text-[10px] opacity-70">({c.itemCount})</span>
                </button>
              ))}
              <button
                onClick={() => setShopCategory('promos')}
                className={`w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors text-rose-600 flex items-center justify-between ${
                  shopCategory === 'promos' ? 'bg-rose-600 text-white font-bold' : 'hover:bg-rose-50'
                }`}
              >
                <span>Offres & Promotions</span>
                <span className="text-[10px]">Promo</span>
              </button>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-neutral-500">
              Disponibilité & Offres
            </h4>
            <label className="flex items-center gap-2.5 cursor-pointer text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0 border-neutral-300 cursor-pointer"
              />
              <span>En stock uniquement</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-neutral-800">
              <input
                type="checkbox"
                checked={promoOnly}
                onChange={(e) => setPromoOnly(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0 border-neutral-300 cursor-pointer"
              />
              <span>Articles en promotion</span>
            </label>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Marques
            </h4>
            <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`w-full text-left py-1 px-2 rounded ${
                  selectedBrand === 'all' ? 'font-bold text-neutral-950' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Toutes les marques
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left py-1 px-2 rounded ${
                    selectedBrand === b ? 'font-bold text-neutral-950' : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2 pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Tailles
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  selectedSize === 'all'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                Tous
              </button>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    selectedSize === s
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Aucun produit ne correspond à vos critères
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Essayez d'élargir votre recherche, de changer les filtres de catégorie ou de réinitialiser la sélection.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">Filtres</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-500 mb-2">Catégorie</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setShopCategory(c.id)}
                      className={`py-2 px-3 rounded-lg text-left ${
                        shopCategory === c.id ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-100'
                      }`}
                    >
                      {c.name[language]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-500 mb-2">Marque</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(selectedBrand === b ? 'all' : b)}
                      className={`py-1.5 px-3 rounded-lg border ${
                        selectedBrand === b ? 'bg-neutral-900 text-white' : 'bg-neutral-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-xs font-semibold"
              >
                Effacer tout
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-neutral-950 text-white text-xs font-semibold"
              >
                Voir les résultats ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
