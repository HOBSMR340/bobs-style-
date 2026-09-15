import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  BadgePercent,
  Headphones,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { t, language, products, categories, setShopCategory } = useStore();
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      badge: t('heroBadge'),
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
      cta: t('heroCta'),
      quote: t('heroDailyStyle'),
      image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=85',
      catId: 'cat-men',
    },
    {
      badge: 'NOUVELLE COLLECTION 2026',
      title: 'Élégance Contemporaine',
      subtitle: 'Des coupes intemporelles et des matières luxueuses conçues pour sublimer votre quotidien.',
      cta: 'VOIR LA SÉLECTION FEMME',
      quote: 'L’art du chic moderne',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
      catId: 'cat-women',
    },
  ];

  const currentSlide = heroSlides[heroSlide];

  // Filter products for homepage sections
  const newArrivals = products.filter((p) => p.isNewArrival && p.status !== 'hidden').slice(0, 5);
  const bestSellers = products.filter((p) => p.isBestSeller && p.status !== 'hidden').slice(0, 4);
  const promoProducts = products.filter((p) => p.isPromo && p.status !== 'hidden');

  return (
    <div id="home-page-container" className="space-y-16 pb-20">
      {/* 1. HERO SECTION (Exact replica of reference visual design) */}
      <section id="hero-banner" className="relative bg-neutral-100 overflow-hidden border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
                <span>{currentSlide.badge}</span>
              </div>

              <div className="space-y-2">
                <div className="cursor-pointer">
                  <span className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[0.25em] text-neutral-950 block">
                    HOBS
                  </span>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="h-[2px] w-6 bg-neutral-900" />
                    <span className="text-xs sm:text-sm tracking-[0.45em] text-neutral-700 font-bold uppercase">
                      STYLE
                    </span>
                    <span className="h-[2px] w-6 bg-neutral-900" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 pt-3">
                  {currentSlide.title}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {currentSlide.subtitle}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="hero-cta-btn"
                  onClick={() => setShopCategory(currentSlide.catId)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 group"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Lifestyle Photography with quote badge */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-neutral-200">
                <img
                  src={currentSlide.image}
                  alt="HOBS STYLE Collection"
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />

                {/* Floating cursive handwritten badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40 transform rotate-2">
                  <span className="font-serif italic text-sm text-neutral-900 font-semibold tracking-wide">
                    {currentSlide.quote}
                  </span>
                </div>
              </div>

              {/* Slider arrow controls */}
              <button
                onClick={() => setHeroSlide((prev) => (prev === 0 ? 1 : 0))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setHeroSlide((prev) => (prev === 1 ? 0 : 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Next slide"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {[0, 1].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      heroSlide === idx ? 'w-6 bg-neutral-900' : 'w-2 bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES CIRCULAR ROW (Matching screenshot) */}
      <section id="categories-row" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
          {categories.slice(0, 5).map((category) => (
            <div
              key={category.id}
              onClick={() => setShopCategory(category.id)}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              {/* Circular Avatar / Card */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-neutral-100 p-1 border-2 border-transparent group-hover:border-neutral-900 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-200">
                  <img
                    src={category.image}
                    alt={category.name[language]}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Label & link */}
              <h3 className="mt-3 text-sm sm:text-base font-bold text-neutral-900 group-hover:text-black">
                {category.name[language]}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 font-medium group-hover:text-neutral-900 group-hover:underline transition-colors mt-0.5">
                <span>{t('viewCollection')}</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NOUVEAUTÉS (Exact 5-item grid from screenshot) */}
      <section id="new-arrivals-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-200 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              {t('newArrivalsTitle')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {t('newArrivalsSubtitle')}
            </p>
          </div>

          <button
            onClick={() => setShopCategory('new')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-black group self-start sm:self-auto"
          >
            <span>{t('viewAllNew')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 5-Column Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. TRUST BADGES (Matching screenshot: 4 pillars) */}
      <section id="trust-pillars" className="bg-neutral-100/70 border-y border-neutral-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-neutral-200">
                <Truck className="w-6 h-6 text-neutral-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{t('trustFastDeliveryTitle')}</h4>
                <p className="text-xs text-neutral-500 mt-1">{t('trustFastDeliveryDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-neutral-200">
                <ShieldCheck className="w-6 h-6 text-neutral-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{t('trustCodTitle')}</h4>
                <p className="text-xs text-neutral-500 mt-1">{t('trustCodDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-neutral-200">
                <BadgePercent className="w-6 h-6 text-neutral-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{t('trustQualityTitle')}</h4>
                <p className="text-xs text-neutral-500 mt-1">{t('trustQualityDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-neutral-200">
                <Headphones className="w-6 h-6 text-neutral-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{t('trustSupportTitle')}</h4>
                <p className="text-xs text-neutral-500 mt-1">{t('trustSupportDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL COLLECTION BANNERS (Matching screenshot) */}
      <section id="collection-duo-banners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Collection Hommes */}
          <div
            onClick={() => setShopCategory('cat-men')}
            className="group relative rounded-2xl overflow-hidden bg-neutral-900 aspect-[16/9] sm:aspect-[2/1] cursor-pointer shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80"
              alt="Collection Hommes"
              className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white">
              <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-300 uppercase">
                {t('bannerMenSubtitle')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-4">
                {t('bannerMenTitle')}
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:underline">
                <span>{t('viewCollection')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Collection Femmes */}
          <div
            onClick={() => setShopCategory('cat-women')}
            className="group relative rounded-2xl overflow-hidden bg-neutral-900 aspect-[16/9] sm:aspect-[2/1] cursor-pointer shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
              alt="Collection Femmes"
              className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white">
              <span className="text-[11px] font-bold tracking-[0.2em] text-neutral-300 uppercase">
                {t('bannerWomenSubtitle')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-4">
                {t('bannerWomenTitle')}
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:underline">
                <span>{t('viewCollection')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONS & OFFRES SPÉCIALES */}
      {promoProducts.length > 0 && (
        <section id="promo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Flame className="w-5 h-5 fill-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {t('promotionsTitle')}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {t('promotionsSubtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShopCategory('promos')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 group self-start sm:self-auto"
            >
              <span>Voir toutes les promotions</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. BEST SELLERS */}
      <section id="best-sellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-neutral-200 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              {t('bestSellersTitle')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Les articles plébiscités par nos clients cette saison
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
