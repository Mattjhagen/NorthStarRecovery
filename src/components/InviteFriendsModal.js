import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';

export default function InviteFriendsModal({ onClose, username }) {
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const inviteCode = username ? username.toLowerCase().replace(/[^a-z0-9]/g, '') : 'fellow';
  const inviteUrl = `https://northstarrecovery.app/join?ref=${inviteCode}`;

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sendSmsInvite = () => {
    const safePhone = phone.replace(/[^0-9+]/g, '');
    const message = `Hey! I've been using NorthStar for CMA meetings, calming soundscapes, and recovery check-ins. Join my recovery circle here: ${inviteUrl}`;
    const smsUrl = safePhone
      ? `sms:${safePhone}?body=${encodeURIComponent(message)}`
      : `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>INVITE & CONNECT</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBadge}>
          <Ionicons name="person-add" size={32} color={C.mint} />
        </View>

        <Text style={styles.title}>Grow Your Recovery Circle</Text>
        <Text style={styles.subtitle}>
          Sobriety is built on genuine human connection. Invite trusted fellows, sponsees, or friends to walk the path together.
        </Text>

        {/* Shareable Link Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Private Invite Link</Text>
          <Text style={styles.cardMuted}>Anyone using this link will automatically connect with you.</Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{inviteUrl}</Text>
            <Pressable onPress={copyLink} style={styles.copyBtn}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={C.ink} />
              <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Send SMS Invite */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send Direct SMS Invite</Text>
          <Text style={styles.cardMuted}>Send a pre-filled text message to a contact in your phone.</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CONTACT PHONE NUMBER (OPTIONAL)</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. (555) 012-3456"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
              style={styles.fieldInput}
            />
          </View>
          <Pressable onPress={sendSmsInvite} style={styles.smsBtn}>
            <Ionicons name="chatbubble-ellipses" size={18} color={C.ink} />
            <Text style={styles.smsBtnText}>Open Text Message</Text>
          </Pressable>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={C.blue} />
          <Text style={styles.privacyText}>
            NorthStar respects complete fellowship anonymity. Your personal contacts are never uploaded or shared with advertisers.
          </Text>
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
    borderColor: C.cardBorder,
    marginTop: 8,
  },
  title: {
    color: C.warm,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: -8,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: C.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  cardTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  cardMuted: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  linkText: {
    flex: 1,
    color: C.mint,
    fontSize: 13,
  },
  copyBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fieldInput: {
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.warm,
    fontSize: 15,
  },
  smsBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  smsBtnText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  privacyCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#122438',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#26486e',
  },
  privacyText: {
    flex: 1,
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
