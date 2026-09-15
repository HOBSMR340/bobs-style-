import { Order, StoreSettings } from '../types';

/**
 * Normalizes an Algerian or international phone number for WhatsApp API (digits only with country code)
 * e.g. "0550 12 34 56" -> "213550123456"
 * e.g. "+213 550 12 34 56" -> "213550123456"
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits except initial + if any
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle + prefix
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle Algerian mobile numbers starting with 05, 06, or 07
  if (cleaned.startsWith('0') && (cleaned.startsWith('05') || cleaned.startsWith('06') || cleaned.startsWith('07') || cleaned.startsWith('02') || cleaned.startsWith('03') || cleaned.startsWith('04'))) {
    cleaned = '213' + cleaned.substring(1);
  } else if (!cleaned.startsWith('213') && cleaned.length === 9) {
    // 9-digit without leading zero, prepend 213
    cleaned = '213' + cleaned;
  }

  return cleaned;
}

/**
 * Prepares the WhatsApp confirmation message sent by the CUSTOMER to the STORE
 */
export function generateCustomerToStoreWhatsAppMessage(order: Order, storeSettings: StoreSettings): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   • Déclinaison : ${item.variantInfo}\n   • Qté : ${item.quantity} x ${item.unitPrice} DA\n   • Total : ${item.totalPrice} DA`
    )
    .join('\n\n');

  const paymentLabel =
    order.paymentMethod === 'cod'
      ? 'Espèces à la livraison (Cash on Delivery)'
      : order.paymentMethod === 'cib_card'
      ? 'Carte CIB / Edahabia'
      : 'Virement bancaire';

  const shippingLabel =
    order.shippingCost === 0 ? 'GRATUITE (Offerte)' : `${order.shippingCost} DA`;

  return `Bonjour *${storeSettings.storeName}* ! 🇩🇿

Je souhaite confirmer ma commande passée sur votre boutique en ligne.

📋 *RÉFÉRENCE COMMANDE :* #${order.orderNumber}
📅 *Date :* ${new Date(order.createdAt).toLocaleDateString()}

👤 *INFORMATIONS CLIENT :*
• Nom & Prénom : ${order.customerName}
• Téléphone : ${order.customerPhone}
${order.customerEmail ? `• Email : ${order.customerEmail}\n` : ''}📍 *ADRESSE DE LIVRAISON :*
• Wilaya : ${order.shippingAddress.wilaya} (${order.shippingAddress.wilayaCode})
• Commune : ${order.shippingAddress.commune}
• Adresse : ${order.shippingAddress.address}
${order.shippingAddress.notes ? `• Remarques : ${order.shippingAddress.notes}\n` : ''}
🛒 *ARTICLES COMMANDÉS :*
${itemsText}

🚚 *Frais de livraison :* ${shippingLabel}
💰 *TOTAL À PAYER :* *${order.totalAmount} DA*
💳 *Mode de règlement :* ${paymentLabel}

Merci de confirmer la prise en charge et de me communiquer la date de livraison ! 🙏`;
}

/**
 * Prepares the WhatsApp message sent by the STORE / MERCHANT to the CUSTOMER
 */
export function generateStoreToCustomerWhatsAppMessage(
  order: Order,
  storeSettings: StoreSettings,
  type: 'confirm' | 'shipped' | 'followup' = 'confirm'
): string {
  const totalStr = `${order.totalAmount} DA`;

  if (type === 'shipped') {
    return `Bonjour *${order.customerName}*,

Excellente nouvelle ! Votre commande *#${order.orderNumber}* chez *${storeSettings.storeName}* a été préparée et remise à notre transporteur express 🚚.

📦 *Détails de l'expédition :*
• Montant à régler à la réception : *${totalStr}*
• Destination : ${order.shippingAddress.commune}, ${order.shippingAddress.wilaya}
${order.trackingNumber ? `• Numéro de suivi colis : *${order.trackingNumber}*\n` : ''}• Délai estimé : 24h à 48h

Le livreur vous contactera sur votre numéro (*${order.customerPhone}*) avant son passage. Merci de garder votre téléphone accessible.

Merci pour votre confiance !
Équipe *${storeSettings.storeName}* 🇩🇿`;
  }

  if (type === 'followup') {
    return `Bonjour *${order.customerName}*,

C'est le service logistique *${storeSettings.storeName}*. 

Nous effectuons un rappel concernant votre commande *#${order.orderNumber}* d'un montant de *${totalStr}* vers *${order.shippingAddress.wilaya}*.

Le colis est prêt à être livré à votre adresse : ${order.shippingAddress.address}.
Êtes-vous toujours disponible pour réceptionner votre livraison ?

Merci de nous répondre directement par ce message. Belle journée !`;
  }

  // Default: Order confirmation request
  return `Bonjour *${order.customerName}*,

Nous vous remercions pour votre commande *#${order.orderNumber}* sur la boutique *${storeSettings.storeName}* ! 🎉

📋 *Récapitulatif de votre commande :*
• Articles : ${order.items.length} produit(s) (${order.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')})
• Montant total : *${totalStr}* (Paiement à la livraison)
• Destination : ${order.shippingAddress.address}, ${order.shippingAddress.commune} (${order.shippingAddress.wilaya})

👉 Afin de valider définitivement votre expédition express aujourd'hui, *merci de nous répondre "OUI" ou de confirmer votre disponibilité*.

Nous restons à votre écoute pour toute question.
*${storeSettings.storeName}* • ${storeSettings.phone}`;
}

/**
 * Generates the full WhatsApp Click-to-Chat URL
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const clean = formatPhoneForWhatsApp(phone);
  return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}

/**
 * Generates email subject and body for Gmail confirmation
 */
export function generateOrderEmailContent(
  order: Order,
  storeSettings: StoreSettings,
  recipientType: 'admin_notification' | 'customer_confirmation' = 'admin_notification'
): { subject: string; body: string } {
  const itemsList = order.items
    .map(
      (item, i) =>
        `${i + 1}. ${item.productName}
   - Déclinaison : ${item.variantInfo}
   - Quantité : ${item.quantity}
   - Prix unitaire : ${item.unitPrice} DA
   - Sous-total : ${item.totalPrice} DA`
    )
    .join('\n\n');

  if (recipientType === 'customer_confirmation') {
    const subject = `[${storeSettings.storeName}] Confirmation de votre commande #${order.orderNumber}`;
    const body = `Bonjour ${order.customerName},

Nous avons le plaisir de vous confirmer la bonne réception de votre commande #${order.orderNumber} sur ${storeSettings.storeName}.

RÉCAPITULATIF DE LA COMMANDE :
-------------------------------------------
Numéro de commande : #${order.orderNumber}
Date : ${new Date(order.createdAt).toLocaleString()}
Statut : En cours de validation

ARTICLES COMMANDÉS :
-------------------------------------------
${itemsList}

DÉTAILS FINANCIERS :
-------------------------------------------
Sous-total : ${order.subtotal} DA
Frais de livraison : ${order.shippingCost === 0 ? 'GRATUIT' : order.shippingCost + ' DA'}
Montant total à régler : ${order.totalAmount} DA
Mode de paiement : ${order.paymentMethod === 'cod' ? 'Paiement en espèces à la livraison' : 'Carte CIB / Edahabia'}

ADRESSE DE LIVRAISON :
-------------------------------------------
Destinataire : ${order.customerName}
Téléphone : ${order.customerPhone}
Wilaya : ${order.shippingAddress.wilaya} (${order.shippingAddress.wilayaCode})
Commune : ${order.shippingAddress.commune}
Adresse exacte : ${order.shippingAddress.address}
${order.shippingAddress.notes ? `Instructions livreur : ${order.shippingAddress.notes}\n` : ''}
Notre équipe prépare votre colis avec soin. Un livreur vous contactera par téléphone avant la livraison.

Pour toute question ou modification, vous pouvez nous joindre :
- Par WhatsApp ou téléphone : ${storeSettings.phone}
- Par Email : ${storeSettings.email}

Merci pour votre achat et votre confiance !

L'équipe ${storeSettings.storeName}
${storeSettings.address}, ${storeSettings.city}, Algérie`;

    return { subject, body };
  }

  // Admin Notification Email
  const subject = `🔔 [NOUVELLE COMMANDE #${order.orderNumber}] ${order.customerName} - ${order.totalAmount} DA (${order.shippingAddress.wilaya})`;
  const body = `NOUVELLE COMMANDE REÇUE SUR HOBS STYLE !
===========================================

RÉFÉRENCE : #${order.orderNumber}
DATE : ${new Date(order.createdAt).toLocaleString()}
MONTANT TOTAL : ${order.totalAmount} DA

CLIENT :
-------------------------------------------
Nom : ${order.customerName}
Téléphone : ${order.customerPhone}
Email : ${order.customerEmail || 'Non renseigné'}
Lien WhatsApp direct client : https://wa.me/${formatPhoneForWhatsApp(order.customerPhone)}

LIVRAISON :
-------------------------------------------
Wilaya : ${order.shippingAddress.wilaya} (${order.shippingAddress.wilayaCode})
Commune : ${order.shippingAddress.commune}
Adresse : ${order.shippingAddress.address}
Remarques : ${order.shippingAddress.notes || 'Aucune'}

ARTICLES :
-------------------------------------------
${itemsList}

RÈGLEMENT :
-------------------------------------------
Mode de paiement : ${order.paymentMethod === 'cod' ? 'Paiement à la livraison (COD)' : 'Carte en ligne'}
Frais de port : ${order.shippingCost} DA
Total commande : ${order.totalAmount} DA

Action requise :
1. Contacter le client sur WhatsApp ou par téléphone pour confirmer la disponibilité.
2. Préparer le colis et assigner le bon d'expédition (Yalidine / ZR Express).

Ce message a été généré automatiquement par la plateforme HOBS STYLE.`;

  return { subject, body };
}

/**
 * Returns direct Google Web Gmail composer link and mailto link
 */
export function getGmailComposeUrl(
  toEmail: string,
  subject: string,
  body: string,
  ccEmail?: string
): { webGmailUrl: string; mailtoUrl: string } {
  let webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (ccEmail) {
    webGmailUrl += `&cc=${encodeURIComponent(ccEmail)}`;
  }

  let mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (ccEmail) {
    mailtoUrl += `&cc=${encodeURIComponent(ccEmail)}`;
  }

  return { webGmailUrl, mailtoUrl };
}
