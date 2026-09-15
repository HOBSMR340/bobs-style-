import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Eye,
  AlertTriangle,
  Upload,
  Layers,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    formatPrice,
    hasPermission,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brand, setBrand] = useState('HOBS');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-men');
  const [subCategory, setSubCategory] = useState('');
  const [sku, setSku] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(5000);
  const [isPromo, setIsPromo] = useState(false);
  const [promoPrice, setPromoPrice] = useState<number>(4200);
  const [descFr, setDescFr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: 'v-' + Date.now(),
      size: 'M',
      colorName: { fr: 'Noir', ar: 'أسود', en: 'Black' },
      colorHex: '#111111',
      stock: 20,
      sku: 'HOBS-M',
    },
  ]);

  const canEdit = hasPermission('canEditProducts');
  const canDelete = hasPermission('canDeleteProducts');

  const openCreateModal = () => {
    setEditingProduct(null);
    setNameFr('');
    setNameAr('');
    setNameEn('');
    setBrand('HOBS');
    setCategoryId(categories[0]?.id || 'cat-men');
    setSubCategory('');
    setSku('HBS-' + Math.floor(1000 + Math.random() * 9000));
    setRegularPrice(5500);
    setIsPromo(false);
    setPromoPrice(4500);
    setDescFr('Pièce confectionnée avec soin dans un tissu haut de gamme.');
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80');
    setVariants([
      {
        id: 'var-1',
        size: 'M',
        colorName: { fr: 'Noir', ar: 'أسود', en: 'Black' },
        colorHex: '#111111',
        stock: 15,
        sku: 'HBS-BLK-M',
      },
      {
        id: 'var-2',
        size: 'L',
        colorName: { fr: 'Noir', ar: 'أسود', en: 'Black' },
        colorHex: '#111111',
        stock: 10,
        sku: 'HBS-BLK-L',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNameFr(prod.name.fr);
    setNameAr(prod.name.ar);
    setNameEn(prod.name.en);
    setBrand(prod.brand);
    setCategoryId(prod.categoryId);
    setSubCategory(prod.subCategory || '');
    setSku(prod.sku);
    setRegularPrice(prod.regularPrice);
    setIsPromo(prod.isPromo);
    setPromoPrice(prod.promoPrice || prod.regularPrice);
    setDescFr(prod.description.fr);
    setImageUrl(prod.images[0] || '');
    setVariants(prod.variants);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim() || !sku.trim()) return;

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: {
        fr: nameFr.trim(),
        ar: nameAr.trim() || nameFr.trim(),
        en: nameEn.trim() || nameFr.trim(),
      },
      description: {
        fr: descFr.trim(),
        ar: descFr.trim(),
        en: descFr.trim(),
      },
      brand: brand.trim(),
      categoryId,
      subCategory: subCategory.trim() || undefined,
      sku: sku.trim(),
      buyPrice: Math.round(Number(regularPrice) * 0.6),
      regularPrice: Number(regularPrice),
      promoPrice: isPromo ? Number(promoPrice) : undefined,
      isPromo,
      gender: 'homme',
      isNewArrival: editingProduct ? editingProduct.isNewArrival : true,
      isBestSeller: editingProduct ? editingProduct.isBestSeller : false,
      isFeatured: editingProduct ? editingProduct.isFeatured : false,
      status: totalStock > 0 ? 'active' : 'out_of_stock',
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      images: [imageUrl],
      variants,
      minStockThreshold: 5,
      tags: ['mode', brand.toLowerCase()],
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        id: 'var-' + Date.now(),
        size: 'XL',
        colorName: { fr: 'Bleu', ar: 'أزرق', en: 'Blue' },
        colorHex: '#1E3A8A',
        stock: 10,
        sku: `${sku}-BLU-XL`,
      },
    ]);
  };

  const updateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariants(updated);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.fr.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Gestion du Catalogue Produits
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ajout, modification, déclinaisons (tailles/couleurs) et prix des articles.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, SKU ou marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">Catégorie :</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white text-neutral-900 focus:ring-1 focus:ring-neutral-950"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.fr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">SKU / Réf</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix Vente</th>
                <th className="py-3 px-4">Stock Total</th>
                <th className="py-3 px-4">Déclinaisons</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                const isCritical = totalStock <= (p.minStockThreshold || 6);

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name.fr}
                          className="w-10 h-10 object-contain rounded-lg border bg-white p-0.5"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 line-clamp-1">
                            {p.name.fr}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-medium">
                            {p.brand} {p.subCategory ? `• ${p.subCategory}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                      {p.sku}
                    </td>

                    <td className="py-3 px-4 text-neutral-600">
                      {categories.find((c) => c.id === p.categoryId)?.name.fr || p.categoryId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-950">
                        {p.isPromo && p.promoPrice ? formatPrice(p.promoPrice) : formatPrice(p.regularPrice)}
                      </div>
                      {p.isPromo && (
                        <span className="text-[10px] text-rose-600 font-semibold line-through">
                          {formatPrice(p.regularPrice)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            totalStock === 0
                              ? 'text-rose-600'
                              : isCritical
                              ? 'text-amber-600'
                              : 'text-neutral-900'
                          }`}
                        >
                          {totalStock} pcs
                        </span>
                        {isCritical && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {p.variants.length} variante{p.variants.length > 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          totalStock === 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {totalStock === 0 ? 'Rupture' : 'Actif'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-neutral-500 hover:text-neutral-950"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement le produit "${p.name.fr}" ?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h2 className="text-base font-extrabold text-neutral-950">
                {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Multilingual Names */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                  Titres & Traductions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Nom (Français) *</label>
                    <input
                      type="text"
                      required
                      value={nameFr}
                      onChange={(e) => setNameFr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                      placeholder="Ex: Polo Ralph Lauren"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Nom (Arabe)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                      placeholder="مثال: بولو أصلي"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Nom (Anglais)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                      placeholder="Ex: Classic Polo"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Marque</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.fr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">SKU Référence *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block font-semibold mb-1">Prix Standard (DZD) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-bold"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPromo}
                        onChange={(e) => setIsPromo(e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900"
                      />
                      <span className="font-semibold text-rose-700">Activer le prix Promo</span>
                    </label>
                  </div>

                  {isPromo && (
                    <div>
                      <label className="block font-semibold mb-1 text-rose-700">
                        Prix Promotionnel (DZD)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={promoPrice}
                        onChange={(e) => setPromoPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-rose-300 font-bold text-rose-700 bg-rose-50/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Image URL */}
              <div>
                <label className="block font-semibold mb-1">URL de l'image principale</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-neutral-700"
                />
              </div>

              {/* Variants Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Déclinaisons (Tailles, Couleurs & Stocks)
                  </h3>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-neutral-900 hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter variante</span>
                  </button>
                </div>

                <div className="space-y-2 border border-neutral-200 rounded-xl p-3 bg-neutral-50/50">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-neutral-200"
                    >
                      <div className="col-span-2">
                        <label className="text-[10px] text-neutral-400">Taille</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-neutral-300 font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-neutral-400">Couleur</label>
                        <input
                          type="text"
                          value={v.colorName.fr}
                          onChange={(e) =>
                            updateVariant(idx, 'colorName', {
                              ...v.colorName,
                              fr: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 rounded border border-neutral-300"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-neutral-400">Code Hex</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={v.colorHex}
                            onChange={(e) => updateVariant(idx, 'colorHex', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border"
                          />
                          <span className="font-mono text-[10px]">{v.colorHex}</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-neutral-400">Stock (Qté)</label>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-neutral-300 font-bold text-neutral-900"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-neutral-400">SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-neutral-300 font-mono text-[10px]"
                        />
                      </div>

                      <div className="col-span-1 text-center pt-3">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-neutral-950 text-white font-bold hover:bg-black shadow-md"
                >
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
