import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import {
  generateStoreToCustomerWhatsAppMessage,
  getWhatsAppUrl,
  generateOrderEmailContent,
  getGmailComposeUrl,
  formatPhoneForWhatsApp,
} from '../../utils/confirmationUtils';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateOrderTracking,
    markOrderWhatsAppConfirmed,
    markOrderGmailConfirmed,
    settings,
    formatPrice,
    hasPermission,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [whatsappTemplateType, setWhatsappTemplateType] = useState<'confirm' | 'shipped' | 'followup'>('confirm');
  const [copiedMsg, setCopiedMsg] = useState(false);

  const canManageOrders = hasPermission('canManageOrders');

  const statusList: { key: string; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'Nouvelles' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'processing', label: 'En préparation' },
    { key: 'shipped', label: 'Expédiées' },
    { key: 'delivered', label: 'Livrées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.shippingAddress.wilaya.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || '');
    setWhatsappTemplateType('confirm');
    setCopiedMsg(false);
  };

  const handleWhatsAppCustomer = (order: Order, type: 'confirm' | 'shipped' | 'followup' = 'confirm') => {
    const msg = generateStoreToCustomerWhatsAppMessage(order, settings, type);
    const targetPhone = order.customerPhone;
    const url = getWhatsAppUrl(targetPhone, msg);
    markOrderWhatsAppConfirmed(order.id);
    if (order.status === 'pending') {
      updateOrderStatus(order.id, 'confirmed');
    }
    window.open(url, '_blank');
    showToast(`WhatsApp ouvert pour ${order.customerName} (${order.customerPhone})`, 'success');
  };

  const handleGmailConfirmation = (order: Order) => {
    const targetEmail = order.customerEmail || settings.gmailNotificationEmail || 'missoursohaib374@gmail.com';
    const { subject, body } = generateOrderEmailContent(order, settings, order.customerEmail ? 'customer_confirmation' : 'admin_notification');
    const { webGmailUrl } = getGmailComposeUrl(targetEmail, subject, body, settings.gmailNotificationEmail);
    markOrderGmailConfirmed(order.id);
    window.open(webGmailUrl, '_blank');
    showToast(`Composeur Gmail ouvert vers ${targetEmail}`, 'info');
  };

  const handleCopyAdminMessage = (order: Order) => {
    const msg = generateStoreToCustomerWhatsAppMessage(order, settings, whatsappTemplateType);
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedMsg(true);
      showToast('Texte du message copié !', 'success');
      setTimeout(() => setCopiedMsg(false), 3000);
    });
  };

  const handleSaveTracking = () => {
    if (!selectedOrder) return;
    updateOrderTracking(selectedOrder.id, trackingInput);
    setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Gestion des Commandes
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Validation des achats clients, assignation des transporteurs et génération des bons de livraison.
          </p>
        </div>

        <div className="text-xs font-semibold text-neutral-500">
          Total : <strong>{orders.length} commandes</strong> enregistrées
        </div>
      </div>

      {/* Controls & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par N° commande, client ou tél..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statusList.map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === st.key
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Paiement</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleOpenDetail(order)}
                  className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-neutral-500 text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600 text-[11px]">
                    {order.customerPhone}
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {order.shippingAddress.wilaya}
                  </td>
                  <td className="py-3 px-4 text-neutral-600">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-950">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-neutral-600">
                      {order.paymentMethod === 'cod' ? 'À la livraison' : 'Carte'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Confirmer avec le client par WhatsApp"
                        onClick={() => handleWhatsAppCustomer(order, 'confirm')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Envoyer confirmation par Gmail"
                        onClick={() => handleGmailConfirmation(order)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDetail(order)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[10px] hover:bg-black"
                      >
                        Détails
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-neutral-950">
                    Commande #{selectedOrder.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-900 text-white">
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Reçue le {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-800 text-xs font-bold hover:bg-neutral-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer bon</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Status pipeline actions */}
              {canManageOrders && (
                <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 space-y-2">
                  <div className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Mettre à jour l'étape logistique :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                      className={`px-3 py-1.5 rounded-lg font-bold ${
                        selectedOrder.status === 'confirmed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      1. Confirmer
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className={`px-3 py-1.5 rounded-lg font-bold ${
                        selectedOrder.status === 'processing'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      2. En préparation
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className={`px-3 py-1.5 rounded-lg font-bold ${
                        selectedOrder.status === 'shipped'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      3. Expédiée
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className={`px-3 py-1.5 rounded-lg font-bold ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      4. Livrée & Encaissée
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Customer & Delivery Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                  <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span>Adresse de livraison</span>
                  </h3>
                  <div className="text-neutral-700 leading-relaxed">
                    <div><strong>{selectedOrder.customerName}</strong></div>
                    <div>{selectedOrder.shippingAddress.address}</div>
                    <div>{selectedOrder.shippingAddress.commune}, {selectedOrder.shippingAddress.wilaya}</div>
                    {selectedOrder.shippingAddress.notes && (
                      <div className="mt-1 text-amber-700 italic bg-amber-50 p-1.5 rounded">
                        Note: {selectedOrder.shippingAddress.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                  <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span>Contact & Paiement</span>
                  </h3>
                  <div className="text-neutral-700 space-y-1">
                    <div>Téléphone : <strong className="font-mono">{selectedOrder.customerPhone}</strong></div>
                    <div>Mode de paiement : <strong>{selectedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte'}</strong></div>
                    <div>Statut paiement : <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span></div>
                  </div>

                  {/* Tracking input */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Numéro de suivi colis (Yalidine, ZR...) :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Ex: YAL-9482104"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 font-mono"
                      />
                      <button
                        onClick={handleSaveTracking}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-bold hover:bg-black"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHATSAPP & GMAIL CONFIRMATION HUB */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-neutral-900 text-sm">
                      Confirmation & Communication Client (WhatsApp & Gmail)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.whatsappConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                      {selectedOrder.whatsappConfirmed ? '✓ WhatsApp Confirmé' : 'WhatsApp En Attente'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.gmailConfirmed ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-600'}`}>
                      {selectedOrder.gmailConfirmed ? '✓ Gmail Envoyé' : 'Gmail En Attente'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WhatsApp Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Contacter le client sur WhatsApp</span>
                      </div>
                      <span className="font-mono text-[11px] text-neutral-500">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-500">
                        Type de message automatique :
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWhatsappTemplateType('confirm')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold ${whatsappTemplateType === 'confirm' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                        >
                          Validation commande
                        </button>
                        <button
                          type="button"
                          onClick={() => setWhatsappTemplateType('shipped')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold ${whatsappTemplateType === 'shipped' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                        >
                          Colis expédié
                        </button>
                        <button
                          type="button"
                          onClick={() => setWhatsappTemplateType('followup')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold ${whatsappTemplateType === 'followup' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                        >
                          Rappel livraison
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto leading-relaxed">
                      {generateStoreToCustomerWhatsAppMessage(selectedOrder, settings, whatsappTemplateType)}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleWhatsAppCustomer(selectedOrder, whatsappTemplateType)}
                        className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ouvrir WhatsApp (+213...)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyAdminMessage(selectedOrder)}
                        className="px-2.5 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        title="Copier le message"
                      >
                        {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Gmail Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <Mail className="w-4 h-4 text-rose-600" />
                          <span>Confirmation & Facture par Gmail</span>
                        </div>
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                          Google Mail
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-600 space-y-1">
                        <div>
                          <strong>Destinataire :</strong> {selectedOrder.customerEmail || 'Client (non renseigné)'}
                        </div>
                        <div>
                          <strong>Email boutique :</strong> {settings.gmailNotificationEmail || 'missoursohaib374@gmail.com'}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                        <div className="font-semibold text-neutral-800">
                          Objet : [HOBS STYLE] Confirmation commande #{selectedOrder.orderNumber}
                        </div>
                        <div className="text-neutral-500 line-clamp-3">
                          Bonjour {selectedOrder.customerName}, nous vous confirmons la bonne prise en charge de votre commande de {selectedOrder.totalAmount} DA...
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGmailConfirmation(selectedOrder)}
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Envoyer la confirmation via Gmail</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900">Articles commandés</h3>
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Article</th>
                        <th className="py-2.5 px-4">Déclinaison</th>
                        <th className="py-2.5 px-4">Prix unitaire</th>
                        <th className="py-2.5 px-4">Quantité</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedOrder.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-3 px-4 font-bold text-neutral-900 flex items-center gap-2">
                            <img
                              src={it.image}
                              alt={it.productName}
                              className="w-8 h-8 object-contain rounded border p-0.5"
                            />
                            <span>{it.productName}</span>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 font-medium">
                            {it.variantInfo}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {formatPrice(it.unitPrice)}
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">
                            x{it.quantity}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-neutral-950 text-right">
                            {formatPrice(it.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recap */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1 text-right">
                  <div className="text-neutral-600">
                    Sous-total : <strong className="font-mono">{formatPrice(selectedOrder.subtotal)}</strong>
                  </div>
                  <div className="text-neutral-600">
                    Frais de livraison : <strong className="font-mono">{formatPrice(selectedOrder.shippingCost)}</strong>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 text-sm font-black text-neutral-950">
                    Total TTC : <span className="font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Packing Slip / Invoice Modal */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-8 shadow-2xl space-y-6 text-neutral-950">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black">HOBS STYLE</h2>
                <p className="text-xs text-neutral-500">Bon de livraison & Facture</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold">#{selectedOrder.orderNumber}</div>
                <div className="text-xs text-neutral-400">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div><strong>Destinataire :</strong> {selectedOrder.customerName}</div>
              <div><strong>Téléphone :</strong> {selectedOrder.customerPhone}</div>
              <div><strong>Adresse :</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.commune}, {selectedOrder.shippingAddress.wilaya}</div>
            </div>

            <table className="w-full text-xs text-left border-y">
              <thead>
                <tr className="border-b text-neutral-500">
                  <th className="py-2">Article</th>
                  <th className="py-2">Qté</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((i) => (
                  <tr key={i.id} className="border-b">
                    <td className="py-2">{i.productName} ({i.variantInfo})</td>
                    <td className="py-2">x{i.quantity}</td>
                    <td className="py-2 text-right font-mono">{formatPrice(i.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right text-xs space-y-1">
              <div>Sous-total : {formatPrice(selectedOrder.subtotal)}</div>
              <div>Livraison : {formatPrice(selectedOrder.shippingCost)}</div>
              <div className="text-sm font-extrabold">Total à payer : {formatPrice(selectedOrder.totalAmount)}</div>
            </div>

            <div className="pt-4 flex justify-end gap-3 no-print">
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-black text-white text-xs font-bold"
              >
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
