import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';

export default function Header({ onOpenNotifications, onOpenSponsor, sponsorName }) {
  const handleCrisis = () => {
    const options = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 988 Lifeline', onPress: () => Linking.openURL('tel:988') },
      { text: 'Text 988 Lifeline', onPress: () => Linking.openURL('sms:988') },
    ];

    if (sponsorName && onOpenSponsor) {
      options.splice(1, 0, { text: `Call Sponsor (${sponsorName})`, onPress: onOpenSponsor });
    }

    Alert.alert(
      'Need immediate support?',
      'Northstar is a recovery companion, not emergency medical care. Choose an immediate lifeline below:',
      options
    );
  };

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>NORTHSTAR</Text>
        <Text style={styles.brandSub}>recovery, one steady step at a time</Text>
      </View>
      <View style={styles.headerBtns}>
        <Pressable
          accessibilityLabel="Open Reminders and Notifications"
          onPress={onOpenNotifications}
          style={styles.iconBtn}
        >
          <Ionicons name="notifications-outline" size={20} color={C.warm} />
        </Pressable>
        <Pressable
          accessibilityLabel="Get immediate support"
          onPress={handleCrisis}
          style={styles.helpBtn}
        >
          <Ionicons name="heart" size={19} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.ink,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  brand: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  brandSub: {
    color: C.muted,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    height: 38,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  helpBtn: {
    height: 38,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.mint,
    borderRadius: 12,
  },
});
