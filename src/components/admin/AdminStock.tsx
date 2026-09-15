import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Plus,
  Minus,
  CheckCircle2,
  History,
} from 'lucide-react';
import { InventoryMovement } from '../../types';

export const AdminStock: React.FC = () => {
  const {
    products,
    inventoryMovements,
    adjustStock,
    hasPermission,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Modal for stock adjustment
  const [selectedItem, setSelectedItem] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    size: string;
    color: string;
    currentStock: number;
  } | null>(null);

  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'restock' | 'manual_adjustment' | 'loss'>('restock');
  const [adjustReason, setAdjustReason] = useState('Réception nouvelle commande fournisseur');

  const canManageStock = hasPermission('canManageStock');

  // Flatten all variants for the table
  const allStockRows = products.flatMap((prod) =>
    prod.variants.map((v) => ({
      productId: prod.id,
      productName: prod.name.fr,
      image: prod.images[0],
      sku: v.sku,
      variantId: v.id,
      size: v.size,
      color: v.colorName.fr,
      colorHex: v.colorHex,
      stock: v.stock,
      threshold: prod.minStockThreshold || 6,
      category: prod.categoryId,
    }))
  );

  const filteredRows = allStockRows.filter((row) => {
    if (filterMode === 'low' && (row.stock > row.threshold || row.stock === 0)) return false;
    if (filterMode === 'out' && row.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        row.productName.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.size.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustQty <= 0) return;

    let delta = adjustQty;
    if (adjustType === 'loss') {
      delta = -adjustQty;
    }

    adjustStock(
      selectedItem.productId,
      selectedItem.variantId,
      delta,
      adjustType,
      adjustReason
    );

    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Gestion du Stock & Inventaire
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivi des niveaux de stock par taille, alertes de réapprovisionnement et historique des flux.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-neutral-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'inventory' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Niveaux de stock
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique mouvements ({inventoryMovements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par article ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterMode === 'all'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Tous ({allStockRows.length})
              </button>
              <button
                onClick={() => setFilterMode('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterMode === 'low'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Stock Faible (&le; seuil)
              </button>
              <button
                onClick={() => setFilterMode('out')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterMode === 'out'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Ruptures (0)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">SKU Variante</th>
                    <th className="py-3 px-4">Taille</th>
                    <th className="py-3 px-4">Couleur</th>
                    <th className="py-3 px-4">Stock Actuel</th>
                    <th className="py-3 px-4">Seuil Alerte</th>
                    <th className="py-3 px-4">État</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredRows.map((row) => {
                    const isOut = row.stock === 0;
                    const isLow = !isOut && row.stock <= row.threshold;

                    return (
                      <tr key={row.variantId} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={row.image}
                              alt={row.productName}
                              className="w-9 h-9 object-contain rounded border bg-white p-0.5"
                            />
                            <span className="font-bold text-neutral-900 line-clamp-1">
                              {row.productName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                          {row.sku}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                            {row.size}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                              style={{ backgroundColor: row.colorHex }}
                            />
                            <span className="text-neutral-700">{row.color}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-sm">
                          <span
                            className={
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }
                          >
                            {row.stock} unités
                          </span>
                        </td>

                        <td className="py-3 px-4 text-neutral-500 font-mono">
                          {row.threshold}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Épuisé' : isLow ? 'Faible' : 'Optimal'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {canManageStock && (
                            <button
                              onClick={() => {
                                setSelectedItem({
                                  productId: row.productId,
                                  productName: row.productName,
                                  variantId: row.variantId,
                                  size: row.size,
                                  color: row.color,
                                  currentStock: row.stock,
                                });
                                setAdjustQty(10);
                                setAdjustType('restock');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white font-semibold text-[11px] transition-colors"
                            >
                              Ajuster
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Movement History Table */
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 font-bold text-xs text-neutral-900 flex items-center justify-between">
            <span>Journal d'audit des mouvements d'inventaire</span>
            <span className="text-neutral-500 font-normal">Tracé immuable</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] bg-neutral-50">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Type Flux</th>
                  <th className="py-3 px-4">Quantité</th>
                  <th className="py-3 px-4">Stock Avant &rarr; Après</th>
                  <th className="py-3 px-4">Motif / Justificatif</th>
                  <th className="py-3 px-4">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {inventoryMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(mov.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {mov.productName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          mov.movementType === 'restock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mov.movementType === 'sale'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {mov.movementType === 'restock' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{mov.movementType}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={mov.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {mov.previousStock} &rarr; <strong>{mov.newStock}</strong>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {mov.reason || '—'}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-medium">
                      {mov.performedByName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-neutral-950">
                Ajuster le stock
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-neutral-100/80 space-y-1">
                <div className="font-bold text-neutral-900 text-sm">
                  {selectedItem.productName}
                </div>
                <div className="text-neutral-600">
                  Déclinaison : <strong>Taille {selectedItem.size}</strong> • {selectedItem.color}
                </div>
                <div className="text-neutral-600">
                  Stock actuel : <strong>{selectedItem.currentStock} unités</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Type d'opération
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="restock">Entrée de stock (Réapprovisionnement fournisseur)</option>
                  <option value="manual_adjustment">Régularisation d'inventaire</option>
                  <option value="loss">Perte / Vol / Article défectueux (Sortie)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Quantité à {adjustType === 'loss' ? 'déduire' : 'ajouter'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Motif / Numéro de bon
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  placeholder="Ex: Arrivage Conteneur #482"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neutral-950 text-white font-bold hover:bg-black"
                >
                  Valider l'ajustement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
