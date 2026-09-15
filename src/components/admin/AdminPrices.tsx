import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Tag,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AdminPrices: React.FC = () => {
  const {
    products,
    categories,
    bulkUpdatePrices,
    updateProduct,
    formatPrice,
    hasPermission,
  } = useStore();

  const [targetCategory, setTargetCategory] = useState<string>('all');
  const [operationType, setOperationType] = useState<'percent' | 'fixed'>('percent');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('decrease');
  const [amountValue, setAmountValue] = useState<number>(15);
  const [isSettingPromo, setIsSettingPromo] = useState<boolean>(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const canManagePrices = hasPermission('canEditProducts');

  // Filter affected products for simulation
  const targetProducts = products.filter(
    (p) => targetCategory === 'all' || p.categoryId === targetCategory
  );

  const calculateNewPrice = (currentPrice: number) => {
    let delta = 0;
    if (operationType === 'percent') {
      delta = Math.round((currentPrice * amountValue) / 100);
    } else {
      delta = amountValue;
    }

    if (direction === 'increase') {
      return currentPrice + delta;
    } else {
      return Math.max(100, currentPrice - delta);
    }
  };

  const handleApplyBulk = () => {
    bulkUpdatePrices({
      targetCategory: targetCategory === 'all' ? undefined : targetCategory,
      type: operationType,
      value: amountValue,
      direction,
      isPromo: isSettingPromo,
    });
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-950">
          Gestion des Tarifs & Promotions
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Mise à jour en masse des prix de vente, soldes saisonniers et campagnes promotionnelles.
        </p>
      </div>

      {/* Bulk Price Engine Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Mise à jour tarifaire groupée
            </h2>
            <p className="text-xs text-neutral-500">
              Appliquez une augmentation ou une réduction instantanée sur une catégorie ou l'ensemble du magasin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Target */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1">
              Catégorie cible
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-medium"
            >
              <option value="all">Tous les produits ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.fr}
                </option>
              ))}
            </select>
          </div>

          {/* Action type */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1">
              Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('decrease')}
                className={`py-2 px-3 rounded-lg font-bold border text-center ${
                  direction === 'decrease'
                    ? 'bg-rose-50 border-rose-400 text-rose-800'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                Réduction (-)
              </button>
              <button
                type="button"
                onClick={() => setDirection('increase')}
                className={`py-2 px-3 rounded-lg font-bold border text-center ${
                  direction === 'increase'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                Hausse (+)
              </button>
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1">
              Format de la valeur
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperationType('percent')}
                className={`py-2 px-3 rounded-lg font-bold border text-center ${
                  operationType === 'percent'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                Pourcentage (%)
              </button>
              <button
                type="button"
                onClick={() => setOperationType('fixed')}
                className={`py-2 px-3 rounded-lg font-bold border text-center ${
                  operationType === 'fixed'
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                Montant fixe (DZD)
              </button>
            </div>
          </div>

          {/* Value input */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1">
              Valeur ({operationType === 'percent' ? '%' : 'DZD'})
            </label>
            <input
              type="number"
              min={1}
              value={amountValue}
              onChange={(e) => setAmountValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold text-sm"
            />
          </div>
        </div>

        {/* Promo Mode Switch */}
        {direction === 'decrease' && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-amber-950">
                  Enregistrer comme "Prix Promo" avec badge de solde
                </div>
                <div className="text-[11px] text-amber-800">
                  Conserve le prix d'origine barré et affiche le badge de remise (-{amountValue}%) sur le catalogue.
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSettingPromo}
                onChange={(e) => setIsSettingPromo(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950"
              />
            </label>
          </div>
        )}

        {/* Simulation Preview Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-neutral-900">
              Aperçu de la simulation ({targetProducts.length} articles concernés)
            </h3>
            <span className="text-neutral-500">
              Vérifiez les montants avant application
            </span>
          </div>

          <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[10px] uppercase font-bold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Article</th>
                  <th className="py-2.5 px-4">Prix Actuel</th>
                  <th className="py-2.5 px-4">Nouveau Prix Calculé</th>
                  <th className="py-2.5 px-4">Différence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {targetProducts.slice(0, 6).map((prod) => {
                  const currentP = prod.regularPrice;
                  const newP = calculateNewPrice(currentP);
                  const diff = newP - currentP;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">
                        {prod.name.fr}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-neutral-600">
                        {formatPrice(currentP)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-neutral-950">
                        {formatPrice(newP)}
                      </td>
                      <td className="py-2.5 px-4 font-bold">
                        <span className={diff < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {diff > 0 ? `+${formatPrice(diff)}` : formatPrice(diff)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={!canManagePrices || targetProducts.length === 0}
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            Appliquer la mise à jour tarifaire ({targetProducts.length} articles)
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-neutral-950">
                Confirmer la modification en masse ?
              </h3>
              <p className="text-xs text-neutral-500">
                Vous êtes sur le point d'ajuster les prix de{' '}
                <strong>{targetProducts.length} articles</strong> de{' '}
                <strong>{direction === 'decrease' ? '-' : '+'}{amountValue}{operationType === 'percent' ? '%' : ' DZD'}</strong>.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyBulk}
                className="flex-1 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black"
              >
                Confirmer et appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
