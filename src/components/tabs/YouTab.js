import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import {
  scheduleDailyUplift,
  cancelDailyUplift,
  scheduleDailyCheckin,
  cancelDailyCheckin,
  scheduleDemoPush,
} from '../../services/notifications';

export default function YouTab({
  profile,
  sobrietyDays,
  notifPrefs,
  onUpdateNotifPrefs,
  onEditProfile,
  onOpenSafetyNetwork,
  onOpenInviteFriends,
  onOpenSupport,
  onOpenJournal,
  onSignOut,
  journalCount = 0,
  say,
}) {
  const name = profile.pseudonym || 'NorthStar Fellow';

  const toggleDailyUplift = async val => {
    const updated = { ...notifPrefs, dailyUplift: val };
    onUpdateNotifPrefs(updated);
    if (val) {
      const res = await scheduleDailyUplift(9, 0);
      if (res.ok) say?.('Morning reflection scheduled for 9:00 AM.');
      else say?.(res.reason || 'Failed to schedule');
    } else {
      await cancelDailyUplift();
      say?.('Morning reflection notifications turned off.');
    }
  };

  const toggleDailyCheckin = async val => {
    const updated = { ...notifPrefs, dailyCheckin: val };
    onUpdateNotifPrefs(updated);
    if (val) {
      const res = await scheduleDailyCheckin(20, 0);
      if (res.ok) say?.('Evening check-in scheduled for 8:00 PM.');
      else say?.(res.reason || 'Failed to schedule');
    } else {
      await cancelDailyCheckin();
      say?.('Evening check-in notifications turned off.');
    }
  };

  const toggleMeetingReminders = val => {
    const updated = { ...notifPrefs, meetingReminders: val };
    onUpdateNotifPrefs(updated);
    say?.(val ? 'Meeting reminders enabled (15m before saved rooms).' : 'Meeting reminders turned off.');
  };

  const toggleDmNotifs = val => {
    const updated = { ...notifPrefs, dmNotifications: val };
    onUpdateNotifPrefs(updated);
    say?.(val ? 'Direct message notifications enabled.' : 'DM notifications turned off.');
  };

  const toggleCircleNotifs = val => {
    const updated = { ...notifPrefs, circleNotifications: val };
    onUpdateNotifPrefs(updated);
    say?.(val ? 'Circle comment notifications enabled.' : 'Circle comment notifications turned off.');
  };

  const handleTestNotification = async () => {
    const res = await scheduleDemoPush();
    if (res.ok) {
      say?.('Look for a NorthStar notification in 5 seconds!');
    } else {
      say?.(res.reason || 'Notification permission needed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>YOUR JOURNEY & SETTINGS</Text>
        <Text style={styles.h1}>Your NorthStar</Text>
        <Text style={styles.intro}>
          Private profile, safety network, and personalized notification preferences.
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileMeta}>
            {sobrietyDays !== null
              ? profile.blurSobrietyDays
                ? 'Clean count (Hidden for peace)'
                : `${sobrietyDays} clear days · One day at a time`
              : 'Here in your own time'}
          </Text>
          {profile.isAnonymous && (
            <View style={styles.ghostPill}>
              <Ionicons name="eye-off" size={12} color={C.blue} />
              <Text style={styles.ghostPillText}>Anonymous Mode</Text>
            </View>
          )}
        </View>

        <Pressable onPress={onEditProfile} style={styles.editProfileBtn}>
          <Ionicons name="create-outline" size={20} color={C.mint} />
        </Pressable>
      </View>

      {/* Quick Nav Actions */}
      <View style={styles.actionNavGrid}>
        <Pressable onPress={onOpenSafetyNetwork} style={styles.actionNavCard}>
          <View style={[styles.actionNavIcon, { backgroundColor: C.mintMuted }]}>
            <Ionicons name="shield-checkmark" size={22} color={C.mint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionNavTitle}>Safety Network</Text>
            <Text style={styles.actionNavDesc}>Sponsor 1-tap call & trusted contacts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        <Pressable onPress={onOpenJournal} style={styles.actionNavCard}>
          <View style={[styles.actionNavIcon, { backgroundColor: C.goldMuted }]}>
            <Ionicons name="book" size={22} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionNavTitle}>Encrypted Journal</Text>
            <Text style={styles.actionNavDesc}>{journalCount} entries · private to you</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        <Pressable onPress={onOpenInviteFriends} style={styles.actionNavCard}>
          <View style={[styles.actionNavIcon, { backgroundColor: C.blueMuted }]}>
            <Ionicons name="person-add" size={22} color={C.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionNavTitle}>Invite Friends</Text>
            <Text style={styles.actionNavDesc}>Connect peers into your circle</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>

        <Pressable onPress={onOpenSupport} style={styles.actionNavCard}>
          <View style={[styles.actionNavIcon, { backgroundColor: 'rgba(246, 190, 101, 0.14)' }]}>
            <Ionicons name="heart" size={22} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionNavTitle}>Support Northstar</Text>
            <Text style={styles.actionNavDesc}>Apple Wallet, Venmo, Stripe & IAP</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </Pressable>
      </View>

      {/* Push Notification Preferences Section */}
      <Text style={styles.sectionHeader}>PUSH NOTIFICATION PREFERENCES</Text>
      <View style={styles.settingsCard}>
        {/* Meeting Reminders */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.settingTitle}>Meeting Reminders</Text>
            <Text style={styles.settingMuted}>Gentle reminder 15 minutes before your saved CMA rooms</Text>
          </View>
          <Switch
            value={notifPrefs.meetingReminders}
            onValueChange={toggleMeetingReminders}
            trackColor={{ false: C.line, true: C.mintDark }}
            thumbColor={notifPrefs.meetingReminders ? C.mint : C.muted}
          />
        </View>

        {/* Daily Checkin */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.settingTitle}>Daily Evening Check-in (8:00 PM)</Text>
            <Text style={styles.settingMuted}>A quiet reminder to log your mood and journal before sleep</Text>
          </View>
          <Switch
            value={notifPrefs.dailyCheckin}
            onValueChange={toggleDailyCheckin}
            trackColor={{ false: C.line, true: C.mintDark }}
            thumbColor={notifPrefs.dailyCheckin ? C.mint : C.muted}
          />
        </View>

        {/* Morning Reflection Uplift */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.settingTitle}>Random Daily Morning Reflection (9:00 AM)</Text>
            <Text style={styles.settingMuted}>One uplifting thought delivered once daily to begin your morning</Text>
          </View>
          <Switch
            value={notifPrefs.dailyUplift}
            onValueChange={toggleDailyUplift}
            trackColor={{ false: C.line, true: C.mintDark }}
            thumbColor={notifPrefs.dailyUplift ? C.mint : C.muted}
          />
        </View>

        {/* DM Notifications */}
        <View style={styles.settingRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.settingTitle}>Direct Messages (DMs)</Text>
            <Text style={styles.settingMuted}>Alerts when fellow members or sponsors send a private chat</Text>
          </View>
          <Switch
            value={notifPrefs.dmNotifications}
            onValueChange={toggleDmNotifs}
            trackColor={{ false: C.line, true: C.mintDark }}
            thumbColor={notifPrefs.dmNotifications ? C.mint : C.muted}
          />
        </View>

        {/* Circle Comments */}
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.settingTitle}>Circle Comments & Replies</Text>
            <Text style={styles.settingMuted}>Notifications when someone responds to your circle posts</Text>
          </View>
          <Switch
            value={notifPrefs.circleNotifications}
            onValueChange={toggleCircleNotifs}
            trackColor={{ false: C.line, true: C.mintDark }}
            thumbColor={notifPrefs.circleNotifications ? C.mint : C.muted}
          />
        </View>
      </View>

      {/* Test Instant Notification Button */}
      <Pressable onPress={handleTestNotification} style={styles.testNotifBtn}>
        <Ionicons name="notifications-outline" size={18} color={C.warm} />
        <Text style={styles.testNotifBtnText}>Test Instant Notification (5s Demo)</Text>
      </Pressable>

      {/* External Links & Literature */}
      <Text style={styles.sectionHeader}>FELLOWSHIP RESOURCES</Text>
      <View style={styles.settingsCard}>
        <Pressable
          onPress={() => Linking.openURL('https://www.crystalmeth.org/')}
          style={styles.linkRow}
        >
          <Ionicons name="globe-outline" size={20} color={C.mint} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Official CMA Website</Text>
            <Text style={styles.settingMuted}>crystalmeth.org</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={C.muted} />
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL('https://www.crystalmeth.org/cma-literature/')}
          style={[styles.linkRow, { borderBottomWidth: 0 }]}
        >
          <Ionicons name="book-outline" size={20} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Official Literature Library</Text>
            <Text style={styles.settingMuted}>Pamphlets, workbooks, and conference literature</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={C.muted} />
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable onPress={onSignOut} style={styles.signOutBtn}>
        <Ionicons name="log-out-outline" size={18} color={C.muted} />
        <Text style={styles.signOutBtnText}>Sign Out of NorthStar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  headerBlock: {
    gap: 4,
  },
  eyebrow: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  h1: {
    color: C.warm,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  intro: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: C.raised,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: C.ink,
  },
  profileName: {
    color: C.warm,
    fontSize: 17,
    fontWeight: '900',
  },
  profileMeta: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  ghostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(117, 184, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  ghostPillText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
  },
  editProfileBtn: {
    padding: 8,
    backgroundColor: C.raised,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  actionNavGrid: {
    gap: 10,
  },
  actionNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  actionNavIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNavTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  actionNavDesc: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  settingsCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  settingTitle: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  settingMuted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.raised,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  testNotifBtnText: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '800',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  signOutBtnText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
