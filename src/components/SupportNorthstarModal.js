import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { paymentService, SUPPORT_TIERS } from '../services/payments';

export default function SupportNorthstarModal({ onClose, say }) {
  const [selectedTier, setSelectedTier] = useState('medium');

  const handleVenmo = async () => {
    const tier = SUPPORT_TIERS.find(t => t.id === selectedTier) || SUPPORT_TIERS[1];
    const cleanAmount = tier.amount.replace('$', '');
    await paymentService.openVenmo(cleanAmount);
    say?.('Opening Venmo...');
  };

  const handleAppleWallet = async () => {
    await paymentService.openAppleWallet();
    say?.('Opening Apple Pay / Wallet...');
  };

  const handleStripe = async () => {
    await paymentService.openStripeCheckout(selectedTier);
    say?.('Opening Stripe Checkout...');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>SUPPORT NORTHSTAR</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBadge}>
          <Ionicons name="heart" size={32} color={C.gold} />
        </View>

        <Text style={styles.title}>Keep Recovery Free & Accessible</Text>
        <Text style={styles.subtitle}>
          In the spirit of the 7th Tradition, every recovery tool, soundscape, and meeting directory in NorthStar is 100% free. Voluntary contributions help cover audio hosting, cloud servers, and continuous development.
        </Text>

        {/* Tier Selector */}
        <Text style={styles.sectionHeader}>CHOOSE A CONTRIBUTION TIER</Text>
        <View style={styles.tierGrid}>
          {SUPPORT_TIERS.map(tier => {
            const active = selectedTier === tier.id;
            return (
              <Pressable
                key={tier.id}
                onPress={() => setSelectedTier(tier.id)}
                style={[styles.tierCard, active && styles.tierCardActive]}
              >
                <Text style={[styles.tierPrice, active && styles.tierPriceActive]}>{tier.amount}</Text>
                <Text style={[styles.tierLabel, active && styles.tierLabelActive]}>{tier.label}</Text>
                <Text style={styles.tierDesc}>{tier.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payment Gateways */}
        <Text style={styles.sectionHeader}>SELECT PAYMENT METHOD</Text>

        {/* Venmo */}
        <Pressable onPress={handleVenmo} style={styles.gatewayRow}>
          <View style={[styles.gatewayIcon, { backgroundColor: '#008CFF' }]}>
            <Ionicons name="logo-venmo" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gatewayName}>Venmo</Text>
            <Text style={styles.gatewayMuted}>1-Tap payment via Venmo app or web (@NorthStarRecovery)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        {/* Apple Wallet / Apple Pay */}
        <Pressable onPress={handleAppleWallet} style={styles.gatewayRow}>
          <View style={[styles.gatewayIcon, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="logo-apple" size={22} color="#000000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gatewayName}>Apple Wallet & Apple Pay</Text>
            <Text style={styles.gatewayMuted}>Contribute seamlessly with Touch ID / Face ID</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        {/* Stripe Checkout */}
        <Pressable onPress={handleStripe} style={styles.gatewayRow}>
          <View style={[styles.gatewayIcon, { backgroundColor: '#635BFF' }]}>
            <Ionicons name="card-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gatewayName}>Stripe Secure Checkout</Text>
            <Text style={styles.gatewayMuted}>Credit / Debit Card, Google Pay, or Bank Transfer</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        <View style={styles.traditionCard}>
          <Text style={styles.traditionQuote}>
            "Every CMA group ought to be fully self-supporting, declining outside contributions."
          </Text>
          <Text style={styles.traditionAuthor}>— CMA Tradition Seven</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.ink,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerTitle: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6b5830',
    marginTop: 8,
  },
  title: {
    color: C.warm,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
  },
  sectionHeader: {
    alignSelf: 'flex-start',
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  tierGrid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  tierCard: {
    flex: 1,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: 'center',
    gap: 4,
  },
  tierCardActive: {
    borderColor: C.mint,
    backgroundColor: '#1b3236',
  },
  tierPrice: {
    color: C.warm,
    fontSize: 20,
    fontWeight: '900',
  },
  tierPriceActive: {
    color: C.mint,
  },
  tierLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  tierLabelActive: {
    color: C.warm,
  },
  tierDesc: {
    color: C.muted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
  },
  gatewayRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 14,
  },
  gatewayIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayName: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  gatewayMuted: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  traditionCard: {
    alignSelf: 'stretch',
    backgroundColor: '#172230',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263b57',
    marginTop: 10,
    gap: 6,
  },
  traditionQuote: {
    color: C.muted,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  traditionAuthor: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
