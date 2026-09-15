import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, hasPermission } = useStore();

  const [form, setForm] = useState({ ...settings });
  const canEdit = hasPermission('canConfigureStore');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-950">
          Configuration du Magasin & Paramètres
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Identité visuelle de la boutique, seuils de livraison gratuite, devises et coordonnées.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Brand identity */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Store className="w-4 h-4 text-neutral-600" />
            <span>Identité & Logo de la Boutique</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Nom officiel du magasin
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Texte Logo Principal
              </label>
              <input
                type="text"
                value={form.logoText}
                onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-black tracking-widest"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Sous-titre Logo
              </label>
              <input
                type="text"
                value={form.logoSubtext}
                onChange={(e) => setForm({ ...form, logoSubtext: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold tracking-widest"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery rules */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Truck className="w-4 h-4 text-neutral-600" />
            <span>Politique de Livraison (Algérie)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Seuil de Livraison Gratuite (DZD)
              </label>
              <input
                type="number"
                min={0}
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  setForm({ ...form, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold font-mono"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Offerte automatiquement dès que le panier atteint ce montant.
              </span>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Frais de port par défaut (DZD)
              </label>
              <input
                type="number"
                min={0}
                value={form.defaultShippingFee}
                onChange={(e) =>
                  setForm({ ...form, defaultShippingFee: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Phone className="w-4 h-4 text-neutral-600" />
            <span>Coordonnées & Service Client</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Numéro de Téléphone / Hotline
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Email de Contact
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Adresse & Boutique Physique
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Ville & Pays
              </label>
              <input
                type="text"
                value={`${form.city}, ${form.country}`}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2 pb-3 border-b border-neutral-100">
            <CreditCard className="w-4 h-4 text-neutral-600" />
            <span>Moyens de Paiement Activés</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableCod}
                onChange={(e) => setForm({ ...form, enableCod: e.target.checked })}
                className="w-4 h-4 rounded text-neutral-950"
              />
              <div>
                <strong className="text-neutral-900">Paiement en espèces à la livraison (Cash on Delivery)</strong>
                <p className="text-[11px] text-neutral-500">Le client paie lors de la remise de son colis.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableCardPayment}
                onChange={(e) => setForm({ ...form, enableCardPayment: e.target.checked })}
                className="w-4 h-4 rounded text-neutral-950"
              />
              <div>
                <strong className="text-neutral-900">Paiement électronique CIB / Edahabia / SATIM</strong>
                <p className="text-[11px] text-neutral-500">Paiement sécurisé par carte bancaire nationale.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        {canEdit && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-black shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
