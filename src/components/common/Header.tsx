import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  Truck,
  Headphones,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Language, CurrencyCode } from '../../types';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    cartItemCount,
    setIsCartOpen,
    setIsAccountModalOpen,
    currentView,
    setCurrentView,
    currentUser,
    setShopCategory,
    searchQuery,
    setSearchQuery,
    settings,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCategoryClick = (catId: string | null) => {
    setShopCategory(catId);
    setCurrentView('shop');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: t('navHome'), catId: null },
    { label: t('navMen'), catId: 'cat-men' },
    { label: t('navWomen'), catId: 'cat-women' },
    { label: t('navKids'), catId: 'cat-kids' },
    { label: t('navShoes'), catId: 'cat-shoes' },
    { label: t('navAccessories'), catId: 'cat-accessories' },
    { label: t('navPromos'), catId: 'promos', isSpecial: true },
  ];

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Top announcement bar */}
      <div id="top-announcement-bar" className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Trust highlights */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Truck className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('topBannerDelivery')}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('topBannerPayment')}</span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
              <Headphones className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('topBannerSupport')}</span>
            </span>
          </div>

          {/* Controls: Currency, Language & Admin Portal Toggle */}
          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center gap-1 text-xs">
              {(['DZD', 'EUR', 'USD'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  id={`currency-btn-${c.toLowerCase()}`}
                  onClick={() => setCurrency(c)}
                  className={`px-1.5 py-0.5 rounded transition-colors text-[11px] font-medium ${
                    currency === c ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {c === 'DZD' ? 'DA' : c}
                </button>
              ))}
            </div>

            <span className="text-neutral-700">|</span>

            {/* Language Selector */}
            <div className="flex items-center gap-1 text-xs">
              {(['fr', 'ar', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  id={`lang-btn-${l}`}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded uppercase transition-colors text-[11px] font-semibold ${
                    language === l ? 'bg-white text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <span className="text-neutral-700">|</span>

            {/* Admin Switch Button */}
            <button
              id="header-admin-toggle-btn"
              onClick={() => setCurrentView(currentView === 'shop' ? 'admin' : 'shop')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
              title="Basculer entre la Boutique Client et le Back-Office Administrateur"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{currentView === 'admin' ? t('shopMode') : t('adminMode')}</span>
              {currentView === 'shop' && (
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu toggle */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-neutral-700 hover:text-neutral-950"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo (Exact brand styling from screenshot) */}
          <div className="flex-shrink-0 flex items-center">
            <button
              id="brand-logo-btn"
              onClick={() => handleCategoryClick(null)}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-extrabold text-2xl tracking-[0.25em] text-neutral-950 block leading-tight group-hover:opacity-90">
                {settings.logoText || 'HOBS'}
              </span>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="h-[1px] w-3 bg-neutral-400" />
                <span className="text-[10px] tracking-[0.35em] text-neutral-500 font-semibold uppercase">
                  {settings.logoSubtext || 'STYLE'}
                </span>
                <span className="h-[1px] w-3 bg-neutral-400" />
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                id={`desktop-nav-${link.catId || 'home'}`}
                onClick={() => handleCategoryClick(link.catId)}
                className={`text-sm tracking-wide font-medium transition-colors relative py-1 ${
                  link.isSpecial
                    ? 'text-rose-600 hover:text-rose-700 font-semibold'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                {link.label}
                {link.isSpecial && (
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Action icons: Search, Account, Cart */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Button & Bar Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-neutral-100 rounded-full px-3 py-1.5 border border-neutral-300 w-48 sm:w-64 animate-in fade-in duration-200">
                  <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    id="header-search-input"
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-neutral-400 hover:text-neutral-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="header-search-toggle-btn"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100"
                  aria-label="Rechercher"
                  title="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Account Icon */}
            <button
              id="header-account-btn"
              onClick={() => setIsAccountModalOpen(true)}
              className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100 relative"
              aria-label={t('account')}
              title={t('account')}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart Button with Count Badge */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-neutral-900 hover:text-black transition-colors rounded-full hover:bg-neutral-100 relative"
              aria-label={t('cart')}
              title={t('cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span
                  id="header-cart-badge"
                  className="absolute -top-0.5 -right-0.5 bg-neutral-950 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              id="mobile-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleCategoryClick(link.catId)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.isSpecial
                    ? 'bg-rose-50 text-rose-700 font-semibold'
                    : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Quick Role status */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Connecté: <strong className="text-neutral-800">{currentUser.name}</strong> ({currentUser.role})</span>
            <button
              onClick={() => {
                setCurrentView(currentView === 'shop' ? 'admin' : 'shop');
                setMobileMenuOpen(false);
              }}
              className="text-neutral-900 underline font-semibold"
            >
              {currentView === 'shop' ? 'Ouvrir Admin' : 'Voir Boutique'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
