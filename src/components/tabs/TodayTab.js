import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import { openMeetingUrl } from '../../services/meetingsService';

export default function TodayTab({
  profile,
  sobrietyDays,
  nextMeeting,
  onNavigate,
  onOpenJournal,
  onOpenSponsor,
  onOpenNativeMeeting,
}) {
  const [unblurredLocally, setUnblurredLocally] = useState(false);
  const name = profile.pseudonym || 'friend';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const shouldBlur = profile.blurSobrietyDays && !unblurredLocally;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Top Greeting */}
      <View style={styles.greetingWrap}>
        <Text style={styles.eyebrow}>A GENTLE START</Text>
        <Text style={styles.h1}>{greeting}, {name}.</Text>
        <Text style={styles.intro}>You don't have to do the whole journey today. Just this moment.</Text>
      </View>

      {/* Clean Day Streak Card - ONLY shown if sobrietyDate exists */}
      {sobrietyDays !== null && (
        <View style={styles.streakCard}>
          {shouldBlur ? (
            <Pressable
              onPress={() => setUnblurredLocally(true)}
              style={styles.blurredContent}
            >
              <View style={styles.blurIconWrap}>
                <Ionicons name="eye-off-outline" size={24} color={C.mint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.blurTitle}>Clean Day Count (Hidden)</Text>
                <Text style={styles.blurCopy}>
                  Focus on today. Counting days is private to you. Tap to reveal.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          ) : (
            <View style={styles.streakContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mini}>YOUR CLEAR DAY STREAK</Text>
                <Text style={styles.streakNum}>
                  {sobrietyDays} <Text style={styles.streakUnit}>days</Text>
                </Text>
                <Text style={styles.streakCopy}>
                  {sobrietyDays === 0
                    ? 'Today is day one. You showed up.'
                    : sobrietyDays === 1
                    ? 'One clear day. That is everything.'
                    : 'A quiet streak, one steady day at a time.'}
                </Text>
                {profile.blurSobrietyDays && unblurredLocally && (
                  <Pressable onPress={() => setUnblurredLocally(false)} style={styles.reblurBtn}>
                    <Ionicons name="eye-outline" size={14} color={C.muted} />
                    <Text style={styles.reblurBtnText}>Hide count again</Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.sunBadge}>
                <Ionicons name="sunny" size={30} color={C.gold} />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Next Meeting Card */}
      {nextMeeting ? (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mini}>NEXT CMA MEETING</Text>
              <Text style={styles.cardTitle}>{nextMeeting.title}</Text>
              <Text style={styles.cardMuted}>
                {nextMeeting.format} · {nextMeeting.time} · {nextMeeting.region}
                {nextMeeting.minsAway !== undefined ? ` · in ${nextMeeting.minsAway} min` : ''}
              </Text>
            </View>
            <View style={styles.videoBadge}>
              <Ionicons name="videocam-outline" size={22} color={C.mint} />
            </View>
          </View>

          <View style={styles.meetingButtons}>
            <Pressable
              onPress={() => openMeetingUrl(nextMeeting.url, nextMeeting.title)}
              style={styles.joinExternalBtn}
            >
              <Ionicons name="open-outline" size={16} color={C.ink} />
              <Text style={styles.joinExternalBtnText}>Join Directory Room</Text>
            </Pressable>

            {onOpenNativeMeeting && (
              <Pressable
                onPress={() => onOpenNativeMeeting(nextMeeting)}
                style={styles.joinNativeBtn}
              >
                <Ionicons name="videocam" size={16} color={C.warm} />
                <Text style={styles.joinNativeBtnText}>In-App Video Room</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mini}>MEETINGS</Text>
              <Text style={styles.cardTitle}>Find your CMA room</Text>
              <Text style={styles.cardMuted}>Worldwide remote and local in-person meetings</Text>
            </View>
            <View style={styles.videoBadge}>
              <Ionicons name="compass-outline" size={22} color={C.mint} />
            </View>
          </View>
          <Pressable onPress={() => onNavigate('Meetings')} style={styles.actionBtn}>
            <Ionicons name="compass" size={18} color={C.ink} />
            <Text style={styles.actionBtnText}>Browse CMA Directory</Text>
          </Pressable>
        </View>
      )}

      {/* Daily Affirmation Quote */}
      <View style={styles.quoteCard}>
        <Ionicons name="sparkles" size={20} color={C.gold} />
        <Text style={styles.quoteText}>
          "A little honest connection can change the shape of an entire evening."
        </Text>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.quickGrid}>
        <Pressable onPress={() => onNavigate('Calm')} style={styles.quickTile}>
          <View style={[styles.quickIcon, { backgroundColor: C.mintMuted }]}>
            <Ionicons name="headset" size={22} color={C.mint} />
          </View>
          <Text style={styles.quickTitle}>Calm & Breathe</Text>
          <Text style={styles.quickSub}>29 soundscapes & breathing loop</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate('Learn')} style={styles.quickTile}>
          <View style={[styles.quickIcon, { backgroundColor: C.goldMuted }]}>
            <Ionicons name="sparkles" size={22} color={C.gold} />
          </View>
          <Text style={styles.quickTitle}>Learn & Stories</Text>
          <Text style={styles.quickSub}>Craving defense, sleep & XP</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate('Circles')} style={styles.quickTile}>
          <View style={[styles.quickIcon, { backgroundColor: C.blueMuted }]}>
            <Ionicons name="people" size={22} color={C.blue} />
          </View>
          <Text style={styles.quickTitle}>The Circles</Text>
          <Text style={styles.quickSub}>Connect by distance & topics</Text>
        </Pressable>

        <Pressable onPress={onOpenJournal} style={styles.quickTile}>
          <View style={[styles.quickIcon, { backgroundColor: 'rgba(245, 242, 235, 0.1)' }]}>
            <Ionicons name="book" size={22} color={C.warm} />
          </View>
          <Text style={styles.quickTitle}>Private Journal</Text>
          <Text style={styles.quickSub}>Encrypted daily reflection</Text>
        </Pressable>
      </View>

      {/* Lifeline Button */}
      <Pressable onPress={onOpenSponsor} style={styles.sponsorBanner}>
        <Ionicons name="shield-checkmark" size={20} color={C.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sponsorBannerTitle}>Need Support Right Now?</Text>
          <Text style={styles.sponsorBannerSub}>1-Tap call sponsor or reach the 988 lifeline.</Text>
        </View>
        <Ionicons name="call" size={18} color={C.gold} />
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
  greetingWrap: {
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
    marginTop: 2,
  },
  streakCard: {
    backgroundColor: '#1c283a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#304562',
    overflow: 'hidden',
  },
  blurredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: '#182436',
  },
  blurIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  blurCopy: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  mini: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  streakNum: {
    color: C.warm,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 2,
  },
  streakUnit: {
    fontSize: 16,
    color: C.muted,
    fontWeight: '700',
  },
  streakCopy: {
    color: C.muted,
    fontSize: 13,
    marginTop: 2,
  },
  reblurBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  reblurBtnText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  sunBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#344154',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: C.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    color: C.warm,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  cardMuted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  videoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#163529',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  joinExternalBtn: {
    flex: 1,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinExternalBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  joinNativeBtn: {
    flex: 1,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinNativeBtnText: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  quoteCard: {
    backgroundColor: '#172436',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderColor: C.gold,
    gap: 8,
  },
  quoteText: {
    color: C.warm,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickTile: {
    width: '48%',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 6,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickTitle: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  quickSub: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#26241c',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#544626',
    marginTop: 4,
  },
  sponsorBannerTitle: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  sponsorBannerSub: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
