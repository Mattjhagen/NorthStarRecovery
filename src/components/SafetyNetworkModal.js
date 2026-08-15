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

export default function SafetyNetworkModal({ safetyNetwork, onSave, onClose }) {
  const [draft, setDraft] = useState({
    sponsor: { ...safetyNetwork.sponsor },
    trustedContacts: [...safetyNetwork.trustedContacts],
  });
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Recovery Fellow' });

  const callSponsor = () => {
    if (!draft.sponsor.phone) {
      Alert.alert('No phone number', 'Please add your sponsor\'s phone number first.');
      return;
    }
    Linking.openURL(`tel:${draft.sponsor.phone.replace(/[^0-9+]/g, '')}`);
  };

  const textSponsor = () => {
    if (!draft.sponsor.phone) {
      Alert.alert('No phone number', 'Please add your sponsor\'s phone number first.');
      return;
    }
    const safeNum = draft.sponsor.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`sms:${safeNum}?body=Hey%2C%20I%20am%20checking%20in%20from%20NorthStar.%20Do%20you%20have%20a%20moment%20to%20talk%3F`);
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Missing info', 'Please provide a name and phone number for your trusted contact.');
      return;
    }
    const contact = {
      id: `tc-${Date.now()}`,
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship,
      grantedAt: new Date().toLocaleDateString(),
    };
    setDraft(p => ({
      ...p,
      trustedContacts: [...p.trustedContacts, contact],
    }));
    setNewContact({ name: '', phone: '', relationship: 'Recovery Fellow' });
    setAddingContact(false);
  };

  const removeContact = id => {
    setDraft(p => ({
      ...p,
      trustedContacts: p.trustedContacts.filter(c => c.id !== id),
    }));
  };

  const handleSaveAll = () => {
    onSave(draft);
    onClose();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>SAFETY NETWORK</Text>
        <Pressable onPress={handleSaveAll} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Safety & Lifeline</Text>
        <Text style={styles.subtitle}>
          In moments of sudden cravings or distress, 1-tap connections create the pause that saves lives.
        </Text>

        {/* Sponsor Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={22} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>My Sponsor</Text>
              <Text style={styles.cardMuted}>One-tap emergency access</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SPONSOR NAME</Text>
            <TextInput
              value={draft.sponsor.name}
              onChangeText={v => setDraft(p => ({ ...p, sponsor: { ...p.sponsor, name: v } }))}
              placeholder="e.g. Marcus T."
              placeholderTextColor={C.muted}
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              value={draft.sponsor.phone}
              onChangeText={v => setDraft(p => ({ ...p, sponsor: { ...p.sponsor, phone: v } }))}
              placeholder="e.g. (555) 019-2834"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NOTES / BEST TIME TO CALL</Text>
            <TextInput
              value={draft.sponsor.notes}
              onChangeText={v => setDraft(p => ({ ...p, sponsor: { ...p.sponsor, notes: v } }))}
              placeholder="e.g. Available after 6 PM, prefers text first"
              placeholderTextColor={C.muted}
              style={styles.fieldInput}
            />
          </View>

          {draft.sponsor.phone ? (
            <View style={styles.actionRow}>
              <Pressable onPress={callSponsor} style={styles.callBtn}>
                <Ionicons name="call" size={18} color={C.ink} />
                <Text style={styles.callBtnText}>1-Tap Call</Text>
              </Pressable>
              <Pressable onPress={textSponsor} style={styles.textBtn}>
                <Ionicons name="chatbubble" size={18} color={C.mint} />
                <Text style={styles.textBtnText}>1-Tap Text</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Trusted Contacts / Accountability Proxies */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: C.blue }]}>
              <Ionicons name="people" size={22} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Trusted Check-in Proxies</Text>
              <Text style={styles.cardMuted}>Grant trusted members access to check in on you</Text>
            </View>
          </View>

          <Text style={styles.cardCopy}>
            If you feel overwhelmed or a fellowship member is concerned about you, these contacts are authorized to be notified for emergency support.
          </Text>

          {draft.trustedContacts.map(c => (
            <View key={c.id} style={styles.contactRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactMeta}>{c.relationship} · {c.phone}</Text>
              </View>
              <Pressable
                onPress={() => Linking.openURL(`tel:${c.phone.replace(/[^0-9+]/g, '')}`)}
                style={styles.contactCallBtn}
              >
                <Ionicons name="call-outline" size={18} color={C.mint} />
              </Pressable>
              <Pressable onPress={() => removeContact(c.id)} style={styles.contactDeleteBtn}>
                <Ionicons name="close" size={18} color={C.coral} />
              </Pressable>
            </View>
          ))}

          {draft.trustedContacts.length === 0 && !addingContact && (
            <View style={styles.emptyContacts}>
              <Text style={styles.emptyContactsText}>No trusted contacts added yet.</Text>
            </View>
          )}

          {addingContact ? (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add Trusted Contact</Text>
              <TextInput
                value={newContact.name}
                onChangeText={v => setNewContact(c => ({ ...c, name: v }))}
                placeholder="Full Name / Pseudonym"
                placeholderTextColor={C.muted}
                style={styles.fieldInput}
              />
              <TextInput
                value={newContact.phone}
                onChangeText={v => setNewContact(c => ({ ...c, phone: v }))}
                placeholder="Phone Number"
                placeholderTextColor={C.muted}
                keyboardType="phone-pad"
                style={styles.fieldInput}
              />
              <TextInput
                value={newContact.relationship}
                onChangeText={v => setNewContact(c => ({ ...c, relationship: v }))}
                placeholder="Relationship (e.g. Recovery Fellow, Partner, Sibling)"
                placeholderTextColor={C.muted}
                style={styles.fieldInput}
              />
              <View style={styles.formActionRow}>
                <Pressable onPress={handleAddContact} style={styles.confirmAddBtn}>
                  <Text style={styles.confirmAddBtnText}>Add Contact</Text>
                </Pressable>
                <Pressable onPress={() => setAddingContact(false)} style={styles.cancelAddBtn}>
                  <Text style={styles.cancelAddBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setAddingContact(true)} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={C.mint} />
              <Text style={styles.addBtnText}>Add Trusted Contact</Text>
            </Pressable>
          )}
        </View>

        {/* 988 Crisis Lifeline */}
        <View style={styles.lifelineCard}>
          <Ionicons name="heart" size={24} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lifelineTitle}>988 Suicide & Crisis Lifeline</Text>
            <Text style={styles.lifelineCopy}>Free, confidential 24/7 support across the US and Canada.</Text>
          </View>
          <Pressable onPress={() => Linking.openURL('tel:988')} style={styles.lifelineCallBtn}>
            <Text style={styles.lifelineCallText}>Call 988</Text>
          </Pressable>
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
  saveBtn: {
    backgroundColor: C.mint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    color: C.ink,
    fontWeight: '900',
    fontSize: 13,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    color: C.warm,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -8,
  },
  card: {
    backgroundColor: C.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: C.warm,
    fontSize: 17,
    fontWeight: '800',
  },
  cardMuted: {
    color: C.muted,
    fontSize: 12,
  },
  cardCopy: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  callBtn: {
    flex: 1,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callBtnText: {
    color: C.ink,
    fontWeight: '900',
    fontSize: 14,
  },
  textBtn: {
    flex: 1,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mintDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  textBtnText: {
    color: C.mint,
    fontWeight: '800',
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: C.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    gap: 10,
  },
  contactName: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  contactMeta: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  contactCallBtn: {
    padding: 8,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  contactDeleteBtn: {
    padding: 8,
  },
  emptyContacts: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyContactsText: {
    color: C.muted,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: C.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  addBtnText: {
    color: C.mint,
    fontSize: 13,
    fontWeight: '800',
  },
  addForm: {
    backgroundColor: C.raised,
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  formTitle: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confirmAddBtn: {
    flex: 1,
    backgroundColor: C.mint,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmAddBtnText: {
    color: C.ink,
    fontWeight: '900',
    fontSize: 13,
  },
  cancelAddBtn: {
    flex: 1,
    backgroundColor: C.surface,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  cancelAddBtnText: {
    color: C.muted,
    fontWeight: '700',
    fontSize: 13,
  },
  lifelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#26241c',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#544626',
  },
  lifelineTitle: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  lifelineCopy: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  lifelineCallBtn: {
    backgroundColor: C.gold,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  lifelineCallText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
});
