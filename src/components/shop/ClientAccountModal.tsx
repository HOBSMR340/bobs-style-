import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Search,
  Phone,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const ClientAccountModal: React.FC = () => {
  const {
    t,
    formatPrice,
    orders,
    isAccountModalOpen,
    setIsAccountModalOpen,
    settings,
  } = useStore();

  const [phoneFilter, setPhoneFilter] = useState('');

  if (!isAccountModalOpen) return null;

  // Filter orders by phone or order number if user typed something
  const filteredOrders = phoneFilter.trim()
    ? orders.filter(
        (o) =>
          o.customerPhone.includes(phoneFilter.trim()) ||
          o.orderNumber.toLowerCase().includes(phoneFilter.trim().toLowerCase()) ||
          o.customerName.toLowerCase().includes(phoneFilter.trim().toLowerCase())
      )
    : orders;

  const statusBadges: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'Nouvelle', bg: 'bg-amber-100', text: 'text-amber-800' },
    confirmed: { label: 'Confirmée', bg: 'bg-blue-100', text: 'text-blue-800' },
    processing: { label: 'En préparation', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    shipped: { label: 'Expédiée', bg: 'bg-purple-100', text: 'text-purple-800' },
    delivered: { label: 'Livrée', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    cancelled: { label: 'Annulée', bg: 'bg-rose-100', text: 'text-rose-800' },
    returned: { label: 'Retournée', bg: 'bg-neutral-200', text: 'text-neutral-800' },
  };

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={() => setIsAccountModalOpen(false)}
    >
      <div
        id="account-modal-container"
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-950">
                {t('clientOrdersTitle')} & Suivi
              </h2>
              <p className="text-xs text-neutral-500">
                Suivez en direct l'acheminement de vos colis HOBS STYLE.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-neutral-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par n° de commande ou téléphone (ex: 0550...)"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950"
            />
          </div>
        </div>

        {/* Orders list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                {t('noOrdersYet')}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const badge = statusBadges[order.status] || statusBadges.pending;
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-neutral-900">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Passée le {new Date(order.createdAt).toLocaleDateString()} à{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-neutral-950">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <div className="text-[10px] text-neutral-400 uppercase">
                        {order.paymentMethod === 'cod' ? 'À la livraison' : 'En ligne'}
                      </div>
                    </div>
                  </div>

                  {/* Items miniature */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center gap-3 overflow-x-auto">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-100 shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-7 h-7 object-contain rounded"
                        />
                        <div className="text-[11px]">
                          <span className="font-medium text-neutral-800 line-clamp-1 max-w-[140px]">
                            {item.productName}
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            {item.variantInfo} (x{item.quantity})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination & Tracking */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        Destination: {order.shippingAddress.wilaya} ({order.shippingAddress.commune})
                      </span>
                    </div>

                    {order.trackingNumber && (
                      <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                        Colis: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Support Hotline */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-neutral-500" />
            <span>Besoin d'aide ? Appelez le <strong>{settings.phone}</strong></span>
          </div>
          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
