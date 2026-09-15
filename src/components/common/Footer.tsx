import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ShieldCheck,
  Truck,
  CreditCard,
  HeartHandshake,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, settings, setShopCategory, setCurrentView } = useStore();

  return (
    <footer id="site-footer" className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-20">
      {/* Upper footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="cursor-pointer">
              <span className="font-extrabold text-2xl tracking-[0.25em] text-white block leading-tight">
                {settings.logoText || 'HOBS'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-[1px] w-3 bg-neutral-600" />
                <span className="text-[10px] tracking-[0.35em] text-neutral-400 font-semibold uppercase">
                  {settings.logoSubtext || 'STYLE'}
                </span>
                <span className="h-[1px] w-3 bg-neutral-600" />
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.storeName} — Votre destination privilégiée pour la mode et le prêt-à-porter haut de gamme en Algérie. Qualité certifiée, élégance quotidienne et livraison express.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-neutral-800 text-emerald-400 border border-neutral-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Livraison active 58 Wilayas
              </span>
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              {t('usefulLinks')}
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => {
                    setShopCategory(null);
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShopCategory('cat-men');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('navMen')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShopCategory('cat-women');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('navWomen')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShopCategory('promos');
                    setCurrentView('shop');
                  }}
                  className="hover:text-white transition-colors text-rose-400"
                >
                  {t('navPromos')}
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('returnsAndExchanges')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('sizeGuide')}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Communities */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              {t('followUs')}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Rejoignez notre communauté sur les réseaux sociaux pour découvrir nos avant-premières et codes promos.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-white hover:text-neutral-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-white hover:text-neutral-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 4: Contact info (Matching screenshot: +213, Oran Algérie) */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              {t('contactUs')}
            </h3>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-300 shrink-0" />
                <span className="font-mono">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-neutral-300 shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}, {settings.country}</span>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Livraison disponible partout en Algérie</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar with payment options and copyright */}
      <div className="border-t border-neutral-800 bg-neutral-950 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 {settings.storeName}. {t('allRightsReserved')}
          </div>

          {/* Payment & Trust badges */}
          <div className="flex items-center gap-4 text-neutral-400 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Paiement à la livraison</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>CIB / Edahabia / Visa</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
