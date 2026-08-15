import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import { openMeetingUrl } from '../../services/meetingsService';

export default function MeetingsTab({
  meetings,
  loading,
  profile,
  savedMeetings = [],
  onToggleSaveMeeting,
  onOpenNativeMeeting,
}) {
  const [filterFormat, setFilterFormat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDay, setActiveDay] = useState('All');

  const DAYS_LIST = ['All', 'Daily', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const filtered = meetings.filter(m => {
    const matchesFormat = filterFormat === 'All' || m.format === filterFormat;
    const matchesDay = activeDay === 'All' || m.day?.includes(activeDay) || m.day === 'Daily';
    const textQuery = `${m.title} ${m.region} ${m.focus || ''} ${m.language || ''}`.toLowerCase();
    const matchesSearch = textQuery.includes(searchQuery.toLowerCase().trim());
    return matchesFormat && matchesDay && matchesSearch;
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>FELLOWSHIP DIRECTORY</Text>
        <Text style={styles.h1}>Find Your CMA Room</Text>
        <Text style={styles.intro}>
          Choose what feels possible today — remote Zoom, hybrid, or in-person rooms worldwide.
        </Text>
      </View>

      {/* Native In-App Meeting Launcher Banner */}
      <View style={styles.nativeBanner}>
        <View style={styles.nativeBannerIcon}>
          <Ionicons name="videocam" size={24} color={C.mint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nativeBannerTitle}>Native In-App Video Calling</Text>
          <Text style={styles.nativeBannerCopy}>
            Prefer not to use Zoom? Launch a built-in room with in-meeting Jessica literature narration, public chat, and side DMs.
          </Text>
          <Pressable
            onPress={() => onOpenNativeMeeting && onOpenNativeMeeting({ title: 'NorthStar Native CMA Room' })}
            style={styles.launchNativeBtn}
          >
            <Ionicons name="videocam" size={16} color={C.ink} />
            <Text style={styles.launchNativeBtnText}>Open Native Room</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={C.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by topic, city, or day..."
          placeholderTextColor={C.muted}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Format Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All', 'Remote', 'In-person', 'Hybrid'].map(fmt => {
          const active = filterFormat === fmt;
          return (
            <Pressable
              key={fmt}
              onPress={() => setFilterFormat(fmt)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{fmt}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Day Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {DAYS_LIST.map(day => {
          const active = activeDay === day;
          return (
            <Pressable
              key={day}
              onPress={() => setActiveDay(day)}
              style={[styles.dayPill, active && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>{day}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.mint} />
          <Text style={styles.loadingText}>Syncing latest CMA Worldwide directory...</Text>
        </View>
      )}

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filtered.length} meeting{filtered.length === 1 ? '' : 's'} available
      </Text>

      {/* Meeting Cards List */}
      {filtered.map(m => {
        const isSaved = savedMeetings.some(s => s.id === m.id);
        return (
          <View key={m.id} style={styles.meetingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{m.time}</Text>
                <Text style={styles.dayText}>{m.day}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{m.title}</Text>
                  {onToggleSaveMeeting && (
                    <Pressable onPress={() => onToggleSaveMeeting(m)} style={styles.saveIconBtn}>
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isSaved ? C.gold : C.muted}
                      />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.regionText}>{m.format} · {m.region}</Text>
                <Text style={styles.focusText}>{m.focus} · {m.language}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => openMeetingUrl(m.url, m.title)}
                style={styles.joinBtn}
              >
                <Ionicons
                  name={m.format === 'Remote' ? 'videocam-outline' : 'navigate-outline'}
                  size={16}
                  color={C.ink}
                />
                <Text style={styles.joinBtnText}>{m.action || 'Join Meeting'}</Text>
              </Pressable>

              {onOpenNativeMeeting && (
                <Pressable
                  onPress={() => onOpenNativeMeeting(m)}
                  style={styles.nativeBtn}
                >
                  <Ionicons name="videocam" size={16} color={C.mint} />
                  <Text style={styles.nativeBtnText}>In-App</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}

      {filtered.length === 0 && !loading && (
        <View style={styles.emptyCard}>
          <Ionicons name="search-outline" size={32} color={C.muted} />
          <Text style={styles.emptyTitle}>No matching CMA meetings</Text>
          <Text style={styles.emptyCopy}>Try clearing your search terms or selecting 'All' days and formats.</Text>
        </View>
      )}

      {/* Directory Footer */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>CMA DIRECTORY</Text>
        <Text style={styles.footerMuted}>
          Browse the complete worldwide meeting directory and find hybrid/in-person meetings near your coordinates.
        </Text>
        <Pressable
          onPress={() => Linking.openURL('https://www.crystalmeth.org/meetings/?type=online')}
          style={styles.openCmaBtn}
        >
          <Ionicons name="open-outline" size={16} color={C.mint} />
          <Text style={styles.openCmaBtnText}>Open crystalmeth.org/meetings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
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
  nativeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#152438',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#29456e',
  },
  nativeBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1b324d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeBannerTitle: {
    color: C.mint,
    fontSize: 15,
    fontWeight: '900',
  },
  nativeBannerCopy: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  launchNativeBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  launchNativeBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: C.warm,
    fontSize: 14,
  },
  filterScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  filterPillText: {
    color: C.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  filterPillTextActive: {
    color: C.ink,
  },
  dayPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    marginRight: 6,
  },
  dayPillActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  dayPillText: {
    color: C.muted,
    fontWeight: '700',
    fontSize: 12,
  },
  dayPillTextActive: {
    color: C.ink,
    fontWeight: '900',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: C.muted,
    fontSize: 12,
  },
  resultsCount: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  meetingCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBox: {
    width: 64,
    paddingRight: 8,
    borderRightWidth: 1,
    borderColor: C.line,
    justifyContent: 'center',
  },
  timeText: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '900',
  },
  dayText: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  saveIconBtn: {
    padding: 2,
  },
  regionText: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  focusText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinBtn: {
    flex: 2,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  nativeBtn: {
    flex: 1,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mintDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  nativeBtnText: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCopy: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  footerCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginTop: 8,
    gap: 8,
  },
  footerTitle: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerMuted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  openCmaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  openCmaBtnText: {
    color: C.mint,
    fontSize: 13,
    fontWeight: '800',
  },
});
