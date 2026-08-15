import { Linking, Alert, Platform } from 'react-native';

export const SUPPORT_TIERS = [
  { id: 'small', label: 'Coffee', amount: '$1.99', desc: 'Support basic server hosting', sku: 'com.northstar.recovery.support.small' },
  { id: 'medium', label: 'Fellowship', amount: '$4.99', desc: 'Sponsor literature & audio tools', sku: 'com.northstar.recovery.support.medium' },
  { id: 'large', label: 'Northstar Pillar', amount: '$9.99', desc: 'Help keep recovery free for all', sku: 'com.northstar.recovery.support.large' },
];

export const paymentService = {
  async openAppleWallet() {
    if (Platform.OS === 'ios') {
      const walletUrl = 'shoebox://';
      const canOpen = await Linking.canOpenURL(walletUrl).catch(() => false);
      if (canOpen) {
        await Linking.openURL(walletUrl);
        return;
      }
    }
    // Apple Pay Web link fallback
    await Linking.openURL('https://www.apple.com/apple-pay/');
  },

  async openVenmo(amount = '5') {
    const venmoDeepLink = `venmo://paycharge?txn=pay&recipients=NorthStarRecovery&amount=${amount}&note=Northstar%20Recovery%20App%20Support`;
    const venmoWebLink = `https://venmo.com/NorthStarRecovery`;

    try {
      const canOpen = await Linking.canOpenURL(venmoDeepLink);
      if (canOpen) {
        await Linking.openURL(venmoDeepLink);
      } else {
        await Linking.openURL(venmoWebLink);
      }
    } catch {
      await Linking.openURL(venmoWebLink);
    }
  },

  async openStripeCheckout(tierId = 'medium') {
    const stripeLinks = {
      small: 'https://buy.stripe.com/test_small_tier',
      medium: 'https://buy.stripe.com/test_medium_tier',
      large: 'https://buy.stripe.com/test_large_tier',
    };
    const url = stripeLinks[tierId] || 'https://buy.stripe.com/';
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Payment Link', 'Opening secure checkout in browser.');
    }
  },
};
