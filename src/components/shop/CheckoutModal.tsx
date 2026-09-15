import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ALGERIA_WILAYAS } from '../../data/seedData';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowRight,
  PackageCheck,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, PaymentMethod } from '../../types';
import {
  generateCustomerToStoreWhatsAppMessage,
  getWhatsAppUrl,
  generateOrderEmailContent,
  getGmailComposeUrl,
  formatPhoneForWhatsApp,
} from '../../utils/confirmationUtils';

export const CheckoutModal: React.FC = () => {
  const {
    t,
    language,
    formatPrice,
    cart,
    cartSubtotal,
    settings,
    placeOrder,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsAccountModalOpen,
    markOrderWhatsAppConfirmed,
    markOrderGmailConfirmed,
    showToast,
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default Alger
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const [hasOpenedGmail, setHasOpenedGmail] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentWilaya = ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[0];

  // Dynamic shipping calculation based on wilaya and free shipping threshold
  const calculatedShipping =
    cartSubtotal >= settings.freeShippingThreshold ? 0 : currentWilaya.fee;

  const finalTotal = cartSubtotal + calculatedShipping;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || cart.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = placeOrder({
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          wilaya: currentWilaya.name,
          wilayaCode: currentWilaya.code,
          commune: commune.trim() || currentWilaya.name,
          notes: notes.trim() || undefined,
        },
        items: cart.map((item) => ({
          id: 'item-' + Date.now() + Math.random().toString().slice(2, 6),
          productId: item.product.id,
          variantId: item.variant.id,
          productName: item.product.name.fr,
          variantInfo: `${item.variant.colorName.fr} / ${item.variant.size}`,
          image: item.product.images[0],
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
        subtotal: cartSubtotal,
        shippingCost: calculatedShipping,
        discount: 0,
        totalAmount: finalTotal,
        currency: 'DZD',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
      });

      setIsSubmitting(false);
      setConfirmedOrder(newOrder);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if not loaded
      }
    }, 600);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setHasOpenedWhatsApp(false);
    setHasOpenedGmail(false);
    setCopiedMessage(false);
  };

  const handleOpenWhatsApp = () => {
    if (!confirmedOrder) return;
    const msg = generateCustomerToStoreWhatsAppMessage(confirmedOrder, settings);
    const targetPhone = settings.whatsappNumber || '+213550001122';
    const url = getWhatsAppUrl(targetPhone, msg);
    markOrderWhatsAppConfirmed(confirmedOrder.id);
    setHasOpenedWhatsApp(true);
    window.open(url, '_blank');
    showToast('Ouverture de WhatsApp pour valider votre commande !', 'success');
  };

  const handleOpenGmail = () => {
    if (!confirmedOrder) return;
    const { subject, body } = generateOrderEmailContent(confirmedOrder, settings, 'admin_notification');
    const targetEmail = settings.gmailNotificationEmail || 'missoursohaib374@gmail.com';
    const { webGmailUrl } = getGmailComposeUrl(targetEmail, subject, body, confirmedOrder.customerEmail);
    markOrderGmailConfirmed(confirmedOrder.id);
    setHasOpenedGmail(true);
    window.open(webGmailUrl, '_blank');
    showToast('Composeur Gmail ouvert avec les détails de la commande !', 'info');
  };

  const handleCopyMessage = () => {
    if (!confirmedOrder) return;
    const msg = generateCustomerToStoreWhatsAppMessage(confirmedOrder, settings);
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedMessage(true);
      showToast('Message de confirmation copié !', 'success');
      setTimeout(() => setCopiedMessage(false), 3000);
    });
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={handleClose}
    >
      <div
        id="checkout-modal-container"
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {confirmedOrder ? (
          /* Success Screen with WhatsApp & Gmail confirmations */
          <div className="p-6 sm:p-10 text-center space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <PackageCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-neutral-950">
                {t('orderSuccessTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                {t('orderSuccessSubtitle')}
              </p>
            </div>

            {/* Order summary pill */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 inline-block max-w-md w-full text-left space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-500 font-medium">
                    {t('yourOrderNumber')}
                  </div>
                  <div className="text-xl font-mono font-extrabold text-neutral-950">
                    #{confirmedOrder.orderNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500 font-medium">
                    Total à payer
                  </div>
                  <div className="text-base font-extrabold text-emerald-700">
                    {formatPrice(confirmedOrder.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-600 pt-1 border-t border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-neutral-400" />
                  <span>
                    {confirmedOrder.shippingAddress.commune}, {confirmedOrder.shippingAddress.wilaya}
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-700">
                  {confirmedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Paiement en ligne'}
                </span>
              </div>
            </div>

            {/* DIRECT WHATSAPP & GMAIL CONFIRMATION SECTION */}
            <div className="bg-gradient-to-b from-neutral-50 to-white rounded-2xl border-2 border-emerald-500/30 p-5 text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Confirmation Prioritaire de Commande
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Validation Express
                </span>
              </div>

              <p className="text-xs text-neutral-600">
                Pour garantir une expédition immédiate sous 24h, confirmez dès maintenant votre commande directement via <strong>WhatsApp</strong> ou <strong>Gmail</strong> :
              </p>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* WhatsApp Button */}
                <button
                  onClick={handleOpenWhatsApp}
                  className={`w-full p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                    hasOpenedWhatsApp
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <div className="text-left leading-tight">
                    <div>{hasOpenedWhatsApp ? '✓ Reconfirmer sur WhatsApp' : 'Confirmer sur WhatsApp'}</div>
                    <div className="text-[10px] text-emerald-100 font-normal">
                      {settings.whatsappNumber || '+213 550 00 11 22'}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                </button>

                {/* Gmail Button */}
                <button
                  onClick={handleOpenGmail}
                  className={`w-full p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all border shadow-sm ${
                    hasOpenedGmail
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-white hover:bg-rose-50/70 border-rose-200 text-rose-700'
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0 text-rose-600" />
                  <div className="text-left leading-tight">
                    <div>{hasOpenedGmail ? '✓ Renvoyer via Gmail' : 'Confirmation par Gmail'}</div>
                    <div className="text-[10px] text-neutral-500 font-normal truncate max-w-[150px]">
                      {settings.gmailNotificationEmail || 'missoursohaib374@gmail.com'}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                </button>
              </div>

              {/* Copy Message Option */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-xs text-neutral-500">
                <span className="text-[11px]">Besoin de copier le récapitulatif ?</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-500" />
                      <span>Copier le texte</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-500 italic max-w-md mx-auto">
              {t('orderConfirmationNotice')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setIsAccountModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-neutral-900 text-xs font-bold hover:bg-neutral-50"
              >
                Suivre ma commande
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <h2 className="text-lg font-extrabold text-neutral-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{t('checkoutTitle')}</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Remplissez vos coordonnées pour valider l'expédition immédiate de votre commande.
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Delivery Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('deliveryInfo')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      {t('fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Karim Benali"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      {t('phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0550 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      {t('wilaya')} *
                    </label>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 bg-white"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.name} ({formatPrice(w.fee)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      {t('commune')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alger-Centre, Sidi Yahia..."
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    {t('address')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Numéro de rue, bâtiment, quartier..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    {t('orderNotes')}
                  </label>
                  <input
                    type="text"
                    placeholder="Indications pour le livreur (facultatif)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('paymentMethodTitle')}
                </h3>

                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950'
                        : 'border-neutral-200 hover:bg-neutral-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-neutral-950 focus:ring-0"
                    />
                    <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-neutral-900">
                        {t('paymentCod')}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Réglez votre commande en espèces au livreur lors de la remise du colis.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'cib_card'
                        ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950'
                        : 'border-neutral-200 hover:bg-neutral-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cib_card'}
                      onChange={() => setPaymentMethod('cib_card')}
                      className="text-neutral-950 focus:ring-0"
                    />
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-neutral-900">
                        {t('paymentCard')}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Cartes Edahabia & CIB acceptées (Plateforme SATIM sécurisée).
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary Recap */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Articles ({cart.length})</span>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Livraison ({currentWilaya.name})</span>
                  {calculatedShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">GRATUIT</span>
                  ) : (
                    <span className="font-semibold text-neutral-900">
                      {formatPrice(calculatedShipping)}
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-950">
                  <span>Total à payer</span>
                  <span className="text-base">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-neutral-200 bg-white">
              <button
                type="submit"
                id="submit-order-btn"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <span>{t('confirmOrderBtn')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
