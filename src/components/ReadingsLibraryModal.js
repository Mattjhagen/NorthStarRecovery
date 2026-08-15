import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { C } from '../constants/colors';
import { READINGS } from '../constants/readingsData';

export default function ReadingsLibraryModal({ onClose, onLaunchNativeMeeting }) {
  const [selectedReading, setSelectedReading] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>READINGS & LITERATURE</Text>
          <Text style={styles.brandSub}>CMA literature · narrated by Jessica</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Official Crystal Meth Anonymous pamphlets and texts. Listen along to Jessica's narration, read the reflection, or view the full pamphlet PDF.
        </Text>

        {READINGS.map(r => {
          const isSelected = selectedReading?.id === r.id;
          return (
            <View key={r.id}>
              <Pressable
                onPress={() => setSelectedReading(isSelected ? null : r)}
                style={[styles.readingCard, isSelected && styles.readingCardActive]}
              >
                <View style={[styles.readingIcon, isSelected && { backgroundColor: C.ink }]}>
                  <Ionicons name={r.icon} size={20} color={isSelected ? C.mint : C.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.readingTitle, isSelected && { color: C.ink }]}>
                    {r.title}
                  </Text>
                  <Text style={[styles.readingMeta, isSelected && { color: '#163529' }]}>
                    {r.durationEst} · {r.description.slice(0, 52)}...
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={isSelected ? C.ink : C.muted}
                />
              </Pressable>

              {isSelected && (
                <ReadingPlayerSection
                  reading={r}
                  onClose={() => setSelectedReading(null)}
                  onLaunchNativeMeeting={onLaunchNativeMeeting}
                />
              )}
            </View>
          );
        })}

        {/* External literature link */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>MORE LITERATURE</Text>
          <Text style={styles.footerMuted}>
            Access all conference-approved literature, step workbooks, and meeting pamphlets on the official website.
          </Text>
          <Pressable
            onPress={() => Linking.openURL('https://www.crystalmeth.org/our-fellowship/cma-literature/')}
            style={styles.openWebBtn}
          >
            <Ionicons name="open-outline" size={16} color={C.mint} />
            <Text style={styles.openWebBtnText}>Browse crystalmeth.org/literature</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadingPlayerSection({ reading, onClose, onLaunchNativeMeeting }) {
  const player = useAudioPlayer(reading.audio);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? (status.currentTime || 0) / status.duration : 0;

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  return (
    <View style={styles.playerContainer}>
      <View style={styles.playerHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.playerTitle}>{reading.title}</Text>
          <Text style={styles.playerMuted}>{reading.description}</Text>
        </View>
      </View>

      {/* Synchronized Reading Text */}
      <View style={styles.scriptBox}>
        <Text style={styles.scriptHeader}>LITERATURE TEXT</Text>
        <ScrollView style={styles.scriptScroll} nestedScrollEnabled>
          <Text style={styles.scriptBody}>{reading.text}</Text>
        </ScrollView>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>{fmt(status.currentTime || 0)}</Text>
          <Text style={styles.timeLabel}>{fmt(status.duration || 0)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => player.seekTo(Math.max(0, (status.currentTime || 0) - 15))}
          style={styles.skipBtn}
        >
          <Ionicons name="play-back-outline" size={22} color={C.muted} />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>

        <Pressable onPress={toggle} style={styles.playRing}>
          <Ionicons name={status.playing ? 'pause' : 'play'} size={28} color={C.ink} />
        </Pressable>

        <Pressable
          onPress={() => player.seekTo(Math.min(status.duration || 0, (status.currentTime || 0) + 15))}
          style={styles.skipBtn}
        >
          <Ionicons name="play-forward-outline" size={22} color={C.muted} />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable onPress={() => Linking.openURL(reading.pdfUrl)} style={styles.actionBtn}>
          <Ionicons name="document-text-outline" size={16} color={C.gold} />
          <Text style={styles.actionBtnText}>Open Official PDF</Text>
        </Pressable>

        {onLaunchNativeMeeting && (
          <Pressable onPress={() => onLaunchNativeMeeting(reading)} style={styles.actionBtn}>
            <Ionicons name="people-outline" size={16} color={C.blue} />
            <Text style={styles.actionBtnText}>Play for Room</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.ink,
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: C.cardBorder,
  },
  brand: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: C.muted,
    fontSize: 10,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  intro: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  readingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  readingCardActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  readingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  readingMeta: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  playerContainer: {
    backgroundColor: '#1b2c42',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.mint,
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  playerTitle: {
    color: C.warm,
    fontSize: 17,
    fontWeight: '900',
  },
  playerMuted: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  scriptBox: {
    backgroundColor: '#121f2f',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263b57',
    maxHeight: 160,
  },
  scriptHeader: {
    color: C.mint,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scriptScroll: {
    maxHeight: 120,
  },
  scriptBody: {
    color: C.warm,
    fontSize: 13,
    lineHeight: 20,
  },
  progressTrack: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: C.raised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.mint,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    color: C.muted,
    fontSize: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  skipBtn: {
    alignItems: 'center',
    gap: 2,
  },
  skipLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
  },
  playRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
  },
  actionBtnText: {
    color: C.warm,
    fontSize: 12,
    fontWeight: '800',
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
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  openWebBtnText: {
    color: C.mint,
    fontSize: 13,
    fontWeight: '800',
  },
});
